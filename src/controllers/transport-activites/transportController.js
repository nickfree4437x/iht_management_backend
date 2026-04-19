import prisma from "../../config/prisma.js";


// GET transports by tour
export const getTransportsByTour = async (req, res) => {
  try {
    const { tourId } = req.params;

    const transports = await prisma.transport.findMany({
      where: { tourId },
      include: {
        driver: true
      },
      orderBy: {
        date: "asc"
      }
    });

    res.json(transports);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// ADD transport
export const addTransport = async (req, res) => {
  try {

    const {
      tourId,
      date,
      type,
      from,
      to,
      details,
      driverId
    } = req.body;

    const transport = await prisma.transport.create({
      data: {
        tourId,
        date: date ? new Date(date) : null,   // 🔥 SAFE DATE
        type,
        from,
        to,
        details,
        driverId: driverId || null            // 🔥 OPTIONAL DRIVER
      }
    });

    res.json(transport);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// UPDATE transport
export const updateTransport = async (req, res) => {

  try {

    const { id } = req.params;

    const {
      date,
      type,
      from,
      to,
      details,
      driverId
    } = req.body;

    const updated = await prisma.transport.update({
      where: { id },
      data: {
        date: date ? new Date(date) : null,   // 🔥 SAFE DATE
        type,
        from,
        to,
        details,
        driverId: driverId || null            // 🔥 OPTIONAL DRIVER
      }
    });

    res.json(updated);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }

};


// DELETE transport
export const deleteTransport = async (req, res) => {

  try {

    const { id } = req.params;

    await prisma.transport.delete({
      where: { id }
    });

    res.json({
      message: "Transport deleted successfully"
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }

};


// GET transports by driver
export const getTransportsByDriver = async (req, res) => {
  try {
    const { driverId } = req.params;

    const transports = await prisma.transport.findMany({
      where: { driverId },
      include: {
        tour: {
          select: {
            id: true,
            tourName: true
          }
        }
      },
      orderBy: {
        date: "asc"
      }
    });

    res.json({
      success: true,
      transports
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};