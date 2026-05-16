use anchor_lang::prelude::*;
use crate::state::{IntentAccount, IntentStatus, ProgramState};
use crate::error::NovaRelayError;

#[derive(Accounts)]
#[instruction(intent_id: u64)]
pub struct ExecuteIntent<'info> {
    #[account(
        seeds = [b"state"],
        bump = state.bump
    )]
    pub state: Account<'info, ProgramState>,
    #[account(
        mut,
        seeds = [b"intent", intent_id.to_le_bytes().as_ref()],
        bump = intent.bump
    )]
    pub intent: Account<'info, IntentAccount>,
    #[account(constraint = relayer.key() == state.relayer @ NovaRelayError::UnauthorizedRelayer)]
    pub relayer: Signer<'info>,
}

pub fn handler(ctx: Context<ExecuteIntent>, _intent_id: u64, tx_hash: String) -> Result<()> {
    let intent = &mut ctx.accounts.intent;
    
    require!(intent.status == IntentStatus::Pending, NovaRelayError::InvalidStatus);
    
    intent.status = IntentStatus::Completed;
    intent.executed_at = Some(Clock::get()?.unix_timestamp);
    intent.tx_hash = Some(tx_hash.clone());
    
    msg!("Intent {} executed with tx: {}", intent.id, tx_hash);
    Ok(())
}
