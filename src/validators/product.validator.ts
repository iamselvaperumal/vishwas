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
  name: z.string(),
  farmSize: z.union([z.string(), z.number()]),
  expectedYield: z.union([z.string(), z.number().positive()]),
  harvestMonth: z.string(),
  harvestYear: z
    .union([z.string(), z.number()])
    .transform((year) => Number(year))
    .refine((year) => year >= currentYear, {
      message: `Must be the current year or later`,
    }),
  minimumPrice: z.union([z.string(), z.number().positive()]),
  contractDuration: contractDurationEnum.optional(),
  availableQuantity: z.union([z.string(), z.number().positive()]),
  soilType: soilTypeEnum,
  waterSource: waterSourceEnum,
  fertilizerType: fertilizerTypeEnum,
  pestManagement: pestManagementEnum,
  paymentMode: paymentModeEnum,
  deliveryMode: deliveryModeEnum,
  sellingMethod: sellingMethodEnum,
  status: z.string().default("active"),
});
