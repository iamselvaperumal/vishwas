import { OpenAPIHono, createRoute } from "@hono/zod-openapi";

import db from "@/db";
import { resetSchema } from "@/validators/auth.validator";

import { EmailTemplate, sendMail } from "@/lib/email";
import { env } from "@/utils/env.mjs";
import { generatePasswordResetToken } from "@/utils/utils.server";

export const verifyEmail = new OpenAPIHono<{
  // Variables: ContextVariables
}>().openapi(
  createRoute({
    method: "post",
    path: "/auth/reset-password/verify",
    tags: ["Auth"],
    summary: "Reset/Send password reset email",
    description:
      "Send the password reset email to the user with the provided email if it exists in our database.",
    request: {
      body: {
        description: "Reset Password Verification Request body",
        content: {
          "application/json": {
            schema: resetSchema.openapi("ResetEmailBody", {
              example: {
                email: "example@example.com",
              },
            }),
          },
        },
        required: true,
      },
    },
    responses: {
      200: {
        description: "Successfully sent the password reset email",
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
      const { email } = c.req.valid("json");

      const user = await db.query.users.findFirst({
        where: (table, { eq }) => eq(table.email, email),
      });

      if (!user || !user.emailVerified) {
        return c.json({ error: "Provided email is invalid." }, 400);
      }

      const verificationToken = await generatePasswordResetToken(user.id);

      const resetLink = `${env.NEXT_PUBLIC_APP_URL}/auth/reset/update-password?token=${verificationToken}`;

      await sendMail(email, EmailTemplate.PasswordReset, { link: resetLink });

      return c.json(
        { message: "Password reset email sent successfully." },
        200
      );
    } catch (error) {
      return c.json(
        {
          error: `An unexpected error occurred during verifying the user. Please try again later. ${error}`,
        },
        500
      );
    }
  }
);
