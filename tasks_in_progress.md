# Agent 2: Tasks In Progress (Sedang Dikerjakan)

Dokumen ini mencatat task yang **saat ini sedang aktif dikerjakan, diuji (testing), atau dalam tahap penyesuaian (fine-tuning)** sebelum dipindahkan ke `tasks_done.md`.

---

## ⏳ Active Tasks

### Task 2.1: Verifikasi Auto-Migration Database di Environment Production Vercel
- **Kategori:** Backend & Infrastructure
- **Deskripsi:** 
  Merapikan dan memastikan koneksi `DATABASE_URL` di Vercel berjalan lancar tanpa hambatan SSL/timeout saat auto-migration `20260718000002_add_ai_model_field.sql` mengeksekusi migrasi di Supabase Production.
- **Tahapan Pengerjaan:**
  1. [x] Implementasi `instrumentation.ts` dan `migrations.ts`.
  2. [x] Penambahan `DATABASE_URL` pada `.env.local` dan Vercel.
  3. [ ] Verifikasi runtime log saat auto-migration pertama kali berjalan di Vercel Production.

### Task 2.2: Fine-Tuning Responsivitas Peta Leaflet pada Layar Mobile/Tablet
- **Kategori:** Frontend & UI
- **Deskripsi:**
  Memastikan komponen `MapPicker` (pada form lowongan dan apply) serta `DistanceMap` (pada profil kandidat) dapat disentuh/digerakkan dengan lancar tanpa mengganggu scroll utama di perangkat seluler.
- **Tahapan Pengerjaan:**
  1. [x] Penggantian Google Maps ke OpenStreetMap + Leaflet.
  2. [x] Penambahan tombol pencarian alamat Nominatim & manual coordinate input.
  3. [ ] Penyesuaian `touch-action` & z-index container peta pada viewport HP.
