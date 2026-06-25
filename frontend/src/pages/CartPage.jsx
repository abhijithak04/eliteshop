import {
  useMemo,
  useState,
} from "react";

import {
  Row,
  Col,
  Image,
  Form,
  Button,
  Card,
  Badge,
  Container,
  ProgressBar,
  Alert,
} from "react-bootstrap";

import {
  FaTrash,
  FaShoppingCart,
  FaArrowLeft,
  FaArrowRight,
  FaTruck,
  FaShieldAlt,
  FaUndo,
  FaTag,
  FaGift,
  FaPlus,
  FaMinus,
  FaStore,
  FaHeart,
  FaBolt,
  FaCheckCircle,
  FaLock,
  FaCreditCard,
  FaBoxOpen,
  FaPercent,
} from "react-icons/fa";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import { motion } from "framer-motion";
import { toast } from "react-toastify";

import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

import "../styles/CartPage.css";

const formatPrice = (value) => {
  return Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const getItemId = (item) => {
  return item._id || item.product || item.id;
};

const CartPage = () => {
  const navigate = useNavigate();

  const {
    cartItems = [],
    addToCart,
    removeFromCart,
    clearCart,
    addToWishlist,
    itemsPrice = 0,
    shippingPrice = 0,
    taxPrice = 0,
    totalPrice = 0,
  } = useCart();

  const { userInfo } = useAuth();

  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);

  const totalItems = useMemo(() => {
    return cartItems.reduce(
      (acc, item) => acc + Number(item.qty || 0),
      0
    );
  }, [cartItems]);

  const totalSavings = useMemo(() => {
    return cartItems.reduce((acc, item) => {
      const originalPrice = Number(item.originalPrice || item.price || 0);
      const price = Number(item.price || 0);
      const qty = Number(item.qty || 0);

      if (originalPrice > price) {
        return acc + (originalPrice - price) * qty;
      }

      return acc;
    }, 0);
  }, [cartItems]);

  const couponDiscount = useMemo(() => {
    if (!couponApplied) return 0;

    return Math.round(Number(itemsPrice || 0) * 0.1);
  }, [
    couponApplied,
    itemsPrice,
  ]);

  const payableTotal = useMemo(() => {
    return Math.max(Number(totalPrice || 0) - couponDiscount, 0);
  }, [
    totalPrice,
    couponDiscount,
  ]);

  const freeShippingGoal = 999;

  const freeShippingProgress = Math.min(
    Math.round((Number(itemsPrice || 0) / freeShippingGoal) * 100),
    100
  );

  const amountForFreeShipping = Math.max(
    freeShippingGoal - Number(itemsPrice || 0),
    0
  );

  const addToCartHandler = (product, qty) => {
    addToCart(product, qty);
  };

  const increaseQtyHandler = (item) => {
    const maxStock = Number(item.countInStock || 1);

    if (Number(item.qty) >= maxStock) {
      toast.info("Maximum stock reached");
      return;
    }

    addToCart(item, Number(item.qty) + 1);
  };

  const decreaseQtyHandler = (item) => {
    const itemId = getItemId(item);

    if (Number(item.qty) <= 1) {
      removeFromCartHandler(itemId);
      return;
    }

    addToCart(item, Number(item.qty) - 1);
  };

  const removeFromCartHandler = (id) => {
    removeFromCart(id);
    toast.success("Item removed from cart");
  };

  const clearCartHandler = () => {
    if (!cartItems.length) return;

    if (!window.confirm("Clear all products from cart?")) {
      return;
    }

    clearCart();
    setCouponApplied(false);
    setCouponCode("");
    toast.success("Cart cleared");
  };

  const moveToWishlistHandler = (item) => {
    const itemId = getItemId(item);

    if (typeof addToWishlist === "function") {
      addToWishlist(item);
    }

    removeFromCart(itemId);
    toast.success("Moved to wishlist");
  };

  const applyCouponHandler = (e) => {
    e.preventDefault();

    const code = couponCode.trim().toUpperCase();

    if (!code) {
      toast.error("Please enter coupon code");
      return;
    }

    if (code === "ELITE10") {
      setCouponApplied(true);
      setCouponCode("ELITE10");
      toast.success("Coupon ELITE10 applied successfully");
      return;
    }

    setCouponApplied(false);
    toast.error("Invalid coupon. Try ELITE10");
  };

  const removeCouponHandler = () => {
    setCouponApplied(false);
    setCouponCode("");
    toast.info("Coupon removed");
  };

  const checkoutHandler = () => {
    if (cartItems.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    if (userInfo) {
      navigate("/shipping");
    } else {
      navigate("/login?redirect=/shipping");
    }
  };

  return (
    <main className="elite-cart-page">
      <Container fluid="xl">
        <motion.section
          className="elite-cart-hero"
          initial={{
            opacity: 0,
            y: 18,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.3,
          }}
        >
          <div>
            <Badge bg="warning" text="dark" className="elite-cart-hero-badge">
              <FaShoppingCart className="me-2" />
              EliteShop Cart
            </Badge>

            <h1>Shopping Cart</h1>

            <p>
              Review your products, manage quantities, apply offers and continue
              to secure checkout.
            </p>
          </div>

          <div className="elite-cart-hero-actions">
            <Button
              variant="light"
              onClick={() => navigate("/products")}
            >
              <FaArrowLeft className="me-2" />
              Continue Shopping
            </Button>

            {cartItems.length > 0 && (
              <Button
                variant="outline-light"
                onClick={clearCartHandler}
              >
                <FaTrash className="me-2" />
                Clear Cart
              </Button>
            )}
          </div>

          <motion.div
            className="elite-cart-floating-badge"
            animate={{
              y: [0, -10, 0],
            }}
            transition={{
              duration: 3.5,
              repeat: Infinity,
            }}
          >
            <FaBolt />
            Fast Checkout
          </motion.div>
        </motion.section>

        {cartItems.length === 0 ? (
          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.3,
            }}
          >
            <Card className="elite-cart-empty-card">
              <Card.Body>
                <div className="elite-cart-empty-icon">
                  <FaShoppingCart />
                </div>

                <h2>Your cart is empty</h2>

                <p>
                  Looks like you have not added anything yet. Explore EliteShop
                  products and find your next favorite item.
                </p>

                <div className="elite-cart-empty-actions">
                  <Button
                    variant="dark"
                    onClick={() => navigate("/products")}
                  >
                    <FaShoppingCart className="me-2" />
                    Start Shopping
                  </Button>

                  <Button
                    variant="outline-dark"
                    onClick={() => navigate("/")}
                  >
                    Go Home
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </motion.div>
        ) : (
          <Row className="g-4">
            <Col xl={8}>
              <Row className="g-4 mb-4">
                <Col md={4}>
                  <Card className="elite-cart-stat-card items">
                    <Card.Body>
                      <FaBoxOpen />
                      <span>Total Items</span>
                      <h3>{totalItems}</h3>
                    </Card.Body>
                  </Card>
                </Col>

                <Col md={4}>
                  <Card className="elite-cart-stat-card savings">
                    <Card.Body>
                      <FaGift />
                      <span>Your Savings</span>
                      <h3>₹{formatPrice(totalSavings + couponDiscount)}</h3>
                    </Card.Body>
                  </Card>
                </Col>

                <Col md={4}>
                  <Card className="elite-cart-stat-card security">
                    <Card.Body>
                      <FaShieldAlt />
                      <span>Secure Cart</span>
                      <h3>100%</h3>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              <Card className="elite-cart-items-card">
                <Card.Body>
                  <div className="elite-cart-section-heading">
                    <div>
                      <h3>Cart Products</h3>
                      <p>
                        {cartItems.length} product
                        {cartItems.length !== 1 ? "s" : ""} in your cart
                      </p>
                    </div>

                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={clearCartHandler}
                    >
                      <FaTrash className="me-2" />
                      Clear All
                    </Button>
                  </div>

                  <div className="elite-cart-items-list">
                    {cartItems.map((item, index) => {
                      const itemId = getItemId(item);
                      const maxStock = Math.max(Number(item.countInStock || 1), 1);

                      return (
                        <motion.div
                          key={itemId}
                          className="elite-cart-item"
                          initial={{
                            opacity: 0,
                            x: -20,
                          }}
                          animate={{
                            opacity: 1,
                            x: 0,
                          }}
                          transition={{
                            duration: 0.25,
                            delay: index * 0.05,
                          }}
                        >
                          <div className="elite-cart-item-image">
                            <Link to={`/product/${item.slug || itemId}`}>
                              <Image
                                src={item.image || "/placeholder.svg"}
                                alt={item.name}
                                loading="lazy"
                              />
                            </Link>

                            {item.isFeatured && (
                              <Badge bg="danger">Featured</Badge>
                            )}
                          </div>

                          <div className="elite-cart-item-info">
                            <Link
                              to={`/product/${item.slug || itemId}`}
                              className="elite-cart-item-name"
                            >
                              {item.name}
                            </Link>

                            <div className="elite-cart-item-meta">
                              <span>
                                <FaStore />
                                {item.brand || "EliteShop"}
                              </span>

                              <span>
                                <FaTag />
                                {item.category || "Product"}
                              </span>
                            </div>

                            <div className="elite-cart-stock-row">
                              {Number(item.countInStock || 0) > 0 ? (
                                <Badge bg="success">
                                  <FaCheckCircle className="me-1" />
                                  In Stock
                                </Badge>
                              ) : (
                                <Badge bg="danger">
                                  Out of Stock
                                </Badge>
                              )}

                              {item.freeShipping && (
                                <Badge bg="primary">
                                  <FaTruck className="me-1" />
                                  Free Delivery
                                </Badge>
                              )}
                            </div>

                            <div className="elite-cart-mobile-price">
                              ₹{formatPrice(item.price)}
                            </div>
                          </div>

                          <div className="elite-cart-price-box">
                            <span>Price</span>
                            <strong>₹{formatPrice(item.price)}</strong>

                            {Number(item.originalPrice || 0) >
                              Number(item.price || 0) && (
                              <del>₹{formatPrice(item.originalPrice)}</del>
                            )}
                          </div>

                          <div className="elite-cart-qty-box">
                            <span>Quantity</span>

                            <div className="elite-cart-qty-control">
                              <button
                                type="button"
                                onClick={() => decreaseQtyHandler(item)}
                              >
                                <FaMinus />
                              </button>

                              <Form.Select
                                value={item.qty}
                                onChange={(e) =>
                                  addToCartHandler(item, Number(e.target.value))
                                }
                              >
                                {[...Array(maxStock).keys()]
                                  .slice(0, 10)
                                  .map((x) => (
                                    <option key={x + 1} value={x + 1}>
                                      {x + 1}
                                    </option>
                                  ))}
                              </Form.Select>

                              <button
                                type="button"
                                onClick={() => increaseQtyHandler(item)}
                              >
                                <FaPlus />
                              </button>
                            </div>
                          </div>

                          <div className="elite-cart-subtotal-box">
                            <span>Subtotal</span>
                            <strong>
                              ₹
                              {formatPrice(
                                Number(item.price || 0) * Number(item.qty || 0)
                              )}
                            </strong>
                          </div>

                          <div className="elite-cart-actions-box">
                            <Button
                              variant="light"
                              onClick={() => moveToWishlistHandler(item)}
                              title="Move to wishlist"
                            >
                              <FaHeart />
                            </Button>

                            <Button
                              variant="danger"
                              onClick={() => removeFromCartHandler(itemId)}
                              title="Remove item"
                            >
                              <FaTrash />
                            </Button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </Card.Body>
              </Card>

              <Row className="g-4 mt-1">
                <Col md={4}>
                  <Card className="elite-cart-trust-card">
                    <Card.Body>
                      <FaTruck />
                      <h5>Fast Delivery</h5>
                      <p>Delivery support for eligible products.</p>
                    </Card.Body>
                  </Card>
                </Col>

                <Col md={4}>
                  <Card className="elite-cart-trust-card">
                    <Card.Body>
                      <FaLock />
                      <h5>Secure Checkout</h5>
                      <p>Protected payment and order flow.</p>
                    </Card.Body>
                  </Card>
                </Col>

                <Col md={4}>
                  <Card className="elite-cart-trust-card">
                    <Card.Body>
                      <FaUndo />
                      <h5>Easy Returns</h5>
                      <p>Return support for eligible orders.</p>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Col>

            <Col xl={4}>
              <div className="elite-cart-summary-stack">
                <Card className="elite-cart-summary-card">
                  <Card.Header>
                    <FaCreditCard className="me-2" />
                    Order Summary
                  </Card.Header>

                  <Card.Body>
                    <div className="elite-cart-free-shipping">
                      {amountForFreeShipping > 0 ? (
                        <>
                          <div>
                            <span>Free shipping progress</span>
                            <strong>
                              Add ₹{formatPrice(amountForFreeShipping)} more
                            </strong>
                          </div>

                          <ProgressBar now={freeShippingProgress} />
                        </>
                      ) : (
                        <Alert variant="success" className="elite-cart-alert">
                          <FaCheckCircle className="me-2" />
                          You are eligible for free shipping.
                        </Alert>
                      )}
                    </div>

                    <Form
                      onSubmit={applyCouponHandler}
                      className="elite-cart-coupon-form"
                    >
                      <Form.Label>Apply Coupon</Form.Label>

                      <div>
                        <FaTag />

                        <input
                          type="text"
                          placeholder="Try ELITE10"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value)}
                        />

                        <button type="submit">
                          Apply
                        </button>
                      </div>

                      {couponApplied && (
                        <small>
                          <FaPercent className="me-1" />
                          ELITE10 applied. 10% discount added.
                          <button
                            type="button"
                            className="elite-cart-remove-coupon"
                            onClick={removeCouponHandler}
                          >
                            Remove
                          </button>
                        </small>
                      )}
                    </Form>

                    <div className="elite-cart-summary-lines">
                      <div>
                        <span>Items ({totalItems})</span>
                        <strong>₹{formatPrice(itemsPrice)}</strong>
                      </div>

                      <div>
                        <span>Shipping</span>
                        <strong>
                          {Number(shippingPrice || 0) === 0
                            ? "Free"
                            : `₹${formatPrice(shippingPrice)}`}
                        </strong>
                      </div>

                      <div>
                        <span>Tax</span>
                        <strong>₹{formatPrice(taxPrice)}</strong>
                      </div>

                      {totalSavings > 0 && (
                        <div className="elite-cart-saving-line">
                          <span>Product Savings</span>
                          <strong>₹{formatPrice(totalSavings)}</strong>
                        </div>
                      )}

                      {couponDiscount > 0 && (
                        <div className="elite-cart-saving-line">
                          <span>Coupon Discount</span>
                          <strong>- ₹{formatPrice(couponDiscount)}</strong>
                        </div>
                      )}

                      <div className="elite-cart-total-line">
                        <span>Total</span>
                        <strong>₹{formatPrice(payableTotal)}</strong>
                      </div>
                    </div>

                    <Button
                      className="elite-cart-checkout-btn"
                      disabled={cartItems.length === 0}
                      onClick={checkoutHandler}
                    >
                      Proceed To Checkout
                      <FaArrowRight className="ms-2" />
                    </Button>

                    <Button
                      variant="outline-dark"
                      className="elite-cart-continue-btn"
                      onClick={() => navigate("/products")}
                    >
                      Continue Shopping
                    </Button>

                    {!userInfo && (
                      <Alert variant="warning" className="elite-cart-login-alert">
                        Login is required before checkout.
                      </Alert>
                    )}
                  </Card.Body>
                </Card>

                <Card className="elite-cart-support-card">
                  <Card.Body>
                    <div>
                      <FaShieldAlt />
                      <span>Buyer Protection</span>
                    </div>

                    <div>
                      <FaTruck />
                      <span>Delivery Tracking</span>
                    </div>

                    <div>
                      <FaLock />
                      <span>Secure Payment</span>
                    </div>
                  </Card.Body>
                </Card>
              </div>
            </Col>
          </Row>
        )}
      </Container>
    </main>
  );
};

export default CartPage;