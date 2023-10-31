import { FastifyInstance } from "fastify";
import { knex } from "../database/knex-setup";
import { z } from "zod";
import { randomUUID } from "crypto";
import { checkSessionIdExists } from "../middlewares/check-session-id-exists";
import console, { log } from "console";

export async function mealsRoutes(app: FastifyInstance) {
  app.addHook("preHandler", checkSessionIdExists);
  app.get("/", async (request) => {
    const { user_id } = request.cookies;
    const listMeals = await knex("meals").where({ user_id });
    return listMeals;
  });
  app.get("/:id", async (request, reply) => {
    const { user_id } = request.cookies;

    const getMealRequestSchema = z.object({
      id: z.string(),
    });

    const { id } = getMealRequestSchema.parse(request.params);

    const listMeals = await knex("meals").where({ user_id, id });
    console.log(listMeals);

    if (listMeals.length <= 0) {
      return reply
        .status(400)
        .send({ message: "Invalid meal id, please check your meal id" });
    }
    return listMeals;
  });
  app.get("/metrics", async (request) => {
    const { user_id } = request.cookies;
    const listMeals = await knex("meals").where({ user_id });
    const mealsWithinDiet = await knex("meals").where({
      user_id,
      within_diet: 1,
    });

    /**
     * Em testes: Aqui ele conta pela sequencia de trues no
     * parametro within_diet e salva em outro array quantas
     * refeiçoes em sequencia seguindo a dieta o
     * usuario fez
     */
    const counts = [] as number[];
    const sequence = listMeals.map((meal) => meal.within_diet);
    let count = 0;
    for (const inDiet of sequence) {
      if (inDiet === 1) {
        count++;
        if (counts.length == 0) {
          counts.push(count);
        }

        if (counts.length == 1) {
          counts.splice(0, 1, count);
        }
      } else {
        counts.push(count);
        count = 0;
      }
    }

    return {
      total_of_meals: listMeals.length,
      in_diet_meals: mealsWithinDiet.length,
      out_of_diet_meals: listMeals.length - mealsWithinDiet.length,
      best_sequence: ` ${Math.max(...counts)} meals`,
    };
  });
  app.post("/", async (request, reply) => {
    const { user_id } = request.cookies;
    const createMealRequestSchema = z.object({
      name: z.string(),
      description: z.string(),
      within_diet: z.boolean(),
      consumed_at: z.string(),
    });

    const { name, description, within_diet, consumed_at } =
      createMealRequestSchema.parse(request.body);

    await knex("meals").insert({
      id: randomUUID(),
      name,
      description,
      within_diet,
      user_id,
      consumed_at,
    });
    return reply.status(201).send();
  });
  app.put("/:id", async (request, reply) => {
    // cookie de sessão do usuario
    const { user_id } = request.cookies;

    /**
     * Modelagem request.body
     */
    const updateMealRequestSchema = z.object({
      name: z.string(),
      description: z.string(),
      within_diet: z.coerce.boolean(),
      consumed_at: z.string(),
    });
    const { name, description, within_diet, consumed_at } =
      updateMealRequestSchema.parse(request.body);

    /**
     * Modelagem request.params
     */
    const requestParamsSchema = z.object({
      id: z.string().uuid(),
    });
    const { id } = requestParamsSchema.parse(request.params);

    /**
     * Salva no banco de dados
     */
    const updateResult = await knex("meals")
      .where({ id, user_id })
      .update({ name, description, within_diet, consumed_at });

    /**
     * Se 0 registros forem deletados, temos um erro sendo exibido para o usuario
     */
    if (updateResult === 0) {
      return reply
        .status(400)
        .send({ message: "Nothing is updated, please try with another id" });
    }

    // Retorna sucesso
    return reply.status(204).send();
  });
  app.delete("/:id", async (request, reply) => {
    const { user_id } = request.cookies;
    const requestSchema = z.object({
      id: z.string().uuid(),
    });
    const { id } = requestSchema.parse(request.params);
    const deleteResult = await knex("meals").where({ id, user_id }).delete();

    /**
     * Se 0 registros forem deletados, temos um erro sendo exibido para o usuario
     */
    if (deleteResult === 0) {
      return reply
        .status(400)
        .send({ message: "Nothing is deleted, please try with another id" });
    }

    return reply.status(204).send();
  });
}
