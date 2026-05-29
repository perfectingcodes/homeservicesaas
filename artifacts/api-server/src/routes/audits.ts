import { Router, type IRouter } from "express";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod/v4";
import {
  db,
  clientsTable,
  auditsTable,
  auditChecksTable,
} from "@workspace/db";
import { runAudit } from "@workspace/audit";
import { requireUser } from "../middlewares/auth";

const router: IRouter = Router();

const runAuditBody = z.object({
  clientId: z.string().uuid(),
});

async function ensureClientInAgency(
  clientId: string,
  agencyId: string,
): Promise<{ id: string } | null> {
  const row = (
    await db
      .select({ id: clientsTable.id })
      .from(clientsTable)
      .where(
        and(eq(clientsTable.id, clientId), eq(clientsTable.agencyId, agencyId)),
      )
  )[0];
  return row ?? null;
}

router.post("/audits", requireUser, async (req, res) => {
  const parsed = runAuditBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "invalid_input", details: parsed.error });
    return;
  }
  const { agencyId } = req.auth!;
  const ok = await ensureClientInAgency(parsed.data.clientId, agencyId);
  if (!ok) {
    res.status(404).json({ error: "client_not_found" });
    return;
  }

  const result = await runAudit(parsed.data.clientId);

  const client = (
    await db
      .select()
      .from(clientsTable)
      .where(eq(clientsTable.id, parsed.data.clientId))
  )[0];

  const checks = await db
    .select()
    .from(auditChecksTable)
    .where(eq(auditChecksTable.auditId, result.audit.id))
    .orderBy(auditChecksTable.createdAt);

  res.status(201).json({ audit: result.audit, client, checks });
});

router.get("/audits/:auditId", requireUser, async (req, res) => {
  const { agencyId } = req.auth!;
  const auditId = String(req.params.auditId);

  const row = (
    await db
      .select({
        audit: auditsTable,
        client: clientsTable,
      })
      .from(auditsTable)
      .innerJoin(clientsTable, eq(auditsTable.clientId, clientsTable.id))
      .where(
        and(eq(auditsTable.id, auditId), eq(clientsTable.agencyId, agencyId)),
      )
  )[0];

  if (!row) {
    res.status(404).json({ error: "not_found" });
    return;
  }

  const checks = await db
    .select()
    .from(auditChecksTable)
    .where(eq(auditChecksTable.auditId, auditId))
    .orderBy(auditChecksTable.createdAt);

  res.json({ audit: row.audit, client: row.client, checks });
});

router.get(
  "/clients/:clientId/audits",
  requireUser,
  async (req, res) => {
    const { agencyId } = req.auth!;
    const clientId = String(req.params.clientId);
    const ok = await ensureClientInAgency(clientId, agencyId);
    if (!ok) {
      res.status(404).json({ error: "client_not_found" });
      return;
    }
    const rows = await db
      .select()
      .from(auditsTable)
      .where(eq(auditsTable.clientId, clientId))
      .orderBy(desc(auditsTable.startedAt));
    res.json(rows);
  },
);

export default router;
