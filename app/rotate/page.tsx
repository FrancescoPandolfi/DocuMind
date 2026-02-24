import { ToolPageLayout } from "@/components/ToolPageLayout";
import { RotateForm } from "@/components/RotateForm";

export default function RotatePage() {
  return (
    <ToolPageLayout title="Ruota pagine">
      <div className="mx-auto max-w-2xl">
        <RotateForm showHeader={false} />
      </div>
    </ToolPageLayout>
  );
}
