'use client';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useSyncExternalStore } from 'react';
export function ThemeToggle() { const { theme, setTheme } = useTheme(); const mounted = useSyncExternalStore(() => () => {}, () => true, () => false); return <button type="button" aria-label="Toggle color theme" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="flex size-11 items-center justify-center rounded-xl border border-line text-ink transition hover:border-forest">{mounted && theme === 'dark' ? <Sun size={18}/> : <Moon size={18}/>}</button>; }
