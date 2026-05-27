import { Router, type IRouter } from "express";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod/v4";
import { db, clientsTable } from "@workspace/db";
import { requireUser } from "../middlewares/auth";

const router: IRouter = Router();

const createClientBody = z.object({
  name: z.string().min(1),
  websiteUrl: z.string().url().nullable().optional(),
  city: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
});

router.get("/clients", requireUser, async (req, res) => {
  const { agencyId } = req.auth!;
  const rows = await db
    .select()
    .from(clientsTable)
    .where(eq(clientsTable.agencyId, agencyId))
    .orderBy(desc(clientsTable.createdAt));
  res.json(rows);
});

router.post("/clients", requireUser, async (req, res) => {
  const parsed = createClientBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "invalid_input", details: parsed.error });
    return;
  }
  const { agencyId } = req.auth!;
  const [created] = await db
    .insert(clientsTable)
    .values({
      agencyId,
      name: parsed.data.name,
      websiteUrl: parsed.data.websiteUrl ?? null,
      city: parsed.data.city ?? null,
      phone: parsed.data.phone ?? null,
    })
    .returning();
  res.status(201).json(created);
});

router.get("/clients/:clientId", requireUser, async (req, res) => {
  const { agencyId } = req.auth!;
  const clientId = String(req.params.clientId);
  const row = (
    await db
      .select()
      .from(clientsTable)
      .where(
        and(eq(clientsTable.id, clientId), eq(clientsTable.agencyId, agencyId)),
      )
  )[0];
  if (!row) {
    res.status(404).json({ error: "not_found" });
    return;
  }
  res.json(row);
});

export default router;
