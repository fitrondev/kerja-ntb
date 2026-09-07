import { Metadata } from "next";
import { redirect } from "next/navigation";

import { ResumeBuilder } from "@/components/dashboard/user/resume-builder";
import { getCurrentUser } from "@/lib/auth/clerk-sync";
import { prisma } from "@/lib/db/prisma";

export const metadata: Metadata = {
  title: "Resume Builder & CV | KerjaNTB",
  description:
    "Susun CV profesional Anda dengan riwayat pendidikan, pengalaman kerja, dan berkas PDF.",
};

export default async function UserResumePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in?redirect_url=/dashboard/user/resume");
  }

  const resumes = await prisma.resume.findMany({
    where: { userId: user.id },
    include: {
      educations: { orderBy: { startDate: "desc" } },
      experiences: { orderBy: { startDate: "desc" } },
    },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });

  const serializedResumes = resumes.map((r) => ({
    id: r.id,
    title: r.title,
    summary: r.summary,
    fileUrl: r.fileUrl,
    isDefault: r.isDefault,
    createdAt: r.createdAt.toISOString(),
    educations: r.educations.map((e) => ({
      id: e.id,
      institution: e.institution,
      degree: e.degree,
      fieldOfStudy: e.fieldOfStudy,
      startDate: e.startDate.toISOString(),
      endDate: e.endDate?.toISOString() || "",
      isCurrent: e.isCurrent,
      grade: e.grade || "",
    })),
    experiences: r.experiences.map((ex) => ({
      id: ex.id,
      companyName: ex.companyName,
      position: ex.position,
      location: ex.location || "",
      startDate: ex.startDate.toISOString(),
      endDate: ex.endDate?.toISOString() || "",
      isCurrent: ex.isCurrent,
      description: ex.description || "",
    })),
  }));

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="space-y-1">
        <h1 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl">
          Resume Builder &amp; CV
        </h1>
        <p className="text-muted-foreground text-xs sm:text-sm">
          Susun CV terstruktur atau unggah file PDF untuk melamar pekerjaan
          dengan 1 klik ke seluruh perusahaan di NTB.
        </p>
      </div>

      <ResumeBuilder initialResumes={serializedResumes} />
    </div>
  );
}
