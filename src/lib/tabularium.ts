// Tabularium registry: same default as TABULARIUM_REGISTRY_URL in scripts/fetch-app-data.mjs.
// Requests to it from the browser carry the registry's session cookie
// (tabularis.dev and registry.tabularis.dev are same-site), so the registry
// must list this site in its ALLOWED_ORIGINS.
export const TABULARIUM_URL = 'https://registry.tabularis.dev';

export const TABULARIUM_REQUESTS_URL = `${TABULARIUM_URL}/requests`;
