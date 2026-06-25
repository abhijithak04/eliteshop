import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";

import connectDB from "../config/db.js";
import Product from "../models/productModel.js";

dotenv.config();

connectDB();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const ROOT = process.cwd();

const IMAGE_ROOT = path.join(ROOT, "seed-images");

const PRODUCT_IMAGE_ROOT = path.join(IMAGE_ROOT, "products");

const CATEGORY_ROOT_CANDIDATES = [
  path.join(IMAGE_ROOT, "categories"),
  path.join(IMAGE_ROOT, "catogeries"),
];

const allowedExtensions = [
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
];

const categoryFolderAliases = {
  Mobiles: [
    "mobiles",
    "mobile",
    "phones",
    "phone",
  ],

  Electronics: [
    "electronics",
    "electornics",
    "electronic",
    "electro",
  ],

  Fashion: [
    "fashion",
    "fashon",
    "clothes",
    "clothing",
  ],

  Home: [
    "home",
    "kitchen",
    "home-kitchen",
    "homeandkitchen",
  ],

  Beauty: [
    "beauty",
    "cosmetics",
    "makeup",
  ],

  Grocery: [
    "grocery",
    "groceries",
    "fruits",
    "fruit",
    "food",
  ],

  Appliances: [
    "appliances",
    "appilances",
    "appliance",
  ],

  Gaming: [
    "gaming",
    "game",
    "games",
  ],

  Furniture: [
    "furniture",
    "funiture",
    "sofa",
  ],

  Books: [
    "books",
    "book",
  ],
};

const categoryImageIndexes = {};

const slugify = (text = "") => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

const fileExists = (filePath) => {
  return fs.existsSync(filePath);
};

const isImageFile = (fileName) => {
  const ext = path.extname(fileName).toLowerCase();

  return allowedExtensions.includes(ext);
};

const getImagesFromFolder = (folderPath) => {
  if (!fileExists(folderPath)) {
    return [];
  }

  return fs
    .readdirSync(folderPath)
    .filter((fileName) => isImageFile(fileName))
    .map((fileName) => path.join(folderPath, fileName));
};

const getCategoryFolders = (category) => {
  const aliases =
    categoryFolderAliases[category] ||
    [slugify(category)];

  const folders = [];

  for (const rootPath of CATEGORY_ROOT_CANDIDATES) {
    for (const alias of aliases) {
      folders.push(path.join(rootPath, alias));
    }
  }

  return folders;
};

const getAllImagesForCategory = (category) => {
  const folders = getCategoryFolders(category);

  const images = [];

  for (const folderPath of folders) {
    const folderImages = getImagesFromFolder(folderPath);

    images.push(...folderImages);
  }

  return images;
};

const findImageByBaseName = (folderPath, baseName) => {
  if (!fileExists(folderPath)) {
    return null;
  }

  for (const ext of allowedExtensions) {
    const filePath = path.join(folderPath, `${baseName}${ext}`);

    if (fileExists(filePath)) {
      return filePath;
    }
  }

  return null;
};

const findProductSpecificImage = (product) => {
  const productSlug =
    product.slug ||
    slugify(product.name);

  return findImageByBaseName(
    PRODUCT_IMAGE_ROOT,
    productSlug
  );
};

const getNextCategoryImage = (category) => {
  const images = getAllImagesForCategory(category);

  if (images.length === 0) {
    return null;
  }

  const key = slugify(category);

  const currentIndex = categoryImageIndexes[key] || 0;

  const imagePath = images[currentIndex % images.length];

  categoryImageIndexes[key] = currentIndex + 1;

  return imagePath;
};

const findProductImage = (product) => {
  const productSpecificImage =
    findProductSpecificImage(product);

  if (productSpecificImage) {
    return productSpecificImage;
  }

  const categoryImage = getNextCategoryImage(
    product.category
  );

  if (categoryImage) {
    return categoryImage;
  }

  return null;
};

const uploadToCloudinary = async (filePath, product) => {
  const publicId =
    product.slug ||
    slugify(product.name);

  const result = await cloudinary.uploader.upload(filePath, {
    folder: "eliteshop/products",
    public_id: publicId,
    overwrite: true,
    resource_type: "image",
    transformation: [
      {
        width: 900,
        height: 900,
        crop: "fill",
        gravity: "auto",
        quality: "auto",
        fetch_format: "auto",
      },
    ],
  });

  return result.secure_url;
};

const printImageScanReport = () => {
  console.log("--------- IMAGE FOLDER SCAN ---------");
  console.log(`Backend root: ${ROOT}`);
  console.log(`Image root: ${IMAGE_ROOT}`);

  for (const rootPath of CATEGORY_ROOT_CANDIDATES) {
    console.log(
      fileExists(rootPath)
        ? `Found category root: ${rootPath}`
        : `Missing category root: ${rootPath}`
    );
  }

  Object.keys(categoryFolderAliases).forEach((category) => {
    const images = getAllImagesForCategory(category);

    console.log(
      `${category}: ${images.length} image(s) found`
    );
  });

  console.log("-------------------------------------");
};

const uploadProductImages = async () => {
  try {
    if (
      !process.env.CLOUDINARY_CLOUD_NAME ||
      !process.env.CLOUDINARY_API_KEY ||
      !process.env.CLOUDINARY_API_SECRET
    ) {
      throw new Error(
        "Cloudinary env values missing in backend/.env"
      );
    }

    if (!fileExists(IMAGE_ROOT)) {
      throw new Error(
        "seed-images folder not found inside backend folder"
      );
    }

    printImageScanReport();

    const products = await Product.find({}).sort({
      category: 1,
      name: 1,
    });

    if (products.length === 0) {
      console.log("No products found in database.");
      console.log("Run: node seeder.js --products");
      process.exit(0);
    }

    let updatedCount = 0;
    let skippedCount = 0;

    for (const product of products) {
      const localImagePath = findProductImage(product);

      if (!localImagePath) {
        skippedCount += 1;

        console.log(
          `Skipped: ${product.name} | Category: ${product.category} | No local image found`
        );

        continue;
      }

      const imageUrl = await uploadToCloudinary(
        localImagePath,
        product
      );

      product.image = imageUrl;
      product.images = [imageUrl];

      await product.save();

      updatedCount += 1;

      console.log(
        `Updated: ${product.name} | ${product.category} | ${path.basename(localImagePath)}`
      );
    }

    console.log("--------------------------------");
    console.log(`Images updated: ${updatedCount}`);
    console.log(`Products skipped: ${skippedCount}`);
    console.log("--------------------------------");

    process.exit(0);
  } catch (error) {
    console.error(`Upload failed: ${error.message}`);
    process.exit(1);
  }
};

uploadProductImages();