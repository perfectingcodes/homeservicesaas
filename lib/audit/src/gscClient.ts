// Minimal Google Search Console client.
// https://developers.google.com/webmaster-tools/v1/searchanalytics/query

export interface GscSite {
  siteUrl: string;
  permissionLevel: string;
}

export async function listGscSites(accessToken: string): Promise<GscSite[]> {
  const res = await fetch(
    "https://www.googleapis.com/webmasters/v3/sites",
    { headers: { authorization: `Bearer ${accessToken}` } },
  );
  if (!res.ok) {
    throw new Error(
      `GSC list sites failed: ${res.status} ${await res.text()}`,
    );
  }
  const data = (await res.json()) as {
    siteEntry?: GscSite[];
  };
  return data.siteEntry ?? [];
}

export interface GscLast28Days {
  impressions: number;
  clicks: number;
  ctr: number; // 0..1
  position: number; // avg position
  topQueries: { query: string; clicks: number; impressions: number }[];
}

export async function gscLast28Days(
  accessToken: string,
  siteUrl: string,
): Promise<GscLast28Days> {
  const end = new Date();
  const start = new Date(end);
  start.setDate(start.getDate() - 28);

  const toDate = (d: Date): string => d.toISOString().slice(0, 10);

  const totalsP = fetch(
    `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`,
    {
      method: "POST",
      headers: {
        authorization: `Bearer ${accessToken}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        startDate: toDate(start),
        endDate: toDate(end),
        dimensions: [],
        rowLimit: 1,
      }),
    },
  );

  const queriesP = fetch(
    `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`,
    {
      method: "POST",
      headers: {
        authorization: `Bearer ${accessToken}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        startDate: toDate(start),
        endDate: toDate(end),
        dimensions: ["query"],
        rowLimit: 10,
      }),
    },
  );

  const [totalsRes, queriesRes] = await Promise.all([totalsP, queriesP]);
  if (!totalsRes.ok) {
    throw new Error(
      `GSC totals query failed: ${totalsRes.status} ${await totalsRes.text()}`,
    );
  }
  const totals = (await totalsRes.json()) as {
    rows?: { clicks: number; impressions: number; ctr: number; position: number }[];
  };
  const t = totals.rows?.[0] ?? {
    clicks: 0,
    impressions: 0,
    ctr: 0,
    position: 0,
  };

  let topQueries: GscLast28Days["topQueries"] = [];
  if (queriesRes.ok) {
    const q = (await queriesRes.json()) as {
      rows?: { keys: string[]; clicks: number; impressions: number }[];
    };
    topQueries = (q.rows ?? []).map((r) => ({
      query: r.keys[0] ?? "",
      clicks: r.clicks,
      impressions: r.impressions,
    }));
  }

  return {
    impressions: t.impressions,
    clicks: t.clicks,
    ctr: t.ctr,
    position: t.position,
    topQueries,
  };
}
