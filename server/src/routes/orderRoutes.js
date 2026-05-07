import express from "express";
import Order from "../models/Order.js";
import User from "../models/User.js";
import { adminOnly, protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/", protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate("cart.product");

    if (user.cart.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const deliveryAddress = req.body.deliveryAddress || user.address;
    if (!deliveryAddress) {
      return res.status(400).json({ message: "Delivery address is required" });
    }

    const items = user.cart
      .filter((item) => item.product)
      .map((item) => ({
        product: item.product._id,
        name: item.product.name,
        category: item.product.category,
        price: item.product.price,
        quantity: item.quantity
      }));

    const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const order = await Order.create({
      user: user._id,
      items,
      totalAmount,
      deliveryAddress
    });

    user.cart = [];
    await user.save();

    res.status(201).json({ order });
  } catch (error) {
    next(error);
  }
});

router.get("/my", protect, async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ orders });
  } catch (error) {
    next(error);
  }
});

router.get("/", protect, adminOnly, async (req, res, next) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email phone")
      .sort({ createdAt: -1 });
    res.json({ orders });
  } catch (error) {
    next(error);
  }
});

export default router;
