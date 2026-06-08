import { and, eq } from "drizzle-orm";
import {
  db,
  clientsTable,
  auditsTable,
  auditChecksTable,
  clientConnectionsTable,
  type Audit,
  type Client,
} from "@workspace/db";
import type { CheckResult } from "@workspace/shared";
import { decrypt } from "@workspace/shared";
import { snapshotSite } from "./pageFetch";
import { resolvePlace, getPlaceDetails } from "./placesClient";
import { runPageSpeedMobile } from "./pagespeedClient";
import { refreshAccessToken } from "./oauthGoogle";
import { ga4Last28Days } from "./ga4Client";
import { gscLast28Days } from "./gscClient";
import {
  type AuditContext,
  type CheckFn,
  pagespeedMobileCheck,
  gbpClaimedCheck,
  gbpRatingCheck,
  gbpReviewCountCheck,
  gbpPhotosCheck,
  gbpHoursCheck,
  gbpWebsiteLinkCheck,
  gbpPrimaryCategoryCheck,
  titleTagCheck,
  metaDescriptionCheck,
  h1PresentCheck,
  jsonLdLocalBusinessCheck,
  robotsTxtCheck,
  sitemapXmlCheck,
  httpsEnabledCheck,
  viewportMetaCheck,
  napConsistencyCheck,
  ga4Stub,
  gscStub,
} from "./checks";

const CHECKS: CheckFn[] = [
  pagespeedMobileCheck,
  gbpClaimedCheck,
  gbpRatingCheck,
  gbpReviewCountCheck,
  gbpPhotosCheck,
  gbpHoursCheck,
  gbpWebsiteLinkCheck,
  gbpPrimaryCategoryCheck,
  titleTagCheck,
  metaDescriptionCheck,
  h1PresentCheck,
  jsonLdLocalBusinessCheck,
  httpsEnabledCheck,
  viewportMetaCheck,
  robotsTxtCheck,
  sitemapXmlCheck,
  ga4Stub,
  gscStub,
  napConsistencyCheck,
];

function timeout<T>(p: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const id = setTimeout(
      () => reject(new Error(`${label} timed out after ${ms}ms`)),
      ms,
    );
    p.then(
      (v) => {
        clearTimeout(id);
        resolve(v);
      },
      (e) => {
        clearTimeout(id);
        reject(e);
      },
    );
  });
}

export async function gatherContext(client: Client): Promise<AuditContext> {
  const clientInput = {
    name: client.name,
    websiteUrl: client.websiteUrl,
    city: client.city,
    phone: client.phone,
  };

  const placeP = (async () => {
    try {
      let placeId = client.placeId;
      if (!placeId) {
        const resolved = await timeout(
          resolvePlace(client.name, client.city),
          15_000,
          "resolvePlace",
        );
        if (resolved) placeId = resolved.placeId;
      }
      if (!placeId) return { details: null, error: "Place not found" };
      const details = await timeout(
        getPlaceDetails(placeId),
        15_000,
        "getPlaceDetails",
      );
      return { details, error: null as string | null };
    } catch (e) {
      return {
        details: null,
        error: e instanceof Error ? e.message : String(e),
      };
    }
  })();

  const siteP = (async () => {
    if (!client.websiteUrl) return { site: null, error: "No website URL set" };
    try {
      const snap = await timeout(
        snapshotSite(client.websiteUrl),
        30_000,
        "snapshotSite",
      );
      return { site: snap, error: null as string | null };
    } catch (e) {
      return { site: null, error: e instanceof Error ? e.message : String(e) };
    }
  })();

  const psP = (async () => {
    if (!client.websiteUrl) return { psi: null, error: "No website URL set" };
    try {
      const psi = await timeout(
        runPageSpeedMobile(client.websiteUrl),
        90_000,
        "runPageSpeedMobile",
      );
      return { psi, error: null as string | null };
    } catch (e) {
      return { psi: null, error: e instanceof Error ? e.message : String(e) };
    }
  })();

  const ga4P = loadGa4(client.id);
  const gscP = loadGsc(client.id);

  const [place, site, ps, ga4, gsc] = await Promise.all([
    placeP,
    siteP,
    psP,
    ga4P,
    gscP,
  ]);

  return {
    client: clientInput,
    placeDetails: place.details,
    placeError: place.error,
    site: site.site,
    siteError: site.error,
    pagespeed: ps.psi,
    pagespeedError: ps.error,
    ga4,
    gsc,
  };
}

async function getAccessTokenForProvider(
  clientId: string,
  provider: "ga4" | "gsc" | "gbp",
): Promise<{ accessToken: string; externalAccountId: string | null } | null> {
  const conn = (
    await db
      .select()
      .from(clientConnectionsTable)
      .where(
        and(
          eq(clientConnectionsTable.clientId, clientId),
          eq(clientConnectionsTable.provider, provider),
        ),
      )
  )[0];
  if (!conn || !conn.accessTokenEnc) return null;

  const now = Date.now();
  const expired = conn.expiresAt ? conn.expiresAt.getTime() <= now : false;

  if (!expired) {
    return {
      accessToken: decrypt(conn.accessTokenEnc),
      externalAccountId: conn.externalAccountId,
    };
  }

  if (!conn.refreshTokenEnc) return null;
  const refreshed = await refreshAccessToken(decrypt(conn.refreshTokenEnc));
  await db
    .update(clientConnectionsTable)
    .set({
      accessTokenEnc: (await import("@workspace/shared")).encrypt(
        refreshed.accessToken,
      ),
      expiresAt: refreshed.expiresAt,
      updatedAt: new Date(),
    })
    .where(eq(clientConnectionsTable.id, conn.id));
  return {
    accessToken: refreshed.accessToken,
    externalAccountId: conn.externalAccountId,
  };
}

async function loadGa4(clientId: string) {
  try {
    const tok = await getAccessTokenForProvider(clientId, "ga4");
    if (!tok || !tok.externalAccountId) {
      return { connected: !!tok, data: null, error: tok ? "No GA4 property selected" : null };
    }
    const data = await timeout(
      ga4Last28Days(tok.accessToken, tok.externalAccountId),
      15_000,
      "ga4Last28Days",
    );
    return { connected: true, data, error: null };
  } catch (e) {
    return {
      connected: true,
      data: null,
      error: e instanceof Error ? e.message : String(e),
    };
  }
}

async function loadGsc(clientId: string) {
  try {
    const tok = await getAccessTokenForProvider(clientId, "gsc");
    if (!tok || !tok.externalAccountId) {
      return { connected: !!tok, data: null, error: tok ? "No verified site selected" : null };
    }
    const data = await timeout(
      gscLast28Days(tok.accessToken, tok.externalAccountId),
      15_000,
      "gscLast28Days",
    );
    return { connected: true, data, error: null };
  } catch (e) {
    return {
      connected: true,
      data: null,
      error: e instanceof Error ? e.message : String(e),
    };
  }
}

export function scoreAudit(results: CheckResult[]): number {
  let weighted = 0;
  let totalWeight = 0;
  for (const r of results) {
    if (r.status === "stub") continue;
    totalWeight += r.weight;
    weighted += (r.score * r.weight) / 100;
  }
  if (totalWeight === 0) return 0;
  return Math.round((weighted / totalWeight) * 100);
}

export interface RunAuditResult {
  audit: Audit;
  checks: CheckResult[];
}

export async function runAudit(clientId: string): Promise<RunAuditResult> {
  const client = (
    await db.select().from(clientsTable).where(eq(clientsTable.id, clientId))
  )[0];
  if (!client) throw new Error(`client ${clientId} not found`);

  const [audit] = await db
    .insert(auditsTable)
    .values({ clientId, status: "running" })
    .returning();

  try {
    const ctx = await gatherContext(client);

    const results: CheckResult[] = CHECKS.map((fn) => {
      try {
        return fn(ctx);
      } catch (e) {
        return {
          key: fn.name || "unknown_check",
          title: fn.name || "Check failed",
          category: "tech" as const,
          status: "error" as const,
          score: 0,
          weight: 0,
          finding: e instanceof Error ? e.message : String(e),
          recommendation: "This check errored — please report this audit ID.",
          evidence: null,
          error: e instanceof Error ? e.message : String(e),
        };
      }
    });

    if (results.length) {
      await db.insert(auditChecksTable).values(
        results.map((r) => ({
          auditId: audit.id,
          checkKey: r.key,
          title: r.title,
          category: r.category,
          status: r.status,
          score: r.score,
          weight: r.weight,
          finding: r.finding,
          recommendation: r.recommendation,
          evidence: r.evidence ?? null,
          error: r.error ?? null,
        })),
      );
    }

    const score = scoreAudit(results);
    const counts = countByStatus(results);

    const [updated] = await db
      .update(auditsTable)
      .set({
        status: "complete",
        score,
        summary: { counts, totalChecks: results.length },
        completedAt: new Date(),
      })
      .where(eq(auditsTable.id, audit.id))
      .returning();

    if (client.placeId == null && ctx.placeDetails?.id) {
      await db
        .update(clientsTable)
        .set({ placeId: ctx.placeDetails.id })
        .where(eq(clientsTable.id, client.id));
    }

    return { audit: updated, checks: results };
  } catch (e) {
    const err = e instanceof Error ? e.message : String(e);
    const [failed] = await db
      .update(auditsTable)
      .set({ status: "failed", error: err, completedAt: new Date() })
      .where(eq(auditsTable.id, audit.id))
      .returning();
    return { audit: failed, checks: [] };
  }
}

function countByStatus(results: CheckResult[]): Record<string, number> {
  const counts: Record<string, number> = {
    pass: 0,
    warn: 0,
    fail: 0,
    stub: 0,
    error: 0,
  };
  for (const r of results) counts[r.status] = (counts[r.status] ?? 0) + 1;
  return counts;
}
