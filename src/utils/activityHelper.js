import prisma from "../config/prisma.js";
import { getIO } from "../socket/index.js";

/**
 * 🔥 Create activity log + emit real-time event
 */
export const createActivityAndEmit = async ({
  type,
  message,
  tourId,
  performedBy = "System",
}) => {
  try {
    if (!tourId) {
      console.warn("⚠️ Missing tourId in activity helper");
      return null;
    }

    // ✅ 1. Create Activity Log
    const activity = await prisma.activityLog.create({
      data: {
        type,
        message,
        tourId,
        performedBy,
      },
    });

    // ✅ 2. Emit via socket (room-based)
    try {
      const io = getIO();

      io.to(tourId).emit("new-activity", {
        id: activity.id,
        type: activity.type,
        message: activity.message,
        createdAt: activity.createdAt,
        performedBy: activity.performedBy,
      });
    } catch (socketError) {
      console.error("⚠️ Socket emit failed:", socketError.message);
    }

    return activity;

  } catch (error) {
    console.error("❌ Activity Helper Error:", error);
    return null;
  }
};