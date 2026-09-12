"use client";

import * as React from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  AlertCircle,
  Briefcase,
  CheckCircle2,
  Clock,
  Edit,
  ExternalLink,
  Loader2,
  MapPin,
  MoreHorizontal,
  PauseCircle,
  PlayCircle,
  PlusCircle,
  Search,
  StopCircle,
  Trash2,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import { deleteJobAction, updateJobStatusAction } from "@/actions/jobs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { JobStatus } from "@/generated/prisma/enums";

export interface EmployerJobItem {
  id: string;
  title: string;
  slug: string;
  status: JobStatus;
  type: string;
  workplace: string;
  createdAt: Date | string;
  deadline?: Date | string | null;
  location: { name: string; slug: string };
  category: { name: string };
  _count: { applications: number };
}

export interface EmployerJobsTableProps {
  initialJobs: EmployerJobItem[];
}

export function EmployerJobsTable({ initialJobs }: EmployerJobsTableProps) {
  const router = useRouter();
  const [jobs, setJobs] = React.useState<EmployerJobItem[]>(initialJobs);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("ALL");

  // State dialog hapus
  const [jobToDelete, setJobToDelete] = React.useState<EmployerJobItem | null>(
    null
  );
  const [isDeleting, setIsDeleting] = React.useState(false);

  // Status mutation loading
  const [actionLoadingId, setActionLoadingId] = React.useState<string | null>(
    null
  );

  React.useEffect(() => {
    setJobs(initialJobs);
  }, [initialJobs]);

  const handleStatusChange = async (jobId: string, newStatus: JobStatus) => {
    setActionLoadingId(jobId);
    try {
      const res = await updateJobStatusAction(jobId, newStatus);
      if (res.success) {
        toast.success(
          `Status lowongan berhasil diubah menjadi ${
            newStatus === JobStatus.PUBLISHED
              ? "TAYANG"
              : newStatus === JobStatus.PAUSED
                ? "DIJEDA"
                : "DITUTUP"
          }.`
        );
        setJobs((prev) =>
          prev.map((j) => (j.id === jobId ? { ...j, status: newStatus } : j))
        );
        router.refresh();
      } else {
        toast.error(res.error || "Gagal mengubah status lowongan.");
      }
    } catch {
      toast.error("Terjadi kegagalan sistem.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!jobToDelete) return;

    setIsDeleting(true);
    try {
      const res = await deleteJobAction(jobToDelete.id);
      if (res.success) {
        toast.success("Lowongan pekerjaan berhasil dihapus.");
        setJobs((prev) => prev.filter((j) => j.id !== jobToDelete.id));
        setJobToDelete(null);
        router.refresh();
      } else {
        toast.error(res.error || "Gagal menghapus lowongan.");
      }
    } catch {
      toast.error("Terjadi kegagalan sistem saat menghapus lowongan.");
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.category.name.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (statusFilter === "ALL") return true;
    if (statusFilter === "PUBLISHED") return job.status === JobStatus.PUBLISHED;
    if (statusFilter === "PENDING_REVIEW")
      return job.status === JobStatus.PENDING_REVIEW;
    if (statusFilter === "PAUSED") return job.status === JobStatus.PAUSED;
    if (statusFilter === "CLOSED") return job.status === JobStatus.CLOSED;

    return true;
  });

  const countPublished = jobs.filter(
    (j) => j.status === JobStatus.PUBLISHED
  ).length;
  const countPending = jobs.filter(
    (j) => j.status === JobStatus.PENDING_REVIEW
  ).length;
  const countPaused = jobs.filter((j) => j.status === JobStatus.PAUSED).length;
  const countClosed = jobs.filter((j) => j.status === JobStatus.CLOSED).length;

  return (
    <div className="space-y-4">
      {/* Tab Filter & Pencarian */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs
          value={statusFilter}
          onValueChange={setStatusFilter}
          className="w-full sm:w-auto"
        >
          <TabsList className="grid w-full grid-cols-5 sm:w-auto">
            <TabsTrigger value="ALL" className="text-xs">
              Semua ({jobs.length})
            </TabsTrigger>
            <TabsTrigger value="PUBLISHED" className="text-xs">
              Tayang ({countPublished})
            </TabsTrigger>
            <TabsTrigger value="PENDING_REVIEW" className="text-xs">
              Review ({countPending})
            </TabsTrigger>
            <TabsTrigger value="PAUSED" className="text-xs">
              Jeda ({countPaused})
            </TabsTrigger>
            <TabsTrigger value="CLOSED" className="text-xs">
              Tutup ({countClosed})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="relative w-full sm:w-64">
          <Search className="text-muted-foreground absolute top-1/2 left-3 size-3.5 -translate-y-1/2" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari posisi atau lokasi..."
            className="pl-8 text-xs"
          />
        </div>
      </div>

      {/* Konten Daftar Lowongan */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-base font-bold">
            <span className="flex items-center gap-2">
              <Briefcase className="text-primary size-4.5" />
              <span>Daftar Lowongan Kerja ({filteredJobs.length})</span>
            </span>
            <Button asChild size="sm" className="text-xs">
              <Link href="/dashboard/loker/baru">
                <PlusCircle className="mr-1.5 size-4" />
                <span>Pasang Loker Baru</span>
              </Link>
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {filteredJobs.length === 0 ? (
            <div className="text-muted-foreground py-12 text-center text-xs">
              <Briefcase className="text-muted-foreground/50 mx-auto mb-2 size-8" />
              <p className="text-foreground font-semibold">
                Tidak ada lowongan yang sesuai kriteria.
              </p>
              <p className="mt-1 text-[11px]">
                Coba ubah kata kunci pencarian atau ganti filter status di atas.
              </p>
            </div>
          ) : (
            filteredJobs.map((job) => {
              const isLoading = actionLoadingId === job.id;

              return (
                <div
                  key={job.id}
                  className="border-border/70 hover:bg-muted/30 flex flex-col justify-between gap-4 rounded-xl border p-4 transition-all sm:flex-row sm:items-center"
                >
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/loker/${job.slug}`}
                        className="text-foreground hover:text-primary text-sm font-bold transition-colors"
                      >
                        {job.title}
                      </Link>

                      {/* Status Badge */}
                      {job.status === JobStatus.PUBLISHED && (
                        <Badge className="gap-1 border-emerald-500/20 bg-emerald-500/10 text-[10px] text-emerald-600">
                          <CheckCircle2 className="size-3" />
                          <span>Tayang</span>
                        </Badge>
                      )}
                      {job.status === JobStatus.PENDING_REVIEW && (
                        <Badge className="gap-1 border-amber-500/30 bg-amber-500/15 text-[10px] text-amber-600">
                          <Clock className="size-3" />
                          <span>Menunggu Review</span>
                        </Badge>
                      )}
                      {job.status === JobStatus.PAUSED && (
                        <Badge
                          variant="outline"
                          className="border-border text-muted-foreground gap-1 text-[10px]"
                        >
                          <PauseCircle className="size-3" />
                          <span>Dijeda</span>
                        </Badge>
                      )}
                      {job.status === JobStatus.CLOSED && (
                        <Badge
                          variant="secondary"
                          className="gap-1 text-[10px]"
                        >
                          <StopCircle className="size-3" />
                          <span>Ditutup</span>
                        </Badge>
                      )}
                    </div>

                    <div className="text-muted-foreground flex flex-wrap items-center gap-3 text-xs">
                      <span className="flex items-center gap-1">
                        <MapPin className="text-primary size-3" />
                        <span>{job.location.name}</span>
                      </span>
                      <span>&bull;</span>
                      <span>{job.category.name}</span>
                      <span>&bull;</span>
                      <span>
                        Dibuat{" "}
                        {new Date(job.createdAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                      <span>&bull;</span>
                      <span className="text-foreground font-semibold">
                        {job._count.applications} Pelamar
                      </span>
                    </div>
                  </div>

                  {/* Tombol Aksi */}
                  <div className="flex items-center gap-2 self-start sm:self-center">
                    <Button
                      asChild
                      size="sm"
                      variant="outline"
                      className="h-8 gap-1 text-xs"
                    >
                      <Link
                        href={`/dashboard/employer/pelamar?jobId=${job.id}`}
                      >
                        <Users className="size-3.5" />
                        <span>Pelamar ({job._count.applications})</span>
                      </Link>
                    </Button>

                    <Button
                      asChild
                      size="sm"
                      variant="ghost"
                      className="h-8 gap-1 text-xs"
                    >
                      <Link href={`/loker/${job.slug}`} target="_blank">
                        <ExternalLink className="size-3.5" />
                        <span className="hidden sm:inline">Preview</span>
                      </Link>
                    </Button>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8"
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <Loader2 className="size-4 animate-spin" />
                          ) : (
                            <MoreHorizontal className="size-4" />
                          )}
                          <span className="sr-only">Menu Opsi</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 text-xs">
                        <DropdownMenuItem asChild>
                          <Link
                            href={`/dashboard/employer/loker/${job.id}/edit`}
                            className="cursor-pointer"
                          >
                            <Edit className="mr-2 size-3.5" />
                            <span>Edit Lowongan</span>
                          </Link>
                        </DropdownMenuItem>

                        {/* Toggle Status */}
                        {job.status === JobStatus.PUBLISHED && (
                          <DropdownMenuItem
                            onClick={() =>
                              handleStatusChange(job.id, JobStatus.PAUSED)
                            }
                            className="cursor-pointer"
                          >
                            <PauseCircle className="mr-2 size-3.5" />
                            <span>Jeda Lowongan</span>
                          </DropdownMenuItem>
                        )}

                        {job.status === JobStatus.PAUSED && (
                          <DropdownMenuItem
                            onClick={() =>
                              handleStatusChange(job.id, JobStatus.PUBLISHED)
                            }
                            className="cursor-pointer text-emerald-600"
                          >
                            <PlayCircle className="mr-2 size-3.5" />
                            <span>Tayangkan Kembali</span>
                          </DropdownMenuItem>
                        )}

                        {job.status !== JobStatus.CLOSED && (
                          <DropdownMenuItem
                            onClick={() =>
                              handleStatusChange(job.id, JobStatus.CLOSED)
                            }
                            className="cursor-pointer text-amber-600"
                          >
                            <StopCircle className="mr-2 size-3.5" />
                            <span>Tutup Lowongan</span>
                          </DropdownMenuItem>
                        )}

                        <DropdownMenuSeparator />

                        <DropdownMenuItem
                          onClick={() => setJobToDelete(job)}
                          className="text-destructive focus:text-destructive cursor-pointer"
                        >
                          <Trash2 className="mr-2 size-3.5" />
                          <span>Hapus Lowongan</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      {/* Konfirmasi Hapus Dialog */}
      <AlertDialog
        open={Boolean(jobToDelete)}
        onOpenChange={(open) => !open && setJobToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Lowongan Kerja?</AlertDialogTitle>
            <AlertDialogDescription className="text-xs">
              Tindakan ini akan menghapus permanen lowongan{" "}
              <strong>&quot;{jobToDelete?.title}&quot;</strong> beserta seluruh
              data pelamar yang terhubung. Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting} className="text-xs">
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 text-xs font-semibold"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                  <span>Menghapus...</span>
                </>
              ) : (
                <span>Hapus Lowongan</span>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
