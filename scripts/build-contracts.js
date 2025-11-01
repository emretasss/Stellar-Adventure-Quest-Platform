#!/usr/bin/env node
// Build all contracts / Tüm sözleşmeleri derle

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const contractsDir = path.join(__dirname, '..', 'contracts');
const contractDirs = fs.readdirSync(contractsDir, { withFileTypes: true })
  .filter(dirent => dirent.isDirectory())
  .map(dirent => dirent.name);

console.log('🔨 Building contracts...\n');

let successCount = 0;
let failCount = 0;

for (const contractDir of contractDirs) {
  const contractPath = path.join(contractsDir, contractDir);
  const cargoToml = path.join(contractPath, 'Cargo.toml');
  
  if (!fs.existsSync(cargoToml)) {
    console.log(`⏭️  Skipping ${contractDir} (no Cargo.toml)`);
    continue;
  }

  console.log(`📦 Building ${contractDir}...`);
  
  try {
    // Try stellar CLI first, fallback to cargo
    let buildCommand;
    try {
      execSync('stellar --version', { stdio: 'ignore' });
      buildCommand = 'stellar contract build';
    } catch (e) {
      // Fallback to direct cargo build
      console.log(`   ⚠️  Stellar CLI not found, using cargo directly...`);
      buildCommand = 'cargo build --target wasm32-unknown-unknown --release';
    }
    
    execSync(buildCommand, {
      cwd: contractPath,
      stdio: 'inherit',
      shell: true
    });
    
    // Try multiple possible paths for WASM files
    const possiblePaths = [
      path.join(contractPath, 'target', 'wasm32v1-none', 'release', `${contractDir}.wasm`),
      path.join(contractPath, 'target', 'wasm32-unknown-unknown', 'release', `${contractDir}.wasm`),
    ];
    
    let wasmPath = null;
    for (const possiblePath of possiblePaths) {
      if (fs.existsSync(possiblePath)) {
        wasmPath = possiblePath;
        break;
      }
    }
    
    if (wasmPath) {
      const stats = fs.statSync(wasmPath);
      const sizeKB = (stats.size / 1024).toFixed(2);
      console.log(`✅ ${contractDir} built successfully (${sizeKB} KB)\n`);
      successCount++;
    } else {
      throw new Error('WASM file not found in any expected location');
    }
  } catch (error) {
    console.error(`❌ Failed to build ${contractDir}\n`);
    failCount++;
  }
}

console.log('\n📊 Build Summary:');
console.log(`   ✅ Success: ${successCount}`);
console.log(`   ❌ Failed: ${failCount}`);

if (failCount > 0) {
  process.exit(1);
}

