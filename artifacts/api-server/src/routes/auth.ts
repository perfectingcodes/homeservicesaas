import { Router, type IRouter } from "express";
import { and, eq } from "drizzle-orm";
import { z } from "zod/v4";
import {
  db,
  agenciesTable,
  usersTable,
  clientsTable,
} from "@workspace/db";
import { bootstrapDemo, DEMO_PROVIDER_ID } from "../lib/demoData";

const router: IRouter = Router();

const signupBody = z.object({
  email: z.string().email(),
  ownerName: z.string().nullable().optional(),
  businessName: z.string().min(1),
  websiteUrl: z
    .string()
    .url()
    .nullable()
    .optional()
    .or(z.literal("").transform(() => null)),
  city: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
});

const signinBody = z.object({
  email: z.string().email(),
});

function providerIdFromEmail(email: string): string {
  return `email:${email.trim().toLowerCase()}`;
}

async function buildResult(providerId: string) {
  const user = (
    await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.providerId, providerId))
  )[0];
  if (!user) return null;
  const agency = (
    await db
      .select()
      .from(agenciesTable)
      .where(eq(agenciesTable.id, user.agencyId))
  )[0];
  const business = (
    await db
      .select()
      .from(clientsTable)
      .where(eq(clientsTable.agencyId, user.agencyId))
      .limit(1)
  )[0];

  return {
    providerId,
    user: {
      userId: user.id,
      email: user.email,
      name: user.name,
      agencyId: user.agencyId,
      agencyName: agency?.name ?? "Workspace",
      businessId: business?.id ?? null,
      businessName: business?.name ?? null,
    },
    business: business ?? undefined,
  };
}

router.post("/auth/signup", async (req, res) => {
  const parsed = signupBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "invalid_input", details: parsed.error });
    return;
  }

  const { email, ownerName, businessName, websiteUrl, city, phone } =
    parsed.data;
  const providerId = providerIdFromEmail(email);

  const existing = (
    await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.providerId, providerId))
  )[0];

  if (existing) {
    // idempotent: return what's there
    const out = await buildResult(providerId);
    if (out) {
      res.status(200).json(out);
      return;
    }
  }

  // Create agency (named after the business) + user + business client
  const [agency] = await db
    .insert(agenciesTable)
    .values({ name: businessName })
    .returning();

  await db.insert(usersTable).values({
    agencyId: agency.id,
    providerId,
    email,
    name: ownerName ?? null,
  });

  await db.insert(clientsTable).values({
    agencyId: agency.id,
    name: businessName,
    websiteUrl: websiteUrl ?? null,
    city: city ?? null,
    phone: phone ?? null,
  });

  const out = await buildResult(providerId);
  if (!out) {
    res.status(500).json({ error: "signup_failed" });
    return;
  }
  res.status(201).json(out);
});

router.post("/auth/demo", async (_req, res) => {
  try {
    await bootstrapDemo();
    const out = await buildResult(DEMO_PROVIDER_ID);
    if (!out) {
      res.status(500).json({ error: "demo_bootstrap_failed" });
      return;
    }
    res.status(200).json(out);
  } catch (e) {
    res.status(500).json({
      error: "demo_bootstrap_failed",
      message: e instanceof Error ? e.message : String(e),
    });
  }
});

router.post("/auth/signin", async (req, res) => {
  const parsed = signinBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "invalid_input", details: parsed.error });
    return;
  }
  const providerId = providerIdFromEmail(parsed.data.email);
  const out = await buildResult(providerId);
  if (!out) {
    res.status(404).json({ error: "no_account" });
    return;
  }
  res.json(out);
});

export default router;
