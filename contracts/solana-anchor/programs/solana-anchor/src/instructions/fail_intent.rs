use anchor_lang::prelude::*;
use crate::state::{IntentAccount, IntentStatus, ProgramState};
use crate::error::NovaRelayError;

pub fn handler(ctx: Context<super::execute_intent::ExecuteIntent>, _intent_id: u64) -> Result<()> {
    let intent = &mut ctx.accounts.intent;
    
    require!(intent.status == IntentStatus::Pending, NovaRelayError::InvalidStatus);
    
    intent.status = IntentStatus::Failed;
    intent.executed_at = Some(Clock::get()?.unix_timestamp);
    
    msg!("Intent {} marked as failed", intent.id);
    Ok(())
}
