import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";

import { users } from "@/db/schema";
import { eq, or } from "drizzle-orm";

import db from "@/db";
import { registrationSchema } from "@/validators/auth.validator";
import { Argon2id } from "oslo/password";

import { EmailTemplate, sendMail } from "@/lib/email";
import { RegistrationStatus } from "@/types/auth";
import { generateEmailVerificationCode } from "@/utils/utils.server";

const registrationResponseSchema = z.object({
  status: z.nativeEnum(RegistrationStatus),
  message: z.string(),
  userId: z.string().optional(),
});

export const sendRegistrationCode = new OpenAPIHono<{
  // Variables: ContextVariables
}>().openapi(
  createRoute({
    method: "post",
    path: "/auth/register/send-verification-code",
    tags: ["Auth"],
    summary: "Register/Send Verification Code",
    description: "Emails the user a temporary registration code",
    request: {
      body: {
        description: "Register Request body",
        content: {
          "application/json": {
            schema: registrationSchema.openapi("SendRegistrationCode", {
              example: {
                email: "example@example.com",
                password: "password123",
                confirmPassword: "password123",
                name: "John Farmer",
                role: "farmer",
                phone: "9876543210",
                aadhaar: "123456789012",
                address: "123, Green Fields, Rural Area, State 636005",
                landRegistrationNumber: "STATE/DISTRICT/0123/LAND/4567",
              },
            }),
          },
        },
        required: true,
      },
    },
    responses: {
      200: {
        description: "Successfully sent verification code",
        content: {
          "application/json": {
            schema: registrationSchema.openapi("Registration Response"),
          },
        },
      },
      400: {
        description: "Registration failed due to validation or existing user",
      },
      401: {
        description: "Unauthorized access",
      },
      500: {
        description: "Internal Server Error during registration",
      },
    },
  }),

  async (c) => {
    try {
      const {
        email,
        password,
        phone,
        aadhaar,
        landRegistrationNumber,
        address,
        name,
        role,
      } = c.req.valid("json");

      if (role === "farmer" && !landRegistrationNumber) {
        return c.json(
          {
            status: RegistrationStatus.VALIDATION_ERROR,
            message: "Land registration number is required for farmers",
          },
          400
        );
      }

      if (role !== "farmer" && landRegistrationNumber) {
        return c.json(
          {
            status: RegistrationStatus.VALIDATION_ERROR,
            message: "Land registration number is only allowed for farmers",
          },
          400
        );
      }

      let existingUser;
      try {
        const queryConditions = [
          eq(users.email, email),
          eq(users.phone, phone),
          eq(users.aadhaar, aadhaar),
        ];

        if (role === "farmer" && landRegistrationNumber) {
          queryConditions.push(
            eq(users.landRegistrationNumber, landRegistrationNumber)
          );
        }

        existingUser = await db.query.users.findFirst({
          where: or(...queryConditions),
        });
      } catch (error) {
        return c.json(
          {
            status: RegistrationStatus.DATABASE_ERROR,
            message: `Database check failed: ${error}`,
          },
          500
        );
      }

      if (existingUser) {
        if (existingUser.email === email) {
          if (existingUser.emailVerified) {
            return c.json(
              {
                status: RegistrationStatus.EMAIL_ALREADY_REGISTERED,
                message: "Email is already registered and verified",
              },
              400
            );
          }
          return c.json(
            {
              status: RegistrationStatus.EMAIL_ALREADY_REGISTERED,
              message: "Email is already registered but not verified",
            },
            400
          );
        }

        if (existingUser.phone === phone) {
          return c.json(
            {
              status: RegistrationStatus.PHONE_ALREADY_REGISTERED,
              message: "Phone number is already in use",
            },
            400
          );
        }

        if (existingUser.aadhaar === aadhaar) {
          return c.json(
            {
              status: RegistrationStatus.AADHAAR_ALREADY_REGISTERED,
              message: "Aadhaar number is already registered",
            },
            400
          );
        }

        if (
          role === "farmer" &&
          existingUser.landRegistrationNumber === landRegistrationNumber
        ) {
          return c.json(
            {
              status: RegistrationStatus.LAND_REGISTRATION_ALREADY_USED,
              message: "Land registration number is already in use",
            },
            400
          );
        }
      }

      const hashedPassword = await new Argon2id().hash(password);

      let userId: string;
      try {
        if (!existingUser) {
          const result = await db
            .insert(users)
            .values({
              name: name,
              email: email,
              role: role,
              phone: phone,
              aadhaar: aadhaar,
              landRegistrationNumber:
                role === "farmer" ? landRegistrationNumber : null,
              address: address,
              hashedPassword: hashedPassword,
              emailVerified: false,
            })
            .returning({ insertedUserId: users.id });

          userId = result[0].insertedUserId;
        } else {
          userId = existingUser.id;
          await db
            .update(users)
            .set({
              name,
              phone,
              aadhaar,
              landRegistrationNumber:
                role === "farmer" ? landRegistrationNumber : null,
              address,
              hashedPassword,
              emailVerified: false,
            })
            .where(eq(users.id, userId));
        }
      } catch (error) {
        return c.json(
          {
            status: RegistrationStatus.DATABASE_ERROR,
            message: `User registration failed: ${error}`,
          },
          500
        );
      }

      let code: string;
      try {
        code = await generateEmailVerificationCode(userId, email);
        console.log(`Email verification code generated: ${code}`);
      } catch (error) {
        return c.json(
          {
            status: RegistrationStatus.VERIFICATION_CODE_GENERATION_FAILED,
            message: `Verification code generation failed: ${error}`,
          },
          500
        );
      }

      let success: boolean;
      try {
        success = await sendMail(email, EmailTemplate.EmailVerification, {
          code: code,
        });
        console.log(`Email sending attempt completed. Success: ${success}`);
      } catch (error) {
        return c.json(
          {
            status: RegistrationStatus.EMAIL_SEND_FAILED,
            message: `Email sending failed: ${error}`,
          },
          500
        );
      }

      if (!success) {
        return c.json({
          status: RegistrationStatus.EMAIL_SEND_FAILED,
          message: "Failed to send verification email",
        });
      }
      return c.json(
        {
          status: RegistrationStatus.SUCCESS,
          message: "Registration successful. Verification code sent.",
          userId,
        },
        200
      );
    } catch (error) {
      return c.json(
        {
          status: RegistrationStatus.UNEXPECTED_ERROR,
          message: `Unexpected error during registration: ${error}`,
        },
        500
      );
    }
  }
);
