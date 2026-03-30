import prisma from "../../config/prisma.js";

// =========================
// 📊 FULL DASHBOARD DATA
// =========================
export const getDashboardStats = async (req, res, next) => {
  try {
    const today = new Date();

    // ===== BASIC STATS =====
    const totalTours = await prisma.tour.count();

    const upcomingTours = await prisma.tour.count({
      where: {
        startDate: { gte: today },
      },
    });

    const totalAdvisors = await prisma.advisor.count();
    const totalDrivers = await prisma.driver.count();
    const totalHotels = await prisma.hotel.count();

    // ===== CHARTS =====
    const tours = await prisma.tour.findMany({
      select: { startDate: true },
    });

    const monthsMap = {};
    tours.forEach((tour) => {
      const date = new Date(tour.startDate);
      const month = date.toLocaleString("default", { month: "short" });
      monthsMap[month] = (monthsMap[month] || 0) + 1;
    });

    const toursPerMonth = Object.keys(monthsMap).map((month) => ({
      month,
      count: monthsMap[month],
    }));

    const advisors = await prisma.advisor.findMany({
      include: { tours: true },
    });

    const advisorsDistribution = advisors.map((advisor) => ({
      name: advisor.name,
      tours: advisor.tours.length,
    }));

    // ===== UPCOMING TOURS =====
    const upcomingToursList = await prisma.tour.findMany({
      where: {
        startDate: { gte: today },
      },
      include: { advisor: true },
      orderBy: { startDate: "asc" },
      take: 5,
    });

    // =========================
    // 🔥 DASHBOARD ADVISORS LIST (UPDATED)
    // =========================
    const advisorsList = await prisma.advisor.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { tours: true },
        },
        tours: {
          where: {
            startDate: { gte: today }, // only upcoming
          },
          orderBy: {
            startDate: "asc",
          },
          take: 1, // nearest upcoming tour
          select: {
            id: true,
            tourName: true,   // ✅ FIXED FIELD
            startDate: true,
            endDate: true,
          },
        },
      },
    });

    const now = new Date();

    const formattedAdvisors = advisorsList.map((a) => {
      const tour = a.tours[0];

      let status = null;

      if (tour) {
        if (tour.startDate > now) status = "upcoming";
        else if (tour.startDate <= now && tour.endDate >= now)
          status = "ongoing";
        else status = "completed";
      }

      return {
        id: a.id,
        name: a.name,
        toursCount: a._count.tours,

        upcomingTour: tour
          ? {
              name: tour.tourName, // ✅ FIXED
              date: tour.startDate,
              status, // 🔥 BONUS
            }
          : null,
      };
    });

    // =========================
    // 🔥 TODAY SUMMARY
    // =========================
    const todayStart = new Date(new Date().setHours(0, 0, 0, 0));
    const todayEnd = new Date(new Date().setHours(23, 59, 59, 999));

    const todayToursCount = await prisma.tour.count({
      where: {
        startDate: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
    });

    const activeAdvisors = await prisma.advisor.count({
      where: {
        tours: {
          some: {
            startDate: {
              gte: todayStart,
              lte: todayEnd,
            },
          },
        },
      },
    });

    // =========================
    // 🔥 TOUR STATUS
    // =========================
    const ongoingTours = await prisma.tour.count({
      where: {
        startDate: { lte: new Date() },
        endDate: { gte: new Date() },
      },
    });

    const completedTours = await prisma.tour.count({
      where: {
        endDate: { lt: new Date() },
      },
    });

    const upcomingToursCount = await prisma.tour.count({
      where: {
        startDate: { gt: new Date() },
      },
    });

    // =========================
    // 🔥 RECENT DATA
    // =========================
    const recentTours = await prisma.tour.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    const recentAdvisors = await prisma.advisor.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    const recentHotels = await prisma.hotel.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    // ===== NOTIFICATIONS =====
    const notifications = [];

    if (todayToursCount > 0) {
      notifications.push({
        type: "info",
        message: `${todayToursCount} tours starting today`,
      });
    }

    const failedLogins = await prisma.loginActivity.count({
      where: { status: "failed" },
    });

    if (failedLogins > 5) {
      notifications.push({
        type: "warning",
        message: `${failedLogins} failed login attempts`,
      });
    }

    // ===== LOGIN ACTIVITY =====
    const loginActivity = await prisma.loginActivity.findMany({
      include: { user: true },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    // ===== FINAL RESPONSE =====
    res.json({
      success: true,

      stats: {
        totalTours,
        upcomingTours,
        totalAdvisors,
        totalDrivers,
        totalHotels,
      },

      charts: {
        toursPerMonth,
        advisorsDistribution,
      },

      upcomingToursList,
      notifications,
      loginActivity,

      advisors: formattedAdvisors, // 🔥 UPDATED

      todaySummary: {
        todayToursCount,
        activeAdvisors,
      },

      tourStatus: {
        ongoingTours,
        completedTours,
        upcomingToursCount,
      },

      recentData: {
        tours: recentTours,
        advisors: recentAdvisors,
        hotels: recentHotels,
      },
    });

  } catch (error) {
    next(error);
  }
};