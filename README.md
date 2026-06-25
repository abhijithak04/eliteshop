# EliteShop – MERN Stack Ecommerce Platform

EliteShop is a full-stack ecommerce web application built using the MERN stack. It supports customer, seller, and admin roles with product browsing, cart, wishlist, checkout, order management, Cloudinary product image handling, and payment integration.

## Features

* Customer registration and login
* Seller registration and seller dashboard
* Admin dashboard for managing products, sellers, users, and orders
* Product listing with categories
* Product details page
* Add to cart
* Wishlist
* Checkout flow
* Order placement
* Order tracking
* Razorpay payment integration
* Cloudinary product image upload
* MongoDB database storage
* JWT-based protected routes
* Responsive React UI

## Tech Stack

### Frontend

* React
* Vite
* React Router
* React Bootstrap
* CSS
* Axios
* Framer Motion
* React Icons

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT Authentication
* Cloudinary
* Razorpay
* Multer

## Folder Structure

```txt
ecomerse
├── backend
│   ├── config
│   ├── controllers
│   ├── data
│   ├── middleware
│   ├── models
│   ├── routes
│   ├── scripts
│   ├── seed-images
│   └── server.js
│
├── frontend
│   ├── public
│   ├── src
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

## Environment Variables

Create a `.env` file inside the backend folder:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

Create a `.env` file inside the frontend folder:

```env
VITE_API_URL=http://localhost:5000/api
```

## Installation and Setup

### Backend

```bash
cd backend
npm install
npm start
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Seed Products

To insert sample products:

```bash
cd backend
node seeder.js --products
```

To upload product images to Cloudinary:

```bash
node scripts/uploadProductImages.js
```

## Project Highlights

* Built a real-world ecommerce workflow with customer, seller, and admin roles.
* Integrated Cloudinary for product image storage.
* Implemented Razorpay payment flow.
* Used MongoDB for storing users, products, carts, wishlist, and orders.
* Added protected routes and role-based access control.
* Designed a modern responsive UI using React Bootstrap and custom CSS.

## Author

Abhijith Kumar
MERN Stack Developer
