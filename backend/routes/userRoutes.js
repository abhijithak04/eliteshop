import express from "express";

import {
  authUser,
  authSeller,
  registerUser,
  registerSeller,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  getUsers,
  getSellers,
  deleteUser,
  getUserById,
  updateUser,
  approveSeller,
  rejectSeller,
  addToWishlist,
  removeFromWishlist,
  getWishlist,
  updateWishlistSettings,
  clearWishlist,
} from "../controllers/userController.js";

import {
  protect,
  adminOnly,
} from "../middleware/authMiddleware.js";

const router = express.Router();

// ======================================
// PUBLIC USER ROUTES
// BASE PATH: /api/users
// ======================================

// Normal customer register
// POST /api/users
router
  .route("/")
  .post(registerUser)
  .get(protect, adminOnly, getUsers);

// Normal customer/admin login
// POST /api/users/auth
router.post(
  "/auth",
  authUser
);

// Logout
// POST /api/users/logout
router.post(
  "/logout",
  logoutUser
);

// ======================================
// REAL SELLER AUTH ROUTES
// IMPORTANT: Keep before "/:id"
// ======================================

// Seller register
// POST /api/users/seller/register
router.post(
  "/seller/register",
  registerSeller
);

// Seller login
// POST /api/users/seller/auth
router.post(
  "/seller/auth",
  authSeller
);

// ======================================
// LOGGED-IN USER PROFILE ROUTES
// IMPORTANT: Keep before "/:id"
// ======================================

// GET /api/users/profile
// PUT /api/users/profile
router
  .route("/profile")
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

// ======================================
// USER WISHLIST ROUTES
// IMPORTANT: Keep before "/:id"
// ======================================

// GET /api/users/wishlist
// DELETE /api/users/wishlist
router
  .route("/wishlist")
  .get(protect, getWishlist)
  .delete(protect, clearWishlist);

// POST /api/users/wishlist/:productId
// PUT /api/users/wishlist/:productId
// DELETE /api/users/wishlist/:productId
router
  .route("/wishlist/:productId")
  .post(protect, addToWishlist)
  .put(protect, addToWishlist)
  .delete(protect, removeFromWishlist);

// PUT /api/users/wishlist/:productId/settings
router
  .route("/wishlist")
  .get(protect, getWishlist)
  .delete(protect, clearWishlist);

  router.put(
    "/wishlist/:productId/settings",
    protect,
    updateWishlistSettings
  );

  router
    .route("/wishlist/:productId")
    .post(protect, addToWishlist)
    .put(protect, addToWishlist)
  .delete(protect, removeFromWishlist); 
// ======================================
// ADMIN SELLER MANAGEMENT ROUTES
// IMPORTANT: Keep before "/:id"
// ======================================

// GET /api/users/sellers
router.get(
  "/sellers",
  protect,
  adminOnly,
  getSellers
);

// PUT /api/users/sellers/:id/approve
router.put(
  "/sellers/:id/approve",
  protect,
  adminOnly,
  approveSeller
);

// PUT /api/users/sellers/:id/reject
router.put(
  "/sellers/:id/reject",
  protect,
  adminOnly,
  rejectSeller
);

// ======================================
// COMPATIBILITY ROUTES
// Keep this only because old frontend pages may use these paths
// ======================================

// PUT /api/users/:id/approve-seller
router.put(
  "/:id/approve-seller",
  protect,
  adminOnly,
  approveSeller
);

// PUT /api/users/:id/reject-seller
router.put(
  "/:id/reject-seller",
  protect,
  adminOnly,
  rejectSeller
);

// ======================================
// ADMIN USER MANAGEMENT ROUTES
// IMPORTANT: Keep this at the bottom
// ======================================

// DELETE /api/users/:id
// GET /api/users/:id
// PUT /api/users/:id
router
  .route("/:id")
  .delete(protect, adminOnly, deleteUser)
  .get(protect, adminOnly, getUserById)
  .put(protect, adminOnly, updateUser);

export default router;