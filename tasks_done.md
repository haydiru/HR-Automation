# Agent 3: Tasks Done (Pekerjaan Selesai)

Dokumen ini mencatat seluruh task yang telah **100% selesai dikerjakan, diverifikasi, dan di-push ke repository**. 

---

## 📌 Phase 1: Frontend Pages & UI Components

### Task 1.1: Halaman Autentikasi (`/login` & `/register`)
- **Status:** ✅ Completed
- **Kategori:** Frontend Page (Auth)
- **Rincian Fitur:**
  - Form Register (Email, Password, Nama Lengkap, Nama Perusahaan).
  - Form Login (Email, Password).
  - Integrasi Supabase Auth Client & Server Actions (`src/app/(auth)/actions.ts`).
  - Proteksi middleware (`src/proxy.ts`) untuk membatasi akses pengguna yang belum login.

### Task 1.2: Dashboard Main Analytics (`/dashboard`)
- **Status:** ✅ Completed
- **Kategori:** Frontend Page (Dashboard)
- **Rincian Fitur:**
  - Stat Cards Real-time (Total Pelamar Masuk Hari Ini, Rasio Qualified, Lowongan Aktif).
  - Tabel Pelamar Terbaru dengan status badge dan skor AI.
  - Sidebar Navigasi terintegrasi & Topbar Header dengan User Profile & Theme Toggle.

### Task 1.3: Halaman Daftar Lowongan (`/jobs`)
- **Status:** ✅ Completed
- **Kategori:** Frontend Page (Jobs Management - Part 1)
- **Rincian Fitur:**
  - Tabel Daftar Lowongan Kerja (Judul, Jumlah Pelamar, Status Aktif/Tutup, Tanggal Dibuat).
  - Filter & Pencarian Lowongan.
  - Action Button untuk membuka detail lowongan atau membuat lowongan baru.

### Task 1.4: Halaman Buat Lowongan Baru (`/jobs/create`)
- **Status:** ✅ Completed
- **Kategori:** Frontend Page (Jobs Management - Part 2)
- **Rincian Fitur:**
  - Form Input: Judul Pekerjaan, Deskripsi, Passing Grade (0–100%).
  - Dynamic Builder untuk **Syarat Wajib** (Mandatory Criteria).
  - Dynamic Builder untuk **Syarat Opsional** (Optional Criteria).
  - **Tagging Lokasi Kantor:** Peta Interaktif OpenStreetMap + Leaflet (`MapPicker`).
  - **Screening Radius:** Input jarak maksimum (`max_distance` km) & toggle syarat jarak wajib.
  - Auto-generate Email Alias (misal: `useirbar+job-slug-xxxx@gmail.com`).

### Task 1.5: Halaman Detail Lowongan & Candidate Pipeline (`/jobs/[jobId]`)
- **Status:** ✅ Completed
- **Kategori:** Frontend Page (Jobs Management - Part 3)
- **Rincian Fitur:**
  - Header Info Lowongan + Salin Email Alias + Salin Public Application URL.
  - Tabel Pipeline Kandidat (Nama, Skor AI, Status Qualified, Jarak ke Kantor, Status Rekrutmen).
  - Filter toggle 1-klik **"Ready to Interview"** (Menampilkan kandidat lulus wajib & skor >= passing grade).
  - Modal **AI Insight** (`ai-insight-modal.tsx`) untuk pratinjau alasan skor AI tanpa berpindah halaman.
  - Quick Updater Status Kandidat.

### Task 1.6: Halaman Formulir Pelamar Publik (`/apply/[jobId]`)
- **Status:** ✅ Completed
- **Kategori:** Frontend Page (Public Application Form)
- **Rincian Fitur:**
  - Akses Publik tanpa autentikasi (Unauthenticated Public Route).
  - Kartu Ringkasan Detail Lowongan Kerja.
  - Form Pelamar: Nama Lengkap, Email, Nomor Telepon, & File Upload CV (PDF).
  - **Tagging Domisili Pelamar:** Peta Interaktif Leaflet + Nominatim Search / Manual Input.
  - Same-Origin Security Bypass ke API Ingestion untuk pengiriman aman dari browser.

### Task 1.7: Halaman Detail Kandidat & Viewer (`/candidates/[candidateId]`)
- **Status:** ✅ Completed
- **Kategori:** Frontend Page (Candidate Profile)
- **Rincian Fitur:**
  - Embedded CV Viewer menggunakan Supabase Private Bucket **Signed URL**.
  - Rincian Hasil AI: Total Score Circle, Ringkasan, Reasoning Detail, & List Skills Found.
  - Tabel Breakdown Syarat Wajib (*Mandatory Check*) dengan status Lulus/Gagal + Catatan AI.
  - **Peta Rute Domisili vs Kantor (`DistanceMap`):** Peta visual Leaflet dengan Pin Merah (Kantor), Pin Biru (Domisili), dan Garis Putus-Putus Rute.
  - Dropdown Pengubah Status Kandidat ('Pending', 'Ready to Interview', 'Rejected', 'Hired').

### Task 1.8: Halaman Pengaturan Perusahaan & AI (`/settings`)
- **Status:** ✅ Completed
- **Kategori:** Frontend Page (Multi-Tenant Settings)
- **Rincian Fitur:**
  - Form Profil Perusahaan (Nama Perusahaan, Industri, Website).
  - Slider Strictness / Tingkat Ketat Penyaringan AI.
  - Select Format Provider AI: **Google Gemini AI**, **OpenAI Format**, atau **Anthropic Format**.
  - Select Model AI: Preset model standar (`gemini-1.5-flash`, `gpt-4o-mini`, `claude-3-5-sonnet`, dll) + **Mode Kustom (Tulis Sendiri)**.
  - Input Masked Kunci API (API Key) & Input URL Proxy / Endpoint Kustom.

### Task 1.9: Halaman Manajemen Tim Perusahaan (`/settings/team`)
- **Status:** ✅ Completed
- **Kategori:** Frontend Page (Khusus Super Admin Perusahaan)
- **Rincian Fitur:**
  - Tab Navigasi Sub-Header untuk berpindah antara Profil/AI Config, Manajemen Tim, dan Integrasi.
  - Form & Modal Undang Anggota Tim Baru via Email dengan pilihan role (`Super Admin` vs `Recruiter / SR Staff`).
  - Tabel Daftar Anggota Tim Perusahaan (Nama, Email, Role Badge, Status Aktif/Diundang, Tanggal Bergabung).
  - Dropdown Menu Kelola Akses: Modal Ubah Role Anggota Tim & Tombol Pencabutan Akses Tim.

### Task 1.10: Halaman Integrasi Email & Kalender (`/settings/integrations`)
- **Status:** ✅ Completed
- **Kategori:** Frontend Page & OAuth Triggers
- **Rincian Fitur:**
  - Card 1 (Khusus Super Admin): **Direct Gmail Integration 1-Click** via Google OAuth 2.0 (`gmail.readonly`). Status badge terhubung, email terhubung, & tombol putuskan koneksi.
  - Tab Fallback: Kode Skrip Otomasi Google Apps Script v4 dengan tombol copy satu klik.
  - Card 2 (Per-User / SR Staff): **Sinkronisasi Google Calendar** via Google OAuth 2.0 (`calendar.events`). Switch toggle auto-sync & auto-reschedule jadwal wawancara.

---

## 📌 Phase 2: Backend APIs, Database, & AI Engine

### Task 2.1: Skema Database & Row Level Security (Supabase PostgreSQL)
- **Status:** ✅ Completed
- **Kategori:** Backend Database
- **Rincian Fitur:**
  - Tabel `profiles`: Menyimpan data HR, provider AI, API Key, proxy URL, & model AI.
  - Tabel `jobs`: Menyimpan detail lowongan, kriteria JSONB, lokasi lat/lng kantor, max distance radius, & status.
  - Tabel `candidates`: Menyimpan data pelamar, URL CV, raw text, lokasi lat/lng domisili, jarak terhitung, total score, & hasil JSONB AI.
  - Row Level Security (RLS) policies untuk pemisahan data per-perusahaan (multi-tenant).
  - Trigger `on_auth_user_created` untuk pembuatan profil otomatis saat signup.

### Task 2.2: Multi-Provider AI Scoring Engine (`src/lib/gemini.ts`)
- **Status:** ✅ Completed
- **Kategori:** Backend AI Engine
- **Rincian Fitur:**
  - Dukungan REST Client untuk Google Gemini, OpenAI Chat Completions, dan Anthropic Messages.
  - Fallback ekstraksi teks PDF via `pdf-parse`.
  - Ekstraksi identitas ganda (Nama & Email dari isi CV + email body pengirim).
  - Format output JSON terstruktur: Total Score, Qualified Status, Mandatory Checks, Reasoning.

### Task 2.3: Ingestion Webhook & Radius Calculation (`/api/webhook/ingest`)
- **Status:** ✅ Completed
- **Kategori:** Backend Webhook API
- **Rincian Fitur:**
  - Endpoint penerima FormData CV PDF + Metadata.
  - Perhitungan Jarak Haversine antara koordinat domisili pelamar dan lokasi kantor.
  - Auto-screening radius: otomatis menandai *Not Qualified* jika melebihi `max_distance` wajib.
  - Proteksi ganda: Token Rahasia (`WEBHOOK_SECRET`) untuk script luar + Same-Origin Bypass untuk form web.

### Task 2.4: Auto-Migration Database Runner (`src/lib/migrations.ts` & `src/instrumentation.ts`)
- **Status:** ✅ Completed
- **Kategori:** Backend Infrastructure
- **Rincian Fitur:**
  - Auto-runner berbasis `instrumentation.ts` yang berjalan setiap kali server/build di-deploy.
  - Koneksi langsung via driver PostgreSQL (`DATABASE_URL`).
  - Tabel pelacak `_migrations` untuk memastikan file `.sql` hanya dijalankan 1 kali secara kronologis.

### Task 2.5: OAuth 2.0 Auth Callback Routes (`/api/auth/google/*`)
- **Status:** ✅ Completed
- **Kategori:** Backend API Routes (OAuth 2.0)
- **Rincian Fitur:**
  - Route `/api/auth/google/connect`: Membuat URL otorisasi Google OAuth 2.0 dengan scope dinamik (`gmail.readonly` untuk Direct Gmail & `calendar.events` untuk Google Calendar Sync).
  - Route `/api/auth/google/callback`: Menangani pertukaran OAuth authorization code dengan `access_token` & `refresh_token`, menginisialisasi profil Gmail terhubung, dan menyimpan token terenkripsi di database.

---

## 📌 Phase 3: Integration, Automation & Security

### Task 3.1: Skrip Otomasi Inbox Gmail (Google Apps Script v4)
- **Status:** ✅ Completed
- **Kategori:** Automation Integration
- **Rincian Fitur:**
  - Skrip Google Apps Script untuk pemantauan otomatis inbox Gmail.
  - Iterasi pesan dalam thread untuk menangani balasan email (multi-reply).
  - Ekstraksi lampiran PDF dan pengiriman HTTP POST ke `/api/webhook/ingest?secret=...`.
  - Penandaan label `HR-PROCESSED` otomatis pada thread yang sukses.
