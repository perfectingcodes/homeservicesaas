import { Router, type IRouter } from "express";
import { randomBytes } from "node:crypto";
import { and, eq } from "drizzle-orm";
import {
  db,
  clientsTable,
  clientConnectionsTable,
} from "@workspace/db";
import { encrypt } from "@workspace/shared";
import {
  buildAuthorizeUrl,
  exchangeCode,
  listGa4Properties,
  listGscSites,
  type GoogleProvider,
} from "@workspace/audit";
import { requireUser } from "../middlewares/auth";

const router: IRouter = Router();

const WEB_BASE = process.env["WEB_BASE_URL"] ?? "http://localhost:5173";

// Encoded as base64(JSON(state)). For prod, switch to a signed cookie or DB row.
interface OAuthState {
  provider: GoogleProvider;
  agencyId: string;
  nonce: string;
}

function encodeState(s: OAuthState): string {
  return Buffer.from(JSON.stringify(s)).toString("base64url");
}

function decodeState(s: string): OAuthState | null {
  try {
    return JSON.parse(Buffer.from(s, "base64url").toString("utf8"));
  } catch {
    return null;
  }
}

router.get("/auth/oauth/google/start", requireUser, (req, res) => {
  const provider = String(req.query["provider"] ?? "") as GoogleProvider;
  if (!["ga4", "gsc", "gbp"].includes(provider)) {
    res.status(400).json({ error: "invalid_provider" });
    return;
  }
  if (!process.env["GOOGLE_OAUTH_CLIENT_ID"]) {
    res.status(503).json({
      error: "oauth_not_configured",
      message:
        "GOOGLE_OAUTH_CLIENT_ID is not set on the server. See replit.md for setup.",
    });
    return;
  }
  const state = encodeState({
    provider,
    agencyId: req.auth!.agencyId,
    nonce: randomBytes(16).toString("hex"),
  });
  const url = buildAuthorizeUrl({ provider, state });
  res.json({ url });
});

// Callback is NOT behind requireUser — Google hits it after consent.
router.get("/auth/oauth/google/callback", async (req, res) => {
  const code = req.query["code"];
  const stateRaw = req.query["state"];
  if (typeof code !== "string" || typeof stateRaw !== "string") {
    res.status(400).send("Missing code or state");
    return;
  }
  const state = decodeState(stateRaw);
  if (!state) {
    res.status(400).send("Invalid state");
    return;
  }

  try {
    const tokens = await exchangeCode(code);

    // Auto-pick the first property / site so the user lands connected.
    let externalAccountId: string | null = null;
    if (state.provider === "ga4") {
      const props = await listGa4Properties(tokens.accessToken);
      externalAccountId = props[0]?.name ?? null;
    } else if (state.provider === "gsc") {
      const sites = await listGscSites(tokens.accessToken);
      externalAccountId = sites[0]?.siteUrl ?? null;
    }

    const business = (
      await db
        .select()
        .from(clientsTable)
        .where(eq(clientsTable.agencyId, state.agencyId))
        .limit(1)
    )[0];
    if (!business) {
      res.redirect(`${WEB_BASE}/connections?error=no_business`);
      return;
    }

    const existing = (
      await db
        .select()
        .from(clientConnectionsTable)
        .where(
          and(
            eq(clientConnectionsTable.clientId, business.id),
            eq(clientConnectionsTable.provider, state.provider),
          ),
        )
    )[0];

    const accessEnc = encrypt(tokens.accessToken);
    const refreshEnc = tokens.refreshToken
      ? encrypt(tokens.refreshToken)
      : null;

    if (existing) {
      await db
        .update(clientConnectionsTable)
        .set({
          accessTokenEnc: accessEnc,
          refreshTokenEnc: refreshEnc ?? existing.refreshTokenEnc,
          externalAccountId:
            externalAccountId ?? existing.externalAccountId,
          expiresAt: tokens.expiresAt,
          updatedAt: new Date(),
        })
        .where(eq(clientConnectionsTable.id, existing.id));
    } else {
      await db.insert(clientConnectionsTable).values({
        clientId: business.id,
        provider: state.provider,
        accessTokenEnc: accessEnc,
        refreshTokenEnc: refreshEnc,
        externalAccountId,
        expiresAt: tokens.expiresAt,
      });
    }

    res.redirect(
      `${WEB_BASE}/connections?connected=${encodeURIComponent(state.provider)}`,
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    res.redirect(
      `${WEB_BASE}/connections?error=${encodeURIComponent(msg.slice(0, 200))}`,
    );
  }
});

export default router;
