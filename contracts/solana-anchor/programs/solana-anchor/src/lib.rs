use anchor_lang::prelude::*;

pub use constants::*;
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

    /// Initialise the program state (run once by deployer).
    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        instructions::initialize::handler(ctx)
    }

    /// Submit a cross-chain payment intent.
    /// TODO: validate amounts, asset mints, and recipient.
    pub fn submit_intent(ctx: Context<SubmitIntent>, params: IntentParams) -> Result<()> {
        instructions::submit_intent::handler(ctx, params)
    }

    /// Mark an intent as executed (called by the relayer).
    /// TODO: verify relayer signature and on-chain proof.
    pub fn execute_intent(ctx: Context<ExecuteIntent>, intent_id: u64) -> Result<()> {
        instructions::execute_intent::handler(ctx, intent_id)
    }
}
