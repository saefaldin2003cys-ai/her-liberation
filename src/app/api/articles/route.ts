import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { ArticleInput, createArticle, listArticles } from "@/lib/articles";
import { sanitizeArticleHtml } from "@/lib/sanitize";

// The MongoDB driver needs the Node runtime; it cannot run on the edge.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const includeDrafts = req.nextUrl.searchParams.get("drafts") === "1";
  // Drafts are only ever listed for an authenticated admin.
  const admin = includeDrafts ? await requireAdmin() : null;
  if (includeDrafts && admin) return admin;

  try {
    const articles = await listArticles({ includeDrafts });
    return Response.json({ articles });
  } catch (err) {
    console.error("GET /api/articles", err);
    return Response.json({ error: "Could not load articles" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = ArticleInput.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const input = parsed.data;
  input.content.ar = sanitizeArticleHtml(input.content.ar);
  if (input.content.en) {
    input.content.en = sanitizeArticleHtml(input.content.en);
  }

  try {
    const article = await createArticle(input);
    return Response.json({ article }, { status: 201 });
  } catch (err) {
    console.error("POST /api/articles", err);
    return Response.json({ error: "Could not save article" }, { status: 500 });
  }
}
