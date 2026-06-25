import {
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";

import {
  Row,
  Col,
  Card,
  Button,
  Badge,
  Form,
  Modal,
  Alert,
  Image,
  ListGroup,
  Spinner,
  Dropdown,
  Container,
  ProgressBar,
} from "react-bootstrap";

import {
  FaBoxOpen,
  FaTruck,
  FaSearch,
  FaEye,
  FaTimesCircle,
  FaUndo,
  FaDownload,
  FaRedo,
  FaHeadset,
  FaStar,
  FaCheckCircle,
  FaClock,
  FaRupeeSign,
  FaMapMarkerAlt,
  FaCreditCard,
  FaExclamationTriangle,
  FaShoppingCart,
  FaSyncAlt,
  FaCalendarAlt,
  FaArrowLeft,
  FaFilter,
  FaReceipt,
  FaWallet,
  FaMoneyBillWave,
  FaBolt,
  FaRoute,
  FaCrown,
  FaShieldAlt,
  FaStore,
  FaGift,
  FaClipboardCheck,
  FaHome,
  FaInfoCircle,
  FaBell,
  FaRocket,
  FaShoppingBag,
} from "react-icons/fa";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import { motion } from "framer-motion";
import { toast } from "react-toastify";

import Loader from "../../components/Loader";
import Message from "../../components/Message";

import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";

import api from "../../utils/axios";

import "../../styles/UserOrder.css";

const formatPrice = (value) => {
  return Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const formatDate = (date) => {
  if (!date) return "N/A";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const orderTimeline = [
  "Pending",
  "Confirmed",
  "Processing",
  "Packed",
  "Shipped",
  "Out For Delivery",
  "Delivered",
];

const normalizeStatusText = (status) => {
  if (!status) return "Pending";
  if (status === "Out for Delivery") return "Out For Delivery";
  return status;
};

const getTimelineProgress = (status) => {
  const normalizedStatus = normalizeStatusText(status);

  if (
    [
      "Cancelled",
      "Returned",
      "Refund Processing",
      "Refunded",
      "Failed",
    ].includes(normalizedStatus)
  ) {
    return 100;
  }

  const index = orderTimeline.indexOf(normalizedStatus);

  if (index < 0) return 10;

  return Math.round(((index + 1) / orderTimeline.length) * 100);
};

const OrderPage = () => {
  const navigate = useNavigate();

  const { userInfo } = useAuth();
  const { addToCart } = useCart();

  const [orders, setOrders] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [sortBy, setSortBy] = useState("newest");

  const [selectedOrder, setSelectedOrder] = useState(null);

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [showTrackModal, setShowTrackModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  const [cancelReason, setCancelReason] = useState("");
  const [returnReason, setReturnReason] = useState("");
  const [returnDescription, setReturnDescription] = useState("");

  const [actionLoading, setActionLoading] = useState(false);

  const [returnRequests, setReturnRequests] = useState(() => {
    try {
      const saved = localStorage.getItem("returnRequests");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const fetchOrders = useCallback(
    async (silent = false) => {
      try {
        if (silent) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        const { data } = await api.get("/orders/myorders");

        setOrders(Array.isArray(data) ? data : []);
      } catch (error) {
        setError(
          error.response?.data?.message ||
            error.message ||
            "Failed to load orders"
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    if (!userInfo) {
      navigate("/login?redirect=/orders");
      return;
    }

    fetchOrders();
  }, [
    userInfo,
    navigate,
    fetchOrders,
  ]);

  useEffect(() => {
    localStorage.setItem(
      "returnRequests",
      JSON.stringify(returnRequests)
    );
  }, [returnRequests]);

  const normalizeOrderStatus = (order) => {
    const status = normalizeStatusText(order.orderStatus);

    if (status) return status;
    if (order.isDelivered) return "Delivered";
    if (order.isPaid) return "Processing";

    return "Pending";
  };

  const getPaymentStatus = (order) => {
    if (returnRequests[order._id]?.refundStatus) {
      return returnRequests[order._id].refundStatus;
    }

    if (order.isPaid) return "Paid";
    if (order.paymentMethod === "COD") return "Pending";

    return "Pending";
  };

  const getPaymentBadge = (status) => {
    switch (status) {
      case "Paid":
        return "success";

      case "Failed":
        return "danger";

      case "Refund Initiated":
      case "Refund Processing":
        return "warning";

      case "Refunded":
        return "info";

      default:
        return "secondary";
    }
  };

  const getOrderBadge = (status) => {
    switch (status) {
      case "Pending":
      case "Pending Payment":
        return "secondary";

      case "Confirmed":
        return "primary";

      case "Processing":
        return "info";

      case "Packed":
        return "dark";

      case "Shipped":
      case "Out For Delivery":
        return "warning";

      case "Delivered":
        return "success";

      case "Cancelled":
      case "Failed":
        return "danger";

      case "Returned":
      case "Refund Processing":
      case "Refunded":
        return "info";

      default:
        return "secondary";
    }
  };

  const isActiveOrder = (order) => {
    const status = normalizeOrderStatus(order);

    return ![
      "Delivered",
      "Cancelled",
      "Returned",
      "Refunded",
      "Failed",
    ].includes(status);
  };

  const canCancelOrder = (order) => {
    const status = normalizeOrderStatus(order);

    return ![
      "Packed",
      "Shipped",
      "Out For Delivery",
      "Delivered",
      "Cancelled",
      "Returned",
      "Refund Processing",
      "Refunded",
      "Failed",
    ].includes(status);
  };

  const canReturnOrder = (order) => {
    const status = normalizeOrderStatus(order);

    if (status !== "Delivered" && !order.isDelivered) {
      return false;
    }

    if (returnRequests[order._id]) {
      return false;
    }

    const deliveredDate = order.deliveredAt
      ? new Date(order.deliveredAt)
      : order.updatedAt
      ? new Date(order.updatedAt)
      : null;

    if (!deliveredDate) return true;

    const diffDays =
      (Date.now() - deliveredDate.getTime()) /
      (1000 * 60 * 60 * 24);

    return diffDays <= 7;
  };

  const getExpectedDelivery = (order) => {
    if (order.estimatedDelivery) {
      return formatDate(order.estimatedDelivery);
    }

    const baseDate = order.createdAt
      ? new Date(order.createdAt)
      : new Date();

    baseDate.setDate(baseDate.getDate() + 5);

    return formatDate(baseDate);
  };

  const getAddressSummary = (order) => {
    const address = order.shippingAddress;

    if (!address) return "No shipping address";

    return [
      address.address,
      address.landmark,
      address.city,
      address.state,
      address.postalCode,
      address.country,
    ]
      .filter(Boolean)
      .join(", ");
  };

  const stats = useMemo(() => {
    const totalOrders = orders.length;

    const activeOrders = orders.filter(isActiveOrder).length;

    const deliveredOrders = orders.filter(
      (order) =>
        normalizeOrderStatus(order) === "Delivered" ||
        order.isDelivered
    ).length;

    const cancelledOrders = orders.filter(
      (order) => normalizeOrderStatus(order) === "Cancelled"
    ).length;

    const returnedOrders = orders.filter(
      (order) =>
        normalizeOrderStatus(order) === "Returned" ||
        returnRequests[order._id]
    ).length;

    const totalSpent = orders
      .filter(
        (order) =>
          order.isPaid ||
          order.paymentMethod === "COD"
      )
      .reduce(
        (acc, order) => acc + Number(order.totalPrice || 0),
        0
      );

    const pendingPayment = orders.filter(
      (order) => getPaymentStatus(order) === "Pending"
    ).length;

    const successRate =
      totalOrders > 0
        ? Math.round((deliveredOrders / totalOrders) * 100)
        : 0;

    return {
      totalOrders,
      activeOrders,
      deliveredOrders,
      cancelledOrders,
      returnedOrders,
      totalSpent,
      pendingPayment,
      successRate,
    };
  }, [
    orders,
    returnRequests,
  ]);

  const filteredOrders = useMemo(() => {
    let result = [...orders];

    const keyword = searchTerm.toLowerCase().trim();

    if (keyword) {
      result = result.filter((order) => {
        const status = normalizeOrderStatus(order);
        const paymentStatus = getPaymentStatus(order);

        const productNames =
          order.orderItems
            ?.map((item) => item.name)
            .join(" ")
            .toLowerCase() || "";

        return (
          order._id?.toLowerCase().includes(keyword) ||
          productNames.includes(keyword) ||
          status.toLowerCase().includes(keyword) ||
          paymentStatus.toLowerCase().includes(keyword) ||
          order.paymentMethod?.toLowerCase().includes(keyword)
        );
      });
    }

    if (activeFilter === "Active") {
      result = result.filter(isActiveOrder);
    }

    if (activeFilter === "Delivered") {
      result = result.filter(
        (order) =>
          normalizeOrderStatus(order) === "Delivered" ||
          order.isDelivered
      );
    }

    if (activeFilter === "Cancelled") {
      result = result.filter(
        (order) => normalizeOrderStatus(order) === "Cancelled"
      );
    }

    if (activeFilter === "Returned") {
      result = result.filter(
        (order) =>
          normalizeOrderStatus(order) === "Returned" ||
          returnRequests[order._id]
      );
    }

    if (activeFilter === "Refunds") {
      result = result.filter((order) =>
        [
          "Refund Initiated",
          "Refund Processing",
          "Refunded",
        ].includes(getPaymentStatus(order))
      );
    }

    if (activeFilter === "Payment Pending") {
      result = result.filter(
        (order) => getPaymentStatus(order) === "Pending"
      );
    }

    result.sort((a, b) => {
      if (sortBy === "oldest") {
        return new Date(a.createdAt) - new Date(b.createdAt);
      }

      if (sortBy === "highest") {
        return Number(b.totalPrice || 0) - Number(a.totalPrice || 0);
      }

      if (sortBy === "lowest") {
        return Number(a.totalPrice || 0) - Number(b.totalPrice || 0);
      }

      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    return result;
  }, [
    orders,
    searchTerm,
    activeFilter,
    sortBy,
    returnRequests,
  ]);

  const resetFilters = () => {
    setSearchTerm("");
    setActiveFilter("All");
    setSortBy("newest");
  };

  const openCancelModal = (order) => {
    setSelectedOrder(order);
    setCancelReason("");
    setShowCancelModal(true);
  };

  const cancelOrderHandler = async () => {
    if (!selectedOrder) return;

    if (!cancelReason.trim()) {
      toast.error("Please select cancellation reason");
      return;
    }

    try {
      setActionLoading(true);

      await api.put(`/orders/${selectedOrder._id}/cancel`, {
        reason: cancelReason,
      });

      setOrders((prev) =>
        prev.map((order) =>
          order._id === selectedOrder._id
            ? {
                ...order,
                orderStatus: "Cancelled",
                cancelReason,
              }
            : order
        )
      );

      toast.success("Order cancelled successfully");

      setShowCancelModal(false);
      setSelectedOrder(null);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to cancel order"
      );
    } finally {
      setActionLoading(false);
    }
  };

  const openReturnModal = (order) => {
    setSelectedOrder(order);
    setReturnReason("");
    setReturnDescription("");
    setShowReturnModal(true);
  };

  const returnOrderHandler = () => {
    if (!selectedOrder) return;

    if (!returnReason.trim()) {
      toast.error("Please select return reason");
      return;
    }

    const request = {
      orderId: selectedOrder._id,
      reason: returnReason,
      description: returnDescription,
      status: "Return requested",
      refundStatus: selectedOrder.isPaid
        ? "Refund Initiated"
        : "Pending",
      requestedAt: new Date().toISOString(),
    };

    setReturnRequests((prev) => ({
      ...prev,
      [selectedOrder._id]: request,
    }));

    setOrders((prev) =>
      prev.map((order) =>
        order._id === selectedOrder._id
          ? {
              ...order,
              orderStatus: "Returned",
            }
          : order
      )
    );

    toast.success("Return request submitted");

    setShowReturnModal(false);
    setSelectedOrder(null);
  };

  const reorderHandler = (order) => {
    const availableItems =
      order.orderItems?.filter((item) => item.product) || [];

    if (availableItems.length === 0) {
      toast.error("No available products to reorder");
      return;
    }

    availableItems.forEach((item) => {
      addToCart(
        {
          _id: item.product?._id || item.product,
          name: item.name,
          slug: item.product?.slug || item.product,
          image: item.image,
          price: item.price,
          countInStock: 10,
          brand: item.product?.brand || "",
          category: item.product?.category || "",
        },
        item.qty
      );
    });

    const skipped =
      (order.orderItems?.length || 0) - availableItems.length;

    if (skipped > 0) {
      toast.warning(`${skipped} unavailable item(s) skipped`);
    }

    toast.success("Available products added to cart");

    navigate("/cart");
  };

  const downloadInvoiceHandler = (order) => {
    const invoice = `
EliteShop Invoice

Order ID: ${order._id}
Order Date: ${formatDate(order.createdAt)}

Payment Method: ${order.paymentMethod}
Payment Status: ${getPaymentStatus(order)}
Order Status: ${normalizeOrderStatus(order)}

Items:
${order.orderItems
  ?.map(
    (item) =>
      `- ${item.name} x ${item.qty} = ₹${formatPrice(
        Number(item.price || 0) * Number(item.qty || 0)
      )}`
  )
  .join("\n")}

Items Price: ₹${formatPrice(order.itemsPrice)}
Shipping: ₹${formatPrice(order.shippingPrice)}
Tax: ₹${formatPrice(order.taxPrice)}
Total: ₹${formatPrice(order.totalPrice)}

Shipping Address:
${getAddressSummary(order)}
`;

    const blob = new Blob([invoice], {
      type: "text/plain",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `invoice-${order._id}.txt`;
    link.click();

    URL.revokeObjectURL(url);

    toast.success("Invoice downloaded");
  };

  const openInvoiceModal = (order) => {
    setSelectedOrder(order);
    setShowInvoiceModal(true);
  };

  const openTrackModal = (order) => {
    setSelectedOrder(order);
    setShowTrackModal(true);
  };

  const reviewHandler = (item) => {
    toast.info("Open the product page and submit your review.");

    navigate(
      item.product?.slug
        ? `/product/${item.product.slug}`
        : `/products?keyword=${encodeURIComponent(item.name)}`
    );
  };

  const Timeline = ({ order }) => {
    const status = normalizeOrderStatus(order);

    if (
      [
        "Cancelled",
        "Returned",
        "Refund Processing",
        "Refunded",
        "Failed",
      ].includes(status)
    ) {
      return (
        <Alert
          variant={
            status === "Cancelled" || status === "Failed"
              ? "danger"
              : "info"
          }
          className="elite-user-order-alert mb-0"
        >
          Current status: <strong>{status}</strong>
        </Alert>
      );
    }

    const activeIndex = orderTimeline.indexOf(status);

    return (
      <div className="elite-user-order-timeline">
        {orderTimeline.map((step, index) => {
          const done = index <= activeIndex;

          return (
            <div
              key={step}
              className={
                done
                  ? "elite-user-order-step active"
                  : "elite-user-order-step"
              }
            >
              <span>
                {done ? <FaCheckCircle /> : index + 1}
              </span>

              <small>{step}</small>
            </div>
          );
        })}
      </div>
    );
  };

  const ProductPreview = ({ order }) => {
    const items = order.orderItems || [];

    return (
      <div className="elite-user-order-preview">
        <div className="elite-user-order-preview-images">
          {items.slice(0, 4).map((item, index) => (
            <Image
              key={`${item.name}-${index}`}
              src={item.image || "/placeholder.svg"}
              rounded
              loading="lazy"
            />
          ))}

          {items.length > 4 && (
            <div className="elite-user-order-more">
              +{items.length - 4}
            </div>
          )}
        </div>

        <div>
          <strong>
            {items
              .slice(0, 2)
              .map((item) => item.name)
              .join(", ")}

            {items.length > 2 && ` + ${items.length - 2} more`}
          </strong>

          <span>
            {items.reduce(
              (acc, item) => acc + Number(item.qty || 0),
              0
            )}{" "}
            item(s)
          </span>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <main className="elite-user-order-page">
        <Container>
          <Card className="elite-user-order-loading-card">
            <Card.Body>
              <Spinner animation="border" />

              <div>
                <h4>Loading your orders...</h4>

                <p>
                  Fetching purchases, payment status, delivery progress and
                  return options.
                </p>
              </div>
            </Card.Body>
          </Card>

          <Loader />
        </Container>
      </main>
    );
  }

  if (error) {
    return (
      <main className="elite-user-order-page">
        <Container>
          <Card className="elite-user-order-error-card">
            <Card.Body>
              <Message variant="danger">
                {error}
              </Message>

              <Button
                variant="dark"
                className="rounded-pill fw-bold"
                onClick={() => fetchOrders()}
              >
                <FaSyncAlt className="me-2" />
                Retry
              </Button>
            </Card.Body>
          </Card>
        </Container>
      </main>
    );
  }

  return (
    <main className="elite-user-order-page">
      <Container>
        <motion.section
          className="elite-user-order-hero"
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
              className="elite-user-order-hero-badge"
            >
              <FaCrown className="me-2" />
              EliteShop Account
            </Badge>

            <h1>
              <FaShoppingBag className="me-2" />
              My Orders
            </h1>

            <p>
              Track orders, cancel eligible purchases, request returns,
              download invoices, reorder products and get professional
              delivery updates from one dashboard.
            </p>
          </div>

          <div className="elite-user-order-hero-actions">
            <Button
              variant="light"
              onClick={() => navigate("/profile")}
            >
              <FaArrowLeft className="me-2" />
              Profile
            </Button>

            <Button
              variant="outline-light"
              onClick={() => navigate("/products")}
            >
              <FaShoppingCart className="me-2" />
              Continue Shopping
            </Button>

            <Button
              variant="warning"
              disabled={refreshing}
              onClick={() => fetchOrders(true)}
            >
              <FaSyncAlt className={refreshing ? "me-2 elite-spin" : "me-2"} />
              {refreshing ? "Refreshing" : "Refresh"}
            </Button>
          </div>

          <motion.div
            className="elite-user-order-floating-badge"
            animate={{
              y: [0, -10, 0],
            }}
            transition={{
              duration: 3.5,
              repeat: Infinity,
            }}
          >
            <FaTruck />
            Live Tracking
          </motion.div>
        </motion.section>

        <Row className="g-4 mb-4">
          <OrderStat
            type="total"
            title="Total Orders"
            value={stats.totalOrders}
            text="All purchases"
            icon={<FaBoxOpen />}
          />

          <OrderStat
            type="active"
            title="Active Orders"
            value={stats.activeOrders}
            text="In progress"
            icon={<FaClock />}
          />

          <OrderStat
            type="delivered"
            title="Delivered"
            value={stats.deliveredOrders}
            text={`${stats.successRate}% success rate`}
            icon={<FaTruck />}
          />

          <OrderStat
            type="spent"
            title="Total Spent"
            value={`₹${formatPrice(stats.totalSpent)}`}
            text={`${stats.pendingPayment} payment pending`}
            icon={<FaRupeeSign />}
          />
        </Row>

        <Row className="g-4 mb-4">
          <Col lg={8}>
            <Card className="elite-user-order-filter-card">
              <Card.Body>
                <Row className="g-3 align-items-center">
                  <Col lg={5}>
                    <div className="elite-user-order-search">
                      <FaSearch />

                      <input
                        placeholder="Search order ID, product, payment or status..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </Col>

                  <Col md={6} lg={3}>
                    <Form.Select
                      value={activeFilter}
                      onChange={(e) => setActiveFilter(e.target.value)}
                    >
                      <option value="All">All Orders</option>
                      <option value="Active">Active Orders</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                      <option value="Returned">Returned</option>
                      <option value="Refunds">Refunds</option>
                      <option value="Payment Pending">Payment Pending</option>
                    </Form.Select>
                  </Col>

                  <Col md={6} lg={2}>
                    <Form.Select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                    >
                      <option value="newest">Newest</option>
                      <option value="oldest">Oldest</option>
                      <option value="highest">Highest</option>
                      <option value="lowest">Lowest</option>
                    </Form.Select>
                  </Col>

                  <Col lg={2}>
                    <Button
                      className="elite-user-order-reset-btn"
                      onClick={resetFilters}
                    >
                      <FaFilter className="me-2" />
                      Reset
                    </Button>
                  </Col>
                </Row>

                <div className="elite-user-order-filter-footer">
                  <span>
                    Showing <strong>{filteredOrders.length}</strong> of{" "}
                    <strong>{orders.length}</strong> order(s)
                  </span>

                  <div>
                    <Badge bg="primary">{activeFilter}</Badge>

                    {stats.cancelledOrders > 0 && (
                      <Badge bg="danger">
                        {stats.cancelledOrders} cancelled
                      </Badge>
                    )}

                    {stats.returnedOrders > 0 && (
                      <Badge bg="info">
                        {stats.returnedOrders} return request(s)
                      </Badge>
                    )}
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={4}>
            <Card className="elite-user-order-help-card">
              <Card.Body>
                <FaShieldAlt />

                <div>
                  <h5>Buyer Protection</h5>

                  <p>
                    Track delivery, cancel eligible orders, download invoice,
                    reorder and request return within the valid return window.
                  </p>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {orders.length === 0 ? (
          <Card className="elite-user-order-empty-card">
            <Card.Body>
              <motion.div
                className="elite-user-order-empty-icon"
                animate={{
                  scale: [1, 1.08, 1],
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                }}
              >
                <FaBoxOpen />
              </motion.div>

              <h3>You have not placed any orders yet</h3>

              <p>
                Start shopping and your orders will appear here with delivery
                tracking, invoice support and return options.
              </p>

              <Button
                variant="dark"
                className="rounded-pill fw-bold"
                onClick={() => navigate("/products")}
              >
                <FaStore className="me-2" />
                Continue Shopping
              </Button>
            </Card.Body>
          </Card>
        ) : filteredOrders.length === 0 ? (
          <Card className="elite-user-order-empty-card">
            <Card.Body>
              <FaFilter className="elite-user-order-no-result-icon" />

              <h3>No orders match your filters</h3>

              <p>
                Try changing search text, status filter or sorting option.
              </p>

              <Button
                variant="dark"
                className="rounded-pill fw-bold"
                onClick={resetFilters}
              >
                Reset Filters
              </Button>
            </Card.Body>
          </Card>
        ) : (
          <Row className="g-4">
            {filteredOrders.map((order, index) => {
              const status = normalizeOrderStatus(order);
              const paymentStatus = getPaymentStatus(order);
              const returnRequest = returnRequests[order._id];
              const progress = getTimelineProgress(status);

              return (
                <Col xs={12} key={order._id}>
                  <motion.div
                    initial={{
                      opacity: 0,
                      y: 22,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    transition={{
                      duration: 0.25,
                      delay: index * 0.035,
                    }}
                    whileHover={{
                      y: -4,
                    }}
                  >
                    <Card className="elite-user-order-card">
                      <Card.Header>
                        <Row className="align-items-center g-3">
                          <Col lg={5}>
                            <div className="elite-user-order-id">
                              <FaReceipt />

                              <div>
                                <h5>
                                  Order #{order._id.substring(0, 12)}...
                                </h5>

                                <small>
                                  <FaCalendarAlt className="me-1" />
                                  {formatDate(order.createdAt)}
                                </small>
                              </div>
                            </div>
                          </Col>

                          <Col lg={7}>
                            <div className="elite-user-order-badges">
                              <Badge bg={getOrderBadge(status)}>
                                {status}
                              </Badge>

                              <Badge bg={getPaymentBadge(paymentStatus)}>
                                {paymentStatus}
                              </Badge>

                              <Badge
                                bg={order.isDelivered ? "success" : "secondary"}
                              >
                                {order.isDelivered ? "Delivered" : "Not Delivered"}
                              </Badge>
                            </div>
                          </Col>
                        </Row>
                      </Card.Header>

                      <Card.Body>
                        <Row className="g-4">
                          <Col lg={5}>
                            <ProductPreview order={order} />
                          </Col>

                          <Col lg={3}>
                            <ListGroup
                              variant="flush"
                              className="elite-user-order-mini-list"
                            >
                              <ListGroup.Item>
                                <FaRupeeSign />
                                <span>Total</span>
                                <strong>₹{formatPrice(order.totalPrice)}</strong>
                              </ListGroup.Item>

                              <ListGroup.Item>
                                {order.paymentMethod === "COD" ? (
                                  <FaMoneyBillWave />
                                ) : (
                                  <FaCreditCard />
                                )}

                                <span>Method</span>
                                <strong>{order.paymentMethod}</strong>
                              </ListGroup.Item>

                              <ListGroup.Item>
                                <FaTruck />
                                <span>Expected</span>
                                <strong>{getExpectedDelivery(order)}</strong>
                              </ListGroup.Item>
                            </ListGroup>
                          </Col>

                          <Col lg={4}>
                            <div className="elite-user-order-address">
                              <FaMapMarkerAlt />

                              <div>
                                <strong>Shipping Address</strong>

                                <p>{getAddressSummary(order)}</p>
                              </div>
                            </div>

                            {returnRequest && (
                              <Alert
                                variant="info"
                                className="elite-user-order-alert mt-3"
                              >
                                <strong>Return Status:</strong>{" "}
                                {returnRequest.status}
                                <br />
                                <strong>Refund:</strong>{" "}
                                {returnRequest.refundStatus}
                              </Alert>
                            )}
                          </Col>
                        </Row>

                        <div className="elite-user-order-progress-box">
                          <div className="elite-user-order-progress-top">
                            <span>
                              <FaRoute />
                              Delivery Progress
                            </span>

                            <strong>{progress}%</strong>
                          </div>

                          <ProgressBar
                            now={progress}
                            className={
                              status === "Cancelled"
                                ? "elite-user-order-progress cancelled"
                                : "elite-user-order-progress"
                            }
                          />

                          <Timeline order={order} />
                        </div>

                        <div className="elite-user-order-actions">
                          <Button
                            as={Link}
                            to={`/orders/${order._id}`}
                            variant="dark"
                            size="sm"
                          >
                            <FaEye className="me-1" />
                            View
                          </Button>

                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => openTrackModal(order)}
                          >
                            <FaTruck className="me-1" />
                            Track
                          </Button>

                          {canCancelOrder(order) && (
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => openCancelModal(order)}
                            >
                              <FaTimesCircle className="me-1" />
                              Cancel
                            </Button>
                          )}

                          {canReturnOrder(order) && (
                            <Button
                              variant="outline-warning"
                              size="sm"
                              onClick={() => openReturnModal(order)}
                            >
                              <FaUndo className="me-1" />
                              Return
                            </Button>
                          )}

                          {(order.isPaid || order.paymentMethod === "COD") && (
                            <>
                              <Button
                                variant="outline-success"
                                size="sm"
                                onClick={() => downloadInvoiceHandler(order)}
                              >
                                <FaDownload className="me-1" />
                                Invoice
                              </Button>

                              <Button
                                variant="outline-info"
                                size="sm"
                                onClick={() => openInvoiceModal(order)}
                              >
                                <FaReceipt className="me-1" />
                                Preview
                              </Button>
                            </>
                          )}

                          <Button
                            variant="outline-dark"
                            size="sm"
                            onClick={() => reorderHandler(order)}
                          >
                            <FaRedo className="me-1" />
                            Reorder
                          </Button>

                          <Button
                            as={Link}
                            to="/support"
                            variant="outline-secondary"
                            size="sm"
                          >
                            <FaHeadset className="me-1" />
                            Support
                          </Button>

                          {(order.isDelivered || status === "Delivered") && (
                            <Dropdown>
                              <Dropdown.Toggle
                                size="sm"
                                variant="outline-primary"
                              >
                                <FaStar className="me-1" />
                                Review
                              </Dropdown.Toggle>

                              <Dropdown.Menu>
                                {order.orderItems?.map((item, idx) => (
                                  <Dropdown.Item
                                    key={`${item.name}-${idx}`}
                                    onClick={() => reviewHandler(item)}
                                  >
                                    {item.name}
                                  </Dropdown.Item>
                                ))}
                              </Dropdown.Menu>
                            </Dropdown>
                          )}
                        </div>
                      </Card.Body>
                    </Card>
                  </motion.div>
                </Col>
              );
            })}
          </Row>
        )}

        <Modal
          show={showCancelModal}
          onHide={() => setShowCancelModal(false)}
          centered
          className="elite-user-order-modal"
        >
          <Modal.Header closeButton>
            <Modal.Title className="text-danger">
              <FaTimesCircle className="me-2" />
              Cancel Order
            </Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <Alert
              variant="warning"
              className="elite-user-order-alert"
            >
              <FaExclamationTriangle className="me-2" />
              Are you sure you want to cancel this order?
            </Alert>

            <Form.Group className="mb-3">
              <Form.Label>Cancellation Reason</Form.Label>

              <Form.Select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
              >
                <option value="">Select reason</option>
                <option value="Ordered by mistake">Ordered by mistake</option>
                <option value="Found better price">Found better price</option>
                <option value="Delivery taking too long">
                  Delivery taking too long
                </option>
                <option value="Changed my mind">Changed my mind</option>
                <option value="Other">Other</option>
              </Form.Select>
            </Form.Group>
          </Modal.Body>

          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => setShowCancelModal(false)}
            >
              Close
            </Button>

            <Button
              variant="danger"
              disabled={actionLoading}
              onClick={cancelOrderHandler}
            >
              {actionLoading ? (
                <>
                  <Spinner
                    animation="border"
                    size="sm"
                    className="me-2"
                  />
                  Cancelling...
                </>
              ) : (
                "Cancel Order"
              )}
            </Button>
          </Modal.Footer>
        </Modal>

        <Modal
          show={showReturnModal}
          onHide={() => setShowReturnModal(false)}
          centered
          className="elite-user-order-modal"
        >
          <Modal.Header closeButton>
            <Modal.Title>
              <FaUndo className="me-2" />
              Request Return
            </Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Return Reason</Form.Label>

              <Form.Select
                value={returnReason}
                onChange={(e) => setReturnReason(e.target.value)}
              >
                <option value="">Select reason</option>
                <option value="Damaged product">Damaged product</option>
                <option value="Wrong product received">
                  Wrong product received
                </option>
                <option value="Quality issue">Quality issue</option>
                <option value="Size or fit issue">Size or fit issue</option>
                <option value="Other">Other</option>
              </Form.Select>
            </Form.Group>

            <Form.Group>
              <Form.Label>Description</Form.Label>

              <Form.Control
                as="textarea"
                rows={4}
                value={returnDescription}
                onChange={(e) => setReturnDescription(e.target.value)}
                placeholder="Explain your return request..."
              />
            </Form.Group>
          </Modal.Body>

          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => setShowReturnModal(false)}
            >
              Close
            </Button>

            <Button
              variant="warning"
              onClick={returnOrderHandler}
            >
              Submit Return
            </Button>
          </Modal.Footer>
        </Modal>

        <Modal
          show={showTrackModal}
          onHide={() => setShowTrackModal(false)}
          centered
          size="lg"
          className="elite-user-order-modal"
        >
          <Modal.Header closeButton>
            <Modal.Title>
              <FaTruck className="me-2" />
              Track Order
            </Modal.Title>
          </Modal.Header>

          <Modal.Body>
            {selectedOrder && (
              <>
                <div className="elite-track-modal-top">
                  <div>
                    <h5>Order #{selectedOrder._id}</h5>

                    <p>
                      Current Status:{" "}
                      <strong>{normalizeOrderStatus(selectedOrder)}</strong>
                    </p>
                  </div>

                  <Badge bg={getOrderBadge(normalizeOrderStatus(selectedOrder))}>
                    {normalizeOrderStatus(selectedOrder)}
                  </Badge>
                </div>

                <Timeline order={selectedOrder} />

                <Alert
                  variant="light"
                  className="elite-user-order-alert border mt-3"
                >
                  <strong>Expected Delivery:</strong>{" "}
                  {getExpectedDelivery(selectedOrder)}
                  <br />
                  <strong>Shipping Address:</strong>{" "}
                  {getAddressSummary(selectedOrder)}
                </Alert>
              </>
            )}
          </Modal.Body>

          <Modal.Footer>
            <Button
              variant="dark"
              onClick={() => setShowTrackModal(false)}
            >
              Close
            </Button>
          </Modal.Footer>
        </Modal>

        <Modal
          show={showInvoiceModal}
          onHide={() => setShowInvoiceModal(false)}
          centered
          size="lg"
          className="elite-user-order-modal"
        >
          <Modal.Header closeButton>
            <Modal.Title>
              <FaReceipt className="me-2" />
              Invoice Preview
            </Modal.Title>
          </Modal.Header>

          <Modal.Body>
            {selectedOrder && (
              <div className="elite-invoice-preview">
                <div className="elite-invoice-head">
                  <div>
                    <h4>EliteShop Invoice</h4>

                    <p>Order #{selectedOrder._id}</p>
                  </div>

                  <Badge bg={getPaymentBadge(getPaymentStatus(selectedOrder))}>
                    {getPaymentStatus(selectedOrder)}
                  </Badge>
                </div>

                <ListGroup variant="flush">
                  {selectedOrder.orderItems?.map((item, index) => (
                    <ListGroup.Item key={`${item.name}-${index}`}>
                      <span>
                        {item.name} × {item.qty}
                      </span>

                      <strong>
                        ₹{formatPrice(Number(item.price || 0) * Number(item.qty || 0))}
                      </strong>
                    </ListGroup.Item>
                  ))}

                  <ListGroup.Item>
                    <span>Items Price</span>
                    <strong>₹{formatPrice(selectedOrder.itemsPrice)}</strong>
                  </ListGroup.Item>

                  <ListGroup.Item>
                    <span>Shipping</span>
                    <strong>₹{formatPrice(selectedOrder.shippingPrice)}</strong>
                  </ListGroup.Item>

                  <ListGroup.Item>
                    <span>Tax</span>
                    <strong>₹{formatPrice(selectedOrder.taxPrice)}</strong>
                  </ListGroup.Item>

                  <ListGroup.Item className="elite-invoice-total">
                    <span>Total</span>
                    <strong>₹{formatPrice(selectedOrder.totalPrice)}</strong>
                  </ListGroup.Item>
                </ListGroup>
              </div>
            )}
          </Modal.Body>

          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => setShowInvoiceModal(false)}
            >
              Close
            </Button>

            {selectedOrder && (
              <Button
                variant="dark"
                onClick={() => downloadInvoiceHandler(selectedOrder)}
              >
                <FaDownload className="me-2" />
                Download
              </Button>
            )}
          </Modal.Footer>
        </Modal>
      </Container>
    </main>
  );
};

const OrderStat = ({
  type,
  title,
  value,
  text,
  icon,
}) => (
  <Col md={6} xl={3}>
    <motion.div whileHover={{ y: -6 }}>
      <Card className={`elite-user-order-stat-card ${type}`}>
        <Card.Body>
          <div>
            <span>{title}</span>

            <h3>{value}</h3>

            <p>{text}</p>
          </div>

          {icon}
        </Card.Body>
      </Card>
    </motion.div>
  </Col>
);

export default OrderPage;