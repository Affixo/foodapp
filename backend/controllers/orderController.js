import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import { io } from "../server.js"; // ⬅️ Import socket instance
// Place order with wallet payment
const placeOrder = async (req, res) => {
  try {
    const { userId, items, amount } = req.body;

    console.log(req.body);
    // ✅ Fetch user by MongoDB ID
    const user = await userModel.findById(userId);
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    // ✅ Check wallet balance
    if (user.wallet?.balance < amount) {
      return res.json({
        success: false,
        message: "Insufficient wallet balance",
      });
    }

    // ✅ Deduct balance and save user
    user.wallet.balance -= amount;
    await user.save();

    // ✅ Save order
    const newOrder = new orderModel({
      userId,
      items,
      amount,
      payment: true,
    });
    await newOrder.save();

    // ✅ Clear user's cart
    user.cartData = {};
    await user.save();

    // ✅ Send success response
    res.json({
      success: true,
      message: "Order placed successfully",
    });
  } catch (error) {
    console.error("Order placement error:", error.message, error.stack);

    res.status(500).json({ success: false, message: "Order failed" });
  }
};

// No need to verify orders anymore
const verifyOrder = async (req, res) => {
  return res.json({
    success: false,
    message: "Not applicable with wallet system",
  });
};

// user orders for frontend
const userOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({ userId: req.body.userId });
    res.json({ success: true, data: orders });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error fetching orders" });
  }
};

// Listing orders for admin panel
const listOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({});
    res.json({ success: true, data: orders });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error fetching orders" });
  }
};

// api for updating order status
const updateStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;

    const updatedOrder = await orderModel.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    );

    // ⬅️ Emit real-time event when status is "Food Ready"
    if (status === "Food Ready") {
      io.emit("orderReady", { orderId });
    }

    res.json({ success: true, message: "Status Updated" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error updating status" });
  }
};

export { placeOrder, verifyOrder, userOrders, listOrders, updateStatus };
