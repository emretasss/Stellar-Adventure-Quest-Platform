#![cfg(test)]

use soroban_sdk::{testutils::Address as _, Address, Env, String};
use super::*;

#[test]
fn test_initialize() {
    let env = Env::default();
    let admin = Address::generate(&env);
    
    let contract_id = env.register_contract(None, RewardToken);
    let client = RewardTokenClient::new(&env, &contract_id);
    
    let name = String::from_str(&env, "Quest Reward Token");
    let symbol = String::from_str(&env, "QRT");
    
    client.initialize(&admin, &name, &symbol);
    
    assert_eq!(client.name(), name);
    assert_eq!(client.symbol(), symbol);
}

