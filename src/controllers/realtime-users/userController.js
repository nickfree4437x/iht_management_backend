import prisma from "../../config/prisma.js";
import bcrypt from "bcrypt";

export const getCurrentUser = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        role: true,
        createdAt: true,
      },
    });

    res.json({
      success: true,
      user,
    });

  } catch (error) {
    res.status(500).json({
      message: "Server error",
    });
  }
};

// 🔥 UPDATE PROFILE
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const { username, oldPassword, newPassword } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    // 🔥 STEP 1: Username update (independent)
    if (username && username !== user.username) {
      await prisma.user.update({
        where: { id: userId },
        data: { username },
      });
    }

    // 🔥 STEP 2: Password update ONLY if both provided
    if (oldPassword && newPassword) {

      const isMatch = await bcrypt.compare(
        oldPassword,
        user.password
      );

      if (!isMatch) {
        return res.status(400).json({
          message: "Old password is incorrect",
        });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      await prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword },
      });
    }

    // ❗ अगर सिर्फ oldPassword diya but new nahi
    if (oldPassword && !newPassword) {
      return res.status(400).json({
        message: "Please provide new password",
      });
    }

    if (!oldPassword && newPassword) {
      return res.status(400).json({
        message: "Please provide old password",
      });
    }

    res.json({
      success: true,
      message: "Profile updated successfully",
    });

  } catch (error) {
    res.status(500).json({
      message: "Server error",
    });
  }
};