# DocuMind

**DocuMind** è un'applicazione web per gestire e manipolare file PDF. Unisci, dividi, ruota, estrai pagine, rimuovi contenuti e modifica i tuoi documenti PDF direttamente dal browser.

**[→ Apri l'app](https://docu-mind-pdf.vercel.app/)**

![DocuMind](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38B2AC?style=flat-square&logo=tailwind-css)

## Funzionalità

| Strumento | Descrizione |
|-----------|-------------|
| **Modifica PDF** | Aggiungi testo, immagini e forme ai tuoi PDF |
| **Immagini in PDF** | Crea un PDF da immagini PNG o JPG |
| **Unisci PDF** | Combina più file PDF in un unico documento |
| **Dividi PDF** | Divide un PDF in più file per intervalli di pagine |
| **Estrai pagine** | Estrai pagine specifiche da un PDF |
| **Ruota pagine** | Ruota pagine di 90°, 180° o 270° |
| **Rimuovi pagine** | Rimuovi pagine specifiche da un PDF |
| **Proteggi con password** | Aggiungi protezione con password al PDF |
| **Aggiungi watermark** | Aggiungi testo o logo su ogni pagina |
| **Numera pagine** | Aggiungi numerazione alle pagine |

## Tecnologie

- **[Next.js 16](https://nextjs.org/)** – Framework React con App Router
- **[React 19](https://react.dev/)** – Libreria UI
- **[TypeScript](https://www.typescriptlang.org/)** – Tipizzazione statica
- **[Tailwind CSS 4](https://tailwindcss.com/)** – Styling utility-first
- **[pdf-lib](https://pdf-lib.js.org/)** – Manipolazione PDF lato client/server
- **[pdf-lib-with-encrypt](https://github.com/sico/pdf-lib-with-encrypt)** – Protezione PDF con password
- **[pdfjs-dist](https://mozilla.github.io/pdf.js/)** – Rendering e visualizzazione PDF (Modifica)
- **[shadcn/ui](https://ui.shadcn.com/)** – Componenti UI
- **[Lucide React](https://lucide.dev/)** – Icone

## Requisiti

- **Node.js** 18.17 o superiore
- **npm** o **pnpm** o **yarn**

## Installazione

```bash
# Clona il repository
git clone https://github.com/FrancescoPandolfi/DocuMind.git
cd DocuMind

# Installa le dipendenze
npm install

# Avvia il server di sviluppo
npm run dev
```

L'app sarà disponibile su [http://localhost:3000](http://localhost:3000).

## Script disponibili

| Comando | Descrizione |
|---------|-------------|
| `npm run dev` | Avvia il server di sviluppo |
| `npm run build` | Crea la build di produzione |
| `npm run start` | Avvia il server di produzione |
| `npm run lint` | Esegue ESLint |

## Struttura del progetto

```
DocuMind/
├── app/
│   ├── api/              # API Routes (merge, split, extract, rotate, remove, edit, protect, watermark, page-numbers, images-to-pdf)
│   ├── edit/             # Pagina Modifica PDF
│   ├── images-to-pdf/    # Pagina Immagini in PDF
│   ├── merge/            # Pagina Unisci PDF
│   ├── split/            # Pagina Dividi PDF
│   ├── extract/          # Pagina Estrai pagine
│   ├── rotate/           # Pagina Ruota pagine
│   ├── remove/           # Pagina Rimuovi pagine
│   ├── protect/          # Pagina Proteggi con password
│   ├── watermark/        # Pagina Aggiungi watermark
│   ├── page-numbers/     # Pagina Numera pagine
│   ├── layout.tsx        # Layout principale
│   ├── page.tsx          # Homepage
│   └── globals.css       # Stili globali
├── components/           # Componenti React
│   ├── ui/               # Componenti shadcn/ui
│   ├── FileDrop.tsx      # Dropzone per file
│   ├── PdfPreview.tsx    # Anteprima PDF
│   ├── ToolsMenu.tsx     # Menu strumenti
│   └── ...
├── lib/
│   ├── pdf-service.ts    # Logica di manipolazione PDF
│   ├── tools.ts          # Registro strumenti
│   └── utils.ts          # Utility
└── package.json
```

## API

Le operazioni PDF sono esposte come API Route Next.js:

| Endpoint | Metodo | Descrizione |
|----------|--------|-------------|
| `/api/merge` | POST | Unisce più PDF (FormData: `files`) |
| `/api/split` | POST | Divide un PDF (FormData: `file`, `pages` – es. "1-3, 4-6") |
| `/api/extract` | POST | Estrae pagine (FormData: `file`, `pages`) |
| `/api/rotate` | POST | Ruota pagine (FormData: `file`, `rotations`) |
| `/api/remove` | POST | Rimuove pagine (FormData: `file`, `pages`) |
| `/api/edit` | POST | Modifica PDF (FormData: `file`, `overlays` JSON) |
| `/api/protect` | POST | Protegge PDF con password (FormData: `file`, `userPassword`, `ownerPassword`) |
| `/api/watermark` | POST | Aggiunge watermark (FormData: `file`, `text`, `position`, `opacity`, `image`) |
| `/api/page-numbers` | POST | Aggiunge numerazione pagine (FormData: `file`, `position`, `startFrom`) |
| `/api/images-to-pdf` | POST | Crea PDF da immagini (FormData: `files`) |

## Privacy e sicurezza

- **Tutto il processing avviene lato server** – i file non vengono salvati in modo permanente
- **Nessun tracking** – nessun dato viene inviato a servizi esterni
- **Open source** – il codice è ispezionabile e modificabile

## Licenza

Questo progetto è privato. Per informazioni sulla licenza, contatta il maintainer.

## Autore

**Francesco Pandolfi**

- GitHub: [@FrancescoPandolfi](https://github.com/FrancescoPandolfi)
- Repository: [DocuMind](https://github.com/FrancescoPandolfi/DocuMind)
