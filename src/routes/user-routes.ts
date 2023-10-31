import { randomUUID } from "crypto";
import { FastifyInstance } from "fastify";
import { knex } from "../database/knex-setup";
import { z } from "zod";

export async function userRoutes(app: FastifyInstance) {
  app.get("/", async (request, reply) => {
    const listUsers = await knex("users").select();
    return listUsers;
  });
  app.post("/", async (request, reply) => {
    /**
     * Modelagem request.body
     */
    const createMealRequestSchema = z.object({
      name: z.string(),
      age: z.coerce.number(),
      gender: z.enum(["Male", "Female"]),
    });
    const { name, age, gender } = createMealRequestSchema.parse(request.body);

    const userId = randomUUID();

    /**
     * Seta um cookie baseado no id do usuario
     * Toda vez que eu crio um usuario, eu seto automaticamente seu id
     * nos cookies
     */

    reply.cookie("user_id", userId, {
      path: "/",
      maxAge: 1000 * 60 * 60 * 24 * 1, // 1 Day
    });

    await knex("users").insert({
      id: userId,
      name,
      age,
      gender,
    });

    return reply.status(201).send();
  });
}
