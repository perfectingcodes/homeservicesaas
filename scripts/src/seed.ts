import { db, agenciesTable, usersTable, clientsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

async function main() {
  const agencyName = "Acme Local SEO";
  let agency = (
    await db
      .select()
      .from(agenciesTable)
      .where(eq(agenciesTable.name, agencyName))
  )[0];

  if (!agency) {
    [agency] = await db
      .insert(agenciesTable)
      .values({ name: agencyName })
      .returning();
    console.log(`created agency ${agency.id}`);
  } else {
    console.log(`agency exists ${agency.id}`);
  }

  const providerId = process.env.SEED_USER_PROVIDER_ID ?? "dev-user";
  let user = (
    await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.providerId, providerId))
  )[0];

  if (!user) {
    [user] = await db
      .insert(usersTable)
      .values({
        agencyId: agency.id,
        providerId,
        email: process.env.SEED_USER_EMAIL ?? "owner@example.com",
        name: "Agency Owner",
      })
      .returning();
    console.log(`created user ${user.id}`);
  } else {
    console.log(`user exists ${user.id}`);
  }

  const clientName = process.env.SEED_CLIENT_NAME ?? "Mike's HVAC & Plumbing";
  let client = (
    await db
      .select()
      .from(clientsTable)
      .where(eq(clientsTable.name, clientName))
  )[0];

  if (!client) {
    [client] = await db
      .insert(clientsTable)
      .values({
        agencyId: agency.id,
        name: clientName,
        websiteUrl:
          process.env.SEED_CLIENT_WEBSITE ?? "https://www.mikeshvacaustin.com",
        city: process.env.SEED_CLIENT_CITY ?? "Austin, TX",
      })
      .returning();
    console.log(`created client ${client.id}`);
  } else {
    console.log(`client exists ${client.id}`);
  }

  console.log("seed complete");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
