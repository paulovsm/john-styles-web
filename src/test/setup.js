import '@testing-library/jest-dom';

// jsdom ships no ResizeObserver, so any component that measures its own layout
// (the dashboard carousels) would throw on render. Minimal stand-in: it records
// the callback without ever firing, which leaves components at their initial
// measurement — tests that need a resize can drive it themselves.
if (typeof globalThis.ResizeObserver === 'undefined') {
    globalThis.ResizeObserver = class ResizeObserver {
        constructor(callback) {
            this.callback = callback;
        }
        observe() {}
        unobserve() {}
        disconnect() {}
    };
}
