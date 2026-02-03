#!/usr/bin/env node

/**
 * Sync version from package.json to tauri.conf.json
 * This ensures both versions stay in sync during releases
 */

import { readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const rootDir = join(__dirname, '..')

// Read package.json version
const packageJson = JSON.parse(readFileSync(join(rootDir, 'package.json'), 'utf-8'))
const version = packageJson.version

// Update tauri.conf.json
const tauriConfPath = join(rootDir, 'src-tauri', 'tauri.conf.json')
const tauriConf = JSON.parse(readFileSync(tauriConfPath, 'utf-8'))

if (tauriConf.version !== version) {
  tauriConf.version = version
  writeFileSync(tauriConfPath, JSON.stringify(tauriConf, null, 2) + '\n')
  console.log(`Updated tauri.conf.json version to ${version}`)
} else {
  console.log(`Versions already in sync: ${version}`)
}

// Update Cargo.toml version
const cargoTomlPath = join(rootDir, 'src-tauri', 'Cargo.toml')
let cargoToml = readFileSync(cargoTomlPath, 'utf-8')

const versionRegex = /^version\s*=\s*"[^"]+"/m
if (versionRegex.test(cargoToml)) {
  const newCargoToml = cargoToml.replace(versionRegex, `version = "${version}"`)
  if (newCargoToml !== cargoToml) {
    writeFileSync(cargoTomlPath, newCargoToml)
    console.log(`Updated Cargo.toml version to ${version}`)
  }
}

console.log('Version sync complete!')
