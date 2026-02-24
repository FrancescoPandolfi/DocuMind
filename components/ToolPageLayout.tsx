"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

interface ToolPageLayoutProps {
  title: string;
  children: React.ReactNode;
}

export function ToolPageLayout({ title, children }: ToolPageLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background/95 shadow-[0_4px_20px_rgba(0,0,0,0.4)] backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 py-5">
          <div className="flex items-center justify-between">
            <Button variant="link" asChild className="text-muted-foreground hover:text-foreground">
              <Link href="/">← Torna alla home</Link>
            </Button>
            <h1 className="text-xl font-bold text-foreground">{title}</h1>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
    </div>
  );
}
