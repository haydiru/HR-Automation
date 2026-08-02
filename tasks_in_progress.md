# Agent 2: Tasks In Progress (Sedang Dikerjakan)

Dokumen ini mencatat task yang **saat ini sedang aktif dikerjakan, diuji (testing), atau dalam tahap penyesuaian (fine-tuning)** sebelum dipindahkan ke `tasks_done.md`.

---

## ⏳ Active Tasks

### Task 2.11: API Perpindahan Tahapan Kandidat (`/api/candidates/[candidateId]/advance`) — NEW
- **Kategori:** Phase 2 — Backend API Route
- **API Target:** `/api/candidates/[candidateId]/advance` & `/api/candidates/[candidateId]/reject`
- **Deskripsi:**
  API route untuk memajukan (advance) kandidat ke tahapan berikutnya atau menolak (reject) kandidat di tahapan manapun. Mencatat log perpindahan ke `candidate_stage_history`.
- **Tahapan Pengerjaan:**
  1. [x] Pindah task ke `tasks_in_progress.md`.
  2. [ ] Buat `src/app/api/candidates/[candidateId]/advance/route.ts`.
  3. [ ] Buat `src/app/api/candidates/[candidateId]/reject/route.ts`.
  4. [ ] Verifikasi kompilasi TypeScript (`npx tsc --noEmit`).
