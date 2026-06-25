import express from "express";
import cloudinary from "../config/cloudinary.js";
import upload from "../middleware/uploadMiddleware.js";

import {
  protect,
} from "../middleware/authMiddleware.js";

const router = express.Router();

const uploadToCloudinary = async (file) => {
  if (!file) {
    throw new Error("No file uploaded");
  }

  if (
    !process.env.CLOUDINARY_CLOUD_NAME ||
    !process.env.CLOUDINARY_API_KEY ||
    !process.env.CLOUDINARY_API_SECRET
  ) {
    throw new Error(
      "Cloudinary credentials are missing in .env file"
    );
  }

  const base64Image = file.buffer.toString("base64");

  const dataUri = `data:${file.mimetype};base64,${base64Image}`;

  const result = await cloudinary.uploader.upload(dataUri, {
    folder: "elite-shop",
    resource_type: "image",
    transformation: [
      {
        width: 1200,
        height: 1200,
        crop: "limit",
        quality: "auto",
        fetch_format: "auto",
      },
    ],
  });

  return result;
};

// ============================================
// UPLOAD SINGLE IMAGE
// POST /api/upload
// field name: image
// ============================================

router.post(
  "/",
  protect,
  upload.single("image"),
  async (req, res) => {
    try {
      const result =
        await uploadToCloudinary(req.file);

      res.status(200).json({
        success: true,
        image: result.secure_url,
        url: result.secure_url,
        public_id: result.public_id,
        message:
          "Image uploaded successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message:
          error.message ||
          "Image upload failed",
      });
    }
  }
);

// ============================================
// UPLOAD MULTIPLE IMAGES
// POST /api/upload/multiple
// field name: images
// ============================================

router.post(
  "/multiple",
  protect,
  upload.array("images", 5),
  async (req, res) => {
    try {
      if (
        !req.files ||
        req.files.length === 0
      ) {
        res.status(400);
        throw new Error(
          "No image files uploaded"
        );
      }

      const uploadedImages =
        await Promise.all(
          req.files.map((file) =>
            uploadToCloudinary(file)
          )
        );

      const images = uploadedImages.map(
        (result) => ({
          image: result.secure_url,
          url: result.secure_url,
          public_id: result.public_id,
        })
      );

      res.status(200).json({
        success: true,
        images,
        message:
          "Images uploaded successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message:
          error.message ||
          "Images upload failed",
      });
    }
  }
);

export default router;