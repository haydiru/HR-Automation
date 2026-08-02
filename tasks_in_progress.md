# Agent 2: Tasks In Progress (Sedang Dikerjakan)

Dokumen ini mencatat task yang **saat ini sedang aktif dikerjakan, diuji (testing), atau dalam tahap penyesuaian (fine-tuning)** sebelum dipindahkan ke `tasks_done.md`.

---

## ⏳ Active Tasks

### Task 2.3: API Manajemen Tim Perusahaan (`/api/team`)
- **Kategori:** Phase 2 — Backend API Route (Khusus Super Admin)
- **API Target:** `/api/team`, `/api/team/invite`, `/api/team/[memberId]`
- **Deskripsi:**
  API route untuk mengambil daftar anggota tim perusahaan, mengundang anggota tim baru via email, mengubah role anggota (super_admin vs recruiter), atau menghapus anggota dari tim.
- **Tahapan Pengerjaan:**
  1. [x] Pindah task ke `tasks_in_progress.md`.
  2. [ ] Buat `/api/team/route.ts` (GET list team members & POST invite member).
  3. [ ] Buat `/api/team/[memberId]/route.ts` (PATCH update role & DELETE remove member).
  4. [ ] Verifikasi kompilasi TypeScript (`npx tsc --noEmit`).
