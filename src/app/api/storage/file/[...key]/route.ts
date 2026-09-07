import { NextResponse } from "next/server";

import { GetObjectCommand } from "@aws-sdk/client-s3";

import { S3_BUCKET_NAME, s3Client } from "@/lib/storage/s3";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ key: string[] }> }
) {
  try {
    const { key } = await params;
    const storageKey = key.join("/");

    const response = await s3Client.send(
      new GetObjectCommand({
        Bucket: S3_BUCKET_NAME,
        Key: storageKey,
      })
    );

    if (!response.Body) {
      return new NextResponse("File tidak ditemukan di SumoPod Storage", {
        status: 404,
      });
    }

    const byteArray = await response.Body.transformToByteArray();
    const contentType = response.ContentType || "application/octet-stream";

    return new NextResponse(Buffer.from(byteArray), {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error: unknown) {
    console.error("Error mengambil file dari SumoPod Storage:", error);
    return new NextResponse("File tidak ditemukan atau tidak dapat diakses", {
      status: 404,
    });
  }
}
