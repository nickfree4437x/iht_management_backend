import http from "http";
import app from "./src/app.js";
import prisma from "./src/config/prisma.js";
import { initSocket } from "./src/socket/index.js";

const PORT = process.env.PORT || 5000;

let server;

async function startServer() {
  try {
    // ✅ Connect DB
    await prisma.$connect();
    console.log("✅ PostgreSQL Database Connected");

    // ✅ Create HTTP server
    server = http.createServer(app);

    // ✅ Init Socket
    const io = initSocket(server);

    // (optional) global access
    global.io = io;

    // ✅ Start server
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

    // ❌ Handle server errors
    server.on("error", (err) => {
      console.error("❌ Server Error:", err);
      process.exit(1);
    });

  } catch (error) {
    console.error("❌ Database connection failed:", error);
    process.exit(1);
  }
}

/* ================= GLOBAL ERROR HANDLING ================= */

// 🔥 Unhandled Promise Rejection
process.on("unhandledRejection", (err) => {
  console.error("❌ Unhandled Rejection:", err);
  shutdown();
});

// 🔥 Uncaught Exception
process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err);
  shutdown();
});

/* ================= GRACEFUL SHUTDOWN ================= */

async function shutdown() {
  try {
    console.log("🛑 Shutting down server...");

    if (server) {
      server.close(() => {
        console.log("✅ HTTP server closed");
      });
    }

    await prisma.$disconnect();
    console.log("✅ Database disconnected");

    process.exit(0);
  } catch (err) {
    console.error("❌ Error during shutdown:", err);
    process.exit(1);
  }
}

// 🔥 Handle termination signals
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

/* ================= START ================= */

startServer();