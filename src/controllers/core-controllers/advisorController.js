import prisma from "../../config/prisma.js";
import cloudinary from "../../config/cloudinary.js";

export const createAdvisor = async (req, res, next) => {
  try {

    const { name, phone, email } = req.body;

    // Duplicate email check
    const existingAdvisor = await prisma.advisor.findUnique({
      where: { email }
    });

    if (existingAdvisor) {
      return res.status(400).json({
        success: false,
        message: "Advisor with this email already exists"
      });
    }

    const photo = req.file ? req.file.path : null;

    const advisor = await prisma.advisor.create({
      data: {
        name,
        phone,
        email,
        photo
      }
    });

    res.status(201).json({
      success: true,
      advisor
    });

  } catch (error) {
    next(error);
  }
};


export const getAdvisors = async (req, res, next) => {
  try {

    const advisors = await prisma.advisor.findMany({
      include: {
        _count: {
          select: {
            tours: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    res.json({
      success: true,
      advisors
    });

  } catch (error) {
    next(error);
  }
};


export const getAdvisorById = async (req, res, next) => {
  try {

    const { id } = req.params;

    const advisor = await prisma.advisor.findUnique({
      where: { id }
    });

    if (!advisor) {
      return res.status(404).json({
        success: false,
        message: "Advisor not found"
      });
    }

    res.json({
      success: true,
      advisor
    });

  } catch (error) {
    next(error);
  }
};


export const updateAdvisor = async (req, res, next) => {
  try {

    const { id } = req.params;
    const { name, phone, email } = req.body;

    const advisor = await prisma.advisor.findUnique({
      where: { id }
    });

    if (!advisor) {
      return res.status(404).json({
        success: false,
        message: "Advisor not found"
      });
    }

    // Email duplicate check
    if (email && email !== advisor.email) {

      const existingEmail = await prisma.advisor.findUnique({
        where: { email }
      });

      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: "Email already in use"
        });
      }

    }

    let photo = advisor.photo;

    if (req.file) {

      // Delete old cloudinary image
      if (advisor.photo) {

        const publicId = advisor.photo
          .split("/")
          .slice(-2)
          .join("/")
          .split(".")[0];

        await cloudinary.uploader.destroy(publicId);

      }

      photo = req.file.path;

    }

    const updatedAdvisor = await prisma.advisor.update({
      where: { id },
      data: {
        name,
        phone,
        email,
        photo
      }
    });

    res.json({
      success: true,
      advisor: updatedAdvisor
    });

  } catch (error) {
    next(error);
  }
};


export const deleteAdvisor = async (req, res, next) => {
  try {

    const { id } = req.params;

    const advisor = await prisma.advisor.findUnique({
      where: { id }
    });

    if (!advisor) {
      return res.status(404).json({
        success: false,
        message: "Advisor not found"
      });
    }

    // Delete image from Cloudinary
    if (advisor.photo) {

      const publicId = advisor.photo
        .split("/")
        .slice(-2)
        .join("/")
        .split(".")[0];

      await cloudinary.uploader.destroy(publicId);

    }

    await prisma.advisor.delete({
      where: { id }
    });

    return res.json({
      success: true,
      message: "Advisor deleted successfully"
    });

  } catch (error) {

    // Prisma Foreign Key Constraint Error
    if (error.code === "P2003") {
      return res.status(400).json({
        success: false,
        message:
          "Cannot delete advisor because this advisor is assigned to one or more tours."
      });
    }

    next(error);
  }
};