import mongoose from "mongoose";

// ============================================
// ORDER ITEM SCHEMA
// ============================================

const orderItemSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    qty: {
      type: Number,
      required: true,
      min: 1,
    },

    image: {
      type: String,
      required: true,
    },

    price: {
      type: Number,
      required: true,
      default: 0,
    },

    product: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Product",
    },

    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    _id: false,
  }
);

// ============================================
// SHIPPING SCHEMA
// Matches your upgraded Shipping.jsx
// ============================================

const shippingSchema = mongoose.Schema(
  {
    fullName: {
      type: String,
      trim: true,
      default: "",
    },

    phone: {
      type: String,
      trim: true,
      default: "",
    },

    address: {
      type: String,
      required: true,
      trim: true,
    },

    landmark: {
      type: String,
      trim: true,
      default: "",
    },

    city: {
      type: String,
      required: true,
      trim: true,
    },

    state: {
      type: String,
      trim: true,
      default: "",
    },

    postalCode: {
      type: String,
      required: true,
      trim: true,
    },

    country: {
      type: String,
      required: true,
      trim: true,
      default: "India",
    },

    addressType: {
      type: String,
      enum: ["Home", "Office", "Other"],
      default: "Home",
    },

    deliveryInstruction: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    _id: false,
  }
);

// ============================================
// PAYMENT RESULT SCHEMA
// Razorpay signature fields are required for secure verification.
// ============================================

const paymentResultSchema = mongoose.Schema(
  {
    id: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      default: "",
    },

    update_time: {
      type: String,
      default: "",
    },

    email_address: {
      type: String,
      default: "",
    },

    razorpay_order_id: {
      type: String,
      default: "",
    },

    razorpay_payment_id: {
      type: String,
      default: "",
    },

    razorpay_signature: {
      type: String,
      default: "",
    },
  },
  {
    _id: false,
  }
);

// ============================================
// ORDER SCHEMA
// ============================================

const orderSchema = mongoose.Schema(
  {
    // =========================================
    // USER
    // =========================================

    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },

    // =========================================
    // ORDER ITEMS
    // =========================================

    orderItems: {
      type: [orderItemSchema],
      required: true,
      validate: [
        (value) => value.length > 0,
        "Order must have at least one item",
      ],
    },

    // =========================================
    // SHIPPING
    // =========================================

    shippingAddress: {
      type: shippingSchema,
      required: true,
    },

    // =========================================
    // PAYMENT
    // =========================================

    paymentMethod: {
      type: String,
      required: true,
      enum: ["Razorpay", "COD"],
      default: "Razorpay",
    },

    paymentResult: {
      type: paymentResultSchema,
      default: {},
    },

    // =========================================
    // PRICING
    // =========================================

    itemsPrice: {
      type: Number,
      required: true,
      default: 0,
    },

    taxPrice: {
      type: Number,
      required: true,
      default: 0,
    },

    shippingPrice: {
      type: Number,
      required: true,
      default: 0,
    },

    discountPrice: {
      type: Number,
      default: 0,
    },

    totalPrice: {
      type: Number,
      required: true,
      default: 0,
    },

    // =========================================
    // PAYMENT STATUS
    // =========================================

    isPaid: {
      type: Boolean,
      required: true,
      default: false,
    },

    paidAt: {
      type: Date,
    },

    // =========================================
    // DELIVERY STATUS
    // =========================================

    isDelivered: {
      type: Boolean,
      required: true,
      default: false,
    },

    deliveredAt: {
      type: Date,
    },

    estimatedDelivery: {
      type: Date,
      default: () =>
        new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    },

    // =========================================
    // ORDER STATUS
    // Must match orderController.js
    // =========================================

        orderStatus: {
      type: String,
      enum: [
        "Pending",
        "Pending Payment",
        "Confirmed",
        "Processing",
        "Packed",
        "Shipped",
        "Out For Delivery",
        "Delivered",
        "Cancelled",
        "Returned",
        "Refund Processing",
        "Refunded",
        "Failed",
      ],
      default: "Pending",
    },
        

    // =========================================
    // TRACKING
    // =========================================

    trackingNumber: {
      type: String,
      trim: true,
      default: "",
    },

    courierService: {
      type: String,
      trim: true,
      default: "",
    },

    // =========================================
    // CANCELLATION / RETURN
    // =========================================

    cancelReason: {
      type: String,
      trim: true,
      default: "",
    },

    returnReason: {
      type: String,
      trim: true,
      default: "",
    },

    // =========================================
    // NOTES
    // =========================================

    customerNote: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// ============================================
// INDEXES
// ============================================

orderSchema.index({
  user: 1,
  createdAt: -1,
});

orderSchema.index({
  orderStatus: 1,
});

orderSchema.index({
  isPaid: 1,
});

orderSchema.index({
  createdAt: -1,
});

orderSchema.index({
  "orderItems.seller": 1,
});

orderSchema.index({
  "paymentResult.razorpay_order_id": 1,
});

orderSchema.index({
  "paymentResult.razorpay_payment_id": 1,
});

// ============================================
// MODEL
// ============================================

const Order =
  mongoose.models.Order ||
  mongoose.model("Order", orderSchema);

export default Order;