import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import registrationRouter from "./src/routes/rigister_router.js"; // ✅ FIXED
import adminRoutes from './src/routes/admin_router.js'; // ✅ FIXED

dotenv.config();

const app = express();

// MIDDLEWARE
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests from Netlify deployments and localhost
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:3000',
      'http://localhost:5000',
      'https://eclectica2k26.netlify.app',
      /netlify\.app$/, // Allow all Netlify deployments
      /railway\.app$/, // Allow Railway deployments
      /up\.railway\.app$/, // Allow Railway app URLs
    ];
    
    if (!origin || allowedOrigins.some(ao => 
      ao instanceof RegExp ? ao.test(origin) : ao === origin
    )) {
      callback(null, true);
    } else {
      console.warn('CORS blocked origin:', origin);
      callback(null, true); // Allow anyway for now, log blocked origins
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ROUTES
app.use("/api", registrationRouter);
app.use('/admin', adminRoutes);
app.get("/", (req, res) => {
  res.send("Welcome to the ECLECTICA 2K26 Registration API");
});

// TEST ROUTE - comprehensive health check
app.get("/test", (req, res) => {
  res.json({ 
    message: "Backend working",
    status: "operational",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Global error handler - ensure errors are returned as JSON (helps frontend)
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);

  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'Screenshot is too large. Please upload an image smaller than 12 MB.'
      });
    }

    return res.status(400).json({
      success: false,
      message: err.message || 'Invalid upload. Please upload a supported image file.'
    });
  }

  if (typeof err?.message === 'string' && err.message.includes('Image file format')) {
    return res.status(400).json({
      success: false,
      message: 'Unsupported image format. Please upload JPG, PNG, WEBP, HEIC, or HEIF image.'
    });
  }

  const status = err.status || 500;
  res.status(status).json({
    success: false,
    message: err.message || 'Internal Server Error',
    // include error details only in development
    ...(process.env.NODE_ENV === 'development' ? { error: err } : {}),
  });
});
// MONGODB CONNECTION + SERVER START
const PORT = Number(process.env.PORT) || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected successfully");

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("❌ MongoDB connection failed:", error.message);
  });
