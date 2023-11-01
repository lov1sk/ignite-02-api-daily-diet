import { app } from "./app";
import { env } from "./env/index";

// Inicializa o server na porta configurada na variavel env
app.listen({ port: env.PORT }).then(() => console.log("Server running 🚀"));
