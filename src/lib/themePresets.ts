import type { FormTheme } from '../types/forms';

export const THEME_PRESETS: FormTheme[] = [
  {
    id: 'professional-white',
    label: 'Professional White',
    headerClass: 'bg-white',
    accentClass: 'text-zinc-900',
    isDark: false,
  },
  {
    id: 'light-purple',
    label: 'Soft Lavender',
    headerClass: 'bg-[#f5f3ff]',
    accentClass: 'text-[#6d28d9]',
    isDark: false,
  },
  {
    id: 'light-blue',
    label: 'Sky Professional',
    headerClass: 'bg-[#f0f9ff]',
    accentClass: 'text-[#0369a1]',
    isDark: false,
  },
  {
    id: 'light-green',
    label: 'Mint Minimal',
    headerClass: 'bg-[#f0fdf4]',
    accentClass: 'text-[#15803d]',
    isDark: false,
  },
  {
    id: 'light-slate',
    label: 'Slate Professional',
    headerClass: 'bg-[#f8fafc]',
    accentClass: 'text-[#334155]',
    isDark: false,
  }
];

export const getThemeById = (themeId?: string | null): FormTheme => {
  return THEME_PRESETS.find((preset) => preset.id === themeId) ?? THEME_PRESETS[0];
};
