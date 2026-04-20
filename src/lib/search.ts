import { create, load, search as oramaSearch } from "@orama/orama";
import type { Orama, Results } from "@orama/orama";

const SCHEMA = {
  type: "enum",
  slug: "string",
  title: "string",
  body: "string",
  excerpt: "string",
  meta: "string",
  badge: "string",
  url: "string",
  category: "string",
  tags: "string",
} as const;

export interface SearchDoc {
  type: "post" | "wiki" | "plugin" | "page";
  slug: string;
  title: string;
  body: string;
  excerpt: string;
  meta: string;
  badge: string;
  url: string;
  category: string;
  tags: string;
}

let dbInstance: Orama<typeof SCHEMA> | null = null;

async function getDb(): Promise<Orama<typeof SCHEMA>> {
  if (dbInstance) return dbInstance;

  const res = await fetch("/search-index.json");
  const data = await res.json();

  const db = create({ schema: SCHEMA });
  load(db, data);
  dbInstance = db;
  return db;
}

export async function searchIndex(
  term: string,
  filterType?: "post" | "wiki" | "plugin" | "page",
): Promise<Results<Orama<typeof SCHEMA>>> {
  const db = await getDb();
  return oramaSearch(db, {
    mode: "fulltext",
    term,
    properties: ["title", "body", "excerpt", "tags"],
    tolerance: 1,
    ...(filterType ? { where: { type: { eq: filterType } } } : {}),
    limit: 20,
  });
}
