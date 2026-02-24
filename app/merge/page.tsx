import { ToolPageLayout } from "@/components/ToolPageLayout";
import { MergeForm } from "@/components/MergeForm";

export default function MergePage() {
  return (
    <ToolPageLayout title="Unisci PDF">
      <div className="mx-auto max-w-2xl">
        <MergeForm showHeader={false} />
      </div>
    </ToolPageLayout>
  );
}
