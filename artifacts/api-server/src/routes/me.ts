import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, agenciesTable } from "@workspace/db";
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
  res.json({
    userId: user.id,
    email: user.email,
    name: user.name,
    agencyId: user.agencyId,
    agencyName: agency?.name ?? "Unknown",
  });
});

export default router;
