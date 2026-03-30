import prisma from "../../config/prisma.js";


// GET other details
export const getOtherDetails = async (req, res) => {

  try {

    const { tourId } = req.params;

    let details = await prisma.tourOtherDetail.findUnique({
      where: { tourId }
    });

    // auto create if not exists
    if (!details) {

      details = await prisma.tourOtherDetail.create({
        data: {
          tourId
        }
      });

    }

    res.json(details);

  } catch (error) {

    res.status(500).json({ error: error.message });

  }

};


// UPDATE other details
export const updateOtherDetails = async (req, res) => {

  try {

    const { tourId } = req.params;

    const {
      room,
      plan,
      safari,
      boating,
      specialActivity
    } = req.body;

    const details = await prisma.tourOtherDetail.upsert({

      where: { tourId },

      update: {
        room,
        plan,
        safari,
        boating,
        specialActivity
      },

      create: {
        tourId,
        room,
        plan,
        safari,
        boating,
        specialActivity
      }

    });

    res.json(details);

  } catch (error) {

    res.status(500).json({ error: error.message });

  }

};