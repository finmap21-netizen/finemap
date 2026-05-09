import path from "node:path";
import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";

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
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

const frontendPath = path.join(process.cwd(), "artifacts/sme-tax/dist/public");
app.use(express.static(frontendPath));

app.use("/api", router);

// Handle client-side routing
app.get("/*all", (req, res) => {
  if (req.path.startsWith("/api")) return;
  res.sendFile(path.join(frontendPath, "index.html"));
});

export default app;
