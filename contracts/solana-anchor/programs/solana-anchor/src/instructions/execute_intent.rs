use anchor_lang::prelude::*;
use crate::state::{IntentAccount, IntentStatus};
use crate::error::NovaRelayError;

#[derive(Accounts)]
#[instruction(intent_id: u64)]
pub struct ExecuteIntent<'info> {
    #[account(
        mut,
        seeds = [b"intent", intent_id.to_le_bytes().as_ref()],
        bump
    )]
    pub intent: Account<'info, IntentAccount>,
    /// CHECK: relayer authority — TODO: enforce via stored pubkey
    pub relayer: Signer<'info>,
}

pub fn handler(ctx: Context<ExecuteIntent>, _intent_id: u64) -> Result<()> {
    let intent = &mut ctx.accounts.intent;
    require!(intent.status == IntentStatus::Pending, NovaRelayError::InvalidStatus);
    intent.status = IntentStatus::Completed;
    msg!("Intent {} executed", intent.id);
    Ok(())
}
