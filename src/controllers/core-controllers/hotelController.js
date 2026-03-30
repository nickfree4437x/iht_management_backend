import prisma from "../../config/prisma.js";

/* ---------------------------
   Create Hotel
---------------------------- */

export const createHotel = async (req, res, next) => {
  try {

    const {
      name,
      city,
      country,
      address,
      phone,
      email,
      rating,
      notes
    } = req.body;

    const hotel = await prisma.hotel.create({
      data: {
        name,
        city,
        country,
        address,
        phone,
        email,
        rating: rating ? Number(rating) : null,
        notes
      }
    });

    res.status(201).json({
      success: true,
      hotel
    });

  } catch (error) {
    next(error);
  }
};


/* ---------------------------
   Get All Hotels
---------------------------- */

export const getHotels = async (req, res, next) => {
  try {

    const hotels = await prisma.hotel.findMany({
      orderBy: {
        createdAt: "desc"
      }
    });

    res.json({
      success: true,
      hotels
    });

  } catch (error) {
    next(error);
  }
};


/* ---------------------------
   Get Single Hotel
---------------------------- */

export const getHotelById = async (req, res, next) => {
  try {

    const { id } = req.params;

    const hotel = await prisma.hotel.findUnique({
      where: { id }
    });

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: "Hotel not found"
      });
    }

    res.json({
      success: true,
      hotel
    });

  } catch (error) {
    next(error);
  }
};


/* ---------------------------
   Update Hotel
---------------------------- */

export const updateHotel = async (req, res, next) => {
  try {

    const { id } = req.params;

    const {
      name,
      city,
      country,
      address,
      phone,
      email,
      rating,
      notes
    } = req.body;

    const existingHotel = await prisma.hotel.findUnique({
      where: { id }
    });

    if (!existingHotel) {
      return res.status(404).json({
        success: false,
        message: "Hotel not found"
      });
    }

    const updatedHotel = await prisma.hotel.update({
      where: { id },
      data: {
        name,
        city,
        country,
        address,
        phone,
        email,
        rating: rating ? Number(rating) : null,
        notes
      }
    });

    res.json({
      success: true,
      message: "Hotel updated successfully",
      hotel: updatedHotel
    });

  } catch (error) {
    next(error);
  }
};


/* ---------------------------
   Delete Hotel
---------------------------- */

export const deleteHotel = async (req, res, next) => {
  try {

    const { id } = req.params;

    const hotel = await prisma.hotel.findUnique({
      where: { id }
    });

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: "Hotel not found"
      });
    }

    await prisma.hotel.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: "Hotel deleted successfully"
    });

  } catch (error) {
    next(error);
  }
};


/* ---------------------------
   Get Tours Using This Hotel
---------------------------- */

export const getHotelTours = async (req, res, next) => {
  try {

    const { id } = req.params;

    const hotel = await prisma.hotel.findUnique({
      where: { id }
    });

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: "Hotel not found"
      });
    }

    const tours = await prisma.tour.findMany({
      where: {
        itineraries: {
          some: {
            hotel: hotel.name
          }
        }
      },
      select: {
        id: true,
        tourName: true,
        guestName: true,
        pax: true,
        startDate: true,
        endDate: true,
        status: true,
        totalCost: true
      },
      orderBy: {
        startDate: "asc"
      }
    });

    res.json({
      success: true,
      tours
    });

  } catch (error) {
    next(error);
  }
};


/* ---------------------------
   Hotel Stats (Dashboard)
---------------------------- */

export const getHotelStats = async (req, res, next) => {
  try {

    const { id } = req.params;

    const hotel = await prisma.hotel.findUnique({
      where: { id }
    });

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: "Hotel not found"
      });
    }

    const tours = await prisma.tour.findMany({
      where: {
        itineraries: {
          some: {
            hotel: hotel.name
          }
        }
      }
    });

    const totalTours = tours.length;

    const totalGuests = tours.reduce(
      (sum, tour) => sum + tour.pax,
      0
    );

    const upcomingTours = tours.filter(
      (tour) => new Date(tour.startDate) > new Date()
    ).length;

    const completedTours = tours.filter(
      (tour) => tour.status === "completed"
    ).length;

    const statusBreakdown = {};

    tours.forEach((tour) => {

      statusBreakdown[tour.status] =
        (statusBreakdown[tour.status] || 0) + 1;

    });

    res.json({
      success: true,
      tours: totalTours,
      guests: totalGuests,
      upcoming: upcomingTours,
      completed: completedTours,
      statusBreakdown
    });

  } catch (error) {
    next(error);
  }
};