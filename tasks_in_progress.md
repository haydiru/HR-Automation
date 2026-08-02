# Agent 2: Tasks In Progress (Sedang Dikerjakan)

Dokumen ini mencatat task yang **saat ini sedang aktif dikerjakan, diuji (testing), atau dalam tahap penyesuaian (fine-tuning)** sebelum dipindahkan ke `tasks_done.md`.

---

## ⏳ Active Tasks

### Task 2.10: API Tahapan Per Lowongan (`/api/jobs/[jobId]/stages`) — NEW
- **Kategori:** Phase 2 — Backend API Route
- **API Target:** `/api/jobs/[jobId]/stages`
- **Deskripsi:**
  API route pemroses tahapan seleksi efektif untuk suatu lowongan: GET (mengembalikan tahapan custom jika lowongan menggunakan custom stages, fallback ke template default perusahaan), POST (meng-copy template default perusahaan ke lowongan), dan PATCH (menyimpan/mengatur kustomisasi tahapan spesifik lowongan).
- **Tahapan Pengerjaan:**
  1. [x] Pindah task ke `tasks_in_progress.md`.
  2. [ ] Buat `src/app/api/jobs/[jobId]/stages/route.ts`.
  3. [ ] Verifikasi kompilasi TypeScript (`npx tsc --noEmit`).
