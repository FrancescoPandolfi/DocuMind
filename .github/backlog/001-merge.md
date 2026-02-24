# [AI] Merge PDF

## Obiettivo

Implementare l'operazione Merge: unire più PDF in un unico file.

## Contesto

- **Priorità:** Alta (prima operazione da implementare)
- **Riferimento:** Piano Fase 1

## Specifiche tecniche

### Backend
- **Route:** `app/api/merge/route.ts`
- **Metodo:** POST
- **FormData:** `files` (array di File PDF)
- **Risposta:** PDF binario, header `Content-Disposition: attachment; filename=merged.pdf`
- **pdf-service:** `mergePdfs(buffers: Buffer[]): Promise<Buffer>` in `lib/pdf-service.ts`
  - Usa `PDFDocument.load()` + `copyPages()` + `addPage()` per ogni PDF

### Frontend
- **Componente:** `OperationCard` nella home `app/page.tsx`
- **Stato:** `useState<File[]>` per lista file
- **UI:** FileDrop che accetta multipli PDF, lista con anteprima nome + pulsante rimuovi
- **Chiamata:** `fetch('/api/merge', { method: 'POST', body: formData })` → blob → download

## Criteri di accettazione

- [ ] Upload multipli PDF via drag & drop
- [ ] Possibilità di rimuovere file dalla lista prima di eseguire
- [ ] Bottone "Unisci" che invia la richiesta
- [ ] Download automatico del PDF risultante
- [ ] Gestione errori (file non validi, errore server)
