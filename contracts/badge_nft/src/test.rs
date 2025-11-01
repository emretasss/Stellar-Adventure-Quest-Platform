#![cfg(test)]

use soroban_sdk::{symbol_short, testutils::Address as _, Address, Env, Symbol, String};
use super::*;

#[test]
fn test_initialize() {
    let env = Env::default();
    let admin = Address::generate(&env);
    let quest_platform = Address::generate(&env);
    
    let contract_id = env.register_contract(None, BadgeNFT);
    let client = BadgeNFTClient::new(&env, &contract_id);
    
    client.initialize(&admin, &quest_platform);
    
    assert_eq!(client.total_badges(), 0);
}

#[test]
fn test_mint_badge() {
    let env = Env::default();
    let admin = Address::generate(&env);
    let quest_platform = Address::generate(&env);
    let user = Address::generate(&env);
    
    let contract_id = env.register_contract(None, BadgeNFT);
    let client = BadgeNFTClient::new(&env, &contract_id);
    
    client.initialize(&admin, &quest_platform);
    
    let badge_id = symbol_short!("badge1");
    let quest_id = symbol_short!("quest1");
    let metadata = String::from_str(&env, r#"{"name":"First Quest Badge","image":"ipfs://..."}"#);
    
    // This would be called by quest platform in production
    // For test, we'll simulate by calling from quest_platform address
    client.mint_badge(&quest_platform, &user, &badge_id, &quest_id, &metadata);
    
    let badge = client.get_badge(&badge_id).unwrap();
    assert_eq!(badge.owner, user);
    assert_eq!(badge.quest_id, quest_id);
    assert_eq!(client.total_badges(), 1);
}

