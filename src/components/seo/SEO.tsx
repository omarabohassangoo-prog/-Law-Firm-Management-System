import React, { useEffect } from 'react';

interface SEOProps {
  title: string;
  description: string;
  keywords?: string[];
  ogImage?: string;
  structuredData?: Record<string, any>;
}

export const SEO: React.FC<SEOProps> = ({
  title,
  description,
  keywords,
  ogImage = '/src/assets/images/hero_law_firm_1794062333662.jpg',
  structuredData,
}) => {
  useEffect(() => {
    // Update document title
    document.title = title;

    // Update meta tags
    const updateMeta = (name: string, content: string, isProperty = false) => {
      let meta = document.querySelector(isProperty ? `meta[property="${name}"]` : `meta[name="${name}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        if (isProperty) {
          meta.setAttribute('property', name);
        } else {
          meta.setAttribute('name', name);
        }
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    updateMeta('description', description);
    updateMeta('og:title', title, true);
    updateMeta('og:description', description, true);
    updateMeta('og:image', ogImage, true);
    updateMeta('twitter:title', title);
    updateMeta('twitter:description', description);
    updateMeta('twitter:image', ogImage);

    if (keywords && keywords.length > 0) {
      updateMeta('keywords', keywords.join(', '));
    }

    // Structured Data (JSON-LD)
    if (structuredData) {
      let script = document.querySelector('#seo-json-ld') as HTMLScriptElement | null;
      if (!script) {
        script = document.createElement('script');
        script.id = 'seo-json-ld';
        script.type = 'application/ld+json';
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(structuredData);
    }
  }, [title, description, keywords, ogImage, structuredData]);

  return null;
};
