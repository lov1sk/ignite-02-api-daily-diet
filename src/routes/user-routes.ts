import { z } from "zod";
import { knex } from "../database/knex-setup";
import { randomUUID } from "crypto";
import { FastifyInstance } from "fastify";

export async function userRoutes(app: FastifyInstance) {
  /**
   * Rota de listagem de todos os usuarios
   */
  app.get("/", async (request, reply) => {
    /**
     * Faz uma listagem de todos os registros presentes na tabela de usuarios
     */
    const listUsers = await knex("users").select();

    // Retorno da lista dos usuarios salvos no banco
    return listUsers;
  });

  /**
   * Rota de criação de um novo usuario
   */
  app.post("/", async (request, reply) => {
    /**
     * Modelagem dos dados que vem do corpo da requisição
     */
    const createMealRequestSchema = z.object({
      name: z.string(),
      age: z.coerce.number(),
      gender: z.enum(["Male", "Female"]),
    });
    const { name, age, gender } = createMealRequestSchema.parse(request.body);

    /**
     * Seta um cookie baseado no id do usuario
     * Toda vez que eu crio um usuario, eu seto automaticamente seu id
     * nos cookies
     */
    const userId = randomUUID();

    reply.cookie("user_id", userId, {
      path: "/",
      maxAge: 1000 * 60 * 60 * 24 * 1, // 1 Day
    });

    /**
     * Salva um novo usuario no banco de dados
     */
    await knex("users").insert({
      id: userId,
      name,
      age,
      gender,
    });

    return reply.status(201).send();
  });
}
