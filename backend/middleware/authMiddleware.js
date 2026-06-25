import jwt from "jsonwebtoken";

import asyncHandler from "./asyncHandler.js";
import User from "../models/userModel.js";

// ======================================
// GET TOKEN FROM COOKIE OR HEADER
// ======================================

const getTokenFromRequest = (req) => {
  let token = null;

  if (req.cookies?.jwt) {
    token = req.cookies.jwt;
  }

  if (
    !token &&
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  return token;
};

// ======================================
// PROTECT ROUTE
// LOGIN REQUIRED
// ======================================

const protect = asyncHandler(async (req, res, next) => {
  const token = getTokenFromRequest(req);

  if (!token) {
    res.status(401);
    throw new Error("Not authorized, no token");
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    const user = await User.findById(
      decoded.userId || decoded.id
    ).select("-password");

    if (!user) {
      res.status(401);
      throw new Error("User not found");
    }

    if (user.isActive === false) {
      res.status(403);
      throw new Error("Account disabled. Please contact support.");
    }

    req.user = user;

    next();
  } catch (error) {
    console.error("JWT Error:", error.message);

    res.status(401);

    if (error.name === "TokenExpiredError") {
      throw new Error("Session expired, login again");
    }

    throw new Error("Not authorized, token failed");
  }
});

// ======================================
// ADMIN ONLY
// ======================================

const adminOnly = (req, res, next) => {
  if (
    req.user &&
    (
      req.user.role === "admin" ||
      req.user.isAdmin === true
    )
  ) {
    next();
    return;
  }

  res.status(403);
  throw new Error("Access denied: Admin only");
};

// ======================================
// SELLER ONLY
// APPROVED SELLER REQUIRED
// ======================================

const sellerOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "seller") {
    res.status(403);
    throw new Error("Access denied: Seller only");
  }

  if (req.user.sellerInfo?.isApproved === true) {
    next();
    return;
  }

  res.status(403);
  throw new Error("Seller not approved by admin");
};

// ======================================
// SELLER ACCOUNT ONLY
// APPROVAL NOT REQUIRED
// Useful for /seller/pending type pages
// ======================================

const sellerAccountOnly = (req, res, next) => {
  if (req.user && req.user.role === "seller") {
    next();
    return;
  }

  res.status(403);
  throw new Error("Access denied: Seller account only");
};

// ======================================
// ADMIN OR APPROVED SELLER
// ======================================

const adminOrSeller = (req, res, next) => {
  if (!req.user) {
    res.status(403);
    throw new Error("Access denied");
  }

  if (
    req.user.role === "admin" ||
    req.user.isAdmin === true
  ) {
    next();
    return;
  }

  if (
    req.user.role === "seller" &&
    req.user.sellerInfo?.isApproved === true
  ) {
    next();
    return;
  }

  res.status(403);
  throw new Error("Access denied: Admin or Approved Seller only");
};

export {
  protect,
  adminOnly,
  sellerOnly,
  sellerAccountOnly,
  adminOrSeller,
};