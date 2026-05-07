import express from "express";
import Product from "../models/Product.js";
import { adminOnly, protect } from "../middleware/auth.js";

const router = express.Router();

router.get("/", protect, async (req, res, next) => {
  try {
    const filter = { isAvailable: true };
    if (req.query.category && req.query.category !== "All") {
      filter.category = req.query.category;
    }

    const products = await Product.find(filter).sort({ category: 1, name: 1 });
    res.json({ products });
  } catch (error) {
    next(error);
  }
});

router.post("/", protect, adminOnly, async (req, res, next) => {
  try {
    const { name, category, price, info, imageUrl = "", isAvailable = true } = req.body;
    const product = await Product.create({
      name,
      category,
      price,
      info,
      imageUrl,
      isAvailable,
      createdBy: req.user._id
    });

    res.status(201).json({ product });
  } catch (error) {
    next(error);
  }
});

export default router;
