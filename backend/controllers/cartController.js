import asyncHandler from "../middleware/asyncHandler.js";

import Cart from "../models/cartModel.js";
import Product from "../models/productModel.js";

const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({
    user: userId,
  });

  if (!cart) {
    cart = await Cart.create({
      user: userId,
      cartItems: [],
    });
  }

  return cart;
};

// ======================================
// GET USER CART
// GET /api/cart
// ======================================

const getUserCart = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);

  await cart.populate("cartItems.product");

  res.json(cart);
});

// ======================================
// ADD TO CART
// POST /api/cart
// body: { productId, qty }
// ======================================

const addToCart = asyncHandler(async (req, res) => {
  const {
    productId,
    qty = 1,
  } = req.body;

  if (!productId) {
    res.status(400);
    throw new Error("Product ID is required");
  }

  const product = await Product.findById(productId);

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  if (product.isActive === false) {
    res.status(400);
    throw new Error("Product is currently unavailable");
  }

  if (Number(product.countInStock || 0) <= 0) {
    res.status(400);
    throw new Error("Product is out of stock");
  }

  const safeQty = Math.min(
    Math.max(Number(qty || 1), 1),
    Number(product.countInStock || 1)
  );

  const cart = await getOrCreateCart(req.user._id);

  const existingItem = cart.cartItems.find(
    (item) =>
      item.product.toString() === product._id.toString()
  );

  if (existingItem) {
    existingItem.qty = safeQty;
    existingItem.price = Number(product.price || 0);
    existingItem.originalPrice = Number(
      product.originalPrice || product.price || 0
    );
    existingItem.countInStock = Number(product.countInStock || 0);
  } else {
    cart.cartItems.push({
      product: product._id,
      name: product.name,
      slug: product.slug || product._id.toString(),
      image: product.image,
      price: Number(product.price || 0),
      originalPrice: Number(product.originalPrice || product.price || 0),
      brand: product.brand || "EliteShop",
      category: product.category || "General",
      countInStock: Number(product.countInStock || 0),
      qty: safeQty,
    });
  }

  const updatedCart = await cart.save();

  await updatedCart.populate("cartItems.product");

  res.json(updatedCart);
});

// ======================================
// UPDATE CART ITEM QTY
// PUT /api/cart/:productId
// body: { qty }
// ======================================

const updateCartItemQty = asyncHandler(async (req, res) => {
  const {
    qty,
  } = req.body;

  const cart = await getOrCreateCart(req.user._id);

  const item = cart.cartItems.find(
    (cartItem) =>
      cartItem.product.toString() === req.params.productId
  );

  if (!item) {
    res.status(404);
    throw new Error("Cart item not found");
  }

  if (Number(qty) <= 0) {
    cart.cartItems = cart.cartItems.filter(
      (cartItem) =>
        cartItem.product.toString() !== req.params.productId
    );
  } else {
    const product = await Product.findById(req.params.productId);

    if (!product) {
      res.status(404);
      throw new Error("Product not found");
    }

    const maxQty = Number(product.countInStock || 1);

    item.qty = Math.min(Number(qty), maxQty);
    item.price = Number(product.price || 0);
    item.originalPrice = Number(product.originalPrice || product.price || 0);
    item.countInStock = maxQty;
  }

  const updatedCart = await cart.save();

  await updatedCart.populate("cartItems.product");

  res.json(updatedCart);
});

// ======================================
// REMOVE CART ITEM
// DELETE /api/cart/:productId
// ======================================

const removeCartItem = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);

  cart.cartItems = cart.cartItems.filter(
    (item) =>
      item.product.toString() !== req.params.productId
  );

  const updatedCart = await cart.save();

  await updatedCart.populate("cartItems.product");

  res.json(updatedCart);
});

// ======================================
// CLEAR CART
// DELETE /api/cart
// ======================================

const clearCart = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);

  cart.cartItems = [];
  cart.coupon = {
    code: "",
    discount: 0,
  };

  const updatedCart = await cart.save();

  res.json(updatedCart);
});

export {
  getUserCart,
  addToCart,
  updateCartItemQty,
  removeCartItem,
  clearCart,
};