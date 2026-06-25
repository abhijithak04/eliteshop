import express from "express";

import {
  getProducts,
  getProductById,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
  getTopProducts,
  getSellerProducts,
  getFeaturedProducts,
  getLowStockProducts,
} from "../controllers/productController.js";

import {
  protect,
  adminOnly,
  sellerOnly,
  adminOrSeller,
} from "../middleware/authMiddleware.js";

import checkObjectId from "../middleware/checkObjectId.js";

const router = express.Router();

/* ======================================================
   BASE PATH: /api/products
====================================================== */

/* ======================================================
   STATIC ROUTES FIRST
====================================================== */

router.get(
  "/top",
  getTopProducts
);

router.get(
  "/featured",
  getFeaturedProducts
);

router.get(
  "/seller/products",
  protect,
  sellerOnly,
  getSellerProducts
);

router.get(
  "/lowstock",
  protect,
  adminOnly,
  getLowStockProducts
);

/* ======================================================
   PRODUCT BY SLUG
   GET /api/products/slug/:slug
====================================================== */

router.get(
  "/slug/:slug",
  getProductBySlug
);

/* ======================================================
   ROOT ROUTES
   GET  /api/products
   POST /api/products
====================================================== */

router
  .route("/")
  .get(getProducts)
  .post(
    protect,
    adminOrSeller,
    createProduct
  );

/* ======================================================
   REVIEWS
   POST /api/products/:id/reviews
   IMPORTANT:
   Keep before /:id route
====================================================== */

router.post(
  "/:id/reviews",
  protect,
  checkObjectId,
  createProductReview
);

/* ======================================================
   PRODUCT BY ID
   GET    /api/products/:id
   PUT    /api/products/:id
   DELETE /api/products/:id
====================================================== */

router
  .route("/:id")
  .get(
    checkObjectId,
    getProductById
  )
  .put(
    protect,
    adminOrSeller,
    checkObjectId,
    updateProduct
  )
  .delete(
    protect,
    adminOrSeller,
    checkObjectId,
    deleteProduct
  );

export default router;