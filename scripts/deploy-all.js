#!/usr/bin/env node
// Deploy all contracts / Tüm sözleşmeleri dağıt

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const NETWORK = process.env.NETWORK || 'testnet';
const ACCOUNT = process.env.ACCOUNT || 'alice';

console.log(`🚀 Deploying contracts to ${NETWORK}...\n`);
console.log(`   Account: ${ACCOUNT}\n`);

const contractsDir = path.join(__dirname, '..', 'contracts');
const contractDirs = fs.readdirSync(contractsDir, { withFileTypes: true })
  .filter(dirent => dirent.isDirectory())
  .map(dirent => dirent.name);

const deployedContracts = {};

for (const contractDir of contractDirs) {
  const contractPath = path.join(contractsDir, contractDir);
  const wasmPath = path.join(
    contractPath,
    'target',
    'wasm32-unknown-unknown',
    'release',
    `${contractDir}.wasm`
  );

  if (!fs.existsSync(wasmPath)) {
    console.log(`⏭️  Skipping ${contractDir} (not built)`);
    continue;
  }

  console.log(`📤 Uploading ${contractDir}...`);
  
  try {
    // Upload WASM
    const uploadOutput = execSync(
      `stellar contract upload --wasm "${wasmPath}" --source-account ${ACCOUNT} --network ${NETWORK} --output json`,
      { encoding: 'utf-8' }
    );
    
    const uploadData = JSON.parse(uploadOutput.trim());
    const wasmHash = uploadData.wasm_hash;
    
    console.log(`   WASM Hash: ${wasmHash}`);
    
    // Deploy contract
    console.log(`🚀 Deploying ${contractDir}...`);
    const deployOutput = execSync(
      `stellar contract deploy --wasm-hash ${wasmHash} --source-account ${ACCOUNT} --network ${NETWORK} --alias ${contractDir} --output json`,
      { encoding: 'utf-8' }
    );
    
    const deployData = JSON.parse(deployOutput.trim());
    const contractId = deployData.contract_id;
    
    deployedContracts[contractDir] = {
      contractId,
      wasmHash
    };
    
    console.log(`✅ ${contractDir} deployed: ${contractId}\n`);
  } catch (error) {
    console.error(`❌ Failed to deploy ${contractDir}: ${error.message}\n`);
  }
}

console.log('\n📋 Deployment Summary:\n');
console.log('Contract IDs (add these to frontend/.env):\n');
for (const [name, data] of Object.entries(deployedContracts)) {
  console.log(`VITE_${name.toUpperCase().replace(/-/g, '_')}_CONTRACT_ID=${data.contractId}`);
}

console.log('\n✅ Deployment complete!');



