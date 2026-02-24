import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface OperationCardProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  showHeader?: boolean;
}

export function OperationCard({
  title,
  description,
  children,
  className = "",
  showHeader = true,
}: OperationCardProps) {
  return (
    <Card
      className={cn(
        "transition-all hover:border-border/80",
        className
      )}
    >
      {showHeader && (title || description) && (
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {description && (
            <CardDescription>{description}</CardDescription>
          )}
        </CardHeader>
      )}
      <CardContent className={showHeader && (title || description) ? "" : "pt-6"}>
        {children}
      </CardContent>
    </Card>
  );
}
