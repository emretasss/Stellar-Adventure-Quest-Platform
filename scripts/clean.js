#!/usr/bin/env node
// Clean build artifacts / Derleme çıktılarını temizle

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const contractsDir = path.join(__dirname, '..', 'contracts');
const contractDirs = fs.readdirSync(contractsDir, { withFileTypes: true })
  .filter(dirent => dirent.isDirectory())
  .map(dirent => dirent.name);

console.log('🧹 Cleaning contracts...\n');

for (const contractDir of contractDirs) {
  const contractPath = path.join(contractsDir, contractDir);
  
  try {
    execSync('cargo clean', {
      cwd: contractPath,
      stdio: 'inherit'
    });
    console.log(`✅ Cleaned ${contractDir}`);
  } catch (error) {
    console.error(`❌ Failed to clean ${contractDir}`);
  }
}

console.log('\n✅ Clean complete!');



