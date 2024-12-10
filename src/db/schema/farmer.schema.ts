import { PurchaseRequestData } from "@/types/farmer";
import { eq } from "drizzle-orm";
import {
  decimal,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { users } from "./user.schema";

export const soilTypeEnum = pgEnum("soil_type", [
  "clay",
  "sandy",
  "loamy",
  "mixed",
]);

export const sellingMethodEnum = pgEnum("selling_method", [
  "direct",
  "contract",
  "auction",
]);

export const fertilizerTypeEnum = pgEnum("fertilizer_type", [
  "organic",
  "chemical",
  "both",
]);

export const pestManagementEnum = pgEnum("pest_management", [
  "organic",
  "chemical",
  "none",
]);

export const transactionStatusEnum = pgEnum("transaction_status", [
  "pending_approval",
  "approved",
  "rejected",
  "payment_pending",
  "completed",
  "cancelled",
]);

export const contractDurationEnum = pgEnum("contract_duration", [
  "short-term",
  "long-term",
]);

export const waterSourceEnum = pgEnum("water_source", [
  "borewell",
  "rainwater",
  "canal",
  "river",
]);

export const paymentModeEnum = pgEnum("payment_mode", ["online", "direct"]);

export const deliveryModeEnum = pgEnum("delivery_mode", ["pickup", "delivery"]);

export const products = pgTable(
  "products",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .references(() => users.id)
      .notNull(),
    name: text("name").notNull(),
    farmSize: decimal("farm_size", { precision: 10, scale: 2 }).notNull(),
    expectedYield: decimal("expected_yield", { precision: 10, scale: 2 }),
    harvestMonth: text("harvest_month"),
    harvestYear: integer("harvest_year"),
    minimumPrice: decimal("minimum_price", {
      precision: 10,
      scale: 2,
    }).notNull(),
    contractDuration: contractDurationEnum("contract_duration"),
    availableQuantity: text("available_quantity").notNull(),
    soilType: soilTypeEnum("soil_type").notNull(),
    waterSource: waterSourceEnum("water_source").notNull(),
    fertilizerType: fertilizerTypeEnum("fertilizer_type").notNull(),
    pestManagement: pestManagementEnum("pest_management").notNull(),
    paymentMode: paymentModeEnum("payment_mode").notNull(),
    deliveryMode: deliveryModeEnum("delivery_mode").notNull(),
    sellingMethod: sellingMethodEnum("selling_method").notNull(),
    status: text("status").default("active"),
  },
  (table) => ({
    productIdx: index("product_idx").on(table.id),
    userIdx: index("user_idx").on(table.userId),
  })
);

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;

export const transactions = pgTable("transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  listingId: uuid("listing_id")
    .references(() => products.id)
    .notNull(),
  sellerId: uuid("seller_id")
    .references(() => users.id)
    .notNull(),
  buyerId: uuid("buyer_id")
    .references(() => users.id)
    .notNull(),
  quantity: decimal("quantity", { precision: 10, scale: 2 }).notNull(),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
  status: transactionStatusEnum("status").default("pending_approval"),
  buyerMessage: text("buyer_message"),
  farmerNote: text("farmer_note"),
  requestedAt: timestamp("requested_at").defaultNow().notNull(),
  approvedAt: timestamp("approved_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdate(
    () => new Date()
  ),
});

export const transactionMethods = {
  createPurchaseRequest: async (
    client: PostgresJsDatabase,
    data: PurchaseRequestData
  ) => {
    return client.insert(transactions).values({
      ...data,
      status: (data.status ?? "pending_approval") as any,
      requestedAt: new Date(),
      createdAt: new Date(),
    } as any);
  },

  approvePurchase: async (
    client: PostgresJsDatabase,
    transactionId: string
  ) => {
    return client
      .update(transactions)
      .set({
        status: "approved",
        approvedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(transactions.id, transactionId));
  },

  rejectPurchase: async (client: PostgresJsDatabase, transactionId: string) => {
    return client
      .update(transactions)
      .set({
        status: "rejected",
        approvedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(transactions.id, transactionId));
  },

  completeTransaction: async (
    client: PostgresJsDatabase,
    transactionId: string
  ) => {
    return client
      .update(transactions)
      .set({
        status: "completed",
        completedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(transactions.id, transactionId));
  },
};

export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;
