import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  Button,
  Row,
  Col,
  ListGroup,
  Image,
  Card,
  Badge,
  Container,
  Alert,
  Spinner,
  Form,
  ProgressBar,
} from "react-bootstrap";

import { motion } from "framer-motion";
import { toast } from "react-toastify";

import {
  FaArrowLeft,
  FaBoxOpen,
  FaCheckCircle,
  FaCreditCard,
  FaGift,
  FaLock,
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaReceipt,
  FaRupeeSign,
  FaShieldAlt,
  FaShoppingBag,
  FaStore,
  FaTruck,
  FaWallet,
  FaExclamationTriangle,
  FaBolt,
  FaPhoneAlt,
  FaUser,
  FaQrcode,
  FaUniversity,
  FaClipboardCheck,
  FaUndo,
} from "react-icons/fa";

import CheckoutSteps from "../components/CheckoutSteps";
import Message from "../components/Message";

import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

import axios from "../utils/axios";

import "../styles/PlaceOrder.css";

const formatPrice = (value) => {
  return Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const addDecimals = (num) => {
  return (Math.round(Number(num || 0) * 100) / 100).toFixed(2);
};

const getItemId = (item) => {
  return item.product || item._id || item.id;
};

const PlaceOrderPage = () => {
  const navigate = useNavigate();

  const {
    cartItems = [],
    shippingAddress,
    paymentMethod,
    clearCart,
  } = useCart();

  const { userInfo } = useAuth();

  const [loading, setLoading] = useState(false);
  const [sdkLoading, setSdkLoading] = useState(false);
  const [acceptedReview, setAcceptedReview] = useState(false);

  const hasShippingAddress = Boolean(
    shippingAddress?.address &&
      shippingAddress?.city &&
      shippingAddress?.postalCode
  );

  const hasPaymentMethod = Boolean(paymentMethod);

  useEffect(() => {
    if (!cartItems.length) {
      toast.info("Your cart is empty");
      navigate("/cart", {
        replace: true,
      });
      return;
    }

    if (!hasShippingAddress) {
      toast.info("Please add shipping address first");
      navigate("/shipping", {
        replace: true,
      });
      return;
    }

    if (!hasPaymentMethod) {
      toast.info("Please choose payment method first");
      navigate("/payment", {
        replace: true,
      });
    }
  }, [
    cartItems.length,
    hasShippingAddress,
    hasPaymentMethod,
    navigate,
  ]);

  const priceDetails = useMemo(() => {
    const items = addDecimals(
      cartItems.reduce(
        (acc, item) =>
          acc + Number(item.price || 0) * Number(item.qty || 0),
        0
      )
    );

    const shipping = addDecimals(Number(items) > 1000 ? 0 : 80);
    const tax = addDecimals(0.18 * Number(items));
    const total = addDecimals(
      Number(items) + Number(shipping) + Number(tax)
    );

    const totalItems = cartItems.reduce(
      (acc, item) => acc + Number(item.qty || 0),
      0
    );

    const savings = cartItems.reduce((acc, item) => {
      const original = Number(item.originalPrice || item.price || 0);
      const price = Number(item.price || 0);

      if (original > price) {
        return acc + (original - price) * Number(item.qty || 0);
      }

      return acc;
    }, 0);

    return {
      itemsPrice: items,
      shippingPrice: shipping,
      taxPrice: tax,
      totalPrice: total,
      totalItems,
      savings: addDecimals(savings),
    };
  }, [cartItems]);

  const deliveryDate = useMemo(() => {
    const deliveryMode = shippingAddress?.deliveryMode;
    const days = deliveryMode === "express" ? 3 : 5;

    return new Date(
      Date.now() + days * 24 * 60 * 60 * 1000
    ).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }, [shippingAddress?.deliveryMode]);

  const checkoutReadiness = useMemo(() => {
    let score = 0;

    if (cartItems.length) score += 25;
    if (hasShippingAddress) score += 25;
    if (hasPaymentMethod) score += 25;
    if (acceptedReview) score += 25;

    return score;
  }, [
    cartItems.length,
    hasShippingAddress,
    hasPaymentMethod,
    acceptedReview,
  ]);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      setSdkLoading(true);

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;

      script.onload = () => {
        setSdkLoading(false);
        resolve(true);
      };

      script.onerror = () => {
        setSdkLoading(false);
        resolve(false);
      };

      document.body.appendChild(script);
    });
  };

  const createOrderPayload = () => {
    const orderItems = cartItems.map((item) => {
      const productId = getItemId(item);

      return {
        name: item.name,
        qty: Number(item.qty || 1),
        image: item.image,
        price: Number(item.price || 0),
        product: productId,
        seller: item.seller?._id || item.seller || item.user || undefined,
      };
    });

    return {
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice: priceDetails.itemsPrice,
      shippingPrice: priceDetails.shippingPrice,
      taxPrice: priceDetails.taxPrice,
      totalPrice: priceDetails.totalPrice,
    };
  };

  const navigateToOrder = (orderId) => {
    navigate(`/orders/${orderId}`);
  };

  const handleCODOrder = async () => {
    const { data: order } = await axios.post(
      "/orders",
      createOrderPayload()
    );

    clearCart();

    toast.success("COD order placed successfully");
    navigateToOrder(order._id);
  };

  const handleRazorpayOrder = async () => {
    const { data: order } = await axios.post(
      "/orders",
      createOrderPayload()
    );

    const sdkLoaded = await loadRazorpayScript();

    if (!sdkLoaded) {
      toast.error("Razorpay checkout failed to load. Order saved as pending.");
      navigateToOrder(order._id);
      return;
    }

    let razorpayOrder;

    try {
      const response = await axios.post("/orders/razorpay", {
        amount: priceDetails.totalPrice,
        orderId: order._id,
      });

      razorpayOrder = response.data;
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to create Razorpay payment order"
      );

      navigateToOrder(order._id);
      return;
    }

    const publicKey =
      razorpayOrder.key ||
      razorpayOrder.key_id ||
      import.meta.env.VITE_RAZORPAY_KEY_ID;

    if (!publicKey) {
      toast.error("Razorpay public key missing. Order saved as pending.");
      navigateToOrder(order._id);
      return;
    }

    const options = {
      key: publicKey,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency || "INR",
      name: "EliteShop",
      description: `Payment for order #${order._id}`,
      order_id: razorpayOrder.id || razorpayOrder.order_id,

      prefill: {
        name: shippingAddress.fullName || userInfo?.name || "",
        email: userInfo?.email || "",
        contact: shippingAddress.phone || "",
      },

      notes: {
        local_order_id: order._id,
        customer_email: userInfo?.email || "",
      },

      theme: {
        color: "#2563eb",
      },

      modal: {
        confirm_close: true,
        ondismiss: () => {
          toast.info("Payment cancelled. Your order is saved as pending.");
          navigateToOrder(order._id);
        },
      },

      handler: async function (response) {
        try {
          await axios.put(`/orders/${order._id}/pay`, {
            id: response.razorpay_payment_id,
            status: "COMPLETED",
            update_time: new Date().toISOString(),
            email_address: userInfo?.email,

            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });

          clearCart();

          toast.success("Payment successful");
          navigateToOrder(order._id);
        } catch (error) {
          toast.error(
            error.response?.data?.message ||
              "Payment verification failed. Order saved as pending."
          );

          navigateToOrder(order._id);
        }
      },
    };

    const razorpay = new window.Razorpay(options);

    razorpay.open();
  };

  const placeOrderHandler = async () => {
    if (!userInfo) {
      navigate("/login?redirect=/placeorder");
      return;
    }

    if (!cartItems.length) {
      toast.error("Your cart is empty");
      navigate("/cart");
      return;
    }

    if (!hasShippingAddress) {
      toast.error("Please add shipping address");
      navigate("/shipping");
      return;
    }

    if (!hasPaymentMethod) {
      toast.error("Please choose payment method");
      navigate("/payment");
      return;
    }

    if (!acceptedReview) {
      toast.error("Please confirm that order details are correct");
      return;
    }

    try {
      setLoading(true);

      if (paymentMethod === "COD") {
        await handleCODOrder();
        return;
      }

      if (paymentMethod === "Razorpay") {
        await handleRazorpayOrder();
        return;
      }

      toast.error("Invalid payment method");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Order placement failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="elite-placeorder-page">
      <Container fluid="xl">
        <motion.section
          className="elite-placeorder-hero"
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
            <Badge
              bg="warning"
              text="dark"
              className="elite-placeorder-hero-badge"
            >
              <FaReceipt className="me-2" />
              Final Review
            </Badge>

            <h1>Review & Place Order</h1>

            <p>
              Check your address, payment method and products before placing
              the order securely.
            </p>
          </div>

          <div className="elite-placeorder-hero-actions">
            <Button
              variant="light"
              onClick={() => navigate("/payment")}
            >
              <FaArrowLeft className="me-2" />
              Back To Payment
            </Button>

            <Button
              variant="outline-light"
              onClick={() => navigate("/cart")}
            >
              View Cart
            </Button>
          </div>

          <motion.div
            className="elite-placeorder-floating-badge"
            animate={{
              y: [0, -10, 0],
            }}
            transition={{
              duration: 3.5,
              repeat: Infinity,
            }}
          >
            <FaShieldAlt />
            Secure Order
          </motion.div>
        </motion.section>

        <div className="elite-placeorder-steps">
          <CheckoutSteps step1 step2 step3 step4 />
        </div>

        <Row className="g-4">
          <Col xl={8}>
            <Row className="g-4 mb-4">
              <Col md={4}>
                <Card className="elite-placeorder-stat-card items">
                  <Card.Body>
                    <FaShoppingBag />
                    <span>Total Items</span>
                    <h3>{priceDetails.totalItems}</h3>
                  </Card.Body>
                </Card>
              </Col>

              <Col md={4}>
                <Card className="elite-placeorder-stat-card payment">
                  <Card.Body>
                    {paymentMethod === "COD" ? (
                      <FaMoneyBillWave />
                    ) : (
                      <FaCreditCard />
                    )}

                    <span>Payment</span>
                    <h3>{paymentMethod}</h3>
                  </Card.Body>
                </Card>
              </Col>

              <Col md={4}>
                <Card className="elite-placeorder-stat-card total">
                  <Card.Body>
                    <FaRupeeSign />
                    <span>Total</span>
                    <h3>₹{formatPrice(priceDetails.totalPrice)}</h3>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            <Card className="elite-placeorder-readiness-card mb-4">
              <Card.Body>
                <div>
                  <h3>
                    <FaClipboardCheck className="me-2" />
                    Checkout Readiness
                  </h3>

                  <p>
                    Confirm all steps before placing your order.
                  </p>
                </div>

                <div className="elite-placeorder-readiness-progress">
                  <strong>{checkoutReadiness}%</strong>
                  <ProgressBar now={checkoutReadiness} />
                </div>
              </Card.Body>
            </Card>

            <Card className="elite-placeorder-info-card mb-4">
              <Card.Body>
                <div className="elite-placeorder-section-heading">
                  <div>
                    <h3>
                      <FaMapMarkerAlt className="me-2" />
                      Shipping Address
                    </h3>

                    <p>Delivery details for this order.</p>
                  </div>

                  <Button
                    variant="outline-dark"
                    size="sm"
                    onClick={() => navigate("/shipping")}
                  >
                    Change
                  </Button>
                </div>

                <div className="elite-placeorder-address-box">
                  <div>
                    <FaUser />
                    <span>Name</span>
                    <strong>
                      {shippingAddress?.fullName || userInfo?.name || "Customer"}
                    </strong>
                  </div>

                  <div>
                    <FaPhoneAlt />
                    <span>Phone</span>
                    <strong>{shippingAddress?.phone || "Not added"}</strong>
                  </div>

                  <div>
                    <FaTruck />
                    <span>Estimated Delivery</span>
                    <strong>{deliveryDate}</strong>
                  </div>
                </div>

                <p className="elite-placeorder-address-text">
                  {[
                    shippingAddress?.address,
                    shippingAddress?.landmark,
                    shippingAddress?.city,
                    shippingAddress?.state,
                    shippingAddress?.postalCode,
                    shippingAddress?.country,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              </Card.Body>
            </Card>

            <Card className="elite-placeorder-payment-card mb-4">
              <Card.Body>
                <div className="elite-placeorder-section-heading">
                  <div>
                    <h3>
                      <FaWallet className="me-2" />
                      Payment Method
                    </h3>

                    <p>
                      Payment will be processed securely during final
                      confirmation.
                    </p>
                  </div>

                  <Button
                    variant="outline-dark"
                    size="sm"
                    onClick={() => navigate("/payment")}
                  >
                    Change
                  </Button>
                </div>

                <div
                  className={
                    paymentMethod === "COD"
                      ? "elite-payment-review-box cod"
                      : "elite-payment-review-box"
                  }
                >
                  <div className="elite-payment-review-icon">
                    {paymentMethod === "COD" ? (
                      <FaMoneyBillWave />
                    ) : (
                      <FaBolt />
                    )}
                  </div>

                  <div>
                    <h4>
                      {paymentMethod === "COD"
                        ? "Cash On Delivery"
                        : "Razorpay Secure Payment"}
                    </h4>

                    <p>
                      {paymentMethod === "COD"
                        ? "Pay when your product is delivered."
                        : "UPI, cards, wallets and net banking through Razorpay Checkout."}
                    </p>

                    {paymentMethod === "Razorpay" && (
                      <div className="elite-placeorder-payment-tags">
                        <span>
                          <FaQrcode />
                          UPI
                        </span>

                        <span>
                          <FaCreditCard />
                          Cards
                        </span>

                        <span>
                          <FaUniversity />
                          Banking
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {paymentMethod === "Razorpay" && (
                  <Alert
                    variant="info"
                    className="elite-placeorder-secure-alert"
                  >
                    <FaLock className="me-2" />
                    Razorpay order is created from your backend only. No
                    Razorpay secret key is used in frontend.
                  </Alert>
                )}
              </Card.Body>
            </Card>

            <Card className="elite-placeorder-items-card">
              <Card.Body>
                <div className="elite-placeorder-section-heading">
                  <div>
                    <h3>
                      <FaBoxOpen className="me-2" />
                      Order Items
                    </h3>

                    <p>
                      {cartItems.length} product
                      {cartItems.length !== 1 ? "s" : ""} ready to order.
                    </p>
                  </div>
                </div>

                {cartItems.length === 0 ? (
                  <Message>Your cart is empty</Message>
                ) : (
                  <div className="elite-placeorder-items-list">
                    {cartItems.map((item, index) => {
                      const itemId = getItemId(item);

                      return (
                        <motion.div
                          key={itemId || index}
                          className="elite-placeorder-item"
                          initial={{
                            opacity: 0,
                            x: -18,
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
                          <Link to={`/product/${item.slug || itemId}`}>
                            <Image
                              src={item.image || "/placeholder.svg"}
                              alt={item.name}
                              loading="lazy"
                            />
                          </Link>

                          <div className="elite-placeorder-item-info">
                            <Link
                              to={`/product/${item.slug || itemId}`}
                              className="elite-placeorder-item-name"
                            >
                              {item.name}
                            </Link>

                            <div className="elite-placeorder-item-meta">
                              <span>
                                <FaStore />
                                {item.brand || "EliteShop"}
                              </span>

                              <span>
                                <FaBoxOpen />
                                Qty: {item.qty}
                              </span>
                            </div>

                            <div className="elite-placeorder-item-badges">
                              {item.freeShipping && (
                                <Badge bg="primary">Free Delivery</Badge>
                              )}

                              {item.isFeatured && (
                                <Badge bg="danger">Featured</Badge>
                              )}
                            </div>
                          </div>

                          <div className="elite-placeorder-item-price">
                            <span>
                              {item.qty} × ₹{formatPrice(item.price)}
                            </span>

                            <strong>
                              ₹
                              {formatPrice(
                                Number(item.qty || 0) *
                                  Number(item.price || 0)
                              )}
                            </strong>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>

          <Col xl={4}>
            <div className="elite-placeorder-summary-stack">
              <Card className="elite-placeorder-summary-card">
                <Card.Header>
                  <FaReceipt className="me-2" />
                  Order Summary
                </Card.Header>

                <ListGroup variant="flush">
                  <ListGroup.Item>
                    <span>Items</span>
                    <strong>₹{formatPrice(priceDetails.itemsPrice)}</strong>
                  </ListGroup.Item>

                  <ListGroup.Item>
                    <span>Shipping</span>
                    <strong>
                      {Number(priceDetails.shippingPrice) === 0
                        ? "Free"
                        : `₹${formatPrice(priceDetails.shippingPrice)}`}
                    </strong>
                  </ListGroup.Item>

                  <ListGroup.Item>
                    <span>Tax</span>
                    <strong>₹{formatPrice(priceDetails.taxPrice)}</strong>
                  </ListGroup.Item>

                  {Number(priceDetails.savings) > 0 && (
                    <ListGroup.Item className="elite-placeorder-saving-line">
                      <span>You Saved</span>
                      <strong>₹{formatPrice(priceDetails.savings)}</strong>
                    </ListGroup.Item>
                  )}

                  <ListGroup.Item className="elite-placeorder-total-line">
                    <span>Total</span>
                    <strong>₹{formatPrice(priceDetails.totalPrice)}</strong>
                  </ListGroup.Item>

                  <ListGroup.Item>
                    <Form.Check
                      type="checkbox"
                      id="accept-review"
                      className="elite-placeorder-confirm-check"
                      checked={acceptedReview}
                      onChange={(e) => setAcceptedReview(e.target.checked)}
                      label="I confirm that address, payment method and order items are correct."
                    />
                  </ListGroup.Item>

                  <ListGroup.Item>
                    <Button
                      type="button"
                      className={
                        paymentMethod === "COD"
                          ? "elite-placeorder-submit-btn cod"
                          : "elite-placeorder-submit-btn"
                      }
                      disabled={
                        cartItems.length === 0 ||
                        loading ||
                        sdkLoading ||
                        !acceptedReview
                      }
                      onClick={placeOrderHandler}
                    >
                      {loading || sdkLoading ? (
                        <>
                          <Spinner
                            animation="border"
                            size="sm"
                            className="me-2"
                          />
                          Processing...
                        </>
                      ) : paymentMethod === "COD" ? (
                        <>
                          <FaMoneyBillWave className="me-2" />
                          Place Order
                        </>
                      ) : (
                        <>
                          <FaLock className="me-2" />
                          Pay Securely
                        </>
                      )}
                    </Button>

                    <Button
                      variant="outline-dark"
                      className="elite-placeorder-back-btn"
                      onClick={() => navigate("/payment")}
                    >
                      Back To Payment
                    </Button>
                  </ListGroup.Item>
                </ListGroup>
              </Card>

              <Card className="elite-placeorder-trust-card">
                <Card.Body>
                  <div>
                    <FaShieldAlt />
                    <span>Protected Checkout</span>
                  </div>

                  <div>
                    <FaLock />
                    <span>Backend Payment Verification</span>
                  </div>

                  <div>
                    <FaTruck />
                    <span>Trackable Delivery</span>
                  </div>

                  <div>
                    <FaUndo />
                    <span>Order Support Available</span>
                  </div>

                  <div>
                    <FaGift />
                    <span>Easy Order Support</span>
                  </div>
                </Card.Body>
              </Card>

              <Alert variant="warning" className="elite-placeorder-alert">
                <FaExclamationTriangle className="me-2" />
                Do not refresh during Razorpay payment popup.
              </Alert>
            </div>
          </Col>
        </Row>
      </Container>
    </main>
  );
};

export default PlaceOrderPage;