import express from "express";
import userModel from "../models/userModel.js";
import walletTransactionModel from "../models/walletTransactionModel.js";

const router = express.Router();

// ✅ Get user by BUP ID (used in WalletAdminPanel)
router.get("/wallet/user/:bupId", async (req, res) => {
  try {
    const user = await userModel.findOne({
      bup_id: { $regex: req.params.bupId, $options: "i" },
    });
    if (!user) return res.status(404).json({ message: "User not found" });

    const transactions = await walletTransactionModel
      .find({ userId: user._id })
      .sort({ timestamp: -1 });

    res.json({
      user: {
        _id: user._id,
        bup_id: user.bup_id,
        name: user.name,
        email: user.email,
        lastTransaction: transactions[0]?.timestamp || "N/A",
        walletBalance: user.wallet?.balance ?? 0,
      },
      transactions,
    });
  } catch (error) {
    console.error("Error fetching user by BUP ID:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Update wallet balance (Add/Deduct)
router.post("/wallet/update", async (req, res) => {
  try {
    const { userId, amount, operation, adminNote } = req.body;
    const user = await userModel.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    const prevBalance = user.wallet?.balance ?? 0;
    let newBalance;

    if (operation === "increase") {
      newBalance = prevBalance + parsedAmount;
    } else if (operation === "decrease") {
      if (prevBalance < parsedAmount) {
        return res.status(400).json({ message: "Insufficient balance" });
      }
      newBalance = prevBalance - parsedAmount;
    } else {
      return res.status(400).json({ message: "Invalid operation" });
    }

    // Update wallet balance
    user.wallet.balance = newBalance;

    // Create a transaction
    const transaction = new walletTransactionModel({
      userId,
      operation,
      amount: parsedAmount,
      previousBalance: prevBalance,
      newBalance,
      adminNote,
    });
    await transaction.save();

    // Push transaction ID to user's wallet.transactions
    user.wallet.transactions.push(transaction._id);

    // Save updated user
    await user.save();

    const updatedUser = await userModel
      .findById(userId)
      .populate("wallet.transactions");

    res.json({
      updatedUser: {
        _id: updatedUser._id,
        bup_id: updatedUser.bup_id,
        name: updatedUser.name,
        email: updatedUser.email,
        wallet: {
          balance: updatedUser.wallet.balance,
          transactions: updatedUser.wallet.transactions, // populated transactions
        },
      },
      newTransaction: transaction,
    });
  } catch (error) {
    console.error("Error updating wallet:", error);
    res.status(500).json({ message: "Error updating wallet" });
  }
});

// ✅ (Optional) Get all wallet transactions
router.get("/wallet/transactions", async (req, res) => {
  try {
    const transactions = await walletTransactionModel
      .find()
      .populate("userId", "name email bup_id")
      .sort({ timestamp: -1 });

    res.json({ success: true, data: transactions });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ message: "Error fetching transactions" });
  }
});

export default router;
