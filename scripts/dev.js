import { spawn } from 'node:child_process';

// Start both servers using the same Node installation, including on Windows.
const children = [
  spawn(process.execPath, ['--env-file=.env', '--watch', 'server/worker.js'], { stdio: 'inherit' }),
  spawn(process.execPath, ['--env-file=.env', '--watch', 'server/index.js'], { stdio: 'inherit' }),
  spawn(process.execPath, ['node_modules/vite/bin/vite.js', '--host', '127.0.0.1'], { stdio: 'inherit' }),
];
let stopping = false;
function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  for (const child of children) child.kill();
  process.exitCode = code;
}
for (const child of children) {
  child.on('error', error => { console.error(error.message); stop(1); });
  child.on('exit', code => stop(code || 0));
}
process.on('SIGINT', () => stop());
process.on('SIGTERM', () => stop());

