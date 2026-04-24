import { NewsletterForm } from "@/components/NewsletterForm";

interface SeoCaptureProps {
  section: "solutions" | "compare";
  title: string;
}

export function SeoCapture({ section, title }: SeoCaptureProps) {
  const isCompare = section === "compare";

  return (
    <div className="seo-capture">
      <NewsletterForm
        compact
        title={isCompare ? "Get the evaluation checklist" : "Get the workflow guide"}
        description={
          isCompare
            ? `Comparing ${title}? Get release notes, practical evaluation prompts, and product updates without chasing every changelog.`
            : `Exploring ${title}? Get practical setup notes, release updates, and workflow tips as Tabularis evolves.`
        }
        buttonLabel={isCompare ? "Send checklist" : "Send guide"}
      />
    </div>
  );
}
