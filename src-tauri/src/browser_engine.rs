use headless_chrome::{Browser, LaunchOptions};
use serde_json::json;

pub struct SovereignBrowserEngine;

impl SovereignBrowserEngine {
    pub fn new() -> Self {
        Self
    }

    pub fn inspect_local_dom(&self, url: &str) -> Result<String, String> {
        let browser = Browser::new(
            LaunchOptions::default_builder()
                .headless(true)
                .sandbox(true)
                .build()
                .map_err(|e| format!("Launch options error: {}", e))?
        ).map_err(|e| format!("Browser launch error: {}", e))?;

        let tab = browser.new_tab().map_err(|e| format!("Tab error: {}", e))?;
        tab.navigate_to(url).map_err(|e| format!("Navigation error: {}", e))?;
        tab.wait_until_navigated().map_err(|e| format!("Wait error: {}", e))?;

        let html = tab.get_content().map_err(|e| format!("Content error: {}", e))?;
        let title = tab.get_title().unwrap_or_else(|_| "Untitled".to_string());

        Ok(json!({
            "url": url,
            "title": title,
            "html_length": html.len(),
            "html_preview": &html[..html.len().min(2000)],
            "status": "success"
        }).to_string())
    }
}
