import express from "express";
import http from "http"; // ⬅️ for creating raw server
import { Server } from "socket.io"; // ⬅️ Socket.IO server
import cors from "cors";
import morgan from "morgan";
import "dotenv/config";
import { connectDB } from "./config/db.js";
import foodRouter from "./routes/foodRoute.js";
import userRouter from "./routes/userRoute.js";
import cartRouter from "./routes/cartRoute.js";
import orderRouter from "./routes/orderRoute.js";
import adminRouter from "./routes/adminRoute.js";

const app = express();
const port = process.env.PORT || 4000;
const server = http.createServer(app); // ⬅️ Use raw HTTP server
const io = new Server(server, {
  cors: { origin: "*" }, // Allow all origins (adjust as needed)
});
export { io }; // ⬅️ Export for use in controller

// Middleware
app.use(express.json());
app.use(cors());
app.use(morgan("combined"));

// DB Connection
connectDB();

// Static
app.use("/images", express.static("uploads"));

// Routes
app.use("/api/food", foodRouter);
app.use("/api/user", userRouter);
app.use("/api/cart", cartRouter);
app.use("/api/order", orderRouter);
app.use("/api/admin", adminRouter);
app.use("/uploads", express.static("uploads"));
app.get("/", (req, res) => res.send("API Working"));

server.listen(port, () => {
  console.log(`Server started on http://localhost:${port}`);
});
//mongodb+srv://vista-app:01534790692@cluster0.fhtpm5q.mongodb.net/?
