import { type User as DbUser, sessions, users } from "@/db/schema";

import db from "@/db";
import { DrizzlePostgreSQLAdapter } from "@lucia-auth/adapter-drizzle";
import { Lucia, TimeSpan } from "lucia";

import { env } from "@/utils/env.mjs";

const adapter = new DrizzlePostgreSQLAdapter(db, sessions, users);

export const lucia = new Lucia(adapter, {
  sessionExpiresIn: new TimeSpan(30, "d"),
  sessionCookie: {
    name: "vishwas-session",
    expires: false,
    attributes: {
      secure: env.NODE_ENV === "production",
    },
  },
  getSessionAttributes: (/* attributes */) => {
    return {};
  },
  getUserAttributes: (attributes) => {
    return {
      id: attributes.id,
      email: attributes.email,
      emailVerified: attributes.emailVerified,
      userApproved: attributes.userApproved,
      avatar: attributes.avatar,
      createdAt: attributes.createdAt,
      updatedAt: attributes.updatedAt,
    };
  },
});

declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
    DatabaseSessionAttributes: DatabaseSessionAttributes;
    DatabaseUserAttributes: DatabaseUserAttributes;
  }
}

interface DatabaseSessionAttributes {}
interface DatabaseUserAttributes extends Omit<DbUser, "hashedPassword"> {}
