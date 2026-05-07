import express from "express";
import Product from "../models/Product.js";
import User from "../models/User.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

async function getCart(userId) {
  const user = await User.findById(userId).populate("cart.product");
  const items = user.cart
    .filter((item) => item.product)
    .map((item) => ({
      product: item.product,
      quantity: item.quantity,
      lineTotal: item.quantity * item.product.price
    }));

  return {
    items,
    totalAmount: items.reduce((sum, item) => sum + item.lineTotal, 0)
  };
}

router.get("/", protect, async (req, res, next) => {
  try {
    res.json(await getCart(req.user._id));
  } catch (error) {
    next(error);
  }
});

router.post("/", protect, async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const product = await Product.findById(productId);

    if (!product || !product.isAvailable) {
      return res.status(404).json({ message: "Food item is not available" });
    }

    const user = await User.findById(req.user._id);
    const existing = user.cart.find((item) => item.product.toString() === productId);

    if (existing) {
      existing.quantity += Number(quantity);
    } else {
      user.cart.push({ product: productId, quantity: Number(quantity) });
    }

    await user.save();
    res.status(201).json(await getCart(req.user._id));
  } catch (error) {
    next(error);
  }
});

router.patch("/:productId", protect, async (req, res, next) => {
  try {
    const quantity = Number(req.body.quantity);
    const user = await User.findById(req.user._id);
    const item = user.cart.find((cartItem) => cartItem.product.toString() === req.params.productId);

    if (!item) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    item.quantity = Math.max(1, quantity);
    await user.save();
    res.json(await getCart(req.user._id));
  } catch (error) {
    next(error);
  }
});

router.delete("/:productId", protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    user.cart = user.cart.filter((item) => item.product.toString() !== req.params.productId);
    await user.save();

    res.json(await getCart(req.user._id));
  } catch (error) {
    next(error);
  }
});

export default router;
