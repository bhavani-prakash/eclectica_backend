import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import registrationRouter from "./src/routes/rigister_router.js"; // ✅ FIXED
import adminRoutes from './src/routes/admin_router.js'; // ✅ FIXED

dotenv.config();

const app = express();

// MIDDLEWARE
app.use(cors({
  origin: "https://eclectica2k26-registration.netlify.app/",  
  credentials: true // React (Vite)
}));
app.use(express.json());

// ROUTES
app.use("/api", registrationRouter);
app.use('/admin', adminRoutes);
app.get("/", (req, res) => {
  res.send("Welcome to the ECLECTICA 2K26 Registration API");
});


// TEST ROUTE
app.get("/test", (req, res) => {
  res.json({ message: "Backend working" });
});

// Global error handler - ensure errors are returned as JSON (helps frontend)
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    message: err.message || 'Internal Server Error',
    // include error details only in development
    ...(process.env.NODE_ENV === 'development' ? { error: err } : {}),
  });
});
// MONGODB CONNECTION + SERVER START
const PORT = 5000;

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
