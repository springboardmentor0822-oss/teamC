// ================= IMPORTS =================

const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const mongoose = require("mongoose");
const helmet = require("helmet");
const jwt = require("jsonwebtoken");

const http = require("http");
const { Server } = require("socket.io");

const notificationService =
require("./services/notificationService");

// routes
const authRoutes = require("./routes/authRoutes");
const petitionRoutes = require("./routes/petitionRoutes");
const officialRoutes = require("./routes/officialRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const userRoutes = require("./routes/userRoutes");
const pollRoutes = require("./routes/pollRoutes");
const reportsRoutes = require("./routes/reportsRoutes");
const path = require("path");

// ================= ENV =================

dotenv.config();

// ================= EXPRESS APP =================

const app = express();

// ================= HTTP SERVER =================

const server = http.createServer(app);

// ================= SOCKET.IO =================

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

app.set("io", io)

// ================= SOCKET AUTH CONNECTION =================

io.on("connection", (socket) => {

  try {

    const token = socket.handshake.auth?.token;

    if (!token) {
      socket.disconnect();
      return;
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    const userId = decoded.id;

    // ✅ JOIN ROOM NAMED AFTER USER
    socket.join(userId);

    console.log(
      "✅ User joined room:",
      userId
    );

    socket.on("disconnect", () => {
      console.log(
        "❌ Socket disconnected:",
        socket.id
      );
    });

  } catch (err) {

    console.log("❌ Socket auth failed");
    console.log("Error:", err.message);

    socket.disconnect();

  }

});
// ================= MIDDLEWARE =================

app.use(cors());
app.use(express.json());
app.use(
  helmet({
    crossOriginResourcePolicy: false
  }));

// ================= DATABASE =================

mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((error) => {
    console.error(
      "MongoDB Connection Failed:",
      error
    );
    process.exit(1);
  });

// ================= ROUTES =================

app.use("/api/auth", authRoutes);
app.use("/api/petitions", petitionRoutes);
app.use("/api/officials", officialRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/users", userRoutes);
app.use("/api/polls", pollRoutes);
app.use("/api/reports", reportsRoutes);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ================= HEALTH CHECK =================

app.get("/", (req, res) => {
  res.json({ message: "API running ✅" });
});

// ================= ERROR HANDLER =================

app.use((err, req, res, next) => {

  console.error(err);

  res.status(err.statusCode || 500)
     .json({
       message:
       err.message ||
       "Internal Server Error"
     });

});

// ================= START SERVER =================

const PORT =
process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(
    `🚀 Server running on port ${PORT}`
  );
});