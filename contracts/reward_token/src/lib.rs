//! Reward Token Contract
//! Stellar Adventure Quest Platform - Reward Token (Mintable)
//! Token used for quest rewards, can be minted by authorized addresses

#![no_std]
use soroban_sdk::{
    contract, contractimpl, symbol_short,
    Address, Env, String,
};

// Use the standard Stellar Asset Contract as a base
// For simplicity, we'll create a mintable token wrapper

#[contract]
pub struct RewardToken;

#[contractimpl]
impl RewardToken {
    /// Initialize the reward token
    /// This is a simple wrapper around Stellar Asset Contract
    /// For production, integrate with Soroban Token Contract or Stellar Asset Contract
    pub fn initialize(env: Env, admin: Address, name: String, symbol: String) {
        env.storage().instance().set(&symbol_short!("admin"), &admin);
        env.storage().instance().set(&symbol_short!("name"), &name);
        env.storage().instance().set(&symbol_short!("symbol"), &symbol);
        env.storage().instance().set(&symbol_short!("init"), &true);
    }

    /// Mint tokens to an address (admin only, or authorized mint addresses)
    /// Note: This is a placeholder - in production use Stellar Asset Contract with clawback/mint
    pub fn mint(env: Env, to: Address, amount: i128) {
        // i128 is a primitive type, no import needed
        let admin: Address = env
            .storage()
            .instance()
            .get(&symbol_short!("admin"))
            .unwrap();
        admin.require_auth();

        // In production, this would interact with Stellar Asset Contract
        // For now, this is a placeholder for the quest platform integration
        env.events().publish(
            (symbol_short!("minted"), to),
            amount,
        );
    }

    /// Get token metadata
    pub fn name(env: Env) -> String {
        env.storage()
            .instance()
            .get(&symbol_short!("name"))
            .unwrap()
    }

    pub fn symbol(env: Env) -> String {
        env.storage()
            .instance()
            .get(&symbol_short!("symbol"))
            .unwrap()
    }
}

#[cfg(test)]
mod test;

