# [AI] Remove Pages

## Obiettivo

Rimuovere pagine specifiche da un PDF.

## Contesto

- **Esempio:** PDF 10 pagine, rimuovi 2, 4, 6 → nuovo PDF con 7 pagine
- **Inverso di Extract:** si tengono tutte le pagine tranne quelle indicate

## Specifiche tecniche

### Backend
- **Route:** `app/api/remove/route.ts`
- **Metodo:** POST
- **FormData:** `file` (PDF), `pages` (stringa es. "2, 4, 6")
- **Risposta:** PDF binario
- **pdf-service:** `removePages(buffer: Buffer, pagesToRemove: number[]): Promise<Buffer>`
  - Copia tutte le pagine tranne quelle in pagesToRemove
  - Usa copyPages con gli indici da mantenere

### Frontend
- **Componente:** OperationCard con FileDrop + PageInput
- **Input pagine:** placeholder "2, 4, 6" (pagine da rimuovere)
- **Stesso pattern di Extract**

## Criteri di accettazione

- [ ] Upload PDF
- [ ] Input pagine da rimuovere
- [ ] Download PDF senza quelle pagine
- [ ] Gestione errori (es. rimuovere tutte le pagine)
