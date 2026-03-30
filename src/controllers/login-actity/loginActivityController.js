import prisma from "../../config/prisma.js";

export const getLoginActivity = async (req, res, next) => {

  try {

    const activities = await prisma.loginActivity.findMany({
      include: {
        user: {
          select: {
            username: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 20,
    });

    res.json({
      success: true,
      activities,
    });

  } catch (error) {
    next(error);
  }

};