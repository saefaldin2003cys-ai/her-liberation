import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth";
import {
  ArticleInput,
  deleteArticle,
  getArticle,
  updateArticle,
} from "@/lib/articles";
import { sanitizeArticleHtml } from "@/lib/sanitize";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  try {
    const article = await getArticle(id);
    if (!article) return Response.json({ error: "Not found" }, { status: 404 });
    return Response.json({ article });
  } catch (err) {
    console.error("GET /api/articles/[id]", err);
    return Response.json({ error: "Could not load article" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: Ctx) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;
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
    const article = await updateArticle(id, input);
    if (!article) return Response.json({ error: "Not found" }, { status: 404 });
    return Response.json({ article });
  } catch (err) {
    console.error("PUT /api/articles/[id]", err);
    return Response.json({ error: "Could not save article" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;
  try {
    const ok = await deleteArticle(id);
    if (!ok) return Response.json({ error: "Not found" }, { status: 404 });
    return Response.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/articles/[id]", err);
    return Response.json({ error: "Could not delete article" }, { status: 500 });
  }
}
