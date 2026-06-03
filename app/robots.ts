import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/profile/', '/checkout/', '/auth/'], 
    },
    sitemap: 'https://vintagehousekupwara.com/sitemap.xml',
  };
}