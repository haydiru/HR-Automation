# HR Automation System 🚀

**HR Automation System** adalah platform SaaS manajemen rekrutmen cerdas berbasis web yang dirancang untuk mengotomatisasi proses penyaringan CV (*CV Screening*), penilaian kriteria kandidat berbasis Artificial Intelligence (AI), dan verifikasi kualifikasi lokasi (radius domisili vs kantor) secara otomatis.

Sistem ini mendukung arsitektur **Multi-Tenant**, di mana setiap perusahaan/HRD memiliki ruang kerja terisolasi, database kandidat terlindungi *Row Level Security* (RLS), serta dapat mengonfigurasi provider AI dan API Key masing-masing.

---

## 🌟 Fitur Utama & Keunggulan

### 1. 🤖 Multi-Provider AI Screening & Scoring Engine
- **Fleksibilitas Provider AI:** Mendukung **Google Gemini AI**, **OpenAI Format**, dan **Anthropic Format**.
- **Model Preset & Custom:** Pilihan model populer (`gemini-1.5-flash`, `gemini-1.5-pro`, `gpt-4o-mini`, `gpt-4o`, `claude-3-5-sonnet`, `claude-3-5-haiku`) serta dukungan input **Model Kustom / Proxy URL** (misal: OpenRouter, Portkey, dll).
- **Pengaturan Per-Perusahaan:** API Key dan Proxy URL dikelola secara mandiri oleh tiap perusahaan di halaman `/settings`.
- **Dual Identity Extraction:** AI membaca Nama & Email kandidat langsung dari isi dokumen CV. Jika di CV tidak tercantum, AI mengambil referensi dari isi pesan email.
- **Evaluasi Syarat Wajib & Opsional:** AI memeriksa kelulusan kriteria wajib (*Mandatory Check*) dan menghitung skor persentase (0–100%) untuk kriteria opsional beserta *Passing Grade*.

### 2. 🗺️ Screening Radius Lokasi & Peta Interaktif (OpenStreetMap + Leaflet)
- **100% Gratis & Open-Source:** Menggunakan OpenStreetMap + Leaflet + Nominatim Geocoder tanpa biaya API Key / kartu kredit.
- **Tagging Lokasi Kantor:** Admin HR dapat menentukan titik lokasi kantor dan jarak maksimum radius tempat tinggal kandidat (`max_distance` dalam km) di halaman `/jobs/create`.
- **Tagging Domisili Pelamar:** Kandidat dapat menandai lokasi tinggal mereka melalui peta interaktif pada formulir lamaran publik `/apply/[jobId]`.
- **Perhitungan Jarak Haversine Automatic:** Server menghitung jarak presisi antara domisili kandidat dan kantor. Jika syarat jarak diatur sebagai wajib dan kandidat berada di luar radius, kandidat otomatis ditandai *Not Qualified*.
- **Peta Rute Visual:** Halaman detail kandidat menampilkan peta visual berisi pin lokasi kantor (merah), pin domisili kandidat (biru), dan garis rute penghubung.

### 3. 📥 Dual-Mode Ingestion (Formulir Publik & Otomasi Email)
- **Formulir Publik (`/apply/[jobId]`):** Halaman publik tanpa perlu login yang dapat diakses calon pelamar untuk melihat detail lowongan dan mengajukan lamaran. Didukung *Same-Origin Security Bypass*.
- **Otomasi Inbox Email (Google Apps Script v4):** Skrip Apps Script yang memantau pesan masuk Gmail secara otomatis, mengekstrak lampiran CV, dan mengirimkannya ke webhook server via token rahasia (`/api/webhook/ingest?secret=...`).

### 4. 🗄️ Auto-Migration Database Supabase
- **Otomatisasi Skema Database:** Aplikasi secara otomatis mendeteksi dan menjalankan file migrasi `.sql` di folder `supabase/migrations/` saat server/build di-deploy menggunakan koneksi PostgreSQL langsung (`DATABASE_URL`). Tidak perlu eksekusi SQL manual!

### 5. 🔒 Keamanan & Multi-Tenancy (Row Level Security)
- Terintegrasi dengan **Supabase Auth** & **Row Level Security (RLS)**.
- Penyimpanan dokumen CV bersifat **Private Bucket**. Aplikasi menghasilkan *Signed URL* berbatas waktu untuk pratinjau dokumen di dashboard HR.

---

## 🛠️ Tech Stack

- **Frontend & Backend Framework:** Next.js 16 (App Router, Server Actions, Route Handlers, Instrumentation)
- **Language:** TypeScript
- **Styling & UI:** Tailwind CSS, shadcn/ui, Lucide React Icons
- **Database & Storage:** Supabase PostgreSQL & Supabase Private Storage
- **Mapping & Geocoding:** Leaflet, OpenStreetMap, Nominatim API
- **AI Integrations:** Google Gemini API, OpenAI API Format, Anthropic API Format
- **PDF Parser:** `pdf-parse` (Fallback extraction)
- **Database Migrations:** `pg` (Direct PostgreSQL Client)

---

## 🏗️ Struktur Project

```text
HR-Automation/
├── prd.md                                # Product Requirement Document (Spesifikasi Teknis)
├── README.md                             # Dokumentasi Sistem & Panduan Penggunaan
└── frontend/
    ├── next.config.ts                    # Konfigurasi Next.js (External Packages: pdf-parse, pg)
    ├── package.json                      # Dependencies & Scripts
    ├── supabase/
    │   └── migrations/                   # File Migrasi SQL Otomatis
    │       ├── init.sql                  # Skema Dasar (Profiles, Jobs, Candidates, RLS)
    │       ├── 20260718000000_...sql     # Migrasi Field Lokasi & Radius Jarak
    │       ├── 20260718000001_...sql     # Migrasi Field Provider AI & Proxy
    │       └── 20260718000002_...sql     # Migrasi Field Model AI
    └── src/
        ├── instrumentation.ts            # Next.js Server Hook (Memicu Auto-Migration)
        ├── proxy.ts                      # Supabase Middleware (Security & Session)
        ├── app/
        │   ├── (auth)/                   # Halaman Login & Register
        │   ├── (dashboard)/              # Area Terproteksi HR
        │   │   ├── dashboard/            # Analytics & Stat Cards Real-time
        │   │   ├── jobs/                 # List Lowongan & Form Buat Lowongan Baru
        │   │   ├── candidates/           # Detail Kandidat, PDF Viewer, & Peta Rute
        │   │   └── settings/             # Form Pengaturan Perusahaan & AI Provider
        │   ├── apply/[jobId]/            # Formulir Lamaran Publik Pelamar
        │   └── api/
        │       ├── webhook/ingest/       # Endpoint Ingestion CV & AI Scoring
        │       ├── jobs/                 # Public & Private Job APIs
        │       └── candidates/           # Candidate Management APIs
        ├── components/
        │   ├── layout/                   # Sidebar & Header Dashboard
        │   └── ui/                       # MapPicker, DistanceMap, AIInsightModal, dll.
        └── lib/
            ├── gemini.ts                 # Engine Analisis AI Multi-Provider
            ├── migrations.ts             # Auto-Migration PostgreSQL Runner
            └── supabase/                 # Client, Server, & Middleware Supabase Configs
```

---

## 📊 Database Schema (Supabase PostgreSQL)

```mermaid
erDiagram
    profiles {
        uuid id PK "references auth.users"
        string email
        string full_name
        string company_name
        string ai_provider "gemini | openai | anthropic"
        string ai_api_key "Encrypted API key"
        string ai_proxy_url "Custom proxy endpoint"
        string ai_model "Selected AI model name"
    }

    jobs {
        uuid id PK
        uuid user_id FK "references profiles(id)"
        string title
        text description
        jsonb mandatory_criteria
        jsonb optional_criteria
        int passing_grade
        string alias_email
        string status "active | closed"
        double work_latitude
        double work_longitude
        text work_address
        double max_distance "Radius maks (km)"
        boolean distance_mandatory
    }

    candidates {
        uuid id PK
        uuid job_id FK "references jobs(id)"
        string full_name
        string email
        string phone
        string cv_url
        text raw_text
        jsonb analysis_result
        int total_score
        boolean is_qualified
        string status "Pending | Ready to Interview | Rejected | Hired"
        double domicile_latitude
        double domicile_longitude
        text domicile_address
        double distance_to_work "Jarak terhitung (km)"
    }

    profiles ||--o{ jobs : "creates"
    jobs ||--o{ candidates : "receives"
```

---

## 🚀 Alur Kerja Ingestion & Scoring (Sequence Diagram)

```mermaid
sequenceDiagram
    participant Candidate as Pelamar (Form / Email)
    participant Webhook as Next.js API (/api/webhook/ingest)
    participant Storage as Supabase Private Storage
    participant DB as Supabase PostgreSQL
    participant AI as AI Engine (Gemini/OpenAI/Anthropic)
    participant HR as HR Dashboard

    Candidate->>Webhook: Submit Form / Send Email Attachment
    Webhook->>Storage: Upload File CV PDF
    Webhook->>DB: Ambil Kriteria Lowongan & Config AI Profil Employer
    Webhook->>Webhook: Hitung Jarak Haversine (Domisili vs Kantor)
    Webhook->>AI: Kirim Teks CV / PDF + Prompt Kriteria Lowongan
    AI-->>Webhook: Output JSON (Skor, Mandatory Checks, Reasoning, Identity)
    Webhook->>DB: Simpan Data Kandidat & Hasil Screening AI
    DB-->>HR: Dashboard Real-time Terupdate
```

---

## 🔧 Panduan Instalasi & Setup Lokal

### 1. Clone Repository & Install Dependencies

```bash
git clone https://github.com/haydiru/HR-Automation.git
cd HR-Automation/frontend
npm install
```

### 2. Konfigurasi Environment Variables (`.env.local`)

Buat file `.env.local` di folder `frontend/`:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Direct Postgres Connection (Diperlukan untuk Auto-Migration)
DATABASE_URL=postgresql://postgres.your-project:your-password@aws-0-region.pooler.supabase.com:6543/postgres

# Default System AI Key (Fallback jika user tidak isi di Settings)
GEMINI_API_KEY=your-default-gemini-api-key

# Webhook Secret Token (Untuk Google Apps Script / n8n)
WEBHOOK_SECRET=hookn8ngmail
```

### 3. Jalankan Development Server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) pada browser Anda. Migrasi database akan berjalan otomatis saat server pertama kali diaktifkan!

---

## ⚙️ Integrasi Google Apps Script (Otomasi Inbox Gmail)

Untuk mengarahkan email pelamar dari Gmail ke sistem secara otomatis:

1. Buka [Google Apps Script](https://script.google.com/) dari akun Gmail rekrutmen Anda.
2. Tempelkan kode skrip berikut:

```javascript
const API_URL = "https://hr-automation-one.vercel.app/api/webhook/ingest?secret=hookn8ngmail";
const PROCESSED_LABEL = "HR-PROCESSED";

function monitorGmailHR() {
  let label = GmailApp.getUserLabelByName(PROCESSED_LABEL);
  if (!label) {
    label = GmailApp.createLabel(PROCESSED_LABEL);
  }

  const threads = GmailApp.search('has:attachment -label:' + PROCESSED_LABEL, 0, 20);

  for (let i = 0; i < threads.length; i++) {
    const thread = threads[i];
    const messages = thread.getMessages();
    let threadProcessedSuccessfully = false;

    for (let j = 0; j < messages.length; j++) {
      const message = messages[j];
      const attachments = message.getAttachments();

      for (let k = 0; k < attachments.length; k++) {
        const attachment = attachments[k];
        if (attachment.getContentType() === "application/pdf") {
          const payload = {
            "email": message.getFrom(),
            "subject": message.getSubject(),
            "email_body": message.getPlainBody(),
            "to_address": message.getTo(),
            "file": attachment.getAs("application/pdf")
          };

          const options = {
            "method": "post",
            "payload": payload,
            "muteHttpExceptions": true
          };

          try {
            const response = UrlFetchApp.fetch(API_URL, options);
            if (response.getResponseCode() === 200) {
              threadProcessedSuccessfully = true;
              Logger.log("✅ Berhasil dikirim ke sistem HR Automation!");
            }
          } catch (e) {
            Logger.log("⚠️ Error: " + e.toString());
          }
        }
      }
    }

    if (threadProcessedSuccessfully) {
      thread.addLabel(label);
    }
  }
}
```

3. Buat **Trigger** pada Google Apps Script untuk menjalankan fungsi `monitorGmailHR` setiap 5 atau 10 menit.

---

## 📋 Status Penyelesaian Fitur (Completion Checklist)

- [x] **Autentikasi Multi-Tenant:** Auth Supabase, pendaftaran profil, pemisahan RLS.
- [x] **Manajemen Lowongan:** Pembuatan lowongan, kriteria wajib/opsional, *passing grade*, email alias, publik link.
- [x] **Formulir Pelamar Publik:** Halaman `/apply/[jobId]` tanpa login, upload CV PDF, tag lokasi domisili pelamar.
- [x] **Geolokasi & Radius Screening:** Tagging lokasi kantor & domisili via OpenStreetMap Leaflet, perhitungan jarak Haversine, penyaringan radius otomatis.
- [x] **Analisis AI Cerdas:** Ekstraksi identitas murni dari dokumen CV, penilaian kriteria wajib & opsional, skor akhir, ringkasan dan *reasoning*.
- [x] **Multi-Provider AI Settings:** Halaman `/settings` mendukung Google Gemini, OpenAI API, Anthropic API, pilihan model preset/kustom, serta proxy URL custom.
- [x] **Visualisasi Dashboard & Detail:** Pratinjau PDF CV (Signed URL), peta rute jarak kantor-domisili, status updater, modal AI Insight.
- [x] **Otomasi Ingestion:** Endpoint `/api/webhook/ingest` mendukung same-origin bypass dan token rahasia webhook untuk Apps Script / n8n.
- [x] **Auto-Migration Database:** Eksekusi skema database otomatis berbasis `instrumentation.ts` dan PostgreSQL driver.

---

## 📄 Lisensi & Kontribusi

Sistem ini dikembangkan khusus untuk otomatisasi rekrutmen internal dan komersial SaaS. Hak cipta dilindungi.
