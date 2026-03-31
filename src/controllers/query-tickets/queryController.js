import prisma from "../../config/prisma.js";
import { createActivityAndEmit } from "../../utils/activityHelper.js"; // 🔥 ADD


// CREATE QUERY (Team)
export const createQuery = async (req, res) => {
  try {

    const { message, tourId } = req.body;

    if (!message || !tourId) {
      return res.status(400).json({
        error: "message and tourId are required"
      });
    }

    const query = await prisma.query.create({
      data: {
        message,
        tourId,
        status: "PENDING"
      }
    });

    // 🔥 ACTIVITY
    await createActivityAndEmit({
      type: "query",
      message: "New query raised",
      tourId,
    });

    res.status(201).json(query);

  } catch (error) {

    console.error("CREATE QUERY ERROR:", error);

    res.status(500).json({
      error: "Failed to create query"
    });

  }
};


// GET QUERIES BY TOUR (UNCHANGED)
export const getQueriesByTour = async (req, res) => {
  try {

    const { tourId } = req.params;

    const queries = await prisma.query.findMany({
      where: { tourId },
      orderBy: {
        createdAt: "desc"
      }
    });

    res.json(queries);

  } catch (error) {

    console.error("GET QUERIES ERROR:", error);

    res.status(500).json({
      error: "Failed to fetch queries"
    });

  }
};


// CLIENT ANSWER QUERY
export const answerQuery = async (req, res) => {
  try {

    const { id } = req.params;
    const { answer } = req.body;

    if (!answer) {
      return res.status(400).json({
        error: "answer is required"
      });
    }

    const existing = await prisma.query.findUnique({
      where: { id }
    });

    const updated = await prisma.query.update({
      where: { id },
      data: {
        answer,
        status: "ANSWERED"
      }
    });

    // 🔥 ACTIVITY
    await createActivityAndEmit({
      type: "query",
      message: "Query answered",
      tourId: existing.tourId,
    });

    res.json(updated);

  } catch (error) {

    console.error("ANSWER QUERY ERROR:", error);

    res.status(500).json({
      error: "Failed to submit answer"
    });

  }
};


// MARK QUERY COMPLETED (Team)
export const completeQuery = async (req, res) => {
  try {

    const { id } = req.params;

    const existing = await prisma.query.findUnique({
      where: { id }
    });

    const updated = await prisma.query.update({
      where: { id },
      data: {
        status: "COMPLETED"
      }
    });

    // 🔥 ACTIVITY
    await createActivityAndEmit({
      type: "query",
      message: "Query marked as completed",
      tourId: existing.tourId,
    });

    res.json(updated);

  } catch (error) {

    console.error("COMPLETE QUERY ERROR:", error);

    res.status(500).json({
      error: "Failed to complete query"
    });

  }
};


// UPDATE QUERY (Team edit question)
export const updateQuery = async (req, res) => {
  try {

    const { id } = req.params;
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        error: "message is required"
      });
    }

    const existing = await prisma.query.findUnique({
      where: { id }
    });

    const updated = await prisma.query.update({
      where: { id },
      data: { message }
    });

    // 🔥 ACTIVITY
    await createActivityAndEmit({
      type: "query",
      message: "Query updated",
      tourId: existing.tourId,
    });

    res.json(updated);

  } catch (error) {

    console.error("UPDATE QUERY ERROR:", error);

    res.status(500).json({
      error: "Failed to update query"
    });

  }
};


// DELETE QUERY
export const deleteQuery = async (req, res) => {
  try {

    const { id } = req.params;

    const existing = await prisma.query.findUnique({
      where: { id }
    });

    await prisma.query.delete({
      where: { id }
    });

    // 🔥 ACTIVITY
    await createActivityAndEmit({
      type: "query",
      message: "Query deleted",
      tourId: existing.tourId,
    });

    res.json({
      message: "Query deleted successfully"
    });

  } catch (error) {

    console.error("DELETE QUERY ERROR:", error);

    res.status(500).json({
      error: "Failed to delete query"
    });

  }
};