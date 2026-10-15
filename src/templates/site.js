'use strict';

const {site,images,escape:e,url,sitePath,servicePath,priceLabel,priceVisible,mapsUrl,faqItems,schema} = require('../../scripts/lib/site');

function image(key, alt, {className='',eager=false,priority=eager,sizes='(min-width: 992px) 400px, 92vw'} = {}) {
  const img = images[key];
  return `<img src="${e(img.src)}"${img.small ? ` srcset="${e(img.small.src)} ${img.small.width}w, ${e(img.src)} ${img.width}w" sizes="${e(sizes)}"` : ''} width="${img.width}" height="${img.height}" alt="${e(alt)}" class="${e(className)}" loading="${eager?'eager':'lazy'}" decoding="async"${priority?' fetchpriority="high"':''}>`;
}

function contactActions() {
  return `<p class="contact-actions"><a class="btn btn-primary" href="tel:${e(site.telephone)}">Chiama ${e(site.telephoneLabel)}</a> <a class="btn btn-outline-primary" href="mailto:${e(site.email)}">Scrivici</a></p>`;
}

function contacts() {
  return `<address class="business-address"><strong>${e(site.name)}</strong><br>${e(site.address.streetAddress)}<br>${e(site.address.postalCode)} ${e(site.address.addressLocality)} (${e(site.address.addressRegion)})<br><a href="tel:${e(site.telephone)}">${e(site.telephoneLabel)}</a><br><a href="mailto:${e(site.email)}">${e(site.email)}</a></address><p><a href="${e(mapsUrl)}" target="_blank" rel="noopener noreferrer">Ottieni indicazioni stradali su Google Maps</a></p>${contactActions()}`;
}

function cards() {
  return `<div class="row">${site.services.map((service,index)=>`<article class="col-lg-4 col-sm-6 mb-4" id="portfolioModal${index+1}"><a class="portfolio-item service-card" href="${servicePath(service)}"><figure class="service-card-media">${image(service.image,service.imageAlt)}</figure><div class="portfolio-caption"><h3 class="portfolio-caption-heading">${e(service.name)}</h3><p class="portfolio-caption-subheading">${e(priceLabel(service))}</p><p>${e(service.summary)}</p><span class="service-card-action">Scopri il servizio <span aria-hidden="true">→</span></span></div></a></article>`).join('')}</div>`;
}

function priceTable() {
  return `<div class="table-responsive"><table class="table service-table"><caption>Servizi e modalità di preventivo di ${e(site.name)}</caption><thead><tr><th scope="col">Servizio</th><th scope="col">Intervento presentato</th><th scope="col">${site.pricing.enabled?'Prezzo di partenza':'Preventivo'}</th></tr></thead><tbody>${site.services.map(service=>`<tr><th scope="row"><a href="${servicePath(service)}">${e(service.name)}</a></th><td>${e(service.priceScope)}</td><td>${e(priceLabel(service))}</td></tr>`).join('')}</tbody></table></div>${site.pricing.enabled?`<p class="price-note">${e(site.pricing.note)}</p>`:''}`;
}

function brands() {
  return `<section class="brand-section" id="products" aria-labelledby="products-heading"><div class="container"><h2 id="products-heading">I prodotti che utilizziamo</h2><p class="answer-summary">Nel sito di ${e(site.name)} sono indicati i marchi ${e(site.productBrands.join(' e '))} per i prodotti utilizzati in carrozzeria. Per conoscere il prodotto previsto per una specifica lavorazione sulla tua auto, chiedi informazioni al momento del preventivo. La scelta va riferita all'intervento concordato con la carrozzeria.</p><ul class="brand-grid product-brands">${site.productBrands.map(brand=>`<li class="brand-tile">${e(brand)}</li>`).join('')}</ul></div></section>
  <section class="brand-section insurance-section" id="insurance" aria-labelledby="insurance-heading"><div class="container"><h2 id="insurance-heading">Partner assicurativi</h2><p class="answer-summary">${e(site.name)} presenta collaborazioni con ${e(site.insurancePartners.join(', '))}. Per verificare se una specifica pratica assicurativa rientra nella collaborazione e come concordare la riparazione, contatta direttamente la carrozzeria. Le informazioni sul veicolo, sul danno e sulla compagnia permettono di richiedere indicazioni relative al proprio caso.</p><ul class="brand-grid insurance-brands">${site.insurancePartners.map(brand=>`<li class="brand-tile">${e(brand)}</li>`).join('')}</ul></div></section>`;
}

function home() {
  return `<header class="masthead">${image('header', 'Attrezzi e utensili per le lavorazioni in officina', {className:'masthead-image',eager:true,sizes:'100vw'})}<div class="container masthead-content"><p class="eyebrow">${e(site.name)} · ${e(site.address.addressLocality)}</p><h1 class="masthead-heading">Carrozzeria a ${e(site.address.addressLocality)}</h1><p class="hero-summary">${e(site.summary)}</p><a class="btn btn-primary btn-xl" href="/servizi/">Scopri i servizi</a> <a class="btn btn-light btn-xl" href="/contatti/">Richiedi un preventivo</a></div></header>
  <section class="page-section" id="services" aria-labelledby="strengths-heading"><div class="container"><h2 class="section-heading text-center" id="strengths-heading">Lavorazioni e contatto diretto</h2><p class="answer-summary">${e(site.aboutSummary)}</p><div class="row text-center"><article class="col-md-4"><h3>Servizi per la tua auto</h3><p>Pneumatici, tagliandi, fari, pulizia, levabolli e componenti elettrici: consulta le schede per conoscere gli interventi presentati.</p></article><article class="col-md-4"><h3>Collaborazioni assicurative</h3><p>Verifica direttamente con la carrozzeria la gestione del tuo caso e la collaborazione con la compagnia assicurativa.</p></article><article class="col-md-4"><h3>Preventivo per l'intervento</h3><p>Indica il veicolo e la lavorazione desiderata per concordare valutazione e costo.</p></article></div></div></section>
  <section class="page-section bg-light" id="portfolio" aria-labelledby="portfolio-heading"><div class="container"><h2 class="section-heading text-center" id="portfolio-heading">I nostri servizi</h2><p class="answer-summary">${e(site.serviceSummary)}</p>${cards()}</div></section>
  ${brands()}
  <section class="page-section story-section" id="about" aria-labelledby="about-heading"><div class="container content-narrow"><h2 class="section-heading" id="about-heading">Chi siamo</h2><p class="answer-summary">${e(site.aboutSummary)}</p><p><a href="/chi-siamo/">Conosci ${e(site.name)}</a></p></div></section>
  <section class="page-section bg-light" id="faq" aria-labelledby="faq-heading"><div class="container content-narrow"><h2 class="section-heading" id="faq-heading">Informazioni sui servizi</h2><p class="answer-summary">Le schede dei servizi e le domande frequenti raccolgono le informazioni pubblicate da ${e(site.name)} su lavorazioni, contatti e preventivi. Puoi verificare cosa comprende il cambio gomme e quale controllo è previsto nel tagliando. Per dettagli relativi alla tua auto e al costo finale, contatta direttamente la carrozzeria.</p><p><a href="/faq/">Leggi tutte le domande frequenti</a></p></div></section>
  <section class="page-section contact-section" id="contact" aria-labelledby="contact-heading"><div class="container content-narrow"><h2 class="section-heading" id="contact-heading">Contattaci</h2><p class="answer-summary">${e(site.contactSummary)}</p>${contacts()}</div></section>`;
}

function intro(page) {
  return `<header class="page-intro"><h1>${e(page.service ? `${page.service.name} a ${site.address.addressLocality}` : page.label)}</h1><p class="answer-summary">${e(page.summary)}</p></header>`;
}

function servicePage(page) {
  const service = page.service;
  return `${intro(page)}<figure class="service-page-image">${image(service.image,service.imageAlt,{eager:true,sizes:'(min-width: 992px) 760px, 92vw'})}<figcaption>${e(service.imageAlt)}</figcaption></figure>
  <section aria-labelledby="details-heading"><h2 id="details-heading">Cosa comprende il servizio</h2><p class="answer-summary">${e(service.detailSummary)}</p><ul>${service.details.map(detail=>`<li>${e(detail)}</li>`).join('')}</ul></section>
  <section aria-labelledby="quote-heading"><h2 id="quote-heading">Preventivo e contatti</h2><p class="answer-summary">Per richiedere il servizio ${e(service.name.toLowerCase())}, contatta ${e(site.name)} indicando il veicolo e la lavorazione che ti interessa. Il costo finale e le attività previste vanno concordati direttamente con la carrozzeria. Puoi chiamare o scrivere prima di recarti in ${e(site.address.streetAddress)} a ${e(site.address.addressLocality)}.</p><dl class="service-facts"><dt>Servizio</dt><dd>${e(service.name)}</dd><dt>Sede</dt><dd>${e(site.address.streetAddress)}, ${e(site.address.addressLocality)}</dd><dt>${priceVisible(service)?'Prezzo di partenza':'Costo'}</dt><dd>${e(priceLabel(service))}</dd></dl>${priceVisible(service)?`<p>${e(service.priceScope)}. ${e(site.pricing.note)}</p>`:''}${contactActions()}</section>
  <nav class="related-services" aria-labelledby="related-heading"><h2 id="related-heading">Altri servizi auto</h2><p class="answer-summary">${e(site.serviceSummary)}</p><ul>${site.services.filter(item=>item.slug!==service.slug).map(item=>`<li><a href="${servicePath(item)}">${e(item.name)}</a></li>`).join('')}</ul></nav>`;
}

function content(page) {
  if (page.kind === 'home') return home();
  if (page.kind === 'service') return servicePage(page);
  if (page.kind === 'services') return `${intro(page)}<section aria-labelledby="service-list-heading"><h2 id="service-list-heading">Interventi disponibili</h2><p class="answer-summary">Consulta le sei schede per conoscere le lavorazioni presentate dalla carrozzeria: ogni pagina raccoglie una descrizione del servizio, un elenco degli interventi e i contatti per il preventivo. La tabella seguente permette di confrontare gli ambiti di lavoro prima di approfondire il servizio che riguarda la tua auto.</p>${cards()}</section><section aria-labelledby="comparison-heading"><h2 id="comparison-heading">Servizi e preventivi</h2><p class="answer-summary">Le lavorazioni elencate da ${e(site.name)} riguardano esigenze diverse del veicolo, dagli pneumatici alla pulizia fino ai componenti elettrici. La tabella permette di individuare il servizio da approfondire. Per definire la lavorazione adatta alla tua auto e conoscere il costo finale, richiedi un preventivo direttamente alla carrozzeria.</p>${priceTable()}</section>`;
  if (page.kind === 'about') return `${intro(page)}<figure class="service-page-image">${image('carrozzeria',`Auto all’interno della carrozzeria ${site.name}`)}<figcaption>La carrozzeria ${e(site.name)}.</figcaption></figure><section aria-labelledby="experience-heading"><h2 id="experience-heading">Esperienza e servizi</h2><p class="answer-summary">${e(site.aboutSummary)}</p><p><a href="/servizi/">Consulta tutti i servizi</a></p></section>${brands()}<section aria-labelledby="about-contact-heading"><h2 id="about-contact-heading">La nostra sede</h2><p class="answer-summary">${e(site.contactSummary)}</p>${contacts()}</section>`;
  if (page.kind === 'contact') return `${intro(page)}<section aria-labelledby="contact-details-heading"><h2 id="contact-details-heading">Telefono, email e indirizzo</h2><p class="answer-summary">${e(site.contactSummary)}</p>${contacts()}</section><section aria-labelledby="request-heading"><h2 id="request-heading">Richiedi informazioni sulla tua auto</h2><p class="answer-summary">Quando contatti ${e(site.name)}, indica il veicolo e il servizio che ti interessa: cambio gomme, tagliando, fari, pulizia, levabolli o elettrauto. La carrozzeria potrà concordare con te la valutazione dell'intervento. Utilizza il telefono o l'email riportati in questa pagina per richiedere informazioni e un preventivo.</p><ul><li>Indica il veicolo interessato.</li><li>Descrivi il problema o la lavorazione richiesta.</li><li>Concorda lavorazioni e costo prima dell'intervento.</li></ul></section>`;
  return `${intro(page)}${faqItems().map((item,index)=>`<section class="faq-answer" aria-labelledby="question-${index+1}"><h2 id="question-${index+1}">${e(item.question)}</h2><p>${e(item.answer)}</p></section>`).join('')}<p><a href="/contatti/">Contatta la carrozzeria per altre informazioni</a></p>`;
}

function breadcrumbs(page) {
  return page.path === '/' ? '' : `<nav aria-label="Percorso di navigazione" class="breadcrumbs"><ol>${page.crumbs.map((crumb,index)=>`<li>${index === page.crumbs.length-1?`<span aria-current="page">${e(crumb.name)}</span>`:`<a href="${crumb.path}">${e(crumb.name)}</a>`}</li>`).join('')}</ol></nav>`;
}

function layout(page, lastmod) {
  const links = [{name:'Servizi',path:'/servizi/'},{name:'Chi siamo',path:'/chi-siamo/'},{name:'FAQ',path:'/faq/'},{name:'Contatti',path:'/contatti/'}];
  const json = JSON.stringify(schema(page,lastmod)).replace(/</g,'\\u003c');
  const og = images.social;
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
  <link href="https://fonts.googleapis.com/css?family=Montserrat:400,600,700&amp;display=swap" rel="stylesheet">
  <link href="https://fonts.googleapis.com/css?family=Roboto+Slab:400&amp;display=swap" rel="stylesheet">
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css" rel="stylesheet">
  <link href="/css/styles.css" rel="stylesheet">
  <link href="/css/seo.css" rel="stylesheet">
  <script type="application/ld+json">${json}</script>
  <script src="/js/scripts.js" defer></script>
</head>
<body id="page-top">
  <a class="skip-link" href="#main-content">Vai al contenuto</a>
  <nav class="navbar navbar-expand-lg fixed-top" id="mainNav" aria-label="Navigazione principale"><div class="container"><a class="navbar-brand" href="/" aria-label="${e(site.name)}: home">${image('logo',`Logo ${site.name}`,{className:'brand-logo',eager:true,priority:false,sizes:'130px'})}</a><button class="navbar-toggler" id="menu-toggle" type="button" aria-controls="navbarResponsive" aria-expanded="false" hidden>Menu</button><div class="site-menu" id="navbarResponsive"><ul class="navbar-nav text-uppercase ms-auto">${links.map(link=>`<li class="nav-item"><a class="nav-link" href="${link.path}"${page.path===link.path?' aria-current="page"':''}>${link.name}</a></li>`).join('')}</ul></div></div></nav>
  <main id="main-content"${page.kind==='home'?'':' class="inner-page container"'} tabindex="-1">${breadcrumbs(page)}${content(page)}</main>
  <footer class="footer py-4"><div class="container"><p>© ${e(site.name)} · ${e(site.address.streetAddress)}, ${e(site.address.addressLocality)}</p><nav aria-label="Navigazione a piè di pagina"><ul class="footer-links"><li><a href="/servizi/">Servizi</a></li><li><a href="/contatti/">Contatti</a></li><li><a href="/faq/">Domande frequenti</a></li>${site.socialProfiles.map(profile=>`<li><a href="${e(profile.url)}" target="_blank" rel="noopener noreferrer">${e(profile.name)}</a></li>`).join('')}</ul></nav></div></footer>
</body>
</html>
`.replace(/\b(href|src)="(\/(?!\/)[^"]*)"/g,(_,attribute,value)=>`${attribute}="${sitePath(value)}"`)
 .replace(/\bsrcset="([^"]+)"/g,(_,value)=>`srcset="${value.split(',').map(candidate=>{
   const [source,width] = candidate.trim().split(/\s+/);
   return `${source.startsWith('/') && !source.startsWith('//') ? sitePath(source) : source} ${width}`;
 }).join(', ')}"`);
}

module.exports = {layout,content};
