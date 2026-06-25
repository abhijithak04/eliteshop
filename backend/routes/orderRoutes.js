import express from "express";

import {
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
} from "../controllers/orderController.js";

import {
  protect,
  adminOnly,
  sellerOnly,
} from "../middleware/authMiddleware.js";

const router = express.Router();

/* ======================================================
   BASE PATH: /api/orders
====================================================== */

/* ======================================================
   CREATE ORDER / ADMIN GET ALL ORDERS
   POST /api/orders
   GET  /api/orders
====================================================== */

router
  .route("/")
  .post(protect, addOrderItems)
  .get(protect, adminOnly, getOrders);

/* ======================================================
   LOGGED-IN USER ORDERS
   GET /api/orders/myorders
====================================================== */

router.get(
  "/myorders",
  protect,
  getMyOrders
);

/* Compatibility route */
router.get(
  "/mine",
  protect,
  getMyOrders
);

/* Compatibility route */
router.get(
  "/user",
  protect,
  getMyOrders
);

/* ======================================================
   SELLER ORDERS
   GET /api/orders/seller
====================================================== */

router.get(
  "/seller",
  protect,
  sellerOnly,
  getSellerOrders
);

/* Compatibility route */
router.get(
  "/seller/orders",
  protect,
  sellerOnly,
  getSellerOrders
);

/* ======================================================
   RAZORPAY ORDER CREATE
   POST /api/orders/razorpay
====================================================== */

router.post(
  "/razorpay",
  protect,
  createRazorpayPayment
);

/* ======================================================
   SINGLE ORDER
   IMPORTANT:
   Keep dynamic /:id routes after static routes
====================================================== */

router.get(
  "/:id",
  protect,
  getOrderById
);

/* ======================================================
   PAY ORDER
   PUT /api/orders/:id/pay
====================================================== */

router.put(
  "/:id/pay",
  protect,
  updateOrderToPaid
);

/* ======================================================
   DELIVER ORDER - ADMIN ONLY
   PUT /api/orders/:id/deliver
====================================================== */

router.put(
  "/:id/deliver",
  protect,
  adminOnly,
  updateOrderToDelivered
);

/* ======================================================
   UPDATE ORDER STATUS - ADMIN ONLY
   PUT /api/orders/:id/status
   body: { status, trackingNumber, courierService }
====================================================== */

router.put(
  "/:id/status",
  protect,
  adminOnly,
  updateOrderStatus
);

/* ======================================================
   SELLER ORDER STATUS UPDATE
   Useful if seller dashboard updates Processing/Shipped
   PUT /api/orders/:id/seller-status
====================================================== */

router.put(
  "/:id/seller-status",
  protect,
  sellerOnly,
  updateOrderStatus
);

/* ======================================================
   CANCEL ORDER
   PUT /api/orders/:id/cancel
   body: { reason }
====================================================== */

router.put(
  "/:id/cancel",
  protect,
  cancelOrder
);

export default router;