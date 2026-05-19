import { NewsletterForm } from "@/components/NewsletterForm";

interface SeoCaptureProps {
  section: "solutions" | "compare";
  title: string;
}

export function SeoCapture({ section, title }: SeoCaptureProps) {
  const isCompare = section === "compare";

  let cleanCompareSubject = "these database clients";
  if (isCompare) {
    const cleaned = title
      .replace(/alternative for developers/i, "")
      .replace(/alternative/i, "")
      .replace(/tabularis\s+vs\.?\s+/i, "")
      .trim();
    if (cleaned) {
      cleanCompareSubject = cleaned;
    }
  }

  let cleanSolutionSubject = "this database workflow";
  const lowerTitle = title.toLowerCase();
  if (lowerTitle.includes("mcp") || lowerTitle.includes("ai")) {
    cleanSolutionSubject = "AI agent and MCP database workflows";
  } else if (lowerTitle.includes("explain")) {
    cleanSolutionSubject = "visual query optimization and EXPLAIN workflows";
  } else if (lowerTitle.includes("builder")) {
    cleanSolutionSubject = "visual query builder workflows";
  } else if (lowerTitle.includes("notebook")) {
    cleanSolutionSubject = "SQL notebook and reusable analysis workflows";
  } else if (lowerTitle.includes("postgres")) {
    cleanSolutionSubject = "PostgreSQL developer workflows";
  } else if (lowerTitle.includes("mysql")) {
    cleanSolutionSubject = "MySQL and MariaDB workflows";
  } else if (lowerTitle.includes("sqlite")) {
    cleanSolutionSubject = "SQLite workflows";
  } else if (lowerTitle.includes("secure") || lowerTitle.includes("tunnel")) {
    cleanSolutionSubject = "secure database access and SSH tunneling workflows";
  } else if (lowerTitle.includes("plugin")) {
    cleanSolutionSubject = "plugin-based database client extensibility";
  }

  return (
    <div className="seo-capture">
      <NewsletterForm
        compact
        title={isCompare ? "Get the evaluation checklist" : "Get the workflow guide"}
        description={
          isCompare
            ? `Evaluating ${cleanCompareSubject}? Get release notes, practical evaluation prompts, and product updates without chasing every changelog.`
            : `Exploring ${cleanSolutionSubject}? Get practical setup notes, release updates, and workflow tips as Tabularis evolves.`
        }
        buttonLabel={isCompare ? "Send checklist" : "Send guide"}
      />
    </div>
  );
}
