#!/usr/bin/env node
// Test all contracts / Tüm sözleşmeleri test et

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const contractsDir = path.join(__dirname, '..', 'contracts');
const contractDirs = fs.readdirSync(contractsDir, { withFileTypes: true })
  .filter(dirent => dirent.isDirectory())
  .map(dirent => dirent.name);

console.log('🧪 Testing contracts...\n');

let successCount = 0;
let failCount = 0;

for (const contractDir of contractDirs) {
  const contractPath = path.join(contractsDir, contractDir);
  const cargoToml = path.join(contractPath, 'Cargo.toml');
  
  if (!fs.existsSync(cargoToml)) {
    continue;
  }

  console.log(`🧪 Testing ${contractDir}...`);
  
  try {
    execSync('cargo test', {
      cwd: contractPath,
      stdio: 'inherit'
    });
    console.log(`✅ ${contractDir} tests passed\n`);
    successCount++;
  } catch (error) {
    console.error(`❌ ${contractDir} tests failed\n`);
    failCount++;
  }
}

console.log('\n📊 Test Summary:');
console.log(`   ✅ Passed: ${successCount}`);
console.log(`   ❌ Failed: ${failCount}`);

if (failCount > 0) {
  process.exit(1);
}



