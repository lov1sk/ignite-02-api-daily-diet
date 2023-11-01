import { z } from "zod";
import { knex } from "../database/knex-setup";
import { randomUUID } from "crypto";
import { FastifyInstance } from "fastify";
import { checkSessionIdExists } from "../middlewares/check-session-id-exists";

export async function mealsRoutes(app: FastifyInstance) {
  // Definição de um middleware para as rotas das refeições
  app.addHook("preHandler", checkSessionIdExists);

  // Rota de listagem de todas as refeições de um usuario
  app.get("/", async (request) => {
    // Resgata o cookie de identificação do usuario
    const { user_id } = request.cookies;

    // Faz a listagem de todas as refeições que o usuario salvou
    const listMeals = await knex("meals").where({ user_id });

    // Retorna a lista de refeições
    return listMeals;
  });

  // Rota para a busca de uma refeição especifica
  app.get("/:id", async (request, reply) => {
    // Resgata o cookie de identificação do usuario
    const { user_id } = request.cookies;

    /**
     * Modelagem dos dados presentes no corpo da requisição
     */
    const getMealRequestSchema = z.object({
      id: z.string(),
    });

    const { id } = getMealRequestSchema.parse(request.params);

    /**
     * Faz a busca de uma refeição especifica de um usuario
     */
    const meal = await knex("meals").where({ user_id, id });

    /**
     * Caso a busca retorne uma lista vazia, retorna um erro
     */
    if (meal.length <= 0) {
      return reply
        .status(400)
        .send({ message: "Invalid meal id, please check your meal id" });
    }

    // Retorna a refeição encontrada
    return meal;
  });

  /**
   * Rota para listagem das metricas de um usuario com base em informações sobre
   * => Total de refeições salvas
   * => Total de refeições que estão dentro da dieta
   * => Total de refeições fora da dieta
   * => Melhor sequencia de refeições dentro da dieta
   */
  app.get("/metrics", async (request) => {
    // Resgata o cookie de identificação do usuario
    const { user_id } = request.cookies;

    /**
     * Pego as informações de todas as refeiçoes e das refeiçoes que estao dentro da dieta
     */
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

    /**
     * Resposta retornada da API
     */
    return {
      total_of_meals: listMeals.length,
      in_diet_meals: mealsWithinDiet.length,
      out_of_diet_meals: listMeals.length - mealsWithinDiet.length,
      best_sequence: ` ${Math.max(...counts)} meals`,
    };
  });

  // Rota para criação de uma nova refeição
  app.post("/", async (request, reply) => {
    // Resgata o cookie de identificação do usuario
    const { user_id } = request.cookies;

    /**
     * Modelagem dos dados presentes no corpo da requisição
     */
    const createMealRequestSchema = z.object({
      name: z.string(),
      description: z.string(),
      within_diet: z.boolean(),
      consumed_at: z.string(),
    });

    const { name, description, within_diet, consumed_at } =
      createMealRequestSchema.parse(request.body);

    /**
     * Salva na tabela de refeições a refeição feita por determinado usario
     */
    await knex("meals").insert({
      id: randomUUID(),
      name,
      description,
      within_diet,
      user_id,
      consumed_at,
    });

    /**
     * Retorna um status code de sucesso
     */
    return reply.status(201).send();
  });

  // Rota para atualização ou edição de uma refeição
  app.put("/:id", async (request, reply) => {
    // cookie de sessão do usuario
    const { user_id } = request.cookies;

    /**
     * Modelagem dos dados presentes no corpo da requisição
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

    // Retorna sucesso e com status code de 204 - no content
    return reply.status(204).send();
  });

  // Rota para remoção de uma refeição
  app.delete("/:id", async (request, reply) => {
    const { user_id } = request.cookies;

    /**
     * Modelagem do parametro passado na rota = request.params
     */
    const requestSchema = z.object({
      id: z.string().uuid(),
    });
    const { id } = requestSchema.parse(request.params);

    /**
     * Após remoção da refeição o knex retorna um numero de quantos registros foram deletados
     **/
    const deleteResult = await knex("meals").where({ id, user_id }).delete();

    /**
     * Se 0 registros forem deletados, temos um erro sendo exibido para o usuario
     */
    if (deleteResult === 0) {
      return reply
        .status(400)
        .send({ message: "Nothing is deleted, please try with another id" });
    }

    // Retorna sucesso e com status code de 204 - no content
    return reply.status(204).send();
  });
}
