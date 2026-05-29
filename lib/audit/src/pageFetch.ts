const USER_AGENT =
  "Mozilla/5.0 (compatible; RankRightAudit/0.1; +https://rankright.example/bot)";
const DEFAULT_TIMEOUT_MS = 12_000;

export interface FetchedPage {
  url: string;
  finalUrl: string;
  status: number;
  ok: boolean;
  html: string;
  contentType: string;
  fetchedAt: string;
}

async function fetchWithTimeout(
  url: string,
  timeoutMs: number,
): Promise<Response> {
  const ctl = new AbortController();
  const id = setTimeout(() => ctl.abort(), timeoutMs);
  try {
    return await fetch(url, {
      signal: ctl.signal,
      headers: { "user-agent": USER_AGENT, accept: "text/html,*/*" },
      redirect: "follow",
    });
  } finally {
    clearTimeout(id);
  }
}

export async function fetchPage(
  url: string,
  opts: { timeoutMs?: number } = {},
): Promise<FetchedPage> {
  const res = await fetchWithTimeout(url, opts.timeoutMs ?? DEFAULT_TIMEOUT_MS);
  const contentType = res.headers.get("content-type") ?? "";
  const html = contentType.includes("text") || contentType === ""
    ? await res.text()
    : "";
  return {
    url,
    finalUrl: res.url,
    status: res.status,
    ok: res.ok,
    html,
    contentType,
    fetchedAt: new Date().toISOString(),
  };
}

export async function fetchText(url: string, timeoutMs = 8000): Promise<string | null> {
  try {
    const res = await fetchWithTimeout(url, timeoutMs);
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

// ---------- HTML helpers (regex-based, no DOM dep) ----------

export function extractTitle(html: string): string | null {
  const m = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return m ? decodeEntities(m[1].trim()) : null;
}

export function extractMetaDescription(html: string): string | null {
  const m = html.match(
    /<meta\s+[^>]*name=["']description["'][^>]*content=["']([^"']*)["'][^>]*>/i,
  );
  if (m) return decodeEntities(m[1].trim());
  const m2 = html.match(
    /<meta\s+[^>]*content=["']([^"']*)["'][^>]*name=["']description["'][^>]*>/i,
  );
  return m2 ? decodeEntities(m2[1].trim()) : null;
}

export function extractH1s(html: string): string[] {
  const out: string[] = [];
  const re = /<h1\b[^>]*>([\s\S]*?)<\/h1>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    out.push(stripTags(m[1]).trim());
  }
  return out;
}

export function hasViewportMeta(html: string): boolean {
  return /<meta\s+[^>]*name=["']viewport["']/i.test(html);
}

export function extractJsonLd(html: string): unknown[] {
  const out: unknown[] = [];
  const re =
    /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    const raw = m[1].trim();
    if (!raw) continue;
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) out.push(...parsed);
      else out.push(parsed);
    } catch {
      // ignore malformed json-ld
    }
  }
  return out;
}

const PHONE_REGEX =
  /(?:\+?1[\s\-.]?)?\(?([2-9]\d{2})\)?[\s\-.]?([2-9]\d{2})[\s\-.]?(\d{4})\b/g;

export function extractPhones(text: string): string[] {
  const out = new Set<string>();
  let m: RegExpExecArray | null;
  while ((m = PHONE_REGEX.exec(text)) !== null) {
    out.add(`(${m[1]}) ${m[2]}-${m[3]}`);
  }
  PHONE_REGEX.lastIndex = 0;
  return [...out];
}

export function normalizePhone(p: string | null | undefined): string | null {
  if (!p) return null;
  const digits = p.replace(/\D+/g, "");
  if (digits.length === 11 && digits.startsWith("1")) return digits.slice(1);
  if (digits.length === 10) return digits;
  return digits || null;
}

export function extractAnchorLinks(html: string, base: string): string[] {
  const out = new Set<string>();
  const re = /<a\s+[^>]*href=["']([^"']+)["']/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    try {
      const u = new URL(m[1], base);
      if (u.hostname === new URL(base).hostname) out.add(u.toString());
    } catch {
      // ignore
    }
  }
  return [...out];
}

function stripTags(s: string): string {
  return s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");
}

// Pick candidate "service" pages (e.g. /services/, /repair, /installation)
const SERVICE_HINTS = [
  /\/services?\b/i,
  /\/repair\b/i,
  /\/install/i,
  /\/maintenance\b/i,
  /\/emergency\b/i,
  /\/hvac\b/i,
  /\/plumb/i,
  /\/electric/i,
  /\/roof/i,
  /\/clean/i,
];

export function pickServicePageLinks(links: string[], max: number): string[] {
  const scored: string[] = [];
  for (const l of links) {
    if (SERVICE_HINTS.some((re) => re.test(l))) scored.push(l);
    if (scored.length >= max) break;
  }
  return scored;
}

export interface SiteSnapshot {
  homepage: FetchedPage;
  servicePages: FetchedPage[];
  robotsTxt: string | null;
  sitemapXml: string | null;
}

export async function snapshotSite(
  rawUrl: string,
  opts: { maxServicePages?: number } = {},
): Promise<SiteSnapshot> {
  const maxServicePages = opts.maxServicePages ?? 3;
  const homepage = await fetchPage(rawUrl);
  const base = new URL(homepage.finalUrl);

  const servicePages: FetchedPage[] = [];
  if (homepage.ok && homepage.html) {
    const links = extractAnchorLinks(homepage.html, homepage.finalUrl);
    const candidates = pickServicePageLinks(links, maxServicePages);
    for (const u of candidates) {
      try {
        const p = await fetchPage(u);
        servicePages.push(p);
      } catch {
        // skip
      }
    }
  }

  const robotsTxt = await fetchText(`${base.origin}/robots.txt`);
  const sitemapXml = await fetchText(`${base.origin}/sitemap.xml`);

  return { homepage, servicePages, robotsTxt, sitemapXml };
}
