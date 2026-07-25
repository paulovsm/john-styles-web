import express from 'express';
import dotenv from 'dotenv';
import { fileURLToPath, pathToFileURL } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config(); // Fallback to .env

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' })); // Support large payloads (images)

// Wrap Vercel-style handlers so uncaught errors return JSON instead of hanging.
const wrapHandler = (handler) => async (req, res) => {
    try {
        await handler(req, res);
    } catch (error) {
        console.error('API Handler Error:', error);
        if (!res.headersSent) {
            res.status(500).json({ error: 'Internal Server Error', details: error.message });
        }
    }
};

// Dynamically register every api/*.js file as /api/<name>, mirroring Vercel's
// file-based routing. Files prefixed with `_` are shared helpers, not routes.
const apiDir = join(dirname(fileURLToPath(import.meta.url)), 'api');

async function registerRoutes() {
    const files = fs
        .readdirSync(apiDir)
        .filter((f) => f.endsWith('.js') && !f.startsWith('_'));

    for (const file of files) {
        const route = `/api/${file.replace(/\.js$/, '')}`;
        const mod = await import(pathToFileURL(join(apiDir, file)).href);
        const handler = mod.default;
        if (typeof handler === 'function') {
            app.all(route, wrapHandler(handler));
            console.log(`Registered ${route}`);
        }
    }
}

registerRoutes().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
});
