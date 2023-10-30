import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]),
  DATABASE_CLIENT: z.enum(["sqlite", "pg"]),
  DATABASE_URL: z.string(),
  PORT: z.coerce.number().default(3232),
});

const _parsedEnv = envSchema.safeParse(process.env);

if (!_parsedEnv.success) {
  throw new Error("⚠️ Invalid env variables");
}

export const env = _parsedEnv.data;
