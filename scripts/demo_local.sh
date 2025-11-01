#!/bin/bash
# Demo script showing end-to-end contract calls / Sözleşme çağrılarını gösteren demo script

set -e

NETWORK="testnet"
ACCOUNT="alice"

echo "=== Demo: Hello World Contract / Merhaba Dünya Sözleşmesi ==="
echo "Calling hello()... / hello() çağrılıyor..."
stellar contract invoke \
  --id hello_world \
  --source-account $ACCOUNT \
  --network $NETWORK \
  -- hello

echo ""
echo "Calling greet(name: 'World')... / greet(name: 'World') çağrılıyor..."
stellar contract invoke \
  --id hello_world \
  --source-account $ACCOUNT \
  --network $NETWORK \
  -- greet \
  --name World

echo ""
echo "=== Demo: Soroban Token Contract / Soroban Token Sözleşmesi ==="
ALICE_ADDRESS=$(stellar keys address $ACCOUNT)

echo "Initializing token... / Token başlatılıyor..."
stellar contract invoke \
  --id soroban_token \
  --source-account $ACCOUNT \
  --network $NETWORK \
  -- initialize \
  --admin "$ALICE_ADDRESS" \
  --name TestToken \
  --symbol TEST \
  --decimals 7

echo ""
echo "Minting 1000 tokens to $ACCOUNT... / $ACCOUNT adresine 1000 token basılıyor..."
stellar contract invoke \
  --id soroban_token \
  --source-account $ACCOUNT \
  --network $NETWORK \
  -- mint \
  --to "$ALICE_ADDRESS" \
  --amount 10000000000

echo ""
echo "Getting balance... / Bakiye alınıyor..."
stellar contract invoke \
  --id soroban_token \
  --source-account $ACCOUNT \
  --network $NETWORK \
  -- balance \
  --address "$ALICE_ADDRESS"

echo ""
echo "=== Demo: Dashboard Controller Contract / Dashboard Controller Sözleşmesi ==="
echo "Initializing dashboard... / Dashboard başlatılıyor..."
stellar contract invoke \
  --id dashboard_controller \
  --source-account $ACCOUNT \
  --network $NETWORK \
  -- initialize \
  --admin "$ALICE_ADDRESS"

echo ""
echo "Registering user... / Kullanıcı kaydediliyor..."
stellar contract invoke \
  --id dashboard_controller \
  --source-account $ACCOUNT \
  --network $NETWORK \
  -- register_user \
  --user "$ALICE_ADDRESS"

echo ""
echo "Recording action... / Eylem kaydediliyor..."
stellar contract invoke \
  --id dashboard_controller \
  --source-account $ACCOUNT \
  --network $NETWORK \
  -- record_action \
  --action_type transfer \
  --user "$ALICE_ADDRESS" \
  --details "Transfer 100 tokens"

echo ""
echo "=== Demo Complete / Demo Tamamlandı ==="



