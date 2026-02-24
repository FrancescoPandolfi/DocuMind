# [AI] Split PDF

## Obiettivo

Implementare l'operazione Split: dividere un PDF in più file secondo intervalli di pagine.

## Contesto

- **Esempio:** PDF 10 pagine, input "1-3, 4-6, 7-10" → 3 PDF
- **Riferimento:** Come Merge per struttura

## Specifiche tecniche

### Backend
- **Route:** `app/api/split/route.ts`
- **Metodo:** POST
- **FormData:** `file` (PDF), `pages` (stringa es. "1-3, 4-6, 7-10")
- **Risposta:** ZIP con PDF numerati (split-1.pdf, split-2.pdf, ...) oppure singolo PDF se un solo intervallo
- **pdf-service:** `splitPdf(buffer: Buffer, pageRanges: number[][]): Promise<Buffer[]>` 
  - `pageRanges` = [[1,3], [4,6], [7,10]]
  - Parsing: `parsePages()` in `lib/utils.ts` per convertire "1-3, 4-6" → [[1,3],[4,6]]

### Frontend
- **Componente:** OperationCard con FileDrop + PageInput
- **Input pagine:** placeholder "1-3, 4-6, 7-10"
- **Validazione:** regex per numeri e intervalli
- **Risposta:** se ZIP, gestire `application/zip` e download

## Criteri di accettazione

- [ ] Upload singolo PDF
- [ ] Input per intervalli (es. 1-3, 4-6)
- [ ] Validazione formato pagine
- [ ] Download ZIP con PDF risultanti
- [ ] Gestione errori
