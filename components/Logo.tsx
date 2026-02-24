import { Skull } from "lucide-react";

interface LogoProps {
  className?: string;
  size?: number;
}

export function Logo({ className = "", size = 36 }: LogoProps) {
  return (
    <Skull
      size={size}
      className={className}
      strokeWidth={1.5}
      aria-hidden
    />
  );
}
