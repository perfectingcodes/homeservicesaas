import type { CheckResult } from "@workspace/shared";
import type { AuditContext } from "./types";
import { CHECK_WEIGHTS } from "./types";
import { hasViewportMeta } from "../pageFetch";

export function httpsEnabledCheck(ctx: AuditContext): CheckResult {
  const key = "https_enabled";
  if (!ctx.site?.homepage) {
    return {
      key,
      title: "HTTPS enabled",
      category: "tech",
      status: "error",
      score: 0,
      weight: CHECK_WEIGHTS[key],
      finding: ctx.siteError ?? "Could not fetch the homepage.",
      recommendation: "Ensure the website URL is reachable.",
      evidence: null,
      error: ctx.siteError,
    };
  }
  const finalUrl = ctx.site.homepage.finalUrl;
  const isHttps = finalUrl.startsWith("https://");
  return {
    key,
    title: "HTTPS enabled",
    category: "tech",
    weight: CHECK_WEIGHTS[key],
    status: isHttps ? "pass" : "fail",
    score: isHttps ? 100 : 0,
    finding: isHttps
      ? `Site served over HTTPS (${finalUrl}).`
      : `Site is NOT served over HTTPS (${finalUrl}).`,
    recommendation: isHttps
      ? "TLS is set up. Re-check certificate expiry monthly."
      : "Install an SSL cert and force HTTPS redirects. Browsers and Google now flag HTTP sites as 'Not Secure'.",
    evidence: { finalUrl },
  };
}

export function viewportMetaCheck(ctx: AuditContext): CheckResult {
  const key = "viewport_meta";
  if (!ctx.site?.homepage.ok) {
    return {
      key,
      title: "Mobile viewport meta tag",
      category: "tech",
      status: "error",
      score: 0,
      weight: CHECK_WEIGHTS[key],
      finding: ctx.siteError ?? "Homepage could not be fetched.",
      recommendation: "Verify the homepage is reachable.",
      evidence: null,
      error: ctx.siteError,
    };
  }
  const present = hasViewportMeta(ctx.site.homepage.html);
  return {
    key,
    title: "Mobile viewport meta tag",
    category: "tech",
    weight: CHECK_WEIGHTS[key],
    status: present ? "pass" : "fail",
    score: present ? 100 : 0,
    finding: present
      ? "Homepage declares a viewport meta tag."
      : "No <meta name=\"viewport\"> on the homepage.",
    recommendation: present
      ? "Mobile rendering should work correctly."
      : "Add <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\"> to the <head>.",
    evidence: null,
  };
}
