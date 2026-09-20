import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import {
  getAllSiteTexts,
  getSiteImages,
  updateSiteTexts,
  updateSiteImages,
  deepMerge,
  type SiteImages,
} from "@/lib/site-content";
import baseAr from "../../../../messages/ar.json";
import baseEn from "../../../../messages/en.json";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [dbTexts, images] = await Promise.all([
      getAllSiteTexts(),
      getSiteImages(),
    ]);

    const mergedAr = deepMerge(baseAr, dbTexts.ar || {});
    const mergedEn = deepMerge(baseEn, dbTexts.en || {});

    return NextResponse.json({
      texts: { ar: mergedAr, en: mergedEn },
      defaults: { ar: baseAr, en: baseEn },
      overrides: dbTexts,
      images,
    });
  } catch (err) {
    console.error("GET /api/site-content", err);
    return NextResponse.json(
      { error: "Failed to load site content" },
      { status: 500 },
    );
  }
}

export async function PUT(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const body = await req.json();

    if (body.texts && typeof body.texts === "object") {
      await updateSiteTexts(body.texts);
    }

    if (body.images && typeof body.images === "object") {
      await updateSiteImages(body.images as Partial<SiteImages>);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("PUT /api/site-content", err);
    return NextResponse.json(
      { error: "Failed to update site content" },
      { status: 500 },
    );
  }
}
