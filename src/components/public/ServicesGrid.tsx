import React, { useEffect, useState } from 'react';
import { useAppStore } from '../../store/appStore';
import { useTranslation } from '../../utils/translations';
import { api } from '../../core/api/client';
import {
  Scale,
  Briefcase,
  ShieldCheck,
  Home,
  Users,
  FileText,
  MessageCircle,
  FolderOpen,
  ArrowUpRight,
} from 'lucide-react';

interface ServiceDto {
  id: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  icon: string;
  order: number;
  featured?: boolean;
}

interface ServicesGridProps {
  featuredOnly?: boolean;
  limit?: number;
  categoryFilter?: string;
  onSelectService?: (service: ServiceDto) => void;
}

export const ServicesGrid: React.FC<ServicesGridProps> = ({
  featuredOnly = false,
  limit = 100,
  categoryFilter,
  onSelectService,
}) => {
  const { locale, setCurrentView } = useAppStore();
  const t = useTranslation(locale);

  const [services, setServices] = useState<ServiceDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const url = featuredOnly
      ? `/api/public/services?featured=true&limit=${limit}`
      : `/api/public/services?limit=${limit}`;

    api
      .get<ServiceDto[]>(url, 10 * 60 * 1000)
      .then((data) => {
        if (mounted && Array.isArray(data)) {
          setServices(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.warn('Falling back to local services:', err);
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [featuredOnly, limit]);

  const getIcon = (iconName: string) => {
    switch (iconName.toLowerCase()) {
      case 'scale':
        return <Scale className="w-6 h-6" />;
      case 'briefcase':
        return <Briefcase className="w-6 h-6" />;
      case 'shield-check':
      case 'shieldcheck':
        return <ShieldCheck className="w-6 h-6" />;
      case 'home':
      case 'landplot':
        return <Home className="w-6 h-6" />;
      case 'users':
        return <Users className="w-6 h-6" />;
      case 'file-text':
      case 'scroll':
        return <FileText className="w-6 h-6" />;
      case 'message-circle':
        return <MessageCircle className="w-6 h-6" />;
      default:
        return <Scale className="w-6 h-6" />;
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-48 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        ))}
      </div>
    );
  }

  if (services.length === 0) {
    return (
      <div className="text-center py-12 text-slate-400">
        <FolderOpen className="w-10 h-10 mx-auto mb-2 opacity-50" />
        <p className="text-sm">{locale === 'ar' ? 'لا توجد خدمات حالياً' : 'No services available'}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {services.map((service) => (
        <div
          key={service.id}
          className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:border-slate-900 dark:hover:border-slate-400 flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 flex items-center justify-center mb-4 transition-colors group-hover:bg-slate-900 group-hover:text-amber-400 dark:group-hover:bg-amber-400 dark:group-hover:text-slate-950">
              {getIcon(service.icon)}
            </div>

            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-2">
              {locale === 'ar' ? service.titleAr : service.titleEn}
            </h3>

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
              {locale === 'ar' ? service.descriptionAr : service.descriptionEn}
            </p>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <button
              onClick={() => {
                if (onSelectService) {
                  onSelectService(service);
                } else {
                  setCurrentView('contact');
                }
              }}
              className="text-xs font-semibold text-slate-900 dark:text-slate-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 flex items-center gap-1 transition-colors"
            >
              <span>{locale === 'ar' ? 'اطلب استشارة' : 'Consult Counsel'}</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
