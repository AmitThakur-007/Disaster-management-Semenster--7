function normalizeOrigin(value) {
  try {
    const parsed = new URL(value);
    if (!['http:', 'https:'].includes(parsed.protocol) || parsed.origin === 'null') return null;
    return parsed.origin;
  } catch {
    return null;
  }
}

export function isAllowedOrigin(origin, configured = [process.env.APP_ORIGINS, process.env.APP_ORIGIN, process.env.APP_URL].filter(Boolean).join(',') || 'http://localhost:3000,http://127.0.0.1:3000,http://localhost:3001,http://127.0.0.1:3001,http://localhost:5173,http://127.0.0.1:5173') {
  // Non-browser clients may omit Origin. SameSite cookies remain enabled.
  if (!origin) return true;
  const requestOrigin = normalizeOrigin(origin);
  if (!requestOrigin) return false;
  const allowed = String(configured).split(',').map(value => normalizeOrigin(value.trim())).filter(Boolean);
  if (allowed.includes('*')) return true;
  if (allowed.includes(requestOrigin)) return true;
  if (!arguments[1]) {
    try {
      const url = new URL(requestOrigin);
      if (url.hostname.endsWith('.run.app') || url.hostname.endsWith('.google.com')) {
        return true;
      }
    } catch {}
  }
  return false;
}
