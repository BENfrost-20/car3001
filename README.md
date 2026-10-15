# Nuova Car 3001

Sito statico in italiano della carrozzeria a Cologno Monzese. HTML completo generato prima della pubblicazione: testi, navigazione, servizi e FAQ funzionano anche senza JavaScript.

## Modificare informazioni e contenuti

Il file da mantenere è **`src/data/site.json`**:

| Campo | Contenuto |
| --- | --- |
| `url` | URL HTTPS del sito, compresa l'eventuale sottocartella. Attualmente `https://benfrost-20.github.io/car3001`. Per un dominio proprio usare, ad esempio, `https://car3001.it`. |
| `name`, `telephone`, `telephoneLabel`, `email`, `address` | Identità, numero per i collegamenti, numero formattato, email e sede. |
| `pricing.enabled` | `false`: mostra “Preventivo su richiesta” e omette le offerte con prezzo. Impostare `true` dopo aver confermato il listino. |
| `services[].startingPrice` | Prezzo di partenza numerico; `null` per servizi solo su preventivo. Gli importi 40/90/70/20 sono conservati come provvisori. |
| `services[].priceScope` | Lavorazione cui si riferisce l'importo. Verificare in particolare cosa comprende il prezzo della pulizia. |
| `productBrands`, `insurancePartners` | Marchi e collaborazioni da verificare e aggiornare. |
| `socialProfiles` | Solo profili ufficiali: oggetti con `name` e `url` HTTPS; alimentano footer e `sameAs`. Nessun segnaposto pubblico. |
| `summary`, `aboutSummary`, `contactSummary`, `serviceSummary` | Introduzioni sintetiche condivise. |
| `services` | Slug, nome, metadati, immagini, introduzione, descrizione dettagliata ed elenco delle lavorazioni. |
| `pageMetadata` | Title e description delle pagine generali. |
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

`npm start` genera il sito e avvia l'anteprima su `http://127.0.0.1:4173/car3001/` con la configurazione attuale. Il server locale riproduce la sottocartella della pubblicazione, così risorse e navigazione vengono verificate nello stesso contesto. Dopo una modifica ai sorgenti, eseguire nuovamente la build e ricaricare la pagina. La variabile `PORT` permette di scegliere un'altra porta.

La variabile di ambiente `SITE_URL` può sostituire l'URL configurato per una build, senza modificare i dati aziendali. Esempio per verificare un dominio proprio: `SITE_URL=https://car3001.it npm start`. Usare lo stesso valore per build, controlli e server locale. URL di risorse, link interni, canonical, Open Graph, JSON-LD, sitemap e Markdown vengono generati coerentemente per il percorso scelto.

- `src/data/`: configurazione e dimensioni delle immagini.
- `src/templates/site.js`: layout e componenti semantici condivisi.
- `src/css/`, `src/js/`: stili e menu mobile a miglioramento progressivo.
- `src/assets/`: fotografie originali e logo, per future ottimizzazioni.
- `public/`: asset statici; `robots.txt`, `llms.txt` e `llms-full.txt` sono rigenerati dalla build.
- `scripts/`: generazione, controlli e server locale.
- `seo/page-history.json`: impronte dei contenuti e relative date; conservarlo nel versionamento per mantenere `lastmod` stabile.
- `seo/examples/`: grafi JSON-LD completi di riferimento, rigenerati dalla build.
- `docs/`: output versionato, utilizzabile per GitHub Pages o hosting statico.
- `dist/`: output equivalente, escluso dal versionamento.

**Non modificare direttamente `docs/` o `dist/`: vengono ricreati dalla build.** Spostare eventuali file statici aggiuntivi, incluso un eventuale `CNAME`, in `public/`. Il precedente template Agency/Pug/Sass e i relativi script sono stati sostituiti per eliminare la divergenza tra sorgenti e sito pubblicabile.

La sitemap viene generata dalle rotte HTML canoniche. La data cambia quando cambia il contenuto HTML o un'immagine collegata; una build identica conserva la data precedente. Le versioni Markdown non vengono inserite nella sitemap HTML. Il file `llms.txt` segue la proposta aggiornata di [llmstxt.org](https://llmstxt.org/), con collegamenti alle versioni Markdown e relazioni `alternate`/`describedby` nelle pagine.

## Immagini

Le immagini usate sulle pagine sono WebP e hanno dimensioni esplicite. Le immagini principali hanno varianti responsive; le foto sotto la prima schermata usano caricamento differito. L'immagine social è JPEG 1200×630 per compatibilità con i client di condivisione.

Per sostituire le foto: aggiornare gli originali in `src/assets/`, eseguire `python3 scripts/optimize-images.py` con Pillow installato, quindi ricostruire. Aggiornare anche i testi alternativi in `site.json` quando cambia il soggetto. Pillow serve solo per rigenerare gli asset; il sito usa gli asset già presenti e la build ordinaria richiede solo Node.

## Pubblicazione e dati da completare

Pubblicare il contenuto di `docs/` oppure `dist/` all'URL configurato, che può includere una sottocartella. I file generati rimangono direttamente nell'output: non creare un'altra directory `car3001` dentro `docs/` o `dist/`.

Il workflow `.github/workflows/pages.yml` genera, controlla e pubblica `dist/` a ogni push su `master` o `main`. Nelle impostazioni del repository scegliere **Settings → Pages → Build and deployment → Source: GitHub Actions**. Il workflow ricava l'URL effettivo dall'azione ufficiale `configure-pages`: il prefisso `/car3001` e un eventuale dominio personalizzato vengono gestiti automaticamente. In alternativa, pubblicando dalla branch, selezionare la cartella `/docs` e ricostruirla prima del push.

Prima della pubblicazione confermare listino, marchi/collaborazioni, contatti e testo sull'esperienza dei soci. Aggiungere i profili social ufficiali, gli orari verificati, i dati societari e le pagine informative legali con i testi corretti. Servono ancora fotografie reali dedicate al team e alle lavorazioni; i vecchi riferimenti a foto inesistenti sono stati rimossi.

Sul servizio di hosting verificare HTTPS, redirect della variante www quando si usa un dominio proprio, gestione di `index.html`, risposte HTTP 200 per gli URL pubblici e 404 per quelli inesistenti, accesso dei bot consentito anche da CDN/WAF e corretti tipi MIME. Se le versioni Markdown vengono proposte come risultati duplicati, si può configurare `X-Robots-Tag: noindex` per `.md` mantenendole accessibili ai crawler. Inviare poi la sitemap all'indirizzo effettivo: con GitHub Pages è `https://benfrost-20.github.io/car3001/sitemap.xml`. Queste operazioni dipendono dagli account e dalla configurazione di hosting.

Su un sito GitHub Pages di progetto il file `robots.txt` è pubblicato in `/car3001/robots.txt`; i crawler cercano le direttive robots alla radice del dominio, quindi non considerarlo un controllo del crawling dell'host `benfrost-20.github.io`. Le regole diventano operative alla radice quando si usa un dominio dedicato, oppure gestendo il robots del sito principale dell'account.

Per audit iniziale, interventi, codice generato e limiti delle verifiche, consultare **`SEO-AUDIT.md`**.

Layout derivato da Start Bootstrap Agency (MIT); licenza originale conservata in `LICENSE`.
