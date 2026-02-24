# [AI] Componenti comuni

## Obiettivo

Implementare i componenti riutilizzabili usati da tutte le operazioni.

## Contesto

- **Priorità:** Da fare prima o in parallelo con le operazioni
- **Riferimento:** Piano Fase 1, step 3

## Componenti da creare

### FileDrop
- **Props:** `onDrop: (files: File[]) => void`, `accept?: string`, `multiple?: boolean`
- **Comportamento:** zona drag & drop, click per aprire file picker
- **Stile:** `border-2 border-dashed`, `hover:border-blue-500`, Tailwind
- **Eventi:** onDragOver (preventDefault), onDrop, onChange su input nascosto

### OperationCard
- **Props:** `title: string`, `description?: string`, `children: ReactNode`
- **Layout:** card con `rounded-lg shadow`, titolo, contenuto
- **Usato da:** ogni operazione nella home

### PageInput
- **Props:** `value: string`, `onChange: (value: string) => void`, `placeholder?: string`
- **Validazione:** `parsePages(value): number[] | number[][]` - ritorna array o array di intervalli
- **Placeholder default:** "1, 3, 5-8"
- **Utils:** `lib/utils.ts` con `parsePages()`, `parsePageRanges()`

## Criteri di accettazione

- [ ] FileDrop funziona con drag e click
- [ ] OperationCard layout consistente
- [ ] PageInput con validazione parsePages
- [ ] parsePages gestisce "1,3,5-8" e "1-3, 4-6"
- [ ] Styling Tailwind responsive
