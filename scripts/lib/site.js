'use strict';

const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../..');
const raw = JSON.parse(fs.readFileSync(path.join(root, 'src/data/site.json'), 'utf8'));
const variables = {name:raw.name,city:raw.address.addressLocality,streetAddress:raw.address.streetAddress,postalCode:raw.address.postalCode,telephoneLabel:raw.telephoneLabel,email:raw.email};
function expand(value) {
  if (typeof value === 'string') return value.replace(/\{\{(\w+)\}\}/g,(_,key)=>{
    if (!(key in variables)) throw new Error(`Variabile sconosciuta: ${key}`);
    return variables[key];
  });
  if (Array.isArray(value)) return value.map(expand);
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key,item])=>[key,expand(item)]));
  return value;
}
const site = expand(raw);
const images = JSON.parse(fs.readFileSync(path.join(root, 'src/data/images.json'), 'utf8'));

function escape(value) {
  return String(value).replace(/[&<>"']/g, char => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[char]));
}

const origin = new URL(process.env.SITE_URL || site.url);
if (origin.protocol !== 'https:' || origin.search || origin.hash || origin.username || origin.password) {
  throw new Error('site.url / SITE_URL deve essere un URL HTTPS assoluto senza credenziali, query o frammenti. È consentita una sottocartella.');
}
const basePath = origin.pathname.replace(/\/+$/,'');
site.url = origin.origin + basePath;
const sitePath = route => basePath + route;
function relativeSitePath(pathname) {
  if (pathname === basePath) return '/';
  if (!pathname.startsWith(basePath + '/')) throw new Error(`URL esterno al percorso del sito: ${pathname}`);
  return pathname.slice(basePath.length);
}
if (typeof site.pricing.enabled !== 'boolean') throw new Error('pricing.enabled deve essere booleano.');
if (!/^[A-Z]{3}$/.test(site.pricing.currency)) throw new Error('Valuta non valida.');
if (new Set(site.services.map(service=>service.slug)).size !== site.services.length) throw new Error('Slug dei servizi duplicati.');
for (const service of site.services) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(service.slug)) throw new Error('Slug del servizio non valido.');
  if (service.startingPrice !== null && (!Number.isFinite(service.startingPrice) || service.startingPrice < 0)) throw new Error('Prezzo di partenza non valido.');
  if (!images[service.image]) throw new Error('Immagine del servizio non trovata.');
}
for (const profile of site.socialProfiles) {
  if (!profile.name || new URL(profile.url).protocol !== 'https:' || /NOME_|example\./i.test(profile.url)) throw new Error('Profilo ufficiale non valido.');
}
const url = route => new URL(sitePath(route), origin.origin).href;
const ref = id => ({'@id': id});
const businessId = url('/#organization');
const websiteId = url('/#website');
const servicePath = service => `/servizi/${service.slug}/`;
const priceVisible = service => site.pricing.enabled && Number.isFinite(service.startingPrice);
const priceLabel = service => priceVisible(service)
  ? `A partire da ${new Intl.NumberFormat('it-IT', {style:'currency',currency:site.pricing.currency,maximumFractionDigits:0}).format(service.startingPrice)}`
  : 'Preventivo su richiesta';
const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${site.address.streetAddress}, ${site.address.postalCode} ${site.address.addressLocality}, Italia`)}`;

function faqItems() {
  // Contatti e servizi vengono derivati dal file di configurazione, senza duplicare dati variabili.
  return site.faq.map(item => {
    if (item.id === 'address') return {...item, answer:`${site.name} si trova in ${site.address.streetAddress}, ${site.address.postalCode} ${site.address.addressLocality} (${site.address.addressRegion}). Nella pagina Contatti trovi il collegamento alle indicazioni stradali.`};
    if (item.id === 'quote') return {...item, answer:`Puoi chiamare il numero ${site.telephoneLabel} oppure scrivere a ${site.email}, indicando il veicolo e il servizio desiderato. Lavorazioni e costo finale vanno concordati direttamente con la carrozzeria.`};
    if (item.id === 'services') return {...item, answer:`I servizi presentati sono: ${site.services.map(service=>service.name).join(', ')}.`};
    return item;
  });
}

function offer(service) {
  if (!priceVisible(service)) return undefined;
  return {
    '@type':'Offer', '@id':url(`${servicePath(service)}#offer`), url:url(servicePath(service)),
    itemOffered:ref(url(`${servicePath(service)}#service`)), seller:ref(businessId),
    description:`${priceLabel(service)}. ${service.priceScope}. ${site.pricing.note}`,
    priceSpecification:{'@type':'PriceSpecification',minPrice:service.startingPrice,priceCurrency:site.pricing.currency}
  };
}

function serviceSchema(service, description = service.summary) {
  return {
    '@type':'Service','@id':url(`${servicePath(service)}#service`),
    name:service.name, serviceType:service.name, description,
    url:url(servicePath(service)), image:url(images[service.image].src),
    provider:ref(businessId), areaServed:{'@type':'City',name:site.address.addressLocality},
    ...(offer(service) ? {offers:offer(service)} : {})
  };
}

function schema(page, lastmod) {
  const business = {
    '@type':['Organization','AutoBodyShop'],'@id':businessId,
    name:site.name, url:url('/'), telephone:site.telephone, email:site.email,
    description:site.summary, address:{'@type':'PostalAddress',...site.address},
    logo:{'@type':'ImageObject',url:url(images.logo.src),width:images.logo.width,height:images.logo.height},
    image:url(images.header.src),
    ...(site.socialProfiles.length ? {sameAs:site.socialProfiles.map(profile=>profile.url)} : {})
  };
  const graph = [business, {
    '@type':'WebSite','@id':websiteId, url:url('/'), name:site.name,
    inLanguage:site.language, publisher:ref(businessId)
  }, {
    '@type':page.kind === 'faq' ? 'FAQPage' : page.kind === 'about' ? 'AboutPage' : page.kind === 'contact' ? 'ContactPage' : page.kind === 'services' ? 'CollectionPage' : 'WebPage',
    '@id':url(`${page.path}#webpage`), url:url(page.path), name:page.title,
    description:page.description, inLanguage:site.language, isPartOf:ref(websiteId),
    about:ref(businessId), dateModified:lastmod,
    ...(page.path !== '/' ? {breadcrumb:ref(url(`${page.path}#breadcrumb`))} : {}),
    ...(page.service ? {mainEntity:ref(url(`${page.path}#service`))} : {}),
    ...(page.kind === 'faq' ? {mainEntity:faqItems().map(item=>({'@type':'Question',name:item.question,acceptedAnswer:{'@type':'Answer',text:item.answer}}))} : {})
  }];
  if (page.path !== '/') graph.push({
    '@type':'BreadcrumbList','@id':url(`${page.path}#breadcrumb`),
    itemListElement:page.crumbs.map((crumb,index)=>({'@type':'ListItem',position:index+1,name:crumb.name,item:url(crumb.path)}))
  });
  if (page.service) graph.push(serviceSchema(page.service, page.service.detailSummary));
  if (page.kind === 'home' || page.kind === 'services') {
    graph.push(...site.services.map(service=>serviceSchema(service, service.cardDescription)));
    graph.push({'@type':'ItemList','@id':url(`${page.path}#services`),name:`Servizi di ${site.name}`,itemListElement:site.services.map((service,index)=>({'@type':'ListItem',position:index+1,item:ref(url(`${servicePath(service)}#service`))}))});
  }
  return {'@context':'https://schema.org','@graph':graph};
}

function pages() {
  const home = {name:'Home',path:'/'};
  const services = {name:'Servizi',path:'/servizi/'};
  return [
    {kind:'home',path:'/',label:'Home',summary:site.summary,priority:'1.0',crumbs:[home]},
    {kind:'services',path:services.path,label:'Servizi',summary:site.serviceSummary,priority:'0.9',crumbs:[home,services]},
    ...site.services.map(service=>({kind:'service',path:servicePath(service),label:service.name,summary:service.summary,priority:'0.8',service,crumbs:[home,services,{name:service.name,path:servicePath(service)}]})),
    {kind:'about',path:'/chi-siamo/',label:'Chi siamo',summary:site.aboutSummary,priority:'0.6',crumbs:[home,{name:'Chi siamo',path:'/chi-siamo/'}]},
    {kind:'contact',path:'/contatti/',label:'Contatti',summary:site.contactSummary,priority:'0.8',crumbs:[home,{name:'Contatti',path:'/contatti/'}]},
    {kind:'faq',path:'/faq/',label:'Domande frequenti',summary:`Le domande frequenti di ${site.name} raccolgono informazioni su sede, servizi e richieste di preventivo. Puoi verificare cosa comprende il cambio gomme, quale controllo diagnostico è previsto nel tagliando e come viene proposta la pulizia dell’auto. Per concordare lavorazioni e costi, contatta direttamente la carrozzeria a ${site.address.addressLocality}.`,priority:'0.5',crumbs:[home,{name:'Domande frequenti',path:'/faq/'}]}
  ].map(page=>({...page,...(page.service ? {title:page.service.title,description:page.service.description} : site.pageMetadata[page.kind])}));
}

module.exports = {root,site,basePath,sitePath,relativeSitePath,images,escape,url,ref,businessId,websiteId,servicePath,priceVisible,priceLabel,mapsUrl,faqItems,schema,pages};
