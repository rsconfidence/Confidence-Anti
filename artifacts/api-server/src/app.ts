import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import router from "./routes";
import { logger } from "./lib/logger";
import { UPLOAD_DIR } from "./routes/upload";

const PgSession = connectPgSimple(session);

declare module "express-session" {
  interface SessionData {
    adminAuthenticated?: boolean;
  }
}

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    store: new PgSession({
      conString: process.env.DATABASE_URL,
      // The session table is managed by the application database schema.
      // connect-pg-simple's bundled table.sql is not available after esbuild
      // bundles the API into dist/index.mjs.
      createTableIfMissing: false,
      tableName: "session",
    }),
    secret: process.env.SESSION_SECRET ?? "dev-fallback-secret-change-me",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      secure: process.env.NODE_ENV === "production",
    },
  }),
);

// Serve uploaded files
app.use("/api/uploads", express.static(UPLOAD_DIR));

app.use("/api", router);

export default app;
