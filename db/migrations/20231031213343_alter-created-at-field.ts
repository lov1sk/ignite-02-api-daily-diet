import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("meals", (table) => {
    table.renameColumn("created_at", "consumed_at");
    table.string("consumed_at").alter();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("meals", (table) => {
    table.timestamp("consumed_at").alter();
    table.renameColumn("consumed_at", "created_at");
  });
}
