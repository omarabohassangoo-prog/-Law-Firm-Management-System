import React, { useEffect, useState } from 'react';
import { useAppStore } from '../../store/appStore';
import { api } from '../../core/api/client';
import { Calendar, Scale, Users, Award } from 'lucide-react';

interface StatsData {
  yearsExperience: number;
  closedCases: number;
  totalClients: number;
  lawyersCount: number;
}

export const StatsBar: React.FC = () => {
  const { locale } = useAppStore();
  const [stats, setStats] = useState<StatsData>({
    yearsExperience: 20,
    closedCases: 500,
    totalClients: 200,
    lawyersCount: 15,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    api
      .get<StatsData>('/api/public/stats', 5 * 60 * 1000)
      .then((data) => {
        if (mounted && data) {
          setStats(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.warn('Using default public stats:', err);
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const items = [
    {
      key: 'years_experience',
      value: `${stats.yearsExperience}+`,
      labelAr: 'سنة خبرة معتمدة',
      labelEn: 'Years of Experience',
      icon: Calendar,
    },
    {
      key: 'closed_cases',
      value: `${stats.closedCases}+`,
      labelAr: 'قضية ناجحة ومنجزة',
      labelEn: 'Resolved Cases',
      icon: Scale,
    },
    {
      key: 'total_clients',
      value: `${stats.totalClients}+`,
      labelAr: 'عميل وشركة راضية',
      labelEn: 'Corporate & Private Clients',
      icon: Users,
    },
    {
      key: 'lawyers_count',
      value: `${stats.lawyersCount}+`,
      labelAr: 'محامٍ ومستشار مرخص',
      labelEn: 'Licensed Legal Counsel',
      icon: Award,
    },
  ];

  return (
    <section className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-8 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center divide-y lg:divide-y-0 lg:divide-x lg:rtl:divide-x-reverse divide-slate-100 dark:divide-slate-800">
          {items.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={item.key} className={`${idx > 0 ? 'pt-4 lg:pt-0' : ''}`}>
                <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center mx-auto mb-2">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-slate-100 font-mono tabular-nums">
                  {item.value}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                  {locale === 'ar' ? item.labelAr : item.labelEn}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
