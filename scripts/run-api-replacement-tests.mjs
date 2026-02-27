import { spawn } from 'node:child_process';
import process from 'node:process';

const PORT = process.env.TEST_PORT || '3100';
const BASE_URL = process.env.TEST_BASE_URL || `http://localhost:${PORT}`;
const START_TIMEOUT_MS = 45000;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForServer(url, timeoutMs) {
  const start = Date.now();

  while (Date.now() - start < timeoutMs) {
    try {
      const response = await fetch(`${url}/api/drafts`);
      if (response.ok || response.status === 500) {
        return;
      }
    } catch {
      // keep waiting
    }

    await sleep(500);
  }

  throw new Error(`Timed out waiting for Next.js server at ${url}`);
}

function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: false,
      ...options,
    });

    child.on('error', reject);
    child.on('exit', (code) => resolve(code ?? 1));
  });
}

async function main() {
  let server;

  try {
    server = spawn('npx', ['next', 'dev', '-p', String(PORT)], {
      stdio: 'inherit',
      shell: false,
      env: process.env,
    });

    await waitForServer(BASE_URL, START_TIMEOUT_MS);

    const code = await runCommand('node', ['--test', 'tests/api-replacement.test.mjs'], {
      env: {
        ...process.env,
        TEST_BASE_URL: BASE_URL,
      },
    });

    process.exitCode = code;
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  } finally {
    if (server && !server.killed) {
      server.kill('SIGTERM');
      await sleep(500);
      if (!server.killed) {
        server.kill('SIGKILL');
      }
    }
  }
}

await main();
