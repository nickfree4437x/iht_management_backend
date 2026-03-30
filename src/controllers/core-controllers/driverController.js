import prisma from "../../config/prisma.js";

/* =========================
   CREATE DRIVER
========================= */
export const createDriver = async (req, res, next) => {
  try {

    const {
      name,
      phone,
      vehicle,
      vehicleNumber,
      notes
    } = req.body;

    const driver = await prisma.driver.create({
      data: {
        name,
        phone,
        vehicle,
        vehicleNumber,
        notes
      }
    });

    res.status(201).json({
      success: true,
      driver
    });

  } catch (error) {
    next(error);
  }
};


/* =========================
   GET ALL DRIVERS
========================= */
export const getDrivers = async (req, res, next) => {
  try {

    const drivers = await prisma.driver.findMany({
      orderBy: {
        createdAt: "desc"
      }
    });

    res.json({
      success: true,
      drivers
    });

  } catch (error) {
    next(error);
  }
};


/* =========================
   DRIVER PROFILE (UNCHANGED)
========================= */
export const getDriverById = async (req, res, next) => {
  try {

    const { id } = req.params;

    const driver = await prisma.driver.findUnique({
      where: { id },
      include: {
        transports: {
          include: {
            tour: {
              select: {
                id: true,
                tourName: true,
                guestName: true,
                startDate: true,
                endDate: true,
                arrivalCity: true,
                status: true,
                createdAt: true
              }
            }
          }
        }
      }
    });

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: "Driver not found"
      });
    }

    const tours = driver.transports
      .map(t => t.tour)
      .filter(Boolean);

    const uniqueTours = Array.from(
      new Map(tours.map(t => [t.id, t])).values()
    );

    uniqueTours.sort(
      (a, b) => new Date(b.startDate) - new Date(a.startDate)
    );

    const totalTours = uniqueTours.length;

    // 🔥 ✅ DATE-BASED LOGIC (MAIN FIX)
    const today = new Date();

    const normalize = (d) =>
      new Date(d.getFullYear(), d.getMonth(), d.getDate());

    const todayDate = normalize(today);

    const completedTours = uniqueTours.filter((t) => {
      const end = normalize(new Date(t.endDate));
      return end < todayDate;
    }).length;

    const activeTours = uniqueTours.filter((t) => {
      const start = normalize(new Date(t.startDate));
      const end = normalize(new Date(t.endDate));
      return start <= todayDate && end >= todayDate;
    }).length;

    const upcomingTours = uniqueTours.filter((t) => {
      const start = normalize(new Date(t.startDate));
      return start > todayDate;
    }).length;

    const availability = activeTours === 0;

    const timeline = uniqueTours.map(tour => ({
      title: `Assigned to ${tour.tourName}`,
      date: tour.startDate,
      status: tour.status
    }));

    res.json({
      success: true,
      driver: {
        id: driver.id,
        name: driver.name,
        phone: driver.phone,
        vehicle: driver.vehicle,
        vehicleNumber: driver.vehicleNumber,
        notes: driver.notes,
        createdAt: driver.createdAt
      },
      stats: {
        totalTours,
        completedTours,
        activeTours,
        upcomingTours
      },
      availability,
      tours: uniqueTours,
      timeline
    });

  } catch (error) {
    next(error);
  }
};


/* =========================
   UPDATE DRIVER
========================= */
export const updateDriver = async (req, res, next) => {
  try {

    const { id } = req.params;

    const {
      name,
      phone,
      vehicle,
      vehicleNumber,
      notes
    } = req.body;

    const existingDriver = await prisma.driver.findUnique({
      where: { id }
    });

    if (!existingDriver) {
      return res.status(404).json({
        success: false,
        message: "Driver not found"
      });
    }

    const updatedDriver = await prisma.driver.update({
      where: { id },
      data: {
        name,
        phone,
        vehicle,
        vehicleNumber,
        notes
      }
    });

    res.json({
      success: true,
      message: "Driver updated successfully",
      driver: updatedDriver
    });

  } catch (error) {
    next(error);
  }
};


/* =========================
   DELETE DRIVER
========================= */
export const deleteDriver = async (req, res, next) => {
  try {

    const { id } = req.params;

    const driver = await prisma.driver.findUnique({
      where: { id }
    });

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: "Driver not found"
      });
    }

    await prisma.driver.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: "Driver deleted successfully"
    });

  } catch (error) {
    next(error);
  }
};


/* =========================
   🔥 SET ACTIVE DRIVER (NEW)
========================= */
export const setActiveDriver = async (req, res, next) => {
  try {

    const { tourId } = req.params;
    const { driverId } = req.body;

    const driver = await prisma.driver.findUnique({
      where: { id: driverId }
    });

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: "Driver not found"
      });
    }

    const tour = await prisma.tour.update({
      where: { id: tourId },
      data: {
        driverId: driverId
      },
      include: {
        driver: true
      }
    });

    res.json({
      success: true,
      message: "Active driver set successfully",
      driver: tour.driver
    });

  } catch (error) {
    next(error);
  }
};


/* =========================
   🔥 GET ACTIVE DRIVER (NEW)
========================= */
export const getActiveDriver = async (req, res, next) => {
  try {

    const { tourId } = req.params;

    const tour = await prisma.tour.findUnique({
      where: { id: tourId },
      include: {
        driver: true
      }
    });

    if (!tour) {
      return res.status(404).json({
        success: false,
        message: "Tour not found"
      });
    }

    res.json({
      success: true,
      driver: tour.driver || null
    });

  } catch (error) {
    next(error);
  }
};