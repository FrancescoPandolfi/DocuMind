"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ProtectPanelProps {
  pdfFile: File | null;
  onPdfChange: (file: File | null) => void;
  onProtect: (userPassword: string, ownerPassword?: string) => void;
  loading: boolean;
  error: string | null;
}

export function ProtectPanel({
  pdfFile,
  onPdfChange,
  onProtect,
  loading,
  error,
}: ProtectPanelProps) {
  const [userPassword, setUserPassword] = useState("");
  const [ownerPassword, setOwnerPassword] = useState("");

  const handleProtect = () => {
    onProtect(userPassword, ownerPassword.trim() || undefined);
  };

  return (
    <div className="space-y-6">
      {pdfFile && (
        <section>
          <h3 className="mb-2 text-sm font-semibold text-foreground">PDF</h3>
          <div className="flex items-center justify-between rounded-lg border border-border bg-muted px-3 py-2">
            <span className="truncate text-sm text-muted-foreground">{pdfFile.name}</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onPdfChange(null)}
              className="shrink-0 text-destructive hover:text-destructive"
            >
              Rimuovi
            </Button>
          </div>
        </section>
      )}

      <section>
        <Label htmlFor="user-password">Password per aprire (obbligatoria)</Label>
        <Input
          id="user-password"
          type="password"
          value={userPassword}
          onChange={(e) => setUserPassword(e.target.value)}
          placeholder="Inserisci password"
          className="mt-2"
          autoComplete="new-password"
        />
      </section>

      <section>
        <Label htmlFor="owner-password">Password proprietario (opzionale)</Label>
        <Input
          id="owner-password"
          type="password"
          value={ownerPassword}
          onChange={(e) => setOwnerPassword(e.target.value)}
          placeholder="Per modifiche e stampa"
          className="mt-2"
          autoComplete="new-password"
        />
        <p className="mt-1 text-xs text-muted-foreground">
          Se impostata, consente di modificare permessi senza conoscere la password utente
        </p>
      </section>

      {error && (
        <p className="rounded-lg bg-destructive/20 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      {pdfFile && (
        <Button
          type="button"
          className="w-full"
          onClick={handleProtect}
          disabled={loading || !userPassword.trim()}
        >
          {loading ? "Elaborazione..." : "Proteggi e scarica"}
        </Button>
      )}
    </div>
  );
}
