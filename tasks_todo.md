# Agent 1: Tasks To Do (Daftar Task Belum Dikerjakan)

Dokumen ini berisi daftar **rencana task pengembangan mendatang** yang telah diperbarui sesuai arsitektur **Multi-Role (Super Admin vs SR Staff/Interviewer)**, **Sistem Mandat & Notifikasi**, dan **Integrasi Google Calendar Per-User**.

Setiap task dirancang secara terfokus (maksimal 1 halaman/komponen spesifik per task) agar **konteks pengerjaan AI tidak terlalu besar dan hasil eksekusinya presisi & akurat**.

---

## 📐 Arsitektur Peran & Alur Kerja Baru (Multi-Role Pipeline)

```mermaid
graph TD
    SA[Super Admin HR Lead] -->|1. Setup AI, Email & Lowongan| Job[Job Creation & AI Screening]
    Job -->|2. Automated AI Ingestion| Cand[Kandidat Qualified]
    SA -->|3. Mandat / Assign Candidate & Date| Assign[Sistem Mandat / Schedule]
    Assign -->|4. Trigger In-App Notification| Staff[Recruiter / SR Staff / Interviewer]
    Assign -->|5. Auto Sync Event| GCal[Google Calendar User]
    Staff -->|6. Terima Notifikasi & Buka Profil| Review[Wawancara & Update Status]
    Staff -->|7. Reschedule (Tgl 1 -> Tgl 2)| GCal
```

---

## 🚀 Phase 1: Frontend Enhancements (Tiap Task Maksimal 1 Halaman / Komponen)

### Task 1.1: Halaman Manajemen Tim & Undangan Anggota (`/settings/team`)
- **Halaman Target:** `/settings/team`
- **Cakupan Fitur:**
  - Khusus **Super Admin**: Form mengundang anggota tim baru (Recruiter / SR Staff) ke dalam workspace perusahaan.
  - Tabel Daftar Anggota Tim (Nama, Email, Role `Super Admin` vs `Recruiter/SR Staff`, Status Undangan).
  - Modal ubah role anggota & tombol hapus akses tim.

### Task 1.2: Komponen Koneksi Google Calendar Per-User (`/settings` - Tab Kalender)
- **Halaman Target:** `/settings` (Tab / Seksi Google Calendar)
- **Cakupan Fitur:**
  - Tombol **"Hubungkan Google Calendar"** via Google OAuth 2.0 untuk setiap user (baik Super Admin maupun SR Staff).
  - Indikator Status Koneksi (Terhubung / Belum Terhubung), Tampilan Email Google, & Tombol Disconnect.
  - Pengaturan Sinkronisasi Otomatis Jadwal Wawancara.

### Task 1.3: Komponen Pusat Notifikasi Aplikasi (`notification-popover.tsx`)
- **Komponen Target:** `src/components/layout/notification-popover.tsx` (di Header Topbar)
- **Cakupan Fitur:**
  - Tombol Ikon Lonceng Notifikasi di Header dengan *Unread Badge Count*.
  - Popover dropdown list notifikasi real-time: Notifikasi saat kandidat dimandatkan ke user, jadwal wawancara baru, atau perubahan tanggal wawancara (reschedule).
  - Klik notifikasi langsung membuka halaman profil kandidat terkait.

### Task 1.4: Modal Penugasan Mandat & Jadwal Wawancara (`schedule-interview-modal.tsx`)
- **Komponen Target:** `src/components/ui/schedule-interview-modal.tsx`
- **Cakupan Fitur:**
  - Select Dropdown Anggota Tim SR Staff yang diberikan mandat (*Assignee*).
  - Date & Time Picker untuk menentukan jadwal wawancara.
  - Input Lokasi / Link Google Meet.
  - Fitur **Reschedule** (Ubah Jadwal dari Tanggal 1 ke Tanggal 2).
  - Checkbox opsi sinkronkan ke Google Calendar SR Staff.

### Task 1.5: Refinement Halaman Candidate Pipeline (`/jobs/[jobId]` - Part 4)
- **Halaman Target:** `/jobs/[jobId]`
- **Cakupan Fitur:**
  - Badge Penugasan (*Assigned Staff*) pada tabel kandidat.
  - Filter kandidat berdasarkan SR Staff yang ditugaskan.
  - Fitur **Export to CSV / Excel** untuk daftar kandidat lowongan.
  - Multi-select checkbox untuk **Bulk Status Update** (misal: Ubah 10 kandidat ke 'Ready to Interview').

### Task 1.6: Refinement Halaman Detail Kandidat (`/candidates/[candidateId]` - Part 2)
- **Halaman Target:** `/candidates/[candidateId]`
- **Cakupan Fitur:**
  - Kartu Informasi Mandat SR Staff & Jadwal Wawancara Aktif.
  - Tombol aksi cepat: **Beri Mandat / Ubah Jadwal Wawancara** (Membuka `schedule-interview-modal.tsx`).
  - Section Catatan Internal HRD (HR Notes & Interview Comments).
  - Cetak Rangkuman Profil & Hasil Skor AI ke PDF.

### Task 1.7: Refinement Halaman Main Dashboard Analytics (`/dashboard` - Part 2)
- **Halaman Target:** `/dashboard`
- **Cakupan Fitur:**
  - Widget **"Jadwal Wawancara Saya Hari Ini"** khusus untuk akun Recruiter / SR Staff yang login.
  - Chart Visualisasi Tren Pelamar Bulanan & Donut Distribution Kelulusan.
  - Filter rentang waktu statistik.

---

## ⚙️ Phase 2: Backend APIs, Database & Role Access

### Task 2.1: Migrasi Skema Database Multi-Role, Notifikasi & Token Calendar
- **File Migrasi:** `supabase/migrations/20260802000000_add_roles_notifications_calendar.sql`
- **Cakupan Fitur:**
  - Tambah kolom `role` pada `profiles` (`super_admin` | `recruiter`).
  - Tabel `team_invitations` (id, company_id, email, role, token, status).
  - Tabel `candidate_assignments` (id, candidate_id, assigned_to_user_id, assigned_by_user_id, scheduled_at, location, notes).
  - Tabel `notifications` (id, user_id, title, message, link, is_read, created_at).
  - Tabel `google_tokens` (id, user_id, access_token, refresh_token, expires_at).
  - Kebijakan RLS agar SR Staff dapat melihat lowongan/kandidat perusahaan mereka atau yang ditugaskan kepada mereka.

### Task 2.2: API Manajemen Tim Perusahaan (`/api/team`)
- **API Target:** `/api/team` & `/api/team/invite`
- **Cakupan Fitur:**
  - Endpoint Khusus Super Admin untuk mengundang anggota baru via email, mengubah role, dan mencabut akses anggota.

### Task 2.3: API Pusat Notifikasi In-App (`/api/notifications`)
- **API Target:** `/api/notifications`
- **Cakupan Fitur:**
  - Endpoint GET list notifikasi user & PATCH mark as read.
  - Helper fungsi pembuat notifikasi saat ada penugasan mandat atau reschedule jadwal.

### Task 2.4: API Penugasan Mandat & Jadwal Wawancara (`/api/interviews`)
- **API Target:** `/api/interviews`
- **Cakupan Fitur:**
  - Endpoint POST/PATCH untuk memberikan mandat ke SR Staff, menetapkan tanggal wawancara, atau mengubah jadwal (reschedule tgl 1 -> tgl 2).
  - Memicu pembuat notifikasi in-app & panggilan sinkronisasi ke Google Calendar API.

### Task 2.5: API Notifikasi Email Kandidat (`/api/candidates/[candidateId]/notify`)
- **API Target:** `/api/candidates/[candidateId]/notify`
- **Cakupan Fitur:** Endpoint pengiriman email panggilan wawancara / penolakan ke kandidat.

### Task 2.6: API Bulk Candidate Actions (`/api/candidates/bulk-update`)
- **API Target:** `/api/candidates/bulk-update`
- **Cakupan Fitur:** Endpoint batch update status kandidat.

---

## 🤖 Phase 3: Integrations & Service Services

### Task 3.1: Layanan Integrasi Google Calendar API (`src/lib/google-calendar.ts`)
- **File Target:** `src/lib/google-calendar.ts` & `/api/auth/google-calendar`
- **Cakupan Fitur:**
  - Alur Google OAuth 2.0 Authorization Code flow per user.
  - Fungsi `createCalendarEvent()`: Membuat event wawancara otomatis di Google Calendar SR Staff.
  - Fungsi `updateCalendarEvent()`: Mengubah tanggal/waktu event secara otomatis saat terjadi reschedule (misal dari tgl 1 ke tgl 2).
  - Refresh token handler otomatis saat access token kadaluarsa.

### Task 3.2: Support Multi-File Attachment Ingestion
- **Cakupan Fitur:** Pengiriman beberapa file sekaligus (CV + Portofolio) dari email/form.
