"use client";

import * as React from "react";

import { Bookmark, BookmarkCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { toggleSaveJobAction } from "@/actions/jobs";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const LOCAL_STORAGE_KEY = "kerjantb_saved_jobs";

export interface JobSaveButtonProps {
  jobId: string;
  jobTitle?: string;
  initialSaved?: boolean;
  variant?: "default" | "outline" | "ghost" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
  showLabel?: boolean;
  className?: string;
}

export function JobSaveButton({
  jobId,
  jobTitle,
  initialSaved = false,
  variant = "outline",
  size = "default",
  showLabel = true,
  className,
}: JobSaveButtonProps) {
  const [isSaved, setIsSaved] = React.useState(initialSaved);
  const [isPending, setIsPending] = React.useState(false);

  // Baca status penyimpanan dari localStorage jika user belum login
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (stored) {
          const ids: string[] = JSON.parse(stored);
          if (ids.includes(jobId)) {
            setIsSaved(true);
          }
        }
      } catch {
        // Abaikan error parsing localStorage
      }
    }
  }, [jobId]);

  const handleToggleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isPending) return;

    setIsPending(true);
    const prevSaved = isSaved;
    const nextSaved = !prevSaved;

    // Optimistic UI update
    setIsSaved(nextSaved);

    try {
      const res = await toggleSaveJobAction(jobId);

      if (res.success && res.data) {
        setIsSaved(res.data.saved);
        if (res.data.saved) {
          toast.success("Lowongan disimpan!", {
            description: jobTitle
              ? `"${jobTitle}" berhasil ditambahkan ke daftar tersimpan.`
              : "Lowongan berhasil disimpan ke daftar favorit.",
          });
        } else {
          toast.info("Lowongan dihapus dari daftar tersimpan.");
        }
        // Sync local storage as well
        updateLocalStorage(jobId, res.data.saved);
      } else if (res.error === "UNAUTHORIZED") {
        // Simpan secara lokal di browser untuk pengunjung (guest)
        updateLocalStorage(jobId, nextSaved);
        if (nextSaved) {
          toast.success("Tersimpan di peramban", {
            description:
              "Lowongan disimpan di peramban ini. Masuk ke akun Anda untuk menyinkronkannya antar perangkat.",
          });
        } else {
          toast.info("Lowongan dihapus dari daftar tersimpan.");
        }
      } else {
        // Rollback state jika error server
        setIsSaved(prevSaved);
        toast.error(res.error || "Gagal memperbarui status lowongan.");
      }
    } catch {
      // Rollback
      setIsSaved(prevSaved);
      toast.error("Terjadi masalah jaringan. Silakan coba kembali.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={handleToggleSave}
      disabled={isPending}
      className={cn(
        "gap-2 transition-all",
        isSaved &&
          "border-primary/40 bg-primary/10 text-primary hover:bg-primary/20",
        className
      )}
      aria-label={isSaved ? "Hapus dari simpanan" : "Simpan lowongan kerja"}
      title={isSaved ? "Hapus dari lowongan tersimpan" : "Simpan lowongan ini"}
    >
      {isPending ? (
        <Loader2 className="size-4 animate-spin" />
      ) : isSaved ? (
        <BookmarkCheck className="fill-primary text-primary size-4" />
      ) : (
        <Bookmark className="size-4" />
      )}

      {showLabel && (
        <span className="text-xs font-semibold sm:text-sm">
          {isSaved ? "Tersimpan" : "Simpan Lowongan"}
        </span>
      )}
    </Button>
  );
}

function updateLocalStorage(jobId: string, shouldSave: boolean) {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    let ids: string[] = raw ? JSON.parse(raw) : [];
    if (shouldSave) {
      if (!ids.includes(jobId)) ids.push(jobId);
    } else {
      ids = ids.filter((id) => id !== jobId);
    }
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // Ignore storage quota or access errors
  }
}
