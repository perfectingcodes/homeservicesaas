import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, agenciesTable, clientsTable } from "@workspace/db";
import { requireUser } from "../middlewares/auth";

const router: IRouter = Router();

router.get("/me", requireUser, async (req, res) => {
  const user = req.auth!.user;
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
  res.json({
    userId: user.id,
    email: user.email,
    name: user.name,
    agencyId: user.agencyId,
    agencyName: agency?.name ?? "Workspace",
    businessId: business?.id ?? null,
    businessName: business?.name ?? null,
  });
});

export default router;
