import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";

import type { ContextVariables } from "@/types/hono";

export const farmer = new OpenAPIHono<{
  Variables: ContextVariables;
}>().openapi(
  createRoute({
    method: "get",
    path: "/secret",
    tags: ["Farmer"],
    summary: "Shhh...",
    responses: {
      200: {
        description: "Success",
        content: {
          "application/json": {
            schema: z
              .object({
                message: z.string(),
                email: z.string().email(),
                id: z.string(),
              })
              .openapi("SecretResponse"),
          },
        },
      },
    },
  }),
  async (c) => {
    const user = c.get("user")!;

    return c.json({
      message: "Secret Message",
      email: user.email,
      id: user.id,
    });
  }
);
