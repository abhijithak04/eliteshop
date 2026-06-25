import mongoose from "mongoose";

const reviewSchema =
  mongoose.Schema(
    {
      name: {
        type: String,
        required: true,
      },

      rating: {
        type: Number,
        required: true,
      },

      comment: {
        type: String,
        required: true,
      },

      user: {
        type:
          mongoose.Schema.Types.ObjectId,

        required: true,

        ref: "User",
      },
    },
    {
      timestamps: true,
    }
  );

const productSchema =
  mongoose.Schema(
    {
      seller: {
        type:
          mongoose.Schema.Types.ObjectId,

        ref: "User",
      },

      user: {
        type:
          mongoose.Schema.Types.ObjectId,

        ref: "User",

        required: true,
      },

      name: {
        type: String,
        required: true,
      },

      slug: {
        type: String,
        unique: true,
      },

      image: {
        type: String,
        required: true,
      },

      images: [
        {
          type: String,
        },
      ],

      brand: {
        type: String,
        required: true,
      },

      category: {
        type: String,
        required: true,
      },

      description: {
        type: String,
        required: true,
      },

      reviews: [
        reviewSchema,
      ],

      rating: {
        type: Number,
        required: true,
        default: 0,
      },

      numReviews: {
        type: Number,
        required: true,
        default: 0,
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

      discountPercentage: {
        type: Number,
        default: 0,
      },

      countInStock: {
        type: Number,
        required: true,
        default: 0,
      },

      freeShipping: {
        type: Boolean,
        default: false,
      },

      shippingPrice: {
        type: Number,
        default: 0,
      },

      tags: [
        {
          type: String,
        },
      ],

      isFeatured: {
        type: Boolean,
        default: false,
      },

      isActive: {
        type: Boolean,
        default: true,
      },

      soldCount: {
        type: Number,
        default: 0,
      },

      lowStockThreshold: {
        type: Number,
        default: 5,
      },

      views: {
        type: Number,
        default: 0,
      },
    },
    {
      timestamps: true,
    }
  );

productSchema.index({
  slug: 1,
});

productSchema.index({
  category: 1,
});

productSchema.index({
  brand: 1,
});

productSchema.index({
  isActive: 1,
});

productSchema.index({
  isFeatured: 1,
});

productSchema.index({
  seller: 1,
});

productSchema.index({
  price: 1,
});

productSchema.index({
  rating: -1,
});

productSchema.index({
  soldCount: -1,
});

const Product =
  mongoose.models.Product ||
  mongoose.model("Product", productSchema);

export default Product;