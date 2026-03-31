import prisma from "../../config/prisma.js";
import { createActivityAndEmit } from "../../utils/activityHelper.js"; // 🔥 ADD


export const addAdditionalCost = async (req, res) => {
  try {

    const { tourId, amount, status, comment } = req.body;

    const cost = await prisma.additionalCost.create({
      data: {
        tourId,
        amount: parseFloat(amount),
        status,
        comment,
      },
    });

    // 🔥 ACTIVITY
    await createActivityAndEmit({
      type: "cost",
      message: `Additional cost added ₹${amount}`,
      tourId,
    });

    res.status(201).json({
      success: true,
      data: cost,
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to add additional cost",
    });

  }
};


export const getAdditionalCosts = async (req, res) => {
  try {

    const { tourId } = req.params;

    const costs = await prisma.additionalCost.findMany({
      where: { tourId },
      orderBy: { createdAt: "desc" },
    });

    res.json({
      success: true,
      data: costs,
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch additional costs",
    });

  }
};


export const updateAdditionalCost = async (req, res) => {
  try {

    const { id } = req.params;
    const { amount, status, comment } = req.body;

    const existing = await prisma.additionalCost.findUnique({
      where: { id }
    });

    const updated = await prisma.additionalCost.update({
      where: { id },
      data: {
        amount: parseFloat(amount),
        status,
        comment,
      },
    });

    // 🔥 ACTIVITY
    await createActivityAndEmit({
      type: "cost",
      message: "Additional cost updated",
      tourId: existing.tourId,
    });

    res.json({
      success: true,
      data: updated,
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to update cost",
    });

  }
};


export const deleteAdditionalCost = async (req, res) => {
  try {

    const { id } = req.params;

    const existing = await prisma.additionalCost.findUnique({
      where: { id }
    });

    await prisma.additionalCost.delete({
      where: { id },
    });

    // 🔥 ACTIVITY
    await createActivityAndEmit({
      type: "cost",
      message: "Additional cost deleted",
      tourId: existing.tourId,
    });

    res.json({
      success: true,
      message: "Cost deleted successfully",
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to delete cost",
    });

  }
};