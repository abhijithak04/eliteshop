import {
  useMemo,
  useState,
} from "react";

import {
  Card,
  Badge,
  Button,
} from "react-bootstrap";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import { motion } from "framer-motion";

import {
  FaEye,
  FaFire,
  FaHeart,
  FaRegHeart,
  FaShoppingCart,
  FaTruck,
  FaBolt,
  FaStar,
  FaBoxOpen,
  FaCheckCircle,
  FaTimesCircle,
  FaStore,
} from "react-icons/fa";

import { toast } from "react-toastify";

import Rating from "./Rating";

import { useCart } from "../context/CartContext";

import "../styles/ProductCard.css";

const formatPrice = (value) => {
  return Number(value || 0).toLocaleString("en-IN");
};

const getDiscountPercentage = (product) => {
  if (Number(product?.discountPercentage || 0) > 0) {
    return Number(product.discountPercentage);
  }

  const price = Number(product?.price || 0);
  const originalPrice = Number(product?.originalPrice || 0);

  if (originalPrice > price && price > 0) {
    return Math.round(((originalPrice - price) / originalPrice) * 100);
  }

  return 0;
};

const ProductCard = ({ product }) => {
  const navigate = useNavigate();

  const {
    addToCart,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
  } = useCart();

  const [localWishlistActive, setLocalWishlistActive] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const images = useMemo(() => {
    const productImages = [
      product?.image,
      ...(Array.isArray(product?.images) ? product.images : []),
    ].filter(Boolean);

    return [...new Set(productImages)].slice(0, 4);
  }, [product]);

  if (!product?._id) {
    return null;
  }

  const productImage =
    images[selectedImageIndex] ||
    product?.image ||
    "/images/products/product1.jpg";

  const productPath = `/product/${product?.slug || product?._id}`;

  const discountPercentage = getDiscountPercentage(product);

  const stock = Number(product?.countInStock || 0);

  const isOutOfStock = stock === 0;

  const isLowStock =
    stock > 0 &&
    stock <= Number(product?.lowStockThreshold || 5);

  const wishlistActive =
    typeof isInWishlist === "function"
      ? isInWishlist(product._id)
      : localWishlistActive;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isOutOfStock) {
      toast.error("This product is currently out of stock");
      return;
    }

    if (typeof addToCart === "function") {
      addToCart(product, 1);
      toast.success("Product added to cart");
      return;
    }

    navigate(productPath);
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (wishlistActive) {
      if (typeof removeFromWishlist === "function") {
        removeFromWishlist(product._id);
      }

      setLocalWishlistActive(false);
      toast.success("Removed from wishlist");
      return;
    }

    if (typeof addToWishlist === "function") {
      addToWishlist(product);
    }

    setLocalWishlistActive(true);
    toast.success("Added to wishlist");
  };

  const handleQuickView = (e) => {
    e.preventDefault();
    e.stopPropagation();

    navigate(productPath);
  };

  const imageHoverHandler = () => {
    if (images.length <= 1) return;

    setSelectedImageIndex((prev) =>
      prev === images.length - 1 ? 0 : prev + 1
    );
  };

  return (
    <motion.div
      whileHover={{
        y: -8,
      }}
      transition={{
        duration: 0.22,
      }}
      className="elite-product-card-motion"
    >
      <Card className="elite-product-card h-100">
        <div
          className="elite-product-image-area"
          onMouseEnter={imageHoverHandler}
        >
          <Link to={productPath}>
            <img
              src={productImage}
              alt={product?.name || "EliteShop product"}
              loading="lazy"
              className="elite-product-image"
              onError={(e) => {
                e.currentTarget.src = "/images/products/product1.jpg";
              }}
            />
          </Link>

          <div className="elite-product-top-badges">
            {discountPercentage > 0 && (
              <Badge className="elite-product-discount-badge">
                {discountPercentage}% OFF
              </Badge>
            )}

            {product?.isFeatured && (
              <Badge className="elite-product-featured-badge">
                <FaBolt />
                Featured
              </Badge>
            )}
          </div>

          <div className="elite-product-floating-actions">
            <button
              type="button"
              onClick={handleWishlist}
              aria-label="Toggle wishlist"
              className={wishlistActive ? "active" : ""}
            >
              {wishlistActive ? <FaHeart /> : <FaRegHeart />}
            </button>

            <button
              type="button"
              onClick={handleQuickView}
              aria-label="Quick view"
            >
              <FaEye />
            </button>
          </div>

          {images.length > 1 && (
            <div className="elite-product-image-dots">
              {images.map((img, index) => (
                <button
                  key={`${img}-${index}`}
                  type="button"
                  className={selectedImageIndex === index ? "active" : ""}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setSelectedImageIndex(index);
                  }}
                  aria-label={`View product image ${index + 1}`}
                />
              ))}
            </div>
          )}

          <div className="elite-product-image-overlay">
            <Button
              size="sm"
              variant="light"
              onClick={handleQuickView}
            >
              <FaEye className="me-1" />
              Quick View
            </Button>
          </div>
        </div>

        <Card.Body className="elite-product-body">
          <div className="elite-product-meta-line">
            <span>
              <FaStore className="me-1" />
              {product?.brand || "EliteShop"}
            </span>

            <Badge bg="light" text="dark">
              {product?.category || "Product"}
            </Badge>
          </div>

          <Link
            to={productPath}
            className="elite-product-name"
            title={product?.name}
          >
            {product?.name}
          </Link>

          <div className="elite-product-rating-row">
            <Rating
              value={Number(product?.rating || 0)}
              text=""
            />

            <span>
              <FaStar />
              {Number(product?.rating || 0).toFixed(1)}
            </span>

            <small>
              ({product?.numReviews || 0})
            </small>
          </div>

          <div className="elite-product-price-row">
            <strong>
              ₹{formatPrice(product?.price)}
            </strong>

            {Number(product?.originalPrice || 0) >
              Number(product?.price || 0) && (
              <del>
                ₹{formatPrice(product?.originalPrice)}
              </del>
            )}
          </div>

          <div className="elite-product-info-row">
            <span>
              <FaEye />
              {product?.views || 0}
            </span>

            <span>
              <FaFire />
              {product?.soldCount || 0}
            </span>

            <span>
              <FaBoxOpen />
              {stock}
            </span>
          </div>

          <div className="elite-product-status-row">
            {isOutOfStock ? (
              <Badge bg="danger">
                <FaTimesCircle />
                Out of Stock
              </Badge>
            ) : isLowStock ? (
              <Badge bg="warning" text="dark">
                <FaFire />
                Low Stock
              </Badge>
            ) : (
              <Badge bg="success">
                <FaCheckCircle />
                In Stock
              </Badge>
            )}

            <Badge bg={product?.freeShipping ? "primary" : "secondary"}>
              <FaTruck />
              {product?.freeShipping ? "Free Delivery" : "Fast Delivery"}
            </Badge>
          </div>

          <Button
            className="elite-product-cart-btn"
            disabled={isOutOfStock}
            onClick={handleAddToCart}
          >
            <FaShoppingCart className="me-2" />
            {isOutOfStock ? "Unavailable" : "Add to Cart"}
          </Button>
        </Card.Body>
      </Card>
    </motion.div>
  );
};

export default ProductCard;