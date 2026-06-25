import path from "path";
import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";
import hpp from "hpp";

import connectDB from "./config/db.js";

import productRoutes from "./routes/productRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";

import {
  notFound,
  errorHandler,
} from "./middleware/errorMiddleware.js";

dotenv.config();

connectDB();

const app = express();

const port = process.env.PORT || 5000;

const __dirname = path.resolve();

// =====================================
// TRUST PROXY
// IMPORTANT FOR DEPLOYMENT
// =====================================

app.set("trust proxy", 1);

// =====================================
// SECURITY
// =====================================

app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

app.use(mongoSanitize());

app.use(hpp());

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    message: "Too many requests. Try again later.",
  })
);

// =====================================
// BODY PARSERS
// =====================================

app.use(
  express.json({
    limit: "10mb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "10mb",
  })
);

app.use(cookieParser());

// =====================================
// CORS
// Supports Vite ports also
// =====================================

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3002",
  "http://localhost:3003",
  "http://localhost:5173",
  "http://localhost:5174",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(
        new Error(`CORS blocked for origin: ${origin}`)
      );
    },
    credentials: true,
  })
);

// =====================================
// HEALTH CHECK
// =====================================

app.get("/", (req, res) => {
  res.send("API is running...");
});

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is healthy",
    environment: process.env.NODE_ENV,
    time: new Date().toISOString(),
  });
});

// =====================================
// API ROUTES
// =====================================

app.use("/api/products", productRoutes);

app.use("/api/users", userRoutes);

app.use("/api/orders", orderRoutes);

app.use("/api/cart", cartRoutes);

app.use("/api/upload", uploadRoutes);

// =====================================
// RAZORPAY CONFIG
// =====================================

app.get("/api/config/razorpay", (req, res) => {
  res.send({
    key: process.env.RAZORPAY_KEY_ID,
  });
});

// =====================================
// STATIC UPLOADS FOLDER
// Only useful if you also use local uploads
// Cloudinary images do not need this
// =====================================

app.use(
  "/uploads",
  express.static(
    path.join(__dirname, "/uploads")
  )
);

// =====================================
// ERROR HANDLER
// =====================================

app.use(notFound);

app.use(errorHandler);

// =====================================
// START SERVER
// =====================================

app.listen(port, () => {
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${port}`
  );
});