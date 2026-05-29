import type { CheckResult } from "@workspace/shared";
import type { AuditContext } from "./types";
import { CHECK_WEIGHTS } from "./types";
import {
  extractTitle,
  extractMetaDescription,
  extractH1s,
  extractJsonLd,
} from "../pageFetch";

function siteUnavailable(
  key: keyof typeof CHECK_WEIGHTS,
  title: string,
  category: CheckResult["category"],
  err: string | null,
): CheckResult {
  return {
    key,
    title,
    category,
    status: "error",
    score: 0,
    weight: CHECK_WEIGHTS[key],
    finding: err ?? "Could not fetch the homepage.",
    recommendation: "Verify the website URL is reachable from the public internet.",
    evidence: null,
    error: err,
  };
}

export function titleTagCheck(ctx: AuditContext): CheckResult {
  const key = "title_tag";
  if (!ctx.site?.homepage.ok)
    return siteUnavailable(key, "Homepage title tag", "seo", ctx.siteError);
  const title = extractTitle(ctx.site.homepage.html);
  if (!title) {
    return {
      key,
      title: "Homepage title tag",
      category: "seo",
      status: "fail",
      score: 0,
      weight: CHECK_WEIGHTS[key],
      finding: "Homepage is missing a <title> tag.",
      recommendation:
        "Add a <title> 50–60 chars long that includes the primary service and city.",
      evidence: null,
    };
  }
  const len = title.length;
  let status: CheckResult["status"];
  let score: number;
  if (len >= 30 && len <= 60) {
    status = "pass";
    score = 100;
  } else if (len > 0) {
    status = "warn";
    score = 65;
  } else {
    status = "fail";
    score = 0;
  }
  return {
    key,
    title: "Homepage title tag",
    category: "seo",
    weight: CHECK_WEIGHTS[key],
    status,
    score,
    finding: `Title is ${len} chars: "${title}".`,
    recommendation:
      len >= 30 && len <= 60
        ? "Title length is in the sweet spot. Make sure it includes your top service + city."
        : "Aim for 30–60 chars. Include primary service (e.g. HVAC repair) + city.",
    evidence: { title, length: len },
  };
}

export function metaDescriptionCheck(ctx: AuditContext): CheckResult {
  const key = "meta_description";
  if (!ctx.site?.homepage.ok)
    return siteUnavailable(key, "Meta description", "seo", ctx.siteError);
  const desc = extractMetaDescription(ctx.site.homepage.html);
  if (!desc) {
    return {
      key,
      title: "Meta description",
      category: "seo",
      status: "fail",
      score: 0,
      weight: CHECK_WEIGHTS[key],
      finding: "No meta description on the homepage.",
      recommendation:
        "Write a 120–160 char description with services, area served, and a call-to-action.",
      evidence: null,
    };
  }
  const len = desc.length;
  let status: CheckResult["status"];
  let score: number;
  if (len >= 120 && len <= 170) {
    status = "pass";
    score = 100;
  } else {
    status = "warn";
    score = 65;
  }
  return {
    key,
    title: "Meta description",
    category: "seo",
    weight: CHECK_WEIGHTS[key],
    status,
    score,
    finding: `Meta description is ${len} chars.`,
    recommendation:
      len >= 120 && len <= 170
        ? "Length is good. Periodically refresh wording to test CTR."
        : "Aim for 120–160 chars; mention top service, service area, and a CTA.",
    evidence: { description: desc, length: len },
  };
}

export function h1PresentCheck(ctx: AuditContext): CheckResult {
  const key = "h1_present";
  if (!ctx.site?.homepage.ok)
    return siteUnavailable(key, "H1 heading", "seo", ctx.siteError);
  const h1s = extractH1s(ctx.site.homepage.html);
  let status: CheckResult["status"];
  let score: number;
  let finding: string;
  if (h1s.length === 1) {
    status = "pass";
    score = 100;
    finding = `One H1 on the page: "${h1s[0].slice(0, 80)}".`;
  } else if (h1s.length === 0) {
    status = "fail";
    score = 0;
    finding = "No H1 heading on the homepage.";
  } else {
    status = "warn";
    score = 60;
    finding = `${h1s.length} H1 headings — search engines prefer a single H1.`;
  }
  return {
    key,
    title: "H1 heading on homepage",
    category: "seo",
    weight: CHECK_WEIGHTS[key],
    status,
    score,
    finding,
    recommendation:
      h1s.length === 1
        ? "H1 looks good. Make sure it includes your primary service and city."
        : "Use exactly one H1 on the homepage, and include the primary service + city.",
    evidence: { h1s },
  };
}

export function jsonLdLocalBusinessCheck(ctx: AuditContext): CheckResult {
  const key = "json_ld_localbusiness";
  if (!ctx.site?.homepage.ok)
    return siteUnavailable(key, "LocalBusiness schema", "seo", ctx.siteError);
  const blocks = extractJsonLd(ctx.site.homepage.html);

  const hasLocalBusiness = blocks.some((b) => isLocalBusiness(b));
  return {
    key,
    title: "LocalBusiness structured data",
    category: "seo",
    weight: CHECK_WEIGHTS[key],
    status: hasLocalBusiness ? "pass" : "fail",
    score: hasLocalBusiness ? 100 : 0,
    finding: hasLocalBusiness
      ? "Homepage has LocalBusiness JSON-LD."
      : "No LocalBusiness JSON-LD detected on the homepage.",
    recommendation: hasLocalBusiness
      ? "Validate the schema in Google's Rich Results Test and keep NAP fields current."
      : "Add LocalBusiness JSON-LD with name, address, phone, opening hours, geo, and sameAs links to your social profiles.",
    evidence: { blocksFound: blocks.length },
  };
}

function isLocalBusiness(v: unknown): boolean {
  if (typeof v !== "object" || v === null) return false;
  const obj = v as Record<string, unknown>;
  const t = obj["@type"];
  if (typeof t === "string") {
    return /LocalBusiness|HVACBusiness|Plumber|Electrician|RoofingContractor|HomeAndConstructionBusiness|HousePainter|GeneralContractor|Locksmith|MovingCompany/i.test(
      t,
    );
  }
  if (Array.isArray(t)) {
    return t.some((x) => typeof x === "string" && /LocalBusiness/i.test(x));
  }
  return false;
}

export function robotsTxtCheck(ctx: AuditContext): CheckResult {
  const key = "robots_txt";
  if (!ctx.site)
    return siteUnavailable(key, "robots.txt present", "tech", ctx.siteError);
  const present = !!ctx.site.robotsTxt;
  return {
    key,
    title: "robots.txt present",
    category: "tech",
    weight: CHECK_WEIGHTS[key],
    status: present ? "pass" : "warn",
    score: present ? 100 : 50,
    finding: present
      ? "robots.txt is reachable."
      : "No robots.txt found at the site root.",
    recommendation: present
      ? "Confirm Disallow rules aren't blocking important pages."
      : "Add a minimal robots.txt with Sitemap: directive pointing at sitemap.xml.",
    evidence: null,
  };
}

export function sitemapXmlCheck(ctx: AuditContext): CheckResult {
  const key = "sitemap_xml";
  if (!ctx.site)
    return siteUnavailable(key, "sitemap.xml present", "tech", ctx.siteError);
  const present = !!ctx.site.sitemapXml;
  return {
    key,
    title: "sitemap.xml present",
    category: "tech",
    weight: CHECK_WEIGHTS[key],
    status: present ? "pass" : "fail",
    score: present ? 100 : 0,
    finding: present
      ? "sitemap.xml is reachable."
      : "No sitemap.xml found at the site root.",
    recommendation: present
      ? "Submit the sitemap in Google Search Console if you haven't already."
      : "Generate a sitemap.xml listing all canonical service/location pages and reference it in robots.txt.",
    evidence: null,
  };
}
