import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: String,
      enum: ["North", "South", "East", "West"],
      required: true
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    info: {
      type: String,
      required: true,
      trim: true
    },
    imageUrl: {
      type: String,
      trim: true,
      default: ""
    },
    isAvailable: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);
