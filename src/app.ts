import { fastify } from "fastify";
import { userRoutes } from "./routes/user-routes";
import { mealsRoutes } from "./routes/meals-routes";

import cookie from "@fastify/cookie";

// Declaração da instancia do fastify
export const app = fastify();

/**
 * Registro de rotas e plugins do fastify
 */

app.register(cookie);
app.register(userRoutes, {
  prefix: "/users",
});
app.register(mealsRoutes, {
  prefix: "/meals",
});
