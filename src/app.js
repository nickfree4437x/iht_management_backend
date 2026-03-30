import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import errorHandler from "./middleware/errorHandler.js";
import loadRoutes from "./loaders/routes.loader.js";

dotenv.config();

const app = express();

/* -----------------------------
   Middlewares
------------------------------*/
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());

/* -----------------------------
   Static files
------------------------------*/
app.use("/uploads", express.static("uploads"));

/* -----------------------------
   Routes (🔥 CLEAN)
------------------------------*/
loadRoutes(app);

/* -----------------------------
   Test Route
------------------------------*/
app.get("/api/v1", (req, res) => {
  res.json({
    message: "Travel Agency API v1 running",
  });
});

/* -----------------------------
   Error Handler
------------------------------*/
app.use(errorHandler);

export default app;