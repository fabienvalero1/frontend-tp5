// `src/components/ThemeToggle.tsx`
import React, {JSX} from 'react';
import { useTheme } from '../contexts/ThemeContext';

export default function ThemeToggle(): JSX.Element {
    const { theme, toggleTheme } = useTheme();
    return (
        <button onClick={toggleTheme} aria-label="Toggle theme" style={{ padding: '6px 10px' }}>
            {theme === 'light' ? 'Passer en sombre 🌙' : 'Passer en clair ☀️'}
        </button>
    );
}
