import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import walletTransactionModel from "../models/walletTransactionModel.js";
import { io } from "../server.js";

const placeOrder = async (req, res) => {
  try {
    const { userId, items, amount } = req.body;
    const orderAmount = Number(amount);

    const user = await userModel.findById(userId);
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    if (!items?.length || !orderAmount || orderAmount <= 0) {
      return res.json({ success: false, message: "Invalid order data" });
    }

    const previousBalance = user.wallet?.balance ?? 0;
    if (previousBalance < orderAmount) {
      return res.json({
        success: false,
        message: "Insufficient wallet balance",
      });
    }

    const newOrder = new orderModel({
      userId,
      items,
      amount: orderAmount,
      payment: true,
    });
    await newOrder.save();

    const newBalance = previousBalance - orderAmount;
    const transaction = new walletTransactionModel({
      userId,
      operation: "decrease",
      amount: orderAmount,
      previousBalance,
      newBalance,
      adminNote: `Order payment (${newOrder._id})`,
    });
    await transaction.save();

    user.wallet.balance = newBalance;
    user.wallet.transactions.push(transaction._id);
    user.cartData = {};
    await user.save();

    res.json({
      success: true,
      message: "Order placed successfully",
    });
  } catch (error) {
    console.error("Order placement error:", error.message, error.stack);
    res.status(500).json({ success: false, message: "Order failed" });
  }
};

const verifyOrder = async (req, res) => {
  return res.json({
    success: false,
    message: "Not applicable with wallet system",
  });
};

const userOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({ userId: req.body.userId });
    res.json({ success: true, data: orders });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error fetching orders" });
  }
};

const listOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({});
    res.json({ success: true, data: orders });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error fetching orders" });
  }
};

const updateStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;

    await orderModel.findByIdAndUpdate(orderId, { status }, { new: true });

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
