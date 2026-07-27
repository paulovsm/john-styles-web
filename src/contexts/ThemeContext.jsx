import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

const ThemeContext = createContext();

export function useTheme() {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
    return ctx;
}

function getInitialTheme() {
    try {
        const saved = localStorage.getItem('theme');
        if (saved === 'light' || saved === 'dark') return saved;
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } catch {
        return 'light';
    }
}

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState(getInitialTheme);

    useEffect(() => {
        const root = document.documentElement;
        root.classList.toggle('dark', theme === 'dark');
    }, [theme]);

    // Follow the OS preference until the user makes an explicit choice.
    useEffect(() => {
        const mq = window.matchMedia('(prefers-color-scheme: dark)');
        const onChange = (e) => {
            if (!localStorage.getItem('theme')) setTheme(e.matches ? 'dark' : 'light');
        };
        mq.addEventListener?.('change', onChange);
        return () => mq.removeEventListener?.('change', onChange);
    }, []);

    const toggleTheme = useCallback(() => {
        setTheme((prev) => {
            const next = prev === 'dark' ? 'light' : 'dark';
            try { localStorage.setItem('theme', next); } catch { /* no-op */ }
            return next;
        });
    }, []);

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}
