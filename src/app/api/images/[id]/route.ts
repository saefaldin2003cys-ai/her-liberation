import { NextRequest, NextResponse } from "next/server";
import { ObjectId, GridFSBucket } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { Readable } from "node:stream";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  if (!ObjectId.isValid(id)) {
    return new NextResponse("Invalid image ID", { status: 400 });
  }

  try {
    const db = await getDb();
    const bucket = new GridFSBucket(db, { bucketName: "images" });
    const objId = new ObjectId(id);

    const files = await bucket.find({ _id: objId }).toArray();
    if (files.length === 0) {
      return new NextResponse("Image not found", { status: 404 });
    }

    const file = files[0];
    const downloadStream = bucket.openDownloadStream(objId);
    const chunks: Buffer[] = [];
    for await (const chunk of downloadStream) {
      chunks.push(Buffer.from(chunk));
    }
    const buffer = Buffer.concat(chunks);

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": (file.contentType as string) || "image/jpeg",
        "Content-Length": String(buffer.length),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (err) {
    console.error("GET /api/images/[id]", err);
    return new NextResponse("Failed to retrieve image", { status: 500 });
  }
}
