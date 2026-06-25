import mongoose from "mongoose";
import dotenv from "dotenv";
import colors from "colors";

import users from "./data/users.js";
import products from "./data/sampleProducts.js";

import User from "./models/userModel.js";
import Product from "./models/productModel.js";
import Order from "./models/orderModel.js";

import connectDB from "./config/db.js";

dotenv.config();

connectDB();

const closeApp = async (exitCode = 0) => {
  await mongoose.connection.close();
  process.exit(exitCode);
};

const getOwnerUser = async () => {
  const seller =
    (await User.findOne({
      role: "seller",
    })) ||
    (await User.findOne({
      role: "admin",
    })) ||
    (await User.findOne());

  return seller;
};

const attachOwnerToProducts = (productList, ownerId) => {
  return productList.map((product) => {
    return {
      ...product,

      user: product.user || ownerId,
      seller: product.seller || ownerId,
      createdBy: product.createdBy || ownerId,

      isActive:
        product.isActive === undefined
          ? true
          : product.isActive,

      freeShipping:
        product.freeShipping === undefined
          ? false
          : product.freeShipping,

      lowStockThreshold:
        product.lowStockThreshold || 5,
    };
  });
};

const validateProducts = () => {
  if (!Array.isArray(products)) {
    throw new Error(
      "sampleProducts.js must export default an array of products"
    );
  }

  if (products.length === 0) {
    throw new Error("sampleProducts.js has no products");
  }
};

const importData = async () => {
  try {
    validateProducts();

    await Order.deleteMany();
    await Product.deleteMany();
    await User.deleteMany();

    const createdUsers = await User.insertMany(users);

    const adminUser =
      createdUsers.find((user) => user.role === "admin") ||
      createdUsers[0];

    const sellerUser =
      createdUsers.find((user) => user.role === "seller") ||
      adminUser ||
      createdUsers[0];

    if (!sellerUser) {
      throw new Error("No user found to attach products");
    }

    const sampleProducts = attachOwnerToProducts(
      products,
      sellerUser._id
    );

    await Product.insertMany(sampleProducts);

    console.log("Full Data Imported Successfully!".green.inverse);
    console.log(`${createdUsers.length} users inserted`.green);
    console.log(`${sampleProducts.length} products inserted`.green);

    await closeApp(0);
  } catch (error) {
    console.error(`${error.message}`.red.inverse);
    await closeApp(1);
  }
};

const importProductsOnly = async () => {
  try {
    validateProducts();

    await Order.deleteMany();
    await Product.deleteMany();

    const ownerUser = await getOwnerUser();

    if (!ownerUser) {
      throw new Error(
        "No user found. Create admin/seller first or run: node seeder.js"
      );
    }

    const sampleProducts = attachOwnerToProducts(
      products,
      ownerUser._id
    );

    await Product.insertMany(sampleProducts);

    console.log("Products Imported Successfully!".green.inverse);
    console.log(`Owner: ${ownerUser.name || ownerUser.email}`.cyan);
    console.log(`${sampleProducts.length} products inserted`.green);

    await closeApp(0);
  } catch (error) {
    console.error(`${error.message}`.red.inverse);
    await closeApp(1);
  }
};

const addProductsWithoutDeleting = async () => {
  try {
    validateProducts();

    const ownerUser = await getOwnerUser();

    if (!ownerUser) {
      throw new Error(
        "No user found. Create admin/seller first or run: node seeder.js"
      );
    }

    const sampleProducts = attachOwnerToProducts(
      products,
      ownerUser._id
    );

    let addedCount = 0;
    let skippedCount = 0;

    for (const product of sampleProducts) {
      const existingProduct = await Product.findOne({
        slug: product.slug,
      });

      if (existingProduct) {
        skippedCount += 1;
        continue;
      }

      await Product.create(product);
      addedCount += 1;
    }

    console.log("Products Added Successfully!".green.inverse);
    console.log(`Owner: ${ownerUser.name || ownerUser.email}`.cyan);
    console.log(`${addedCount} products added`.green);
    console.log(`${skippedCount} products skipped`.yellow);

    await closeApp(0);
  } catch (error) {
    console.error(`${error.message}`.red.inverse);
    await closeApp(1);
  }
};

const destroyData = async () => {
  try {
    await Order.deleteMany();
    await Product.deleteMany();
    await User.deleteMany();

    console.log("Data Destroyed!".red.inverse);

    await closeApp(0);
  } catch (error) {
    console.error(`${error.message}`.red.inverse);
    await closeApp(1);
  }
};

const runSeeder = async () => {
  const command = process.argv[2];

  if (command === "-d") {
    await destroyData();
    return;
  }

  if (command === "--products") {
    await importProductsOnly();
    return;
  }

  if (command === "--add-products") {
    await addProductsWithoutDeleting();
    return;
  }

  await importData();
};

runSeeder();