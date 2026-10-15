# Audit e implementazione SEO / GEO — Nuova Car 3001

Verifica del 15 ottobre 2026. Repository: `car3001`, branch iniziale `master`, nessuna modifica locale preesistente rilevata. Interventi locali; nessuna pubblicazione o modifica DNS effettuata.

## Audit prima delle modifiche

| Area | Stato rilevato | Conseguenza |
| --- | --- | --- |
| Stack | Template Start Bootstrap Agency, Bootstrap 5.2.3, Pug/Sass e JavaScript; sito effettivo in HTML statico sotto `docs/`. | Non è una SPA: il testo è disponibile nell'HTML iniziale. |
| Sorgenti e build | `src/pug/index.pug` e gli stili sorgente erano ancora il template inglese, mentre `docs/` conteneva la versione italiana personalizzata. La build scriveva in `dist/`. | Ricostruendo dai sorgenti si perdeva il sito aggiornato. |
| Rotte | Una sola pagina `/`, con sezioni a frammento; i sei servizi si aprivano in modali Bootstrap. | I servizi non avevano URL autonomi. I dettagli erano nell'HTML ma nascosti, con interazione dipendente da JavaScript; non è corretto considerarli contenuti assenti dall'HTML. |
| Metadata | Title `NUOVA CAR 3001`, descrizione generica, assenza di canonical, Open Graph e Twitter Card. | Identità locale e intento della pagina poco espliciti. |
| Heading | Un H1 `Benvenuti!`; passaggi H2 → H4; alcuni sottotitoli decorativi usavano H3. | Gerarchia dei contenuti poco chiara. |
| Crawl e schema | Nessun robots, sitemap, llms o JSON-LD. | Mancavano gli indici e una descrizione strutturata dell'attività. |
| Immagini | 28 elementi immagine, 15 riferimenti a file inesistenti; nessuna dimensione HTML esplicita. Header PNG circa 2,33 MB, logo PNG circa 1,22 MB. | Richieste fallite, spazio non riservato e trasferimenti evitabili. |
| Entità | Social segnaposto, affermazioni generiche su certificazioni non identificate. | Collegamenti inutilizzabili e dichiarazioni non documentate. |

La gerarchia iniziale era `/` → punti di forza (`#services`), servizi (`#portfolio` e `#portfolioModal1`…`6`), prodotti (`#products`), assicurazioni (`#insurance`), chi siamo (`#about`), contatti (`#contact`).

## Interventi eseguiti

1. Sostituita la build del template con un generatore statico Node senza dipendenze npm. Grafica, logo, colori, fotografie disponibili e licenza MIT conservati. `src/` è ora il sorgente effettivo; `docs/` e `dist/` sono output equivalenti della stessa build.
2. Centralizzati in `src/data/site.json` dominio, identità, contatti, sede, prezzi, marchi, assicurazioni, social, testi e metadata. I riferimenti `{{name}}`, `{{city}}`, `{{streetAddress}}`, `{{postalCode}}`, `{{telephoneLabel}}`, `{{email}}` vengono espansi in fase di build. FAQ, markup e file AI riusano gli stessi dati.
3. Conservati gli importi provvisori nel file di configurazione con `pricing.enabled: false`. Finché il listino non viene confermato, nessun prezzo viene pubblicato nelle pagine, nel JSON-LD o nei file Markdown. `startingPrice: null` mantiene il servizio su preventivo anche attivando il listino.
4. Create 11 pagine statiche, con navigazione tramite link HTML e breadcrumb nelle pagine interne. I precedenti frammenti principali della home restano disponibili; i sei ID delle vecchie modali identificano ora le schede visibili. I dettagli si aprono su pagine autonome. Rimossi caroselli di immagini mancanti e social segnaposto.
5. Aggiunti un H1 descrittivo per pagina, gerarchia senza salti, sezioni denominate, articoli per le schede dei servizi, address, figure/figcaption, tabelle con caption e scope, elenchi e collegamento per saltare al contenuto. I div residui servono alla griglia e all'impaginazione.
6. Generati title unici (massimo 60 caratteri), description uniche (140–155 caratteri), canonical assoluti, Open Graph e Twitter Card completi. Le immagini social hanno URL assoluto, alt e dimensioni.
7. Aggiunti paragrafi introduttivi di 40–60 parole sotto i titoli principali e delle sezioni di servizio, descrizioni specifiche delle lavorazioni, una tabella di confronto e FAQ realmente visibili. Le risposte brevi delle FAQ restano concise quando sufficienti.
8. Implementati Organization/AutoBodyShop, WebSite, WebPage, Service, BreadcrumbList, FAQPage, AboutPage, ContactPage, CollectionPage e ItemList. Offer/PriceSpecification vengono emessi solo per prezzi abilitati. `sameAs` appare soltanto con profili ufficiali configurati.
9. Generata sitemap XML dalle rotte, con priorità e lastmod basato sull'impronta dell'HTML e delle immagini collegate. Il registro `seo/page-history.json` conserva le date quando i contenuti non cambiano. Il valore iniziale registra questa revisione, senza retrodatare nuove pagine.
10. Aggiunti robots, llms, llms-full, versioni Markdown per ciascuna pagina e relazioni HTML `alternate` e `describedby`. Gli elenchi llms puntano alle risorse Markdown, secondo la proposta attuale di llmstxt.org.
11. Convertiti gli asset fotografici e il logo in WebP con varianti responsive, alt contestuali, width/height, caricamento differito sotto la prima schermata e priorità per le immagini principali. Le versioni principali passano da **4.061.856 a 461.292 byte: −88,6%**, esclusi varianti aggiuntive e JPEG social. Il JPEG 1200×630 per la condivisione è mantenuto per compatibilità.
12. Rimossi Font Awesome e il JavaScript Bootstrap non più necessario. Il piccolo script locale gestisce solo il menu mobile, che resta accessibile senza JavaScript. L'iframe Google Maps è sostituito dal link alle indicazioni. Rimangono Bootstrap CSS e Google Fonts come risorse esterne già utilizzate dal sito.

## Mappa finale

| Rotta | Contenuto e schema specifico |
| --- | --- |
| `/` | Identità locale, servizi, marchi, collaborazioni, contatti; Organization/AutoBodyShop, WebSite, WebPage, ItemList e Service. |
| `/servizi/` | Indice con schede e tabella; CollectionPage, ItemList e Service. |
| `/servizi/cambio-gomme-cerchi/` | Pneumatici, cerchi ed equilibratura; Service. |
| `/servizi/tagliandi-auto/` | Tagliando e diagnostica OBD; Service. |
| `/servizi/lucidatura-fari/` | Piccoli graffi e ingiallimento fari; Service. |
| `/servizi/pulizia-lucidatura-auto/` | Lavaggio/aspirazione tramite partner, igienizzazione su richiesta e lucidatura; Service. |
| `/servizi/levabolli/` | Grandine e piccole ammaccature senza verniciatura; Service. |
| `/servizi/elettrauto/` | Sensori di parcheggio, dash cam e luci LED interne; Service. |
| `/chi-siamo/` | Presentazione, esperienza e sede; AboutPage. |
| `/contatti/` | Contatti e indicazioni; ContactPage. |
| `/faq/` | Sei domande e risposte; FAQPage. |

Tutte le pagine interne hanno BreadcrumbList. Ogni rotta ha una versione `index.md`; le pagine HTML sono gli URL canonici inseriti nella sitemap.

## Scelte sui dati strutturati e sulle aspettative

Non sono stati creati Article/BlogPosting perché mancano articoli, autori e date editoriali documentate; non sono stati creati Product perché il sito presenta servizi. AggregateRating, recensioni, identificativi Wikidata, certificazioni e registri non sono stati inventati. La struttura potrà essere estesa quando esisteranno contenuti reali e verificati. `sameAs` è omesso con l'elenco social vuoto.

FAQPage descrive le risposte visibili. Non è una promessa di risultati arricchiti: Google ha ritirato la visualizzazione dei FAQ rich result dal 7 maggio 2026. [Aggiornamenti ufficiali Google](https://developers.google.com/search/updates).

llms.txt è una proposta di interoperabilità, non un requisito di posizionamento. Google precisa che non servono file AI speciali per comparire nelle proprie funzioni generative; contenuto accessibile, collegamenti interni e dati coerenti restano fondamentali. [Google AI features](https://developers.google.com/search/docs/appearance/ai-features), [proposta llms.txt v2](https://llmstxt.org/).

Le priorità nella sitemap sono incluse come richiesto, ma Google le ignora. Le date devono invece riflettere cambiamenti effettivi: la build conserva quelle precedenti per contenuti identici. [Documentazione sitemap Google](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap).

## Verifiche e limiti

- `npm run build`: completata, 11 pagine in entrambi gli output.
- `npm run check`: completato, 11 pagine e 277 riferimenti locali verificati; heading, metadati, immagini, frammenti, JSON-LD, FAQ, sitemap, robots e Markdown.
- `npm test`: tre test superati. Verificati stabilità lastmod, aggiornamento selettivo dei contenuti, prezzi abilitati/disabilitati, propagazione di dominio/telefono/email/social.
- Parsing indipendente con HTMLParser e XML ElementTree: pagine e sitemap coerenti; namespace, priorità e date validi.
- Controllo browser locale: home, navigazione mobile, indice servizi e pagina cambio gomme; menu desktop verificato e nessun errore nella console osservata.
- Il codice JSON-LD è stato verificato sintatticamente e rispetto ai dati visibili. Non è stata eseguita una validazione esterna tramite Rich Results Test o Schema Markup Validator; questi strumenti vanno usati anche sugli URL realmente pubblicati.
- Non sono stati misurati dati reali di Core Web Vitals, ranking o citazioni. Il risparmio riportato riguarda i file immagine, non un punteggio Lighthouse.
- La consultazione del dominio live non ha restituito una pagina verificabile tramite lo strumento di navigazione; dominio, redirect, DNS e risposte dell'hosting restano da confermare. Il dominio attuale deriva dal repository.

## Informazioni e materiali da completare

1. Confermare il dominio canonico `https://car3001.it` e il comportamento della variante www. Il valore si cambia solo in `src/data/site.json` prima della build.
2. Confermare i prezzi provvisori e cosa comprendono, eventuali condizioni e trattamento IVA; in particolare il prezzo di partenza della pulizia non va attribuito automaticamente alla lucidatura. Poi attivare `pricing.enabled`.
3. Confermare contatti, marchi Standox/3M, collaborazioni Unipol/Sara/Generali e la dichiarazione di oltre 50 anni di esperienza dei soci; derivano dai testi esistenti.
4. Inserire URL ufficiali dei profili social, orari verificati, ragione sociale e dati identificativi aziendali. Non sono stati dedotti da directory non ufficiali.
5. Fornire fotografie reali del team, della sede e delle lavorazioni, oltre alle foto già disponibili. Non sono state inventate immagini o gallerie sostitutive.
6. Fornire certificazioni identificabili e relativi riferimenti, prima di reinserire le dichiarazioni di carrozzeria certificata o prodotti ecosostenibili.
7. Completare informative privacy/cookie e note legali con testi corretti, quindi collegarle nei layout. Non sono state generate dichiarazioni legali senza dati aziendali.
8. Sul servizio di hosting: pubblicare l'output, confermare HTTPS/redirect/codici HTTP/tipi MIME/accesso bot, inviare la sitemap a Google Search Console e Bing Webmaster Tools e allineare il profilo Business dell'attività.

## Codice generato: llms.txt

Il file sorgente richiesto è `public/llms.txt`; la build lo copia nella radice di `docs/` e `dist/`. Lo stesso vale per robots e llms-full. Questi file sono generati: le informazioni si aggiornano in `site.json`.

```markdown
# Nuova Car 3001

> Nuova Car 3001 è una carrozzeria a Cologno Monzese, in Via G. Rossini 38. I servizi comprendono cambio gomme e cerchi, tagliandi con diagnostica OBD, trattamento fari, pulizia e lucidatura, levabolli ed elettrauto. Per valutare l'intervento sulla tua auto e richiedere un preventivo puoi contattare direttamente la carrozzeria.

Sede: Via G. Rossini 38, 20093 Cologno Monzese (MI), Italia.
Telefono: +39 02 99200616. Email: car3001@car3001.it.
Marchi dei prodotti indicati: Standox, 3M. Partner assicurativi indicati: Unipol, Sara, Generali.
I prezzi non sono pubblicati: richiedere un preventivo alla carrozzeria.
Le risorse seguenti sono versioni Markdown delle pagine pubbliche, generate dagli stessi dati del sito.

## Pagine principali

- [Nuova Car 3001](https://car3001.it/index.md): Nuova Car 3001 a Cologno Monzese: cambio gomme, tagliandi, lucidatura fari, pulizia auto, levabolli ed elettrauto. Contattaci per un preventivo auto.
- [Servizi](https://car3001.it/servizi/index.md): I servizi di Nuova Car 3001 a Cologno Monzese: pneumatici, tagliandi OBD, fari, pulizia, levabolli ed elettrauto. Leggi i dettagli e chiedi un preventivo.
- [Chi siamo](https://car3001.it/chi-siamo/index.md): Conosci Nuova Car 3001, carrozzeria a Cologno Monzese in Via G. Rossini 38. Esperienza nel settore auto, servizi e contatti per informazioni e preventivi.
- [Contatti](https://car3001.it/contatti/index.md): Contatta Nuova Car 3001: telefono, email e indicazioni per Via G. Rossini 38 a Cologno Monzese. Richiedi informazioni e un preventivo per i servizi auto.
- [Domande frequenti](https://car3001.it/faq/index.md): Sede, servizi, cambio gomme, tagliandi OBD, pulizia auto e preventivi di Nuova Car 3001 a Cologno Monzese. Consulta le FAQ e contatta la carrozzeria.

## Servizi

- [Cambio gomme e cerchi](https://car3001.it/servizi/cambio-gomme-cerchi/index.md): Cambio gomme e cerchi con equilibratura da Nuova Car 3001 a Cologno Monzese. Scopri il servizio e contattaci per un preventivo per la tua auto in officina.
- [Tagliandi auto](https://car3001.it/servizi/tagliandi-auto/index.md): Tagliandi auto con controllo diagnostico OBD incluso da Nuova Car 3001 a Cologno Monzese. Contattaci per informazioni e un preventivo per il tuo veicolo.
- [Verniciatura e lucidatura fari](https://car3001.it/servizi/lucidatura-fari/index.md): Verniciatura e lucidatura fari a Cologno Monzese con Nuova Car 3001. Trattamento per graffi e ingiallimento: scopri il servizio e richiedi un preventivo.
- [Pulizia e lucidatura auto](https://car3001.it/servizi/pulizia-lucidatura-auto/index.md): Pulizia auto a Cologno Monzese: lavaggio e aspirazione tramite partner, igienizzazione su richiesta. Scopri il servizio e contatta Nuova Car 3001.
- [Levabolli](https://car3001.it/servizi/levabolli/index.md): Levabolli a Cologno Monzese per grandine e piccole ammaccature che non richiedono verniciatura. Contatta Nuova Car 3001 per valutazione e preventivo.
- [Elettrauto](https://car3001.it/servizi/elettrauto/index.md): Elettrauto a Cologno Monzese: sensori di parcheggio, installazione dash cam e luci interne LED. Contatta Nuova Car 3001 per informazioni e preventivi.

## Optional

- [Contenuto completo in un file](https://car3001.it/llms-full.txt): raccolta delle versioni Markdown delle pagine.
- [Mappa del sito](https://car3001.it/sitemap.xml): indice degli URL HTML canonici.
```

## Codice generato: robots.txt

Tutti gli user agent appartengono a un gruppo con le stesse regole; i crawler specifici non perdono i blocchi delle rotte riservate. Le rotte API/admin/private non esistono attualmente: le direttive ne limitano il crawling se aggiunte in futuro e non sostituiscono il controllo degli accessi.

```text
# Regole comuni per tutti i crawler, inclusi ricerca e AI.
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

Sitemap: https://car3001.it/sitemap.xml
```

## JSON-LD di riferimento: attività e sito

Estratto dal grafo effettivo della home. I grafi completi sono in `seo/examples/home.json`, `service.json` e `faq.json`, rigenerati automaticamente.

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": [
        "Organization",
        "AutoBodyShop"
      ],
      "@id": "https://car3001.it/#organization",
      "name": "Nuova Car 3001",
      "url": "https://car3001.it/",
      "telephone": "+390299200616",
      "email": "car3001@car3001.it",
      "description": "Nuova Car 3001 è una carrozzeria a Cologno Monzese, in Via G. Rossini 38. I servizi comprendono cambio gomme e cerchi, tagliandi con diagnostica OBD, trattamento fari, pulizia e lucidatura, levabolli ed elettrauto. Per valutare l'intervento sulla tua auto e richiedere un preventivo puoi contattare direttamente la carrozzeria.",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Via G. Rossini 38",
        "postalCode": "20093",
        "addressLocality": "Cologno Monzese",
        "addressRegion": "MI",
        "addressCountry": "IT"
      },
      "logo": {
        "@type": "ImageObject",
        "url": "https://car3001.it/assets/img/logo.webp",
        "width": 440,
        "height": 325
      },
      "image": "https://car3001.it/assets/img/header.webp"
    },
    {
      "@type": "WebSite",
      "@id": "https://car3001.it/#website",
      "url": "https://car3001.it/",
      "name": "Nuova Car 3001",
      "inLanguage": "it",
      "publisher": {
        "@id": "https://car3001.it/#organization"
      }
    }
  ]
}
```

## JSON-LD di riferimento: servizio e breadcrumb

Estratto dalla pagina cambio gomme. In assenza di prezzi confermati il servizio non emette un'offerta con importo.

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BreadcrumbList",
      "@id": "https://car3001.it/servizi/cambio-gomme-cerchi/#breadcrumb",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://car3001.it/"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Servizi",
          "item": "https://car3001.it/servizi/"
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": "Cambio gomme e cerchi",
          "item": "https://car3001.it/servizi/cambio-gomme-cerchi/"
        }
      ]
    },
    {
      "@type": "Service",
      "@id": "https://car3001.it/servizi/cambio-gomme-cerchi/#service",
      "name": "Cambio gomme e cerchi",
      "serviceType": "Cambio gomme e cerchi",
      "description": "Il servizio di cambio gomme e cerchi di Nuova Car 3001 comprende la sostituzione di pneumatici stagionali, nuovi o usati e l'equilibratura. La carrozzeria si trova a Cologno Monzese, in Via G. Rossini 38. Contattaci per indicare le esigenze del veicolo e richiedere un preventivo per la lavorazione.",
      "url": "https://car3001.it/servizi/cambio-gomme-cerchi/",
      "image": "https://car3001.it/assets/img/gomma.webp",
      "provider": {
        "@id": "https://car3001.it/#organization"
      },
      "areaServed": {
        "@type": "City",
        "name": "Cologno Monzese"
      }
    }
  ]
}
```

La funzione che abilita le offerte è in `scripts/lib/site.js`: emette Offer con `itemOffered`, `seller`, `url`, descrizione qualificata e `PriceSpecification.minPrice`, evitando di rappresentare il prezzo iniziale come un importo fisso per qualsiasi intervento.

## JSON-LD di riferimento: FAQ

Le domande e le risposte derivano dalla stessa funzione che produce il contenuto visibile.

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "FAQPage",
      "@id": "https://car3001.it/faq/#webpage",
      "url": "https://car3001.it/faq/",
      "name": "Domande frequenti sui servizi auto | Nuova Car 3001",
      "description": "Sede, servizi, cambio gomme, tagliandi OBD, pulizia auto e preventivi di Nuova Car 3001 a Cologno Monzese. Consulta le FAQ e contatta la carrozzeria.",
      "inLanguage": "it",
      "isPartOf": {
        "@id": "https://car3001.it/#website"
      },
      "about": {
        "@id": "https://car3001.it/#organization"
      },
      "dateModified": "2026-10-15T08:34:06.663Z",
      "breadcrumb": {
        "@id": "https://car3001.it/faq/#breadcrumb"
      },
      "mainEntity": [
        {
          "@type": "Question",
          "name": "Dove si trova Nuova Car 3001?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Nuova Car 3001 si trova in Via G. Rossini 38, 20093 Cologno Monzese (MI). Nella pagina Contatti trovi il collegamento alle indicazioni stradali."
          }
        },
        {
          "@type": "Question",
          "name": "Quali servizi offre la carrozzeria?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "I servizi presentati sono: Cambio gomme e cerchi, Tagliandi auto, Verniciatura e lucidatura fari, Pulizia e lucidatura auto, Levabolli, Elettrauto."
          }
        },
        {
          "@type": "Question",
          "name": "Il cambio gomme comprende l'equilibratura?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Sì. Il servizio di sostituzione pneumatici e/o cerchi presentato da Nuova Car 3001 comprende l'equilibratura."
          }
        },
        {
          "@type": "Question",
          "name": "Il tagliando comprende un controllo diagnostico?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Sì. Il tagliando presentato da Nuova Car 3001 include il controllo diagnostico OBD, il sistema di diagnostica di bordo del veicolo."
          }
        },
        {
          "@type": "Question",
          "name": "Come posso richiedere un preventivo?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Puoi chiamare il numero +39 02 99200616 oppure scrivere a car3001@car3001.it, indicando il veicolo e il servizio desiderato. Lavorazioni e costo finale vanno concordati direttamente con la carrozzeria."
          }
        },
        {
          "@type": "Question",
          "name": "Come viene svolta la pulizia dell'auto?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Il lavaggio e l'aspirazione interna sono proposti tramite un partner di fiducia. L'igienizzazione è disponibile su richiesta; per la lucidatura professionale occorre concordare il relativo intervento."
          }
        }
      ]
    }
  ]
}
```

## Anteprima verificata

![Home del sito dopo l'implementazione](seo/preview-desktop.jpg)
