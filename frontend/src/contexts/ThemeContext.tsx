// `src/contexts/ThemeContext.tsx`
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

type Theme = 'light' | 'dark';

const STORAGE_KEY = 'app_theme_v1';

type ThemeCtx = {
    theme: Theme;
    setTheme: (t: Theme) => void;
    toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeCtx | undefined>(undefined);

function isStorageAvailable(type: 'localStorage' | 'sessionStorage') {
  try {
    const storage = window[type];
    const testKey = '__storage_test__';
    storage.setItem(testKey, 'test');
    storage.removeItem(testKey);
    return true;
  } catch (e) {
    return false;
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const getInitial = (): Theme => {
        try {
            if (isStorageAvailable('localStorage')) {
                const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
                if (stored === 'light' || stored === 'dark') return stored;
            }
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
        } catch {
            /* ignore */
        }
        return 'light';
    };

    const [theme, setThemeState] = useState<Theme>(getInitial);

    useEffect(() => {
        try {
            if (isStorageAvailable('localStorage')) {
                localStorage.setItem(STORAGE_KEY, theme);
            }
        } catch {
            // ignore
        }
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    const setTheme = (t: Theme) => setThemeState(t);
    const toggleTheme = () => setThemeState((s) => (s === 'light' ? 'dark' : 'light'));

    const value = useMemo(() => ({ theme, setTheme, toggleTheme }), [theme]);

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeCtx {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
    return ctx;
}
