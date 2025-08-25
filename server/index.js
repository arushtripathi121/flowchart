require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");

const flowchartRoutes = require("./routes/flowchart");
const authRoutes = require("./routes/auth");
const diagramRoutes = require("./routes/diagramRoutes");
const errorHandler = require("./middleware/errorHandler");

const app = express();
const PORT = process.env.PORT || 3000;

// Allowed origins (no trailing slash!)
const CLIENT_URL = process.env.CLIENT_URL || "https://flowchartaiar.vercel.app";

app.use(
    cors({
        origin: function (origin, callback) {
            // allow requests with no origin (like mobile apps, curl)
            if (!origin || origin === CLIENT_URL) {
                callback(null, true);
            } else {
                callback(new Error("Not allowed by CORS"));
            }
        },
        credentials: true, // allow cookies to be sent
    })
);

app.use(cookieParser());
app.use(express.json({ limit: process.env.JSON_LIMIT || "10mb" }));
app.use(express.urlencoded({ extended: true }));

// MongoDB connection
mongoose
    .connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.error("MongoDB connection error:", err));

// Base route
app.get("/", (req, res) => {
    res.json({
        message: "Flowchart Generator API",
        version: "1.0.0",
        endpoints: {
            generateFlowchart: "POST /api/flowchart/generate",
            login: "POST /api/auth/google",
            verify: "GET /api/auth/verify",
            logout: "POST /api/auth/logout",
        },
    });
});

// Routes
app.use("/api/flowchart", flowchartRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/diagrams", diagramRoutes);

// Error handler
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
    console.log(
        `Server running on ${process.env.SERVER_URL || "http://localhost:" + PORT}`
    );
});
