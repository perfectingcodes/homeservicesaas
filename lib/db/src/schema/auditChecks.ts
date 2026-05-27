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
import { auditsTable } from "./audits";

export type CheckStatus = "pass" | "warn" | "fail" | "stub" | "error";
export type CheckCategory =
  | "gbp"
  | "seo"
  | "performance"
  | "nap"
  | "tech"
  | "analytics";

export const auditChecksTable = pgTable(
  "audit_checks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    auditId: uuid("audit_id")
      .notNull()
      .references(() => auditsTable.id, { onDelete: "cascade" }),
    checkKey: text("check_key").notNull(),
    title: text("title").notNull(),
    category: text("category").$type<CheckCategory>().notNull(),
    status: text("status").$type<CheckStatus>().notNull(),
    score: integer("score").notNull(),
    weight: integer("weight").notNull(),
    finding: text("finding").notNull(),
    recommendation: text("recommendation").notNull(),
    evidence: jsonb("evidence").$type<Record<string, unknown> | null>(),
    error: text("error"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("audit_checks_audit_id_idx").on(t.auditId)],
);

export const insertAuditCheckSchema = createInsertSchema(auditChecksTable).omit({
  id: true,
  createdAt: true,
});
export type InsertAuditCheck = z.infer<typeof insertAuditCheckSchema>;
export type AuditCheck = typeof auditChecksTable.$inferSelect;
