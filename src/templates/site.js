'use strict';

const {site,images,escape:e,url,sitePath,servicePath,priceLabel,priceVisible,mapsUrl,faqItems,schema} = require('../../scripts/lib/site');
const copy = site.presentation;

function icon(name, className='') {
  const paths = {
    arrow:'<path d="M5 12h14m-6-6 6 6-6 6"/>',
    phone:'<path d="m8 3 3 5-3 2a14 14 0 0 0 6 6l2-3 5 3-1 4c-1 3-9 0-13-4S0 4 3 3Z"/>',
    mail:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 6 9 7 9-7"/>',
    pin:'<path d="M19 10c0 6-7 11-7 11S5 16 5 10a7 7 0 1 1 14 0Z"/><circle cx="12" cy="10" r="2.5"/>',
    tools:'<path d="m14 6 4 4m-8 1-7 7 3 3 7-7M14 4a6 6 0 0 0-7 7l6 6a6 6 0 0 0 7-7l-4 4-6-6Z"/>',
    car:'<path d="m5 7 2-4h10l2 4 2 4v7H3v-7Zm-2 4h18M5 18v3m14-3v3M6 14h2m8 0h2"/>'
  };
  return `<svg class="icon ${e(className)}" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${paths[name]||paths.arrow}</svg>`;
}

function image(key, alt, {className='',eager=false,priority=eager,sizes='(min-width: 992px) 350px, (min-width: 640px) 45vw, 92vw'} = {}) {
  const img = images[key];
  return `<img src="${e(img.src)}"${img.small ? ` srcset="${e(img.small.src)} ${img.small.width}w, ${e(img.src)} ${img.width}w" sizes="${e(sizes)}"` : ''} width="${img.width}" height="${img.height}" alt="${e(alt)}" class="${e(className)}" loading="${eager?'eager':'lazy'}" decoding="async"${priority?' fetchpriority="high"':''}>`;
}

function contactActions() {
  return `<div class="contact-actions"><a class="btn btn-primary" href="tel:${e(site.telephone)}">${icon('phone')}Chiama ${e(site.telephoneLabel)}</a><a class="btn btn-outline" href="mailto:${e(site.email)}">Scrivici ${icon('arrow')}</a></div>`;
}

function contacts() {
  return `<address class="contact-options">
    <a class="contact-option" href="tel:${e(site.telephone)}"><span class="contact-option-icon">${icon('phone')}</span><span class="contact-option-body"><span class="contact-label">Chiamaci</span><strong>${e(site.telephoneLabel)}</strong><span class="contact-hint">Parliamo del tuo intervento</span></span>${icon('arrow','contact-arrow')}</a>
    <a class="contact-option" href="mailto:${e(site.email)}"><span class="contact-option-icon">${icon('mail')}</span><span class="contact-option-body"><span class="contact-label">Scrivici</span><strong>${e(site.email)}</strong><span class="contact-hint">Richiedi informazioni o un preventivo</span></span>${icon('arrow','contact-arrow')}</a>
    <a class="contact-option" href="${e(mapsUrl)}" target="_blank" rel="noopener noreferrer"><span class="contact-option-icon">${icon('pin')}</span><span class="contact-option-body"><span class="contact-label">Vieni a trovarci</span><strong>${e(site.address.streetAddress)}</strong><span class="contact-hint">${e(site.address.postalCode)} ${e(site.address.addressLocality)} · Indicazioni stradali</span></span>${icon('arrow','contact-arrow')}</a>
  </address>`;
}

function cards(level=3) {
  return `<div class="service-grid">${site.services.map((service,index)=>`<article class="service-tile" id="portfolioModal${index+1}"><a class="service-card" href="${servicePath(service)}" aria-labelledby="card-title-${index+1}"><figure class="service-card-media" data-image="${e(service.image)}">${image(service.image,service.imageAlt)}<span class="service-photo-arrow">${icon('arrow')}</span></figure><div class="portfolio-caption"><h${level} class="portfolio-caption-heading" id="card-title-${index+1}">${e(service.displayName||service.name)}</h${level}><p class="service-card-description">${e(service.cardDescription)}</p><div class="service-card-bottom"><span class="portfolio-caption-subheading">${e(priceLabel(service))}</span><span class="service-card-action">Scopri ${icon('arrow')}</span></div></div></a></article>`).join('')}</div>`;
}

function priceTable() {
  return `<div class="table-responsive"><table class="service-table"><caption>Servizi e modalità di preventivo di ${e(site.name)}</caption><thead><tr><th scope="col">Servizio</th><th scope="col">Intervento</th><th scope="col">${site.pricing.enabled?'Da':'Preventivo'}</th></tr></thead><tbody>${site.services.map(service=>`<tr><th scope="row"><a href="${servicePath(service)}">${e(service.name)}</a></th><td>${e(service.priceScope)}</td><td>${e(priceLabel(service))}</td></tr>`).join('')}</tbody></table></div>${site.pricing.enabled?`<p class="price-note">${e(site.pricing.note)}</p>`:''}`;
}

function brands() {
  return `<section class="brand-section" aria-labelledby="brands-heading"><div class="container"><h2 class="section-heading" id="brands-heading">I marchi con cui lavoriamo.</h2><div class="brand-columns"><article id="products"><h3>Prodotti utilizzati</h3><ul class="brand-grid">${site.productBrands.map(brand=>`<li class="brand-tile">${e(brand)}</li>`).join('')}</ul></article><article id="insurance"><h3>Partner assicurativi</h3><ul class="brand-grid">${site.insurancePartners.map(brand=>`<li class="brand-tile">${e(brand)}</li>`).join('')}</ul><p class="brand-note">Verifica con noi la gestione della tua pratica.</p></article></div></div></section>`;
}

function faqList(items,level=2) {
  return `<div class="faq-list">${items.map(item=>`<details class="faq-answer"><summary><h${level}>${e(item.question)}</h${level}><span class="faq-toggle" aria-hidden="true">+</span></summary><p>${e(item.answer)}</p></details>`).join('')}</div>`;
}

function invitation() {
  return `<aside class="contact-invitation" aria-labelledby="invitation-heading"><div><p class="eyebrow">Siamo qui per aiutarti</p><h2 id="invitation-heading">Partiamo dalla tua auto.</h2><p>Raccontaci di cosa hai bisogno. Concordiamo insieme l'intervento e il preventivo.</p></div><a class="btn btn-primary" href="/contatti/">Contattaci ${icon('arrow')}</a></aside>`;
}

function home() {
  const previewFaq=faqItems().filter(item=>['quote','address','tyres'].includes(item.id));
  return `<header class="masthead">${image('header','Attrezzi e utensili per le lavorazioni in officina',{className:'masthead-image',eager:true,sizes:'100vw'})}<div class="container masthead-content"><p class="eyebrow">${e(site.name)}</p><h1 class="masthead-heading">${e(copy.heroTitle)}<br><span>${e(copy.heroTitleEnd)}</span></h1><p class="hero-summary">${e(copy.heroLead)}</p><div class="hero-actions"><a class="btn btn-primary" href="#portfolio">Scopri i servizi ${icon('arrow')}</a><a class="btn btn-glass" href="#contact">Parliamone</a></div><a class="hero-location" href="${e(mapsUrl)}" target="_blank" rel="noopener noreferrer">${icon('pin')}${e(site.address.streetAddress)} · ${e(site.address.addressLocality)}</a></div></header>
  <section class="highlights" id="services" aria-label="La nostra carrozzeria"><div class="container highlights-grid">${copy.strengths.map(item=>`<article class="highlight"><span class="highlight-icon">${icon(item.icon)}</span><div><h2>${e(item.title)}</h2><p>${e(item.text)}</p></div></article>`).join('')}</div></section>
  <section class="page-section service-section" id="portfolio" aria-labelledby="portfolio-heading"><div class="container"><header class="section-intro"><p class="eyebrow">I nostri servizi</p><h2 class="section-heading" id="portfolio-heading">${e(copy.servicesTitle)}</h2><p class="section-lead">${e(copy.servicesLead)}</p></header>${cards()}</div></section>
  <section class="page-section story-section" id="about" aria-labelledby="about-heading"><div class="container story-layout"><figure class="story-photo">${image('carrozzeria',`Auto all'interno della carrozzeria ${site.name}`,{sizes:'(min-width: 992px) 520px, 92vw'})}</figure><div class="story-copy"><p class="eyebrow">${e(site.name)} · Chi siamo</p><h2 class="section-heading" id="about-heading">${e(copy.aboutTitle)}</h2><p class="story-lead">${e(copy.aboutLead)}</p><a class="text-link" href="/chi-siamo/">La nostra carrozzeria ${icon('arrow')}</a></div></div></section>
  ${brands()}
  <section class="page-section home-faq" id="faq" aria-labelledby="faq-heading"><div class="container faq-layout"><header><p class="eyebrow">Domande frequenti</p><h2 class="section-heading" id="faq-heading">Prima di passare<br> in officina.</h2><a class="text-link" href="/faq/">Tutte le risposte ${icon('arrow')}</a></header>${faqList(previewFaq,3)}</div></section>
  <section class="page-section contact-section" id="contact" aria-labelledby="contact-heading"><div class="container"><header class="section-intro"><p class="eyebrow">Contatti</p><h2 class="section-heading" id="contact-heading">${e(copy.contactTitle)}</h2><p class="section-lead">${e(copy.contactLead)}</p></header>${contacts()}</div></section>`;
}

function intro(page,{title=page.label,lead=page.summary,eyebrow=site.name}={}) {
  return `<header class="page-intro"><p class="eyebrow">${e(eyebrow)}</p><h1>${e(title)}</h1><p class="page-lead">${e(lead)}</p></header>`;
}

function servicePage(page) {
  const service=page.service;
  return `<article class="service-detail"><div class="service-hero">${intro(page,{title:service.name,lead:service.cardDescription,eyebrow:`I nostri servizi · ${site.address.addressLocality}`})}<figure class="service-page-image" data-image="${e(service.image)}">${image(service.image,service.imageAlt,{eager:true,sizes:'(min-width: 992px) 480px, 92vw'})}</figure></div>
  <div class="service-detail-grid"><section class="service-description" aria-labelledby="details-heading"><p class="eyebrow">Il servizio</p><h2 id="details-heading">Cosa comprende</h2><ul class="detail-list">${service.details.map(detail=>`<li>${e(detail)}</li>`).join('')}</ul><details class="service-more"><summary>Qualche dettaglio in più <span aria-hidden="true">+</span></summary><p>${e(service.detailSummary)}</p></details></section>
  <aside class="quote-panel" aria-labelledby="quote-heading"><p class="eyebrow">Per la tua auto</p><h2 id="quote-heading">${e(priceLabel(service))}</h2>${priceVisible(service)?`<p>${e(service.priceScope)}. ${e(site.pricing.note)}</p>`:'<p>Indicaci il veicolo e la lavorazione. Concordiamo insieme intervento e costo.</p>'}${contactActions()}<p class="quote-location">${icon('pin')}${e(site.address.streetAddress)}, ${e(site.address.addressLocality)}</p></aside></div></article>
  <nav class="related-services" aria-labelledby="related-heading"><h2 id="related-heading">Altri servizi</h2><ul>${site.services.filter(item=>item.slug!==service.slug).map(item=>`<li><a href="${servicePath(item)}">${e(item.displayName||item.name)} ${icon('arrow')}</a></li>`).join('')}</ul></nav>`;
}

function content(page) {
  if (page.kind==='home') return home();
  if (page.kind==='service') return servicePage(page);
  if (page.kind==='services') return `${intro(page,{title:'I nostri servizi.',lead:copy.servicesLead})}<section aria-label="Servizi per la tua auto">${cards(2)}</section><details class="service-comparison"><summary><h2>Confronta i servizi</h2><span class="faq-toggle" aria-hidden="true">+</span></summary>${priceTable()}</details>${invitation()}`;
  if (page.kind==='about') return `<div class="about-intro-layout">${intro(page,{title:'La nostra carrozzeria.',lead:copy.aboutLead})}<figure class="service-page-image">${image('carrozzeria',`Auto all'interno della carrozzeria ${site.name}`,{eager:true,sizes:'(min-width: 992px) 480px, 92vw'})}</figure></div><section class="about-description" aria-labelledby="experience-heading"><h2 id="experience-heading">Esperienza, ogni giorno.</h2><p>${e(site.aboutSummary)}</p><a class="text-link" href="/servizi/">Esplora i servizi ${icon('arrow')}</a></section>${brands()}${invitation()}`;
  if (page.kind==='contact') return `${intro(page,{title:'Contattaci.',lead:copy.contactLead})}${contacts()}<section class="contact-help" aria-labelledby="request-heading"><div><p class="eyebrow">Il primo passo</p><h2 id="request-heading">Raccontaci di cosa hai bisogno.</h2></div><ul class="detail-list"><li>Indicaci il veicolo.</li><li>Descrivi il problema o il servizio che ti interessa.</li><li>Concordiamo insieme lavorazione e preventivo.</li></ul></section>`;
  return `${intro(page,{title:'Domande frequenti.',lead:'Servizi, preventivi e informazioni utili. Se hai altre domande, ci trovi al telefono o in carrozzeria.'})}${faqList(faqItems())}${invitation()}`;
}

function breadcrumbs(page) {
  return page.path==='/'?'':`<nav aria-label="Percorso di navigazione" class="breadcrumbs"><ol>${page.crumbs.map((crumb,index)=>`<li>${index===page.crumbs.length-1?`<span aria-current="page">${e(crumb.name)}</span>`:`<a href="${crumb.path}">${e(crumb.name)}</a>`}</li>`).join('')}</ol></nav>`;
}

function layout(page,lastmod) {
  const homePage=page.kind==='home';
  const links=homePage?[{name:'Servizi',path:'#portfolio'},{name:'Chi siamo',path:'#about'},{name:'Partner',path:'#brands-heading'},{name:'Contatti',path:'#contact'}]:[{name:'Servizi',path:'/servizi/'},{name:'Chi siamo',path:'/chi-siamo/'},{name:'FAQ',path:'/faq/'},{name:'Contatti',path:'/contatti/'}];
  const json=JSON.stringify(schema(page,lastmod)).replace(/</g,'\\u003c');
  const og=images.social;
  return `<!doctype html>
<html lang="${e(site.language)}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${e(page.title)}</title>
  <meta name="description" content="${e(page.description)}">
  <meta name="robots" content="index, follow, max-image-preview:large">
  <link rel="canonical" href="${url(page.path)}">
  <link rel="describedby" type="text/plain" href="/llms.txt">
  <link rel="alternate" type="text/markdown" href="${page.path}index.md" title="Versione Markdown">
  <meta property="og:locale" content="it_IT">
  <meta property="og:site_name" content="${e(site.name)}">
  <meta property="og:title" content="${e(page.title)}">
  <meta property="og:description" content="${e(page.description)}">
  <meta property="og:url" content="${url(page.path)}">
  <meta property="og:type" content="website">
  <meta property="og:image" content="${url(og.src)}">
  <meta property="og:image:width" content="${og.width}">
  <meta property="og:image:height" content="${og.height}">
  <meta property="og:image:alt" content="Attrezzi e utensili per le lavorazioni in officina">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${e(page.title)}">
  <meta name="twitter:description" content="${e(page.description)}">
  <meta name="twitter:image" content="${url(og.src)}">
  <meta name="twitter:image:alt" content="Attrezzi e utensili per le lavorazioni in officina">
  <link rel="icon" type="image/x-icon" href="/assets/favicon.ico">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css?family=Montserrat:400,500,600,700&amp;display=swap" rel="stylesheet">
  <link href="/css/styles.css" rel="stylesheet">
  <link href="/css/seo.css" rel="stylesheet">
  <script type="application/ld+json">${json}</script>
  <script src="/js/scripts.js" defer></script>
</head>
<body id="page-top" class="page-${e(page.kind)}">
  <a class="skip-link" href="#main-content">Vai al contenuto</a>
  <nav class="site-header" id="mainNav" aria-label="Navigazione principale"><div class="container header-layout"><a class="navbar-brand" href="/" aria-label="${e(site.name)}: home">${image('logo',`Logo ${site.name}`,{className:'brand-logo',eager:true,priority:false,sizes:'110px'})}</a><button class="navbar-toggler" id="menu-toggle" type="button" aria-controls="navbarResponsive" aria-expanded="false" hidden>Menu <span aria-hidden="true">☰</span></button><div class="site-menu" id="navbarResponsive"><ul>${links.map(link=>`<li><a class="nav-link${link.name==='Contatti'?' nav-contact':''}" href="${link.path}"${page.path===link.path?' aria-current="page"':''}>${link.name}</a></li>`).join('')}</ul></div></div></nav>
  <main id="main-content"${homePage?'':' class="inner-page container"'} tabindex="-1">${breadcrumbs(page)}${content(page)}</main>
  <footer class="footer"><div class="container footer-layout"><div><strong>${e(site.name)}</strong><p>${e(site.address.streetAddress)} · ${e(site.address.addressLocality)}</p></div><nav aria-label="Navigazione a piè di pagina"><ul class="footer-links"><li><a href="/servizi/">Servizi</a></li><li><a href="/contatti/">Contatti</a></li><li><a href="/faq/">Domande frequenti</a></li>${site.socialProfiles.map(profile=>`<li><a href="${e(profile.url)}" target="_blank" rel="noopener noreferrer">${e(profile.name)}</a></li>`).join('')}</ul></nav></div></footer>
</body>
</html>
`.replace(/\b(href|src)="(\/(?!\/)[^"]*)"/g,(_,attribute,value)=>`${attribute}="${sitePath(value)}"`)
 .replace(/\bsrcset="([^"]+)"/g,(_,value)=>`srcset="${value.split(',').map(candidate=>{
   const [source,width]=candidate.trim().split(/\s+/);
   return `${source.startsWith('/')&&!source.startsWith('//')?sitePath(source):source} ${width}`;
 }).join(', ')}"`);
}

module.exports={layout,content};
