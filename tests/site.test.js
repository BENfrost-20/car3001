'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const {execFileSync} = require('node:child_process');
const root = path.resolve(__dirname,'..');

function fixture(t) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(),'car3001-test-'));
  fs.cpSync(root,directory,{recursive:true,filter:source=>!['.git','node_modules','dist','docs'].includes(path.relative(root,source).split(path.sep)[0])});
  t.after(()=>fs.rmSync(directory,{recursive:true,force:true}));
  return directory;
}
const run = (directory,script,environment={}) => execFileSync(process.execPath,[script],{cwd:directory,encoding:'utf8',env:{...process.env,SITE_URL:'',...environment},stdio:['ignore','pipe','pipe']});
function update(directory,modify) {
  const file = path.join(directory,'src/data/site.json');
  const data = JSON.parse(fs.readFileSync(file,'utf8'));
  modify(data);
  fs.writeFileSync(file,JSON.stringify(data,null,2));
}
function graph(directory,route) {
  return JSON.parse(fs.readFileSync(path.join(directory,'docs',route,'index.html'),'utf8').match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1]);
}

test('Le build senza modifiche conservano lastmod e producono output identico',t=>{
  const directory = fixture(t);
  run(directory,'scripts/build.js');
  const initialHistory = fs.readFileSync(path.join(directory,'seo/page-history.json'),'utf8');
  const initialSitemap = fs.readFileSync(path.join(directory,'docs/sitemap.xml'),'utf8');
  const initialHome = fs.readFileSync(path.join(directory,'docs/index.html'),'utf8');
  run(directory,'scripts/build.js');
  assert.equal(fs.readFileSync(path.join(directory,'seo/page-history.json'),'utf8'),initialHistory);
  assert.equal(fs.readFileSync(path.join(directory,'docs/sitemap.xml'),'utf8'),initialSitemap);
  assert.equal(fs.readFileSync(path.join(directory,'dist/index.html'),'utf8'),initialHome);
  update(directory,data=>{data.services[0].details.push('Intervento concordato con il cliente.');});
  run(directory,'scripts/build.js');
  const before = JSON.parse(initialHistory);
  const after = JSON.parse(fs.readFileSync(path.join(directory,'seo/page-history.json'),'utf8'));
  assert.notEqual(after['/servizi/cambio-gomme-cerchi/'].hash,before['/servizi/cambio-gomme-cerchi/'].hash);
  assert.notEqual(after['/servizi/cambio-gomme-cerchi/'].lastmod,before['/servizi/cambio-gomme-cerchi/'].lastmod);
  assert.deepEqual(after['/servizi/levabolli/'],before['/servizi/levabolli/']);
});

test('Prezzi non confermati nascosti; prezzi abilitati coerenti con Offer',t=>{
  const directory=fixture(t);
  run(directory,'scripts/build.js');
  assert.ok(!JSON.stringify(graph(directory,'servizi/cambio-gomme-cerchi')).includes('PriceSpecification'));
  assert.ok(!fs.readFileSync(path.join(directory,'docs/llms-full.txt'),'utf8').includes('A partire da'));
  update(directory,data=>{data.pricing.enabled=true;data.services[0].startingPrice=55;});
  run(directory,'scripts/build.js');
  run(directory,'scripts/check.js');
  const service = graph(directory,'servizi/cambio-gomme-cerchi')['@graph'].find(node=>node['@type']==='Service');
  assert.equal(service.offers.priceSpecification.minPrice,55);
  assert.equal(service.offers.priceSpecification.priceCurrency,'EUR');
  assert.ok(fs.readFileSync(path.join(directory,'docs/servizi/cambio-gomme-cerchi/index.html'),'utf8').includes('A partire da 55'));
});

test('Dominio, contatti e social si propagano da una sola configurazione',t=>{
  const directory=fixture(t);
  update(directory,data=>{
    data.url='https://car3001.example.org';
    data.telephone='+390212345678'; data.telephoneLabel='+39 02 12345678';
    data.email='officina@car3001.example.org';
    data.socialProfiles=[{name:'Instagram',url:'https://www.instagram.com/car3001_ufficiale/'}];
  });
  run(directory,'scripts/build.js');
  run(directory,'scripts/check.js');
  for (const file of ['index.html','contatti/index.html','faq/index.html','llms.txt','llms-full.txt']) {
    const text=fs.readFileSync(path.join(directory,'docs',file),'utf8');
    assert.ok(text.includes('officina@car3001.example.org'));
    assert.ok(!text.includes('car3001@car3001.it'));
    assert.ok(!text.includes('+39 02 99200616'));
  }
  assert.ok(fs.readFileSync(path.join(directory,'docs/robots.txt'),'utf8').includes('https://car3001.example.org/sitemap.xml'));
  assert.deepEqual(graph(directory,'')['@graph'][0].sameAs,['https://www.instagram.com/car3001_ufficiale/']);
});

test('GitHub Pages e dominio proprio generano risorse, link e metadati nel percorso effettivo',t=>{
  const directory=fixture(t);
  update(directory,data=>{data.url='https://car3001.it';});
  for (const [base,prefix] of [
    ['https://benfrost-20.github.io/car3001','/car3001'],
    ['https://car3001.it',''],
    ['https://example.org/anteprime/car3001/','/anteprime/car3001']
  ]) {
    const environment={SITE_URL:base};
    run(directory,'scripts/build.js',environment);
    run(directory,'scripts/check.js',environment);
    const html=fs.readFileSync(path.join(directory,'docs/index.html'),'utf8');
    const normalized=base.replace(/\/$/,'');
    assert.ok(html.includes(`href="${prefix}/css/styles.css"`));
    assert.ok(html.includes(`href="${prefix}/servizi/"`));
    assert.ok(html.includes(`src="${prefix}/assets/img/logo.webp"`));
    assert.ok(html.includes(`srcset="${prefix}/assets/img/header-960.webp 960w`));
    assert.ok(html.includes(`rel="canonical" href="${normalized}/"`));
    assert.equal(graph(directory,'')['@graph'][0].url,normalized+'/');
    assert.ok(fs.readFileSync(path.join(directory,'docs/llms.txt'),'utf8').includes(`${normalized}/servizi/index.md`));
    assert.ok(fs.readFileSync(path.join(directory,'docs/sitemap.xml'),'utf8').includes(`<loc>${normalized}/servizi/</loc>`));
  }
});

test('Il controllo rileva i collegamenti che escono dalla sottocartella GitHub Pages',t=>{
  const directory=fixture(t);
  const environment={SITE_URL:'https://benfrost-20.github.io/car3001'};
  run(directory,'scripts/build.js',environment);
  const file=path.join(directory,'docs/index.html');
  fs.writeFileSync(file,fs.readFileSync(file,'utf8').replace('href="/car3001/css/styles.css"','href="/css/styles.css"'));
  assert.throws(()=>run(directory,'scripts/check.js',environment),/URL esterno al percorso del sito/);
});
