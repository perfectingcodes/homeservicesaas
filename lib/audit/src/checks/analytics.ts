import type { CheckResult } from "@workspace/shared";
import type { AuditContext } from "./types";
import { CHECK_WEIGHTS } from "./types";

export function ga4Check(ctx: AuditContext): CheckResult {
  const conn = ctx.ga4;
  const key = "ga4_connected";
  const weight = CHECK_WEIGHTS.ga4_connected;

  if (!conn?.connected) {
    return {
      key,
      title: "GA4 traffic & conversions",
      category: "analytics",
      status: "stub",
      score: 0,
      weight,
      finding:
        "GA4 isn't connected yet, so we can't verify real traffic or conversions.",
      recommendation:
        "Connect Google Analytics 4 from the Connections page to surface real visitor + conversion data in your audits.",
      evidence: { connect: "ga4" },
    };
  }

  if (conn.error || !conn.data) {
    return {
      key,
      title: "GA4 traffic & conversions",
      category: "analytics",
      status: "error",
      score: 0,
      weight,
      finding:
        conn.error ??
        "GA4 is connected but the data query failed. Re-connect from the Connections page.",
      recommendation:
        "Open Connections and reconnect Google Analytics 4. Check that the right property is selected.",
      evidence: null,
      error: conn.error,
    };
  }

  const { sessions, conversions, conversionRate } = conn.data;
  let status: CheckResult["status"];
  let score: number;
  if (sessions < 200) {
    status = "fail";
    score = 20;
  } else if (sessions < 1000 || conversionRate < 0.01) {
    status = "warn";
    score = 60;
  } else {
    status = "pass";
    score = 100;
  }

  const cr = (conversionRate * 100).toFixed(2);
  return {
    key,
    title: "GA4 traffic & conversions",
    category: "analytics",
    status,
    score,
    weight,
    finding: `Last 28 days: ${sessions.toLocaleString()} sessions, ${conversions.toLocaleString()} conversions (${cr}% conv. rate).`,
    recommendation:
      sessions < 200
        ? "Traffic is too low to draw conclusions. Focus on GBP optimization + local content first — paid search can fill the gap short-term."
        : conversionRate < 0.01
          ? "Conversion rate is below 1%. Audit the top landing pages for call-to-action clarity, mobile load speed, and trust signals (reviews, service area)."
          : "Healthy traffic + conversion baseline. Keep an eye on monthly trend and shift budget toward your top-converting service pages.",
    evidence: { ...conn.data },
  };
}

export function gscCheck(ctx: AuditContext): CheckResult {
  const conn = ctx.gsc;
  const key = "gsc_connected";
  const weight = CHECK_WEIGHTS.gsc_connected;

  if (!conn?.connected) {
    return {
      key,
      title: "Search visibility (Search Console)",
      category: "analytics",
      status: "stub",
      score: 0,
      weight,
      finding:
        "Search Console isn't connected, so we can't show real impressions, clicks, or coverage issues.",
      recommendation:
        "Connect Google Search Console from the Connections page to pull ranking + indexing data into future audits.",
      evidence: { connect: "gsc" },
    };
  }

  if (conn.error || !conn.data) {
    return {
      key,
      title: "Search visibility (Search Console)",
      category: "analytics",
      status: "error",
      score: 0,
      weight,
      finding:
        conn.error ??
        "Search Console is connected but the data query failed. Re-connect from the Connections page.",
      recommendation:
        "Open Connections and reconnect Search Console. Make sure the right verified site is selected.",
      evidence: null,
      error: conn.error,
    };
  }

  const { impressions, clicks, ctr, topQueries } = conn.data;
  let status: CheckResult["status"];
  let score: number;
  if (impressions < 1000) {
    status = "fail";
    score = 25;
  } else if (impressions < 10000 || ctr < 0.015) {
    status = "warn";
    score = 60;
  } else {
    status = "pass";
    score = 100;
  }

  const ctrPct = (ctr * 100).toFixed(2);
  return {
    key,
    title: "Search visibility (Search Console)",
    category: "analytics",
    status,
    score,
    weight,
    finding: `Last 28 days: ${impressions.toLocaleString()} impressions, ${clicks.toLocaleString()} clicks (${ctrPct}% CTR).${topQueries.length ? ` Top query: "${topQueries[0].query}".` : ""}`,
    recommendation:
      impressions < 1000
        ? "Almost no Google search visibility. Publish at least 3 city-targeted service pages and submit them in Search Console."
        : ctr < 0.015
          ? "Plenty of impressions but low click-through. Rewrite title tags + meta descriptions on your top-impression pages to include the city, primary service, and a benefit."
          : "Healthy search visibility. Focus next on converting clicks to calls (forms, click-to-call, trust signals).",
    evidence: { ...conn.data },
  };
}

// Keep the old export names as aliases for back-compat with the runner.
export const ga4Stub = ga4Check;
export const gscStub = gscCheck;
