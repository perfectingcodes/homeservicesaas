import type { CheckResult } from "@workspace/shared";
import type { AuditContext } from "./types";
import { CHECK_WEIGHTS } from "./types";

export function ga4Stub(_ctx: AuditContext): CheckResult {
  return {
    key: "ga4_connected",
    title: "Google Analytics 4 connected",
    category: "analytics",
    status: "stub",
    score: 0,
    weight: CHECK_WEIGHTS.ga4_connected,
    finding:
      "GA4 isn't connected yet, so we can't verify traffic, conversions, or top landing pages.",
    recommendation:
      "Connect GA4 to surface real visitor + conversion data in the audit.",
    evidence: { connect: "ga4" },
  };
}

export function gscStub(_ctx: AuditContext): CheckResult {
  return {
    key: "gsc_connected",
    title: "Google Search Console connected",
    category: "analytics",
    status: "stub",
    score: 0,
    weight: CHECK_WEIGHTS.gsc_connected,
    finding:
      "Search Console isn't connected, so we can't show real impressions, clicks, or coverage issues.",
    recommendation:
      "Connect Search Console to pull ranking + indexing data into future audits.",
    evidence: { connect: "gsc" },
  };
}
