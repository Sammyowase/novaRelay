use anchor_lang::prelude::*;

pub use constants::*;
pub use error::*;
pub use instructions::*;
pub use state::*;

pub mod constants;
pub mod error;
pub mod instructions;
pub mod state;

declare_id!("GcCkgoKbDFeXzdmA3PdegAiMaZrTmeYh3kRrDN4UML9n");

#[program]
pub mod nova_relay {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>, relayer: Pubkey) -> Result<()> {
        instructions::initialize::handler(ctx, relayer)
    }

    pub fn submit_intent(ctx: Context<SubmitIntent>, params: IntentParams) -> Result<()> {
        instructions::submit_intent::handler(ctx, params)
    }

    pub fn execute_intent(ctx: Context<ExecuteIntent>, intent_id: u64, tx_hash: String) -> Result<()> {
        instructions::execute_intent::handler(ctx, intent_id, tx_hash)
    }

    pub fn fail_intent(ctx: Context<ExecuteIntent>, intent_id: u64) -> Result<()> {
        instructions::fail_intent::handler(ctx, intent_id)
    }
}
