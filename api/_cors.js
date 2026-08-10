/**
 * Restricted CORS handling for the API endpoints.
 *
 * Allowed origins come from the ALLOWED_ORIGINS env var (comma-separated).
 * In development we also allow the local Vite/dev origins by default.
 *
 * Note: we intentionally do NOT set Access-Control-Allow-Credentials, since
 * auth is carried in the Authorization header (Bearer token), not cookies.
 * Combining `*` origin with credentials is invalid anyway.
 */
const DEV_ORIGINS = ['http://localhost:5173', 'http://localhost:3000'];

function getAllowedOrigins() {
    const fromEnv = (process.env.ALLOWED_ORIGINS || '')
        .split(',')
        .map((o) => o.trim())
        .filter(Boolean);

    if (process.env.NODE_ENV !== 'production') {
        return [...new Set([...fromEnv, ...DEV_ORIGINS])];
    }
    return fromEnv;
}

/**
 * Applies CORS headers based on the request origin.
 * @returns {boolean} true if the request was an OPTIONS preflight and has been ended.
 */
export function applyCors(req, res) {
    const allowed = getAllowedOrigins();
    const origin = req.headers.origin;

    if (origin && allowed.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Vary', 'Origin');
    } else if (allowed.length > 0) {
        // Default to the first configured origin so responses aren't wildcard-open.
        res.setHeader('Access-Control-Allow-Origin', allowed[0]);
        res.setHeader('Vary', 'Origin');
    }

    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
    res.setHeader('Access-Control-Max-Age', '3600');

    if (req.method === 'OPTIONS') {
        res.status(204).end();
        return true;
    }
    return false;
}
