import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config(); // Fallback to .env

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' })); // Support large payloads (images)

// Helper to wrap Vercel-style handlers for Express
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

// Import handlers dynamically
const apiDir = join(dirname(fileURLToPath(import.meta.url)), 'api');

// Register routes
// We manually register known endpoints to ensure correct mapping
import chatHandler from './api/gemini-chat.js';
import analyzeHandler from './api/gemini-image-analyze.js';
import generateHandler from './api/gemini-image-generate.js';
import profileAnalyzeHandler from './api/gemini-profile-analyze.js';

app.all('/api/gemini-chat', wrapHandler(chatHandler));
app.all('/api/gemini-image-analyze', wrapHandler(analyzeHandler));
app.all('/api/gemini-image-generate', wrapHandler(generateHandler));
app.all('/api/gemini-profile-analyze', wrapHandler(profileAnalyzeHandler));

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
