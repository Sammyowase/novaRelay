use anchor_lang::prelude::*;
use crate::state::{IntentAccount, IntentStatus};

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct IntentParams {
    pub id: u64,
    pub amount: u64,
    pub asset_mint: Pubkey,
    pub recipient: Pubkey,
}

#[derive(Accounts)]
#[instruction(params: IntentParams)]
pub struct SubmitIntent<'info> {
    #[account(
        init,
        payer = submitter,
        space = 8 + IntentAccount::LEN,
        seeds = [b"intent", params.id.to_le_bytes().as_ref()],
        bump
    )]
    pub intent: Account<'info, IntentAccount>,
    #[account(mut)]
    pub submitter: Signer<'info>,
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<SubmitIntent>, params: IntentParams) -> Result<()> {
    let intent = &mut ctx.accounts.intent;
    intent.id = params.id;
    intent.submitter = ctx.accounts.submitter.key();
    intent.amount = params.amount;
    intent.asset_mint = params.asset_mint;
    intent.recipient = params.recipient;
    intent.status = IntentStatus::Pending;
    intent.created_at = Clock::get()?.unix_timestamp;
    msg!("Intent {} submitted", params.id);
    Ok(())
}
