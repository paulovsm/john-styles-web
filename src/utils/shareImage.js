/**
 * Shares an image via the Web Share API (with files) when available, otherwise
 * falls back to downloading it. Works with data URLs or remote URLs.
 *
 * @returns {Promise<'shared'|'downloaded'|'cancelled'>}
 */
export async function shareOrDownloadImage(src, filename = 'john-styles-look.png') {
    const res = await fetch(src);
    const blob = await res.blob();
    const file = new File([blob], filename, { type: blob.type || 'image/png' });

    try {
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({ files: [file], title: 'John Styles' });
            return 'shared';
        }
    } catch (e) {
        if (e?.name === 'AbortError') return 'cancelled';
        // Share failed for another reason — fall through to download.
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    return 'downloaded';
}
