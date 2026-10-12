// Load variables from a local .env file (Node 20.12+). Existing environment
// variables (for example those set by Docker Compose) are never overwritten.
try { process.loadEnvFile(); } catch { /* no .env file: use defaults */ }
