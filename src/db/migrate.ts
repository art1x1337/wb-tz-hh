import { db } from "./knex";

export async function migrate() {
  const exists = await db.schema.hasTable("tariffs");

  if (!exists) {
    await db.schema.createTable("tariffs", (table) => {
      table.increments("id").primary();
      table.string("warehouse_name");
      table.float("coefficient");
      table.timestamp("date");
    });

    console.log("Table tariffs created");
  }
}