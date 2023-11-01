import "dotenv/config";
import { z } from "zod";

/**
 * Cria uma tipagem para todas as variaveis de ambiente que estão presentes, fornecendo
 * o intelissence so typescript para podermos lidar com as mesmas
 */
const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]),
  DATABASE_CLIENT: z.enum(["sqlite", "pg"]),
  DATABASE_URL: z.string(),
  PORT: z.coerce.number().default(3232),
});

const _parsedEnv = envSchema.safeParse(process.env);

/**
 * Caso de algum erro na validação de alguma informação das variaveis de ambiente, da erro
 * na aplicação
 */
if (!_parsedEnv.success) {
  throw new Error("⚠️ Invalid env variables");
}

export const env = _parsedEnv.data;
