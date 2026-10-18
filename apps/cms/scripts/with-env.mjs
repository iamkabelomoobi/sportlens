import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { spawn } from 'node:child_process'

const envPath = resolve(process.cwd(), '../../.env')

for (const line of readFileSync(envPath, 'utf8').split(/\r?\n/)) {
  const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/)
  if (!match || process.env[match[1]] !== undefined) continue

  const value = match[2]
  process.env[match[1]] = value.replace(/^(['"])(.*)\1$/, '$2')
}

const [command, ...args] = process.argv.slice(2)
const child = spawn(process.execPath, [resolve(process.cwd(), 'node_modules/next/dist/bin/next'), command, ...args], {
  stdio: 'inherit',
  env: process.env,
})

child.on('exit', (code, signal) => {
  if (signal) process.kill(process.pid, signal)
  else process.exit(code ?? 1)
})
