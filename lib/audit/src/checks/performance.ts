import type { CheckResult } from "@workspace/shared";
import type { AuditContext } from "./types";
import { CHECK_WEIGHTS } from "./types";

export function pagespeedMobileCheck(ctx: AuditContext): CheckResult {
  const weight = CHECK_WEIGHTS.pagespeed_mobile;
  const base = {
    key: "pagespeed_mobile",
    title: "Mobile page speed",
    category: "performance" as const,
    weight,
  };

  if (ctx.pagespeedError || !ctx.pagespeed) {
    return {
      ...base,
      status: "error",
      score: 0,
      finding:
        ctx.pagespeedError ?? "PageSpeed Insights did not return a result.",
      recommendation:
        "Verify the homepage URL is publicly reachable, then re-run the audit.",
      evidence: null,
      error: ctx.pagespeedError ?? null,
    };
  }

  const perf = ctx.pagespeed.performanceScore;
  const lcp = ctx.pagespeed.lcpMs;
  if (perf == null) {
    return {
      ...base,
      status: "warn",
      score: 50,
      finding: "PageSpeed returned no performance score.",
      recommendation: "Re-run the audit; PSI sometimes returns partial data.",
      evidence: { ...ctx.pagespeed },
    };
  }

  let status: CheckResult["status"];
  let score: number;
  if (perf >= 80) {
    status = "pass";
    score = 100;
  } else if (perf >= 50) {
    status = "warn";
    score = 60;
  } else {
    status = "fail";
    score = 20;
  }

  const lcpStr = lcp == null ? "n/a" : `${(lcp / 1000).toFixed(1)}s`;
  return {
    ...base,
    status,
    score,
    finding: `Mobile performance score: ${perf}/100 (LCP ${lcpStr}).`,
    recommendation:
      perf >= 80
        ? "Performance is solid — keep an eye on LCP after content/image updates."
        : "Compress hero images, lazy-load below-the-fold media, and remove unused JS/CSS. Aim for LCP under 2.5s.",
    evidence: { ...ctx.pagespeed },
  };
}
