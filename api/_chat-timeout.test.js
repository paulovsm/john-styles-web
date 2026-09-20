import { readFileSync } from 'fs';
import { join } from 'path';
import { describe, expect, it } from 'vitest';

/**
 * The chat proxy waits on the n8n agent, so two ceilings apply: its own
 * AbortSignal and the platform's `maxDuration`. If the app's budget is the
 * larger of the two, the platform kills the invocation first and the user gets
 * an opaque 504 rather than the CHAT_TIMEOUT the proxy would have returned —
 * which is exactly how a 94s agent came to look like a connection failure.
 *
 * Read as source rather than imported: importing api/chat.js pulls in the
 * Firebase Admin graph, which needs credentials CI does not have.
 */
const root = join(import.meta.dirname, '..');
const readTimeoutMs = () => {
    const source = readFileSync(join(root, 'api/chat.js'), 'utf8');
    const match = source.match(/const N8N_TIMEOUT_MS = (\d+);/);
    if (!match) throw new Error('N8N_TIMEOUT_MS not found in api/chat.js');
    return Number(match[1]);
};

const readMaxDurationSeconds = () => {
    const { functions } = JSON.parse(readFileSync(join(root, 'vercel.json'), 'utf8'));
    // Vercel resolves these in declaration order, so the first matching pattern
    // is the one that applies to the route.
    const entry = Object.entries(functions).find(([pattern]) =>
        pattern === 'api/chat.js' || pattern === 'api/*.js');
    if (!entry) throw new Error('No vercel.json functions entry matches api/chat.js');
    return { pattern: entry[0], maxDuration: entry[1].maxDuration };
};

describe('chat timeout budget', () => {
    it('keeps the proxy budget under the platform ceiling', () => {
        const { maxDuration } = readMaxDurationSeconds();
        expect(readTimeoutMs()).toBeLessThan(maxDuration * 1000);
    });

    // A styling question with wardrobe context measured 94s. A ceiling that does
    // not clear that comfortably puts us back where we started.
    it('leaves room for the slowest agent response we have measured', () => {
        expect(readTimeoutMs()).toBeGreaterThanOrEqual(120000);
    });

    it('is governed by the chat-specific entry, which must precede the glob', () => {
        const { pattern } = readMaxDurationSeconds();
        expect(pattern).toBe('api/chat.js');
    });
});
