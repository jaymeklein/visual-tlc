// Runs the integration suites inside a real VS Code instance, each against a temp copy of its fixture workspace.
// Uses the locally installed VS Code when found (set VSCODE_PATH to override), otherwise downloads one.
import { runTests } from '@vscode/test-electron';
import { cpSync, existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..', '..');
const RUNS = [
  { fixture: 'sample', suite: 'suite.cjs' },
  { fixture: 'custom-folder', suite: 'startup.cjs' },
];

// When launched from a VS Code terminal this is inherited and would start Code.exe as plain Node.
delete process.env.ELECTRON_RUN_AS_NODE;

const installed = process.env.LOCALAPPDATA && join(process.env.LOCALAPPDATA, 'Programs', 'Microsoft VS Code', 'Code.exe');
const vscodeExecutablePath = process.env.VSCODE_PATH || (installed && existsSync(installed) ? installed : undefined);

for (const { fixture, suite } of RUNS) {
  const work = mkdtempSync(join(tmpdir(), 'tlc-it-'));
  const workspace = join(work, 'ws');
  cpSync(join(root, 'test', 'fixtures', fixture), workspace, { recursive: true });
  try {
    await runTests({
      vscodeExecutablePath,
      extensionDevelopmentPath: root,
      extensionTestsPath: join(root, 'test', 'integration', suite),
      launchArgs: [workspace, '--disable-extensions', `--user-data-dir=${join(work, 'user')}`, `--extensions-dir=${join(work, 'ext')}`, '--skip-welcome', '--skip-release-notes', '--disable-workspace-trust'],
    });
  } catch (e) {
    console.error(`Integration tests failed (${suite}):`, e);
    process.exitCode = 1;
  } finally {
    rmSync(work, { recursive: true, force: true, maxRetries: 5, retryDelay: 500 });
  }
}
