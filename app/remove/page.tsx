import { ToolPageLayout } from "@/components/ToolPageLayout";
import { RemoveForm } from "@/components/RemoveForm";

export default function RemovePage() {
  return (
    <ToolPageLayout title="Rimuovi pagine">
      <div className="mx-auto max-w-2xl">
        <RemoveForm showHeader={false} />
      </div>
    </ToolPageLayout>
  );
}
