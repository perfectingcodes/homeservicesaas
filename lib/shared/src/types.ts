export type CheckStatus = "pass" | "warn" | "fail" | "stub" | "error";

export type CheckCategory =
  | "gbp"
  | "seo"
  | "performance"
  | "nap"
  | "tech"
  | "analytics";

export interface CheckResult {
  key: string;
  title: string;
  category: CheckCategory;
  status: CheckStatus;
  score: number;
  weight: number;
  finding: string;
  recommendation: string;
  evidence?: Record<string, unknown> | null;
  error?: string | null;
}
