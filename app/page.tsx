import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { ToolsMenu } from "@/components/ToolsMenu";
import { Logo } from "@/components/Logo";
import { TOOLS } from "@/lib/tools";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-background">
      <div
        className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(120,120,120,0.15),transparent)]"
        aria-hidden
      />
      <div className="relative z-10">
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 shadow-[0_4px_20px_rgba(0,0,0,0.4)] backdrop-blur-sm">
        <div className="mx-auto max-w-5xl px-4 py-5">
          <div className="flex items-center justify-between gap-3">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
                <Logo size={28} className="text-primary" />
              </div>
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                DocuMind
              </h1>
            </Link>
            <div className="flex items-center gap-2">
              <ToolsMenu />
              <ThemeToggle />
            </div>
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
