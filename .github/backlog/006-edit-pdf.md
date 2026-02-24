# [AI] Modifica PDF

## Obiettivo

Pagina dedicata per aggiungere immagini e testo sopra le pagine di un PDF.

## Contesto

- **Priorità:** Alta (pagina edit.html)
- **Dipendenze:** pdfjs-dist per anteprima
- **Riferimento:** Piano Fase 2

## Specifiche tecniche

### Backend
- **Route:** `app/api/edit/route.ts`
- **Metodo:** POST
- **FormData:** `pdf` (file), `images` (array File), `overlays` (JSON string)
- **overlays formato:** `[{ type: "image", imageIndex: 0, page: 1, x: 10, y: 80, width: 50, height: 30 }, { type: "text", page: 1, x: 20, y: 50, content: "Testo", size: 12 }]`
- **Coordinate:** x, y, width, height in percentuale (0-100)
- **pdf-service:** `editPdf(buffer, overlays, imageBuffers): Promise<Buffer>`

### Frontend
- **Pagina:** `app/edit/page.tsx`
- **Layout:** grid 2 colonne - anteprima sinistra, pannello destra
- **PdfPreview:** componente con pdfjs-dist per render su canvas
- **Pannello:** FileDrop immagini, input testo, lista overlays con remove
- **Form:** per ogni overlay: page, x%, y%, width%, height%
- **Modalità MVP:** form con coordinate, non drag visivo

## Criteri di accettazione

- [ ] Upload PDF con anteprima
- [ ] Aggiungere immagini (PNG/JPG) con posizione
- [ ] Aggiungere testo con posizione
- [ ] Lista elementi con rimuovi
- [ ] Bottone "Applica" → download PDF modificato
- [ ] Gestione errori
