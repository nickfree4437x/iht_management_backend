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

    // 🔥 VALIDATION
    if (!name || !city || !country) {
      return res.status(400).json({
        success: false,
        message: "Name, city and country are required"
      });
    }

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
      message: "Hotel created successfully",
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

    res.status(200).json({
      success: true,
      count: hotels.length,
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

    res.status(200).json({
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

    res.status(200).json({
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

    res.status(200).json({
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

    res.status(200).json({
      success: true,
      count: tours.length,
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

    res.status(200).json({
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

/* ---------------------------
   Create Hotel Voucher
---------------------------- */
export const createHotelVoucher = async (req, res, next) => {

  try {

    const {

      // 🔥 TOUR
      tourId,

      // 🔥 STATUS
      status,
      confirmationNo,

      // 🔥 DATE
      date,

      // 🔥 HOTEL
      hotelName,
      hotelAddress,

      // 🔥 CLIENT
      clientName,
      title,
      gender,
      pax,

      // 🔥 STAY
      checkIn,
      checkOut,

      // 🔥 ROOM
      roomCategory,

      // 🔥 PLAN
      plan

    } = req.body;


    // ======================================================
    // 🔥 REQUIRED VALIDATION
    // ======================================================

    if (

      !tourId ||
      !status ||
      !date ||
      !hotelName ||
      !clientName ||
      !checkIn ||
      !checkOut

    ) {

      return res.status(400).json({

        success: false,

        message:
          "Please fill all required fields"

      });

    }


    // ======================================================
    // 🔥 DATE VALIDATION
    // ======================================================

    const checkInDate =
      new Date(checkIn);

    const checkOutDate =
      new Date(checkOut);


    if (checkOutDate <= checkInDate) {

      return res.status(400).json({

        success: false,

        message:
          "Check-out date must be after check-in date"

      });

    }


    // ======================================================
    // 🔥 TOTAL NIGHTS
    // ======================================================

    const totalNights =
      Math.ceil(

        (
          checkOutDate -
          checkInDate
        )

        /

        (
          1000 * 60 * 60 * 24
        )

      );


    // ======================================================
    // 🔥 GENERATE DATE LINES
    // ======================================================

    const generateDateLines = () => {

      const start =
        new Date(checkIn);

      const end =
        new Date(checkOut);

      start.setHours(0, 0, 0, 0);

      end.setHours(0, 0, 0, 0);

      const result = [];

      let current =
        new Date(start);


      while (current <= end) {

        const formattedDate =
          current.toLocaleDateString("en-GB");


        const isFirstDay =
          current.getTime() ===
          start.getTime();


        const isLastDay =
          current.getTime() ===
          end.getTime();


        let text = "";


        // ======================================================
        // 🔥 SINGLE DAY
        // ======================================================

        if (
          isFirstDay &&
          isLastDay
        ) {

          if (plan === "NA") {

            text = "Check Out";

          }

          else {

            text =
              "Breakfast + Check Out";

          }

        }


        // ======================================================
        // 🔥 FIRST DAY
        // ======================================================

        else if (isFirstDay) {

          if (plan === "CP") {

            text = "Room Only";

          }

          else if (plan === "MP") {

            text =
              "Lunch + Dinner + Room";

          }

          else if (plan === "AP") {

            text =
              "Dinner + Room";

          }

          else {

            text = "Room Only";

          }

        }


        // ======================================================
        // 🔥 LAST DAY
        // ======================================================

        else if (isLastDay) {

          if (plan === "NA") {

            text = "Check Out";

          }

          else {

            text =
              "Breakfast + Check Out";

          }

        }


        // ======================================================
        // 🔥 MIDDLE DAYS
        // ======================================================

        else {

          if (plan === "NA") {

            text = "Room Only";

          }

          else if (plan === "CP") {

            text =
              "Breakfast + Room";

          }

          else if (plan === "MP") {

            text =
              "Breakfast + Lunch + Dinner + Room";

          }

          else if (plan === "AP") {

            text =
              "Breakfast + Dinner + Room";

          }

          else {

            text =
              "Breakfast + Room";

          }

        }


        result.push({

          date: formattedDate,

          text

        });


        current.setDate(
          current.getDate() + 1
        );

      }


      return result;

    };


    // ======================================================
    // 🔥 CREATE HOTEL VOUCHER
    // ======================================================

    const voucher =
      await prisma.hotelVoucher.create({

        data: {

          tourId,

          status,
          confirmationNo,

          date:
            new Date(date),

          hotelName,
          hotelAddress,

          // 🔥 CLIENT
          clientName,
          title,
          gender,

          pax:
            Number(pax),

          checkIn:
            checkInDate,

          checkOut:
            checkOutDate,

          roomCategory,

          plan,

          dateLines:
            generateDateLines(),

          totalNights

        }

      });


    res.status(201).json({

      success: true,

      message:
        "Hotel voucher created",

      voucher

    });

  }

  catch (error) {

    next(error);

  }

};

// ======================================================
// 🔥 GET HOTEL VOUCHER
// ======================================================
export const getHotelVouchers = async (
  req,
  res,
  next
) => {

  try {

    const { tourId } = req.query;

    if (!tourId) {

      return res.status(400).json({

        success: false,

        message:
          "Tour ID is required"

      });

    }

    const vouchers =
      await prisma.hotelVoucher.findMany({

        where: {

          tourId

        },
        orderBy: {

          createdAt: "desc"

        }
      });
    res.status(200).json({

      success: true,

      vouchers

    });

  }
  catch (error) {

    next(error);

  }
};

// ======================================================
// 🔥 UPDATE VOUCHERS
// ======================================================
export const updateHotelVoucher = async (
  req,
  res,
  next
) => {

  try {

    const { id } = req.params;

    const {

      // 🔥 TOUR
      tourId,

      // 🔥 STATUS
      status,
      confirmationNo,

      // 🔥 DATE
      date,

      // 🔥 HOTEL
      hotelName,
      hotelAddress,

      // 🔥 CLIENT
      clientName,
      title,
      gender,
      pax,

      // 🔥 STAY
      checkIn,
      checkOut,

      // 🔥 ROOM
      roomCategory,

      // 🔥 PLAN
      plan

    } = req.body;

    if (

      !tourId ||
      !status ||
      !date ||
      !hotelName ||
      !clientName ||
      !checkIn ||
      !checkOut

    ) {

      return res.status(400).json({

        success: false,

        message:
          "Please fill all required fields"

      });

    }

    const existingVoucher =
      await prisma.hotelVoucher.findUnique({

        where: { id }

      });

    if (!existingVoucher) {

      return res.status(404).json({

        success: false,

        message:
          "Voucher not found"

      });

    }

    // ======================================================
    // 🔥 DATE VALIDATION
    // ======================================================

    const checkInDate =
      new Date(checkIn);

    const checkOutDate =
      new Date(checkOut);

    if (checkOutDate <= checkInDate) {

      return res.status(400).json({

        success: false,

        message:
          "Check-out date must be after check-in date"

      });

    }

    // ======================================================
    // 🔥 TOTAL NIGHTS
    // ======================================================

    const totalNights =
      Math.ceil(

        (
          checkOutDate -
          checkInDate
        )

        /

        (
          1000 * 60 * 60 * 24
        )

      );

    // ======================================================
    // 🔥 GENERATE DATE LINES
    // ======================================================

    const generateDateLines = () => {

      const start =
        new Date(checkIn);

      const end =
        new Date(checkOut);

      start.setHours(0, 0, 0, 0);

      end.setHours(0, 0, 0, 0);

      const result = [];

      let current =
        new Date(start);

      while (current <= end) {

        const formattedDate =
          current.toLocaleDateString("en-GB");

        const isFirstDay =
          current.getTime() ===
          start.getTime();

        const isLastDay =
          current.getTime() ===
          end.getTime();

        let text = "";

        // ======================================================
        // 🔥 SINGLE DAY
        // ======================================================

        if (
          isFirstDay &&
          isLastDay
        ) {

          if (plan === "NA") {

            text = "Check Out";

          }

          else {

            text =
              "Breakfast + Check Out";

          }

        }

        // ======================================================
        // 🔥 FIRST DAY
        // ======================================================

        else if (isFirstDay) {

          if (plan === "CP") {

            text = "Room Only";

          }

          else if (plan === "MP") {

            text =
              "Lunch + Dinner + Room";

          }

          else if (plan === "AP") {

            text =
              "Dinner + Room";

          }

          else {

            text = "Room Only";

          }

        }

        // ======================================================
        // 🔥 LAST DAY
        // ======================================================

        else if (isLastDay) {

          if (plan === "NA") {

            text = "Check Out";

          }

          else {

            text =
              "Breakfast + Check Out";

          }

        }

        // ======================================================
        // 🔥 MIDDLE DAYS
        // ======================================================

        else {

          if (plan === "NA") {

            text = "Room Only";

          }

          else if (plan === "CP") {

            text =
              "Breakfast + Room";

          }

          else if (plan === "MP") {

            text =
              "Breakfast + Lunch + Dinner + Room";

          }

          else if (plan === "AP") {

            text =
              "Breakfast + Dinner + Room";

          }

          else {

            text =
              "Breakfast + Room";

          }

        }

        result.push({

          date: formattedDate,

          text

        });

        current.setDate(
          current.getDate() + 1
        );

      }

      return result;

    };

    // ======================================================
    // 🔥 UPDATE HOTEL VOUCHER
    // ======================================================

    const voucher =
      await prisma.hotelVoucher.update({

        where: { id },

        data: {

          // 🔥 TOUR
          tourId,

          // 🔥 STATUS
          status,
          confirmationNo,

          // 🔥 DATE
          date:
            new Date(date),

          // 🔥 HOTEL
          hotelName,
          hotelAddress,

          // 🔥 CLIENT
          clientName,
          title,
          gender,

          pax:
            Number(pax),

          // 🔥 STAY
          checkIn:
            checkInDate,

          checkOut:
            checkOutDate,

          // 🔥 ROOM
          roomCategory,

          // 🔥 PLAN
          plan,

          // 🔥 EXTRA
          dateLines:
            generateDateLines(),

          totalNights

        }

      });

    res.status(200).json({

      success: true,

      message:
        "Hotel voucher updated",

      voucher

    });

  }

  catch (error) {

    next(error);

  }

};

// ======================================
// ❌ DELETE HOTEL VOUCHER
// ======================================
export const deleteHotelVoucher = async (
  req,
  res,
  next
) => {

  try {

    const { id } = req.params;

    // 🔥 CHECK EXISTING
    const existingVoucher =
      await prisma.hotelVoucher.findUnique({
        where: { id }
      });

    if (!existingVoucher) {

      return res.status(404).json({
        success: false,
        message: "Voucher not found"
      });

    }

    // 🔥 DELETE
    await prisma.hotelVoucher.delete({
      where: { id }
    });

    res.status(200).json({
      success: true,
      message:
        "Hotel voucher deleted successfully"
    });

  } catch (error) {

    next(error);

  }

};