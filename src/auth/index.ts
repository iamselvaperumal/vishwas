import { type User as DbUser, sessions, users } from "@/db/schema";

import db from "@/db";
import { DrizzlePostgreSQLAdapter } from "@lucia-auth/adapter-drizzle";
import { Lucia, TimeSpan } from "lucia";

const adapter = new DrizzlePostgreSQLAdapter(db, sessions, users);

export const lucia = new Lucia(adapter, {
  sessionExpiresIn: new TimeSpan(30, "d"),
  sessionCookie: {
    name: "vishwas-session",
    expires: false,
    attributes: {
      secure: true,
    },
  },
  getSessionAttributes: (/* attributes */) => {
    return {};
  },
  getUserAttributes: (attributes) => {
    return {
      id: attributes.id,
      name: attributes.name,
      phone: attributes.phone,
      aadhaar: attributes.aadhaar,
      role: attributes.role,
      landRegistrationNumber: attributes.landRegistrationNumber,
      address: attributes.address,
      email: attributes.email,
      emailVerified: attributes.emailVerified,
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
