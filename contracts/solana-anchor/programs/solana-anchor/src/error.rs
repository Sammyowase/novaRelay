use anchor_lang::prelude::*;

#[error_code]
pub enum NovaRelayError {
    #[msg("Intent is not in a valid status for this operation")]
    InvalidStatus,
    #[msg("Quota exceeded for this tenant")]
    QuotaExceeded,
    #[msg("Unauthorized relayer")]
    UnauthorizedRelayer,
}
