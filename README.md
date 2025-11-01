# 🌟 Stellar Adventure Quest Platform

A fully on-chain quest platform built on Stellar/Soroban. Users can create quests, complete them, earn token rewards, and collect NFT badges - all running completely on-chain with no local dependencies.

## 🎯 Project Overview

This is a hackathon-ready Phase 1 implementation featuring:
...

- **Quest Platform Contract**: Create, complete, and manage quests on-chain
- **Badge NFT Contract**: Mint NFT badges when users complete quests
- **Reward Token**: Token rewards for quest completion
- **Modern Frontend**: React + TypeScript frontend with Freighter wallet integration

---

## 🚀 Contract Deployment Guide

### Contract IDs

| Contract         | Contract ID                                      | Status                |
|------------------|--------------------------------------------------|-----------------------|
| Reward Token     | `CD6MSKR6OA4CIBOAAQSQ22KEWO5EQSNWFA6BJFA6QYPOYIHGYFVS7OTV` | Deployed & Initialized |

| Badge NFT        | `CDQKDAPHJFJU5JNZM2ZS65WK2ZNGMZKX7XWP2J62RCOOKHFWQN6M5XDV` | Deployed               |
| Quest Platform   | `CCS346M7LXP5VKCZN4A2NTZN3LR7THFMW6BI6C6V642KQKJ5EVKVLPC6` | Deployed & Initialized |

Explorer links:

- [Reward Token](https://stellar.expert/explorer/testnet/contract/CD6MSKR6OA4CIBOAAQSQ22KEWO5EQSNWFA6BJFA6QYPOYIHGYFVS7OTV)
- [Badge NFT](https://stellar.expert/explorer/testnet/contract/CDQKDAPHJFJU5JNZM2ZS65WK2ZNGMZKX7XWP2J62RCOOKHFWQN6M5XDV)
- [Quest Platform](https://stellar.expert/explorer/testnet/contract/CCS346M7LXP5VKCZN4A2NTZN3LR7THFMW6BI6C6V642KQKJ5EVKVLPC6)


### Environment Variables

Environment değişkenleri için `env.template` dosyasını kullanın. Kendi contract ID'lerinizi ve RPC bilgilerinizi bu dosyadan kopyalayıp `frontend/.env` olarak oluşturun.

Değişiklik yaptıktan sonra frontend sunucusunu yeniden başlatmayı unutmayın:
```bash
cd frontend
npm run dev
```

## 📦 Deployment Steps

1. Build contracts: `npm run build:contracts`
2. Deploy contracts using Stellar CLI (see below)
3. Initialize contracts as described
4. Update `.env` with contract IDs
5. Start frontend: `npm run dev`

### Example CLI Commands

**Deploy Reward Token:**
```bash
stellar contract deploy --wasm contracts/reward_token/target/wasm32-unknown-unknown/release/reward_token.wasm --source-account YOUR_SECRET_KEY --network testnet
```
**Initialize Reward Token:**
```bash
stellar contract invoke --id <REWARD_TOKEN_CONTRACT_ID> --source-account YOUR_SECRET_KEY --network testnet -- initialize --admin YOUR_ADMIN_ADDRESS --name "Quest Reward Token" --symbol "QRT"
```
**Deploy Badge NFT:**
```bash
stellar contract deploy --wasm contracts/badge_nft/target/wasm32-unknown-unknown/release/badge_nft.wasm --source-account YOUR_SECRET_KEY --network testnet
```
**Initialize Badge NFT:**
```bash
stellar contract invoke --id <BADGE_NFT_CONTRACT_ID> --source-account YOUR_SECRET_KEY --network testnet -- initialize --admin YOUR_ADMIN_ADDRESS --quest_platform <QUEST_PLATFORM_CONTRACT_ID>
```
**Deploy Quest Platform:**
```bash
stellar contract deploy --wasm contracts/quest_platform/target/wasm32-unknown-unknown/release/quest_platform.wasm --source-account YOUR_SECRET_KEY --network testnet
```
**Initialize Quest Platform:**
```bash
stellar contract invoke --id <QUEST_PLATFORM_CONTRACT_ID> --source-account YOUR_SECRET_KEY --network testnet -- initialize --admin YOUR_ADMIN_ADDRESS --reward_token <REWARD_TOKEN_CONTRACT_ID>
```

---

## 🛠️ Troubleshooting


# 🌟 Stellar Adventure Quest Platform

A fully on-chain quest platform built on Stellar/Soroban. Users can create quests, complete them, earn token rewards, and collect NFT badges — all on-chain with no local dependencies.

## 🎯 Project Overview

This is a hackathon-ready implementation featuring:
- **Quest Platform Contract**: Create, complete, and manage quests on-chain
- **Badge NFT Contract**: Mint NFT badges for completed quests
- **Reward Token**: Token rewards for quest completion
- **Modern Frontend**: React + TypeScript frontend with Freighter wallet integration

---

## 🚀 Deployment Guide

### Contract IDs

| Contract         | Contract ID                                      | Status                |
|------------------|--------------------------------------------------|-----------------------|
| Reward Token     | `CD6MSKR6OA4CIBOAAQSQ22KEWO5EQSNWFA6BJFA6QYPOYIHGYFVS7OTV` | Deployed & Initialized |
| Badge NFT        | `CDQKDAPHJFJU5JNZM2ZS65WK2ZNGMZKX7XWP2J62RCOOKHFWQN6M5XDV` | Deployed               |
| Quest Platform   | `CCS346M7LXP5VKCZN4A2NTZN3LR7THFMW6BI6C6V642KQKJ5EVKVLPC6` | Deployed & Initialized |

Explorer links:
- [Reward Token](https://stellar.expert/explorer/testnet/contract/CD6MSKR6OA4CIBOAAQSQ22KEWO5EQSNWFA6BJFA6QYPOYIHGYFVS7OTV)
- [Badge NFT](https://stellar.expert/explorer/testnet/contract/CDQKDAPHJFJU5JNZM2ZS65WK2ZNGMZKX7XWP2J62RCOOKHFWQN6M5XDV)
- [Quest Platform](https://stellar.expert/explorer/testnet/contract/CCS346M7LXP5VKCZN4A2NTZN3LR7THFMW6BI6C6V642KQKJ5EVKVLPC6)

### Environment Variables

Copy `env.template` to `frontend/.env` and fill in your contract IDs and RPC details. After any change, restart the frontend server:
```bash
cd frontend
npm run dev
```

---

## � Deployment Steps

1. Build contracts: `npm run build:contracts`
2. Deploy contracts using Stellar CLI (see below)
3. Initialize contracts as described
4. Update `.env` with contract IDs
5. Start frontend: `npm run dev`

### Example CLI Commands

**Deploy Reward Token:**
```bash
stellar contract deploy --wasm contracts/reward_token/target/wasm32-unknown-unknown/release/reward_token.wasm --source-account YOUR_SECRET_KEY --network testnet
```
**Initialize Reward Token:**
```bash
stellar contract invoke --id <REWARD_TOKEN_CONTRACT_ID> --source-account YOUR_SECRET_KEY --network testnet -- initialize --admin YOUR_ADMIN_ADDRESS --name "Quest Reward Token" --symbol "QRT"
```
**Deploy Badge NFT:**
```bash
stellar contract deploy --wasm contracts/badge_nft/target/wasm32-unknown-unknown/release/badge_nft.wasm --source-account YOUR_SECRET_KEY --network testnet
```
**Initialize Badge NFT:**
```bash
stellar contract invoke --id <BADGE_NFT_CONTRACT_ID> --source-account YOUR_SECRET_KEY --network testnet -- initialize --admin YOUR_ADMIN_ADDRESS --quest_platform <QUEST_PLATFORM_CONTRACT_ID>
```
**Deploy Quest Platform:**
```bash
stellar contract deploy --wasm contracts/quest_platform/target/wasm32-unknown-unknown/release/quest_platform.wasm --source-account YOUR_SECRET_KEY --network testnet
```
**Initialize Quest Platform:**
```bash
stellar contract invoke --id <QUEST_PLATFORM_CONTRACT_ID> --source-account YOUR_SECRET_KEY --network testnet -- initialize --admin YOUR_ADMIN_ADDRESS --reward_token <REWARD_TOKEN_CONTRACT_ID>
```

---

## 🛠️ Troubleshooting

- Make sure you have enough XLM in your account
- Check that WASM files were built successfully
- Verify network connection to testnet
- Check contract IDs and admin addresses
- Restart frontend after updating `.env`

---

## 📝 License
MIT

## 🤝 Contributing
Contributions welcome!

---

**Built for Stellar Hackathons** 🚀
**Fully On-Chain | No Local Dependencies | Community-Driven**
#### Option 2: Using Cargo directly
```bash
cd contracts/quest_platform
cargo build --target wasm32-unknown-unknown --release

cd ../badge_nft
cargo build --target wasm32-unknown-unknown --release

cd ../reward_token
cargo build --target wasm32-unknown-unknown --release
```

The compiled WASM files will be in:
- `contracts/quest_platform/target/wasm32-unknown-unknown/release/quest_platform.wasm`
- `contracts/badge_nft/target/wasm32-unknown-unknown/release/badge_nft.wasm`
- `contracts/reward_token/target/wasm32-unknown-unknown/release/reward_token.wasm`

### Deploying Contracts

#### Using Stellar CLI

1. **Deploy Reward Token**
```bash
stellar contract deploy \
  --wasm contracts/reward_token/target/wasm32-unknown-unknown/release/reward_token.wasm \
  --source-account YOUR_SECRET_KEY \
  --network testnet
```

2. **Initialize Reward Token**
```bash
stellar contract invoke \
  --id REWARD_TOKEN_CONTRACT_ID \
  --source-account YOUR_SECRET_KEY \
  --network testnet \
  -- initialize \
  --admin YOUR_ADMIN_ADDRESS \
  --name "Quest Reward Token" \
  --symbol "QRT"
```

3. **Deploy Badge NFT**
```bash
stellar contract deploy \
  --wasm contracts/badge_nft/target/wasm32-unknown-unknown/release/badge_nft.wasm \
  --source-account YOUR_SECRET_KEY \
  --network testnet
```

4. **Initialize Badge NFT**
```bash
stellar contract invoke \
  --id BADGE_NFT_CONTRACT_ID \
  --source-account YOUR_SECRET_KEY \
  --network testnet \
  -- initialize \
  --admin YOUR_ADMIN_ADDRESS \
  --quest_platform QUEST_PLATFORM_CONTRACT_ID
```

5. **Deploy Quest Platform**
```bash
stellar contract deploy \
  --wasm contracts/quest_platform/target/wasm32-unknown-unknown/release/quest_platform.wasm \
  --source-account YOUR_SECRET_KEY \
  --network testnet
```

6. **Initialize Quest Platform**
```bash
stellar contract invoke \
  --id QUEST_PLATFORM_CONTRACT_ID \
  --source-account YOUR_SECRET_KEY \
  --network testnet \
  -- initialize \
  --admin YOUR_ADMIN_ADDRESS \
  --reward_token REWARD_TOKEN_CONTRACT_ID
```

#### Manual Deployment Steps

1. Build all contracts
2. Deploy each contract WASM file to Soroban
3. Initialize each contract with required parameters
4. Update frontend `.env` file with contract IDs
5. Fund the quest platform contract with reward tokens (if needed)

### Running the Frontend

```bash
cd frontend
npm run dev
```

The frontend will be available at `http://localhost:5173`

## 📋 Contract Deployment Checklist

After building contracts, follow these steps:

1. ✅ Build all contracts (`npm run build:contracts`)
2. ✅ Deploy `reward_token` contract
3. ✅ Initialize `reward_token` with admin and metadata
4. ✅ Deploy `badge_nft` contract
5. ✅ Initialize `badge_nft` with admin and quest platform address
6. ✅ Deploy `quest_platform` contract
7. ✅ Initialize `quest_platform` with admin and reward token address
8. ✅ Update `frontend/.env` with all contract IDs
9. ✅ Fund quest platform with reward tokens (if pre-funding rewards)
10. ✅ Test creating and completing a quest

## 🔧 Configuration

### Contract IDs

After deployment, update `frontend/.env`:
- `VITE_QUEST_PLATFORM_CONTRACT_ID`: Your quest platform contract ID
- `VITE_BADGE_NFT_CONTRACT_ID`: Your badge NFT contract ID
- `VITE_REWARD_TOKEN_CONTRACT_ID`: Your reward token contract ID

### Network

The project is configured for Stellar Testnet by default. To use Mainnet:
- Change `VITE_NETWORK` in `.env` to `mainnet`
- Update RPC URL to mainnet endpoint
- Deploy contracts to mainnet

## 🎮 Usage

### Creating a Quest

1. Connect your Freighter wallet
2. Navigate to "Create Quest"
3. Fill in quest details:
   - Quest ID (unique identifier)
   - Title and description
   - Reward amount
   - Optional: Badge ID, expiration date, max completions
4. Submit (requires wallet transaction)

### Completing a Quest

1. Browse active quests on the Quest Board
2. Click "Complete Quest" on any quest
3. Approve the transaction in Freighter
4. Receive token rewards and NFT badge (if applicable)

### Viewing Dashboard

- See your completed quests
- View collected badges
- Check your leaderboard position
- Track your quest statistics

## 🏗️ Project Structure

```
stellarproje1/
├── contracts/
│   ├── quest_platform/     # Main quest system contract
│   ├── badge_nft/          # NFT badge contract
│   └── reward_token/       # Reward token contract
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── services/       # Contract interaction services
│   │   └── hooks/          # React hooks
│   └── .env               # Environment variables (create from env.template)
├── scripts/
│   └── build-contracts.js # Contract build script
├── env.template            # Environment variables template
└── README.md              # This file
```

## 🐛 Troubleshooting

### Contract Build Issues

- Ensure Rust toolchain is installed: `rustup target add wasm32-unknown-unknown`
- Check Cargo.toml dependencies match Soroban SDK version

### Frontend Connection Issues

- Verify Freighter wallet is installed and unlocked
- Check that contract IDs in `.env` are correct
- Ensure you're on the correct network (testnet/mainnet)

### Transaction Errors

- Ensure wallet has XLM for fees
- Verify contract initialization was successful
- Check contract permissions and admin settings

## 🔐 Security Notes

- All contracts are fully on-chain - no local storage dependencies
- Wallet transactions require explicit user approval
- Contract admin functions are protected by authentication
- Quest creators fund rewards themselves

## 📝 License

MIT

## 🤝 Contributing

This is a hackathon Phase 1 project. Contributions welcome!

## 📞 Support

For issues or questions:
1. Check contract deployment checklist
2. Verify environment variables
3. Review transaction logs in Freighter
4. Check Soroban network status

---

**Built for Stellar Hackathons** 🚀
**Fully On-Chain | No Local Dependencies | Community-Driven**
#   S t e l l a r - A d v e n t u r e - Q u e s t - P l a t f o r m  
 #   S t e l l a r - A d v e n t u r e - Q u e s t - P l a t f o r m  
 