"use client";

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
  Dropdown,
  Modal,
  Alert,
  ListGroup,
  Spinner,
  ProgressBar,
} from "react-bootstrap";

import {
  FaBell,
  FaBoxOpen,
  FaCreditCard,
  FaTruck,
  FaHeart,
  FaTags,
  FaShoppingCart,
  FaStar,
  FaUndo,
  FaShieldAlt,
  FaSearch,
  FaTrash,
  FaCheckCircle,
  FaEye,
  FaSyncAlt,
  FaClock,
  FaExclamationTriangle,
  FaGift,
  FaWallet,
  FaTimesCircle,
  FaStore,
  FaBolt,
  FaFilter,
  FaMagic,
  FaEnvelopeOpenText,
  FaArchive,
  FaLock,
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

import "../../styles/UserNotification.css";

const notificationCategories = [
  "All",
  "Order",
  "Payment",
  "Delivery",
  "Wishlist",
  "Offer",
  "Cart",
  "Review",
  "Return",
  "Security",
  "Wallet",
];

const getTimeAgo = (dateValue) => {
  const date = new Date(dateValue);
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (Number.isNaN(seconds)) return "Recently";
  if (seconds < 60) return "Just now";

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;

  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days > 1 ? "s" : ""} ago`;

  return date.toLocaleDateString("en-IN");
};

const getTypeIcon = (type) => {
  switch (type) {
    case "Order":
      return <FaBoxOpen />;

    case "Payment":
      return <FaCreditCard />;

    case "Delivery":
      return <FaTruck />;

    case "Wishlist":
      return <FaHeart />;

    case "Offer":
      return <FaTags />;

    case "Cart":
      return <FaShoppingCart />;

    case "Review":
      return <FaStar />;

    case "Return":
      return <FaUndo />;

    case "Security":
      return <FaShieldAlt />;

    case "Wallet":
      return <FaWallet />;

    default:
      return <FaBell />;
  }
};

const getTypeClass = (type) => {
  switch (type) {
    case "Order":
      return "order";

    case "Payment":
      return "payment";

    case "Delivery":
      return "delivery";

    case "Wishlist":
      return "wishlist";

    case "Offer":
      return "offer";

    case "Cart":
      return "cart";

    case "Review":
      return "review";

    case "Return":
      return "return";

    case "Security":
      return "security";

    case "Wallet":
      return "wallet";

    default:
      return "system";
  }
};

const getTypeVariant = (type) => {
  switch (type) {
    case "Order":
      return "primary";

    case "Payment":
      return "success";

    case "Delivery":
      return "info";

    case "Wishlist":
      return "danger";

    case "Offer":
      return "warning";

    case "Cart":
      return "dark";

    case "Review":
      return "secondary";

    case "Return":
      return "dark";

    case "Security":
      return "danger";

    case "Wallet":
      return "success";

    default:
      return "secondary";
  }
};

const getPriorityVariant = (priority) => {
  switch (priority) {
    case "high":
      return "danger";

    case "medium":
      return "warning";

    default:
      return "secondary";
  }
};

const createNotification = ({
  id,
  title,
  message,
  type,
  read = false,
  link = "",
  priority = "normal",
  createdAt = new Date().toISOString(),
  source = "system",
}) => ({
  id: id || `${type}-${Date.now()}-${Math.random()}`,
  title,
  message,
  type,
  read,
  link,
  priority,
  createdAt,
  source,
});

const NotificationsPage = () => {
  const navigate = useNavigate();

  const { userInfo } = useAuth();

  const {
    cartItems,
    wishlistItems,
  } = useCart();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");
  const [notifications, setNotifications] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [readFilter, setReadFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [sortBy, setSortBy] = useState("newest");

  const [selectedNotification, setSelectedNotification] = useState(null);
  const [showClearModal, setShowClearModal] = useState(false);

  const storageKey = userInfo?._id
    ? `notifications_${userInfo._id}`
    : "guest_notifications";

  const getSavedNotifications = useCallback(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  }, [storageKey]);

  const saveNotifications = useCallback(
    (items) => {
      localStorage.setItem(storageKey, JSON.stringify(items));
    },
    [storageKey]
  );

  const generateNotifications = useCallback(
    (orderList = []) => {
      const saved = getSavedNotifications();
      const generated = [];

      orderList.forEach((order) => {
        generated.push(
          createNotification({
            id: `order-placed-${order._id}`,
            title: "Order placed successfully",
            message: `Your order ${order._id?.substring(
              0,
              10
            )} has been placed. Total amount: ₹${order.totalPrice}.`,
            type: "Order",
            read: false,
            link: `/orders/${order._id}`,
            priority: "normal",
            createdAt: order.createdAt || new Date().toISOString(),
            source: "order",
          })
        );

        if (order.orderStatus) {
          generated.push(
            createNotification({
              id: `order-status-${order._id}-${order.orderStatus}`,
              title: `Order ${order.orderStatus}`,
              message: `Your order status is now ${order.orderStatus}.`,
              type: "Order",
              read: false,
              link: `/orders/${order._id}`,
              priority:
                order.orderStatus === "Cancelled" ||
                order.orderStatus === "Returned"
                  ? "high"
                  : "normal",
              createdAt:
                order.updatedAt ||
                order.createdAt ||
                new Date().toISOString(),
              source: "order",
            })
          );
        }

        if (order.isPaid) {
          generated.push(
            createNotification({
              id: `payment-success-${order._id}`,
              title: "Payment successful",
              message: `Payment for order ${order._id?.substring(
                0,
                10
              )} was successful.`,
              type: "Payment",
              read: false,
              link: `/orders/${order._id}`,
              priority: "normal",
              createdAt:
                order.paidAt ||
                order.updatedAt ||
                order.createdAt ||
                new Date().toISOString(),
              source: "payment",
            })
          );
        } else if (order.paymentMethod === "Razorpay") {
          generated.push(
            createNotification({
              id: `payment-pending-${order._id}`,
              title: "Payment pending",
              message: `Payment is still pending for order ${order._id?.substring(
                0,
                10
              )}. Complete payment to confirm your order.`,
              type: "Payment",
              read: false,
              link: `/orders/${order._id}`,
              priority: "high",
              createdAt: order.createdAt || new Date().toISOString(),
              source: "payment",
            })
          );
        }

        if (order.isDelivered) {
          generated.push(
            createNotification({
              id: `delivered-${order._id}`,
              title: "Delivered successfully",
              message: `Your order ${order._id?.substring(
                0,
                10
              )} was delivered successfully.`,
              type: "Delivery",
              read: false,
              link: `/orders/${order._id}`,
              priority: "normal",
              createdAt:
                order.deliveredAt ||
                order.updatedAt ||
                order.createdAt ||
                new Date().toISOString(),
              source: "delivery",
            })
          );

          generated.push(
            createNotification({
              id: `review-${order._id}`,
              title: "Review your purchased product",
              message:
                "Your product has been delivered. Share your rating and review to help other customers.",
              type: "Review",
              read: false,
              link: `/orders/${order._id}`,
              priority: "normal",
              createdAt:
                order.deliveredAt ||
                order.updatedAt ||
                order.createdAt ||
                new Date().toISOString(),
              source: "review",
            })
          );
        } else if (
          order.orderStatus === "Shipped" ||
          order.orderStatus === "Out For Delivery"
        ) {
          generated.push(
            createNotification({
              id: `delivery-shipped-${order._id}`,
              title:
                order.orderStatus === "Out For Delivery"
                  ? "Order out for delivery"
                  : "Order shipped",
              message: `Your package for order ${order._id?.substring(
                0,
                10
              )} is moving through delivery.`,
              type: "Delivery",
              read: false,
              link: `/orders/${order._id}`,
              priority: "medium",
              createdAt:
                order.updatedAt ||
                order.createdAt ||
                new Date().toISOString(),
              source: "delivery",
            })
          );
        }
      });

      wishlistItems.forEach((item) => {
        const originalPrice = Number(item.originalPrice || item.price);
        const currentPrice = Number(item.price);

        if (originalPrice > currentPrice) {
          generated.push(
            createNotification({
              id: `wishlist-price-${item._id}`,
              title: "Wishlist product price dropped",
              message: `${item.name} price dropped from ₹${originalPrice} to ₹${currentPrice}. You saved ₹${
                originalPrice - currentPrice
              }.`,
              type: "Wishlist",
              read: false,
              link: `/product/${item.slug || item._id}`,
              priority: "high",
              createdAt: new Date().toISOString(),
              source: "wishlist",
            })
          );
        }

        if (item.countInStock === 0) {
          generated.push(
            createNotification({
              id: `wishlist-stock-${item._id}`,
              title: "Wishlist product out of stock",
              message: `${item.name} is currently out of stock. Enable back-in-stock alerts from your wishlist.`,
              type: "Wishlist",
              read: false,
              link: `/product/${item.slug || item._id}`,
              priority: "medium",
              createdAt: new Date().toISOString(),
              source: "wishlist",
            })
          );
        }

        if (item.countInStock > 0 && item.countInStock <= 5) {
          generated.push(
            createNotification({
              id: `wishlist-lowstock-${item._id}`,
              title: "Wishlist product low stock",
              message: `${item.name} is almost sold out. Only ${item.countInStock} left.`,
              type: "Wishlist",
              read: false,
              link: `/product/${item.slug || item._id}`,
              priority: "medium",
              createdAt: new Date().toISOString(),
              source: "wishlist",
            })
          );
        }
      });

      if (cartItems.length > 0) {
        generated.push(
          createNotification({
            id: "cart-reminder",
            title: "You left items in your cart",
            message: `You have ${cartItems.length} product(s) waiting in your cart. Complete checkout before they sell out.`,
            type: "Cart",
            read: false,
            link: "/cart",
            priority: "medium",
            createdAt: new Date().toISOString(),
            source: "cart",
          })
        );
      }

      generated.push(
        createNotification({
          id: "offer-welcome",
          title: "New offer available",
          message: "Use WELCOME10 on your next order and save more on EliteShop.",
          type: "Offer",
          read: false,
          link: "/products",
          priority: "normal",
          createdAt: new Date().toISOString(),
          source: "offer",
        })
      );

      generated.push(
        createNotification({
          id: "security-profile",
          title: "Account security active",
          message:
            "Your account is protected with secure login session and protected checkout flow.",
          type: "Security",
          read: true,
          link: "/profile",
          priority: "normal",
          createdAt: new Date().toISOString(),
          source: "security",
        })
      );

      const mergedMap = new Map();

      [...saved, ...generated].forEach((notification) => {
        const existing = mergedMap.get(notification.id);

        mergedMap.set(notification.id, {
          ...notification,
          read: existing?.read ?? notification.read,
        });
      });

      return Array.from(mergedMap.values()).sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
    },
    [
      cartItems.length,
      wishlistItems,
      getSavedNotifications,
    ]
  );

  const fetchNotifications = useCallback(
    async (silent = false) => {
      try {
        if (silent) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        let orderList = [];

        if (userInfo) {
          const { data } = await api.get("/orders/myorders");
          orderList = Array.isArray(data) ? data : [];
        }

        const items = generateNotifications(orderList);

        setNotifications(items);
        saveNotifications(items);
      } catch (error) {
        const saved = getSavedNotifications();

        if (saved.length > 0) {
          setNotifications(saved);
        } else {
          setError(
            error.response?.data?.message ||
              error.message ||
              "Failed to load notifications"
          );
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [
      userInfo,
      generateNotifications,
      getSavedNotifications,
      saveNotifications,
    ]
  );

  useEffect(() => {
    fetchNotifications();
  }, [
    fetchNotifications,
  ]);

  const filteredNotifications = useMemo(() => {
    let result = [...notifications];

    const search = searchTerm.toLowerCase().trim();

    if (search) {
      result = result.filter(
        (item) =>
          item.title.toLowerCase().includes(search) ||
          item.message.toLowerCase().includes(search) ||
          item.type.toLowerCase().includes(search) ||
          item.priority.toLowerCase().includes(search)
      );
    }

    if (categoryFilter !== "All") {
      result = result.filter((item) => item.type === categoryFilter);
    }

    if (readFilter === "Unread") {
      result = result.filter((item) => !item.read);
    }

    if (readFilter === "Read") {
      result = result.filter((item) => item.read);
    }

    if (priorityFilter !== "All") {
      result = result.filter((item) => item.priority === priorityFilter);
    }

    result.sort((a, b) => {
      if (sortBy === "oldest") {
        return new Date(a.createdAt) - new Date(b.createdAt);
      }

      if (sortBy === "priority") {
        const priorityRank = {
          high: 3,
          medium: 2,
          normal: 1,
        };

        return (
          (priorityRank[b.priority] || 1) -
          (priorityRank[a.priority] || 1)
        );
      }

      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    return result;
  }, [
    notifications,
    searchTerm,
    categoryFilter,
    readFilter,
    priorityFilter,
    sortBy,
  ]);

  const stats = useMemo(() => {
    const unread = notifications.filter((item) => !item.read).length;

    return {
      total: notifications.length,
      unread,
      orders: notifications.filter((item) => item.type === "Order").length,
      payments: notifications.filter((item) => item.type === "Payment").length,
      alerts: notifications.filter((item) => item.priority === "high").length,
      readRate:
        notifications.length > 0
          ? Math.round(((notifications.length - unread) / notifications.length) * 100)
          : 100,
    };
  }, [notifications]);

  const updateAndSave = (items) => {
    setNotifications(items);
    saveNotifications(items);
  };

  const markAsRead = (id, silent = false) => {
    const updated = notifications.map((item) =>
      item.id === id
        ? {
            ...item,
            read: true,
          }
        : item
    );

    updateAndSave(updated);

    if (!silent) {
      toast.success("Notification marked as read");
    }
  };

  const markAllAsRead = () => {
    const updated = notifications.map((item) => ({
      ...item,
      read: true,
    }));

    updateAndSave(updated);
    toast.success("All notifications marked as read");
  };

  const deleteNotification = (id) => {
    const updated = notifications.filter((item) => item.id !== id);

    updateAndSave(updated);
    toast.success("Notification deleted");
  };

  const clearAllNotifications = () => {
    updateAndSave([]);
    setShowClearModal(false);
    toast.success("All notifications cleared");
  };

  const viewDetails = (notification) => {
    if (!notification.read) {
      markAsRead(notification.id, true);
    }

    if (notification.link) {
      navigate(notification.link);
    } else {
      setSelectedNotification(notification);
    }
  };

  const openModalDetails = (notification) => {
    if (!notification.read) {
      markAsRead(notification.id, true);
    }

    setSelectedNotification(notification);
  };

  const resetFilters = () => {
    setSearchTerm("");
    setCategoryFilter("All");
    setReadFilter("All");
    setPriorityFilter("All");
    setSortBy("newest");
  };

  if (loading) {
    return (
      <main className="elite-notification-page">
        <Card className="elite-notification-loader-card">
          <Card.Body>
            <Spinner animation="border" />

            <div>
              <h4>Loading notifications...</h4>

              <p>
                Checking orders, payments, delivery updates, wishlist alerts,
                offers and cart reminders.
              </p>
            </div>
          </Card.Body>
        </Card>

        <Loader />
      </main>
    );
  }

  if (error) {
    return (
      <main className="elite-notification-page">
        <Card className="elite-notification-error-card">
          <Card.Body>
            <Message variant="danger">
              {error}
            </Message>

            <Button
              variant="dark"
              className="rounded-pill fw-bold"
              onClick={() => fetchNotifications()}
            >
              <FaSyncAlt className="me-2" />
              Retry
            </Button>
          </Card.Body>
        </Card>
      </main>
    );
  }

  return (
    <motion.main
      initial={{
        opacity: 0,
        y: 16,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.28,
      }}
      className="elite-notification-page"
    >
      <section className="elite-notification-hero">
        <div>
          <Badge
            bg="warning"
            text="dark"
            className="elite-notification-hero-badge"
          >
            <FaShieldAlt className="me-2" />
            EliteShop Alert Center
          </Badge>

          <h1>
            <FaBell className="me-2" />
            Notifications
          </h1>

          <p>
            Track order updates, payments, delivery, wishlist alerts, offers,
            cart reminders and account security in one clean notification hub.
          </p>
        </div>

        <div className="elite-notification-hero-actions">
          <Button
            variant="light"
            onClick={markAllAsRead}
            disabled={stats.unread === 0}
          >
            <FaEnvelopeOpenText className="me-2" />
            Mark Read
          </Button>

          <Button
            variant="outline-light"
            onClick={() => fetchNotifications(true)}
            disabled={refreshing}
          >
            <FaSyncAlt className={refreshing ? "me-2 elite-spin" : "me-2"} />
            {refreshing ? "Refreshing" : "Refresh"}
          </Button>

          <Button
            variant="warning"
            onClick={() => navigate("/products")}
          >
            <FaStore className="me-2" />
            Shop Now
          </Button>
        </div>

        <motion.div
          className="elite-notification-floating"
          animate={{
            y: [0, -10, 0],
          }}
          transition={{
            duration: 3.5,
            repeat: Infinity,
          }}
        >
          <FaMagic />
          {stats.unread} Unread
        </motion.div>
      </section>

      <Row className="g-4 mb-4">
        <NotificationStat
          type="total"
          title="Total Alerts"
          value={stats.total}
          text="All notifications"
          icon={<FaBell />}
        />

        <NotificationStat
          type="unread"
          title="Unread"
          value={stats.unread}
          text={`${stats.readRate}% read rate`}
          icon={<FaClock />}
        />

        <NotificationStat
          type="orders"
          title="Orders"
          value={stats.orders}
          text="Order activity"
          icon={<FaShoppingBag />}
        />

        <NotificationStat
          type="important"
          title="Important"
          value={stats.alerts}
          text="High priority"
          icon={<FaExclamationTriangle />}
        />
      </Row>

      <Row className="g-4 mb-4">
        <Col lg={8}>
          <Card className="elite-notification-filter-card">
            <Card.Body>
              <Row className="g-3 align-items-center">
                <Col lg={4}>
                  <div className="elite-notification-search">
                    <FaSearch />

                    <input
                      placeholder="Search notifications..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </Col>

                <Col md={6} lg={2}>
                  <Form.Select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                  >
                    {notificationCategories.map((category) => (
                      <option
                        key={category}
                        value={category}
                      >
                        {category}
                      </option>
                    ))}
                  </Form.Select>
                </Col>

                <Col md={6} lg={2}>
                  <Form.Select
                    value={readFilter}
                    onChange={(e) => setReadFilter(e.target.value)}
                  >
                    <option value="All">All</option>
                    <option value="Unread">Unread</option>
                    <option value="Read">Read</option>
                  </Form.Select>
                </Col>

                <Col md={6} lg={2}>
                  <Form.Select
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value)}
                  >
                    <option value="All">Priority</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="normal">Normal</option>
                  </Form.Select>
                </Col>

                <Col md={6} lg={2}>
                  <Form.Select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="newest">Newest</option>
                    <option value="oldest">Oldest</option>
                    <option value="priority">Priority</option>
                  </Form.Select>
                </Col>
              </Row>

              <div className="elite-notification-filter-footer">
                <span>
                  Showing <strong>{filteredNotifications.length}</strong> of{" "}
                  <strong>{notifications.length}</strong> alerts
                </span>

                <Button
                  variant="link"
                  onClick={resetFilters}
                >
                  Reset filters
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className="elite-notification-action-card">
            <Card.Body>
              <FaRocket />

              <div>
                <h5>Quick Actions</h5>

                <p>Manage notification inbox faster.</p>

                <div className="elite-notification-action-buttons">
                  <Button
                    variant="light"
                    onClick={markAllAsRead}
                    disabled={stats.unread === 0}
                  >
                    Mark all read
                  </Button>

                  <Button
                    variant="outline-light"
                    onClick={() => fetchNotifications(true)}
                  >
                    Refresh
                  </Button>

                  <Button
                    variant="danger"
                    onClick={() => setShowClearModal(true)}
                    disabled={notifications.length === 0}
                  >
                    Clear all
                  </Button>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="elite-notification-progress-card mb-4">
        <Card.Body>
          <div className="elite-notification-progress-top">
            <div>
              <h5>
                <FaArchive className="me-2" />
                Inbox Health
              </h5>

              <p>
                Keep notifications clean by reading important updates and clearing old alerts.
              </p>
            </div>

            <Badge bg={stats.readRate > 70 ? "success" : "warning"}>
              {stats.readRate}% Read
            </Badge>
          </div>

          <ProgressBar
            now={stats.readRate}
            variant={stats.readRate > 70 ? "success" : "warning"}
          />
        </Card.Body>
      </Card>

      {notifications.length === 0 ? (
        <Card className="elite-notification-empty-card">
          <Card.Body>
            <motion.div
              className="elite-notification-empty-icon"
              animate={{
                scale: [1, 1.08, 1],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
              }}
            >
              <FaBell />
            </motion.div>

            <h3>No notifications yet</h3>

            <p>
              Order updates, payment alerts, delivery tracking, offers and
              wishlist messages will appear here.
            </p>

            <Button
              variant="dark"
              className="rounded-pill fw-bold"
              onClick={() => navigate("/products")}
            >
              <FaStore className="me-2" />
              Explore Products
            </Button>
          </Card.Body>
        </Card>
      ) : filteredNotifications.length === 0 ? (
        <Card className="elite-notification-empty-card">
          <Card.Body>
            <FaFilter className="elite-notification-no-result-icon" />

            <h3>No matching notifications</h3>

            <p>
              Try changing category, read status, priority or search text.
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
        <ListGroup className="elite-notification-list">
          {filteredNotifications.map((notification, index) => (
            <motion.div
              key={notification.id}
              initial={{
                opacity: 0,
                y: 18,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.22,
                delay: index * 0.02,
              }}
              whileHover={{
                y: -3,
              }}
            >
              <Card
                className={
                  notification.read
                    ? "elite-notification-item read"
                    : "elite-notification-item unread"
                }
              >
                <Card.Body>
                  <div className="elite-notification-icon-wrap">
                    <div
                      className={`elite-notification-icon ${getTypeClass(
                        notification.type
                      )}`}
                    >
                      {getTypeIcon(notification.type)}
                    </div>
                  </div>

                  <div className="elite-notification-content">
                    <div className="elite-notification-meta">
                      <Badge bg={getTypeVariant(notification.type)}>
                        {notification.type}
                      </Badge>

                      <Badge bg={getPriorityVariant(notification.priority)}>
                        {notification.priority}
                      </Badge>

                      {!notification.read && (
                        <Badge bg="primary">
                          New
                        </Badge>
                      )}

                      <span>
                        <FaClock className="me-1" />
                        {getTimeAgo(notification.createdAt)}
                      </span>
                    </div>

                    <h5>{notification.title}</h5>

                    <p>{notification.message}</p>

                    <div className="elite-notification-source">
                      Source: <strong>{notification.source}</strong>
                    </div>
                  </div>

                  <div className="elite-notification-actions">
                    {!notification.read && (
                      <Button
                        size="sm"
                        variant="outline-success"
                        onClick={() => markAsRead(notification.id)}
                        title="Mark as read"
                      >
                        <FaCheckCircle />
                      </Button>
                    )}

                    <Button
                      size="sm"
                      variant="outline-primary"
                      onClick={() => openModalDetails(notification)}
                      title="Preview"
                    >
                      <FaEye />
                    </Button>

                    {notification.link && (
                      <Button
                        size="sm"
                        variant="dark"
                        onClick={() => viewDetails(notification)}
                        title="Open"
                      >
                        <FaRocket />
                      </Button>
                    )}

                    <Button
                      size="sm"
                      variant="outline-danger"
                      onClick={() => deleteNotification(notification.id)}
                      title="Delete"
                    >
                      <FaTrash />
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </motion.div>
          ))}
        </ListGroup>
      )}

      <Row className="g-4 mt-4">
        <NotificationHelpCard
          type="order"
          icon={<FaBoxOpen />}
          title="Orders"
          text="Order placed, packed, shipped and delivered updates."
        />

        <NotificationHelpCard
          type="payment"
          icon={<FaCreditCard />}
          title="Payments"
          text="Payment success, pending, refunds and wallet alerts."
        />

        <NotificationHelpCard
          type="wishlist"
          icon={<FaHeart />}
          title="Wishlist"
          text="Price drops, low stock and back-in-stock messages."
        />

        <NotificationHelpCard
          type="offer"
          icon={<FaGift />}
          title="Offers"
          text="Coupons, flash sales and personalized shopping deals."
        />
      </Row>

      <Modal
        show={!!selectedNotification}
        onHide={() => setSelectedNotification(null)}
        centered
        className="elite-notification-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <FaBell className="me-2" />
            Notification Details
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {selectedNotification && (
            <div className="elite-notification-modal-body">
              <div
                className={`elite-notification-modal-icon ${getTypeClass(
                  selectedNotification.type
                )}`}
              >
                {getTypeIcon(selectedNotification.type)}
              </div>

              <div className="elite-notification-modal-badges">
                <Badge bg={getTypeVariant(selectedNotification.type)}>
                  {selectedNotification.type}
                </Badge>

                <Badge bg={getPriorityVariant(selectedNotification.priority)}>
                  {selectedNotification.priority}
                </Badge>
              </div>

              <h4>{selectedNotification.title}</h4>

              <p>{selectedNotification.message}</p>

              <div className="elite-notification-modal-info">
                <div>
                  <span>Time</span>
                  <strong>
                    {new Date(selectedNotification.createdAt).toLocaleString()}
                  </strong>
                </div>

                <div>
                  <span>Source</span>
                  <strong>{selectedNotification.source}</strong>
                </div>

                <div>
                  <span>Status</span>
                  <strong>{selectedNotification.read ? "Read" : "Unread"}</strong>
                </div>
              </div>
            </div>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setSelectedNotification(null)}
          >
            Close
          </Button>

          {selectedNotification?.link && (
            <Button
              as={Link}
              to={selectedNotification.link}
              variant="dark"
            >
              Open Details
            </Button>
          )}
        </Modal.Footer>
      </Modal>

      <Modal
        show={showClearModal}
        onHide={() => setShowClearModal(false)}
        centered
        className="elite-notification-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title className="text-danger">
            <FaTrash className="me-2" />
            Clear All Notifications
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Alert
            variant="danger"
            className="elite-clear-alert"
          >
            <FaTimesCircle className="me-2" />
            This will permanently remove all local notifications from this dashboard.
          </Alert>
        </Modal.Body>

        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowClearModal(false)}
          >
            Cancel
          </Button>

          <Button
            variant="danger"
            onClick={clearAllNotifications}
          >
            Clear All
          </Button>
        </Modal.Footer>
      </Modal>
    </motion.main>
  );
};

const NotificationStat = ({
  type,
  title,
  value,
  text,
  icon,
}) => (
  <Col md={6} xl={3}>
    <motion.div whileHover={{ y: -6 }}>
      <Card className={`elite-notification-stat-card ${type}`}>
        <Card.Body>
          <div>
            <span>{title}</span>

            <h2>{value}</h2>

            <p>{text}</p>
          </div>

          {icon}
        </Card.Body>
      </Card>
    </motion.div>
  </Col>
);

const NotificationHelpCard = ({
  type,
  icon,
  title,
  text,
}) => (
  <Col md={6} xl={3}>
    <Card className={`elite-notification-help-card ${type}`}>
      <Card.Body>
        {icon}

        <h5>{title}</h5>

        <p>{text}</p>
      </Card.Body>
    </Card>
  </Col>
);

export default NotificationsPage;