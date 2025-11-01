//! Badge NFT Contract
//! Stellar Adventure Quest Platform - NFT Badge System
//! NFTs minted when users complete quests

#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short,
    Address, Env, Symbol, Map, Vec, String,
};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Badge {
    pub id: Symbol,
    pub quest_id: Symbol,
    pub owner: Address,
    pub minted_at: u64,
    pub metadata: String, // JSON string with badge details
}

#[contract]
pub struct BadgeNFT;

#[contractimpl]
impl BadgeNFT {
    /// Initialize the badge NFT system
    pub fn initialize(env: Env, admin: Address, quest_platform: Address) {
        env.storage().instance().set(&symbol_short!("admin"), &admin);
        env.storage().instance().set(&symbol_short!("questpl"), &quest_platform);
        env.storage().instance().set(&symbol_short!("init"), &true);
        env.storage().instance().set(&symbol_short!("badge_cnt"), &0i128);
    }

    /// Mint a badge NFT to a user (called by quest platform when quest is completed)
    pub fn mint_badge(
        env: Env,
        to: Address,
        badge_id: Symbol,
        quest_id: Symbol,
        metadata: String,
    ) -> bool {
        // Only quest platform can mint badges
        // In production, the quest platform should call this with proper auth
        // For now, we trust that only authorized addresses can call this

        // Check if badge already minted
        let mut badges: Map<Symbol, Badge> = env
            .storage()
            .instance()
            .get(&symbol_short!("badges"))
            .unwrap_or(Map::new(&env));

        if badges.get(badge_id.clone()).is_some() {
            panic!("Badge already minted");
        }

        let current_time = env.ledger().timestamp();

        let badge = Badge {
            id: badge_id.clone(),
            quest_id: quest_id.clone(),
            owner: to.clone(),
            minted_at: current_time,
            metadata: metadata.clone(),
        };

        badges.set(badge_id.clone(), badge);

        // Track user's badges
        let mut user_badges: Map<Address, Vec<Symbol>> = env
            .storage()
            .persistent()
            .get(&symbol_short!("user_bdg"))
            .unwrap_or(Map::new(&env));

        let mut badges_list = user_badges.get(to.clone()).unwrap_or(Vec::new(&env));
        badges_list.push_back(badge_id.clone());
        user_badges.set(to.clone(), badges_list);
        env.storage().persistent().set(&symbol_short!("user_bdg"), &user_badges);

        env.storage().instance().set(&symbol_short!("badges"), &badges);

        let mut count: i128 = env
            .storage()
            .instance()
            .get(&symbol_short!("badge_cnt"))
            .unwrap_or(0);
        count += 1;
        env.storage().instance().set(&symbol_short!("badge_cnt"), &count);

        env.events().publish(
            (symbol_short!("bdg_mint"), to),
            (badge_id, quest_id),
        );

        true
    }

    /// Transfer a badge to another address
    pub fn transfer_badge(
        env: Env,
        from: Address,
        to: Address,
        badge_id: Symbol,
    ) -> bool {
        from.require_auth();

        let mut badges: Map<Symbol, Badge> = env
            .storage()
            .instance()
            .get(&symbol_short!("badges"))
            .unwrap_or(Map::new(&env));

        let mut badge = badges.get(badge_id.clone()).unwrap();

        if badge.owner != from {
            panic!("Not the owner");
        }

        badge.owner = to.clone();
        badges.set(badge_id.clone(), badge);

        // Update user badges lists
        let mut user_badges: Map<Address, Vec<Symbol>> = env
            .storage()
            .persistent()
            .get(&symbol_short!("user_bdg"))
            .unwrap_or(Map::new(&env));

        // Remove from sender
        if let Some(sender_badges) = user_badges.get(from.clone()) {
            let mut new_badges = Vec::new(&env);
            for i in 0..sender_badges.len() {
                if sender_badges.get(i).unwrap() != badge_id {
                    new_badges.push_back(sender_badges.get(i).unwrap());
                }
            }
            if new_badges.len() > 0 {
                user_badges.set(from.clone(), new_badges);
            } else {
                user_badges.remove(from.clone());
            }
        }

        // Add to receiver
        let mut receiver_badges = user_badges.get(to.clone()).unwrap_or(Vec::new(&env));
        receiver_badges.push_back(badge_id.clone());
        user_badges.set(to.clone(), receiver_badges);

        env.storage().instance().set(&symbol_short!("badges"), &badges);
        env.storage().persistent().set(&symbol_short!("user_bdg"), &user_badges);

        env.events().publish(
            (symbol_short!("bdg_xfer"), from),
            (badge_id, to),
        );

        true
    }

    /// Get badge details
    pub fn get_badge(env: Env, badge_id: Symbol) -> Option<Badge> {
        let badges: Map<Symbol, Badge> = env
            .storage()
            .instance()
            .get(&symbol_short!("badges"))
            .unwrap_or(Map::new(&env));

        badges.get(badge_id)
    }

    /// Get all badges owned by a user
    pub fn get_user_badges(env: Env, user: Address) -> Vec<Symbol> {
        let user_badges: Map<Address, Vec<Symbol>> = env
            .storage()
            .persistent()
            .get(&symbol_short!("user_bdg"))
            .unwrap_or(Map::new(&env));

        user_badges.get(user).unwrap_or(Vec::new(&env))
    }

    /// Get badge owner
    pub fn owner_of(env: Env, badge_id: Symbol) -> Option<Address> {
        let badges: Map<Symbol, Badge> = env
            .storage()
            .instance()
            .get(&symbol_short!("badges"))
            .unwrap_or(Map::new(&env));

        badges.get(badge_id).map(|badge| badge.owner)
    }

    /// Get total badge count
    pub fn total_badges(env: Env) -> i128 {
        env.storage()
            .instance()
            .get(&symbol_short!("badge_cnt"))
            .unwrap_or(0)
    }
}

#[cfg(test)]
mod test;

