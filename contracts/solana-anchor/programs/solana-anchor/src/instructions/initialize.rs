use anchor_lang::prelude::*;
use crate::state::ProgramState;

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + ProgramState::LEN,
        seeds = [b"state"],
        bump
    )]
    pub state: Account<'info, ProgramState>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<Initialize>, relayer: Pubkey) -> Result<()> {
    let state = &mut ctx.accounts.state;
    state.authority = ctx.accounts.authority.key();
    state.relayer = relayer;
    state.intent_count = 0;
    state.bump = ctx.bumps.state;
    
    msg!("Program initialized with relayer: {}", relayer);
    Ok(())
}
