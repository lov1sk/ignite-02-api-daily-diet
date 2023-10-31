import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("meals", (table) => {
    table.uuid("id").primary();
    table.uuid("user_id").references("user.id").index();
    table.text("name").notNullable();
    table.text("description").notNullable();
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.boolean("within_diet").notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable("meals");
}
