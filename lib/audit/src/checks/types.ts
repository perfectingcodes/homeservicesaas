import type { CheckResult } from "@workspace/shared";
import type { PlaceDetails } from "../placesClient";
import type { SiteSnapshot } from "../pageFetch";
import type { PageSpeedMobileResult } from "../pagespeedClient";

export interface ClientInput {
  name: string;
  websiteUrl: string | null;
  city: string | null;
  phone: string | null;
}

export interface AuditContext {
  client: ClientInput;
  placeDetails: PlaceDetails | null;
  placeError: string | null;
  site: SiteSnapshot | null;
  siteError: string | null;
  pagespeed: PageSpeedMobileResult | null;
  pagespeedError: string | null;
}

export type CheckFn = (ctx: AuditContext) => CheckResult;

export const CHECK_WEIGHTS: Record<string, number> = {
  pagespeed_mobile: 10,
  https_enabled: 5,
  viewport_meta: 3,
  title_tag: 5,
  meta_description: 4,
  h1_present: 4,
  json_ld_localbusiness: 8,
  gbp_claimed: 8,
  gbp_rating: 6,
  gbp_review_count: 6,
  gbp_photos: 4,
  gbp_hours: 4,
  gbp_website_link: 5,
  gbp_primary_category: 4,
  robots_txt: 2,
  sitemap_xml: 3,
  nap_consistency: 10,
  ga4_connected: 3,
  gsc_connected: 3,
};
