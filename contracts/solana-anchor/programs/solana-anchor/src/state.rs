use anchor_lang::prelude::*;

#[account]
pub struct IntentAccount {
    pub id: u64,
    pub submitter: Pubkey,
    pub amount: u64,
    pub asset_mint: Pubkey,
    pub recipient: Pubkey,
    pub status: IntentStatus,
    pub created_at: i64,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq)]
pub enum IntentStatus {
    Pending,
    Executing,
    Completed,
    Failed,
}

impl IntentAccount {
    pub const LEN: usize = 8 + 8 + 32 + 8 + 32 + 32 + 1 + 8;
}
