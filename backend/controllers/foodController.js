import foodModel from "../models/foodModel.js";
import fs from "fs";

// add food item

const addFood = async (req, res) => {
  console.log("req", req.body, req.file);
  console.log("Received file:", req.file); // Debugging

  if (!req.file || !req.file.path) {
    return res
      .status(400)
      .json({ success: false, message: "No file uploaded!" });
  }

  const food = new foodModel({
    name: req.body.name,
    description: req.body.description,
    price: req.body.price,
    category: req.body.category,
    image: req.file.path, // ✅ Cloudinary URL
  });

  try {
    await food.save();
    res.json({
      success: true,
      message: "Food Added",
      imageUrl: req.file.path, // optional: return URL
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

// all food list
const listFood = async (req, res) => {
  try {
    const foods = await foodModel.find({});
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const updatedFoods = foods.map((food) => {
      // Add fallback for old image names
      if (!food.image.startsWith("http")) {
        food.image = `${baseUrl}/uploads/${food.image}`;
      }
      return food;
    });

    res.json({ success: true, data: updatedFoods });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

//remove food item
const removeFood = async (req, res) => {
  try {
    const food = await foodModel.findById(req.body.id);
    fs.unlink(`uploads/${food.image}`, () => {});

    await foodModel.findByIdAndDelete(req.body.id);
    res.json({ success: true, message: "Food Removed" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};
export { addFood, listFood, removeFood };
