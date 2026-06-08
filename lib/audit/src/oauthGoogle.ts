// Shared Google OAuth 2.0 helpers for GA4 + Search Console (and later GBP).

export type GoogleProvider = "ga4" | "gsc" | "gbp";

const SCOPES: Record<GoogleProvider, string[]> = {
  ga4: ["https://www.googleapis.com/auth/analytics.readonly"],
  gsc: ["https://www.googleapis.com/auth/webmasters.readonly"],
  gbp: ["https://www.googleapis.com/auth/business.manage"],
};

export interface OAuthTokens {
  accessToken: string;
  refreshToken: string | null;
  expiresAt: Date;
  tokenType: string;
  scope: string;
}

function env(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`${name} is not set`);
  return v;
}

export function getRedirectUri(): string {
  const base =
    process.env["OAUTH_REDIRECT_BASE_URL"] ?? "http://localhost:5000";
  return `${base.replace(/\/+$/, "")}/api/auth/oauth/google/callback`;
}

export function buildAuthorizeUrl(opts: {
  provider: GoogleProvider;
  state: string;
}): string {
  const params = new URLSearchParams({
    client_id: env("GOOGLE_OAUTH_CLIENT_ID"),
    redirect_uri: getRedirectUri(),
    response_type: "code",
    access_type: "offline",
    prompt: "consent",
    include_granted_scopes: "true",
    scope: SCOPES[opts.provider].join(" "),
    state: opts.state,
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export async function exchangeCode(code: string): Promise<OAuthTokens> {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: env("GOOGLE_OAUTH_CLIENT_ID"),
      client_secret: env("GOOGLE_OAUTH_CLIENT_SECRET"),
      redirect_uri: getRedirectUri(),
      grant_type: "authorization_code",
    }).toString(),
  });

  if (!res.ok) {
    throw new Error(`Google token exchange failed: ${res.status} ${await res.text()}`);
  }

  const data = (await res.json()) as {
    access_token: string;
    refresh_token?: string;
    expires_in: number;
    token_type: string;
    scope: string;
  };

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token ?? null,
    expiresAt: new Date(Date.now() + (data.expires_in - 30) * 1000),
    tokenType: data.token_type,
    scope: data.scope,
  };
}

export async function refreshAccessToken(refreshToken: string): Promise<OAuthTokens> {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: env("GOOGLE_OAUTH_CLIENT_ID"),
      client_secret: env("GOOGLE_OAUTH_CLIENT_SECRET"),
      grant_type: "refresh_token",
    }).toString(),
  });

  if (!res.ok) {
    throw new Error(`Google token refresh failed: ${res.status} ${await res.text()}`);
  }

  const data = (await res.json()) as {
    access_token: string;
    expires_in: number;
    token_type: string;
    scope: string;
  };

  return {
    accessToken: data.access_token,
    refreshToken: null, // refresh response doesn't include a new refresh token
    expiresAt: new Date(Date.now() + (data.expires_in - 30) * 1000),
    tokenType: data.token_type,
    scope: data.scope,
  };
}
