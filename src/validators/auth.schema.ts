import { z } from "zod";

export const registrationSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, { message: "Name must be at least 2 characters long" })
      .max(100, { message: "Name must be less than 100 characters" }),
    email: z
      .string()
      .trim()
      .email({ message: "Please enter a valid email address" }),
    role: z.enum(["farmer", "consumer"], {
      errorMap: () => ({ message: "Please select a role" }),
    }),
    phone: z
      .string()
      .trim()
      .regex(/^\d+$/, { message: "Phone number must contain only digits" })
      .length(10, { message: "Phone number must be exactly 10 digits long" }),
    aadhaar: z
      .string()
      .trim()
      .regex(/^\d+$/, { message: "Aadhaar number must contain only digits" })
      .length(12, { message: "Aadhaar number must be exactly 12 digits long" }),
    landRegistrationNumber: z
      .union([
        z.string().trim().min(10, {
          message:
            "Land registration number must be at least 10 characters long",
        }),
        z.literal(""), // Allow empty string for non-farmers
      ])
      .optional(),
    address: z
      .string()
      .trim()
      .min(20, { message: "Address must be at least 20 characters long" })
      .max(500, { message: "Address must be less than 500 characters" }),
    password: z
      .string()
      .trim()
      .min(6, { message: "Password must be at least 6 characters long" }),
    confirmPassword: z.string().trim().min(6, {
      message: "Confirmation password must be at least 6 characters long",
    }),
  })
  .superRefine((data, ctx) => {
    // Validate land registration number for farmers
    if (data.role === "farmer") {
      const landRegNumber = data.landRegistrationNumber;
      if (!landRegNumber || landRegNumber.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Land registration number is required for farmers",
          path: ["landRegistrationNumber"],
        });
      }
    }

    // Validate password match
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Password and confirmation password do not match",
        path: ["confirmPassword"],
      });
    }
  });

// Infer the TypeScript type for the schema
export type RegistrationFormData = z.infer<typeof registrationSchema>;

export const verificationCodeSchema = z.object({
  email: z.string().email().optional(),
  verificationCode: z.string().regex(/^\d{6}$/, {
    message: "Verification code should only contain digits.",
  }),
});

export const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long" })
    .max(32, { message: "Password can be 32 characters maximum" }),
});

export const resetSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, { message: "Token required" }),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters long" }),
    confirmPassword: z
      .string()
      .min(8, { message: "Please confirm your password" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Password and confirmation password do not match",
    path: ["confirmPassword"],
  });
