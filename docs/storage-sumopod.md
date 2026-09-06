# SUMOPOD OBJECT STORAGE INTEGRATION GUIDE

**Versi:** 2.0 (S3-Compatible Protocol)  
**Provider:** SumoPod Cloud Object Storage  
**Protokol:** AWS S3 Compatible API  
**Client Library:** `@aws-sdk/client-s3` & `@aws-sdk/s3-request-presigner`

---

## 1. Overview & Arsitektur Storage

SumoPod Object Storage menyediakan penyimpanan berkas berbasis S3 yang kompatibel dengan SDK standar AWS. Pada proyek **KerjaNTB**, object storage digunakan untuk menangani:

1. **Aset Publik (Public Assets)**:
   - Avatar Pengguna (`avatars/<uuid>.<ext>`)
   - Logo Perusahaan (`logos/<uuid>.<ext>`)
   - Gambar Sampul Artikel Blog (`blog/<uuid>.<ext>`)
2. **Dokumen Privat (Private Assets - Akses Terbatas via Presigned GET URL)**:
   - Berkas CV/Resume Pelamar (`resumes/<userId>/<uuid>.<ext>`)
   - Berkas Legalitas & NIB Perusahaan (`verifications/<companyId>/<uuid>.<ext>`)

---

## 2. Environment Variables

Tambahkan konfigurasi berikut pada file `.env`:

```env
# SumoPod S3 Object Storage Configuration
SUMOPOD_S3_ENDPOINT="https://storage.sumopod.com"
SUMOPOD_S3_REGION="ap-southeast-1"
SUMOPOD_S3_ACCESS_KEY_ID="your_sumopod_access_key"
SUMOPOD_S3_SECRET_ACCESS_KEY="your_sumopod_secret_key"
SUMOPOD_S3_BUCKET_NAME="kerja-ntb"
SUMOPOD_S3_PUBLIC_URL="https://storage.sumopod.com/kerja-ntb"
```

---

## 3. Implementasi S3 Client Singleton (`src/lib/storage/s3.ts`)

```typescript
import { S3Client } from "@aws-sdk/client-s3";

const endpoint =
  process.env.SUMOPOD_S3_ENDPOINT || "https://storage.sumopod.com";
const region = process.env.SUMOPOD_S3_REGION || "ap-southeast-1";
const accessKeyId = process.env.SUMOPOD_S3_ACCESS_KEY_ID || "";
const secretAccessKey = process.env.SUMOPOD_S3_SECRET_ACCESS_KEY || "";

export const s3Client = new S3Client({
  endpoint,
  region,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
  forcePathStyle: true, // Wajib true untuk SumoPod S3-compatible endpoints
});

export const S3_BUCKET_NAME = process.env.SUMOPOD_S3_BUCKET_NAME || "kerja-ntb";
export const S3_PUBLIC_URL =
  process.env.SUMOPOD_S3_PUBLIC_URL || `${endpoint}/${S3_BUCKET_NAME}`;
```

---

## 4. Helper Presigned URL untuk Upload Langsung dari Browser

Upload berkas berukuran besar (seperti PDF CV atau dokumen legalitas NIB) dilakukan langsung dari browser ke SumoPod Storage menggunakan **Presigned URL** agar tidak membebani server Next.js.

```typescript
// src/lib/storage/upload.ts
import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
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
  },
  LOGO: {
    maxSize: 2 * 1024 * 1024, // 2MB
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
    prefix: "logos",
  },
  AVATAR: {
    maxSize: 2 * 1024 * 1024, // 2MB
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
    prefix: "avatars",
  },
  VERIFICATION: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedMimeTypes: ["application/pdf", "image/jpeg", "image/png"],
    prefix: "verifications",
  },
} as const;

export type UploadCategory = keyof typeof UPLOAD_CONSTRAINTS;

/**
 * Menghasilkan Presigned PUT URL untuk upload langsung dari browser ke SumoPod
 */
export async function getPresignedUploadUrl({
  fileName,
  fileType,
  fileSize,
  category,
  userId,
}: {
  fileName: string;
  fileType: string;
  fileSize: number;
  category: UploadCategory;
  userId: string;
}) {
  const constraint = UPLOAD_CONSTRAINTS[category];

  // 1. Validasi Ukuran
  if (fileSize > constraint.maxSize) {
    throw new Error(
      `Ukuran file melebihi batas maksimal (${constraint.maxSize / (1024 * 1024)}MB)`
    );
  }

  // 2. Validasi MIME Type
  if (!constraint.allowedMimeTypes.includes(fileType)) {
    throw new Error(
      `Format file tidak diizinkan. Diperbolehkan: ${constraint.allowedMimeTypes.join(", ")}`
    );
  }

  // 3. Generate Nama Berkas yang Unik & Aman
  const extension = fileName.split(".").pop() || "bin";
  const fileHash = crypto.randomUUID();
  const storageKey = `${constraint.prefix}/${userId}/${fileHash}.${extension}`;

  const command = new PutObjectCommand({
    Bucket: S3_BUCKET_NAME,
    Key: storageKey,
    ContentType: fileType,
  });

  // URL berlaku selama 10 menit
  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 600 });

  return {
    uploadUrl,
    storageKey,
    publicUrl: `${S3_PUBLIC_URL}/${storageKey}`,
  };
}

/**
 * Menghasilkan Presigned GET URL untuk membaca file privat (CV / Dokumen NIB)
 * URL hanya berlaku selama 15 menit
 */
export async function getPresignedDownloadUrl(
  storageKey: string,
  expiresIn = 900
) {
  const command = new GetObjectCommand({
    Bucket: S3_BUCKET_NAME,
    Key: storageKey,
  });

  return await getSignedUrl(s3Client, command, { expiresIn });
}
```

---

## 5. Keamanan & Kebijakan Akses

1. **Pencegahan Akses Ilegal**: File resume pelamar dan berkas NIB disimpan di direktori `resumes/` dan `verifications/`. URL download privat hanya dihasilkan oleh Server Action setelah memeriksa apakah user berhak (pemilik, perusahaan yang dilamar, atau Superadmin).
2. **Sanitasi Nama Berkas**: Nama asli berkas pengguna diganti dengan `crypto.randomUUID()` untuk menghindari Directory Traversal attack (seperti `../../etc/passwd`).
3. **MIME Sniffing Blocker**: Header `Content-Type` selalu disematkan secara eksplisit pada saat upload ke SumoPod.
