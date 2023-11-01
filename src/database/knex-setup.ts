import { knex as setupKnex, Knex } from "knex";
import { env } from "../env";

/**
 * Configuração do knex de acordo com a variaveis de ambiente
 */
export const config: Knex.Config = {
  client: env.DATABASE_CLIENT === "sqlite" ? "sqlite" : "pg",
  connection:
    env.DATABASE_CLIENT === "sqlite"
      ? { filename: env.DATABASE_URL }
      : env.DATABASE_URL,
  useNullAsDefault: true,
  migrations: {
    extension: "ts",
    directory: "./db/migrations",
  },
};
export const knex = setupKnex(config);
