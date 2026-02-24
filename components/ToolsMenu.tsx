"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { TOOLS } from "@/lib/tools";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const HOVER_DELAY = 150;

export function ToolsMenu() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelClose = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  };

  const scheduleClose = () => {
    closeTimeoutRef.current = setTimeout(() => setOpen(false), HOVER_DELAY);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen} modal={false}>
      <div
        onMouseEnter={() => {
          cancelClose();
          setOpen(true);
        }}
        onMouseLeave={scheduleClose}
      >
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" title="Strumenti">
            <Menu className="size-4" />
          </Button>
        </DropdownMenuTrigger>
      </div>
      <DropdownMenuContent
        align="end"
        className="min-w-[240px]"
        onMouseEnter={cancelClose}
        onMouseLeave={scheduleClose}
      >
        {TOOLS.map((tool) => {
          const Icon = tool.icon;
          const isActive = pathname === tool.href;
          return (
            <DropdownMenuItem key={tool.href} asChild>
              <Link
                href={tool.href}
                className={`flex items-center gap-3 py-2.5 ${isActive ? "bg-accent" : ""}`}
              >
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/15">
                  <Icon className="size-4 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-foreground">{tool.title}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {tool.description}
                  </p>
                </div>
              </Link>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
