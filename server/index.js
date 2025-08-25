require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");

const flowchartRoutes = require("./routes/flowchart");
const authRoutes = require("./routes/auth");
const errorHandler = require("./middleware/errorHandler");
const diagramRoutes = require('./routes/diagramRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(
    cors({
        origin: process.env.CLIENT_URL,
        credentials: true,
    })
);
app.use(cookieParser());
app.use(express.json({ limit: process.env.JSON_LIMIT || "10mb" }));
app.use(express.urlencoded({ extended: true }));

mongoose
    .connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.error("MongoDB connection error:", err));

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

app.use("/api/flowchart", flowchartRoutes);
app.use("/api/auth", authRoutes);
app.use('/api/diagrams', diagramRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server running on ${process.env.SERVER_URL || "http://localhost:" + PORT}`);
});
