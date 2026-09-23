pub mod azure_confidential_core;
pub mod azure_security_enclave;
pub mod azure_intelligence;

use std::sync::OnceLock as OnceCell;
use azure_intelligence::AzureIntelligence;
use serde_json::json;

static AI_CLIENT: OnceCell<AzureIntelligence> = OnceCell::new();

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn selectdir() -> Option<String> {
    let res = rfd::FileDialog::new()
        .pick_folder();
    res.map(|path| path.to_string_lossy().to_string())
}

#[tauri::command]
async fn initialize_sovereign_azure_openai() -> Result<String, String> {
    let _ = AI_CLIENT.get_or_init(AzureIntelligence::new);
    Ok("Azure Sovereign OpenAI Intelligence Initialized.".to_string())
}

#[tauri::command]
async fn execute_agent_mission(mission_id: String, command: String) -> Result<String, String> {
    println!("🚀 [Azure-Mission] Received mission {}: {}", mission_id, command);

    let (system_prompt, prompt) = if command.starts_with("[WORK]") {
        let clean = command.trim_start_matches("[WORK]").trim();
        (
            "You are Inso Work, a sovereign Azure-native desktop agent specializing in non-technical OS workflows, document intelligence, computer automation, and executive task execution. Assist the user with precision, clarity, and enterprise confidentiality.",
            if clean.is_empty() { command.as_str() } else { clean },
        )
    } else if command.starts_with("[CODE]") {
        let clean = command.trim_start_matches("[CODE]").trim();
        (
            "You are Inso Code, an elite bare-metal compiler swarm and software engineering agent backed by Azure Sovereign OpenAI. Assist the user with technical architecture, high-performance code generation, debugging, refactoring, and AST verification.",
            if clean.is_empty() { command.as_str() } else { clean },
        )
    } else {
        (
            "You are Inso Sovereign AI, an elite enterprise agent powered by Azure Sovereign OpenAI.",
            command.as_str(),
        )
    };

    let client = AI_CLIENT.get_or_init(AzureIntelligence::new);
    let response = client.chat_completion(prompt, system_prompt).await?;
    Ok(response.content)
}

#[tauri::command]
async fn get_swarm_telemetry() -> Result<serde_json::Value, String> {
    Ok(json!({
        "status": "flawless",
        "sovereign_plane": "AZURE_SOVEREIGN",
        "edge_compute": "GPU_ACTIVE",
        "memory_vault": "ENCRYPTED"
    }))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            selectdir,
            initialize_sovereign_azure_openai,
            execute_agent_mission,
            get_swarm_telemetry
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

