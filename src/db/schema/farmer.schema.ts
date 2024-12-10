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
  status: text("status").default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdate(
    () => new Date()
  ),
});

export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;
