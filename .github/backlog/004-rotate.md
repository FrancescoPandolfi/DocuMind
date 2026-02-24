# [AI] Rotate Pages

## Obiettivo

Ruotare pagine di un PDF (90°, 180°, 270°).

## Contesto

- **Esempio:** ruotare pagine 2 e 3 di 90° in senso orario
- **Tutte le pagine:** se pages vuoto o "all", ruota tutto il PDF

## Specifiche tecniche

### Backend
- **Route:** `app/api/rotate/route.ts`
- **Metodo:** POST
- **FormData:** `file` (PDF), `pages` (stringa), `angle` (90 | 180 | 270)
- **Risposta:** PDF binario
- **pdf-service:** `rotatePages(buffer: Buffer, pages: number[], angle: number): Promise<Buffer>`
  - `page.rotate(angle)` per ogni pagina indicata
  - pdf-lib: angle in gradi (90, 180, 270)

### Frontend
- **Componente:** OperationCard con FileDrop + PageInput + Select
- **Select:** 90°, 180°, 270°
- **Input pagine:** "all" o "1, 3, 5" per pagine specifiche

## Criteri di accettazione

- [ ] Upload PDF
- [ ] Selezione angolo (90/180/270)
- [ ] Selezione pagine (tutte o specifiche)
- [ ] Download PDF ruotato
- [ ] Gestione errori
