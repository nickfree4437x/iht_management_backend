import prisma from "../../config/prisma.js";
import { getIO } from "../../socket/index.js";

// =========================
// 📥 GET ALL ACTIVITIES
// =========================
export const getAllActivities = async (req, res, next) => {
  try {
    const {
      limit = 20,
      type,
      entityType,
      startDate,
      endDate,
    } = req.query;

    const filters = {};

    if (type) filters.type = type;
    if (entityType) filters.entityType = entityType;

    if (startDate && endDate) {
      filters.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const activities = await prisma.activityLog.findMany({
      where: filters,
      orderBy: { createdAt: "desc" },
      take: parseInt(limit),
    });

    res.json({
      success: true,
      count: activities.length,
      activities,
    });
  } catch (error) {
    next(error);
  }
};

// =========================
// 🔔 GENERATE NOTIFICATIONS
// =========================
const generateNotifications = async () => {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const [
    todayTours,
    failedLogins,
    missingDrivers,
    missingHotels,
  ] = await Promise.all([
    // ✅ Tours starting today
    prisma.tour.count({
      where: {
        startDate: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
    }),

    // ✅ Failed logins
    prisma.loginActivity.count({
      where: { status: "failed" },
    }),

    // ✅ DRIVER LOGIC (FINAL FIX)
    prisma.tour.count({
      where: {
        AND: [
          { driverId: null },
          {
            transports: {
              none: {}, // ❌ no transport = no driver
            },
          },
        ],
      },
    }),

    // ✅ HOTEL LOGIC (FINAL FIX - NO PRISMA ERROR)
    prisma.tour.count({
      where: {
        AND: [
          { hotelId: null },
          {
            itineraries: {
              none: {
                AND: [
                  { hotel: { not: null } },
                  { hotel: { not: "" } },
                ],
              },
            },
          },
        ],
      },
    }),
  ]);

  // 🔥 Stable Notification Creator
  const createNotification = (id, type, message) => ({
    id,
    type,
    message,
    isRead: false,
    createdAt: new Date(),
  });

  const notifications = [];

  if (todayTours > 0) {
    notifications.push(
      createNotification(
        "todayTours",
        "info",
        `${todayTours} tours starting today`
      )
    );
  }

  if (missingDrivers > 0) {
    notifications.push(
      createNotification(
        "missingDrivers",
        "warning",
        `${missingDrivers} tours need driver assignment`
      )
    );
  }

  if (missingHotels > 0) {
    notifications.push(
      createNotification(
        "missingHotels",
        "warning",
        `${missingHotels} tours need hotel assignment`
      )
    );
  }

  if (failedLogins > 0) {
    notifications.push(
      createNotification(
        "failedLogins",
        "danger",
        `${failedLogins} failed login attempts`
      )
    );
  }

  return notifications;
};

// =========================
// 🔔 GET NOTIFICATIONS
// =========================
export const getRealtimeNotifications = async (req, res, next) => {
  try {
    const notifications = await generateNotifications();

    res.json({
      success: true,
      notifications,
    });
  } catch (error) {
    next(error);
  }
};

// =========================
// 🔴 BROADCAST ACTIVITY
// =========================
export const broadcastActivity = async (req, res, next) => {
  try {
    const {
      type,
      message,
      entityId,
      entityType,
      performedBy = "Team Member",
      meta = {},
    } = req.body;

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

    const io = getIO();

    // 🔥 Activity emit
    io.emit("newActivity", activity);

    // 🔥 Notification emit
    io.emit("newNotification", {
      id: `activity-${Date.now()}`,
      type,
      message,
      isRead: false,
      createdAt: new Date(),
    });

    res.json({
      success: true,
      message: "Activity broadcasted",
      activity,
    });
  } catch (error) {
    next(error);
  }
};

// =========================
// 📊 DASHBOARD STATS
// =========================
export const getRealtimeStats = async (req, res, next) => {
  try {
    const today = new Date();

    const totalTours = await prisma.tour.count();

    const upcomingTours = await prisma.tour.count({
      where: { startDate: { gte: today } },
    });

    const totalAdvisors = await prisma.advisor.count();
    const totalDrivers = await prisma.driver.count();
    const totalHotels = await prisma.hotel.count();

    const latestActivities = await prisma.activityLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    res.json({
      success: true,
      stats: {
        totalTours,
        upcomingTours,
        totalAdvisors,
        totalDrivers,
        totalHotels,
      },
      latestActivities,
    });
  } catch (error) {
    next(error);
  }
};

// =========================
// 🧹 CLEAR ACTIVITIES
// =========================
export const clearAllActivities = async (req, res, next) => {
  try {
    await prisma.activityLog.deleteMany();

    const io = getIO();
    io.emit("activitiesCleared");

    res.json({
      success: true,
      message: "All activities cleared",
    });
  } catch (error) {
    next(error);
  }
};