#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, contracterror, Address, Env, Symbol, symbol_short};

#[contracttype]
pub struct Quota {
    pub limit_stroops: i128,
    pub used_stroops: i128,
}

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    AlreadyInitialized = 1,
    QuotaNotFound = 2,
    QuotaExceeded = 3,
}

const QUOTA: Symbol = symbol_short!("QUOTA");
const ADMIN: Symbol = symbol_short!("ADMIN");

#[contract]
pub struct FeeSponsorshipContract;

#[contractimpl]
impl FeeSponsorshipContract {
    pub fn initialize(env: Env, admin: Address) -> Result<(), Error> {
        if env.storage().instance().has(&ADMIN) {
            return Err(Error::AlreadyInitialized);
        }
        env.storage().instance().set(&ADMIN, &admin);
        Ok(())
    }

    pub fn init_quota(env: Env, tenant: Address, limit_stroops: i128) {
        let admin: Address = env.storage().instance().get(&ADMIN).unwrap();
        admin.require_auth();

        let quota = Quota {
            limit_stroops,
            used_stroops: 0,
        };
        env.storage().persistent().set(&(QUOTA, tenant.clone()), &quota);
    }

    pub fn deduct_fee(env: Env, relayer: Address, tenant: Address, fee_stroops: i128) -> Result<(), Error> {
        relayer.require_auth();

        let key = (QUOTA, tenant.clone());
        let mut quota: Quota = env.storage().persistent()
            .get(&key)
            .ok_or(Error::QuotaNotFound)?;

        if quota.used_stroops + fee_stroops > quota.limit_stroops {
            return Err(Error::QuotaExceeded);
        }

        quota.used_stroops += fee_stroops;
        env.storage().persistent().set(&key, &quota);
        Ok(())
    }

    pub fn remaining(env: Env, tenant: Address) -> i128 {
        let key = (QUOTA, tenant);
        let quota: Option<Quota> = env.storage().persistent().get(&key);
        quota.map(|q| q.limit_stroops - q.used_stroops).unwrap_or(0)
    }

    pub fn reset_quota(env: Env, tenant: Address) {
        let admin: Address = env.storage().instance().get(&ADMIN).unwrap();
        admin.require_auth();

        let key = (QUOTA, tenant.clone());
        if let Some(mut quota) = env.storage().persistent().get::<_, Quota>(&key) {
            quota.used_stroops = 0;
            env.storage().persistent().set(&key, &quota);
        }
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::{testutils::Address as _, Env};

    #[test]
    fn test_quota_lifecycle() {
        let env = Env::default();
        let contract_id = env.register_contract(None, FeeSponsorshipContract);
        let client = FeeSponsorshipContractClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        let tenant = Address::generate(&env);
        let relayer = Address::generate(&env);

        env.mock_all_auths();

        client.initialize(&admin);
        client.init_quota(&tenant, &1_000_000);

        assert_eq!(client.remaining(&tenant), 1_000_000);

        client.deduct_fee(&relayer, &tenant, &100_000);
        assert_eq!(client.remaining(&tenant), 900_000);

        client.reset_quota(&tenant);
        assert_eq!(client.remaining(&tenant), 1_000_000);
    }
}
