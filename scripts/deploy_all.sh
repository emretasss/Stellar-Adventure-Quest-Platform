#!/bin/bash
# Deploy all contracts to Stellar Testnet / Tüm sözleşmeleri Stellar Testnet'e dağıt

set -e

NETWORK="testnet"
ACCOUNT="alice"

echo "Building all contracts... / Tüm sözleşmeleri derleniyor..."
cd contracts

# Build hello_world
echo "Building hello_world... / hello_world derleniyor..."
cd hello_world
stellar contract build
cd ..

# Build soroban_token
echo "Building soroban_token... / soroban_token derleniyor..."
cd soroban_token
stellar contract build
cd ..

# Build dashboard_controller
echo "Building dashboard_controller... / dashboard_controller derleniyor..."
cd dashboard_controller
stellar contract build
cd ..

cd ..

echo "Deploying contracts... / Sözleşmeler dağıtılıyor..."

# Deploy hello_world
echo "Deploying hello_world... / hello_world dağıtılıyor..."
HELLO_WASM_HASH=$(stellar contract upload \
  --wasm contracts/hello_world/target/wasm32-unknown-unknown/release/hello_world.wasm \
  --source-account $ACCOUNT \
  --network $NETWORK \
  --output json | jq -r '.wasm_hash')

echo "hello_world WASM hash: $HELLO_WASM_HASH"

HELLO_CONTRACT_ID=$(stellar contract deploy \
  --wasm-hash $HELLO_WASM_HASH \
  --source-account $ACCOUNT \
  --network $NETWORK \
  --alias hello_world \
  --output json | jq -r '.contract_id')

echo "hello_world Contract ID: $HELLO_CONTRACT_ID"

# Deploy soroban_token
echo "Deploying soroban_token... / soroban_token dağıtılıyor..."
TOKEN_WASM_HASH=$(stellar contract upload \
  --wasm contracts/soroban_token/target/wasm32-unknown-unknown/release/soroban_token.wasm \
  --source-account $ACCOUNT \
  --network $NETWORK \
  --output json | jq -r '.wasm_hash')

echo "soroban_token WASM hash: $TOKEN_WASM_HASH"

TOKEN_CONTRACT_ID=$(stellar contract deploy \
  --wasm-hash $TOKEN_WASM_HASH \
  --source-account $ACCOUNT \
  --network $NETWORK \
  --alias soroban_token \
  --output json | jq -r '.contract_id')

echo "soroban_token Contract ID: $TOKEN_CONTRACT_ID"

# Deploy dashboard_controller
echo "Deploying dashboard_controller... / dashboard_controller dağıtılıyor..."
DASHBOARD_WASM_HASH=$(stellar contract upload \
  --wasm contracts/dashboard_controller/target/wasm32-unknown-unknown/release/dashboard_controller.wasm \
  --source-account $ACCOUNT \
  --network $NETWORK \
  --output json | jq -r '.wasm_hash')

echo "dashboard_controller WASM hash: $DASHBOARD_WASM_HASH"

DASHBOARD_CONTRACT_ID=$(stellar contract deploy \
  --wasm-hash $DASHBOARD_WASM_HASH \
  --source-account $ACCOUNT \
  --network $NETWORK \
  --alias dashboard_controller \
  --output json | jq -r '.contract_id')

echo "dashboard_controller Contract ID: $DASHBOARD_CONTRACT_ID"

echo ""
echo "=== Deployment Summary / Dağıtım Özeti ==="
echo "hello_world: $HELLO_CONTRACT_ID"
echo "soroban_token: $TOKEN_CONTRACT_ID"
echo "dashboard_controller: $DASHBOARD_CONTRACT_ID"
echo ""
echo "Save these contract IDs in your frontend .env file!"
echo "Bu contract ID'lerini frontend .env dosyasına kaydedin!"



