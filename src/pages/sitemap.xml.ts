import { readdirSync } from 'node:fs';
import { heroes } from '../lib/heroes.mjs';
import { campaignEvents } from '../lib/campaign-events';
import { machines } from '../lib/machines.mjs';
export function GET() {
  const files = readdirSync('src/pages', { recursive: true, encoding: 'utf8' });
  const staticPaths = files.filter(file => file.endsWith('.astro') && !file.includes('[')).map(file => '/' + file.replace(/(?:^|\/)index\.astro$/, '/').replace(/\.astro$/, '/').replace(/^\//, ''));
  const paths = [...new Set([...staticPaths, ...heroes.map(hero => `/heroes/${hero.slug}/`), ...campaignEvents.map(guide => `/campaign-event/${guide.slug}/`), ...machines.map(machine => `/incursion-mow/${machine.slug}/`)])].sort();
  const escape = (text: string) => text.replace(/&/g,'&amp;').replace(/</g,'&lt;');
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${paths.map(path => `<url><loc>${escape('https://terminusmaximus.com'+path)}</loc></url>`).join('')}</urlset>`, {headers:{'Content-Type':'application/xml'}});
}
