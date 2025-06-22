//userModel.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    bup_id: {
      type: String,
      required: true,
      unique: true,
      match: [/^\d{11}$/, "BUP ID must be exactly 11 digits"],
    },
    wallet: {
      balance: { type: Number, default: 0.0 }, // in BDT
      transactions: [
        { type: mongoose.Schema.Types.ObjectId, ref: "walletTransaction" },
      ],
    },
    cartData: { type: Object, default: {} },
  },
  { minimize: false }
);

const userModel = mongoose.models.user || mongoose.model("user", userSchema);

export default userModel;
