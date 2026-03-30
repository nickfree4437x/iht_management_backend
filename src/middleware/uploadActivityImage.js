import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "activities",
    allowed_formats: ["jpg", "jpeg", "png", "webp"]
  }
});

const uploadActivityImage = multer({ storage });

export default uploadActivityImage;