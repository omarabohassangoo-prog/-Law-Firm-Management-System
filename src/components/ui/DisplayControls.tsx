import React, { useState } from 'react';
import { useAppStore, ROLES_CONFIG } from '../../store/appStore';
import { useTranslation } from '../../utils/translations';
import {
  Sun,
  Moon,
  Globe,
  Sliders,
  Type,
  Maximize2,
  Users2,
  ChevronDown,
  Layers,
} from 'lucide-react';
import { FontSize, Density, ZoomLevel, UserRole } from '../../types';

export const DisplayControls: React.FC = () => {
  const {
    locale,
    setLocale,
    theme,
    setTheme,
    fontSize,
    setFontSize,
    density,
    setDensity,
    zoomLevel,
    setZoomLevel,
    currentUser,
    switchRole,
  } = useAppStore();

  const t = useTranslation(locale);
  const [openDropdown, setOpenDropdown] = useState<'display' | 'roles' | null>(null);

  const toggleDropdown = (key: 'display' | 'roles') => {
    setOpenDropdown((prev) => (prev === key ? null : key));
  };

  return (
    <div className="flex items-center gap-1.5 shrink-0">
      {/* Quick Role Switcher (Essential for evaluating the 6 role dashboards) */}
      <div className="relative">
        <button
          onClick={() => toggleDropdown('roles')}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-300 hover:bg-amber-500/20 border border-amber-500/30 transition-colors whitespace-nowrap"
          title={t.switchRoleDemo}
          aria-expanded={openDropdown === 'roles'}
        >
          <Users2 className="w-3.5 h-3.5 shrink-0" />
          <span className="hidden sm:inline">
            {locale === 'ar'
              ? ROLES_CONFIG.find((r) => r.key === currentUser.role)?.labelAr
              : ROLES_CONFIG.find((r) => r.key === currentUser.role)?.labelEn}
          </span>
          <ChevronDown className="w-3 h-3 opacity-70" />
        </button>

        {openDropdown === 'roles' && (
          <div className="absolute end-0 mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl p-2 z-50 animate-in fade-in zoom-in-95">
            <div className="px-2.5 py-1.5 mb-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {t.switchRoleDemo}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              {ROLES_CONFIG.map((role) => {
                const isActive = currentUser.role === role.key;
                return (
                  <button
                    key={role.key}
                    onClick={() => {
                      switchRole(role.key as UserRole);
                      setOpenDropdown(null);
                    }}
                    className={`flex flex-col text-start p-2 rounded-lg text-xs transition-colors ${
                      isActive
                        ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-semibold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span className="font-medium">
                      {locale === 'ar' ? role.labelAr : role.labelEn}
                    </span>
                    <span className={`text-[10px] line-clamp-1 ${isActive ? 'text-slate-300 dark:text-slate-600' : 'text-slate-400'}`}>
                      {locale === 'ar' ? role.descriptionAr : role.descriptionEn}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Theme Toggle */}
      <button
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        title={theme === 'dark' ? t.light : t.dark}
        aria-label="Toggle color theme"
      >
        {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      </button>

      {/* Language Toggle */}
      <button
        onClick={() => setLocale(locale === 'ar' ? 'en' : 'ar')}
        className="flex items-center gap-1 px-2 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
        title={t.language}
        aria-label="Toggle language"
      >
        <Globe className="w-3.5 h-3.5" />
        <span className="uppercase text-[11px]">{locale === 'ar' ? 'EN' : 'عربي'}</span>
      </button>

      {/* Display Settings Dropdown (Font Size, Density, Zoom) */}
      <div className="relative">
        <button
          onClick={() => toggleDropdown('display')}
          className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={t.appearance}
          aria-expanded={openDropdown === 'display'}
        >
          <Sliders className="w-4 h-4" />
        </button>

        {openDropdown === 'display' && (
          <div className="absolute end-0 mt-2 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl p-3 z-50 animate-in fade-in zoom-in-95">
            <div className="text-xs font-bold text-slate-900 dark:text-slate-100 pb-2 mb-2 border-b border-slate-100 dark:border-slate-800 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5" />
              <span>{t.appearance}</span>
            </div>

            {/* Font Size Selector */}
            <div className="mb-3">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                <Type className="w-3.5 h-3.5" />
                <span>{t.fontSize}</span>
              </div>
              <div className="grid grid-cols-3 gap-1 p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg">
                {(['sm', 'md', 'lg'] as FontSize[]).map((size) => (
                  <button
                    key={size}
                    onClick={() => setFontSize(size)}
                    className={`py-1 text-xs rounded font-medium transition-colors ${
                      fontSize === size
                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    {size === 'sm' ? t.fontSmall : size === 'md' ? t.fontMedium : t.fontLarge}
                  </button>
                ))}
              </div>
            </div>

            {/* Density Selector */}
            <div className="mb-3">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                <Layers className="w-3.5 h-3.5" />
                <span>{t.density}</span>
              </div>
              <div className="grid grid-cols-3 gap-1 p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg">
                {(['compact', 'comfortable', 'spacious'] as Density[]).map((d) => (
                  <button
                    key={d}
                    onClick={() => setDensity(d)}
                    className={`py-1 text-[11px] rounded font-medium transition-colors ${
                      density === d
                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    {d === 'compact' ? t.densityCompact : d === 'comfortable' ? t.densityComfortable : t.densitySpacious}
                  </button>
                ))}
              </div>
            </div>

            {/* Zoom Level Selector */}
            <div>
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                <Maximize2 className="w-3.5 h-3.5" />
                <span>{t.zoom}</span>
              </div>
              <div className="grid grid-cols-4 gap-1 p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg">
                {([0.8, 1.0, 1.2, 1.5] as ZoomLevel[]).map((zoom) => (
                  <button
                    key={zoom}
                    onClick={() => setZoomLevel(zoom)}
                    className={`py-1 text-xs rounded font-medium tabular-nums transition-colors ${
                      zoomLevel === zoom
                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    {zoom}x
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
