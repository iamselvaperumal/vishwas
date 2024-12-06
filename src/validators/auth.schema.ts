import { z } from "zod";

export const registrationSchema = z
  .object({
    name: z
      .string()
      .min(2, { message: "Name must be at least 2 characters long" }),
    email: z.string().email({ message: "Please enter a valid email address" }),
    role: z.enum(["farmer", "consumer"]),
    phone: z
      .string()
      .regex(/^\d+$/, { message: "Phone number must contain only digits" })
      .min(10, { message: "Phone number must be 10 digits long" })
      .max(10, { message: "Phone number must be 10 digits long" }),
    aadhaar: z
      .string()
      .regex(/^\d+$/, { message: "Invalid Aadhaar ID" })
      .min(12, { message: "Aadhaar ID must be 12 digits long" })
      .max(12, { message: "Aadhaar ID must be 12 digits long" }),
    landRegistrationNumber: z
      .string()
      .min(10, { message: "Invalid Land Registration Number" }),
    address: z
      .string()
      .min(20, { message: "Address must be at least 20 characters long" }),
    password: z
      .string()
      .min(6, { message: "Password must be at least 8 characters long" }),
    confirmPassword: z
      .string()
      .min(6, { message: "Please confirm your password" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Password and confirmation password do not match",
    path: ["confirmPassword"],
  });

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
