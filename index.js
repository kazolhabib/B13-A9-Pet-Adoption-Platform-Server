require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require('mongodb');
const cookieParser = require("cookie-parser");

const authRoutes = require("./routes/auth");
const petRoutes = require("./routes/pets");
const requestRoutes = require("./routes/requests");

// const uri = "mongodb+srv://kazollhabibb_db_user:<db_password>@cluster0.pv9fbcf.mongodb.net/?appName=Cluster0";

const app = express();

// CORS Configuration — read allowed origins from env
const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(",").map(s => s.trim())
  : ["http://localhost:3000", "http://localhost:5173"];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api", authRoutes);
app.use("/api/pets", petRoutes);
app.use("/api/requests", requestRoutes);

// Database Connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB successfully!");
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
  });

// Root Route
app.get("/", (req, res) => {
  res.send("Pet Adoption Platform API is running...");
});
