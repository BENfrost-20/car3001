'use strict';

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const {root,site,url,pages,priceLabel,servicePath,faqItems,escape} = require('./lib/site');
const {layout} = require('../src/templates/site');

function write(file, value) {
  fs.mkdirSync(path.dirname(file), {recursive:true});
  fs.writeFileSync(file,value);
}

function markdown(page) {
  const lines = [`# ${page.service ? page.service.name : page.label === 'Home' ? site.name : page.label}`, '', page.summary, '', `Fonte: ${url(page.path)}`, ''];
  if (page.service) lines.push('## Cosa comprende il servizio','',page.service.detailSummary,'',...page.service.details.map(detail=>`- ${detail}`),'','## Preventivo','',priceLabel(page.service),...(site.pricing.enabled ? ['',page.service.priceScope,site.pricing.note] : []),'');
  if (page.kind === 'home' || page.kind === 'services') {
    lines.push('## Servizi','');
    for (const service of site.services) lines.push(`### [${service.name}](${url(servicePath(service))})`,'',service.summary,'',priceLabel(service),'');
    lines.push('| Servizio | Intervento | Preventivo |','| --- | --- | --- |',...site.services.map(service=>`| [${service.name}](${url(servicePath(service))}) | ${service.priceScope} | ${priceLabel(service)} |`),'');
    if (site.pricing.enabled) lines.push(site.pricing.note,'');
  }
  if (page.kind === 'faq') for (const item of faqItems()) lines.push(`## ${item.question}`,'',item.answer,'');
  if (page.kind === 'home' || page.kind === 'about') lines.push('## Prodotti e collaborazioni','',`Marchi dei prodotti: ${site.productBrands.join(', ')}.`,`Partner assicurativi indicati: ${site.insurancePartners.join(', ')}. Verifica direttamente con la carrozzeria la gestione del tuo caso.`,'');
  lines.push('## Contatti','',`${site.name}: ${site.address.streetAddress}, ${site.address.postalCode} ${site.address.addressLocality} (${site.address.addressRegion}), Italia.`,`Telefono: [${site.telephoneLabel}](tel:${site.telephone}).`,`Email: [${site.email}](mailto:${site.email}).`,'');
  return lines.join('\n');
}

function llms(routes) {
  return `# ${site.name}

> ${site.summary}

Sede: ${site.address.streetAddress}, ${site.address.postalCode} ${site.address.addressLocality} (${site.address.addressRegion}), Italia.
Telefono: ${site.telephoneLabel}. Email: ${site.email}.
Marchi dei prodotti indicati: ${site.productBrands.join(', ')}. Partner assicurativi indicati: ${site.insurancePartners.join(', ')}.
${site.pricing.enabled ? site.pricing.note : 'I prezzi non sono pubblicati: richiedere un preventivo alla carrozzeria.'}
Le risorse seguenti sono versioni Markdown delle pagine pubbliche, generate dagli stessi dati del sito.

## Pagine principali

${routes.filter(page=>page.kind!=='service').map(page=>`- [${page.label === 'Home' ? site.name : page.label}](${url(`${page.path}index.md`)}): ${page.description}`).join('\n')}

## Servizi

${site.services.map(service=>`- [${service.name}](${url(`${servicePath(service)}index.md`)}): ${service.description}`).join('\n')}

## Optional

- [Contenuto completo in un file](${url('/llms-full.txt')}): raccolta delle versioni Markdown delle pagine.
- [Mappa del sito](${url('/sitemap.xml')}): indice degli URL HTML canonici.
`;
}

const routes = pages();
const historyPath = path.join(root,'seo/page-history.json');
const previous = fs.existsSync(historyPath) ? JSON.parse(fs.readFileSync(historyPath,'utf8')) : {};
const history = {};
const rendered = new Map();
for (const page of routes) {
  if (page.title.length > 60 || page.description.length < 140 || page.description.length > 155) {
    throw new Error(`${page.path}: title ${page.title.length}/60, description ${page.description.length}/140–155`);
  }
  // Ignore generated dateModified: rebuilding unchanged content must not advance lastmod.
  const html = layout(page,'');
  const assetHash = crypto.createHash('sha256');
  for (const match of html.matchAll(/(?:src|content)="(\/?assets\/img\/[^\"]+|https:[^\"]+\/assets\/img\/[^\"]+)"/g)) {
    const assetPath = new URL(match[1],site.url).pathname;
    assetHash.update(fs.readFileSync(path.join(root,'public',assetPath)));
  }
  const fingerprint = crypto.createHash('sha256').update(html).update(assetHash.digest()).digest('hex');
  const prior = previous[page.path];
  const lastmod = prior?.hash === fingerprint ? prior.lastmod : new Date().toISOString();
  history[page.path] = {hash:fingerprint,lastmod};
  rendered.set(page.path,layout(page,lastmod));
}

const publicPath = path.join(root,'public');
write(path.join(publicPath,'robots.txt'),`# Regole comuni per tutti i crawler, inclusi ricerca e AI.
User-agent: *
User-agent: Googlebot
User-agent: Bingbot
User-agent: GPTBot
User-agent: OAI-SearchBot
User-agent: ChatGPT-User
User-agent: PerplexityBot
User-agent: Perplexity-User
User-agent: ClaudeBot
User-agent: Claude-SearchBot
User-agent: Claude-User
User-agent: CCBot
User-agent: Google-Extended
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /private/

Sitemap: ${url('/sitemap.xml')}
`);
write(path.join(publicPath,'llms.txt'),llms(routes));
write(path.join(publicPath,'llms-full.txt'),routes.map(markdown).join('\n\n---\n\n'));

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes.map(page=>`  <url><loc>${escape(url(page.path))}</loc><lastmod>${history[page.path].lastmod}</lastmod><priority>${page.priority}</priority></url>`).join('\n')}
</urlset>
`;

// public/ is the source for static files; both deployment outputs are disposable.
for (const directory of ['dist','docs']) {
  const out = path.join(root,directory);
  fs.rmSync(out,{recursive:true,force:true});
  fs.cpSync(publicPath,out,{recursive:true});
  fs.cpSync(path.join(root,'src/css'),path.join(out,'css'),{recursive:true});
  fs.cpSync(path.join(root,'src/js'),path.join(out,'js'),{recursive:true});
  for (const page of routes) {
    const dir = path.join(out,page.path);
    write(path.join(dir,'index.html'),rendered.get(page.path));
    write(path.join(dir,'index.md'),markdown(page));
  }
  write(path.join(out,'sitemap.xml'),sitemap);
}
write(historyPath,JSON.stringify(history,null,2)+'\n');
for (const [name,page] of [['home',routes[0]],['service',routes.find(page=>page.service)],['faq',routes.find(page=>page.kind==='faq')]]) {
  const jsonld = JSON.parse(rendered.get(page.path).match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1]);
  write(path.join(root,`seo/examples/${name}.json`),JSON.stringify(jsonld,null,2)+'\n');
}
console.log(`Generate ${routes.length} pagine statiche in docs/ e dist/.`);
