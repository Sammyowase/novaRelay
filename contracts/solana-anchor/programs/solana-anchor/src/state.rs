use anchor_lang::prelude::*;

#[account]
pub struct ProgramState {
    pub authority: Pubkey,
    pub relayer: Pubkey,
    pub intent_count: u64,
    pub bump: u8,
}

impl ProgramState {
    pub const LEN: usize = 8 + 32 + 32 + 8 + 1;
}

#[account]
pub struct IntentAccount {
    pub id: u64,
    pub submitter: Pubkey,
    pub amount: u64,
    pub asset_mint: Pubkey,
    pub recipient: Pubkey,
    pub status: IntentStatus,
    pub created_at: i64,
    pub executed_at: Option<i64>,
    pub tx_hash: Option<String>,
    pub bump: u8,
}

impl IntentAccount {
    pub const LEN: usize = 8 + 8 + 32 + 8 + 32 + 32 + 1 + 8 + 9 + 68 + 1;
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq)]
pub enum IntentStatus {
    Pending,
    Executing,
    Completed,
    Failed,
}
