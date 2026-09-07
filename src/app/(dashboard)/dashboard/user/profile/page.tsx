import { Metadata } from "next";
import { redirect } from "next/navigation";

import { ProfileForm } from "@/components/dashboard/user/profile-form";
import { getCurrentUser } from "@/lib/auth/clerk-sync";
import { prisma } from "@/lib/db/prisma";

export const metadata: Metadata = {
  title: "Profil Pelamar | KerjaNTB",
  description:
    "Kelola data pribadi, kontak, domisili NTB, dan tautan portofolio Anda.",
};

export default async function UserProfilePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in?redirect_url=/dashboard/user/profile");
  }

  const locations = await prisma.location.findMany({
    orderBy: { orderIndex: "asc" },
    select: { id: true, name: true },
  });

  const serializedProfile = user.profile
    ? {
        fullName: user.profile.fullName,
        avatarUrl: user.profile.avatarUrl,
        phone: user.profile.phone,
        locationId: user.profile.locationId,
        address: user.profile.address,
        bio: user.profile.bio,
        dateOfBirth: user.profile.dateOfBirth?.toISOString() || null,
        gender: user.profile.gender,
        website: user.profile.website,
        linkedIn: user.profile.linkedIn,
        github: user.profile.github,
      }
    : null;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="space-y-1">
        <h1 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl">
          Profil Saya
        </h1>
        <p className="text-muted-foreground text-xs sm:text-sm">
          Informasi ini akan ditampilkan kepada pihak HRD perusahaan saat Anda
          mengirimkan lamaran.
        </p>
      </div>

      <ProfileForm
        initialProfile={serializedProfile}
        locations={locations}
        userEmail={user.email}
      />
    </div>
  );
}
