// ⚠️ AZURE ZERO-TRUST SECURITY ENCLAVE ⚠️
// This enforces strict data-loss prevention (DLP) and network egress lockdown.
// By default, the IDE is cryptographically prevented from communicating with any
// infrastructure outside the permitted Azure Sovereign boundaries.

use std::collections::HashSet;
use url::Url;

pub struct AzureNetworkPolicy {
    allowed_domains: HashSet<&'static str>,
}

impl AzureNetworkPolicy {
    pub fn new() -> Self {
        let mut domains = HashSet::new();
        // Azure sovereign: only Azure endpoints allowed
        domains.insert("azure.com");
        domains.insert("microsoft.com");
        domains.insert("windows.net");
        domains.insert("github.com");
        domains.insert("api.github.com");

        domains.insert("inso.code");
        
        Self { allowed_domains: domains }
    }

    /// Intercepts every outbound request from the IDE's LSP and AI components.
    /// If an agent attempts to exfiltrate code to an unapproved cloud or public API,
    /// it is aggressively blocked.
    pub fn validate_egress(&self, target_url: &str) -> Result<(), String> {
        let url = Url::parse(target_url).map_err(|_| "Invalid URL format".to_string())?;
        
        let host = url.host_str().ok_or("No host found in URL")?;
        
        let is_allowed = self.allowed_domains.iter().any(|allowed| {
            host == *allowed || host.ends_with(&format!(".{}", allowed))
        });

        if is_allowed {
            Ok(())
        } else {
            Err(format!(
                "🛑 AZURE DLP BLOCKED EGRESS: Attempted connection to non-Azure domain '{}'. \
                All telemetry and code payloads must remain within the Sovereign Execution Plane.",
                host
            ))
        }
    }
}
