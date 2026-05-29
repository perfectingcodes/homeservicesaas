import type { CheckResult } from "@workspace/shared";
import type { AuditContext } from "./types";
import { CHECK_WEIGHTS } from "./types";
import { extractPhones, normalizePhone } from "../pageFetch";

export function napConsistencyCheck(ctx: AuditContext): CheckResult {
  const key = "nap_consistency";
  const weight = CHECK_WEIGHTS[key];

  const sitePhones: string[] = [];
  if (ctx.site?.homepage.ok) {
    sitePhones.push(...extractPhones(ctx.site.homepage.html));
  }
  for (const p of ctx.site?.servicePages ?? []) {
    if (p.ok) sitePhones.push(...extractPhones(p.html));
  }

  const sitePhoneSet = new Set(
    sitePhones.map((p) => normalizePhone(p)).filter((p): p is string => !!p),
  );

  const gbpPhone =
    normalizePhone(ctx.placeDetails?.nationalPhoneNumber) ??
    normalizePhone(ctx.placeDetails?.internationalPhoneNumber);

  const clientPhone = normalizePhone(ctx.client.phone);

  const allKnown: string[] = [];
  if (gbpPhone) allKnown.push(gbpPhone);
  if (clientPhone) allKnown.push(clientPhone);

  if (sitePhoneSet.size === 0) {
    return {
      key,
      title: "NAP (Name / Address / Phone) consistency",
      category: "nap",
      weight,
      status: "fail",
      score: 0,
      finding: "No phone number detected on the website pages we scanned.",
      recommendation:
        "Put your phone number in the site header and footer in plain text, matching the GBP exactly.",
      evidence: { sitePhones: [], gbpPhone, clientPhone },
    };
  }

  if (!gbpPhone && !clientPhone) {
    return {
      key,
      title: "NAP (Name / Address / Phone) consistency",
      category: "nap",
      weight,
      status: "warn",
      score: 60,
      finding:
        "We found a phone on the site but no GBP or stored phone to compare against.",
      recommendation:
        "Add the official phone number to the client profile, then re-run to verify it matches the website.",
      evidence: { sitePhones: [...sitePhoneSet] },
    };
  }

  const mismatch = allKnown.find((p) => !sitePhoneSet.has(p));
  const allMatch = !mismatch;

  return {
    key,
    title: "NAP (Name / Address / Phone) consistency",
    category: "nap",
    weight,
    status: allMatch ? "pass" : "fail",
    score: allMatch ? 100 : 25,
    finding: allMatch
      ? "Phone number on the website matches Google Business Profile."
      : `Mismatch: GBP/profile lists ${formatPhone(mismatch!)} but the website only shows ${[...sitePhoneSet].map(formatPhone).join(", ")}.`,
    recommendation: allMatch
      ? "Audit citations (Yelp, BBB, Bing Places) at least twice a year for the same NAP."
      : "Pick one official phone number and update it everywhere: site header/footer, GBP, citations.",
    evidence: {
      sitePhones: [...sitePhoneSet],
      gbpPhone,
      clientPhone,
    },
  };
}

function formatPhone(digits: string): string {
  if (digits.length !== 10) return digits;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}
