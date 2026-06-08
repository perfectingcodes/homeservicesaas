// Minimal Google Analytics 4 Data API client.
// https://developers.google.com/analytics/devguides/reporting/data/v1

export interface Ga4Property {
  name: string; // "properties/123456789"
  displayName: string;
  websiteUrl?: string;
}

export async function listGa4Properties(accessToken: string): Promise<Ga4Property[]> {
  const accountsRes = await fetch(
    "https://analyticsadmin.googleapis.com/v1beta/accounts",
    { headers: { authorization: `Bearer ${accessToken}` } },
  );
  if (!accountsRes.ok) {
    throw new Error(
      `GA4 list accounts failed: ${accountsRes.status} ${await accountsRes.text()}`,
    );
  }
  const acctData = (await accountsRes.json()) as {
    accounts?: { name: string; displayName: string }[];
  };

  const all: Ga4Property[] = [];
  for (const acct of acctData.accounts ?? []) {
    const res = await fetch(
      `https://analyticsadmin.googleapis.com/v1beta/properties?filter=parent:${encodeURIComponent(acct.name)}`,
      { headers: { authorization: `Bearer ${accessToken}` } },
    );
    if (!res.ok) continue;
    const data = (await res.json()) as {
      properties?: {
        name: string;
        displayName: string;
        websiteUrl?: string;
      }[];
    };
    for (const p of data.properties ?? []) all.push(p);
  }
  return all;
}

export interface Ga4Last28Days {
  sessions: number;
  conversions: number;
  conversionRate: number; // 0..1
  totalUsers: number;
}

export async function ga4Last28Days(
  accessToken: string,
  propertyId: string,
): Promise<Ga4Last28Days> {
  // propertyId is the full "properties/12345" or just "12345"
  const numeric = propertyId.replace(/^properties\//, "");

  const res = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${numeric}:runReport`,
    {
      method: "POST",
      headers: {
        authorization: `Bearer ${accessToken}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        dateRanges: [{ startDate: "28daysAgo", endDate: "yesterday" }],
        metrics: [
          { name: "sessions" },
          { name: "conversions" },
          { name: "totalUsers" },
        ],
      }),
    },
  );
  if (!res.ok) {
    throw new Error(
      `GA4 runReport failed: ${res.status} ${await res.text()}`,
    );
  }
  const data = (await res.json()) as {
    rows?: { metricValues: { value: string }[] }[];
  };
  const row = data.rows?.[0]?.metricValues ?? [];
  const sessions = Number(row[0]?.value ?? 0);
  const conversions = Number(row[1]?.value ?? 0);
  const totalUsers = Number(row[2]?.value ?? 0);
  return {
    sessions,
    conversions,
    totalUsers,
    conversionRate: sessions > 0 ? conversions / sessions : 0,
  };
}
