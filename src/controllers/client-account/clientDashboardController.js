import prisma from "../../config/prisma.js";

// =========================
// 🔥 CLIENT RECENT ACTIVITIES
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
      orderBy: { createdAt: "desc" },
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
    console.error(error);
    next(error);
  }
};

// =========================
// 🔥 CLIENT DASHBOARD ANALYTICS (FINAL FIX)
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
    // 🔥 ACTIVITY SOURCE (CORRECT)
    // =========================
    const tourActivities = await prisma.tourActivity.findMany({
      where: { tourId },
      include: {
        activity: true,
      },
    });

    const totalActivities = tourActivities.length;

    const avgActivitiesPerDay = totalDays
      ? Number((totalActivities / totalDays).toFixed(1))
      : 0;

    // =========================
    // 🔥 SMART DISTRIBUTION (NO DAY LINK)
    // =========================
    const baseCount = totalDays
      ? Math.floor(totalActivities / totalDays)
      : 0;

    let remaining = totalDays
      ? totalActivities % totalDays
      : 0;

    const activityTrend = itinerary.map((day) => {
      let count = baseCount;

      if (remaining > 0) {
        count += 1;
        remaining--;
      }

      return {
        date: new Date(day.date).toLocaleDateString(),
        count,
      };
    });

    // =========================
    // 🔥 BUSIEST DAY
    // =========================
    let busiestDay = null;

    if (activityTrend.length > 0) {
      busiestDay = activityTrend.reduce((max, curr) =>
        curr.count > max.count ? curr : max
      );
    }

    // =========================
    // ✅ TIMELINE
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