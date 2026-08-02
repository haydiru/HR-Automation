# Agent 3: Tasks Done (Dokumentasi Task Selesai)

Dokumen ini mencatat secara resmi seluruh task yang **telah selesai dikerjakan, diuji, dan diverifikasi**.

---

## 📌 Phase 1: Frontend Pages & UI Components

### Task 1.1: Setup Proyek Next.js 15 & UI Component System (Shadcn/UI + Tailwind)
- **Status:** ✅ Completed
- **Kategori:** Core Architecture & UI Foundation

### Task 1.2: Komponen UI Reusable System (Badges, Buttons, Cards, Modals)
- **Status:** ✅ Completed
- **Kategori:** UI Design System

### Task 1.3: Halaman Dashboard Utama (`/dashboard`)
- **Status:** ✅ Completed
- **Kategori:** Frontend Page

### Task 1.4: Halaman Manajemen Lowongan & Buat Lowongan Baru (`/jobs` & `/jobs/create`)
- **Status:** ✅ Completed
- **Kategori:** Frontend Page

### Task 1.5: Halaman Pipeline Kandidat & Filter Interaktif (`/jobs/[jobId]`)
- **Status:** ✅ Completed
- **Kategori:** Frontend Page

### Task 1.6: Halaman Daftar Semua Kandidat & Filter Terpusat (`/candidates`)
- **Status:** ✅ Completed
- **Kategori:** Frontend Page

### Task 1.7: Halaman Detail Kandidat & Viewer CV/AI Breakdown (`/candidates/[candidateId]`)
- **Status:** ✅ Completed
- **Kategori:** Frontend Page

### Task 1.8: Halaman Pengaturan Provider AI, API Key, Proxy & Model (`/settings`)
- **Status:** ✅ Completed
- **Kategori:** Frontend Page

### Task 1.9: Form Lamaran Kandidat Publik (`/apply/[jobId]`)
- **Status:** ✅ Completed
- **Kategori:** Public Page

### Task 1.10: Form Pengaturan Integrasi Email Gmail 1-Click & Apps Script (`/settings/integrations`)
- **Status:** ✅ Completed
- **Kategori:** Frontend Page

### Task 1.11: Halaman Pengaturan Manajemen Tim Perusahaan (`/settings/team`)
- **Status:** ✅ Completed
- **Kategori:** Frontend Page

### Task 1.12: Modal Penjadwalan Wawancara & Penugasan Mandat (`ScheduleInterviewModal`)
- **Status:** ✅ Completed
- **Kategori:** UI Component Modal

### Task 1.13: Revisi Pipeline — Opsi Penugasan Mandat Massal & Filter Staf SR (`/jobs/[jobId]` Revisi)
- **Status:** ✅ Completed
- **Kategori:** Frontend Page Enhancement

### Task 1.14: Revisi Detail Kandidat — Fitur Catatan HRD & Cetak Ringkasan PDF (`/candidates/[candidateId]` Revisi)
- **Status:** ✅ Completed
- **Kategori:** Frontend Page Enhancement

### Task 1.15: Visualisasi Peta Jarak Terintegrasi OpenStreetMap / Leaflet (`DistanceMap`)
- **Status:** ✅ Completed
- **Kategori:** UI Component / Geo-Visualization

### Task 1.16: Halaman Pengaturan Tahapan Rekrutmen (`/settings/stages`)
- **Status:** ✅ Completed
- **Kategori:** Frontend Page (Super Admin)
- **Rincian Fitur:**
  - Sortable list tahapan rekrutmen default (nama, deskripsi, urutan, warna).
  - Modal tambah, edit, dan hapus tahapan.
  - Interactive drag/order preview.
  - Sub-navigation tab "Tahapan Rekrutmen" di seluruh halaman settings.

### Task 1.17: Revisi Buat Lowongan — Opsi Override Tahapan (`/jobs/create` Revisi)
- **Status:** ✅ Completed
- **Kategori:** Frontend Page Enhancement
- **Rincian Fitur:**
  - Option 1 (Default): "Gunakan Template Default Perusahaan" dengan preview readonly stepper horizontal.
  - Option 2 (Custom): "Kustomisasi Tahapan Khusus Lowongan Ini" dengan form editor interaktif.
  - Integrasi API `PATCH /api/jobs/[jobId]/stages` saat pembuatan lowongan baru.

### Task 1.18: Revisi Pipeline Kandidat — Kolom Tahapan Dinamis (`/jobs/[jobId]` Revisi)
- **Status:** ✅ Completed
- **Kategori:** Frontend Page Enhancement
- **Rincian Fitur:**
  - Horizontal Stepper di bagian atas card pipeline yang menampilkan distribusi kandidat per tahapan secara realtime (clickable sebagai filter).
  - Kolom "Tahapan" dinamis menggantikan status hardcoded dengan badge warna per tahapan.
  - Tombol aksi per-kandidat: "Majukan Tahapan" (advance) dan "Tolak" (reject).
  - Aksi massal: Bulk advance ke tahapan berikutnya & Bulk reject.

### Task 1.19: Revisi Detail Kandidat — Stepper & Status Dinamis (`/candidates/[candidateId]` Revisi)
- **Status:** ✅ Completed
- **Kategori:** Frontend Page Enhancement
- **Rincian Fitur:**
  - Stepper progres visual horizontal di bagian atas detail kandidat (tahap lewat ✅, aktif 🔵, mendatang ⚪, ditolak 🔴).
  - Tombol aksi cepat: "Majukan Tahapan" & "Tolak" dengan notifikasi otomatis.
  - Widget timeline "Riwayat Perpindahan Tahapan" mencatat kapan & siapa yang memindahkan tahapan kandidat.

---

## 📌 Phase 2: Backend APIs, Database, & AI Engine

### Task 2.1: Skema Database & Row Level Security (Supabase PostgreSQL)
- **Status:** ✅ Completed

### Task 2.2: API Route Management Lowongan & Candidates (`/api/jobs` & `/api/candidates`)
- **Status:** ✅ Completed

### Task 2.8: Migrasi Database Tahapan Rekrutmen
- **Status:** ✅ Completed
- **Kategori:** Backend Database Schema & RLS
- **Rincian Fitur:**
  - Tabel `recruitment_stages`: Template default per perusahaan.
  - Tabel `job_stages`: Override tahapan per lowongan spesifik.
  - Tabel `candidate_stage_history`: Log audit perpindahan tahapan kandidat.
  - Kolom `jobs.use_custom_stages` & `candidates.current_stage_id/current_stage_name`.

### Task 2.9: API CRUD Tahapan Rekrutmen Default (`/api/stages`)
- **Status:** ✅ Completed
- **Kategori:** Backend API Route
- **Rincian Fitur:** Endpoint GET, POST, PATCH, DELETE, dan `/api/stages/reorder`.

### Task 2.10: API Tahapan Per Lowongan (`/api/jobs/[jobId]/stages`)
- **Status:** ✅ Completed
- **Kategori:** Backend API Route
- **Rincian Fitur:** Endpoint GET effective stages (logic-switch custom vs default), POST copy, dan PATCH batch update.

### Task 2.11: API Perpindahan Tahapan Kandidat (`/api/candidates/[candidateId]/advance`)
- **Status:** ✅ Completed
- **Kategori:** Backend API Route
- **Rincian Fitur:**
  - POST `/api/candidates/[candidateId]/advance`: Otomatis memajukan kandidat ke tahapan berikutnya berdasar `order_index`.
  - POST `/api/candidates/[candidateId]/reject`: Menolak kandidat di tahapan manapun.
  - GET `/api/candidates/[candidateId]/stage-history`: Mengambil riwayat perpindahan tahapan kandidat.
  - Otomatis mencatat ke `candidate_stage_history` & mengirimkan notifikasi in-app ke PIC jika ada.

---

## 📌 Phase 3: Integration, Automation & Security

### Task 3.1: Skrip Otomasi Inbox Gmail (Google Apps Script v4)
- **Status:** ✅ Completed
