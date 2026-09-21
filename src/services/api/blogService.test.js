import { afterEach, describe, expect, it, vi } from 'vitest';
import { listPublishedPosts } from './blogService';

afterEach(() => {
    vi.unstubAllGlobals();
});

describe('blogService', () => {
    it('deduplicates identical post-list requests while they are in flight', async () => {
        const fetchMock = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ data: [{ id: 'one', slug: 'artigo' }] }),
        });
        vi.stubGlobal('fetch', fetchMock);

        const first = listPublishedPosts({ featured: true, limit: 3 });
        const second = listPublishedPosts({ featured: true, limit: 3 });

        await expect(Promise.all([first, second])).resolves.toEqual([
            [{ id: 'one', slug: 'artigo' }],
            [{ id: 'one', slug: 'artigo' }],
        ]);
        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(fetchMock).toHaveBeenCalledWith('/api/blog-posts?featured=true&limit=3');
    });
});
