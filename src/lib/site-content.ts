import { getDb } from "./mongodb";
import { DEFAULT_SITE_IMAGES, type SiteImages } from "./site-content-types";

export { DEFAULT_SITE_IMAGES, type SiteImages };

// Simple in-memory cache with 30-second TTL to keep queries fast and free
let cachedTexts: { data: Record<string, any>; timestamp: number } | null = null;
let cachedImages: { data: SiteImages; timestamp: number } | null = null;
const CACHE_TTL_MS = 30_000;

export function deepMerge(target: any, source: any): any {
  if (!source || typeof source !== "object") return target;
  if (!target || typeof target !== "object") return source;

  const output = { ...target };
  for (const key of Object.keys(source)) {
    if (
      source[key] &&
      typeof source[key] === "object" &&
      !Array.isArray(source[key])
    ) {
      output[key] = deepMerge(target[key] || {}, source[key]);
    } else if (source[key] !== undefined && source[key] !== null) {
      output[key] = source[key];
    }
  }
  return output;
}

export async function getSiteTexts(locale: string): Promise<Record<string, any>> {
  try {
    const now = Date.now();
    if (cachedTexts && now - cachedTexts.timestamp < CACHE_TTL_MS) {
      return cachedTexts.data[locale] || {};
    }

    const db = await getDb();
    const doc = await db.collection("site_content").findOne({ _id: "texts" as any });
    const data = doc ? (doc as any).content || {} : {};

    cachedTexts = { data, timestamp: now };
    return data[locale] || {};
  } catch (err) {
    console.error("[site-content] Failed to load site texts from DB:", err);
    return {};
  }
}

export async function getAllSiteTexts(): Promise<{ ar: Record<string, any>; en: Record<string, any> }> {
  try {
    const db = await getDb();
    const doc = await db.collection("site_content").findOne({ _id: "texts" as any });
    const content = doc ? (doc as any).content || {} : {};
    return {
      ar: content.ar || {},
      en: content.en || {},
    };
  } catch (err) {
    console.error("[site-content] Failed to load all site texts:", err);
    return { ar: {}, en: {} };
  }
}

export async function getSiteImages(): Promise<SiteImages> {
  try {
    const now = Date.now();
    if (cachedImages && now - cachedImages.timestamp < CACHE_TTL_MS) {
      return cachedImages.data;
    }

    const db = await getDb();
    const doc = await db.collection("site_content").findOne({ _id: "images" as any });
    const saved = doc ? (doc as any).images || {} : {};

    const merged: SiteImages = {
      homeHero: saved.homeHero || DEFAULT_SITE_IMAGES.homeHero,
      homeTestimony: saved.homeTestimony || DEFAULT_SITE_IMAGES.homeTestimony,
      campaignBefore18: saved.campaignBefore18 || DEFAULT_SITE_IMAGES.campaignBefore18,
      campaignsHero: saved.campaignsHero || saved.campaignBefore18 || DEFAULT_SITE_IMAGES.campaignsHero,
      aboutHero: saved.aboutHero || DEFAULT_SITE_IMAGES.aboutHero,
      programSpotlight: saved.programSpotlight || DEFAULT_SITE_IMAGES.programSpotlight,
      logo: saved.logo || DEFAULT_SITE_IMAGES.logo,
    };

    cachedImages = { data: merged, timestamp: now };
    return merged;
  } catch (err) {
    console.error("[site-content] Failed to load site images from DB:", err);
    return DEFAULT_SITE_IMAGES;
  }
}

export async function updateSiteTexts(texts: { ar?: Record<string, any>; en?: Record<string, any> }) {
  const db = await getDb();
  await db.collection("site_content").updateOne(
    { _id: "texts" as any },
    {
      $set: {
        content: texts,
        updatedAt: new Date().toISOString(),
      },
    },
    { upsert: true }
  );
  cachedTexts = null; // Invalidate cache
}

export async function updateSiteImages(images: Partial<SiteImages>) {
  const db = await getDb();
  await db.collection("site_content").updateOne(
    { _id: "images" as any },
    {
      $set: {
        images,
        updatedAt: new Date().toISOString(),
      },
    },
    { upsert: true }
  );
  cachedImages = null; // Invalidate cache
}
