import express from "express";
import {
  addFood,
  listFood,
  removeFood,
} from "../controllers/foodController.js";
import multer from "multer";
import fs from "fs";
import path from "path";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "vista-food-images",
    allowed_formats: ["jpg", "png", "jpeg"],
  },
});

const upload = multer({ storage });
const foodRouter = express.Router();

// Image Storage Engine

// const storage = multer.diskStorage({
//   destination: "uploads",
//   filename: (req, file, cb) => {
//     console.log("in multer", file);
//     return cb(null, `${Date.now()}${file.originalname}`);
//   },
// });

// const upload = multer({ storage: storage });
foodRouter.post(
  "/add",
  (req, res, next) => {
    upload.single("image")(req, res, (error) => {
      if (error) {
        console.error("Food image upload failed:", error);
        return res.status(500).json({
          success: false,
          message:
            error.message ||
            "Image upload failed. Check Cloudinary environment variables.",
        });
      }

      next();
    });
  },
  addFood
);
foodRouter.get("/list", listFood);
foodRouter.post("/remove", removeFood);

export default foodRouter;
