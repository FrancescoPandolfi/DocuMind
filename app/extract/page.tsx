import { ToolPageLayout } from "@/components/ToolPageLayout";
import { ExtractForm } from "@/components/ExtractForm";

export default function ExtractPage() {
  return (
    <ToolPageLayout title="Estrai pagine">
      <div className="mx-auto max-w-2xl">
        <ExtractForm showHeader={false} />
      </div>
    </ToolPageLayout>
  );
}
