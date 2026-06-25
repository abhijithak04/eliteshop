import crypto from "crypto";
import Razorpay from "razorpay";

import asyncHandler from "../middleware/asyncHandler.js";

import Order from "../models/orderModel.js";
import Product from "../models/productModel.js";

// ============================================
// RAZORPAY INSTANCE
// Secret key stays only in backend.
// Never expose RAZORPAY_KEY_SECRET to frontend.
// ============================================

const getRazorpayInstance = () => {
  if (!process.env.RAZORPAY_KEY_ID) {
    throw new Error("RAZORPAY_KEY_ID missing in backend .env");
  }

  if (!process.env.RAZORPAY_KEY_SECRET) {
    throw new Error("RAZORPAY_KEY_SECRET missing in backend .env");
  }

  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

// ============================================
// HELPERS
// ============================================

const addDecimals = (num) => {
  return (
    Math.round(Number(num || 0) * 100) / 100
  ).toFixed(2);
};

const isOrderOwner = (order, user) => {
  return (
    order.user?.toString() === user._id.toString() ||
    order.user?._id?.toString() === user._id.toString()
  );
};

const isOrderSeller = (order, user) => {
  return order.orderItems?.some(
    (item) =>
      item.seller?.toString() === user._id.toString() ||
      item.seller?._id?.toString() === user._id.toString()
  );
};

const isClosedOrder = (order) => {
  return [
    "Cancelled",
    "Delivered",
    "Returned",
    "Refunded",
  ].includes(order.orderStatus);
};

const verifyRazorpaySignature = ({
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature,
}) => {
  const generatedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest("hex");

  return generatedSignature === razorpaySignature;
};

// ============================================
// CREATE ORDER
// POST /api/orders
// ============================================

const addOrderItems = asyncHandler(async (req, res) => {
  const {
    orderItems,
    shippingAddress,
    paymentMethod,
  } = req.body;

  if (!orderItems || orderItems.length === 0) {
    res.status(400);
    throw new Error("No order items");
  }

  if (!shippingAddress?.address) {
    res.status(400);
    throw new Error("Shipping address is required");
  }

  if (!shippingAddress?.city) {
    res.status(400);
    throw new Error("City is required");
  }

  if (!shippingAddress?.postalCode) {
    res.status(400);
    throw new Error("Postal code is required");
  }

  if (!shippingAddress?.country) {
    res.status(400);
    throw new Error("Country is required");
  }

  if (!paymentMethod) {
    res.status(400);
    throw new Error("Payment method is required");
  }

  if (!["Razorpay", "COD"].includes(paymentMethod)) {
    res.status(400);
    throw new Error("Invalid payment method");
  }

  const safeOrderItems = [];

  for (const item of orderItems) {
    const product = await Product.findById(item.product);

    if (!product) {
      res.status(404);
      throw new Error(`${item.name || "Product"} not found`);
    }

    // Only block if explicitly false.
    // This prevents old products without isActive field from failing.
    if (product.isActive === false) {
      res.status(400);
      throw new Error(`${product.name} is currently unavailable`);
    }

    if (Number(item.qty || 0) < 1) {
      res.status(400);
      throw new Error(`Invalid quantity for ${product.name}`);
    }

    if (Number(product.countInStock || 0) < Number(item.qty)) {
      res.status(400);
      throw new Error(`${product.name} out of stock`);
    }

    safeOrderItems.push({
      name: product.name,
      qty: Number(item.qty),
      image: product.image,
      price: Number(product.price),
      product: product._id,
      seller:
        product.seller ||
        product.user ||
        item.seller ||
        item.user ||
        undefined,
    });
  }

  // ============================================
  // SERVER-SIDE PRICE CALCULATION
  // Do not trust frontend price totals.
  // ============================================

  const calculatedItemsPrice = addDecimals(
    safeOrderItems.reduce(
      (acc, item) =>
        acc + Number(item.price) * Number(item.qty),
      0
    )
  );

  const calculatedShippingPrice = addDecimals(
    Number(calculatedItemsPrice) > 1000 ? 0 : 80
  );

  const calculatedTaxPrice = addDecimals(
    0.18 * Number(calculatedItemsPrice)
  );

  const calculatedTotalPrice = addDecimals(
    Number(calculatedItemsPrice) +
      Number(calculatedShippingPrice) +
      Number(calculatedTaxPrice)
  );

  const order = new Order({
    orderItems: safeOrderItems,
    user: req.user._id,
    shippingAddress,
    paymentMethod,

    itemsPrice: calculatedItemsPrice,
    taxPrice: calculatedTaxPrice,
    shippingPrice: calculatedShippingPrice,
    totalPrice: calculatedTotalPrice,

    // Use "Pending" to avoid enum mismatch with older orderModel.js
    orderStatus:
      paymentMethod === "COD"
        ? "Confirmed"
        : "Pending",
  });

  const createdOrder = await order.save();

  // ============================================
  // REDUCE STOCK
  // ============================================

  for (const item of safeOrderItems) {
    const product = await Product.findById(item.product);

    if (product) {
      product.countInStock =
        Number(product.countInStock || 0) -
        Number(item.qty || 0);

      product.soldCount =
        Number(product.soldCount || 0) +
        Number(item.qty || 0);

      await product.save();
    }
  }

  res.status(201).json(createdOrder);
});

// ============================================
// GET ORDER BY ID
// GET /api/orders/:id
// ============================================

const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate("user", "name email")
    .populate("orderItems.product");

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  const isOwner =
    order.user._id.toString() === req.user._id.toString();

  const isAdmin = req.user.role === "admin";

  const isSeller = isOrderSeller(order, req.user);

  if (!isOwner && !isAdmin && !isSeller) {
    res.status(401);
    throw new Error("Not authorized");
  }

  res.json(order);
});

// ============================================
// GET MY ORDERS
// GET /api/orders/myorders
// ============================================

const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({
    user: req.user._id,
  }).sort({
    createdAt: -1,
  });

  res.json(orders);
});

// ============================================
// GET SELLER ORDERS
// GET /api/orders/seller
// ============================================

const getSellerOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({
    "orderItems.seller": req.user._id,
  })
    .populate("user", "name email")
    .sort({
      createdAt: -1,
    });

  res.json(orders);
});

// ============================================
// ADMIN GET ALL ORDERS
// GET /api/orders
// ============================================

const getOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({})
    .populate("user", "id name email")
    .sort({
      createdAt: -1,
    });

  res.json(orders);
});

// ============================================
// CREATE RAZORPAY ORDER
// POST /api/orders/razorpay
// Frontend calls only this backend endpoint.
// Backend calls Razorpay securely.
// ============================================

const createRazorpayPayment = asyncHandler(async (req, res) => {
  const { amount, orderId } = req.body;

  console.log("RAZORPAY REQUEST BODY:", req.body);

  if (!orderId) {
    res.status(400);
    throw new Error("Local orderId is required");
  }

  const order = await Order.findById(orderId);

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  if (!isOrderOwner(order, req.user)) {
    res.status(401);
    throw new Error("Not authorized to pay this order");
  }

  if (order.isPaid) {
    res.status(400);
    throw new Error("Order is already paid");
  }

  if (isClosedOrder(order)) {
    res.status(400);
    throw new Error("Closed order cannot be paid");
  }

  if (order.paymentMethod !== "Razorpay") {
    res.status(400);
    throw new Error("This order is not a Razorpay order");
  }

  const backendTotal = Number(order.totalPrice);
  const frontendAmount = Number(amount);

  if (Number.isNaN(frontendAmount)) {
    res.status(400);
    throw new Error("Invalid payment amount");
  }

  if (Math.abs(backendTotal - frontendAmount) > 1) {
    res.status(400);
    throw new Error(
      `Payment amount mismatch. Backend: ${backendTotal}, Frontend: ${frontendAmount}`
    );
  }

  const razorpay = getRazorpayInstance();

  const razorpayOrder = await razorpay.orders.create({
    amount: Math.round(backendTotal * 100),
    currency: "INR",
    receipt: `elite_${order._id.toString().slice(-18)}`,
    notes: {
      localOrderId: order._id.toString(),
      userId: req.user._id.toString(),
      email: req.user.email || "",
    },
  });

  order.paymentResult = {
    id: "",
    status: "RAZORPAY_ORDER_CREATED",
    update_time: new Date().toISOString(),
    email_address: req.user.email || "",
    razorpay_order_id: razorpayOrder.id,
    razorpay_payment_id: "",
    razorpay_signature: "",
  };

  order.orderStatus = "Pending";

  await order.save();

  res.status(201).json({
    id: razorpayOrder.id,
    order_id: razorpayOrder.id,
    amount: razorpayOrder.amount,
    currency: razorpayOrder.currency,
    receipt: razorpayOrder.receipt,

    // Public key only. Safe for frontend.
    key: process.env.RAZORPAY_KEY_ID,
  });
});

// ============================================
// UPDATE ORDER TO PAID
// PUT /api/orders/:id/pay
// Verifies Razorpay signature before marking paid.
// ============================================

const updateOrderToPaid = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  if (!isOrderOwner(order, req.user)) {
    res.status(401);
    throw new Error("Not authorized");
  }

  if (order.isPaid) {
    res.status(400);
    throw new Error("Order already paid");
  }

  if (isClosedOrder(order)) {
    res.status(400);
    throw new Error("Closed order cannot be paid");
  }

  if (order.paymentMethod === "COD") {
    order.isPaid = false;
    order.orderStatus = "Confirmed";

    const updatedCODOrder = await order.save();

    res.json(updatedCODOrder);
    return;
  }

  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  } = req.body;

  if (
    !razorpay_order_id ||
    !razorpay_payment_id ||
    !razorpay_signature
  ) {
    res.status(400);
    throw new Error("Razorpay payment verification data is missing");
  }

  const savedRazorpayOrderId =
    order.paymentResult?.razorpay_order_id;

  if (
    savedRazorpayOrderId &&
    savedRazorpayOrderId !== razorpay_order_id
  ) {
    res.status(400);
    throw new Error("Razorpay order id mismatch");
  }

  const isValidSignature = verifyRazorpaySignature({
    razorpayOrderId: razorpay_order_id,
    razorpayPaymentId: razorpay_payment_id,
    razorpaySignature: razorpay_signature,
  });

  if (!isValidSignature) {
    res.status(400);
    throw new Error("Invalid Razorpay signature");
  }

  order.isPaid = true;
  order.paidAt = Date.now();
  order.orderStatus = "Confirmed";

  order.paymentResult = {
    id: razorpay_payment_id,
    status: "COMPLETED",
    update_time:
      req.body.update_time ||
      new Date().toISOString(),
    email_address:
      req.body.email_address ||
      req.user.email ||
      "",

    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  };

  const updatedOrder = await order.save();

  res.json(updatedOrder);
});

// ============================================
// UPDATE ORDER TO DELIVERED
// PUT /api/orders/:id/deliver
// ============================================

const updateOrderToDelivered = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  if (order.orderStatus === "Cancelled") {
    res.status(400);
    throw new Error("Cancelled order cannot be delivered");
  }

  order.isDelivered = true;
  order.deliveredAt = Date.now();
  order.orderStatus = "Delivered";

  const updatedOrder = await order.save();

  res.json(updatedOrder);
});

// ============================================
// UPDATE ORDER STATUS
// PUT /api/orders/:id/status
// ============================================

const updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  const allowedStatuses = [
    "Pending",
    "Confirmed",
    "Processing",
    "Packed",
    "Shipped",
    "Out For Delivery",
    "Delivered",
    "Cancelled",
    "Returned",
  ];

  const nextStatus =
    req.body.status || order.orderStatus;

  if (!allowedStatuses.includes(nextStatus)) {
    res.status(400);
    throw new Error("Invalid order status");
  }

  order.orderStatus = nextStatus;

  order.trackingNumber =
    req.body.trackingNumber ||
    order.trackingNumber;

  order.courierService =
    req.body.courierService ||
    order.courierService;

  if (nextStatus === "Delivered") {
    order.isDelivered = true;
    order.deliveredAt =
      order.deliveredAt || Date.now();
  }

  const updatedOrder = await order.save();

  res.json(updatedOrder);
});

// ============================================
// CANCEL ORDER
// PUT /api/orders/:id/cancel
// ============================================

const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  const isOwner = isOrderOwner(order, req.user);
  const isAdmin = req.user.role === "admin";

  if (!isOwner && !isAdmin) {
    res.status(401);
    throw new Error("Not authorized");
  }

  if (order.orderStatus === "Cancelled") {
    res.status(400);
    throw new Error("Order already cancelled");
  }

  if (order.isDelivered) {
    res.status(400);
    throw new Error("Delivered order cannot be cancelled");
  }

  if (order.isPaid && !isAdmin) {
    res.status(400);
    throw new Error(
      "Paid orders need admin support for cancellation/refund"
    );
  }

  // RESTORE STOCK

  for (const item of order.orderItems) {
    const product = await Product.findById(item.product);

    if (product) {
      product.countInStock =
        Number(product.countInStock || 0) +
        Number(item.qty || 0);

      product.soldCount = Math.max(
        Number(product.soldCount || 0) -
          Number(item.qty || 0),
        0
      );

      await product.save();
    }
  }

  order.orderStatus = "Cancelled";
  order.cancelReason =
    req.body.reason || "Cancelled by user";

  const updatedOrder = await order.save();

  res.json(updatedOrder);
});

export {
  addOrderItems,
  getOrderById,
  getMyOrders,
  getSellerOrders,
  getOrders,
  updateOrderToPaid,
  updateOrderToDelivered,
  updateOrderStatus,
  cancelOrder,
  createRazorpayPayment,
};