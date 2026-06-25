import asyncHandler from "../middleware/asyncHandler.js";
import Product from "../models/productModel.js";
import slugify from "slugify";

// ============================================
// HELPER: CREATE SAFE UNIQUE SLUG
// ============================================

const createBaseSlug = (name) => {
  return slugify(name || "product", {
    lower: true,
    strict: true,
    trim: true,
  });
};

const generateUniqueSlug = async (
  name,
  currentProductId = null
) => {
  const baseSlug = createBaseSlug(name);

  let slug = baseSlug;
  let counter = 2;

  while (true) {
    const existingProduct = await Product.findOne({
      slug,
      ...(currentProductId && {
        _id: {
          $ne: currentProductId,
        },
      }),
    }).select("_id");

    if (!existingProduct) {
      return slug;
    }

    slug = `${baseSlug}-${counter}`;
    counter += 1;
  }
};

// ============================================
// HELPER: DISCOUNT CALCULATION
// ============================================

const calculateDiscount = (
  originalPrice,
  price
) => {
  const original = Number(originalPrice || 0);
  const selling = Number(price || 0);

  if (original > selling && selling > 0) {
    return Math.round(
      ((original - selling) / original) * 100
    );
  }

  return 0;
};

// ============================================
// HELPER: PRODUCT AUTHORIZATION
// ============================================

const canModifyProduct = (user, product) => {
  if (!user || !product) {
    return false;
  }

  if (user.role === "admin") {
    return true;
  }

  if (
    product.seller &&
    product.seller.toString() ===
      user._id.toString()
  ) {
    return true;
  }

  return false;
};

// ============================================
// GET PRODUCTS
// GET /api/products
// Supports:
// keyword, category, brand, featured, freeShipping,
// rating, stock, minPrice, maxPrice, sort, pageNumber
// ============================================

const getProducts = asyncHandler(async (req, res) => {
  const pageSize =
    Number(process.env.PAGINATION_LIMIT) || 8;

  const page = Number(req.query.pageNumber) || 1;

  const {
    keyword,
    category,
    brand,
    featured,
    freeShipping,
    rating,
    stock,
    minPrice,
    maxPrice,
    sort,
  } = req.query;

  const filter = {
    isActive: true,
  };

  if (keyword) {
    const keywordRegex = {
      $regex: keyword,
      $options: "i",
    };

    filter.$or = [
      {
        name: keywordRegex,
      },
      {
        brand: keywordRegex,
      },
      {
        category: keywordRegex,
      },
      {
        description: keywordRegex,
      },
      {
        tags: keywordRegex,
      },
    ];
  }

  if (category) {
    filter.category = {
      $regex: `^${category}$`,
      $options: "i",
    };
  }

  if (brand) {
    filter.brand = {
      $regex: `^${brand}$`,
      $options: "i",
    };
  }

  if (featured === "true") {
    filter.isFeatured = true;
  }

  if (freeShipping === "true") {
    filter.freeShipping = true;
  }

  if (rating) {
    filter.rating = {
      $gte: Number(rating),
    };
  }

  if (stock === "instock") {
    filter.countInStock = {
      $gt: 0,
    };
  }

  const priceFilter = {};

  if (minPrice) {
    priceFilter.$gte = Number(minPrice);
  }

  if (maxPrice) {
    priceFilter.$lte = Number(maxPrice);
  }

  if (Object.keys(priceFilter).length > 0) {
    filter.price = priceFilter;
  }

  let sortOption = {
    createdAt: -1,
  };

  if (sort === "low") {
    sortOption = {
      price: 1,
    };
  }

  if (sort === "high") {
    sortOption = {
      price: -1,
    };
  }

  if (sort === "rating") {
    sortOption = {
      rating: -1,
      numReviews: -1,
    };
  }

  if (sort === "popular") {
    sortOption = {
      soldCount: -1,
      views: -1,
    };
  }

  if (sort === "discount") {
    sortOption = {
      discountPercentage: -1,
    };
  }

  const count = await Product.countDocuments(filter);

  const products = await Product.find(filter)
    .populate("seller", "name email role sellerInfo.shopName")
    .sort(sortOption)
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.json({
    products,
    page,
    pages: Math.ceil(count / pageSize),
    totalProducts: count,
  });
});

// ============================================
// GET PRODUCT BY SLUG
// GET /api/products/slug/:slug
// ============================================

const getProductBySlug = asyncHandler(async (req, res) => {
  const product = await Product.findOne({
    slug: req.params.slug,
    isActive: true,
  }).populate(
    "seller",
    "name email role sellerInfo.shopName sellerInfo.isApproved"
  );

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  await Product.findByIdAndUpdate(product._id, {
    $inc: {
      views: 1,
    },
  });

  res.json(product);
});

// ============================================
// GET PRODUCT BY ID
// GET /api/products/:id
// ============================================

const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(
    req.params.id
  ).populate(
    "seller",
    "name email role sellerInfo.shopName sellerInfo.isApproved"
  );

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  if (!product.isActive && req.user?.role !== "admin") {
    res.status(404);
    throw new Error("Product not found");
  }

  await Product.findByIdAndUpdate(product._id, {
    $inc: {
      views: 1,
    },
  });

  res.json(product);
});

// ============================================
// CREATE PRODUCT
// POST /api/products
// Seller/Admin
// ============================================

const createProduct = asyncHandler(async (req, res) => {
  const {
    name,
    image,
    images,
    brand,
    category,
    description,
    price,
    originalPrice,
    countInStock,
    freeShipping,
    shippingPrice,
    tags,
    isFeatured,
    lowStockThreshold,
  } = req.body;

  if (
    !name ||
    !image ||
    !brand ||
    !category ||
    !description ||
    price === undefined ||
    countInStock === undefined
  ) {
    res.status(400);
    throw new Error(
      "Please provide all required product fields"
    );
  }

  const finalPrice = Number(price);
  const finalOriginalPrice = originalPrice
    ? Number(originalPrice)
    : finalPrice;

  if (finalPrice <= 0) {
    res.status(400);
    throw new Error("Product price must be greater than 0");
  }

  if (finalOriginalPrice < finalPrice) {
    res.status(400);
    throw new Error(
      "Original price cannot be less than selling price"
    );
  }

  if (Number(countInStock) < 0) {
    res.status(400);
    throw new Error("Stock quantity cannot be negative");
  }

  const slug = await generateUniqueSlug(name);

  const product = new Product({
    user: req.user._id,
    seller: req.user._id,

    name: name.trim(),
    slug,
    image,
    images: Array.isArray(images)
      ? images
      : image
      ? [image]
      : [],

    brand: brand.trim(),
    category: category.trim(),
    description: description.trim(),

    price: finalPrice,
    originalPrice: finalOriginalPrice,
    discountPercentage: calculateDiscount(
      finalOriginalPrice,
      finalPrice
    ),

    countInStock: Number(countInStock),
    freeShipping: Boolean(freeShipping),
    shippingPrice: Boolean(freeShipping)
      ? 0
      : Number(shippingPrice || 0),

    tags: Array.isArray(tags)
      ? tags
          .map((tag) => String(tag).trim())
          .filter(Boolean)
      : [],

    isFeatured: Boolean(isFeatured),
    isActive: true,

    lowStockThreshold:
      lowStockThreshold !== undefined
        ? Number(lowStockThreshold)
        : 5,
  });

  const createdProduct = await product.save();

  res.status(201).json(createdProduct);
});

// ============================================
// UPDATE PRODUCT
// PUT /api/products/:id
// Seller can update own product
// Admin can update any product
// ============================================

const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  if (!canModifyProduct(req.user, product)) {
    res.status(401);
    throw new Error("Not authorized to update this product");
  }

  const oldName = product.name;
  const newName =
    req.body.name !== undefined
      ? String(req.body.name).trim()
      : oldName;

  if (!newName) {
    res.status(400);
    throw new Error("Product name is required");
  }

  if (newName !== oldName) {
    product.slug = await generateUniqueSlug(
      newName,
      product._id
    );
  }

  product.name = newName;

  if (req.body.image !== undefined) {
    product.image = req.body.image;
  }

  if (req.body.images !== undefined) {
    product.images = Array.isArray(req.body.images)
      ? req.body.images
      : product.images;
  }

  if (req.body.brand !== undefined) {
    product.brand = String(req.body.brand).trim();
  }

  if (req.body.category !== undefined) {
    product.category = String(req.body.category).trim();
  }

  if (req.body.description !== undefined) {
    product.description = String(
      req.body.description
    ).trim();
  }

  if (req.body.price !== undefined) {
    if (Number(req.body.price) <= 0) {
      res.status(400);
      throw new Error(
        "Product price must be greater than 0"
      );
    }

    product.price = Number(req.body.price);
  }

  if (req.body.originalPrice !== undefined) {
    product.originalPrice = Number(
      req.body.originalPrice
    );
  }

  if (product.originalPrice < product.price) {
    res.status(400);
    throw new Error(
      "Original price cannot be less than selling price"
    );
  }

  if (req.body.countInStock !== undefined) {
    if (Number(req.body.countInStock) < 0) {
      res.status(400);
      throw new Error("Stock quantity cannot be negative");
    }

    product.countInStock = Number(req.body.countInStock);
  }

  if (req.body.freeShipping !== undefined) {
    product.freeShipping = Boolean(req.body.freeShipping);
  }

  if (req.body.shippingPrice !== undefined) {
    product.shippingPrice = product.freeShipping
      ? 0
      : Number(req.body.shippingPrice || 0);
  }

  if (req.body.tags !== undefined) {
    product.tags = Array.isArray(req.body.tags)
      ? req.body.tags
          .map((tag) => String(tag).trim())
          .filter(Boolean)
      : product.tags;
  }

  if (req.body.isFeatured !== undefined) {
    product.isFeatured = Boolean(req.body.isFeatured);
  }

  if (req.body.isActive !== undefined) {
    product.isActive = Boolean(req.body.isActive);
  }

  if (req.body.lowStockThreshold !== undefined) {
    product.lowStockThreshold = Number(
      req.body.lowStockThreshold
    );
  }

  product.discountPercentage = calculateDiscount(
    product.originalPrice,
    product.price
  );

  const updatedProduct = await product.save();

  res.json(updatedProduct);
});

// ============================================
// DELETE PRODUCT
// DELETE /api/products/:id
// Seller can delete own product
// Admin can delete any product
// ============================================

const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  if (!canModifyProduct(req.user, product)) {
    res.status(401);
    throw new Error("Not authorized to delete this product");
  }

  await product.deleteOne();

  res.json({
    message: "Product removed successfully",
  });
});

// ============================================
// PRODUCT REVIEW
// POST /api/products/:id/reviews
// ============================================

const createProductReview = asyncHandler(
  async (req, res) => {
    const {
      rating,
      comment,
    } = req.body;

    const product = await Product.findById(req.params.id);

    if (!product) {
      res.status(404);
      throw new Error("Product not found");
    }

    if (!product.isActive) {
      res.status(400);
      throw new Error("Product is not active");
    }

    const alreadyReviewed = product.reviews.find(
      (review) =>
        review.user.toString() ===
        req.user._id.toString()
    );

    if (alreadyReviewed) {
      res.status(400);
      throw new Error("Product already reviewed");
    }

    const review = {
      name: req.user.name,
      rating: Number(rating),
      comment,
      user: req.user._id,
    };

    product.reviews.push(review);

    product.numReviews = product.reviews.length;

    product.rating =
      product.reviews.reduce(
        (acc, item) => item.rating + acc,
        0
      ) / product.reviews.length;

    await product.save();

    res.status(201).json({
      message: "Review added successfully",
    });
  }
);

// ============================================
// TOP PRODUCTS
// GET /api/products/top
// ============================================

const getTopProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({
    isActive: true,
  })
    .sort({
      rating: -1,
      numReviews: -1,
    })
    .limit(10);

  res.json(products);
});

// ============================================
// FEATURED PRODUCTS
// GET /api/products/featured
// ============================================

const getFeaturedProducts = asyncHandler(
  async (req, res) => {
    const products = await Product.find({
      isFeatured: true,
      isActive: true,
    })
      .sort({
        createdAt: -1,
      })
      .limit(12);

    res.json(products);
  }
);

// ============================================
// LOW STOCK PRODUCTS
// GET /api/products/lowstock
// Admin only
// ============================================

const getLowStockProducts = asyncHandler(
  async (req, res) => {
    const products = await Product.find({
      isActive: true,
      $expr: {
        $lte: [
          "$countInStock",
          "$lowStockThreshold",
        ],
      },
    })
      .populate("seller", "name email role sellerInfo.shopName")
      .sort({
        countInStock: 1,
      });

    res.json(products);
  }
);

// ============================================
// SELLER PRODUCTS
// GET /api/products/seller/products
// Seller only
// ============================================

const getSellerProducts = asyncHandler(
  async (req, res) => {
    const products = await Product.find({
      seller: req.user._id,
    }).sort({
      createdAt: -1,
    });

    res.json(products);
  }
);

export {
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
};