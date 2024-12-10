import { OpenAPIHono } from "@hono/zod-openapi";
import { apiReference } from "@scalar/hono-api-reference";
import { getCookie } from "hono/cookie";
import { cors } from "hono/cors";
import { csrf } from "hono/csrf";

import { lucia } from "@/auth";

import { ContextVariables } from "@/types/hono";

import { authApp } from "./routes/auth";
import { productApp } from "./routes/product";
import { secretApp } from "./routes/secret";

const app = new OpenAPIHono<{ Variables: ContextVariables }>().basePath(
  "api/v1"
);

app.use(
  "/api/v1/*",
  cors({
    origin: "*",
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(csrf());

app.use("*", async (c, next) => {
  if (c.get("user") && c.get("session")) {
    return next();
  }

  const sessionId = getCookie(c, lucia.sessionCookieName) ?? null;
  if (!sessionId) {
    c.set("user", null);
    c.set("session", null);
    return next();
  }

  // Validate session and set cookies if needed
  const { session, user } = await lucia.validateSession(sessionId);
  if (session && session.fresh) {
    c.header("Set-Cookie", lucia.createSessionCookie(session.id).serialize(), {
      append: true,
    });
  } else if (!session) {
    c.header("Set-Cookie", lucia.createBlankSessionCookie().serialize(), {
      append: true,
    });
  }

  c.set("user", user);
  c.set("session", session);

  return next();
});

app.doc31("api/v1/swagger.json", {
  openapi: "3.1.0",
  info: { title: "Vishwas", version: "1.0.0" },
});

app.get(
  "/scalar",
  apiReference({
    spec: {
      url: "api/v1/swagger.json",
    },
  })
);

const routes = app
  .route("/", authApp)
  .route("/", productApp)
  .route("/", secretApp);

export type AppType = typeof routes;

export { app };
