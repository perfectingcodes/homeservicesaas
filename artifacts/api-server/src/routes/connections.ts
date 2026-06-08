import { Router, type IRouter } from "express";
import { and, eq } from "drizzle-orm";
import { z } from "zod/v4";
import {
  db,
  clientsTable,
  clientConnectionsTable,
} from "@workspace/db";
import { encrypt } from "@workspace/shared";
import { requireUser } from "../middlewares/auth";

const router: IRouter = Router();

const PROVIDERS = ["gbp", "ga4", "gsc"] as const;
type Provider = (typeof PROVIDERS)[number];

const upsertBody = z.object({
  provider: z.enum(PROVIDERS),
  accessToken: z.string().min(1).optional(),
  refreshToken: z.string().min(1).optional(),
  externalAccountId: z.string().min(1).optional(),
});

async function getBusinessForUser(agencyId: string) {
  const row = (
    await db
      .select()
      .from(clientsTable)
      .where(eq(clientsTable.agencyId, agencyId))
      .limit(1)
  )[0];
  return row ?? null;
}

router.get("/connections", requireUser, async (req, res) => {
  const { agencyId } = req.auth!;
  const business = await getBusinessForUser(agencyId);
  if (!business) {
    res.json([]);
    return;
  }
  const rows = await db
    .select({
      id: clientConnectionsTable.id,
      provider: clientConnectionsTable.provider,
      externalAccountId: clientConnectionsTable.externalAccountId,
      createdAt: clientConnectionsTable.createdAt,
      updatedAt: clientConnectionsTable.updatedAt,
    })
    .from(clientConnectionsTable)
    .where(eq(clientConnectionsTable.clientId, business.id));
  res.json(rows);
});

router.post("/connections", requireUser, async (req, res) => {
  const parsed = upsertBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "invalid_input", details: parsed.error });
    return;
  }
  const { agencyId } = req.auth!;
  const business = await getBusinessForUser(agencyId);
  if (!business) {
    res.status(404).json({ error: "no_business" });
    return;
  }
  const { provider, accessToken, refreshToken, externalAccountId } =
    parsed.data;

  const accessEnc = accessToken ? encrypt(accessToken) : null;
  const refreshEnc = refreshToken ? encrypt(refreshToken) : null;

  const existing = (
    await db
      .select()
      .from(clientConnectionsTable)
      .where(
        and(
          eq(clientConnectionsTable.clientId, business.id),
          eq(clientConnectionsTable.provider, provider as Provider),
        ),
      )
  )[0];

  if (existing) {
    await db
      .update(clientConnectionsTable)
      .set({
        accessTokenEnc: accessEnc ?? existing.accessTokenEnc,
        refreshTokenEnc: refreshEnc ?? existing.refreshTokenEnc,
        externalAccountId: externalAccountId ?? existing.externalAccountId,
        updatedAt: new Date(),
      })
      .where(eq(clientConnectionsTable.id, existing.id));
  } else {
    await db.insert(clientConnectionsTable).values({
      clientId: business.id,
      provider: provider as Provider,
      accessTokenEnc: accessEnc,
      refreshTokenEnc: refreshEnc,
      externalAccountId: externalAccountId ?? null,
    });
  }

  res.status(201).json({ ok: true });
});

router.delete("/connections/:provider", requireUser, async (req, res) => {
  const provider = String(req.params.provider);
  if (!PROVIDERS.includes(provider as Provider)) {
    res.status(400).json({ error: "invalid_provider" });
    return;
  }
  const { agencyId } = req.auth!;
  const business = await getBusinessForUser(agencyId);
  if (!business) {
    res.status(404).json({ error: "no_business" });
    return;
  }
  await db
    .delete(clientConnectionsTable)
    .where(
      and(
        eq(clientConnectionsTable.clientId, business.id),
        eq(clientConnectionsTable.provider, provider as Provider),
      ),
    );
  res.json({ ok: true });
});

export default router;
