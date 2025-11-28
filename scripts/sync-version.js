#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const packageJsonPath = path.join(rootDir, 'package.json');
const androidBuildPath = path.join(rootDir, 'packages/android/build.gradle.kts');

// Get version from root package.json
const rootPackage = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const newVersion = rootPackage.version;

console.log(`Syncing version to ${newVersion} across all packages...`);

// Update Android build.gradle.kts
let androidBuild = fs.readFileSync(androidBuildPath, 'utf8');
androidBuild = androidBuild.replace(
  /^version = ".*"$/m,
  `version = "${newVersion}"`
);
androidBuild = androidBuild.replace(
  /version = ".*"/g,
  `version = "${newVersion}"`
);
fs.writeFileSync(androidBuildPath, androidBuild);
console.log(`✓ Updated Android version to ${newVersion}`);

// Update packages/core/package.json
const corePackagePath = path.join(rootDir, 'packages/core/package.json');
const corePackage = JSON.parse(fs.readFileSync(corePackagePath, 'utf8'));
corePackage.version = newVersion;
fs.writeFileSync(corePackagePath, JSON.stringify(corePackage, null, 2) + '\n');
console.log(`✓ Updated @rarimo/unforgettable-sdk version to ${newVersion}`);

// Update packages/react/package.json
const reactPackagePath = path.join(rootDir, 'packages/react/package.json');
const reactPackage = JSON.parse(fs.readFileSync(reactPackagePath, 'utf8'));
reactPackage.version = newVersion;
fs.writeFileSync(reactPackagePath, JSON.stringify(reactPackage, null, 2) + '\n');
console.log(`✓ Updated @rarimo/unforgettable-react version to ${newVersion}`);

console.log('\nNote: iOS packages use Git tags for versioning (SPM convention)');
console.log('Version sync complete!');
