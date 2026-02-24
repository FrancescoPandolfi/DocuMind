import type { LucideIcon } from "lucide-react";
import {
  Pencil,
  Merge,
  Scissors,
  FileOutput,
  RotateCw,
  Trash2,
  Lock,
  ImagePlus,
  Stamp,
  ListOrdered,
} from "lucide-react";

export const TOOLS: {
  href: string;
  title: string;
  description: string;
  icon: LucideIcon;
}[] = [
  {
    href: "/edit",
    title: "Modifica PDF",
    description: "Aggiungi testo, immagini e forme ai tuoi PDF",
    icon: Pencil,
  },
  {
    href: "/images-to-pdf",
    title: "Immagini in PDF",
    description: "Crea un PDF da immagini PNG o JPG",
    icon: ImagePlus,
  },
  {
    href: "/merge",
    title: "Unisci PDF",
    description: "Combina più file PDF in un unico documento",
    icon: Merge,
  },
  {
    href: "/split",
    title: "Dividi PDF",
    description: "Dividi un PDF in più file per intervalli di pagine",
    icon: Scissors,
  },
  {
    href: "/extract",
    title: "Estrai pagine",
    description: "Estrai pagine specifiche da un PDF",
    icon: FileOutput,
  },
  {
    href: "/rotate",
    title: "Ruota pagine",
    description: "Ruota pagine di 90°, 180° o 270°",
    icon: RotateCw,
  },
  {
    href: "/remove",
    title: "Rimuovi pagine",
    description: "Rimuovi pagine specifiche da un PDF",
    icon: Trash2,
  },
  {
    href: "/protect",
    title: "Proteggi con password",
    description: "Aggiungi protezione con password al PDF",
    icon: Lock,
  },
  {
    href: "/watermark",
    title: "Aggiungi watermark",
    description: "Aggiungi testo o logo su ogni pagina",
    icon: Stamp,
  },
  {
    href: "/page-numbers",
    title: "Numera pagine",
    description: "Aggiungi numerazione alle pagine",
    icon: ListOrdered,
  },
];
