import React, {
  Suspense,
  lazy,
} from "react";

import ReactDOM from "react-dom/client";

import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
  Navigate,
} from "react-router-dom";

import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";

import App from "./App";
import Loader from "./components/Loader";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import NotFoundPage from "./pages/NotFoundPage";

import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";

/* PUBLIC PAGES */

const HomePage = lazy(() => import("./pages/HomePage"));
const ProductsPage = lazy(() => import("./pages/ProductsPage"));
const ProductDetailsPage = lazy(() => import("./pages/ProductDetails"));
const CartPage = lazy(() => import("./pages/CartPage"));
const LoginPage = lazy(() => import("./pages/Login"));
const RegisterPage = lazy(() => import("./pages/user/Register"));
const SupportPage = lazy(() => import("./pages/Support"));
const AdvertisePage = lazy(() => import("./pages/Advertise"));

/* USER PAGES */

const LogoutPage = lazy(() => import("./pages/user/Logout"));
const ProfilePage = lazy(() => import("./pages/user/Profile"));
const UserOrdersPage = lazy(() => import("./pages/user/Order"));
const WishlistPage = lazy(() => import("./pages/user/Wishlist"));
const NotificationsPage = lazy(() => import("./pages/user/Notifications"));

/* CHECKOUT PAGES */

const ShippingPage = lazy(() => import("./pages/Shipping"));
const PaymentPage = lazy(() => import("./pages/Payment"));
const PlaceOrderPage = lazy(() => import("./pages/PlaceOrder"));
const OrderDetailsPage = lazy(() => import("./pages/OrderDetails"));

/* ADMIN PAGES */

const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));
const AdminUsers = lazy(() => import("./pages/admin/Users"));
const AdminProducts = lazy(() => import("./pages/admin/Products"));
const AdminOrders = lazy(() => import("./pages/admin/Orders"));
const AdminSellers = lazy(() => import("./pages/admin/Sellers"));
const AdminLowStock = lazy(() => import("./pages/admin/LowStock.jsx"));
const AdminApprovals = lazy(() => import("./pages/admin/Approvals"));

/* SELLER PAGES */

const SellerLogin = lazy(() => import("./pages/seller/SellerLogin"));
const SellerRegister = lazy(() => import("./pages/seller/SellerRegister"));
const SellerPending = lazy(() => import("./pages/seller/SellerPending"));
const SellerDashboard = lazy(() => import("./pages/seller/Dashboard"));
const AddProduct = lazy(() => import("./pages/seller/AddProduct.jsx"));
const EditProduct = lazy(() => import("./pages/seller/EditProduct.jsx"));
const DeleteProduct = lazy(() => import("./pages/seller/DeleteProduct.jsx"));
const SellerAnalytics = lazy(() => import("./pages/seller/Analytics"));

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route
      path="/"
      element={<App />}
      errorElement={<NotFoundPage />}
    >
      <Route index element={<HomePage />} />

      <Route path="products" element={<ProductsPage />} />

      <Route path="product/:slug" element={<ProductDetailsPage />} />

      <Route path="products/:slug" element={<ProductDetailsPage />} />

      <Route path="cart" element={<CartPage />} />

      <Route path="support" element={<SupportPage />} />

      <Route path="advertise" element={<AdvertisePage />} />

      <Route path="login" element={<LoginPage />} />

      <Route path="register" element={<RegisterPage />} />

      <Route
        path="signup"
        element={<Navigate to="/register" replace />}
      />

      <Route path="logout" element={<LogoutPage />} />

      <Route path="seller/login" element={<SellerLogin />} />

      <Route path="seller/register" element={<SellerRegister />} />

      <Route element={<ProtectedRoute />}>
        <Route path="profile" element={<ProfilePage />} />

        <Route path="user/profile" element={<ProfilePage />} />

        <Route path="wishlist" element={<WishlistPage />} />

        <Route path="user/wishlist" element={<WishlistPage />} />

        <Route path="notifications" element={<NotificationsPage />} />

        <Route path="user/notifications" element={<NotificationsPage />} />

        <Route path="orders" element={<UserOrdersPage />} />

        <Route path="user/orders" element={<UserOrdersPage />} />

        <Route path="orders/:id" element={<OrderDetailsPage />} />

        <Route path="order/:id" element={<OrderDetailsPage />} />

        <Route
          path="checkout"
          element={<Navigate to="/shipping" replace />}
        />

        <Route path="shipping" element={<ShippingPage />} />

        <Route path="checkout/shipping" element={<ShippingPage />} />

        <Route path="payment" element={<PaymentPage />} />

        <Route path="checkout/payment" element={<PaymentPage />} />

        <Route path="placeorder" element={<PlaceOrderPage />} />

        <Route path="checkout/placeorder" element={<PlaceOrderPage />} />

        <Route path="checkout/review" element={<PlaceOrderPage />} />
      </Route>

      <Route
        element={
          <ProtectedRoute allowedRoles={["admin"]} />
        }
      >
        <Route
          path="admin"
          element={<Navigate to="/admin/dashboard" replace />}
        />

        <Route path="admin/dashboard" element={<AdminDashboard />} />

        <Route path="admin/users" element={<AdminUsers />} />

        <Route path="admin/products" element={<AdminProducts />} />

        <Route path="admin/orders" element={<AdminOrders />} />

        <Route path="admin/sellers" element={<AdminSellers />} />

        <Route path="admin/approvals" element={<AdminApprovals />} />

        <Route path="admin/low-stock" element={<AdminLowStock />} />
      </Route>

      <Route
        element={
          <ProtectedRoute allowedRoles={["seller"]} />
        }
      >
        <Route path="seller/pending" element={<SellerPending />} />
      </Route>

      <Route
        element={
          <ProtectedRoute
            allowedRoles={["seller"]}
            requireSellerApproval={true}
          />
        }
      >
        <Route
          path="seller"
          element={<Navigate to="/seller/dashboard" replace />}
        />

        <Route path="seller/dashboard" element={<SellerDashboard />} />

        <Route path="seller/add-product" element={<AddProduct />} />

        <Route path="seller/edit-product/:id" element={<EditProduct />} />

        <Route path="seller/delete-product/:id" element={<DeleteProduct />} />

        <Route path="seller/analytics" element={<SellerAnalytics />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Route>
  )
);

ReactDOM.createRoot(
  document.getElementById("root")
).render(
  <React.StrictMode>
    <AuthProvider>
      <CartProvider>
        <Suspense fallback={<Loader />}>
          <RouterProvider router={router} />
        </Suspense>
      </CartProvider>
    </AuthProvider>
  </React.StrictMode>
);