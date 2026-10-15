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
const run = (directory,script) => execFileSync(process.execPath,[script],{cwd:directory,encoding:'utf8'});
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
