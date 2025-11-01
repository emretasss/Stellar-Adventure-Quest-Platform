#![cfg(test)]

use soroban_sdk::{symbol_short, testutils::Address as _, Address, Env, Symbol, String};
use super::*;

#[test]
fn test_initialize() {
    let env = Env::default();
    let admin = Address::generate(&env);
    let reward_token = Address::generate(&env);
    
    let contract_id = env.register_contract(None, QuestPlatform);
    let client = QuestPlatformClient::new(&env, &contract_id);
    
    client.initialize(&admin, &reward_token);
    
    assert_eq!(client.get_quest_count(), 0);
}

#[test]
fn test_create_quest() {
    let env = Env::default();
    let admin = Address::generate(&env);
    let creator = Address::generate(&env);
    let reward_token = Address::generate(&env);
    
    let contract_id = env.register_contract(None, QuestPlatform);
    let client = QuestPlatformClient::new(&env, &contract_id);
    
    client.initialize(&admin, &reward_token);
    
    let quest_id = symbol_short!("quest1");
    let title = String::from_str(&env, "Test Quest");
    let description = String::from_str(&env, "Complete this test quest");
    
    client.create_quest(
        &creator,
        &quest_id,
        &title,
        &description,
        &1000,
        &None,
        &None,
        &Some(100),
    );
    
    let quest = client.get_quest(&quest_id).unwrap();
    assert_eq!(quest.id, quest_id);
    assert_eq!(quest.creator, creator);
    assert_eq!(quest.status, symbol_short!("active"));
}

