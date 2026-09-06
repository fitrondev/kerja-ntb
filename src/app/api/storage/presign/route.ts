import { NextResponse } from "next/server";

import { auth } from "@clerk/nextjs/server";
import { z } from "zod";

import {
  UploadCategory,
  getPresignedUploadUrl,
  validateFileConstraints,
} from "@/lib/storage/upload";

const presignSchema = z.object({
  fileName: z.string().min(1, "Nama file wajib diisi."),
  fileType: z.string().min(1, "Tipe MIME file wajib diisi."),
  fileSize: z.number().positive("Ukuran file harus lebih dari 0."),
  category: z.enum([
    "RESUME",
    "LOGO",
    "AVATAR",
    "VERIFICATION",
    "BLOG",
  ] as const),
  companyId: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized. Silakan masuk terlebih dahulu.",
        },
        { status: 401 }
      );
    }

    const body = await req.json();
    const parsed = presignSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validasi parameter gagal.",
          issues: parsed.error.issues,
        },
        { status: 400 }
      );
    }

    const { fileName, fileType, fileSize, category, companyId } = parsed.data;

    const validation = validateFileConstraints(category, fileSize, fileType);
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }

    let ownerId = userId;
    if (category === "LOGO" || category === "VERIFICATION") {
      ownerId = companyId || userId;
    } else if (category === "BLOG") {
      ownerId = "public";
    }

    const presigned = await getPresignedUploadUrl({
      fileName,
      fileType,
      fileSize,
      category,
      ownerId,
    });

    return NextResponse.json({
      success: true,
      data: presigned,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : "Terjadi kesalahan pada server storage.";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
