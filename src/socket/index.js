import { Server } from "socket.io";

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("🔌 User connected:", socket.id);

    // 🔥 JOIN TOUR ROOM
    socket.on("join-tour", (tourId) => {
      socket.join(tourId);
      console.log(`✅ Socket ${socket.id} joined tour: ${tourId}`);
    });

    // 🔥 LEAVE TOUR ROOM (optional)
    socket.on("leave-tour", (tourId) => {
      socket.leave(tourId);
      console.log(`🚪 Socket ${socket.id} left tour: ${tourId}`);
    });

    socket.on("disconnect", () => {
      console.log("❌ User disconnected:", socket.id);
    });
  });

  return io;
};

// 🔥 access anywhere
export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};
