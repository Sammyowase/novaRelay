use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Intent {
    pub id: String,
    pub from_chain: Chain,
    pub to_chain: Chain,
    pub amount: String,
    pub asset: String,
    pub recipient: String,
    pub status: IntentStatus,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum Chain {
    Stellar,
    Solana,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum IntentStatus {
    Pending,
    Routing,
    Executing,
    Completed,
    Failed,
}

pub fn validate_stellar_address(address: &str) -> bool {
    address.len() == 56 && address.starts_with('G')
}

pub fn validate_solana_address(address: &str) -> bool {
    address.len() >= 32 && address.len() <= 44
}

pub fn validate_amount(amount: &str) -> Result<f64, String> {
    amount.parse::<f64>()
        .map_err(|_| "Invalid amount".to_string())
        .and_then(|v| {
            if v > 0.0 {
                Ok(v)
            } else {
                Err("Amount must be positive".to_string())
            }
        })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_validate_stellar_address() {
        assert!(validate_stellar_address("GBRPYHIL2CI3FNQ4BXLFMNDLFJUNPU2HY3ZMFSHONUCEOASW7QC7OX2H"));
        assert!(!validate_stellar_address("invalid"));
    }

    #[test]
    fn test_validate_amount() {
        assert!(validate_amount("10.5").is_ok());
        assert!(validate_amount("-5").is_err());
        assert!(validate_amount("abc").is_err());
    }
}
