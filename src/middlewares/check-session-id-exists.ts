import { FastifyRequest, FastifyReply } from "fastify";

export async function checkSessionIdExists(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { user_id } = request.cookies;
  if (!user_id) {
    return reply.status(401).send({ error: "Unauthorized" });
  }
  
}
