import prisma from "../../config/prisma.js";

// =========================
// 🔥 CLIENT RECENT ACTIVITIES (UNCHANGED ✅)
// =========================
export const getClientActivities = async (req, res, next) => {
  try {
    const { tourId } = req.params;
    const { limit = 10 } = req.query;

    if (!tourId) {
      return res.status(400).json({
        success: false,
        message: "Tour ID is required",
      });
    }

    const activities = await prisma.activityLog.findMany({
      where: { tourId },
      orderBy: {
        createdAt: "desc",
      },
      take: Number(limit),
    });

    const formattedActivities = activities.map((act) => ({
      id: act.id,
      type: act.type || "default",
      message: act.message,
      createdAt: act.createdAt,
      performedBy: act.performedBy || "System",
    }));

    res.json({
      success: true,
      activities: formattedActivities,
    });

  } catch (error) {
    console.error("❌ CLIENT ACTIVITIES ERROR:", error);
    next(error);
  }
};

// =========================
// 🔥 CLIENT DASHBOARD ANALYTICS (UPDATED REAL ✅)
// =========================
export const getClientDashboardAnalytics = async (req, res, next) => {
  try {
    const { tourId } = req.params;

    if (!tourId) {
      return res.status(400).json({
        success: false,
        message: "Tour ID is required",
      });
    }

    // =========================
    // ✅ TOUR
    // =========================
    const tour = await prisma.tour.findUnique({
      where: { id: tourId },
    });

    // =========================
    // ✅ PAYMENTS
    // =========================
    const payments = await prisma.payment.findMany({
      where: { tourId },
    });

    const totalPaid = payments.reduce(
      (sum, p) => sum + (p.amount || 0),
      0
    );

    // =========================
    // ✅ TICKETS
    // =========================
    let tickets = [];
    if (prisma.travelTicket) {
      tickets = await prisma.travelTicket.findMany({
        where: { tourId },
      });
    }

    const hasTicket = tickets.length > 0;

    // =========================
    // ✅ ITINERARY
    // =========================
    const itinerary = await prisma.itinerary.findMany({
      where: { tourId },
      orderBy: { date: "asc" },
    });

    const totalDays = itinerary.length;
    const today = new Date();

    const completedDays = itinerary.filter(
      (d) => new Date(d.date) < today
    ).length;

    const remainingDays = Math.max(0, totalDays - completedDays);

    const tripProgressPercent = totalDays
      ? Math.min(100, (completedDays / totalDays) * 100)
      : 0;

    // =========================
    // 🔥 ACTIVITY COUNT (REAL SOURCE)
    // =========================
    const activityLogs = await prisma.activityLog.findMany({
      where: { tourId },
      select: { createdAt: true },
    });

    const totalActivities = activityLogs.length;

    const avgActivitiesPerDay = totalDays
      ? Number((totalActivities / totalDays).toFixed(1))
      : 0;

    // =========================
    // 🔥 REAL DATE-WISE GROUPING
    // =========================
    const activityMap = {};

    activityLogs.forEach((log) => {
      const dateKey = new Date(log.createdAt).toLocaleDateString();

      activityMap[dateKey] = (activityMap[dateKey] || 0) + 1;
    });

    // =========================
    // 🔥 MAP WITH ITINERARY (0 fallback)
    // =========================
    const activityTrend = itinerary.map((day) => {
      const dateKey = new Date(day.date).toLocaleDateString();

      return {
        date: dateKey,
        count: activityMap[dateKey] || 0,
      };
    });

    // =========================
    // 🔥 BUSIEST DAY (REAL)
    // =========================
    let busiestDay = null;

    if (activityTrend.length > 0) {
      busiestDay = activityTrend.reduce((max, curr) =>
        curr.count > max.count ? curr : max
      );
    }

    // =========================
    // ✅ TIMELINE (UNCHANGED)
    // =========================
    const now = new Date();

    const timeline = {
      booked: !!tour,
      payment: totalPaid > 0,
      ticket: hasTicket,
      travel: tour?.startDate && new Date(tour.startDate) <= now,
      completed: tour?.endDate && new Date(tour.endDate) < now,
    };

    // =========================
    // ✅ RESPONSE
    // =========================
    res.json({
      success: true,

      timeline,

      tripProgress: {
        totalDays,
        completedDays,
        remainingDays,
        percent: Number(tripProgressPercent.toFixed(1)),
      },

      activityDensity: {
        totalActivities,
        avgPerDay: avgActivitiesPerDay,
        busiestDay,
      },

      overview: {
        totalDays,
        completedDays,
        remainingDays,
        totalActivities,
      },

      activityTrend,
    });

  } catch (error) {
    console.error("❌ ANALYTICS ERROR:", error);
    next(error);
  }
};