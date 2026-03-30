import prisma from "../../config/prisma.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { sendTeamResetEmail } from "../../utils/sendTeamResetEmail.js";

const ACCESS_TOKEN_EXPIRE = "1d";

// ======================
// 🔐 TEAM LOGIN (EMAIL)
// ======================
export const teamLogin = async (req, res, next) => {
  try {
    const { email, password, device } = req.body;

    const ip = req.ip || "unknown";

    // 🔎 Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // 🚫 Check lock
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      return res.status(403).json({
        success: false,
        message: "Account locked. Try again later.",
      });
    }

    // 🔐 Password check
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      const attempts = user.failedAttempts + 1;
      const attemptsLeft = Math.max(0, 5 - attempts);

      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedAttempts: attempts,
          lockedUntil:
            attempts >= 5
              ? new Date(Date.now() + 60 * 1000)
              : null,
        },
      });

      await prisma.loginActivity.create({
        data: {
          userId: user.id,
          ip,
          device: device || "unknown",
          status: "failed",
        },
      });

      return res.status(401).json({
        success: false,
        message:
          attempts >= 5
            ? "Too many attempts. Account locked for 1 minute."
            : `Invalid email or password. ${attemptsLeft} attempts left.`,
        attemptsLeft,
      });
    }

    // ✅ Reset attempts
    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedAttempts: 0,
        lockedUntil: null,
        lastLoginAt: new Date(),
      },
    });

    // 🔐 Access token
    const accessToken = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: ACCESS_TOKEN_EXPIRE }
    );

    // 🔄 Secure refresh token
    const refreshToken = crypto.randomBytes(64).toString("hex");

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    // 📊 Log success
    await prisma.loginActivity.create({
      data: {
        userId: user.id,
        ip,
        device: device || "unknown",
        status: "success",
      },
    });

    // 🔔 Notification
    await prisma.notification.create({
      data: {
        userId: user.id,
        message: "New login detected",
      },
    });

    // 🍪 Cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // ✅ 🔥 UPDATED RESPONSE (IMPORTANT CHANGE)
    return res.json({
      success: true,
      accessToken,
      user: {
        id: user.id,
        username: user.username,   // ✅ ADDED
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    });

  } catch (error) {
    next(error);
  }
};

// ======================
// 🔄 REFRESH TOKEN (ROTATION)
// ======================
export const refreshAccessToken = async (req, res) => {
  try {
    const oldToken = req.cookies.refreshToken;

    if (!oldToken) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const stored = await prisma.refreshToken.findUnique({
      where: { token: oldToken },
    });

    if (!stored || stored.expiresAt < new Date()) {
      return res.status(403).json({
        success: false,
        message: "Invalid or expired refresh token",
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: stored.userId },
    });

    // 🔄 ROTATION
    await prisma.refreshToken.delete({
      where: { token: oldToken },
    });

    const newRefreshToken = crypto.randomBytes(64).toString("hex");

    await prisma.refreshToken.create({
      data: {
        token: newRefreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    const newAccessToken = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: ACCESS_TOKEN_EXPIRE }
    );

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      success: true,
      accessToken: newAccessToken,
    });

  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};

// ======================
// 🚪 LOGOUT
// ======================
export const logout = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;

    if (token) {
      await prisma.refreshToken.deleteMany({
        where: { token },
      });
    }

    res.clearCookie("refreshToken");

    return res.json({
      success: true,
      message: "Logged out successfully",
    });

  } catch {
    return res.status(500).json({ message: "Server error" });
  }
};

// ======================
// 🔑 FORGOT PASSWORD
// ======================
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.json({
        success: true,
        message: "If email exists, reset link sent",
      });
    }

    const rawToken = crypto.randomBytes(32).toString("hex");

    const hashedToken = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: hashedToken,
        resetExpiry: new Date(Date.now() + 15 * 60 * 1000),
      },
    });

    const resetLink = `${process.env.CLIENT_URL}/team/reset-password/${rawToken}`;

    // 🔥 EMAIL SEND
    await sendTeamResetEmail(user.email, resetLink);

    return res.json({
      success: true,
      message: "Reset link sent to your email",
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

// ======================
// 🔁 RESET PASSWORD
// ======================
export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await prisma.user.findFirst({
      where: {
        resetToken: hashedToken,
        resetExpiry: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetExpiry: null,
      },
    });

    return res.json({
      success: true,
      message: "Password reset successful",
    });

  } catch {
    return res.status(500).json({ message: "Server error" });
  }
};

export const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { oldPassword, newPassword } = req.body;

    // 🔎 User fetch
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // ======================
    // 🔐 VERIFY OLD PASSWORD
    // ======================
    const isMatch = await bcrypt.compare(
      oldPassword,
      user.password
    );

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Old password is incorrect",
      });
    }

    // ======================
    // 🔒 HASH NEW PASSWORD
    // ======================
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // ======================
    // 💾 UPDATE PASSWORD
    // ======================
    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
      },
    });

    return res.json({
      success: true,
      message: "Password updated successfully",
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};