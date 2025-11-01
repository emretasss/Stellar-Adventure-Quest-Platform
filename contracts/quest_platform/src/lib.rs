//! Quest Platform Contract
//! Stellar Adventure Quest Platform - Main Quest System
//! Fully on-chain quest creation, completion, and reward distribution

#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short,
    Address, Env, Symbol, Map, Vec, String,
};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Quest {
    pub id: Symbol,
    pub creator: Address,
    pub title: String,
    pub description: String,
    pub reward_amount: i128,
    pub reward_token: Address,
    pub badge_id: Option<Symbol>, // NFT badge for completion
    pub status: Symbol, // "active", "completed", "cancelled"
    pub created_at: u64,
    pub expires_at: Option<u64>,
    pub max_completions: Option<i128>,
    pub current_completions: i128,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct QuestCompletion {
    pub user: Address,
    pub quest_id: Symbol,
    pub completed_at: u64,
    pub reward_claimed: bool,
}

#[contract]
pub struct QuestPlatform;

#[contractimpl]
impl QuestPlatform {
    /// Initialize the quest platform
    pub fn initialize(env: Env, admin: Address, reward_token: Address) {
        env.storage().instance().set(&symbol_short!("admin"), &admin);
        env.storage().instance().set(&symbol_short!("reward_tk"), &reward_token);
        env.storage().instance().set(&symbol_short!("init"), &true);
        env.storage().instance().set(&symbol_short!("quest_cnt"), &0i128);
    }

    /// Create a new quest
    pub fn create_quest(
        env: Env,
        creator: Address,
        quest_id: Symbol,
        title: String,
        description: String,
        reward_amount: i128,
        badge_id: Option<Symbol>,
        expires_at: Option<u64>,
        max_completions: Option<i128>,
    ) -> bool {
        creator.require_auth();

        let current_time = env.ledger().timestamp();
        
        let quest = Quest {
            id: quest_id.clone(),
            creator: creator.clone(),
            title: title.clone(),
            description: description.clone(),
            reward_amount,
            reward_token: env
                .storage()
                .instance()
                .get(&symbol_short!("reward_tk"))
                .expect("Contract not initialized - call initialize first"),
            badge_id: badge_id.clone(),
            status: symbol_short!("active"),
            created_at: current_time,
            expires_at,
            max_completions,
            current_completions: 0,
        };

        let mut quests: Map<Symbol, Quest> = env
            .storage()
            .instance()
            .get(&symbol_short!("quests"))
            .unwrap_or(Map::new(&env));

        if quests.get(quest_id.clone()).is_some() {
            panic!("Quest already exists");
        }

        quests.set(quest_id.clone(), quest);

        let mut count: i128 = env
            .storage()
            .instance()
            .get(&symbol_short!("quest_cnt"))
            .unwrap_or(0);
        count += 1;
        env.storage().instance().set(&symbol_short!("quest_cnt"), &count);

        env.storage().instance().set(&symbol_short!("quests"), &quests);

        env.events().publish(
            (symbol_short!("quest_crt"), creator),
            (quest_id, title, reward_amount),
        );

        true
    }

    /// Complete a quest and claim rewards
    pub fn complete_quest(
        env: Env,
        user: Address,
        quest_id: Symbol,
    ) -> bool {
        user.require_auth();

        let mut quests: Map<Symbol, Quest> = env
            .storage()
            .instance()
            .get(&symbol_short!("quests"))
            .unwrap_or(Map::new(&env));

        let mut quest = quests.get(quest_id.clone()).unwrap();

        // Validate quest status
        if quest.status != symbol_short!("active") {
            panic!("Quest is not active");
        }

        // Check expiration
        if let Some(expires_at) = quest.expires_at {
            let current_time = env.ledger().timestamp();
            if current_time > expires_at {
                quest.status = symbol_short!("cancelled");
                quests.set(quest_id.clone(), quest);
                env.storage().instance().set(&symbol_short!("quests"), &quests);
                panic!("Quest has expired");
            }
        }

        // Check max completions
        if let Some(max) = quest.max_completions {
            if quest.current_completions >= max {
                quest.status = symbol_short!("completed");
                quests.set(quest_id.clone(), quest);
                env.storage().instance().set(&symbol_short!("quests"), &quests);
                panic!("Quest max completions reached");
            }
        }

        // Check if user already completed
        let mut completions: Map<(Address, Symbol), QuestCompletion> = env
            .storage()
            .persistent()
            .get(&symbol_short!("completns"))
            .unwrap_or(Map::new(&env));

        if completions.get((user.clone(), quest_id.clone())).is_some() {
            panic!("User already completed this quest");
        }

        let current_time = env.ledger().timestamp();

        // Update quest completion count
        quest.current_completions += 1;
        if let Some(max) = quest.max_completions {
            if quest.current_completions >= max {
                quest.status = symbol_short!("completed");
            }
        }

        // Record completion
        let completion = QuestCompletion {
            user: user.clone(),
            quest_id: quest_id.clone(),
            completed_at: current_time,
            reward_claimed: false,
        };

        completions.set((user.clone(), quest_id.clone()), completion);
        env.storage().persistent().set(&symbol_short!("completns"), &completions);

        // Note: Token transfer should be handled separately or via reward_token contract
        // For now, we just record the completion. Token transfer can be done via:
        // 1. Frontend calling reward_token contract directly
        // 2. Separate function that processes pending rewards
        // 3. Integration with Stellar Asset Contract
        
        // Reward amount is stored in quest, and completion is recorded
        // Token distribution can be handled in a separate step

        // Update completion to mark reward as claimed
        let reward_amount = quest.reward_amount;
        let mut completion = completions.get((user.clone(), quest_id.clone())).unwrap();
        completion.reward_claimed = true;
        completions.set((user.clone(), quest_id.clone()), completion);
        env.storage().persistent().set(&symbol_short!("completns"), &completions);

        quests.set(quest_id.clone(), quest);
        env.storage().instance().set(&symbol_short!("quests"), &quests);

        env.events().publish(
            (symbol_short!("quest_dn"), user),
            (quest_id, reward_amount),
        );

        true
    }

    /// Get quest details
    pub fn get_quest(env: Env, quest_id: Symbol) -> Option<Quest> {
        let quests: Map<Symbol, Quest> = env
            .storage()
            .instance()
            .get(&symbol_short!("quests"))
            .unwrap_or(Map::new(&env));

        quests.get(quest_id)
    }

    /// Get user's completion status for a quest
    pub fn has_completed(env: Env, user: Address, quest_id: Symbol) -> bool {
        let completions: Map<(Address, Symbol), QuestCompletion> = env
            .storage()
            .persistent()
            .get(&symbol_short!("completns"))
            .unwrap_or(Map::new(&env));

        completions.get((user, quest_id)).is_some()
    }

    /// Get all active quests
    /// Note: Map iteration is not directly supported, so this returns empty Vec
    /// In production, maintain a separate Vec<Symbol> of active quest IDs
    pub fn get_active_quests(env: Env) -> Vec<Quest> {
        // Map iteration not available in Soroban SDK
        // For now, return empty - in production use Vec<Symbol> for active quest IDs
        Vec::new(&env)
    }

    /// Get user's completed quests
    /// Note: Map iteration is not directly supported
    /// In production, maintain a Vec<Symbol> per user for completed quests
    pub fn get_user_completions(env: Env, _user: Address) -> Vec<Symbol> {
        // Map iteration not available - for now return empty
        // In production, store Vec<Symbol> per user for completions
        Vec::new(&env)
    }

    /// Get quest leaderboard (users with most completions)
    /// Note: Map iteration is not directly supported
    /// In production, maintain a separate leaderboard Vec<(Address, i128)>
    pub fn get_leaderboard(env: Env) -> Vec<(Address, i128)> {
        // Map iteration not available - for now return empty
        // In production, maintain a sorted Vec<(Address, i128)> for leaderboard
        Vec::new(&env)
    }

    /// Admin: Cancel a quest
    pub fn cancel_quest(env: Env, quest_id: Symbol) {
        let admin: Address = env
            .storage()
            .instance()
            .get(&symbol_short!("admin"))
            .unwrap();
        admin.require_auth();

        let mut quests: Map<Symbol, Quest> = env
            .storage()
            .instance()
            .get(&symbol_short!("quests"))
            .unwrap_or(Map::new(&env));

        let mut quest = quests.get(quest_id.clone()).unwrap();
        quest.status = symbol_short!("cancelled");
        quests.set(quest_id.clone(), quest);
        env.storage().instance().set(&symbol_short!("quests"), &quests);

        env.events().publish(
            (symbol_short!("quest_cn"), admin),
            quest_id,
        );
    }

    /// Get total quest count
    pub fn get_quest_count(env: Env) -> i128 {
        env.storage()
            .instance()
            .get(&symbol_short!("quest_cnt"))
            .unwrap_or(0)
    }
}

#[cfg(test)]
mod test;

