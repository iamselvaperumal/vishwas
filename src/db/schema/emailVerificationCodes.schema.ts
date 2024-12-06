import { relations } from "drizzle-orm";
import {
  index,
  pgTable,
  serial,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { users } from "./user.schema";

export const emailVerificationCodes = pgTable(
  "email_verification_codes",
  {
    id: serial("id").primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    email: text("email").unique().notNull(),
    code: text("code").notNull(),
    expiresAt: timestamp("expires_at", {
      withTimezone: true,
      mode: "date",
    }).notNull(),
  },
  (t) => ({
    userIdx: index("verification_code_user_idx").on(t.userId),
    emailIdx: index("verification_code_email_idx").on(t.email),
  })
);

export const emailVerificationCodesRelations = relations(
  emailVerificationCodes,
  ({ one }) => ({
    user: one(users, {
      fields: [emailVerificationCodes.userId],
      references: [users.id],
    }),
  })
);

export type EmailVerificationCode = typeof emailVerificationCodes.$inferSelect;
export type NewEmailVerificationCode =
  typeof emailVerificationCodes.$inferInsert;
