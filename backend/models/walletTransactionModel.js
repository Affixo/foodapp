// models/walletTransactionModel.js
import mongoose from "mongoose";

const walletTransactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
  operation: { type: String, enum: ["increase", "decrease"], required: true },
  amount: { type: Number, required: true },
  previousBalance: { type: Number, required: true },
  newBalance: { type: Number, required: true },
  adminNote: { type: String },
  timestamp: { type: Date, default: Date.now },
});

const walletTransactionModel =
  mongoose.models.walletTransaction ||
  mongoose.model("walletTransaction", walletTransactionSchema);
export default walletTransactionModel;
