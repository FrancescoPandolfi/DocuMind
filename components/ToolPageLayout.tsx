"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { ToolsMenu } from "@/components/ToolsMenu";
import { Logo } from "@/components/Logo";

interface ToolPageLayoutProps {
  title: string;
  children: React.ReactNode;
}

export function ToolPageLayout({ title, children }: ToolPageLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 shadow-[0_4px_20px_rgba(0,0,0,0.4)] backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 py-5">
          <div className="grid grid-cols-3 items-center gap-4">
            <Link href="/" className="flex items-center gap-2 justify-self-start text-muted-foreground hover:text-foreground">
              <Logo size={24} className="text-primary shrink-0" />
              <span>← Torna alla home</span>
            </Link>
            <h1 className="text-center text-xl font-bold text-foreground">{title}</h1>
            <div className="flex items-center justify-end gap-2">
              <ToolsMenu />
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
    </div>
  );
}
