import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "crypto";

import { S3_BUCKET_NAME, S3_PUBLIC_URL, s3Client } from "./s3";

// Aturan Ukuran Maksimal & MIME Type yang Diizinkan
export const UPLOAD_CONSTRAINTS = {
  RESUME: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedMimeTypes: [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
    prefix: "resumes",
    isPrivate: true,
  },
  LOGO: {
    maxSize: 2 * 1024 * 1024, // 2MB
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
    prefix: "logos",
    isPrivate: false,
  },
  AVATAR: {
    maxSize: 2 * 1024 * 1024, // 2MB
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
    prefix: "avatars",
    isPrivate: false,
  },
  VERIFICATION: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedMimeTypes: ["application/pdf", "image/jpeg", "image/png"],
    prefix: "verifications",
    isPrivate: true,
  },
  BLOG: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
    prefix: "blog",
    isPrivate: false,
  },
} as const;

export type UploadCategory = keyof typeof UPLOAD_CONSTRAINTS;

export interface PresignedUploadParams {
  fileName: string;
  fileType: string;
  fileSize: number;
  category: UploadCategory;
  ownerId: string; // userId atau companyId
}

export interface PresignedUploadResult {
  uploadUrl: string;
  storageKey: string;
  fileUrl: string;
  publicUrl: string | null;
  isPrivate: boolean;
  expiresInSeconds: number;
}

/**
 * Validasi batasan berkas sebelum proses upload
 */
export function validateFileConstraints(
  category: UploadCategory,
  fileSize: number,
  fileType: string
): { valid: boolean; error?: string } {
  const constraint = UPLOAD_CONSTRAINTS[category];

  if (fileSize > constraint.maxSize) {
    const maxMb = constraint.maxSize / (1024 * 1024);
    return {
      valid: false,
      error: `Ukuran berkas melebihi batas maksimal (${maxMb}MB).`,
    };
  }

  const isAllowedMime = (
    constraint.allowedMimeTypes as readonly string[]
  ).includes(fileType);
  if (!isAllowedMime) {
    return {
      valid: false,
      error: `Format berkas tidak didukung. Format yang diizinkan: ${constraint.allowedMimeTypes.join(
        ", "
      )}`,
    };
  }

  return { valid: true };
}

/**
 * Menghasilkan Presigned PUT URL untuk upload langsung dari browser ke SumoPod S3
 */
export async function getPresignedUploadUrl({
  fileName,
  fileType,
  fileSize,
  category,
  ownerId,
}: PresignedUploadParams): Promise<PresignedUploadResult> {
  const constraint = UPLOAD_CONSTRAINTS[category];

  // 1. Validasi
  const validation = validateFileConstraints(category, fileSize, fileType);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  // 2. Sanitasi ekstensi & generate unique storage key
  const parts = fileName.split(".");
  const rawExtension = parts.length > 1 ? parts.pop() : "";
  const extension = (rawExtension || "bin")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
  const fileUuid = crypto.randomUUID();

  // Pola path: {prefix}/{ownerId}/{uuid}.{ext}
  const storageKey = `${constraint.prefix}/${ownerId}/${fileUuid}.${extension}`;

  // 3. Buat PutObjectCommand
  const command = new PutObjectCommand({
    Bucket: S3_BUCKET_NAME,
    Key: storageKey,
    ContentType: fileType,
  });

  // URL upload berlaku selama 15 menit (900 detik)
  const expiresInSeconds = 900;
  const uploadUrl = await getSignedUrl(s3Client, command, {
    expiresIn: expiresInSeconds,
  });

  const fileUrl = `/api/storage/file/${storageKey}`;

  return {
    uploadUrl,
    storageKey,
    fileUrl,
    publicUrl: constraint.isPrivate ? null : fileUrl,
    isPrivate: constraint.isPrivate,
    expiresInSeconds,
  };
}

/**
 * Menghasilkan Presigned GET URL untuk membaca atau mengunduh berkas privat (CV / NIB)
 * URL default berlaku selama 15 menit (900 detik)
 */
export async function getPresignedDownloadUrl(
  storageKey: string,
  expiresInSeconds = 900
): Promise<string> {
  const cleanKey = storageKey.startsWith("/")
    ? storageKey.slice(1)
    : storageKey;

  const command = new GetObjectCommand({
    Bucket: S3_BUCKET_NAME,
    Key: cleanKey,
  });

  return await getSignedUrl(s3Client, command, { expiresIn: expiresInSeconds });
}

/**
 * Menghapus objek berkas dari SumoPod Object Storage
 */
export async function deleteObjectFromStorage(
  storageKey: string
): Promise<boolean> {
  const cleanKey = storageKey.startsWith("/")
    ? storageKey.slice(1)
    : storageKey;

  const command = new DeleteObjectCommand({
    Bucket: S3_BUCKET_NAME,
    Key: cleanKey,
  });

  await s3Client.send(command);
  return true;
}

/**
 * Memeriksa apakah berkas ada di storage (HeadObject)
 */
export async function checkObjectExists(storageKey: string): Promise<boolean> {
  const cleanKey = storageKey.startsWith("/")
    ? storageKey.slice(1)
    : storageKey;

  try {
    const command = new HeadObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: cleanKey,
    });
    await s3Client.send(command);
    return true;
  } catch {
    return false;
  }
}
