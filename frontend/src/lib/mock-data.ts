import type {
  Job,
  Candidate,
  DashboardStats,
  ChartDataPoint,
  Profile,
} from "@/types";

// ============================================
// Profile
// ============================================
export const mockProfile: Profile = {
  id: "usr-001",
  email: "andi.prasetyo@techcorp.id",
  full_name: "Andi Prasetyo",
  company_name: "TechCorp Indonesia",
};

// ============================================
// Jobs
// ============================================
export const mockJobs: Job[] = [
  {
    id: "job-001",
    user_id: "usr-001",
    title: "Senior Frontend Developer",
    description:
      "Kami mencari Senior Frontend Developer berpengalaman untuk memimpin tim UI/UX dan membangun aplikasi web modern menggunakan React/Next.js.",
    mandatory_criteria: [
      "Minimal 5 tahun pengalaman di React.js",
      "Menguasai TypeScript",
      "Pengalaman dengan Next.js App Router",
    ],
    optional_criteria: [
      "Familiar dengan Tailwind CSS",
      "Pengalaman memimpin tim",
      "Kontribusi open-source",
    ],
    passing_grade: 75,
    alias_email: "rekrutmen+job001@techcorp.id",
    public_link: "/apply/job-001",
    status: "active",
    created_at: "2026-03-15T08:00:00Z",
    candidate_count: 24,
    qualified_count: 8,
  },
  {
    id: "job-002",
    user_id: "usr-001",
    title: "Backend Engineer (Go/Node.js)",
    description:
      "Dibutuhkan Backend Engineer untuk mengembangkan microservices dan API yang scalable.",
    mandatory_criteria: [
      "Minimal 3 tahun pengalaman backend development",
      "Menguasai Go atau Node.js",
      "Pengalaman dengan PostgreSQL",
    ],
    optional_criteria: [
      "Familiar dengan Docker & Kubernetes",
      "Pengalaman dengan gRPC",
      "Memahami event-driven architecture",
    ],
    passing_grade: 70,
    alias_email: "rekrutmen+job002@techcorp.id",
    public_link: "/apply/job-002",
    status: "active",
    created_at: "2026-03-18T10:30:00Z",
    candidate_count: 18,
    qualified_count: 5,
  },
  {
    id: "job-003",
    user_id: "usr-001",
    title: "UI/UX Designer",
    description:
      "Mencari UI/UX Designer kreatif yang mampu menghasilkan desain modern dan user-friendly.",
    mandatory_criteria: [
      "Portofolio desain UI/UX minimal 10 project",
      "Menguasai Figma",
      "Pemahaman Design System",
    ],
    optional_criteria: [
      "Kemampuan motion design",
      "Pengalaman riset pengguna",
      "Familiar dengan prototyping tools lainnya",
    ],
    passing_grade: 70,
    alias_email: "rekrutmen+job003@techcorp.id",
    public_link: "/apply/job-003",
    status: "active",
    created_at: "2026-03-20T14:00:00Z",
    candidate_count: 31,
    qualified_count: 12,
  },
  {
    id: "job-004",
    user_id: "usr-001",
    title: "DevOps Engineer",
    description:
      "Kami membutuhkan DevOps Engineer untuk mengelola infrastructure dan CI/CD pipeline.",
    mandatory_criteria: [
      "Pengalaman minimal 3 tahun di bidang DevOps",
      "Menguasai AWS atau GCP",
      "Pengalaman dengan CI/CD (GitHub Actions / GitLab CI)",
    ],
    optional_criteria: [
      "Sertifikasi cloud",
      "Pengalaman Terraform",
      "Monitoring & observability",
    ],
    passing_grade: 72,
    alias_email: "rekrutmen+job004@techcorp.id",
    public_link: "/apply/job-004",
    status: "active",
    created_at: "2026-03-25T09:00:00Z",
    candidate_count: 12,
    qualified_count: 4,
  },
  {
    id: "job-005",
    user_id: "usr-001",
    title: "Data Analyst Intern",
    description: "Lowongan magang untuk posisi Data Analyst. Terbuka untuk fresh graduate.",
    mandatory_criteria: [
      "Mahasiswa atau fresh graduate jurusan terkait",
      "Menguasai Excel dan SQL dasar",
    ],
    optional_criteria: [
      "Familiar dengan Python",
      "Pengalaman dengan tools BI (Tableau/Metabase)",
    ],
    passing_grade: 60,
    alias_email: "rekrutmen+job005@techcorp.id",
    public_link: "/apply/job-005",
    status: "closed",
    created_at: "2026-02-10T08:00:00Z",
    candidate_count: 45,
    qualified_count: 20,
  },
  {
    id: "job-006",
    user_id: "usr-001",
    title: "Product Manager",
    description:
      "Dicari Product Manager berpengalaman untuk memimpin pengembangan produk digital.",
    mandatory_criteria: [
      "Minimal 4 tahun pengalaman sebagai PM",
      "Kemampuan analisis data dan metrik produk",
      "Pengalaman bekerja dengan tim engineering",
    ],
    optional_criteria: [
      "Sertifikasi Scrum/Agile",
      "Pengalaman dengan B2B SaaS",
    ],
    passing_grade: 75,
    alias_email: "rekrutmen+job006@techcorp.id",
    public_link: "/apply/job-006",
    status: "active",
    created_at: "2026-03-28T11:00:00Z",
    candidate_count: 9,
    qualified_count: 3,
  },
];

// ============================================
// Candidates
// ============================================
export const mockCandidates: Candidate[] = [
  {
    id: "cand-001",
    job_id: "job-001",
    job_title: "Senior Frontend Developer",
    full_name: "Budi Santoso",
    email: "budi.santoso@email.com",
    phone: "+62 812-3456-7890",
    cv_url: "/sample-cv.pdf",
    raw_text: "Extracted text from CV...",
    analysis_result: {
      total_score: 92,
      mandatory_check: [
        { criteria: "Minimal 5 tahun pengalaman di React.js", passed: true, note: "7 tahun pengalaman React" },
        { criteria: "Menguasai TypeScript", passed: true, note: "Portofolio TypeScript yang kuat" },
        { criteria: "Pengalaman dengan Next.js App Router", passed: true, note: "2 project Next.js App Router" },
      ],
      skills_found: ["React.js", "TypeScript", "Next.js", "Tailwind CSS", "GraphQL", "Jest", "Git"],
      reasoning:
        "Kandidat memiliki 7 tahun pengalaman profesional di React.js dengan track record yang sangat baik. Menguasai TypeScript dibuktikan dari portofolio dan kontribusi open-source. Memiliki pengalaman langsung dengan Next.js App Router di 2 project komersial. Skor tinggi didukung oleh keahlian tambahan di GraphQL dan testing.",
      summary: "Kandidat sangat qualified dengan pengalaman yang melebihi semua syarat wajib.",
    },
    total_score: 92,
    is_qualified: true,
    status: "Ready to Interview",
    created_at: "2026-03-20T09:15:00Z",
  },
  {
    id: "cand-002",
    job_id: "job-001",
    job_title: "Senior Frontend Developer",
    full_name: "Siti Aminah",
    email: "siti.aminah@email.com",
    phone: "+62 813-9876-5432",
    cv_url: "/sample-cv.pdf",
    raw_text: "Extracted text from CV...",
    analysis_result: {
      total_score: 85,
      mandatory_check: [
        { criteria: "Minimal 5 tahun pengalaman di React.js", passed: true, note: "6 tahun pengalaman" },
        { criteria: "Menguasai TypeScript", passed: true, note: "Menggunakan TS di semua project terbaru" },
        { criteria: "Pengalaman dengan Next.js App Router", passed: true, note: "1 project besar dengan App Router" },
      ],
      skills_found: ["React.js", "TypeScript", "Next.js", "CSS Modules", "Redux", "Cypress"],
      reasoning:
        "Kandidat solid dengan 6 tahun pengalaman React dan penguasaan TypeScript yang terbukti. Pengalaman Next.js App Router ada meskipun terbatas di 1 project. Keahlian testing dengan Cypress menjadi nilai tambah.",
      summary: "Kandidat qualified, memenuhi semua syarat wajib dengan baik.",
    },
    total_score: 85,
    is_qualified: true,
    status: "Ready to Interview",
    created_at: "2026-03-21T14:30:00Z",
  },
  {
    id: "cand-003",
    job_id: "job-001",
    job_title: "Senior Frontend Developer",
    full_name: "Riko Firmansyah",
    email: "riko.f@email.com",
    phone: "+62 856-1234-5678",
    cv_url: "/sample-cv.pdf",
    raw_text: "Extracted text from CV...",
    analysis_result: {
      total_score: 68,
      mandatory_check: [
        { criteria: "Minimal 5 tahun pengalaman di React.js", passed: true, note: "5 tahun pengalaman" },
        { criteria: "Menguasai TypeScript", passed: true, note: "Familiar tetapi bukan expert" },
        { criteria: "Pengalaman dengan Next.js App Router", passed: false, note: "Hanya menggunakan Pages Router" },
      ],
      skills_found: ["React.js", "JavaScript", "Next.js Pages Router", "Styled Components"],
      reasoning:
        "Kandidat memiliki pengalaman React yang cukup namun belum pernah menggunakan App Router Next.js. TypeScript dikuasai di level menengah. Gagal di salah satu syarat wajib.",
      summary: "Tidak memenuhi syarat wajib: Pengalaman Next.js App Router.",
    },
    total_score: 68,
    is_qualified: false,
    status: "Rejected",
    created_at: "2026-03-22T10:00:00Z",
  },
  {
    id: "cand-004",
    job_id: "job-001",
    job_title: "Senior Frontend Developer",
    full_name: "Dewi Lestari",
    email: "dewi.lestari@email.com",
    phone: "+62 878-2345-6789",
    cv_url: "/sample-cv.pdf",
    raw_text: "Extracted text from CV...",
    analysis_result: {
      total_score: 78,
      mandatory_check: [
        { criteria: "Minimal 5 tahun pengalaman di React.js", passed: true, note: "5.5 tahun pengalaman" },
        { criteria: "Menguasai TypeScript", passed: true, note: "Sertifikasi TypeScript" },
        { criteria: "Pengalaman dengan Next.js App Router", passed: true, note: "Migrasi project ke App Router" },
      ],
      skills_found: ["React.js", "TypeScript", "Next.js", "Tailwind CSS", "Zustand"],
      reasoning:
        "Kandidat memenuhi semua syarat wajib dengan pengalaman yang solid. Memiliki sertifikasi TypeScript yang menjadi nilai tambah. Pengalaman migrasi ke App Router menunjukkan pemahaman mendalam.",
      summary: "Qualified. Memenuhi semua syarat dengan nilai di atas passing grade.",
    },
    total_score: 78,
    is_qualified: true,
    status: "Pending",
    created_at: "2026-03-23T16:45:00Z",
  },
  {
    id: "cand-005",
    job_id: "job-001",
    job_title: "Senior Frontend Developer",
    full_name: "Ahmad Fauzi",
    email: "ahmad.fauzi@email.com",
    phone: "+62 812-8765-4321",
    cv_url: "/sample-cv.pdf",
    raw_text: "Extracted text from CV...",
    analysis_result: {
      total_score: 45,
      mandatory_check: [
        { criteria: "Minimal 5 tahun pengalaman di React.js", passed: false, note: "Hanya 2 tahun pengalaman" },
        { criteria: "Menguasai TypeScript", passed: false, note: "Belum pernah menggunakan TS" },
        { criteria: "Pengalaman dengan Next.js App Router", passed: false, note: "Tidak ada pengalaman Next.js" },
      ],
      skills_found: ["React.js", "JavaScript", "HTML", "CSS", "Bootstrap"],
      reasoning:
        "Kandidat masih junior dengan hanya 2 tahun pengalaman React. Belum menguasai TypeScript dan tidak memiliki pengalaman Next.js. Tidak memenuhi persyaratan posisi senior.",
      summary: "Tidak qualified. Gagal di semua syarat wajib.",
    },
    total_score: 45,
    is_qualified: false,
    status: "Rejected",
    created_at: "2026-03-24T08:20:00Z",
  },
  {
    id: "cand-006",
    job_id: "job-002",
    job_title: "Backend Engineer (Go/Node.js)",
    full_name: "Hendra Wijaya",
    email: "hendra.w@email.com",
    phone: "+62 821-5678-1234",
    cv_url: "/sample-cv.pdf",
    raw_text: "Extracted text from CV...",
    analysis_result: {
      total_score: 88,
      mandatory_check: [
        { criteria: "Minimal 3 tahun pengalaman backend development", passed: true, note: "5 tahun backend" },
        { criteria: "Menguasai Go atau Node.js", passed: true, note: "Expert di Go, familiar Node.js" },
        { criteria: "Pengalaman dengan PostgreSQL", passed: true, note: "3+ tahun PostgreSQL" },
      ],
      skills_found: ["Go", "Node.js", "PostgreSQL", "Docker", "Kubernetes", "gRPC", "Redis"],
      reasoning: "Kandidat sangat kuat di backend development dengan keahlian Go yang mendalam.",
      summary: "Sangat qualified. Melebihi ekspektasi di semua area.",
    },
    total_score: 88,
    is_qualified: true,
    status: "Ready to Interview",
    created_at: "2026-03-22T11:00:00Z",
  },
  {
    id: "cand-007",
    job_id: "job-002",
    job_title: "Backend Engineer (Go/Node.js)",
    full_name: "Putri Handayani",
    email: "putri.h@email.com",
    phone: "+62 812-3333-4444",
    cv_url: "/sample-cv.pdf",
    raw_text: "Extracted text from CV...",
    analysis_result: {
      total_score: 72,
      mandatory_check: [
        { criteria: "Minimal 3 tahun pengalaman backend development", passed: true, note: "4 tahun" },
        { criteria: "Menguasai Go atau Node.js", passed: true, note: "Menguasai Node.js" },
        { criteria: "Pengalaman dengan PostgreSQL", passed: true, note: "2 tahun PostgreSQL" },
      ],
      skills_found: ["Node.js", "Express.js", "PostgreSQL", "MongoDB", "Docker"],
      reasoning: "Kandidat memenuhi syarat dasar. Pengalaman PostgreSQL cukup memadai.",
      summary: "Qualified dengan skor di atas passing grade.",
    },
    total_score: 72,
    is_qualified: true,
    status: "Pending",
    created_at: "2026-03-23T09:30:00Z",
  },
  {
    id: "cand-008",
    job_id: "job-003",
    job_title: "UI/UX Designer",
    full_name: "Maya Sari",
    email: "maya.sari@email.com",
    phone: "+62 857-9876-5432",
    cv_url: "/sample-cv.pdf",
    raw_text: "Extracted text from CV...",
    analysis_result: {
      total_score: 95,
      mandatory_check: [
        { criteria: "Portofolio desain UI/UX minimal 10 project", passed: true, note: "15+ project" },
        { criteria: "Menguasai Figma", passed: true, note: "Expert Figma user" },
        { criteria: "Pemahaman Design System", passed: true, note: "Membuat 3 design system" },
      ],
      skills_found: ["Figma", "Adobe XD", "Design System", "Prototyping", "User Research", "Motion Design"],
      reasoning: "Kandidat top-tier dengan portofolio yang sangat kuat dan pengalaman design system.",
      summary: "Kandidat terbaik untuk posisi ini.",
    },
    total_score: 95,
    is_qualified: true,
    status: "Hired",
    created_at: "2026-03-21T13:00:00Z",
  },
  {
    id: "cand-009",
    job_id: "job-003",
    job_title: "UI/UX Designer",
    full_name: "Rizki Aditya",
    email: "rizki.a@email.com",
    phone: "+62 838-1111-2222",
    cv_url: "/sample-cv.pdf",
    raw_text: "Extracted text from CV...",
    analysis_result: {
      total_score: 60,
      mandatory_check: [
        { criteria: "Portofolio desain UI/UX minimal 10 project", passed: false, note: "Hanya 6 project" },
        { criteria: "Menguasai Figma", passed: true, note: "Menguasai Figma" },
        { criteria: "Pemahaman Design System", passed: false, note: "Belum pernah membuat design system" },
      ],
      skills_found: ["Figma", "Canva", "Adobe Photoshop"],
      reasoning: "Portofolio kurang dan belum memiliki pengalaman design system.",
      summary: "Tidak memenuhi syarat wajib portofolio dan design system.",
    },
    total_score: 60,
    is_qualified: false,
    status: "Rejected",
    created_at: "2026-03-22T15:00:00Z",
  },
  {
    id: "cand-010",
    job_id: "job-004",
    job_title: "DevOps Engineer",
    full_name: "Fajar Nugroho",
    email: "fajar.n@email.com",
    phone: "+62 819-5555-6666",
    cv_url: "/sample-cv.pdf",
    raw_text: "Extracted text from CV...",
    analysis_result: {
      total_score: 82,
      mandatory_check: [
        { criteria: "Pengalaman minimal 3 tahun di bidang DevOps", passed: true, note: "4 tahun DevOps" },
        { criteria: "Menguasai AWS atau GCP", passed: true, note: "AWS Certified" },
        { criteria: "Pengalaman dengan CI/CD", passed: true, note: "GitHub Actions & GitLab CI" },
      ],
      skills_found: ["AWS", "Docker", "Kubernetes", "Terraform", "GitHub Actions", "Prometheus"],
      reasoning: "Kandidat solid dengan sertifikasi AWS dan pengalaman Terraform.",
      summary: "Qualified dan memiliki sertifikasi pendukung.",
    },
    total_score: 82,
    is_qualified: true,
    status: "Ready to Interview",
    created_at: "2026-03-26T10:00:00Z",
  },
  {
    id: "cand-011",
    job_id: "job-001",
    job_title: "Senior Frontend Developer",
    full_name: "Lina Marlina",
    email: "lina.m@email.com",
    phone: "+62 822-7777-8888",
    cv_url: "/sample-cv.pdf",
    raw_text: "Extracted text from CV...",
    analysis_result: {
      total_score: 80,
      mandatory_check: [
        { criteria: "Minimal 5 tahun pengalaman di React.js", passed: true, note: "6 tahun" },
        { criteria: "Menguasai TypeScript", passed: true, note: "Mahir TypeScript" },
        { criteria: "Pengalaman dengan Next.js App Router", passed: true, note: "Aktif menggunakan App Router" },
      ],
      skills_found: ["React.js", "TypeScript", "Next.js", "Vue.js", "Sass"],
      reasoning: "Pengalaman solid dengan kemampuan multi-framework.",
      summary: "Qualified dengan pengalaman yang beragam.",
    },
    total_score: 80,
    is_qualified: true,
    status: "Pending",
    created_at: "2026-04-01T08:30:00Z",
  },
  {
    id: "cand-012",
    job_id: "job-006",
    job_title: "Product Manager",
    full_name: "Dimas Prabowo",
    email: "dimas.p@email.com",
    phone: "+62 815-4444-3333",
    cv_url: "/sample-cv.pdf",
    raw_text: "Extracted text from CV...",
    analysis_result: {
      total_score: 76,
      mandatory_check: [
        { criteria: "Minimal 4 tahun pengalaman sebagai PM", passed: true, note: "5 tahun PM" },
        { criteria: "Kemampuan analisis data dan metrik produk", passed: true, note: "Familiar dengan analytics" },
        { criteria: "Pengalaman bekerja dengan tim engineering", passed: true, note: "Lead cross-functional team" },
      ],
      skills_found: ["Product Strategy", "Agile/Scrum", "Data Analytics", "Jira", "Mixpanel"],
      reasoning: "PM berpengalaman dengan kemampuan cross-functional yang baik.",
      summary: "Qualified, memenuhi semua syarat wajib.",
    },
    total_score: 76,
    is_qualified: true,
    status: "Pending",
    created_at: "2026-03-30T14:00:00Z",
  },
];

// ============================================
// Dashboard Stats
// ============================================
export const mockDashboardStats: DashboardStats = {
  total_applicants_today: 7,
  total_applicants_all: 139,
  qualified_percentage: 62,
  active_jobs: 5,
  pending_review: 14,
};

// ============================================
// Chart Data (Last 14 days)
// ============================================
export const mockChartData: ChartDataPoint[] = [
  { date: "21 Mar", applicants: 8, qualified: 5 },
  { date: "22 Mar", applicants: 12, qualified: 7 },
  { date: "23 Mar", applicants: 6, qualified: 3 },
  { date: "24 Mar", applicants: 15, qualified: 9 },
  { date: "25 Mar", applicants: 10, qualified: 6 },
  { date: "26 Mar", applicants: 9, qualified: 5 },
  { date: "27 Mar", applicants: 14, qualified: 8 },
  { date: "28 Mar", applicants: 11, qualified: 7 },
  { date: "29 Mar", applicants: 7, qualified: 4 },
  { date: "30 Mar", applicants: 13, qualified: 8 },
  { date: "31 Mar", applicants: 16, qualified: 10 },
  { date: "01 Apr", applicants: 9, qualified: 6 },
  { date: "02 Apr", applicants: 12, qualified: 7 },
  { date: "03 Apr", applicants: 7, qualified: 5 },
];

// ============================================
// Helper Functions
// ============================================
export function getJobById(id: string): Job | undefined {
  return mockJobs.find((j) => j.id === id);
}

export function getCandidateById(id: string): Candidate | undefined {
  return mockCandidates.find((c) => c.id === id);
}

export function getCandidatesByJobId(jobId: string): Candidate[] {
  return mockCandidates.filter((c) => c.job_id === jobId);
}

export function getRecentCandidates(limit: number = 5): Candidate[] {
  return [...mockCandidates]
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    .slice(0, limit);
}
