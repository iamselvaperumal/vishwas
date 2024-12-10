import { z } from "zod";

// Enums
export const soilTypeEnum = z.enum(["clay", "sandy", "loamy", "mixed"]);
export const sellingMethodEnum = z.enum(["direct", "contract", "auction"]);
export const fertilizerTypeEnum = z.enum(["organic", "chemical", "both"]);
export const pestManagementEnum = z.enum(["organic", "chemical", "none"]);
export const transactionStatusEnum = z.enum([
  "pending_approval",
  "approved",
  "rejected",
  "payment_pending",
  "completed",
  "cancelled",
]);
export const contractDurationEnum = z.enum(["short-term", "long-term"]);
export const waterSourceEnum = z.enum([
  "borewell",
  "rainwater",
  "canal",
  "river",
]);
export const paymentModeEnum = z.enum(["online", "cash"]);
export const deliveryModeEnum = z.enum(["pickup", "delivery"]);

const currentYear = new Date().getFullYear();

export const productSchema = z.object({
  name: z.string().min(1, { message: "Product name is required" }),
  farmSize: z
    .union([
      z
        .string()
        .refine((val) => val.trim() !== "", "Farm size cannot be empty"),
      z.number().positive("Farm size must be a positive number"),
    ])
    .transform((val) => (typeof val === "string" ? parseFloat(val) : val))
    .refine((val) => !isNaN(val), "Invalid farm size"),
  expectedYield: z
    .union([
      z
        .string()
        .refine((val) => val.trim() !== "", "Expected yield cannot be empty"),
      z.number().positive("Expected yield must be a positive number"),
    ])
    .transform((val) => (typeof val === "string" ? parseFloat(val) : val))
    .refine((val) => !isNaN(val), "Invalid expected yield"),
  harvestMonth: z.string().min(1, { message: "Harvest month is required" }),
  harvestYear: z
    .union([z.string(), z.number()])
    .transform((year) => Number(year))
    .refine((year) => year >= currentYear, {
      message: `Must be the current year or later`,
    }),
  minimumPrice: z
    .union([
      z
        .string()
        .refine((val) => val.trim() !== "", "Minimum price cannot be empty"),
      z.number().positive("Minimum price must be a positive number"),
    ])
    .transform((val) => (typeof val === "string" ? parseFloat(val) : val))
    .refine((val) => !isNaN(val), "Invalid minimum price"),
  contractDuration: contractDurationEnum.optional(),
  availableQuantity: z
    .union([
      z
        .string()
        .refine(
          (val) => val.trim() !== "",
          "Available quantity cannot be empty"
        ),
      z.number().positive("Available quantity must be a positive number"),
    ])
    .transform((val) => (typeof val === "string" ? parseFloat(val) : val))
    .refine((val) => !isNaN(val), "Invalid available quantity"),
  soilType: soilTypeEnum,
  waterSource: waterSourceEnum,
  fertilizerType: fertilizerTypeEnum,
  pestManagement: pestManagementEnum,
  paymentMode: paymentModeEnum,
  deliveryMode: deliveryModeEnum,
  sellingMethod: sellingMethodEnum,
});
