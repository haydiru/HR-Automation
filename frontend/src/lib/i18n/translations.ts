export type Language = "en" | "id";

export const translations = {
  en: {
    // Navigation
    nav_dashboard: "Dashboard",
    nav_jobs: "Jobs",
    nav_all_candidates: "All Candidates",
    nav_settings: "Settings",
    nav_logout: "Log Out",
    nav_pro_badge: "PRO",
    nav_subtitle: "HR Automation OS",
    nav_profile_config: "My Profile & AI Config",
    nav_stages_config: "Recruitment Stages",

    // Header
    search_placeholder: "Search jobs or candidates...",
    logout_system: "Log Out of System",
    notifications: "Notification Center",
    mark_all_read: "Mark all read",
    no_notifications: "No notifications yet.",

    // Dashboard
    dash_welcome: "Welcome back",
    dash_hero_desc: "Here is your company's recruitment overview today. Active job openings are receiving and processing applicant files automatically.",
    dash_create_job: "Create New Job",
    dash_stat_active_jobs: "Active Jobs",
    dash_stat_total_applicants: "Total Applicants",
    dash_stat_qualified: "Qualified Candidates",
    dash_stat_mandates: "Interview Mandates",
    dash_growth_title: "Applicant Growth Trend & Qualified Rate",
    dash_qual_ratio_title: "AI Qualification Ratio",
    dash_interviews_title: "Your Interview Schedule",
    dash_recent_feed_title: "Recent Applicants Feed",
    dash_view_all: "View All",

    // Jobs
    jobs_title: "Job Openings Management",
    jobs_subtitle: "Manage active positions, AI screening criteria, and custom recruitment workflows",
    jobs_create_btn: "Create New Job",
    jobs_search_placeholder: "Search job title or position...",
    jobs_filter_all: "All Status",
    jobs_filter_active: "🟢 Active",
    jobs_filter_closed: "⚪ Closed",
    jobs_passing_grade: "Passing Grade",
    jobs_stage_scheme: "Stage Scheme",
    jobs_copy_alias: "Copy Ingestion Email",
    jobs_public_form: "Public Application Form",
    jobs_delete_dialog_title: "Delete Job Permanently?",
    jobs_close_dialog_title: "Close Job Position?",

    // Create Job
    create_job_title: "Create New Job Position",
    create_job_subtitle: "Configure AI screening criteria, recruitment stage workflows, and work location",
    create_job_sec1: "1. Primary Position Information",
    create_job_sec2: "2. Selection Stage Pipeline Scheme",
    create_job_sec3: "3. Domicile Location Radius Filter",
    create_job_sec4: "4. AI Screening Evaluation Criteria",
    create_job_sec5: "5. AI Score Passing Grade Threshold",
    create_job_submit: "Save & Publish Job",

    // Candidates
    cand_list_title: "All Candidates List",
    cand_list_subtitle: "Manage and track all applicants across your company's job positions",
    cand_export_csv: "Export CSV",
    cand_refresh: "Refresh Data",
    cand_filter_ready: "Qualified Only",
    cand_table_candidate: "Candidate",
    cand_table_job: "Job Position",
    cand_table_score: "AI Score",
    cand_table_mandatory: "Mandatory",
    cand_table_staff: "Assigned SR Staff",
    cand_table_stage: "Current Stage",
    cand_table_date: "Applied Date",
    cand_table_actions: "Actions",

    // Candidate Detail
    detail_advance: "Advance Stage",
    detail_reject: "Reject Candidate",
    detail_mandate: "Assign Mandate",
    detail_print: "Print PDF",
    detail_stage_progress: "Candidate Selection Stage Progress",
    detail_mandate_card: "Mandate Assignment & Interview Status",
    detail_cv_preview: "Curriculum Vitae (CV) Preview",
    detail_ai_reasoning: "AI Analysis & Reasoning",
    detail_hr_notes: "HR Internal Notes",
    detail_eval_notes: "Interview Evaluation Comments",

    // Settings
    settings_title: "Company Profile & AI Provider Settings",
    settings_sub_profile: "Profile & AI Config",
    settings_sub_stages: "Recruitment Stages",
    settings_sub_team: "Team Management",
    settings_sub_integrations: "Email & Calendar Integrations",
    settings_strictness: "Screening Strictness Threshold",
    settings_ai_provider: "AI Provider",
    settings_save: "Save Changes",

    // Apply Public
    apply_portal_title: "Official Application Portal",
    apply_sec1: "1. Applicant Personal Information",
    apply_sec2: "2. Residence / Domicile Location",
    apply_sec3: "3. Educational Background",
    apply_sec4: "4. Work Experience",
    apply_sec5: "5. Upload Curriculum Vitae (PDF)",
    apply_submit: "Submit Application Now",
    apply_success_title: "Application Submitted Successfully!",

    // Language Selector
    language_select: "Language",
    lang_en: "English 🇺🇸",
    lang_id: "Bahasa Indonesia 🇮🇩",
  },
  id: {
    // Navigation
    nav_dashboard: "Dashboard",
    nav_jobs: "Lowongan",
    nav_all_candidates: "Semua Kandidat",
    nav_settings: "Pengaturan",
    nav_logout: "Keluar",
    nav_pro_badge: "PRO",
    nav_subtitle: "HR Automation OS",
    nav_profile_config: "Profil Saya & Provider AI",
    nav_stages_config: "Tahapan Rekrutmen",

    // Header
    search_placeholder: "Cari lowongan / kandidat...",
    logout_system: "Keluar dari Sistem",
    notifications: "Pusat Notifikasi",
    mark_all_read: "Tandai Dibaca",
    no_notifications: "Belum ada notifikasi.",

    // Dashboard
    dash_welcome: "Selamat datang kembali",
    dash_hero_desc: "Ringkasan aktivitas rekrutmen perusahaan Anda hari ini. Lowongan aktif sedang menerima dan memproses berkas kandidat secara otomatis.",
    dash_create_job: "Buat Lowongan Baru",
    dash_stat_active_jobs: "Lowongan Aktif",
    dash_stat_total_applicants: "Total Pelamar",
    dash_stat_qualified: "Kandidat Qualified",
    dash_stat_mandates: "Mandat Wawancara",
    dash_growth_title: "Tren Pertumbuhan Pelamar & Qualified Rate",
    dash_qual_ratio_title: "Rasio Kualifikasi AI",
    dash_interviews_title: "Agenda Wawancara Anda",
    dash_recent_feed_title: "Kandidat Pelamar Terbaru",
    dash_view_all: "Lihat Semua",

    // Jobs
    jobs_title: "Manajemen Lowongan Kerja",
    jobs_subtitle: "Kelola posisi aktif, kriteria AI screening, dan kustomisasi alur rekrutmen",
    jobs_create_btn: "Buat Lowongan Baru",
    jobs_search_placeholder: "Cari posisi atau nama lowongan...",
    jobs_filter_all: "Semua Status",
    jobs_filter_active: "🟢 Aktif",
    jobs_filter_closed: "⚪ Ditutup",
    jobs_passing_grade: "Passing Grade",
    jobs_stage_scheme: "Skema Tahapan",
    jobs_copy_alias: "Salin Email Ingestion",
    jobs_public_form: "Form Lamaran Publik",
    jobs_delete_dialog_title: "Hapus Lowongan Permanen?",
    jobs_close_dialog_title: "Tutup Lowongan Pekerjaan?",

    // Create Job
    create_job_title: "Buat Lowongan Pekerjaan Baru",
    create_job_subtitle: "Konfigurasi syarat AI screening, alur tahapan rekrutmen, dan lokasi kerja",
    create_job_sec1: "1. Informasi Utama Posisi Lowongan",
    create_job_sec2: "2. Alur & Skema Tahapan Seleksi",
    create_job_sec3: "3. Filter Radius Lokasi Domisili",
    create_job_sec4: "4. Kriteria Evaluasi AI Screening",
    create_job_sec5: "5. Threshold Passing Grade Skor AI",
    create_job_submit: "Simpan & Terbitkan Lowongan",

    // Candidates
    cand_list_title: "Daftar Seluruh Kandidat",
    cand_list_subtitle: "Kelola dan pantau seluruh pelamar kerja lintas lowongan perusahaan Anda",
    cand_export_csv: "Export CSV",
    cand_refresh: "Refresh Data",
    cand_filter_ready: "Hanya Qualified",
    cand_table_candidate: "Kandidat",
    cand_table_job: "Posisi Lowongan",
    cand_table_score: "Skor AI",
    cand_table_mandatory: "Mandatory",
    cand_table_staff: "Staf SR Ditugaskan",
    cand_table_stage: "Tahapan Saat Ini",
    cand_table_date: "Tanggal Apply",
    cand_table_actions: "Aksi",

    // Candidate Detail
    detail_advance: "Majukan Tahapan",
    detail_reject: "Tolak Kandidat",
    detail_mandate: "Beri Mandat / Jadwal",
    detail_print: "Cetak PDF",
    detail_stage_progress: "Progres Tahapan Seleksi Kandidat",
    detail_mandate_card: "Penugasan Mandat & Status Wawancara",
    detail_cv_preview: "Preview Curriculum Vitae (CV)",
    detail_ai_reasoning: "Analisis Pertimbangan AI",
    detail_hr_notes: "Catatan Internal HRD",
    detail_eval_notes: "Hasil Evaluasi Wawancara",

    // Settings
    settings_title: "Pengaturan Perusahaan & Provider AI",
    settings_sub_profile: "Profil & AI Config",
    settings_sub_stages: "Tahapan Rekrutmen",
    settings_sub_team: "Manajemen Tim",
    settings_sub_integrations: "Integrasi Email & Kalender",
    settings_strictness: "Tingkat Ketat Penyaringan (Strictness Threshold)",
    settings_ai_provider: "Penyedia AI",
    settings_save: "Simpan Perubahan",

    // Apply Public
    apply_portal_title: "Portal Lamaran Rekrutmen Resmi",
    apply_sec1: "1. Data Pelamar",
    apply_sec2: "2. Lokasi Domisili Tempat Tinggal",
    apply_sec3: "3. Riwayat Pendidikan",
    apply_sec4: "4. Pengalaman Kerja",
    apply_sec5: "5. Upload Curriculum Vitae (PDF)",
    apply_submit: "Kirim Berkas Lamaran Sekarang",
    apply_success_title: "Lamaran Berhasil Terkirim!",

    // Language Selector
    language_select: "Bahasa",
    lang_en: "English 🇺🇸",
    lang_id: "Bahasa Indonesia 🇮🇩",
  },
} as const;
