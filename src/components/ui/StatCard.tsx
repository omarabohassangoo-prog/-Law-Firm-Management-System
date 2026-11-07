import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 transition-all ${
        onClick ? 'cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-2xs' : ''
      }`}
    >
      <div className="flex items-center justify-between gap-4 mb-3">
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
          {title}
        </span>
        <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 shrink-0">
          <Icon className="w-4 h-4" />
        </div>
      </div>
      
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 tabular-nums">
          {value}
        </span>
        {trend && (
          <span
            className={`text-xs font-medium tabular-nums ${
              trend.isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {trend.value}
          </span>
        )}
      </div>

      {subtitle && (
        <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          {subtitle}
        </div>
      )}
    </div>
  );
};
