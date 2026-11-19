# Nuova Car 3001

Sito statico in italiano della carrozzeria a Cologno Monzese. HTML completo generato prima della pubblicazione: testi, navigazione, servizi e FAQ funzionano anche senza JavaScript.

## Modificare informazioni e contenuti

Il file da mantenere è **`src/data/site.json`**:

| Campo | Contenuto |
| --- | --- |
| `url` | URL HTTPS del sito, compresa l'eventuale sottocartella. Il dominio definitivo è `https://car3001.it`. |
| `name`, `telephone`, `telephoneLabel`, `email`, `address` | Identità, numero per i collegamenti, numero formattato, email e sede. |
| `pricing.enabled` | `false`: mostra “Preventivo su richiesta” e omette le offerte con prezzo. Impostare `true` dopo aver confermato il listino. |
| `services[].startingPrice` | Prezzo di partenza numerico; `null` per servizi solo su preventivo. Gli importi 40/90/70/20 sono conservati come provvisori. |
| `services[].priceScope` | Lavorazione cui si riferisce l'importo. Verificare in particolare cosa comprende il prezzo della pulizia. |
| `productBrands`, `insurancePartners` | Marchi e collaborazioni da verificare e aggiornare. |
| `socialProfiles` | Solo profili ufficiali: oggetti con `name` e `url` HTTPS; alimentano footer e `sameAs`. Nessun segnaposto pubblico. |
| `summary`, `aboutSummary`, `contactSummary`, `serviceSummary` | Introduzioni sintetiche condivise. |
| `services` | Slug, nome, metadati, immagini, introduzione, descrizione dettagliata ed elenco delle lavorazioni. |
| `pageMetadata` | Title e description delle pagine generali. |
| `presentation` | Testi brevi della home: copertina, presentazione, punti di forza, servizi e contatti. |
| `services[].displayName`, `services[].cardDescription` | Nome breve e descrizione sintetica delle schede fotografiche. Il nome completo e i metadati SEO restano nei campi dedicati. |
| `faq` | Domande e risposte visibili, riutilizzate nello schema FAQPage. Sede, elenco servizi e contatti vengono derivati dai campi condivisi. |

I testi possono usare `{{name}}`, `{{city}}`, `{{streetAddress}}`, `{{postalCode}}`, `{{telephoneLabel}}` e `{{email}}`: la build sostituisce questi riferimenti automaticamente, evitando copie da aggiornare separatamente. Usare JSON valido, senza commenti o virgole finali. Non rinominare gli slug già pubblicati senza predisporre redirect sul servizio di hosting.

## Build, controlli e anteprima

Richiede Node.js 18 o superiore. La build non richiede pacchetti npm esterni.

```sh
npm run build
npm run check
npm test
npm start
```

`npm start` genera il sito e avvia l'anteprima su `http://127.0.0.1:4173/` con la configurazione Aruba. Dopo una modifica ai sorgenti, eseguire nuovamente la build e ricaricare la pagina. CSS e JavaScript includono nell’URL una versione calcolata dal contenuto del file: quando cambia uno stile, il browser richiede la nuova versione senza riutilizzare quella precedente in cache. A parità di file la versione rimane stabile. La variabile `PORT` permette di scegliere un'altra porta.

La variabile di ambiente `SITE_URL` può sostituire l'URL configurato per una build, senza modificare i dati aziendali. Esempio per verificare una sottocartella: `SITE_URL=https://esempio.it/anteprima/ npm start` apre `http://127.0.0.1:4173/anteprima/`. Usare lo stesso valore per build, controlli e server locale. URL di risorse, link interni, canonical, Open Graph, JSON-LD, sitemap e Markdown vengono generati coerentemente per il percorso scelto.

- `src/data/`: configurazione e dimensioni delle immagini.
- `src/templates/site.js`: layout e componenti semantici condivisi.
- `src/css/`, `src/js/`: stili e menu mobile a miglioramento progressivo.
- `src/assets/`: fotografie originali e logo, per future ottimizzazioni.
- `public/`: asset statici; `robots.txt`, `llms.txt` e `llms-full.txt` sono rigenerati dalla build.
- `scripts/`: generazione, controlli e server locale.
- `seo/page-history.json`: impronte dei contenuti e relative date; conservarlo nel versionamento per mantenere `lastmod` stabile.
- `seo/examples/`: grafi JSON-LD completi di riferimento, rigenerati dalla build.
- `docs/`: output versionato pubblicato su Aruba tramite Plesk.
- `dist/`: output equivalente, escluso dal versionamento.

**Non modificare direttamente `docs/` o `dist/`: vengono ricreati dalla build.** Spostare eventuali file statici aggiuntivi, incluso un eventuale `CNAME`, in `public/`. Il precedente template Agency/Pug/Sass e i relativi script sono stati sostituiti per eliminare la divergenza tra sorgenti e sito pubblicabile.

La sitemap viene generata dalle rotte HTML canoniche. La data cambia quando cambia il contenuto HTML o un'immagine collegata; una build identica conserva la data precedente. Le versioni Markdown non vengono inserite nella sitemap HTML. Il file `llms.txt` segue la proposta aggiornata di [llmstxt.org](https://llmstxt.org/), con collegamenti alle versioni Markdown e relazioni `alternate`/`describedby` nelle pagine.

## Immagini

Le immagini usate sulle pagine sono WebP e hanno dimensioni esplicite. Le immagini principali hanno varianti responsive; le foto sotto la prima schermata usano caricamento differito. L'immagine social è JPEG 1200×630 per compatibilità con i client di condivisione.

Per sostituire le foto: aggiornare gli originali in `src/assets/`, eseguire `python3 scripts/optimize-images.py` con Pillow installato, quindi ricostruire. Aggiornare anche i testi alternativi in `site.json` quando cambia il soggetto. Pillow serve solo per rigenerare gli asset; il sito usa gli asset già presenti e la build ordinaria richiede solo Node.

## Pubblicazione e dati da completare

Plesk scarica il repository in `httpdocs/` su Aruba. Il `web.config` nella root instrada le richieste verso i file generati in `docs/`.

Il workflow `.github/workflows/ci.yml` esegue build, controlli e test usando il dominio configurato in `src/data/site.json`. Il workflow `.github/workflows/auto-build.yml` rigenera `docs/` quando cambiano i sorgenti su `master` e committa le differenze generate.

Prima della pubblicazione confermare listino, marchi/collaborazioni, contatti e testo sull'esperienza dei soci. Aggiungere i profili social ufficiali, gli orari verificati, i dati societari e le pagine informative legali con i testi corretti. Servono ancora fotografie reali dedicate al team e alle lavorazioni; i vecchi riferimenti a foto inesistenti sono stati rimossi.

Sul servizio di hosting verificare HTTPS, redirect della variante www quando si usa un dominio proprio, gestione di `index.html`, risposte HTTP 200 per gli URL pubblici e 404 per quelli inesistenti, accesso dei bot consentito anche da CDN/WAF e corretti tipi MIME. Se le versioni Markdown vengono proposte come risultati duplicati, si può configurare `X-Robots-Tag: noindex` per `.md` mantenendole accessibili ai crawler. La sitemap pubblica è `https://car3001.it/sitemap.xml`. Queste operazioni dipendono dagli account e dalla configurazione di hosting.

Per audit iniziale, interventi, codice generato e limiti delle verifiche, consultare **`SEO-AUDIT.md`**.

La grafica usa CSS dedicato, una sola famiglia di caratteri esterna e il piccolo script del menu. Le schede della home sono sintetiche; i dettagli sono nelle pagine dei servizi. FAQ, informazioni aggiuntive e tabella di confronto si aprono con elementi HTML `details`, funzionanti anche senza JavaScript. Bootstrap CSS e Roboto Slab non sono più caricati.

Layout inizialmente derivato da Start Bootstrap Agency (MIT); licenza originale conservata in `LICENSE`.
