import mongoose from "mongoose";

const cartItemSchema = mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      default: "",
    },

    image: {
      type: String,
      default: "/placeholder.svg",
    },

    price: {
      type: Number,
      required: true,
      default: 0,
    },

    originalPrice: {
      type: Number,
      default: 0,
    },

    brand: {
      type: String,
      default: "EliteShop",
    },

    category: {
      type: String,
      default: "General",
    },

    countInStock: {
      type: Number,
      default: 0,
    },

    qty: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
  },
  {
    _id: false,
  }
);

const cartSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },

    cartItems: {
      type: [cartItemSchema],
      default: [],
    },

    coupon: {
      code: {
        type: String,
        default: "",
      },

      discount: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
  }
);

const Cart =
  mongoose.models.Cart ||
  mongoose.model("Cart", cartSchema);

export default Cart;