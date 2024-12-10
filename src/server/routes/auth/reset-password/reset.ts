import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { setCookie } from "hono/cookie";

import { passwordResetTokens, users } from "@/db/schema";
import { eq } from "drizzle-orm";

import { lucia } from "@/auth";
import db from "@/db";
import { resetPasswordSchema } from "@/validators/auth.validator";
import { isWithinExpirationDate } from "oslo";
import { Argon2id } from "oslo/password";

export const resetPassword = new OpenAPIHono<{
  // Variables: ContextVariables
}>().openapi(
  createRoute({
    method: "put",
    path: "/auth/reset-password/update",
    tags: ["Auth"],
    summary: "Reset/Update Password",
    description:
      "Update the password for a user after verifying their email with the provided token.",
    request: {
      body: {
        description: "Update Password Request body",
        content: {
          "application/json": {
            schema: resetPasswordSchema.openapi("ResetPasswordRequestBody", {
              example: {
                token: "123a56a8-9e1e-1d13-a415-f6171c192021",
                password: "newSecurePassword",
                confirmPassword: "newSecurePassword",
              },
            }),
          },
        },
        required: true,
      },
    },
    responses: {
      200: {
        description: "Password updated successfully",
      },
      400: {
        description: "Bad Request",
      },
      500: {
        description: "Internal Server Error",
      },
    },
  }),

  async (c) => {
    try {
      const { token, password } = c.req.valid("json");

      if (!token) {
        return c.json({ error: "Reset token is required" }, 400);
      }

      const dbToken = await db.transaction(async (tx) => {
        const item = await tx.query.passwordResetTokens.findFirst({
          where: (table, { eq }) => eq(table.id, token),
        });
        if (item) {
          await tx
            .delete(passwordResetTokens)
            .where(eq(passwordResetTokens.id, item.id));
        }
        return item;
      });

      if (!dbToken)
        return c.json({ error: "Invalid password reset link" }, 400);

      if (!isWithinExpirationDate(dbToken.expiresAt))
        return c.json({ error: "Password reset link expired." }, 400);

      await lucia.invalidateUserSessions(dbToken.userId);
      const updatedHashedPassword = await new Argon2id().hash(password);
      await db
        .update(users)
        .set({ hashedPassword: updatedHashedPassword })
        .where(eq(users.id, dbToken.userId));

      const session = await lucia.createSession(dbToken.userId, {});
      const sessionCookie = lucia.createSessionCookie(session.id);
      const maxAge = Math.min(sessionCookie.attributes.maxAge || 0, 34560000);
      setCookie(c, sessionCookie.name, sessionCookie.value, {
        ...sessionCookie.attributes,
        maxAge: maxAge,
        sameSite: "Strict",
      });
      return c.json({ message: "Password updated successfully." }, 200);
    } catch (error) {
      return c.json(
        {
          error: `An unexpected error occurred while updating the password. Please try again later. ${error}`,
        },
        500
      );
    }
  }
);
