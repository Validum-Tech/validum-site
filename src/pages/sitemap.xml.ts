// Карта сайта: список маршрутов ведётся здесь, чтобы не тянуть интеграцию.
import type { APIRoute } from 'astro';

const ROUTES: Array<{ path: string; priority: string; changefreq: string }> = [
  { path: '/', priority: '1.0', changefreq: 'weekly' },
  { path: '/docs/', priority: '0.9', changefreq: 'weekly' },
  { path: '/tools/', priority: '0.9', changefreq: 'monthly' },
  { path: '/tools/anatomy/', priority: '0.7', changefreq: 'monthly' },
  { path: '/tools/check/', priority: '0.8', changefreq: 'monthly' },
  { path: '/tools/build/', priority: '0.8', changefreq: 'monthly' },
  { path: '/tools/pipeline/', priority: '0.6', changefreq: 'monthly' },
  { path: '/architecture/', priority: '0.7', changefreq: 'monthly' },
  { path: '/roadmap/', priority: '0.5', changefreq: 'monthly' },
  { path: '/changelog/', priority: '0.6', changefreq: 'weekly' },
  { path: '/security/', priority: '0.4', changefreq: 'yearly' },
];

const SITE = 'https://validum.tech';

export const GET: APIRoute = () => {
  const today = new Date().toISOString().slice(0, 10);
  const urls = ROUTES.map(
    (r) =>
      `  <url>\n    <loc>${SITE}${r.path}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${r.changefreq}</changefreq>\n    <priority>${r.priority}</priority>\n  </url>`,
  ).join('\n');

  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;

  return new Response(body, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
