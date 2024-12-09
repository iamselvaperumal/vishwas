import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { sessions } from "./session.schema";

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name"),
    email: text("email").unique().notNull(),
    phone: text("phone").unique(),
    aadhaar: text("aadhaar_number").unique(),
    landRegistrationNumber: text("land_registration_number"),
    address: text("address"),
    role: text("role").default("farmer"),
    emailVerified: boolean("email_verified").default(false).notNull(),
    hashedPassword: text("hashed_password"),
    avatar: text("avatar"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdate(
      () => new Date()
    ),
  },
  (t) => ({
    emailIdx: index("user_email_idx").on(t.email),
  })
);

export const usersRelations = relations(users, ({ one, many }) => ({
  sessions: many(sessions),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
