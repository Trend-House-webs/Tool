import { useEffect } from 'react';
import { FAQItem } from '../../types';
import { SITE_URL, getCanonicalUrl, DEFAULT_OG_IMAGE } from '../../config/site';

export interface SEOProps {
  title: string;
  description: string;
  canonicalPath: string;
  ogType?: 'website' | 'article';
  ogImage?: string;
  noindex?: boolean;
  schema?: Record<string, any> | Array<Record<string, any>>;
  faqItems?: FAQItem[];
}

export function SEO({
  title,
  description,
  canonicalPath,
  ogType = 'website',
  ogImage,
  noindex = false,
  schema,
  faqItems,
}: SEOProps) {
  useEffect(() => {
    // 1. Document title
    document.title = title;

    // Helper to set or create meta tag
    const setMeta = (attrName: string, attrVal: string, content: string) => {
      let el = document.querySelector(`meta[${attrName}="${attrVal}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attrName, attrVal);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    // Helper to set or create link tag
    const setLink = (rel: string, href: string) => {
      let el = document.querySelector(`link[rel="${rel}"]`);
      if (!el) {
        el = document.createElement('link');
        el.setAttribute('rel', rel);
        document.head.appendChild(el);
      }
      el.setAttribute('href', href);
    };

    const canonicalUrl = getCanonicalUrl(canonicalPath);
    const socialImage = ogImage || DEFAULT_OG_IMAGE;

    // 2. Primary Meta & Canonical Tags
    setMeta('name', 'description', description);
    setLink('canonical', canonicalUrl);

    // Robots indexing control
    if (noindex) {
      setMeta('name', 'robots', 'noindex, nofollow');
    } else {
      const robotsEl = document.querySelector('meta[name="robots"]');
      if (robotsEl) {
        robotsEl.remove();
      }
    }

    // 3. Open Graph Tags
    setMeta('property', 'og:site_name', 'ToolNest');
    setMeta('property', 'og:title', title);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:type', ogType);
    setMeta('property', 'og:url', canonicalUrl);
    setMeta('property', 'og:image', socialImage);

    // 4. Twitter Card Tags
    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:title', title);
    setMeta('name', 'twitter:description', description);
    setMeta('name', 'twitter:image', socialImage);

    // 5. Schema.org Structured Data
    const schemas: Array<Record<string, any>> = [];

    if (schema) {
      if (Array.isArray(schema)) {
        schemas.push(...schema);
      } else {
        schemas.push(schema);
      }
    }

    // Add FAQPage schema if matching visible FAQ items exist
    if (faqItems && faqItems.length > 0) {
      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqItems.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: item.answer,
          },
        })),
      });
    }

    // Upsert Schema script tag
    let scriptTag = document.getElementById('seo-structured-data') as HTMLScriptElement | null;
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = 'seo-structured-data';
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }

    if (schemas.length > 0) {
      if (schemas.length === 1) {
        scriptTag.textContent = JSON.stringify(schemas[0], null, 2);
      } else {
        const cleanSchemas = schemas.map((s) => {
          const { '@context': _, ...rest } = s;
          return rest;
        });
        scriptTag.textContent = JSON.stringify(
          { '@context': 'https://schema.org', '@graph': cleanSchemas },
          null,
          2
        );
      }
    } else {
      scriptTag.textContent = '';
    }

    return () => {
      // Clean up script content on unmount
      if (scriptTag) {
        scriptTag.textContent = '';
      }
      if (noindex) {
        const robotsEl = document.querySelector('meta[name="robots"]');
        if (robotsEl) {
          robotsEl.remove();
        }
      }
    };
  }, [title, description, canonicalPath, ogType, ogImage, noindex, schema, faqItems]);

  return null;
}
