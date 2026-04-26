#!/usr/bin/env node

import { spawn } from 'node:child_process'
import { readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const rootDir = join(__dirname, '..')
const pnpmCommand = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm'

const managedFiles = [
  'package.json',
  'src-tauri/tauri.conf.json',
  'src-tauri/Cargo.toml',
  'CHANGELOG.md',
]

async function snapshotManagedFiles() {
  const entries = await Promise.all(
    managedFiles.map(async (relativePath) => {
      const absolutePath = join(rootDir, relativePath)
      const contents = await readFile(absolutePath, 'utf8')

      return [absolutePath, contents]
    })
  )

  return new Map(entries)
}

async function restoreManagedFiles(snapshot) {
  await Promise.all(
    [...snapshot.entries()].map(([absolutePath, contents]) => writeFile(absolutePath, contents))
  )
}

function runReleaseDry() {
  return new Promise((resolve, reject) => {
    const child = spawn(pnpmCommand, ['exec', 'release-it', '--ci', '--dry-run'], {
      cwd: rootDir,
      stdio: 'inherit',
      env: process.env,
    })

    child.on('error', reject)
    child.on('close', (code, signal) => {
      if (signal) {
        resolve(1)
        return
      }

      resolve(code ?? 1)
    })
  })
}

const snapshot = await snapshotManagedFiles()
let exitCode = 1

try {
  exitCode = await runReleaseDry()
} finally {
  await restoreManagedFiles(snapshot)

  if (exitCode === 0) {
    console.log('Restored release-managed files after dry-run.')
  }
}

process.exit(exitCode)
