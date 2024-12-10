import { pgEnum, pgTable, uuid } from "drizzle-orm/pg-core";

export const soilTypeEnum = pgEnum("soil_type", [
  "clay",
  "sandy",
  "loamy",
  "mixed",
]);

export const product = pgTable("product", {
  id: uuid("id").primaryKey().defaultRandom(),
});
