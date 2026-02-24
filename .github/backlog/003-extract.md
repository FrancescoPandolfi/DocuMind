# [AI] Extract Pages

## Obiettivo

Estrarre pagine specifiche da un PDF in un nuovo PDF.

## Contesto

- **Esempio:** PDF 10 pagine, input "1, 3, 5, 7" → nuovo PDF con 4 pagine
- **Differenza da Split:** Extract crea UN solo PDF con le pagine selezionate

## Specifiche tecniche

### Backend
- **Route:** `app/api/extract/route.ts`
- **Metodo:** POST
- **FormData:** `file` (PDF), `pages` (stringa es. "1, 3, 5-8")
- **Risposta:** PDF binario
- **pdf-service:** `extractPages(buffer: Buffer, pages: number[]): Promise<Buffer>`
  - `pages` = [1, 3, 5, 6, 7, 8] (espanso da 5-8)
  - Usa `copyPages()` per copiare solo le pagine richieste

### Frontend
- **Componente:** OperationCard con FileDrop + PageInput
- **Input pagine:** placeholder "1, 3, 5-8"
- **Stesso PageInput e parsePages() di Split**

## Criteri di accettazione

- [ ] Upload singolo PDF
- [ ] Input pagine (singole e intervalli)
- [ ] Download PDF estratto
- [ ] Gestione errori (pagine fuori range)
