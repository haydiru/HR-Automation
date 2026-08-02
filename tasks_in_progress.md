# Agent 2: Tasks In Progress (Sedang Dikerjakan)

Dokumen ini mencatat task yang **saat ini sedang aktif dikerjakan, diuji (testing), atau dalam tahap penyesuaian (fine-tuning)** sebelum dipindahkan ke `tasks_done.md`.

---

## ⏳ Active Tasks

### Task 2.8: Migrasi Database Tahapan Rekrutmen — NEW
- **Kategori:** Database Schema & RLS (Fondasi fitur Tahapan Kustom)
- **File Target:** `supabase/migrations/YYYYMMDD_add_recruitment_stages.sql`
- **Deskripsi:**
  Membuat tabel baru `recruitment_stages`, `job_stages`, `candidate_stage_history`, update tabel `candidates` (tambah `current_stage_id`, `current_stage_name`), update tabel `jobs` (tambah `use_custom_stages`), serta RLS policies dan seed data tahapan default.
- **Tahapan Pengerjaan:**
  1. [x] Pindah task ke `tasks_in_progress.md`.
  2. [ ] Cek skema migrasi existing.
  3. [ ] Buat file migrasi SQL baru.
  4. [ ] Verifikasi migrasi berjalan saat dev server restart.
