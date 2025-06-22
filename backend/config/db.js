import mongoose from "mongoose";

export const connectDB = async () => {
  await mongoose
    .connect(
      "mongodb+srv://vista-app:01534790692@cluster0.fhtpm5q.mongodb.net/food-del"
    )
    .then(() => console.log("DB Connected"));
};
