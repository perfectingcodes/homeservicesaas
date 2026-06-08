// Idempotent demo data generator. Creates a fully-populated agency/user/
// business and three audits with realistic check results so the UI looks
// alive without a Google API key or live audit run.

import { and, eq } from "drizzle-orm";
import {
  db,
  agenciesTable,
  usersTable,
  clientsTable,
  auditsTable,
  auditChecksTable,
  type Audit,
  type Client,
  type User,
} from "@workspace/db";
import type { CheckCategory, CheckStatus } from "@workspace/shared";

export const DEMO_PROVIDER_ID = "email:demo@rankright.com";
const DEMO_EMAIL = "demo@rankright.com";
const DEMO_OWNER = "Mike Hernandez";
const DEMO_BIZ = "Mike's HVAC & Plumbing";

interface DemoCheck {
  key: string;
  title: string;
  category: CheckCategory;
  status: CheckStatus;
  score: number;
  weight: number;
  finding: string;
  recommendation: string;
}

const LATEST_CHECKS: DemoCheck[] = [
  {
    key: "pagespeed_mobile",
    title: "Mobile page speed",
    category: "performance",
    status: "warn",
    score: 60,
    weight: 10,
    finding:
      "Mobile performance score: 67/100 (LCP 3.4s). Hero image is the biggest culprit at 1.2MB.",
    recommendation:
      "Compress hero images, lazy-load below-the-fold media, and remove unused JS/CSS. Aim for LCP under 2.5s.",
  },
  {
    key: "gbp_claimed",
    title: "Google Business Profile found",
    category: "gbp",
    status: "pass",
    score: 100,
    weight: 8,
    finding: "Profile found and operational: Mike's HVAC & Plumbing.",
    recommendation:
      "Profile is live. Keep posting updates weekly to stay active in the local pack.",
  },
  {
    key: "gbp_rating",
    title: "GBP star rating",
    category: "gbp",
    status: "pass",
    score: 100,
    weight: 6,
    finding: "Average rating: 4.7 stars.",
    recommendation:
      "Reputation is strong — keep the review pipeline running. Pin the latest review on Q1 storm season.",
  },
  {
    key: "gbp_review_count",
    title: "GBP review volume",
    category: "gbp",
    status: "pass",
    score: 100,
    weight: 6,
    finding: "87 Google reviews.",
    recommendation:
      "Healthy review volume — keep collecting fresh reviews monthly. Target 100+ to outrank smaller competitors.",
  },
  {
    key: "gbp_photos",
    title: "GBP photos uploaded",
    category: "gbp",
    status: "warn",
    score: 60,
    weight: 4,
    finding: "6 photos on the profile.",
    recommendation:
      "Upload at least 10 photos — exterior, team, recent jobs, trucks, equipment. Profiles with photos get 42% more direction requests.",
  },
  {
    key: "gbp_hours",
    title: "GBP hours of operation",
    category: "gbp",
    status: "pass",
    score: 100,
    weight: 4,
    finding: "Hours are published on the profile.",
    recommendation: "Confirm hours are correct around holidays.",
  },
  {
    key: "gbp_website_link",
    title: "GBP links to website",
    category: "gbp",
    status: "pass",
    score: 100,
    weight: 5,
    finding: "Profile links to https://www.mikeshvacaustin.com.",
    recommendation:
      "Make sure this URL is the canonical homepage (https, no trailing slash mismatch).",
  },
  {
    key: "gbp_primary_category",
    title: "GBP primary category set",
    category: "gbp",
    status: "pass",
    score: 100,
    weight: 4,
    finding: "Primary category: hvac contractor.",
    recommendation:
      "Confirm the primary category matches your top-revenue service.",
  },
  {
    key: "title_tag",
    title: "Homepage title tag",
    category: "seo",
    status: "warn",
    score: 65,
    weight: 5,
    finding: 'Title is 22 chars: "Mike\'s HVAC & Plumbing".',
    recommendation:
      "Aim for 30–60 chars. Include primary service + city, e.g. \"HVAC Repair & Plumbing in Austin, TX | Mike's\".",
  },
  {
    key: "meta_description",
    title: "Meta description",
    category: "seo",
    status: "fail",
    score: 0,
    weight: 4,
    finding: "No meta description on the homepage.",
    recommendation:
      "Write a 120–160 char description with services, area served, and a call-to-action. Example: \"24/7 HVAC repair and plumbing across Austin, TX. Same-day appointments, 4.7★ on Google. Call now.\"",
  },
  {
    key: "h1_present",
    title: "H1 heading on homepage",
    category: "seo",
    status: "pass",
    score: 100,
    weight: 4,
    finding: 'One H1 on the page: "Austin\'s most trusted HVAC & plumbing".',
    recommendation:
      "H1 looks good. Make sure it includes your primary service and city.",
  },
  {
    key: "json_ld_localbusiness",
    title: "LocalBusiness structured data",
    category: "seo",
    status: "fail",
    score: 0,
    weight: 8,
    finding: "No LocalBusiness JSON-LD detected on the homepage.",
    recommendation:
      "Add LocalBusiness JSON-LD with name, address, phone, opening hours, geo, and sameAs links to your social profiles. This is one of the highest-leverage missing items.",
  },
  {
    key: "https_enabled",
    title: "HTTPS enabled",
    category: "tech",
    status: "pass",
    score: 100,
    weight: 5,
    finding: "Site served over HTTPS (https://www.mikeshvacaustin.com).",
    recommendation:
      "TLS is set up. Re-check certificate expiry monthly.",
  },
  {
    key: "viewport_meta",
    title: "Mobile viewport meta tag",
    category: "tech",
    status: "pass",
    score: 100,
    weight: 3,
    finding: "Homepage declares a viewport meta tag.",
    recommendation: "Mobile rendering should work correctly.",
  },
  {
    key: "robots_txt",
    title: "robots.txt present",
    category: "tech",
    status: "pass",
    score: 100,
    weight: 2,
    finding: "robots.txt is reachable.",
    recommendation:
      "Confirm Disallow rules aren't blocking important pages.",
  },
  {
    key: "sitemap_xml",
    title: "sitemap.xml present",
    category: "tech",
    status: "warn",
    score: 50,
    weight: 3,
    finding: "sitemap.xml is reachable but lists only 4 URLs.",
    recommendation:
      "Add city/service-combo landing pages (e.g. /ac-repair-austin) to the sitemap and resubmit in Search Console.",
  },
  {
    key: "nap_consistency",
    title: "NAP (Name / Address / Phone) consistency",
    category: "nap",
    status: "fail",
    score: 25,
    weight: 10,
    finding:
      "Mismatch: GBP lists (512) 555-9120 but the website footer shows (512) 555-9128.",
    recommendation:
      "Pick one official phone number and update it everywhere: site header/footer, GBP, Yelp, BBB, Bing Places.",
  },
  {
    key: "ga4_connected",
    title: "GA4 traffic & conversions",
    category: "analytics",
    status: "stub",
    score: 0,
    weight: 3,
    finding:
      "GA4 isn't connected yet, so we can't verify real traffic or conversions.",
    recommendation:
      "Connect Google Analytics 4 from the Connections page to surface real visitor + conversion data in your audits.",
  },
  {
    key: "gsc_connected",
    title: "Search visibility (Search Console)",
    category: "analytics",
    status: "stub",
    score: 0,
    weight: 3,
    finding:
      "Search Console isn't connected, so we can't show real impressions, clicks, or coverage issues.",
    recommendation:
      "Connect Google Search Console from the Connections page to pull ranking + indexing data into future audits.",
  },
];

export interface DemoBootstrap {
  user: User;
  business: Client;
  audits: Audit[];
}

export async function bootstrapDemo(): Promise<DemoBootstrap> {
  // Agency
  let agency = (
    await db
      .select()
      .from(agenciesTable)
      .where(eq(agenciesTable.name, DEMO_BIZ))
  )[0];
  if (!agency) {
    [agency] = await db
      .insert(agenciesTable)
      .values({ name: DEMO_BIZ })
      .returning();
  }

  // User
  let user = (
    await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.providerId, DEMO_PROVIDER_ID))
  )[0];
  if (!user) {
    [user] = await db
      .insert(usersTable)
      .values({
        agencyId: agency.id,
        providerId: DEMO_PROVIDER_ID,
        email: DEMO_EMAIL,
        name: DEMO_OWNER,
      })
      .returning();
  }

  // Business
  let business = (
    await db
      .select()
      .from(clientsTable)
      .where(eq(clientsTable.agencyId, agency.id))
      .limit(1)
  )[0];
  if (!business) {
    [business] = await db
      .insert(clientsTable)
      .values({
        agencyId: agency.id,
        name: DEMO_BIZ,
        websiteUrl: "https://www.mikeshvacaustin.com",
        city: "Austin, TX",
        phone: "(512) 555-9120",
      })
      .returning();
  }

  // Audits — only seed if there are none yet so user-run audits don't get
  // overwritten on subsequent demo logins.
  const existingAudits = await db
    .select()
    .from(auditsTable)
    .where(eq(auditsTable.clientId, business.id));

  if (existingAudits.length > 0) {
    return { user, business, audits: existingAudits };
  }

  const now = new Date();
  const day = 24 * 60 * 60 * 1000;
  const seeds: { score: number; daysAgo: number; full: boolean }[] = [
    { score: 62, daysAgo: 28, full: false },
    { score: 71, daysAgo: 14, full: false },
    { score: 76, daysAgo: 1, full: true },
  ];

  const created: Audit[] = [];
  for (const s of seeds) {
    const started = new Date(now.getTime() - s.daysAgo * day);
    const completed = new Date(started.getTime() + 38 * 1000);

    const [audit] = await db
      .insert(auditsTable)
      .values({
        clientId: business.id,
        status: "complete",
        score: s.score,
        startedAt: started,
        completedAt: completed,
        summary: {
          counts: {
            pass: s.full ? 12 : 10,
            warn: s.full ? 4 : 5,
            fail: s.full ? 3 : 4,
            stub: 2,
            error: 0,
          },
          totalChecks: 19,
          demo: true,
        },
      })
      .returning();
    created.push(audit);

    if (s.full) {
      await db.insert(auditChecksTable).values(
        LATEST_CHECKS.map((c) => ({
          auditId: audit.id,
          checkKey: c.key,
          title: c.title,
          category: c.category,
          status: c.status,
          score: c.score,
          weight: c.weight,
          finding: c.finding,
          recommendation: c.recommendation,
          evidence: { demo: true },
        })),
      );
    }
  }

  return { user, business, audits: created };
}
