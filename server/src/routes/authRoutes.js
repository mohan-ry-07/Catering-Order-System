import express from "express";
import User from "../models/User.js";
import { protect } from "../middleware/auth.js";
import { signToken } from "../utils/token.js";

const router = express.Router();

function userResponse(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone,
    address: user.address
  };
}

router.post("/register", async (req, res, next) => {
  try {
    const { name, email, password, role = "user", phone = "", address = "" } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: "Email is already registered" });
    }

    const user = await User.create({ name, email, password, role, phone, address });
    res.status(201).json({ token: signToken(user), user: userResponse(user) });
  } catch (error) {
    next(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    res.json({ token: signToken(user), user: userResponse(user) });
  } catch (error) {
    next(error);
  }
});

router.get("/me", protect, (req, res) => {
  res.json({ user: userResponse(req.user) });
});

router.put("/me", protect, async (req, res, next) => {
  try {
    const { name, phone, address } = req.body;
    const user = await User.findById(req.user._id);

    user.name = name ?? user.name;
    user.phone = phone ?? user.phone;
    user.address = address ?? user.address;
    await user.save();

    res.json({ user: userResponse(user) });
  } catch (error) {
    next(error);
  }
});

export default router;
