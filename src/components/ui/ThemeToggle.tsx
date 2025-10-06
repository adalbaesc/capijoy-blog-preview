"use client";

import {useTheme} from 'next-themes';
import {useEffect, useState} from 'react';

const OPTIONS = [
  {value: 'light', label: 'Claro'},
  {value: 'dark', label: 'Escuro'},
  {value: 'system', label: 'Sistema'}
] as const;

export function ThemeToggle() {
  const {theme, setTheme} = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const current = mounted ? theme ?? 'system' : 'system';

  return (
    <select
      value={current}
      onChange={event => setTheme(event.target.value)}
      className="rounded-md border px-2 py-1 text-sm bg-transparent"
      aria-label="Tema"
      disabled={!mounted}
    >
      {OPTIONS.map(option => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
