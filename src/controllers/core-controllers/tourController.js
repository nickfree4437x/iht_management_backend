import prisma from "../../config/prisma.js";

/* ---------------- COMMON INCLUDE ---------------- */
const advisorWithCount = {
  advisor: {
    include: {
      _count: {
        select: {
          tours: true
        }
      }
    }
  }
};

/* ---------------- CREATE TOUR ---------------- */

export const createTour = async (req, res, next) => {
  try {
    const {
      guestName,
      pax,
      email,
      phone,
      country,
      tourName,
      startDate,
      endDate,
      arrivalCity,
      advisorId,
      totalCost,
      advancePayment,
      advancePaymentDate,
      transactionFee
    } = req.body;

    const advisor = await prisma.advisor.findUnique({
      where: { id: advisorId }
    });

    if (!advisor) {
      return res.status(400).json({
        success: false,
        message: "Advisor not found"
      });
    }

    const tour = await prisma.tour.create({
      data: {
        guestName,
        pax: Number(pax),
        email,
        phone,
        country,
        tourName,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        arrivalCity,
        advisorId,
        totalCost: Number(totalCost),
        advancePayment: advancePayment ? Number(advancePayment) : null,
        advancePaymentDate: advancePaymentDate
          ? new Date(advancePaymentDate)
          : null,
        transactionFee: transactionFee ? Number(transactionFee) : null
      },
      include: advisorWithCount
    });

    res.status(201).json({
      success: true,
      tour
    });

  } catch (error) {
    next(error);
  }
};


/* ---------------- HELPER: ENRICH STATUS ---------------- */

const enrichTourStatus = (tours) => {
  return tours.map((tour) => {

    const hasHotel = tour.itineraries?.some(
      (day) =>
        day.hotel &&
        day.hotel !== "N/A" &&
        day.hotel.trim() !== ""
    );

    const hasTransport = tour.transports?.length > 0;

    const hasPayment = tour.payments?.length > 0;

    return {
      ...tour,
      hasHotel,
      hasTransport,
      hasPayment
    };
  });
};


/* ---------------- UPCOMING TOURS ---------------- */

export const getUpcomingTours = async (req, res, next) => {
  try {

    const today = new Date();

    const tours = await prisma.tour.findMany({
      where: {
        startDate: { gte: today },
        isDeleted: false
      },
      include: {
        ...advisorWithCount,

        // ✅ FIXED
        itineraries: {
          select: { hotel: true }
        },

        transports: {
          select: { id: true }
        },

        payments: true
      },
      orderBy: { startDate: "asc" }
    });

    const enrichedTours = enrichTourStatus(tours);

    res.json({ success: true, tours: enrichedTours });

  } catch (error) {
    next(error);
  }
};


/* ---------------- PREVIOUS TOURS ---------------- */

export const getPreviousTours = async (req, res, next) => {
  try {

    const today = new Date();

    const tours = await prisma.tour.findMany({
      where: {
        endDate: { lt: today },
        isDeleted: false
      },
      include: {
        ...advisorWithCount,

        // ✅ FIXED
        itineraries: {
          select: { hotel: true }
        },

        transports: {
          select: { id: true }
        },

        payments: true
      },
      orderBy: { startDate: "desc" }
    });

    const enrichedTours = enrichTourStatus(tours);

    res.json({ success: true, tours: enrichedTours });

  } catch (error) {
    next(error);
  }
};


/* ---------------- MOVE TO TRASH ---------------- */

export const moveToTrash = async (req, res, next) => {
  try {
    const { id } = req.params;

    await prisma.tour.update({
      where: { id },
      data: { isDeleted: true }
    });

    res.json({
      success: true,
      message: "Tour moved to trash"
    });

  } catch (error) {
    next(error);
  }
};


/* ---------------- GET TRASH TOURS ---------------- */

export const getTrashTours = async (req, res, next) => {
  try {

    const tours = await prisma.tour.findMany({
      where: { isDeleted: true },
      include: advisorWithCount,
      orderBy: { startDate: "desc" }
    });

    res.json({
      success: true,
      tours
    });

  } catch (error) {
    next(error);
  }
};


/* ---------------- RESTORE TOUR ---------------- */

export const restoreTour = async (req, res, next) => {
  try {

    const { id } = req.params;

    await prisma.tour.update({
      where: { id },
      data: { isDeleted: false }
    });

    res.json({
      success: true,
      message: "Tour restored successfully"
    });

  } catch (error) {
    next(error);
  }
};


/* ---------------- DELETE FOREVER ---------------- */

export const deleteForever = async (req, res, next) => {
  try {

    const { id } = req.params;

    await prisma.itinerary.deleteMany({
      where: { tourId: id }
    });

    await prisma.tour.delete({
      where: { id }
    });

    res.json({
      success: true,
      deletedId: id,
      message: "Tour permanently deleted"
    });

  } catch (error) {
    next(error);
  }
};


/* ---------------- ADVISOR TOURS ---------------- */

export const getAdvisorTours = async (req, res, next) => {
  try {

    const { id } = req.params;

    const tours = await prisma.tour.findMany({
      where: {
        advisorId: id,
        isDeleted: false
      },
      include: advisorWithCount,
      orderBy: { startDate: "asc" }
    });

    res.json({
      success: true,
      tours
    });

  } catch (error) {
    next(error);
  }
};


/* ---------------- TOUR BY ID ---------------- */

export const getTourById = async (req, res, next) => {
  try {

    const { id } = req.params;

    const tour = await prisma.tour.findUnique({
      where: { id },
      include: advisorWithCount
    });

    res.json({
      success: true,
      tour
    });

  } catch (error) {
    next(error);
  }
};