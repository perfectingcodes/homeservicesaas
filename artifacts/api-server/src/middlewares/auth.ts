import type { Request, Response, NextFunction } from "express";
import { eq } from "drizzle-orm";
import { db, usersTable, agenciesTable, type User } from "@workspace/db";

// Resolves a provider id from headers/cookies. In v1 we accept either:
//   x-user-id: <providerId>     (dev / local)
//   Authorization: Bearer <providerId>  (forwarded by Clerk/Supabase shim)
// Falls back to DEV_USER_PROVIDER_ID env in non-production.
function extractProviderId(req: Request): string | null {
  const hdr = req.header("x-user-id");
  if (hdr) return hdr.trim();

  const authz = req.header("authorization");
  if (authz?.toLowerCase().startsWith("bearer ")) {
    return authz.slice(7).trim();
  }

  if (process.env.NODE_ENV !== "production") {
    return process.env.DEV_USER_PROVIDER_ID ?? "dev-user";
  }

  return null;
}

export async function requireUser(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const providerId = extractProviderId(req);
  if (!providerId) {
    res.status(401).json({ error: "unauthenticated" });
    return;
  }

  const user = (
    await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.providerId, providerId))
  )[0];

  if (!user) {
    res.status(401).json({ error: "user_not_provisioned" });
    return;
  }

  req.auth = { user, agencyId: user.agencyId };
  next();
}

export async function getUserAgency(providerId: string): Promise<{
  user: User;
  agencyName: string;
} | null> {
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
  return { user, agencyName: agency?.name ?? "Unknown agency" };
}
