import { NextRequest } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { GridFSBucket } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Images are stored in MongoDB GridFS by default, which persists across deployments
 * and requires no external services or VPN. Cloudinary can still be used if configured.
 */
const MAX_BYTES = 8 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);

function hasCloudinary() {
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

  // 1. If Cloudinary is configured, use it
  if (hasCloudinary()) {
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
      console.error("POST /api/upload (Cloudinary)", err);
      return Response.json({ error: "Upload to Cloudinary failed" }, { status: 500 });
    }
  }

  // 2. Default: Store directly in MongoDB GridFS
  try {
    const db = await getDb();
    const bucket = new GridFSBucket(db, { bucketName: "images" });
    const filename = file.name || `image-${Date.now()}`;
    const uploadStream = bucket.openUploadStream(filename, {
      contentType: file.type,
      metadata: {
        size: file.size,
        uploadedAt: new Date(),
      },
    });

    await new Promise<void>((resolve, reject) => {
      uploadStream.on("finish", () => resolve());
      uploadStream.on("error", reject);
      uploadStream.end(buffer);
    });

    const url = `/api/images/${uploadStream.id.toString()}`;

    return Response.json({
      url,
    });
  } catch (err) {
    console.error("POST /api/upload (MongoDB GridFS)", err);
    return Response.json(
      { error: "Failed to upload image to database" },
      { status: 500 },
    );
  }
}
