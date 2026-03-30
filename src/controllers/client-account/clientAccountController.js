import prisma from "../../config/prisma.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";

import { sendClientLoginEmail } from "../../utils/sendClientLoginEmail.js";
import { sendClientResetEmail } from "../../utils/sendClientResetEmail.js";


// ===============================
// 🟢 GENERATE CLIENT ACCOUNT
// ===============================
export const generateClientAccount = async (req, res) => {
  try {
    const { tourId, email } = req.body;

    if (!tourId || !email) {
      return res.status(400).json({
        message: "Tour ID and Email are required",
      });
    }

    const existing = await prisma.clientAccount.findUnique({
      where: { tourId },
    });

    if (existing) {
      return res.status(400).json({
        message: "Client account already exists",
      });
    }

    // 🔐 Better readable password
    const password = crypto.randomBytes(4).toString("hex");
    const hashedPassword = await bcrypt.hash(password, 10);

    const account = await prisma.clientAccount.create({
      data: {
        email,
        password: hashedPassword,
        tourId,
      },
      select: {
        email: true,
        tourId: true,
      },
    });

    // 🔥 UPDATED FUNCTION CALL (IMPORTANT)
    await sendClientLoginEmail(email, password, tourId);

    res.json({
      message: "Client & Admin notified successfully",
      account,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: error.message || "Account creation failed",
    });
  }
};


// ===============================
// 🔵 CLIENT LOGIN (JWT ENABLED 🔥)
// ===============================
export const clientLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const user = await prisma.clientAccount.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email",
      });
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(401).json({
        message: "Invalid password",
      });
    }

    // 🔥 JWT TOKEN GENERATION
    const token = jwt.sign(
      {
        tourId: user.tourId,
        email: user.email,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.json({
      message: "Login successful",
      token, // ✅ important
      tourId: user.tourId,
      email: user.email,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: error.message || "Login failed",
    });
  }
};


// ===============================
// 🟣 GET CURRENT CLIENT (SECURE 🔐)
// ===============================
export const getClientProfile = async (req, res) => {
  try {
    const { tourId } = req.user;

    const user = await prisma.clientAccount.findUnique({
      where: { tourId },
      select: {
        email: true,
        tourId: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        message: "Client not found",
      });
    }

    res.json({
      message: "Client fetched successfully",
      user,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: error.message || "Failed to fetch client",
    });
  }
};


// ===============================
// 🟡 FORGOT PASSWORD
// ===============================
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    const user = await prisma.clientAccount.findUnique({
      where: { email },
    });

    if (!user) {
      return res.json({
        message: "If this email exists, a reset link has been sent",
      });
    }

    // 🔐 Token
    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000);

    await prisma.clientAccount.update({
      where: { email },
      data: {
        resetToken: hashedToken,
        resetTokenExpiry,
      },
    });

    const resetLink = `${process.env.CLIENT_URL}/client/reset-password/${rawToken}`;

    await sendClientResetEmail(email, resetLink);

    res.json({
      message: "If this email exists, a reset link has been sent",
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: error.message || "Failed to process request",
    });
  }
};


// ===============================
// 🔴 RESET PASSWORD
// ===============================
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        message: "Invalid request",
      });
    }

    // 🔐 hash incoming token
    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await prisma.clientAccount.findFirst({
      where: {
        resetToken: hashedToken,
        resetTokenExpiry: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired token",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.clientAccount.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    res.json({
      message: "Password reset successful",
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: error.message || "Reset password failed",
    });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const { tourId } = req.user;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const user = await prisma.clientAccount.findUnique({
      where: { tourId },
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // 🔐 check current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Current password is incorrect",
      });
    }

    // 🔐 hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.clientAccount.update({
      where: { tourId },
      data: {
        password: hashedPassword,
      },
    });

    res.json({
      message: "Password updated successfully",
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: error.message || "Failed to update password",
    });
  }
};