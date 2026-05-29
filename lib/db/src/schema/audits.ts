import {
  pgTable,
  text,
  timestamp,
  uuid,
  integer,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { clientsTable } from "./clients";

export type AuditStatus = "running" | "complete" | "failed";

export const auditsTable = pgTable(
  "audits",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    clientId: uuid("client_id")
      .notNull()
      .references(() => clientsTable.id, { onDelete: "cascade" }),
    status: text("status").$type<AuditStatus>().notNull().default("running"),
    score: integer("score"),
    summary: jsonb("summary").$type<Record<string, unknown> | null>(),
    error: text("error"),
    startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
  },
  (t) => [index("audits_client_id_idx").on(t.clientId)],
);

export const insertAuditSchema = createInsertSchema(auditsTable).omit({
  id: true,
  startedAt: true,
  completedAt: true,
});
export type InsertAudit = z.infer<typeof insertAuditSchema>;
export type Audit = typeof auditsTable.$inferSelect;
