import prisma from "../config/prisma.js";

export const logActivity = async ({
  type,
  message,
  entityId = null,
  entityType = null,
  performedBy = "Team Member",
  meta = {},
}) => {
  try {
    // ✅ 1. Save to DB
    const activity = await prisma.activityLog.create({
      data: {
        type,
        message,
        entityId,
        entityType,
        performedBy,
        meta,
      },
    });

    // ✅ 2. Emit via socket (REAL-TIME)
    if (global.io) {
      global.io.emit("newActivity", activity);
    }

    return activity;
  } catch (error) {
    console.error("Activity Log Error:", error);
  }
};