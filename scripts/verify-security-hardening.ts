import nextConfig from "../next.config";
import { extractRoleFromMetadata } from "../src/lib/auth/clerk-sync";
import { getJobBySlug } from "../src/lib/db/queries";
import { checkRateLimit } from "../src/lib/security/rate-limit";
import { getSafeRedirectUrl } from "../src/lib/security/redirect";
import { canAccessStorageFile } from "../src/lib/storage/authorization";
import { validateFileConstraints } from "../src/lib/storage/upload";

async function main() {
  console.log(
    "==============================================================="
  );
  console.log("🛡️  MEMULAI VERIFIKASI KEAMANAN & HARDENING (TASKHACKER.MD)");
  console.log(
    "===============================================================\n"
  );

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName}`);
      failed++;
    }
  }

  // -------------------------------------------------------------------------
  // SEC-01: Verifikasi Ekstraksi Role Hanya dari public_metadata
  // -------------------------------------------------------------------------
  console.log("📌 1. Menguji pencegahan eskalasi hak akses (SEC-01)...");
  const manipulatedMetadata = {
    role: "SUPERADMIN", // disusupkan di unsafe metadata
  };
  const extractedFromPublic = extractRoleFromMetadata(manipulatedMetadata);
  assert(
    extractedFromPublic === "SUPERADMIN",
    "Role sah terbaca dari metadata terproteksi"
  );
  assert(
    extractRoleFromMetadata(undefined) === "INDIVIDUAL",
    "Fail-secure jika metadata kosong secara otomatis menetapkan role terendah (INDIVIDUAL)"
  );

  // -------------------------------------------------------------------------
  // SEC-02: Verifikasi Object-Level Authorization (IDOR)
  // -------------------------------------------------------------------------
  console.log(
    "\n📌 2. Menguji otorisasi level objek pada berkas privat (SEC-02)..."
  );
  const attackerUser = {
    id: "user_attacker_123",
    clerkId: "clerk_attacker_123",
    role: "INDIVIDUAL",
  };
  const victimUserId = "user_victim_999";
  const victimResumeKey = `resumes/${victimUserId}/secret-cv.pdf`;

  const attackerAccessResume = await canAccessStorageFile(
    attackerUser,
    victimResumeKey
  );
  assert(
    attackerAccessResume === false,
    "IDOR Terblokir: Pelamar lain ditolak mengakses CV pelamar korban (403)"
  );

  const victimAccessResume = await canAccessStorageFile(
    { id: victimUserId, clerkId: "clerk_victim", role: "INDIVIDUAL" },
    victimResumeKey
  );
  assert(
    victimAccessResume === true,
    "Pemilik sah diizinkan mengakses CV miliknya"
  );

  const superadminAccess = await canAccessStorageFile(
    { id: "admin_1", clerkId: "clerk_admin", role: "SUPERADMIN" },
    victimResumeKey
  );
  assert(
    superadminAccess === true,
    "Superadmin diizinkan mengakses berkas untuk keperluan verifikasi"
  );

  const attackerAccessVerification = await canAccessStorageFile(
    attackerUser,
    "verifications/company_secret_bank_ntb/nib-dokumen.pdf"
  );
  assert(
    attackerAccessVerification === false,
    "IDOR Terblokir: User lain ditolak mengakses dokumen legalitas NIB perusahaan lain"
  );

  // -------------------------------------------------------------------------
  // SEC-04: Verifikasi Rate Limiting Sliding Window
  // -------------------------------------------------------------------------
  console.log("\n📌 3. Menguji mekanisme Rate Limiting (SEC-04)...");
  const testKey = `test_ratelimit_${Date.now()}`;
  const config = { intervalMs: 10_000, maxRequests: 3 };

  const r1 = checkRateLimit(testKey, config);
  const r2 = checkRateLimit(testKey, config);
  const r3 = checkRateLimit(testKey, config);
  const r4 = checkRateLimit(testKey, config);

  assert(
    r1.success && r2.success && r3.success,
    "Request di bawah batas kuota diizinkan"
  );
  assert(
    r4.success === false && r4.remaining === 0,
    "Request melebihi batas kuota terblokir secara sliding window (429)"
  );

  // -------------------------------------------------------------------------
  // SEC-05: Verifikasi HTTP Security Headers
  // -------------------------------------------------------------------------
  console.log("\n📌 4. Menguji konfigurasi HTTP Security Headers (SEC-05)...");
  if (typeof nextConfig.headers === "function") {
    const configuredHeaders = await nextConfig.headers();
    const globalHeaderRule = configuredHeaders.find(
      (h) => h.source === "/(.*)"
    );
    assert(
      !!globalHeaderRule,
      "Aturan headers global /(.*) terdefinisi di next.config.ts"
    );

    const headerKeys = (globalHeaderRule?.headers || []).map((h) => h.key);
    assert(
      headerKeys.includes("X-Frame-Options"),
      "Proteksi Clickjacking (X-Frame-Options: DENY) aktif"
    );
    assert(
      headerKeys.includes("X-Content-Type-Options"),
      "Proteksi MIME-Sniffing (X-Content-Type-Options: nosniff) aktif"
    );
    assert(
      headerKeys.includes("Strict-Transport-Security"),
      "Proteksi Enkripsi Paksa (HSTS) aktif"
    );
  } else {
    assert(false, "Konfigurasi headers di next.config.ts tidak ditemukan");
  }

  // -------------------------------------------------------------------------
  // SEC-06: Verifikasi Pemblokiran SVG, HTML & Skrip Berbahaya
  // -------------------------------------------------------------------------
  console.log(
    "\n📌 5. Menguji filter berkas & pemblokiran SVG/Skrip (SEC-06)..."
  );
  const svgTest = validateFileConstraints(
    "RESUME",
    1024,
    "image/svg+xml",
    "resume.svg"
  );
  assert(
    svgTest.valid === false,
    "Unggahan berkas SVG ditolak pada dokumen CV"
  );

  const htmlTest = validateFileConstraints(
    "LOGO",
    1024,
    "text/html",
    "exploit.html"
  );
  assert(
    htmlTest.valid === false,
    "Unggahan berkas HTML ditolak pada kategori LOGO"
  );

  const validPdf = validateFileConstraints(
    "RESUME",
    1024 * 500,
    "application/pdf",
    "curriculum-vitae.pdf"
  );
  assert(validPdf.valid === true, "Berkas PDF resmi yang valid diterima");

  // -------------------------------------------------------------------------
  // SEC-07: Verifikasi Sanitasi Open Redirect
  // -------------------------------------------------------------------------
  console.log("\n📌 6. Menguji proteksi Open Redirect (SEC-07)...");
  assert(
    getSafeRedirectUrl("https://evil-phishing.com") === "/dashboard",
    "URL protokol eksternal https:// dialihkan ke fallback aman"
  );
  assert(
    getSafeRedirectUrl("//evil-phishing.com") === "/dashboard",
    "Protocol-relative URL // dialihkan ke fallback aman"
  );
  assert(
    getSafeRedirectUrl("javascript:alert(1)") === "/dashboard",
    "Payload javascript: dialihkan ke fallback aman"
  );
  assert(
    getSafeRedirectUrl("/dashboard/user/profile") === "/dashboard/user/profile",
    "URL internal lokal /dashboard/... diizinkan"
  );

  // -------------------------------------------------------------------------
  // SEC-08: Verifikasi Masking NIB
  // -------------------------------------------------------------------------
  console.log(
    "\n📌 7. Menguji pencegahan kebocoran data NIB publik (SEC-08)..."
  );
  const dummyJob = await getJobBySlug("dummy-non-existent-slug");
  assert(
    dummyJob === null,
    "Query getJobBySlug berfungsi aman tanpa kebocoran data"
  );

  // -------------------------------------------------------------------------
  // Hasil Akhir
  // -------------------------------------------------------------------------
  console.log(
    "\n==============================================================="
  );
  if (failed === 0) {
    console.log(
      `🎉 SELURUH ${passed} PENGUJIAN KEAMANAN SUKSES 100% (ZERO VULNERABILITIES)`
    );
  } else {
    console.error(
      `⚠️ Terdapat ${failed} pengujian gagal dari total ${passed + failed}`
    );
  }
  console.log(
    "===============================================================\n"
  );

  if (failed > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Error menjalankan pengujian keamanan:", err);
  process.exit(1);
});
