import { v2 as cloudinary } from "cloudinary";

/* ================= ENV VALIDATION ================= */

const requiredEnv = [
  "CLOUDINARY_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_SECRET"
];

requiredEnv.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`❌ Missing environment variable: ${key}`);
  }
});

/* ================= CONFIG ================= */

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

/* ================= HELPERS ================= */

// 🔥 Upload File
export const uploadToCloudinary = async (file, folder = "uploads") => {
  try {
    const result = await cloudinary.uploader.upload(file, {
      folder,
      resource_type: "auto", // image, video, etc.
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error) {
    console.error("❌ Cloudinary Upload Error:", error);
    throw new Error("File upload failed");
  }
};

// 🔥 Delete File
export const deleteFromCloudinary = async (publicId) => {
  try {
    if (!publicId) return;

    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error("❌ Cloudinary Delete Error:", error);
    throw new Error("File delete failed");
  }
};

/* ================= EXPORT ================= */

export default cloudinary;