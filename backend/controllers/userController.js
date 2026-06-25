import asyncHandler from "../middleware/asyncHandler.js";
import generateToken from "../utils/generateToken.js";
import User from "../models/userModel.js";
import Product from "../models/productModel.js";

// ======================================
// HELPER - USER RESPONSE
// ======================================

const sendUserResponse = (user) => {
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    isAdmin: user.isAdmin,
    isVerified: user.isVerified,

    phone: user.phone || "",
    address: user.address || "",
    avatar: user.avatar || "/images/default-avatar.png",
    gender: user.gender || "",
    dateOfBirth: user.dateOfBirth || null,
    bio: user.bio || "",

    isActive: user.isActive,
    lastLoginAt: user.lastLoginAt,
    lastPasswordChangedAt: user.lastPasswordChangedAt,

    sellerInfo: user.sellerInfo || {},
    walletBalance: user.walletBalance || 0,
    notificationPreferences: user.notificationPreferences,

    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

// ======================================
// HELPER - SAFE SELLER INFO BUILDER
// ======================================

const buildSellerInfo = (user, extra = {}) => {
  const old = user.sellerInfo || {};

  return {
    shopName: old.shopName || user.name || "EliteShop Seller",
    shopAddress: old.shopAddress || user.address || "",
    gstNumber: old.gstNumber || "",
    bankAccount: old.bankAccount || "",
    businessPhone: old.businessPhone || user.phone || "",
    businessEmail: old.businessEmail || user.email || "",
    pickupAddress: old.pickupAddress || old.shopAddress || user.address || "",
    productCategory: old.productCategory || "",
    businessDescription: old.businessDescription || old.description || "",
    logo: old.logo || "",
    description: old.description || old.businessDescription || "",
    isApproved: Boolean(old.isApproved),
    approvedAt: old.approvedAt,
    rejectedReason: old.rejectedReason || "",
    ...extra,
  };
};

// ======================================
// NORMAL USER / ADMIN LOGIN
// POST /api/users/auth
// ======================================

const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error("Please enter email and password");
  }

  const user = await User.findOne({
    email: email.toLowerCase().trim(),
  });

  if (!user) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  if (user.role === "seller") {
    res.status(403);
    throw new Error("Seller accounts must login from seller login page");
  }

  if (user.isActive === false) {
    res.status(403);
    throw new Error("Your account is disabled. Please contact support.");
  }

  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  user.lastLoginAt = new Date();
  await user.save();

  const token = generateToken(res, user._id);

  res.json({
    ...sendUserResponse(user),
    token,
  });
});

// ======================================
// SELLER LOGIN
// POST /api/users/seller/auth
// ======================================

const authSeller = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error("Please enter seller email and password");
  }

  const seller = await User.findOne({
    email: email.toLowerCase().trim(),
  });

  if (!seller) {
    res.status(401);
    throw new Error("Invalid seller email or password");
  }

  if (seller.role !== "seller") {
    res.status(403);
    throw new Error("This account is not registered as a seller");
  }

  if (seller.isActive === false) {
    res.status(403);
    throw new Error("Your seller account is disabled. Please contact admin.");
  }

  const isMatch = await seller.matchPassword(password);

  if (!isMatch) {
    res.status(401);
    throw new Error("Invalid seller email or password");
  }

  seller.lastLoginAt = new Date();
  await seller.save();

  const token = generateToken(res, seller._id);

  res.json({
    ...sendUserResponse(seller),
    token,
    sellerApprovalStatus: seller.sellerInfo?.isApproved
      ? "approved"
      : "pending",
    canSell: Boolean(seller.sellerInfo?.isApproved),
    message: seller.sellerInfo?.isApproved
      ? "Seller login successful"
      : "Seller login successful. Your account is waiting for admin approval.",
  });
});

// ======================================
// REGISTER NORMAL USER
// POST /api/users
// ======================================

const registerUser = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    password,
    phone,
    address,
    avatar,
    gender,
    dateOfBirth,
  } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Name, email and password are required");
  }

  if (name.trim().length < 3) {
    res.status(400);
    throw new Error("Name must be at least 3 characters");
  }

  if (password.length < 6) {
    res.status(400);
    throw new Error("Password must be at least 6 characters");
  }

  const userExists = await User.findOne({
    email: email.toLowerCase().trim(),
  });

  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  const user = await User.create({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    password,
    role: "user",
    isAdmin: false,
    phone: phone || "",
    address: address || "",
    avatar: avatar || "/images/default-avatar.png",
    gender: gender || "",
    dateOfBirth: dateOfBirth || undefined,
    isActive: true,
    isVerified: false,
  });

  if (!user) {
    res.status(400);
    throw new Error("Invalid user data");
  }

  res.status(201).json({
    success: true,
    message: "Registration successful. Please login.",
  });
});

// ======================================
// REGISTER SELLER
// POST /api/users/seller/register
// ======================================

const registerSeller = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    password,
    phone,
    avatar,

    shopName,
    shopAddress,
    gstNumber,
    bankAccount,
    businessPhone,
    businessEmail,
    pickupAddress,
    productCategory,
    businessDescription,
  } = req.body;

  if (!name || !email || !password || !phone) {
    res.status(400);
    throw new Error("Owner name, email, phone and password are required");
  }

  if (name.trim().length < 3) {
    res.status(400);
    throw new Error("Owner name must be at least 3 characters");
  }

  if (password.length < 6) {
    res.status(400);
    throw new Error("Password must be at least 6 characters");
  }

  if (!/^[6-9]\d{9}$/.test(phone.trim())) {
    res.status(400);
    throw new Error("Please enter a valid Indian mobile number");
  }

  if (
    !shopName ||
    !shopAddress ||
    !businessPhone ||
    !businessEmail ||
    !pickupAddress ||
    !productCategory ||
    !businessDescription
  ) {
    res.status(400);
    throw new Error("Please fill all required seller business details");
  }

  const userExists = await User.findOne({
    email: email.toLowerCase().trim(),
  });

  if (userExists) {
    res.status(400);
    throw new Error("An account already exists with this email");
  }

  const seller = await User.create({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    password,
    role: "seller",
    isAdmin: false,
    phone: phone.trim(),
    avatar: avatar || "/images/default-avatar.png",
    isActive: true,
    isVerified: false,

    sellerInfo: {
      shopName: shopName.trim(),
      shopAddress: shopAddress.trim(),
      gstNumber: gstNumber || "",
      bankAccount: bankAccount || "",
      businessPhone: businessPhone.trim(),
      businessEmail: businessEmail.toLowerCase().trim(),
      pickupAddress: pickupAddress.trim(),
      productCategory,
      businessDescription: businessDescription.trim(),
      isApproved: false,
      approvedAt: undefined,
      rejectedReason: "",
      logo: "",
      description: businessDescription.trim(),
    },
  });

  if (!seller) {
    res.status(400);
    throw new Error("Invalid seller data");
  }

  res.status(201).json({
    success: true,
    message:
      "Seller account created successfully. Please login and wait for admin approval.",
  });
});

// ======================================
// LOGOUT
// POST /api/users/logout
// ======================================

const logoutUser = (req, res) => {
  res.clearCookie("jwt", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite:
      process.env.NODE_ENV === "production"
        ? "none"
        : "strict",
  });

  res.status(200).json({
    message: "Logged out successfully",
  });
};

// ======================================
// GET PROFILE
// GET /api/users/profile
// ======================================

const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .select("-password")
    .populate("wishlist.product");

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  res.json(user);
});

// ======================================
// UPDATE PROFILE
// PUT /api/users/profile
// ======================================

const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  if (
    req.body.email &&
    req.body.email.toLowerCase().trim() !== user.email
  ) {
    const emailExists = await User.findOne({
      email: req.body.email.toLowerCase().trim(),
      _id: {
        $ne: user._id,
      },
    });

    if (emailExists) {
      res.status(400);
      throw new Error("Email already in use");
    }
  }

  user.name = req.body.name?.trim() || user.name;

  user.email = req.body.email
    ? req.body.email.toLowerCase().trim()
    : user.email;

  user.phone = req.body.phone ?? user.phone;
  user.address = req.body.address ?? user.address;
  user.avatar = req.body.avatar || user.avatar;
  user.gender = req.body.gender ?? user.gender;
  user.bio = req.body.bio ?? user.bio;

  if (req.body.dateOfBirth) {
    user.dateOfBirth = req.body.dateOfBirth;
  }

  if (Array.isArray(req.body.addresses)) {
    user.addresses = req.body.addresses;
  }

  if (req.body.notificationPreferences) {
    user.notificationPreferences = {
      ...user.notificationPreferences,
      ...req.body.notificationPreferences,
    };
  }

  if (user.role === "seller") {
    user.sellerInfo = buildSellerInfo(user, {
      shopName:
        req.body.shopName ?? user.sellerInfo?.shopName ?? `${user.name} Store`,

      shopAddress:
        req.body.shopAddress ?? user.sellerInfo?.shopAddress ?? "",

      gstNumber:
        req.body.gstNumber ?? user.sellerInfo?.gstNumber ?? "",

      bankAccount:
        req.body.bankAccount ?? user.sellerInfo?.bankAccount ?? "",

      businessPhone:
        req.body.businessPhone ??
        user.sellerInfo?.businessPhone ??
        user.phone ??
        "",

      businessEmail:
        req.body.businessEmail ??
        user.sellerInfo?.businessEmail ??
        user.email ??
        "",

      pickupAddress:
        req.body.pickupAddress ??
        user.sellerInfo?.pickupAddress ??
        user.sellerInfo?.shopAddress ??
        "",

      productCategory:
        req.body.productCategory ??
        user.sellerInfo?.productCategory ??
        "",

      logo: req.body.logo ?? user.sellerInfo?.logo ?? "",

      description:
        req.body.description ??
        user.sellerInfo?.description ??
        "",

      businessDescription:
        req.body.businessDescription ??
        user.sellerInfo?.businessDescription ??
        "",

      isApproved: user.sellerInfo?.isApproved ?? false,
      approvedAt: user.sellerInfo?.approvedAt,
      rejectedReason: user.sellerInfo?.rejectedReason ?? "",
    });

    user.markModified("sellerInfo");
  }

  if (req.body.password) {
    if (req.body.password.length < 6) {
      res.status(400);
      throw new Error("Password must be at least 6 characters");
    }

    user.password = req.body.password;
    user.lastPasswordChangedAt = new Date();
  }

  const updatedUser = await user.save();

  res.json(sendUserResponse(updatedUser));
});

// ======================================
// ADMIN — GET ALL USERS
// GET /api/users
// ======================================

const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({})
    .select("-password")
    .sort({
      createdAt: -1,
    });

  res.json(users);
});

// ======================================
// ADMIN — GET ALL SELLERS
// GET /api/users/sellers
// ======================================

const getSellers = asyncHandler(async (req, res) => {
  const sellers = await User.find({
    role: "seller",
  })
    .select("-password")
    .sort({
      createdAt: -1,
    });

  res.json(sellers);
});

// ======================================
// ADMIN — DELETE USER
// DELETE /api/users/:id
// ======================================

const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  if (user.role === "admin" || user.isAdmin) {
    res.status(400);
    throw new Error("Cannot delete admin user");
  }

  await User.deleteOne({
    _id: user._id,
  });

  res.json({
    message: "User removed",
  });
});

// ======================================
// ADMIN — GET USER BY ID
// GET /api/users/:id
// ======================================

const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  res.json(user);
});

// ======================================
// ADMIN — UPDATE USER
// PUT /api/users/:id
// ======================================

const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  if (
    req.body.email &&
    req.body.email.toLowerCase().trim() !== user.email
  ) {
    const emailExists = await User.findOne({
      email: req.body.email.toLowerCase().trim(),
      _id: {
        $ne: user._id,
      },
    });

    if (emailExists) {
      res.status(400);
      throw new Error("Email already in use");
    }
  }

  user.name = req.body.name?.trim() || user.name;

  user.email = req.body.email
    ? req.body.email.toLowerCase().trim()
    : user.email;

  user.phone = req.body.phone ?? user.phone;
  user.address = req.body.address ?? user.address;
  user.avatar = req.body.avatar || user.avatar;
  user.gender = req.body.gender ?? user.gender;
  user.bio = req.body.bio ?? user.bio;
  user.isActive = req.body.isActive ?? user.isActive;
  user.isVerified = req.body.isVerified ?? user.isVerified;

  if (req.body.dateOfBirth) {
    user.dateOfBirth = req.body.dateOfBirth;
  }

  if (req.body.role) {
    user.role = req.body.role;
    user.isAdmin = req.body.role === "admin";
  }

  if (user.role === "seller") {
    const nextIsApproved =
      req.body.isApproved !== undefined
        ? Boolean(req.body.isApproved)
        : Boolean(user.sellerInfo?.isApproved);

    user.sellerInfo = buildSellerInfo(user, {
      shopName:
        req.body.shopName ?? user.sellerInfo?.shopName ?? `${user.name} Store`,

      shopAddress:
        req.body.shopAddress ??
        user.sellerInfo?.shopAddress ??
        user.address ??
        "",

      gstNumber:
        req.body.gstNumber ?? user.sellerInfo?.gstNumber ?? "",

      bankAccount:
        req.body.bankAccount ?? user.sellerInfo?.bankAccount ?? "",

      businessPhone:
        req.body.businessPhone ??
        user.sellerInfo?.businessPhone ??
        user.phone ??
        "",

      businessEmail:
        req.body.businessEmail ??
        user.sellerInfo?.businessEmail ??
        user.email ??
        "",

      pickupAddress:
        req.body.pickupAddress ??
        user.sellerInfo?.pickupAddress ??
        req.body.shopAddress ??
        user.sellerInfo?.shopAddress ??
        user.address ??
        "",

      productCategory:
        req.body.productCategory ??
        user.sellerInfo?.productCategory ??
        "",

      logo: req.body.logo ?? user.sellerInfo?.logo ?? "",

      description:
        req.body.description ??
        user.sellerInfo?.description ??
        req.body.businessDescription ??
        user.sellerInfo?.businessDescription ??
        "",

      businessDescription:
        req.body.businessDescription ??
        user.sellerInfo?.businessDescription ??
        req.body.description ??
        user.sellerInfo?.description ??
        "",

      isApproved: nextIsApproved,

      approvedAt:
        nextIsApproved === true
          ? user.sellerInfo?.approvedAt || new Date()
          : undefined,

      rejectedReason:
        nextIsApproved === true
          ? ""
          : req.body.rejectedReason ??
            user.sellerInfo?.rejectedReason ??
            "",
    });

    user.markModified("sellerInfo");
  } else {
    user.sellerInfo = undefined;
  }

  const updatedUser = await user.save();

  res.json(sendUserResponse(updatedUser));
});

// ======================================
// ADMIN — APPROVE SELLER
// PUT /api/users/sellers/:id/approve
// PUT /api/users/:id/approve-seller
// ======================================

const approveSeller = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  if (user.role !== "seller") {
    res.status(400);
    throw new Error("This account is not registered as a seller");
  }

  user.sellerInfo = buildSellerInfo(user, {
    isApproved: true,
    approvedAt: new Date(),
    rejectedReason: "",
  });

  user.isActive = true;
  user.markModified("sellerInfo");

  const updatedSeller = await user.save();

  res.status(200).json({
    success: true,
    message: "Seller approved successfully",
    seller: sendUserResponse(updatedSeller),
  });
});

// ======================================
// ADMIN — REJECT / UNAPPROVE SELLER
// PUT /api/users/sellers/:id/reject
// PUT /api/users/:id/reject-seller
// ======================================

const rejectSeller = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  if (user.role !== "seller") {
    res.status(400);
    throw new Error("This account is not registered as a seller");
  }

  user.sellerInfo = buildSellerInfo(user, {
    isApproved: false,
    approvedAt: undefined,
    rejectedReason:
      req.body.reason || "Seller approval removed by admin",
  });

  user.markModified("sellerInfo");

  const updatedSeller = await user.save();

  res.status(200).json({
    success: true,
    message: "Seller approval removed successfully",
    seller: sendUserResponse(updatedSeller),
  });
});

// ======================================
// USER — ADD PRODUCT TO WISHLIST
// POST /api/users/wishlist/:productId
// PUT  /api/users/wishlist/:productId
// ======================================

const addToWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const product = await Product.findById(req.params.productId);

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  const alreadyAdded = user.wishlist.find(
    (item) => item.product?.toString() === product._id.toString()
  );

  if (!alreadyAdded) {
    user.wishlist.push({
      product: product._id,
      priceWhenAdded: product.price,
      currentPrice: product.price,
      notifyPriceDrop: true,
      notifyBackInStock: true,
      collectionName: req.body.collectionName || "Default",
    });
  }

  await user.save();

  const updatedUser = await User.findById(req.user._id)
    .select("-password")
    .populate("wishlist.product");

  res.json(updatedUser.wishlist || []);
});

// ======================================
// USER — REMOVE PRODUCT FROM WISHLIST
// DELETE /api/users/wishlist/:productId
// ======================================

const removeFromWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  user.wishlist = user.wishlist.filter(
    (item) => item.product?.toString() !== req.params.productId
  );

  await user.save();

  const updatedUser = await User.findById(req.user._id)
    .select("-password")
    .populate("wishlist.product");

  res.json(updatedUser.wishlist || []);
});

// ======================================
// USER — GET WISHLIST
// GET /api/users/wishlist
// ======================================

const getWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .select("-password")
    .populate("wishlist.product");

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const wishlist = (user.wishlist || []).map((item) => {
    const product = item.product;

    const currentPrice = product?.price || item.currentPrice || 0;

    const priceWhenAdded = item.priceWhenAdded || currentPrice;

    return {
      _id: item._id,
      product,
      priceWhenAdded,
      currentPrice,
      priceDropped: currentPrice < priceWhenAdded,
      savedAmount:
        currentPrice < priceWhenAdded ? priceWhenAdded - currentPrice : 0,
      notifyPriceDrop: item.notifyPriceDrop,
      notifyBackInStock: item.notifyBackInStock,
      collectionName: item.collectionName || "Default",
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  });

  res.json(wishlist);
});

// ======================================
// USER — UPDATE WISHLIST SETTINGS
// PUT /api/users/wishlist/:productId/settings
// ======================================

const updateWishlistSettings = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const item = user.wishlist.find(
    (wishlistItem) =>
      wishlistItem.product?.toString() === req.params.productId
  );

  if (!item) {
    res.status(404);
    throw new Error("Wishlist item not found");
  }

  item.notifyPriceDrop = req.body.notifyPriceDrop ?? item.notifyPriceDrop;
  item.notifyBackInStock =
    req.body.notifyBackInStock ?? item.notifyBackInStock;
  item.collectionName = req.body.collectionName ?? item.collectionName;

  await user.save();

  const updatedUser = await User.findById(req.user._id)
    .select("-password")
    .populate("wishlist.product");

  res.json(updatedUser.wishlist || []);
});

// ======================================
// USER — CLEAR WISHLIST
// DELETE /api/users/wishlist
// ======================================

const clearWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  user.wishlist = [];

  await user.save();

  res.json({
    message: "Wishlist cleared",
    wishlist: [],
  });
});

export {
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
};