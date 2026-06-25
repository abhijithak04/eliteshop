import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
  useParams,
  useNavigate,
} from "react-router-dom";

import {
  Row,
  Col,
  ListGroup,
  Image,
  Card,
  Button,
  Badge,
  Alert,
  Container,
  Spinner,
  ProgressBar,
  Form,
} from "react-bootstrap";

import { motion } from "framer-motion";

import { toast } from "react-toastify";

import {
  FaArrowLeft,
  FaBoxOpen,
  FaCheckCircle,
  FaClock,
  FaCreditCard,
  FaExclamationTriangle,
  FaFileInvoice,
  FaGift,
  FaHeadset,
  FaLock,
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaPhoneAlt,
  FaQrcode,
  FaReceipt,
  FaRupeeSign,
  FaShieldAlt,
  FaShoppingBag,
  FaStore,
  FaTimesCircle,
  FaTruck,
  FaUndo,
  FaUniversity,
  FaUser,
  FaWallet,
  FaBolt,
  FaRoute,
  FaUserShield,
} from "react-icons/fa";

import Message from "../components/Message";
import Loader from "../components/Loader";

import { useAuth } from "../context/AuthContext";

import axios from "../utils/axios";

import "../styles/OrderDetails.css";

const CLOSED_ORDER_STATUSES = [
  "Cancelled",
  "Delivered",
  "Returned",
  "Refunded",
];

const formatPrice = (value) => {
  return Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const formatDate = (date) => {
  if (!date) return "Not available";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const getStatusVariant = (status) => {
  switch (status) {
    case "Delivered":
      return "success";

    case "Cancelled":
    case "Returned":
    case "Refunded":
      return "danger";

    case "Shipped":
    case "Out For Delivery":
      return "primary";

    case "Packed":
    case "Processing":
      return "warning";

    case "Confirmed":
      return "success";

    case "Pending Payment":
    case "Pending":
    default:
      return "secondary";
  }
};

const getStatusStep = (status) => {
  const statusMap = {
    Pending: 10,
    "Pending Payment": 15,
    Confirmed: 30,
    Processing: 45,
    Packed: 60,
    Shipped: 75,
    "Out For Delivery": 88,
    Delivered: 100,
    Cancelled: 100,
    Returned: 100,
    Refunded: 100,
  };

  return statusMap[status] || 10;
};

const isClosedOrder = (order) => {
  return CLOSED_ORDER_STATUSES.includes(order?.orderStatus);
};

const OrderPage = () => {
  const {
    id: orderId,
  } = useParams();

  const navigate = useNavigate();

  const {
    userInfo,
  } = useAuth();

  const [order, setOrder] = useState(null);

  const [loading, setLoading] = useState(true);
  const [loadingPay, setLoadingPay] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const [cancelReason, setCancelReason] = useState("");

  const currentUserId =
    userInfo?._id || userInfo?.id;

  const orderUserId =
    order?.user?._id || order?.user;

  const isOrderOwner =
    Boolean(order) &&
    Boolean(currentUserId) &&
    Boolean(orderUserId) &&
    String(currentUserId) === String(orderUserId);

  const isAdmin =
    userInfo?.role === "admin" ||
    userInfo?.isAdmin === true;

  const isSeller =
    userInfo?.role === "seller";

  const isStaffView =
    isAdmin || isSeller;

  const backToOrdersPath = isAdmin
    ? "/admin/orders"
    : isSeller
    ? "/seller/dashboard"
    : "/orders";

  const backButtonLabel = isAdmin
    ? "Admin Orders"
    : isSeller
    ? "Seller Dashboard"
    : "My Orders";

  const fetchOrder = async () => {
    try {
      setLoading(true);

      const {
        data,
      } = await axios.get(`/orders/${orderId}`);

      setOrder(data);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to load order"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const totalItems = useMemo(() => {
    return order?.orderItems?.reduce(
      (acc, item) => acc + Number(item.qty || 0),
      0
    );
  }, [order]);

  const statusProgress = useMemo(() => {
    return getStatusStep(order?.orderStatus);
  }, [order]);

  const canPay =
    order &&
    isOrderOwner &&
    !isAdmin &&
    !isSeller &&
    !order.isPaid &&
    order.paymentMethod === "Razorpay" &&
    !isClosedOrder(order);

  const canCancel =
    order &&
    isOrderOwner &&
    !isAdmin &&
    !isSeller &&
    !order.isPaid &&
    !order.isDelivered &&
    !isClosedOrder(order);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement("script");

      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;

      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);

      document.body.appendChild(script);
    });
  };

  const payWithRazorpay = async () => {
    if (!order) return;

    if (!isOrderOwner || isAdmin || isSeller) {
      toast.error(
        "Only the customer who placed this order can complete payment."
      );
      return;
    }

    if (isClosedOrder(order)) {
      toast.error("This order is already closed and cannot be paid.");
      return;
    }

    if (order.isPaid) {
      toast.info("This order is already paid.");
      return;
    }

    if (order.paymentMethod !== "Razorpay") {
      toast.error("This order is not a Razorpay order.");
      return;
    }

    try {
      setLoadingPay(true);

      const loaded = await loadRazorpayScript();

      if (!loaded) {
        toast.error("Razorpay Checkout failed to load");
        return;
      }

      const {
        data: razorpayOrder,
      } = await axios.post("/orders/razorpay", {
        amount: order.totalPrice,
        orderId: order._id,
      });

      const publicKey =
        razorpayOrder.key ||
        razorpayOrder.key_id ||
        import.meta.env.VITE_RAZORPAY_KEY_ID;

      if (!publicKey) {
        toast.error("Razorpay public key missing");
        return;
      }

      const options = {
        key: publicKey,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency || "INR",
        name: "EliteShop",
        description: `Payment for order #${order._id}`,
        order_id:
          razorpayOrder.id ||
          razorpayOrder.order_id,

        prefill: {
          name:
            order.shippingAddress?.fullName ||
            userInfo?.name ||
            order.user?.name ||
            "",
          email:
            userInfo?.email ||
            order.user?.email ||
            "",
          contact:
            order.shippingAddress?.phone ||
            "",
        },

        notes: {
          local_order_id: order._id,
          customer_email:
            userInfo?.email ||
            order.user?.email ||
            "",
        },

        theme: {
          color: "#2563eb",
        },

        modal: {
          confirm_close: true,
          ondismiss: () => {
            toast.info("Payment cancelled");
          },
        },

        handler: async function (response) {
          try {
            await axios.put(`/orders/${orderId}/pay`, {
              id: response.razorpay_payment_id,
              status: "COMPLETED",
              update_time: new Date().toISOString(),
              email_address:
                userInfo?.email ||
                order.user?.email ||
                "",

              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            toast.success("Payment successful");

            fetchOrder();
          } catch (error) {
            toast.error(
              error.response?.data?.message ||
                "Payment verification failed"
            );
          }
        },
      };

      const paymentObject = new window.Razorpay(options);

      paymentObject.open();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Payment failed"
      );
    } finally {
      setLoadingPay(false);
    }
  };

  const cancelOrderHandler = async () => {
    if (!order) return;

    if (!isOrderOwner || isAdmin || isSeller) {
      toast.error(
        "Only the customer who placed this order can cancel it from this page."
      );
      return;
    }

    if (isClosedOrder(order)) {
      toast.error("This order is already closed.");
      return;
    }

    if (order.isPaid) {
      toast.error("Paid orders need admin support for cancellation/refund.");
      return;
    }

    if (!window.confirm("Are you sure you want to cancel this order?")) {
      return;
    }

    try {
      setCancelling(true);

      await axios.put(`/orders/${orderId}/cancel`, {
        reason:
          cancelReason.trim() ||
          "Cancelled by customer",
      });

      toast.success("Order cancelled successfully");

      fetchOrder();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to cancel order"
      );
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="elite-order-loader">
        <Loader />
      </div>
    );
  }

  if (!order) {
    return (
      <Container className="py-4">
        <Message variant="danger">
          Order not found
        </Message>

        <Button
          variant="dark"
          className="rounded-pill fw-bold mt-3"
          onClick={() => navigate(backToOrdersPath)}
        >
          Go Back
        </Button>
      </Container>
    );
  }

  return (
    <main className="elite-order-page">
      <Container>
        <motion.section
          className="elite-order-hero"
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
              className="elite-order-hero-badge"
            >
              <FaReceipt className="me-2" />
              {isAdmin
                ? "Admin Order View"
                : isSeller
                ? "Seller Order View"
                : "Order Details"}
            </Badge>

            <h1>
              {isAdmin
                ? "Admin Order Tracking"
                : isSeller
                ? "Seller Fulfilment View"
                : "Order Tracking"}
            </h1>

            <p>
              {isAdmin
                ? "Review customer order details, payment status, delivery progress and order items."
                : isSeller
                ? "Track seller fulfilment details, customer delivery status and ordered products."
                : "Track your order, payment status, delivery progress, invoice details and product summary."}
            </p>

            <div className="elite-order-id-pill">
              <FaFileInvoice />
              <span>
                Order ID: {order._id}
              </span>
            </div>

            {isStaffView && (
              <Alert
                variant="info"
                className="elite-order-alert mt-3 mb-0"
              >
                <FaUserShield className="me-2" />
                {isAdmin
                  ? "Admin can view this order, but payment can be completed only by the customer."
                  : "Seller can view fulfilment information, but payment can be completed only by the customer."}
              </Alert>
            )}
          </div>

          <div className="elite-order-hero-actions">
            <Button
              variant="light"
              onClick={() => navigate(backToOrdersPath)}
            >
              <FaArrowLeft className="me-2" />
              {backButtonLabel}
            </Button>

            <Button
              variant="outline-light"
              onClick={() => navigate("/products")}
            >
              Continue Shopping
            </Button>
          </div>

          <motion.div
            className="elite-order-floating-badge"
            animate={{
              y: [0, -10, 0],
            }}
            transition={{
              duration: 3.5,
              repeat: Infinity,
            }}
          >
            <FaTruck />
            Trackable Order
          </motion.div>
        </motion.section>

        <Row className="g-4 mb-4">
          <Col md={6} xl={3}>
            <Card className="elite-order-stat-card status">
              <Card.Body>
                <FaRoute />
                <span>Status</span>
                <h3>
                  {order.orderStatus || "Pending"}
                </h3>
              </Card.Body>
            </Card>
          </Col>

          <Col md={6} xl={3}>
            <Card className="elite-order-stat-card payment">
              <Card.Body>
                {order.paymentMethod === "COD" ? (
                  <FaMoneyBillWave />
                ) : (
                  <FaCreditCard />
                )}
                <span>Payment</span>
                <h3>
                  {order.paymentMethod}
                </h3>
              </Card.Body>
            </Card>
          </Col>

          <Col md={6} xl={3}>
            <Card className="elite-order-stat-card total">
              <Card.Body>
                <FaRupeeSign />
                <span>Total</span>
                <h3>
                  ₹{formatPrice(order.totalPrice)}
                </h3>
              </Card.Body>
            </Card>
          </Col>

          <Col md={6} xl={3}>
            <Card className="elite-order-stat-card items">
              <Card.Body>
                <FaShoppingBag />
                <span>Items</span>
                <h3>{totalItems}</h3>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row className="g-4">
          <Col xl={8}>
            <Card className="elite-order-tracking-card mb-4">
              <Card.Body>
                <div className="elite-order-section-heading">
                  <div>
                    <h3>
                      <FaTruck className="me-2" />
                      Delivery Progress
                    </h3>

                    <p>
                      Current order stage and expected delivery details.
                    </p>
                  </div>

                  <Badge
                    bg={getStatusVariant(order.orderStatus)}
                    className="elite-order-status-badge"
                  >
                    {order.orderStatus || "Pending"}
                  </Badge>
                </div>

                <ProgressBar
                  now={statusProgress}
                  className={
                    order.orderStatus === "Cancelled"
                      ? "elite-order-progress cancelled"
                      : "elite-order-progress"
                  }
                />

                <div className="elite-order-progress-labels">
                  <span>Placed</span>
                  <span>Confirmed</span>
                  <span>Packed</span>
                  <span>Shipped</span>
                  <span>Delivered</span>
                </div>

                <Row className="g-3 mt-3">
                  <Col md={4}>
                    <div className="elite-order-mini-info">
                      <FaClock />
                      <span>Placed On</span>
                      <strong>
                        {formatDate(order.createdAt)}
                      </strong>
                    </div>
                  </Col>

                  <Col md={4}>
                    <div className="elite-order-mini-info">
                      <FaTruck />
                      <span>Estimated Delivery</span>
                      <strong>
                        {formatDate(order.estimatedDelivery)}
                      </strong>
                    </div>
                  </Col>

                  <Col md={4}>
                    <div className="elite-order-mini-info">
                      <FaBoxOpen />
                      <span>Delivered</span>
                      <strong>
                        {order.isDelivered
                          ? formatDate(order.deliveredAt)
                          : "Pending"}
                      </strong>
                    </div>
                  </Col>
                </Row>

                {(order.trackingNumber || order.courierService) && (
                  <Alert
                    variant="info"
                    className="elite-order-alert mt-3"
                  >
                    <strong>Tracking:</strong>{" "}
                    {order.trackingNumber || "Not added"}{" "}
                    {order.courierService
                      ? `via ${order.courierService}`
                      : ""}
                  </Alert>
                )}
              </Card.Body>
            </Card>

            <Card className="elite-order-info-card mb-4">
              <Card.Body>
                <div className="elite-order-section-heading">
                  <div>
                    <h3>
                      <FaMapMarkerAlt className="me-2" />
                      Shipping Address
                    </h3>

                    <p>
                      Delivery contact and address information.
                    </p>
                  </div>
                </div>

                <div className="elite-order-address-grid">
                  <div>
                    <FaUser />
                    <span>Name</span>
                    <strong>
                      {order.shippingAddress?.fullName ||
                        order.user?.name ||
                        "Customer"}
                    </strong>
                  </div>

                  <div>
                    <FaPhoneAlt />
                    <span>Phone</span>
                    <strong>
                      {order.shippingAddress?.phone ||
                        "Not added"}
                    </strong>
                  </div>

                  <div>
                    <FaMapMarkerAlt />
                    <span>Type</span>
                    <strong>
                      {order.shippingAddress?.addressType ||
                        "Home"}
                    </strong>
                  </div>
                </div>

                <p className="elite-order-address-text">
                  {[
                    order.shippingAddress?.address,
                    order.shippingAddress?.landmark,
                    order.shippingAddress?.city,
                    order.shippingAddress?.state,
                    order.shippingAddress?.postalCode,
                    order.shippingAddress?.country,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </p>

                {order.user?.email && (
                  <p className="elite-order-email">
                    Email:{" "}
                    <a href={`mailto:${order.user.email}`}>
                      {order.user.email}
                    </a>
                  </p>
                )}
              </Card.Body>
            </Card>

            <Card className="elite-order-payment-card mb-4">
              <Card.Body>
                <div className="elite-order-section-heading">
                  <div>
                    <h3>
                      <FaWallet className="me-2" />
                      Payment Details
                    </h3>

                    <p>
                      Payment method, payment status and transaction
                      information.
                    </p>
                  </div>

                  {order.isPaid ? (
                    <Badge bg="success">
                      <FaCheckCircle className="me-1" />
                      Paid
                    </Badge>
                  ) : (
                    <Badge bg="danger">
                      <FaTimesCircle className="me-1" />
                      Not Paid
                    </Badge>
                  )}
                </div>

                <div
                  className={
                    order.paymentMethod === "COD"
                      ? "elite-order-payment-box cod"
                      : "elite-order-payment-box"
                  }
                >
                  <div className="elite-order-payment-icon">
                    {order.paymentMethod === "COD" ? (
                      <FaMoneyBillWave />
                    ) : (
                      <FaBolt />
                    )}
                  </div>

                  <div>
                    <h4>
                      {order.paymentMethod === "COD"
                        ? "Cash On Delivery"
                        : "Razorpay Secure Payment"}
                    </h4>

                    <p>
                      {order.paymentMethod === "COD"
                        ? "Cash will be collected during delivery."
                        : "UPI, cards, wallets and net banking through Razorpay Checkout."}
                    </p>

                    {order.paymentMethod === "Razorpay" && (
                      <div className="elite-order-payment-tags">
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

                {order.isPaid ? (
                  <Alert
                    variant="success"
                    className="elite-order-alert mt-3"
                  >
                    <FaCheckCircle className="me-2" />
                    Paid on {formatDate(order.paidAt)}.
                    {order.paymentResult?.razorpay_payment_id && (
                      <>
                        {" "}
                        Payment ID:{" "}
                        <strong>
                          {order.paymentResult.razorpay_payment_id}
                        </strong>
                      </>
                    )}
                  </Alert>
                ) : isStaffView &&
                  order.paymentMethod === "Razorpay" &&
                  !isClosedOrder(order) ? (
                  <Alert
                    variant="info"
                    className="elite-order-alert mt-3"
                  >
                    <FaShieldAlt className="me-2" />
                    Payment is pending. Only the customer who placed
                    this order can complete payment.
                  </Alert>
                ) : order.paymentMethod === "Razorpay" &&
                  !isClosedOrder(order) ? (
                  <Alert
                    variant="warning"
                    className="elite-order-alert mt-3"
                  >
                    <FaExclamationTriangle className="me-2" />
                    Payment is pending. You can retry payment from
                    the summary card.
                  </Alert>
                ) : order.paymentMethod === "Razorpay" &&
                  isClosedOrder(order) ? (
                  <Alert
                    variant="secondary"
                    className="elite-order-alert mt-3"
                  >
                    <FaTimesCircle className="me-2" />
                    This order is closed. Payment cannot be retried.
                  </Alert>
                ) : (
                  <Alert
                    variant="info"
                    className="elite-order-alert mt-3"
                  >
                    <FaMoneyBillWave className="me-2" />
                    COD order is confirmed. Payment will be collected
                    on delivery.
                  </Alert>
                )}
              </Card.Body>
            </Card>

            <Card className="elite-order-items-card">
              <Card.Body>
                <div className="elite-order-section-heading">
                  <div>
                    <h3>
                      <FaBoxOpen className="me-2" />
                      Order Items
                    </h3>

                    <p>
                      Products included in this order.
                    </p>
                  </div>
                </div>

                <div className="elite-order-items-list">
                  {order.orderItems?.map((item, index) => (
                    <motion.div
                      key={
                        item.product?._id ||
                        item.product ||
                        index
                      }
                      className="elite-order-item"
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
                        delay: index * 0.04,
                      }}
                    >
                      <Link
                        to={
                          item.product?.slug
                            ? `/product/${item.product.slug}`
                            : "/products"
                        }
                      >
                        <Image
                          src={item.image || "/placeholder.svg"}
                          alt={item.name}
                          loading="lazy"
                        />
                      </Link>

                      <div className="elite-order-item-info">
                        <Link
                          to={
                            item.product?.slug
                              ? `/product/${item.product.slug}`
                              : "/products"
                          }
                          className="elite-order-item-name"
                        >
                          {item.name}
                        </Link>

                        <div className="elite-order-item-meta">
                          <span>
                            <FaStore />
                            {item.product?.brand || "EliteShop"}
                          </span>

                          <span>
                            <FaBoxOpen />
                            Qty: {item.qty}
                          </span>
                        </div>
                      </div>

                      <div className="elite-order-item-price">
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
                  ))}
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col xl={4}>
            <div className="elite-order-summary-stack">
              <Card className="elite-order-summary-card">
                <Card.Header>
                  <FaReceipt className="me-2" />
                  Order Summary
                </Card.Header>

                <ListGroup variant="flush">
                  <ListGroup.Item>
                    <span>Items</span>
                    <strong>
                      ₹{formatPrice(order.itemsPrice)}
                    </strong>
                  </ListGroup.Item>

                  <ListGroup.Item>
                    <span>Shipping</span>
                    <strong>
                      {Number(order.shippingPrice || 0) === 0
                        ? "Free"
                        : `₹${formatPrice(order.shippingPrice)}`}
                    </strong>
                  </ListGroup.Item>

                  <ListGroup.Item>
                    <span>Tax</span>
                    <strong>
                      ₹{formatPrice(order.taxPrice)}
                    </strong>
                  </ListGroup.Item>

                  {Number(order.discountPrice || 0) > 0 && (
                    <ListGroup.Item className="elite-order-saving-line">
                      <span>Discount</span>
                      <strong>
                        -₹{formatPrice(order.discountPrice)}
                      </strong>
                    </ListGroup.Item>
                  )}

                  <ListGroup.Item className="elite-order-total-line">
                    <span>Total</span>
                    <strong>
                      ₹{formatPrice(order.totalPrice)}
                    </strong>
                  </ListGroup.Item>

                  {isAdmin && (
                    <ListGroup.Item>
                      <Alert
                        variant="info"
                        className="elite-order-alert mb-0"
                      >
                        <FaShieldAlt className="me-2" />
                        Admin view only. Payment can be completed only
                        by the customer who placed this order.
                      </Alert>
                    </ListGroup.Item>
                  )}

                  {isSeller && (
                    <ListGroup.Item>
                      <Alert
                        variant="info"
                        className="elite-order-alert mb-0"
                      >
                        <FaStore className="me-2" />
                        Seller view only. Sellers can track fulfilment,
                        but cannot complete customer payment.
                      </Alert>
                    </ListGroup.Item>
                  )}

                  {canPay && (
                    <ListGroup.Item>
                      <Button
                        className="elite-order-pay-btn"
                        onClick={payWithRazorpay}
                        disabled={loadingPay}
                      >
                        {loadingPay ? (
                          <>
                            <Spinner
                              animation="border"
                              size="sm"
                              className="me-2"
                            />
                            Opening Payment...
                          </>
                        ) : (
                          <>
                            <FaLock className="me-2" />
                            Pay Securely
                          </>
                        )}
                      </Button>
                    </ListGroup.Item>
                  )}

                  {!canPay &&
                    !order.isPaid &&
                    order.paymentMethod === "Razorpay" &&
                    isClosedOrder(order) && (
                      <ListGroup.Item>
                        <Alert
                          variant="secondary"
                          className="elite-order-alert mb-0"
                        >
                          This order is closed. Payment is disabled.
                        </Alert>
                      </ListGroup.Item>
                    )}

                  {order.paymentMethod === "COD" && !order.isPaid && (
                    <ListGroup.Item>
                      <Alert
                        variant="info"
                        className="elite-order-alert mb-0"
                      >
                        Cash will be collected on delivery.
                      </Alert>
                    </ListGroup.Item>
                  )}
                </ListGroup>
              </Card>

              {canCancel && (
                <Card className="elite-order-cancel-card">
                  <Card.Body>
                    <h4>
                      <FaUndo className="me-2" />
                      Need To Cancel?
                    </h4>

                    <p>
                      You can cancel before payment or before delivery.
                    </p>

                    <Form.Control
                      as="textarea"
                      rows={3}
                      placeholder="Reason for cancellation"
                      value={cancelReason}
                      onChange={(e) =>
                        setCancelReason(e.target.value)
                      }
                    />

                    <Button
                      variant="outline-danger"
                      className="elite-order-cancel-btn"
                      onClick={cancelOrderHandler}
                      disabled={cancelling}
                    >
                      {cancelling ? (
                        <>
                          <Spinner
                            animation="border"
                            size="sm"
                            className="me-2"
                          />
                          Cancelling...
                        </>
                      ) : (
                        <>
                          <FaTimesCircle className="me-2" />
                          Cancel Order
                        </>
                      )}
                    </Button>
                  </Card.Body>
                </Card>
              )}

              <Card className="elite-order-trust-card">
                <Card.Body>
                  <div>
                    <FaShieldAlt />
                    <span>Buyer Protection</span>
                  </div>

                  <div>
                    <FaLock />
                    <span>Secure Payment Verification</span>
                  </div>

                  <div>
                    <FaTruck />
                    <span>Delivery Tracking</span>
                  </div>

                  <div>
                    <FaHeadset />
                    <span>Order Support</span>
                  </div>

                  <div>
                    <FaGift />
                    <span>Easy Returns Support</span>
                  </div>
                </Card.Body>
              </Card>
            </div>
          </Col>
        </Row>
      </Container>
    </main>
  );
};

export default OrderPage;