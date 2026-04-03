// ============================================
// HR Automation System — TypeScript Interfaces
// ============================================

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  company_name: string;
}

export interface Job {
  id: string;
  user_id: string;
  title: string;
  description: string;
  mandatory_criteria: string[];
  optional_criteria: string[];
  passing_grade: number;
  alias_email: string;
  public_link: string;
  status: "active" | "closed";
  created_at: string;
  candidate_count?: number;
  qualified_count?: number;
}

export interface AnalysisResult {
  total_score: number;
  mandatory_check: MandatoryCheckItem[];
  skills_found: string[];
  reasoning: string;
  summary: string;
}

export interface MandatoryCheckItem {
  criteria: string;
  passed: boolean;
  note: string;
}

export interface Candidate {
  id: string;
  job_id: string;
  job_title?: string;
  full_name: string;
  email: string;
  phone: string;
  cv_url: string;
  raw_text: string;
  analysis_result: AnalysisResult;
  total_score: number;
  is_qualified: boolean;
  status: CandidateStatus;
  created_at: string;
}

export type CandidateStatus =
  | "Pending"
  | "Ready to Interview"
  | "Rejected"
  | "Hired";

export interface DashboardStats {
  total_applicants_today: number;
  total_applicants_all: number;
  qualified_percentage: number;
  active_jobs: number;
  pending_review: number;
}

export interface ChartDataPoint {
  date: string;
  applicants: number;
  qualified: number;
}
