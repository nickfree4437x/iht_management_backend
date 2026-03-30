import prisma from "../../config/prisma.js";


export const createGuest = async (req, res) => {
  try {

    const { name, phone, email, country, arrivalDetails, tourId } = req.body

    const tour = await prisma.tour.findUnique({
      where: { id: tourId },
      include: { guests: true }
    })

    if (!tour) {
      return res.status(404).json({ message: "Tour not found" })
    }

    if (tour.guests.length >= tour.pax) {
      return res.status(400).json({ message: "Max pax reached" })
    }

    const guest = await prisma.guest.create({
      data: {
        name,
        phone,
        email,
        country,
        arrivalDetails,
        tourId
      }
    })

    res.json(guest)

  } catch (error) {
    res.status(500).json(error)
  }
}



export const getGuests = async (req, res) => {
  try {

    const { tourId } = req.params

    const guests = await prisma.guest.findMany({
      where: { tourId }
    })

    res.json(guests)

  } catch (error) {
    res.status(500).json(error)
  }
}



export const updateGuest = async (req, res) => {
  try {

    const { id } = req.params

    const guest = await prisma.guest.update({
      where: { id },
      data: req.body
    })

    res.json(guest)

  } catch (error) {
    res.status(500).json(error)
  }
}



export const deleteGuest = async (req, res) => {
  try {

    const { id } = req.params

    await prisma.guest.delete({
      where: { id }
    })

    res.json({ message: "Guest deleted" })

  } catch (error) {
    res.status(500).json(error)
  }
}