'use strict';

const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const {root,site,url,sitePath,relativeSitePath,pages,faqItems,escape} = require('./lib/site');

function check(output = path.join(root,'docs')) {
  const routes = pages();
  const titles = new Set();
  const descriptions = new Set();
  const canonicals = new Set();
  const htmlByPath = new Map(routes.map(page=>[page.path,fs.readFileSync(path.join(output,page.path,'index.html'),'utf8')]));
  let links = 0;
  for (const page of routes) {
    const html = htmlByPath.get(page.path);
    assert.match(html,/<html lang="it">/);
    assert.equal((html.match(/<main\b/g)||[]).length,1,`${page.path}: main`);
    assert.equal((html.match(/<h1\b/g)||[]).length,1,`${page.path}: h1`);
    let previous = 0;
    for (const match of html.matchAll(/<h([1-6])\b/g)) {
      const level = Number(match[1]);
      assert.ok(level<=previous+1,`${page.path}: salto di heading ${previous} -> ${level}`);
      previous=level;
    }
    const title = html.match(/<title>(.*?)<\/title>/s)?.[1];
    const description = html.match(/<meta name="description" content="([^"]+)">/)?.[1];
    const canonical = html.match(/<link rel="canonical" href="([^"]+)">/)?.[1];
    assert.equal(title,escape(page.title));
    assert.ok(page.title.length<=60);
    assert.equal(description,escape(page.description));
    assert.ok(page.description.length>=140 && page.description.length<=155);
    assert.equal(canonical,url(page.path));
    assert.ok(!titles.has(title) && !descriptions.has(description) && !canonicals.has(canonical),`${page.path}: metadati duplicati`);
    titles.add(title); descriptions.add(description); canonicals.add(canonical);
    for (const key of ['title','description','image','url','type']) assert.match(html,new RegExp(`<meta property="og:${key}" content="[^\"]+">`));
    for (const key of ['card','title','description','image']) assert.match(html,new RegExp(`<meta name="twitter:${key}" content="[^\"]+">`));
    assert.ok(!/NOME_PROFILO|NOME_PAGINA|Lorem ipsum|onerror=|\{\{/.test(html));
    const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match=>match[1]);
    assert.equal(ids.length,new Set(ids).size,`${page.path}: ID duplicati`);
    for (const match of html.matchAll(/<img\b([^>]+)>/g)) {
      for (const attr of ['alt','width','height']) assert.match(match[1],new RegExp(`\\b${attr}="[^\"]+"`));
      assert.match(match[1],/src="[^\"]+\.webp"/);
      assert.match(match[1],/loading="(?:lazy|eager)"/);
    }
    for (const match of html.matchAll(/\b(?:src|href)="([^"]+)"/g)) {
      const target = new URL(match[1].replace(/&amp;/g,'&'),url(page.path));
      if (target.origin!==new URL(site.url).origin) continue;
      links++;
      const localPath = relativeSitePath(target.pathname);
      const targetFile = path.join(output,localPath,localPath.endsWith('/')?'index.html':'');
      assert.ok(fs.existsSync(targetFile),`${page.path}: collegamento locale mancante ${target.href}`);
      if (target.hash) {
        const targetHtml = fs.readFileSync(targetFile,'utf8');
        assert.ok(targetHtml.includes(`id="${decodeURIComponent(target.hash.slice(1))}"`),`${page.path}: frammento mancante ${target.href}`);
      }
    }
    for (const match of html.matchAll(/\bsrcset="([^"]+)"/g)) for (const candidate of match[1].split(',')) {
      const pathname = new URL(candidate.trim().split(/\s+/)[0],url(page.path)).pathname;
      assert.ok(fs.existsSync(path.join(output,relativeSitePath(pathname))));
    }
    const ld = JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1]);
    assert.equal(ld['@context'],'https://schema.org');
    const business = ld['@graph'].find(node=>Array.isArray(node['@type']) && node['@type'].includes('AutoBodyShop'));
    assert.equal(business.telephone,site.telephone);
    assert.equal(business.address.streetAddress,site.address.streetAddress);
    assert.deepEqual(business.sameAs,site.socialProfiles.length?site.socialProfiles.map(profile=>profile.url):undefined);
    assert.ok(!JSON.stringify(ld).includes('AggregateRating'));
    if (!site.pricing.enabled) assert.ok(!JSON.stringify(ld).includes('PriceSpecification'));
    if (page.path!=='/') {
      const crumb = ld['@graph'].find(node=>node['@type']==='BreadcrumbList');
      assert.deepEqual(crumb.itemListElement.map(item=>item.item),page.crumbs.map(item=>url(item.path)));
    }
    if (page.kind==='faq') {
      const faq = ld['@graph'].find(node=>node['@type']==='FAQPage');
      assert.equal(faq.mainEntity.length,faqItems().length);
      for (const question of faq.mainEntity) {
        assert.ok(html.includes(escape(question.name)));
        assert.ok(html.includes(escape(question.acceptedAnswer.text)));
      }
    }
    const md = fs.readFileSync(path.join(output,page.path,'index.md'),'utf8');
    assert.ok(md.includes(page.summary));
    assert.ok(md.includes(`Fonte: ${canonical}`));
  }
  const sitemap = fs.readFileSync(path.join(output,'sitemap.xml'),'utf8');
  assert.match(sitemap,/^<\?xml version="1.0" encoding="UTF-8"\?>\n<urlset xmlns="http:\/\/www.sitemaps.org\/schemas\/sitemap\/0.9">/);
  const locations = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(match=>match[1]);
  assert.deepEqual(locations,routes.map(page=>url(page.path)));
  for (const match of sitemap.matchAll(/<lastmod>(.*?)<\/lastmod>/g)) assert.ok(Number.isFinite(Date.parse(match[1])) && Date.parse(match[1])<=Date.now());
  const robots = fs.readFileSync(path.join(output,'robots.txt'),'utf8');
  for (const bot of ['*','Googlebot','Bingbot','GPTBot','OAI-SearchBot','PerplexityBot','ClaudeBot','CCBot']) assert.ok(robots.includes(`User-agent: ${bot}\n`));
  for (const blocked of ['/api/','/admin/','/private/']) assert.ok(robots.includes(`Disallow: ${sitePath(blocked)}\n`));
  assert.ok(robots.includes(`Sitemap: ${url('/sitemap.xml')}`));
  const llms = fs.readFileSync(path.join(output,'llms.txt'),'utf8');
  assert.ok(llms.startsWith(`# ${site.name}\n\n> `));
  for (const match of llms.matchAll(/\]\((https:[^)]+)\)/g)) {
    const target = new URL(match[1]);
    assert.ok(fs.existsSync(path.join(output,relativeSitePath(target.pathname))));
  }
  for (const file of ['styles.css','seo.css']) {
    const cssPath = path.join(output,'css',file);
    for (const match of fs.readFileSync(cssPath,'utf8').matchAll(/url\(["']?([^\)"']+)["']?\)/g)) {
      if (/^(data:|https?:)/.test(match[1])) continue;
      assert.ok(fs.existsSync(path.resolve(path.dirname(cssPath),match[1])),`Asset CSS mancante: ${match[1]}`);
    }
  }
  console.log(`Verificate ${routes.length} pagine e ${links} riferimenti locali: metadati, heading, immagini, JSON-LD, FAQ, sitemap, robots e Markdown.`);
}

if (require.main===module) check();
module.exports = check;
