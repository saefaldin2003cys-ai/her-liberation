import { ObjectId, type Collection } from "mongodb";
import { z } from "zod";
import { getDb } from "./mongodb";

/**
 * Articles are bilingual. Arabic is required; English falls back to Arabic
 * when it is not supplied, so a half-translated article still renders rather
 * than showing an empty page in one locale.
 */
const Bilingual = z.object({
  ar: z.string(),
  en: z.string().optional(),
});

export const ArticleInput = z.object({
  title: z.object({ ar: z.string().min(1).max(200), en: z.string().max(200).optional() }),
  author: Bilingual.optional(),
  authorBio: Bilingual.optional(),
  /** HTML produced by the editor. Sanitised on write, never trusted on read. */
  content: z.object({ ar: z.string().min(1), en: z.string().optional() }),
  excerpt: Bilingual.optional(),
  coverImage: z.string().url().or(z.literal("")).optional(),
  slug: z
    .string()
    .regex(/^[a-z0-9؀-ۿ]+(?:-[a-z0-9؀-ۿ]+)*$/, "invalid slug")
    .max(120)
    .optional(),
  published: z.boolean().default(true),
});

export type ArticleInput = z.infer<typeof ArticleInput>;

export type Article = ArticleInput & {
  _id: string;
  createdAt: string;
  updatedAt: string;
};

type ArticleDoc = Omit<Article, "_id"> & { _id?: ObjectId };

async function col(): Promise<Collection<ArticleDoc>> {
  const db = await getDb();
  return db.collection<ArticleDoc>("articles");
}

function toArticle(doc: ArticleDoc): Article {
  const { _id, ...rest } = doc;
  return { ...rest, _id: String(_id) };
}

/** Turns a title into a URL-safe slug, keeping Arabic letters intact. */
export function slugify(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 120);
}

export async function listArticles({
  includeDrafts = false,
  limit = 50,
}: { includeDrafts?: boolean; limit?: number } = {}): Promise<Article[]> {
  const c = await col();
  const docs = await c
    .find(includeDrafts ? {} : { published: { $ne: false } })
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray();
  return docs.map(toArticle);
}

export async function getArticle(idOrSlug: string): Promise<Article | null> {
  const c = await col();
  const or: Record<string, unknown>[] = [{ slug: idOrSlug }];
  if (ObjectId.isValid(idOrSlug)) or.push({ _id: new ObjectId(idOrSlug) });
  const doc = await c.findOne({ $or: or });
  return doc ? toArticle(doc) : null;
}

export async function createArticle(input: ArticleInput): Promise<Article> {
  const c = await col();
  const now = new Date().toISOString();
  const slug = input.slug || slugify(input.title.ar) || `article-${Date.now()}`;

  // Slugs are the public URL, so they have to be unique.
  const taken = await c.findOne({ slug });
  const finalSlug = taken ? `${slug}-${Date.now().toString(36)}` : slug;

  const doc: ArticleDoc = { ...input, slug: finalSlug, createdAt: now, updatedAt: now };
  const res = await c.insertOne(doc);
  return toArticle({ ...doc, _id: res.insertedId });
}

export async function updateArticle(
  id: string,
  input: ArticleInput,
): Promise<Article | null> {
  if (!ObjectId.isValid(id)) return null;
  const c = await col();
  const res = await c.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: { ...input, updatedAt: new Date().toISOString() } },
    { returnDocument: "after" },
  );
  return res ? toArticle(res) : null;
}

export async function deleteArticle(id: string): Promise<boolean> {
  if (!ObjectId.isValid(id)) return false;
  const c = await col();
  const res = await c.deleteOne({ _id: new ObjectId(id) });
  return res.deletedCount === 1;
}
