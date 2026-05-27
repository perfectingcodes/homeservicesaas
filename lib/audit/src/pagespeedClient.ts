const PSI_URL =
  "https://www.googleapis.com/pagespeedonline/v5/runPagespeed";

export interface PageSpeedMobileResult {
  performanceScore: number | null;
  lcpMs: number | null;
  clsScore: number | null;
  fcpMs: number | null;
  tbtMs: number | null;
  finalUrl: string | null;
}

function getApiKey(): string | undefined {
  return process.env.PAGESPEED_API_KEY ?? process.env.GOOGLE_API_KEY;
}

export async function runPageSpeedMobile(
  url: string,
): Promise<PageSpeedMobileResult> {
  const params = new URLSearchParams({
    url,
    strategy: "mobile",
    category: "performance",
  });
  const key = getApiKey();
  if (key) params.set("key", key);

  const res = await fetch(`${PSI_URL}?${params.toString()}`, {
    method: "GET",
  });

  if (!res.ok) {
    throw new Error(`PageSpeed failed: ${res.status} ${await res.text()}`);
  }

  const data = (await res.json()) as {
    lighthouseResult?: {
      categories?: {
        performance?: { score?: number | null };
      };
      audits?: Record<
        string,
        { numericValue?: number; displayValue?: string } | undefined
      >;
      finalUrl?: string;
    };
  };

  const lh = data.lighthouseResult;
  const perf = lh?.categories?.performance?.score ?? null;
  const audits = lh?.audits ?? {};

  return {
    performanceScore: perf == null ? null : Math.round(perf * 100),
    lcpMs: audits["largest-contentful-paint"]?.numericValue ?? null,
    clsScore:
      audits["cumulative-layout-shift"]?.numericValue == null
        ? null
        : Number(audits["cumulative-layout-shift"]?.numericValue),
    fcpMs: audits["first-contentful-paint"]?.numericValue ?? null,
    tbtMs: audits["total-blocking-time"]?.numericValue ?? null,
    finalUrl: lh?.finalUrl ?? null,
  };
}
