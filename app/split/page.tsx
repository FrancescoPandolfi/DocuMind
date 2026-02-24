import { ToolPageLayout } from "@/components/ToolPageLayout";
import { SplitForm } from "@/components/SplitForm";

export default function SplitPage() {
  return (
    <ToolPageLayout title="Dividi PDF">
      <div className="mx-auto max-w-2xl">
        <SplitForm showHeader={false} />
      </div>
    </ToolPageLayout>
  );
}
