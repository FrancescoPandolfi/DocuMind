# Issue per AI

Le issue in questo progetto sono strutturate per essere lette e implementate dall'assistente AI.

## Come creare un'issue

1. Vai su **Issues** → **New Issue**
2. Scegli il template:
   - **Nuova funzionalità** – per aggiungere operazioni (Merge, Split, ecc.)
   - **Bug** – per segnalare malfunzionamenti
   - **Task per AI** – per task generici con specifiche tecniche complete

## Sezione "Dettagli tecnici (per AI)"

Compila sempre questa sezione quando vuoi che l'AI implementi la feature. Include:

- Endpoint API (metodo, path, body)
- Funzione in `lib/pdf-service.ts`
- Componenti UI coinvolti
- File da creare/modificare

## Riferimento per l'AI

L'AI può leggere le issue da:
- GitHub (se il repo è connesso a Cursor)
- File locali in `.github/ISSUE_TEMPLATE/`
- Citare l'issue nel prompt: "Implementa l'issue #3"
