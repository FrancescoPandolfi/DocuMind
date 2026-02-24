---
name: Task per AI
about: Task strutturato per essere implementato dall'assistente AI
title: '[AI] '
labels: ai-task
assignees: ''
---

## Obiettivo

<!-- Descrizione concisa in 1-2 frasi -->

## Contesto

- **Cartella/file:** 
- **Riferimenti:** (es. "come fatto per Merge in app/api/merge/route.ts")

## Specifiche tecniche

### Backend
- **Route:** `app/api/[nome]/route.ts`
- **Metodo:** POST
- **FormData:**
  - `campo1`: (tipo, descrizione)
  - `campo2`: (tipo, descrizione)
- **Risposta:** (PDF, JSON, ZIP)
- **pdf-service:** `nomeFunzione(params)` in `lib/pdf-service.ts`

### Frontend
- **Pagina/Componente:** 
- **Stato necessario:** (useState per file, ecc.)
- **Chiamata API:** `fetch('/api/xxx', { method: 'POST', body: formData })`

## Criteri di accettazione

- [ ] 
- [ ] 
- [ ] 

## Esempio (opzionale)

```typescript
// Snippet di riferimento o pseudocodice
```
