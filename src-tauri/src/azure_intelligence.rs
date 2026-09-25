use azure_identity::DefaultAzureCredential;
use azure_core::auth::TokenCredential;
use reqwest::Client;
use serde::{Deserialize, Serialize};
use serde_json::json;

#[derive(Serialize, Deserialize, Clone)]
pub struct AzureAIResponse {
    pub content: String,
    pub model: String,
    pub usage: Option<serde_json::Value>,
}

pub struct AzureIntelligence {
    endpoint: String,
    deployment: String,
    client: Client,
}

impl AzureIntelligence {
    pub fn new() -> Self {
        Self {
            endpoint: std::env::var("AZURE_OPENAI_ENDPOINT")
                .unwrap_or_else(|_| "https://your-resource.openai.azure.com".to_string()),
            deployment: std::env::var("AZURE_OPENAI_DEPLOYMENT")
                .unwrap_or_else(|_| "gpt-6-astra".to_string()),
            client: Client::new(),
        }
    }

    pub async fn chat_completion(&self, prompt: &str, system_prompt: &str) -> Result<AzureAIResponse, String> {
        let credential = DefaultAzureCredential::create(Default::default()).map_err(|e| format!("Credential error: {}", e))?;
        let token = credential
            .get_token(&["https://cognitiveservices.azure.com/.default"])
            .await
            .map_err(|e| format!("Token error: {}", e))?;

        let url = format!(
            "{}/openai/deployments/{}/chat/completions?api-version=2024-06-01",
            self.endpoint, self.deployment
        );

        let body = json!({
            "messages": [
                { "role": "system", "content": system_prompt },
                { "role": "user", "content": prompt }
            ],
            "temperature": 0.3,
            "max_tokens": 4096
        });

        let response = self.client
            .post(&url)
            .bearer_auth(token.token.secret())
            .json(&body)
            .send()
            .await
            .map_err(|e| format!("Request error: {}", e))?;

        let status = response.status();
        let response_body: serde_json::Value = response
            .json()
            .await
            .map_err(|e| format!("Parse error: {}", e))?;

        if !status.is_success() {
            return Err(format!("Azure API error {}: {}", status, response_body));
        }

        let content = response_body["choices"][0]["message"]["content"]
            .as_str()
            .unwrap_or("")
            .to_string();

        Ok(AzureAIResponse {
            content,
            model: self.deployment.clone(),
            usage: response_body.get("usage").cloned(),
        })
    }

    pub async fn search_codebase(&self, query: &str) -> Result<Vec<String>, String> {
        // Uses Azure AI Search for codebase semantic search
        let search_endpoint = std::env::var("AZURE_AI_SEARCH_ENDPOINT")
            .unwrap_or_else(|_| "https://your-search.search.windows.net".to_string());
        let index = std::env::var("AZURE_AI_SEARCH_INDEX")
            .unwrap_or_else(|_| "codebase-index".to_string());

        let credential = DefaultAzureCredential::create(Default::default()).map_err(|e| format!("Credential error: {}", e))?;
        let token = credential
            .get_token(&["https://search.azure.com/.default"])
            .await
            .map_err(|e| format!("Token error: {}", e))?;

        let url = format!("{}/indexes/{}/docs/search?api-version=2024-07-01", search_endpoint, index);
        let body = json!({ "search": query, "top": 10 });

        let response = self.client
            .post(&url)
            .bearer_auth(token.token.secret())
            .json(&body)
            .send()
            .await
            .map_err(|e| format!("Search error: {}", e))?;

        let results: serde_json::Value = response.json().await.map_err(|e| format!("Parse error: {}", e))?;
        
        let items = results["value"]
            .as_array()
            .map(|arr| arr.iter().filter_map(|v| v["content"].as_str().map(String::from)).collect())
            .unwrap_or_default();

        Ok(items)
    }
}
