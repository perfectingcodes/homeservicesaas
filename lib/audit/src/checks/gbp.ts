import type { CheckResult } from "@workspace/shared";
import type { AuditContext } from "./types";
import { CHECK_WEIGHTS } from "./types";

function gbpUnavailable(
  key: keyof typeof CHECK_WEIGHTS,
  title: string,
  err: string | null,
): CheckResult {
  return {
    key,
    title,
    category: "gbp",
    status: "error",
    score: 0,
    weight: CHECK_WEIGHTS[key],
    finding:
      err ?? "Could not locate the business profile on Google Maps.",
    recommendation:
      "Confirm the business name + city are correct, or claim a Google Business Profile if one doesn't exist.",
    evidence: null,
    error: err,
  };
}

export function gbpClaimedCheck(ctx: AuditContext): CheckResult {
  const key = "gbp_claimed";
  if (!ctx.placeDetails) {
    return gbpUnavailable(key, "Google Business Profile found", ctx.placeError);
  }
  const operational = ctx.placeDetails.businessStatus === "OPERATIONAL";
  return {
    key,
    title: "Google Business Profile found",
    category: "gbp",
    status: operational ? "pass" : "warn",
    score: operational ? 100 : 50,
    weight: CHECK_WEIGHTS[key],
    finding: operational
      ? `Profile found and operational: ${ctx.placeDetails.displayName}.`
      : `Profile found but status is ${ctx.placeDetails.businessStatus ?? "unknown"}.`,
    recommendation: operational
      ? "Profile is live. Keep posting updates weekly to stay active."
      : "Investigate why the profile is not marked OPERATIONAL.",
    evidence: {
      displayName: ctx.placeDetails.displayName,
      placeId: ctx.placeDetails.id,
      status: ctx.placeDetails.businessStatus,
    },
  };
}

export function gbpRatingCheck(ctx: AuditContext): CheckResult {
  const key = "gbp_rating";
  if (!ctx.placeDetails) return gbpUnavailable(key, "GBP star rating", ctx.placeError);
  const rating = ctx.placeDetails.rating ?? 0;
  let status: CheckResult["status"];
  let score: number;
  if (rating >= 4.5) {
    status = "pass";
    score = 100;
  } else if (rating >= 4.0) {
    status = "warn";
    score = 65;
  } else {
    status = "fail";
    score = 25;
  }
  return {
    key,
    title: "GBP star rating",
    category: "gbp",
    weight: CHECK_WEIGHTS[key],
    status,
    score,
    finding: rating
      ? `Average rating: ${rating.toFixed(1)} stars.`
      : "No rating yet on Google.",
    recommendation:
      rating >= 4.5
        ? "Reputation is strong — keep the review pipeline running."
        : "Ask recent satisfied customers for a Google review. Aim for 4.5+ average.",
    evidence: { rating },
  };
}

export function gbpReviewCountCheck(ctx: AuditContext): CheckResult {
  const key = "gbp_review_count";
  if (!ctx.placeDetails)
    return gbpUnavailable(key, "GBP review count", ctx.placeError);
  const count = ctx.placeDetails.userRatingCount ?? 0;
  let status: CheckResult["status"];
  let score: number;
  if (count >= 50) {
    status = "pass";
    score = 100;
  } else if (count >= 15) {
    status = "warn";
    score = 60;
  } else {
    status = "fail";
    score = 20;
  }
  return {
    key,
    title: "GBP review volume",
    category: "gbp",
    weight: CHECK_WEIGHTS[key],
    status,
    score,
    finding: `${count} Google reviews.`,
    recommendation:
      count >= 50
        ? "Healthy review volume — keep collecting fresh reviews monthly."
        : "Set up a review-request flow after every job. Target 50+ reviews to outrank smaller competitors.",
    evidence: { count },
  };
}

export function gbpPhotosCheck(ctx: AuditContext): CheckResult {
  const key = "gbp_photos";
  if (!ctx.placeDetails) return gbpUnavailable(key, "GBP photos", ctx.placeError);
  const count = ctx.placeDetails.photos?.length ?? 0;
  let status: CheckResult["status"];
  let score: number;
  if (count >= 10) {
    status = "pass";
    score = 100;
  } else if (count >= 3) {
    status = "warn";
    score = 60;
  } else {
    status = "fail";
    score = 20;
  }
  return {
    key,
    title: "GBP photos uploaded",
    category: "gbp",
    weight: CHECK_WEIGHTS[key],
    status,
    score,
    finding: `${count} photos on the profile.`,
    recommendation:
      count >= 10
        ? "Photo library looks healthy. Add a few fresh job photos each month."
        : "Upload at least 10 photos — exterior, team, recent jobs, equipment. Profiles with photos get 42% more requests for directions (Google).",
    evidence: { count },
  };
}

export function gbpHoursCheck(ctx: AuditContext): CheckResult {
  const key = "gbp_hours";
  if (!ctx.placeDetails) return gbpUnavailable(key, "GBP hours", ctx.placeError);
  const regular = ctx.placeDetails.regularOpeningHours;
  const current = ctx.placeDetails.currentOpeningHours;
  const hasHours =
    !!regular?.periods?.length ||
    !!regular?.weekdayDescriptions?.length ||
    !!current?.weekdayDescriptions?.length;
  const hours = regular ?? current;
  return {
    key,
    title: "GBP hours of operation",
    category: "gbp",
    weight: CHECK_WEIGHTS[key],
    status: hasHours ? "pass" : "fail",
    score: hasHours ? 100 : 0,
    finding: hasHours
      ? "Hours are published on the profile."
      : "No hours of operation set on the Google Business Profile.",
    recommendation: hasHours
      ? "Confirm hours are correct around holidays."
      : "Add open hours — incomplete profiles are penalized in the local pack.",
    evidence: hours
      ? { weekdayDescriptions: hours.weekdayDescriptions }
      : null,
  };
}

export function gbpWebsiteLinkCheck(ctx: AuditContext): CheckResult {
  const key = "gbp_website_link";
  if (!ctx.placeDetails)
    return gbpUnavailable(key, "GBP website link", ctx.placeError);
  const link = ctx.placeDetails.websiteUri ?? null;
  return {
    key,
    title: "GBP links to website",
    category: "gbp",
    weight: CHECK_WEIGHTS[key],
    status: link ? "pass" : "fail",
    score: link ? 100 : 0,
    finding: link
      ? `Profile links to ${link}.`
      : "No website is set on the GBP profile.",
    recommendation: link
      ? "Make sure this URL is the canonical homepage (https, no trailing slash mismatch)."
      : "Add the website URL to the profile — it's one of the highest-leverage local SEO fields.",
    evidence: { websiteUri: link },
  };
}

export function gbpPrimaryCategoryCheck(ctx: AuditContext): CheckResult {
  const key = "gbp_primary_category";
  if (!ctx.placeDetails)
    return gbpUnavailable(key, "GBP primary category", ctx.placeError);
  const primary = ctx.placeDetails.primaryType ?? null;
  return {
    key,
    title: "GBP primary category set",
    category: "gbp",
    weight: CHECK_WEIGHTS[key],
    status: primary ? "pass" : "fail",
    score: primary ? 100 : 0,
    finding: primary
      ? `Primary category: ${primary.replace(/_/g, " ")}.`
      : "No primary category set.",
    recommendation: primary
      ? "Confirm the primary category matches your top-revenue service."
      : "Set a primary category — this is the single biggest local ranking signal.",
    evidence: { primary, types: ctx.placeDetails.types },
  };
}
