import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { setCookie } from "hono/cookie";

import { users } from "@/db/schema";
import { and, eq } from "drizzle-orm";

import { lucia } from "@/auth";
import db from "@/db";
import { loginSchema } from "@/validators/auth.validator";
import { Argon2id } from "oslo/password";

export const login = new OpenAPIHono<{
  // Variables: ContextVariables
}>().openapi(
  createRoute({
    method: "post",
    path: "/auth/login",
    tags: ["Auth"],
    summary: "Login",
    description: "Login user with email and password",
    request: {
      body: {
        description: "Login Request body",
        content: {
          "application/json": {
            schema: loginSchema.openapi("Login", {
              example: {
                email: "john.doe@example.com",
                password: "password123",
              },
            }),
          },
        },
        required: true,
      },
    },
    responses: {
      200: {
        description: "Success",
      },
      401: {
        description: "Unauthorized",
      },
      500: {
        description: "Internal Server Error",
      },
    },
  }),

  async (c) => {
    try {
      const { email, password } = c.req.valid("json");

      const existingUser = await db.query.users.findFirst({
        where: and(eq(users.email, email), eq(users.emailVerified, true)),
      });

      if (!existingUser || !existingUser.hashedPassword) {
        return c.json({ error: "Invalid email or password" }, 401);
      }

      const validPassword = await new Argon2id().verify(
        existingUser.hashedPassword,
        password
      );

      if (!validPassword) {
        return c.json({ error: "Invalid email or password" }, 401);
      }

      const session = await lucia.createSession(existingUser.id, {});
      const sessionCookie = lucia.createSessionCookie(session.id);
      const maxAge = Math.min(sessionCookie.attributes.maxAge || 0, 34560000);

      setCookie(c, sessionCookie.name, sessionCookie.value, {
        ...sessionCookie.attributes,
        maxAge: maxAge,
        sameSite: "Strict",
      });

      return c.json({ message: "Logged in successfully" }, 200);
    } catch (error) {
      return c.json(
        { error: `An unexpected error occurred during login: ${error}` },
        500
      );
    }
  }
);
