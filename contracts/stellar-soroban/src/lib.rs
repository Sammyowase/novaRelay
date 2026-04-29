#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, Symbol, symbol_short};

/// Per-tenant sponsorship quota stored on-chain.
#[contracttype]
pub struct Quota {
    pub limit_xlm_stroops: i128,
    pub used_xlm_stroops: i128,
}

const QUOTA: Symbol = symbol_short!("QUOTA");

#[contract]
pub struct FeeSponsorshipContract;

#[contractimpl]
impl FeeSponsorshipContract {
    /// Initialise quota for a tenant. Can only be called by the contract admin.
    /// TODO: add admin auth check.
    pub fn init_quota(env: Env, tenant: Address, limit_stroops: i128) {
        let quota = Quota { limit_xlm_stroops: limit_stroops, used_xlm_stroops: 0 };
        env.storage().persistent().set(&(QUOTA, tenant), &quota);
    }

    /// Deduct fee from tenant quota. Returns error if quota exceeded.
    /// TODO: enforce caller is the relayer account.
    pub fn deduct_fee(env: Env, tenant: Address, fee_stroops: i128) -> Result<(), &'static str> {
        let key = (QUOTA, tenant);
        let mut quota: Quota = env.storage().persistent().get(&key).ok_or("no quota")?;
        if quota.used_xlm_stroops + fee_stroops > quota.limit_xlm_stroops {
            return Err("quota exceeded");
        }
        quota.used_xlm_stroops += fee_stroops;
        env.storage().persistent().set(&key, &quota);
        Ok(())
    }

    /// Returns remaining quota in stroops.
    pub fn remaining(env: Env, tenant: Address) -> i128 {
        let key = (QUOTA, tenant);
        let quota: Option<Quota> = env.storage().persistent().get(&key);
        quota.map(|q| q.limit_xlm_stroops - q.used_xlm_stroops).unwrap_or(0)
    }
}
