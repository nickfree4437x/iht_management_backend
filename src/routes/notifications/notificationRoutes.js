import express from "express";
import prisma from "../../config/prisma.js";

const router = express.Router();

router.get("/notifications", async (req, res) => {

  const notifications = await prisma.notification.findMany({
    orderBy: {
      createdAt: "desc"
    }
  });

  res.json({ notifications });

});

router.patch("/notifications/:id/read", async (req, res) => {

  await prisma.notification.update({
    where: { id: req.params.id },
    data: { read: true }
  });

  res.json({ message: "Notification marked as read" });

});

export default router;