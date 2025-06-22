import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import validator from "validator";

// Create JWT
const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET);
};

// Login User
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "User doesn't exist" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.json({ success: false, message: "Invalid Credentials" });
    }

    const token = createToken(user._id);
    //res.json({ success: true, token });
    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        bup_id: user.bup_id,
        name: user.name,
        email: user.email,
        wallet: user.wallet, // 🟢 Add this line
      },
    });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Login error" });
  }
};

// Register User
const registerUser = async (req, res) => {
  const { name, email, password, bup_id } = req.body;

  try {
    const emailExists = await userModel.findOne({ email });
    if (emailExists) {
      return res.json({ success: false, message: "Email already in use" });
    }

    const bupExists = await userModel.findOne({ bup_id });
    if (bupExists) {
      return res.json({ success: false, message: "BUP ID already in use" });
    }

    if (!validator.isEmail(email)) {
      return res.json({ success: false, message: "Invalid email format" });
    }

    if (password.length < 8) {
      return res.json({
        success: false,
        message: "Password must be at least 8 characters",
      });
    }

    const bupIdRegex = /^\d{11}$/;
    if (!bupIdRegex.test(bup_id)) {
      return res.json({
        success: false,
        message: "BUP ID must be exactly 11 digits",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new userModel({
      name,
      email,
      password: hashedPassword,
      bup_id,
      wallet: {
        balance: 0.0,
        transactions: [],
      },
    });

    const user = await newUser.save();
    const token = createToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        bup_id: user.bup_id,
        name: user.name,
        email: user.email,
        wallet: user.wallet,
      },
    });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Registration error" });
  }
};

export { loginUser, registerUser };
