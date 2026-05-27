import {
  pgTable,
  text,
  timestamp,
  uuid,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { clientsTable } from "./clients";

export type ConnectionProvider = "ga4" | "gsc" | "gbp";

export const clientConnectionsTable = pgTable(
  "client_connections",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    clientId: uuid("client_id")
      .notNull()
      .references(() => clientsTable.id, { onDelete: "cascade" }),
    provider: text("provider").$type<ConnectionProvider>().notNull(),
    accessTokenEnc: text("access_token_enc"),
    refreshTokenEnc: text("refresh_token_enc"),
    externalAccountId: text("external_account_id"),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("client_connections_client_provider_idx").on(
      t.clientId,
      t.provider,
    ),
  ],
);

export const insertClientConnectionSchema = createInsertSchema(
  clientConnectionsTable,
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertClientConnection = z.infer<
  typeof insertClientConnectionSchema
>;
export type ClientConnection = typeof clientConnectionsTable.$inferSelect;
