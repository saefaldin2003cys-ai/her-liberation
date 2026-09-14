import { NextRequest } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { requireAdmin } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Images go to Cloudinary, not to disk.
 *
 * The previous site wrote uploads into its own `public/uploads` folder, which
 * silently loses every image on each deploy — the filesystem of a hosted app
 * is ephemeral. An object store is the only thing that survives a redeploy.
 */
const MAX_BYTES = 8 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);

function configured() {
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } =
    process.env;
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    return false;
  }
  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
    secure: true,
  });
  return true;
}

export async function POST(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  if (!configured()) {
    return Response.json(
      {
        error:
          "Image hosting is not configured. Set CLOUDINARY_* in .env.local — see .env.example.",
      },
      { status: 501 },
    );
  }

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return Response.json({ error: "No file supplied" }, { status: 400 });
  }
  if (!ALLOWED.has(file.type)) {
    return Response.json(
      { error: `Unsupported type ${file.type}. Use JPEG, PNG, WebP or AVIF.` },
      { status: 415 },
    );
  }
  if (file.size > MAX_BYTES) {
    return Response.json(
      { error: `Image is too large (max ${MAX_BYTES / 1024 / 1024}MB).` },
      { status: 413 },
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    const result = await new Promise<{ secure_url: string; width: number; height: number }>(
      (resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            { folder: "herliberation", resource_type: "image" },
            (error, res) => {
              if (error || !res) reject(error ?? new Error("Upload failed"));
              else resolve(res as never);
            },
          )
          .end(buffer);
      },
    );

    return Response.json({
      url: result.secure_url,
      width: result.width,
      height: result.height,
    });
  } catch (err) {
    console.error("POST /api/upload", err);
    return Response.json({ error: "Upload failed" }, { status: 500 });
  }
}
