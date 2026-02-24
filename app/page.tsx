import Link from "next/link";
import {
  Pencil,
  Merge,
  Scissors,
  FileOutput,
  RotateCw,
  Trash2,
  type LucideIcon,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const TOOLS: {
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
];

export default function Home() {
  return (
    <div className="relative min-h-screen bg-background">
      <div
        className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(120,120,120,0.15),transparent)]"
        aria-hidden
      />
      <div className="relative z-10">
      <header className="border-b border-border bg-background/95 shadow-[0_4px_20px_rgba(0,0,0,0.4)] backdrop-blur-sm">
        <div className="mx-auto max-w-5xl px-4 py-5">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/20">
              <svg
                className="size-5 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              DocuMind
            </h1>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-10">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-foreground">
            Strumenti disponibili
          </h2>
          <p className="mt-1 text-muted-foreground">
            Scegli lo strumento per iniziare
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {TOOLS.map((tool) => {
            const Icon = tool.icon;
            return (
            <Link key={tool.href} href={tool.href}>
              <Card className="h-full transition-all hover:border-border hover:bg-card/80">
                <CardHeader className="pb-2">
                  <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-primary/15">
                    <Icon className="size-5 text-primary" />
                  </div>
                  <CardTitle className="text-base font-semibold">{tool.title}</CardTitle>
                  <CardDescription className="text-sm leading-relaxed">
                    {tool.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <span className="text-sm font-medium text-muted-foreground hover:text-foreground">
                    Apri →
                  </span>
                </CardContent>
              </Card>
            </Link>
            );
          })}
        </div>
      </main>
      </div>
    </div>
  );
}
