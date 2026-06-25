import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Row,
  Col,
  Card,
  Button,
  Form,
  Image,
  Badge,
  Table,
  ListGroup,
  Modal,
  Nav,
  Tab,
  Alert,
  Spinner,
  ProgressBar,
  InputGroup,
} from "react-bootstrap";

import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaCamera,
  FaEdit,
  FaSave,
  FaShoppingBag,
  FaTruck,
  FaHeart,
  FaMapMarkerAlt,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaTrash,
  FaDownload,
  FaUndo,
  FaBell,
  FaWallet,
  FaTicketAlt,
  FaShieldAlt,
  FaSignOutAlt,
  FaBoxOpen,
  FaCheckCircle,
  FaClock,
  FaHome,
  FaBriefcase,
  FaPlus,
  FaStar,
  FaShoppingCart,
  FaCrown,
  FaGift,
  FaBolt,
  FaStore,
  FaRupeeSign,
  FaTimesCircle,
  FaCalendarAlt,
  FaRocket,
  FaIdCard,
  FaLocationArrow,
  FaCreditCard,
  FaPercent,
  FaSyncAlt,
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

import "../../styles/UserProfile.css";

const formatPrice = (value) => {
  return Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  });
};

const formatDate = (value) => {
  if (!value) return "Recently";

  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const coupons = [
  {
    code: "WELCOME10",
    title: "Welcome Offer",
    discount: "10% OFF",
    status: "Available",
    description: "Use this coupon on your next order.",
  },
  {
    code: "FREESHIP",
    title: "Free Shipping",
    discount: "₹99 OFF",
    status: "Available",
    description: "Get shipping discount on eligible orders.",
  },
  {
    code: "ELITEDEAL",
    title: "Elite Deal",
    discount: "15% OFF",
    status: "Available",
    description: "Special discount for selected products.",
  },
  {
    code: "OLDSALE",
    title: "Old Sale Coupon",
    discount: "15% OFF",
    status: "Expired",
    description: "This coupon has expired.",
  },
];

const walletTransactions = [
  {
    id: 1,
    title: "Refund Credit",
    amount: 0,
    type: "credit",
    date: new Date().toLocaleDateString(),
  },
];

const ProfilePage = () => {
  const navigate = useNavigate();

  const {
    userInfo,
    logout,
  } = useAuth();

  const {
    wishlistItems,
    removeFromWishlist,
    addToCart,
  } = useCart();

  const [activeKey, setActiveKey] = useState("overview");

  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [error, setError] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");

  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: "",
    avatar: "",
    gender: "",
    dateOfBirth: "",
    address: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [addresses, setAddresses] = useState(() => {
    try {
      const saved = localStorage.getItem("userAddresses");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [addressForm, setAddressForm] = useState({
    id: null,
    fullName: "",
    phone: "",
    addressLine: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
    type: "Home",
    isDefault: false,
  });

  const [editingAddress, setEditingAddress] = useState(false);

  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem("userNotifications");

      return saved
        ? JSON.parse(saved)
        : [
            {
              id: 1,
              title: "Welcome to EliteShop",
              message: "Your account dashboard is ready.",
              type: "Account",
              read: false,
              createdAt: new Date().toISOString(),
            },
          ];
    } catch {
      return [];
    }
  });

  const fetchProfileData = async (silent = false) => {
    try {
      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const [profileRes, ordersRes] = await Promise.all([
        api.get("/users/profile"),
        api.get("/orders/myorders"),
      ]);

      const user = profileRes.data || {};

      setProfile(user);

      setEditForm({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        avatar: user.avatar || "/images/default-avatar.png",
        gender: user.gender || "",
        dateOfBirth: user.dateOfBirth
          ? user.dateOfBirth.substring(0, 10)
          : "",
        address: user.address || "",
      });

      setOrders(Array.isArray(ordersRes.data) ? ordersRes.data : []);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          error.message ||
          "Failed to load profile"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!userInfo) {
      navigate("/login?redirect=/profile");
      return;
    }

    fetchProfileData();
  }, [
    userInfo,
    navigate,
  ]);

  useEffect(() => {
    localStorage.setItem("userAddresses", JSON.stringify(addresses));
  }, [addresses]);

  useEffect(() => {
    localStorage.setItem("userNotifications", JSON.stringify(notifications));
  }, [notifications]);

  const accountCompletion = useMemo(() => {
    let score = 35;

    if (profile?.email || editForm.email) score += 10;
    if (editForm.phone) score += 15;
    if (editForm.avatar && editForm.avatar !== "/images/default-avatar.png") score += 10;
    if (editForm.address) score += 10;
    if (addresses.length > 0) score += 10;
    if (orders.length > 0) score += 5;
    if (wishlistItems?.length > 0) score += 5;

    return Math.min(score, 100);
  }, [
    profile,
    editForm,
    addresses.length,
    orders.length,
    wishlistItems,
  ]);

  const stats = useMemo(() => {
    const totalOrders = orders.length;

    const pendingOrders = orders.filter(
      (order) =>
        order.orderStatus === "Pending" ||
        order.orderStatus === "Processing" ||
        (!order.isDelivered && order.orderStatus !== "Cancelled")
    ).length;

    const deliveredOrders = orders.filter(
      (order) =>
        order.isDelivered ||
        order.orderStatus === "Delivered"
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

    const unreadNotifications = notifications.filter((item) => !item.read).length;

    return {
      totalOrders,
      pendingOrders,
      deliveredOrders,
      wishlistCount: wishlistItems?.length || 0,
      totalSpent,
      addressCount: addresses.length,
      unreadNotifications,
    };
  }, [
    orders,
    wishlistItems,
    addresses.length,
    notifications,
  ]);

  const recentOrders = useMemo(() => {
    return [...orders]
      .sort(
        (a, b) =>
          new Date(b.createdAt || 0) -
          new Date(a.createdAt || 0)
      )
      .slice(0, 5);
  }, [orders]);

  const editChangeHandler = (e) => {
    const {
      name,
      value,
    } = e.target;

    setEditForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const uploadAvatarHandler = async (e) => {
    const file = e.target.files[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload a valid image");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image should be less than 5MB");
      return;
    }

    const formData = new FormData();
    formData.append("image", file);

    try {
      setUploading(true);

      const { data } = await api.post("/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setEditForm((prev) => ({
        ...prev,
        avatar: data.image || data.url,
      }));

      toast.success("Profile image uploaded");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Image upload failed"
      );
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const updateProfileHandler = async (e) => {
    e.preventDefault();

    if (!editForm.name.trim()) {
      toast.error("Name is required");
      return;
    }

    if (!editForm.email.trim()) {
      toast.error("Email is required");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        name: editForm.name.trim(),
        email: editForm.email.trim(),
        phone: editForm.phone.trim(),
        avatar: editForm.avatar,
        gender: editForm.gender,
        dateOfBirth: editForm.dateOfBirth,
        address: editForm.address,
      };

      const { data } = await api.put("/users/profile", payload);

      const updatedUser = {
        ...profile,
        ...payload,
        ...data,
      };

      setProfile(updatedUser);

      const oldUserInfo = localStorage.getItem("userInfo")
        ? JSON.parse(localStorage.getItem("userInfo"))
        : {};

      localStorage.setItem(
        "userInfo",
        JSON.stringify({
          ...oldUserInfo,
          ...updatedUser,
        })
      );

      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Profile update failed"
      );
    } finally {
      setSaving(false);
    }
  };

  const changePasswordHandler = async (e) => {
    e.preventDefault();

    if (!passwordForm.newPassword || !passwordForm.confirmPassword) {
      toast.error("Please fill password fields");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    try {
      setSaving(true);

      await api.put("/users/profile", {
        password: passwordForm.newPassword,
      });

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      toast.success("Password changed successfully");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Password update failed"
      );
    } finally {
      setSaving(false);
    }
  };

  const cancelOrderHandler = async (orderId) => {
    if (!window.confirm("Cancel this order?")) return;

    try {
      await api.put(`/orders/${orderId}/cancel`, {
        reason: "Cancelled by customer",
      });

      toast.success("Order cancelled");
      fetchProfileData(true);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to cancel order"
      );
    }
  };

  const reorderHandler = (order) => {
    order.orderItems?.forEach((item) => {
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

    toast.success("Items added to cart");
    navigate("/cart");
  };

  const downloadInvoiceHandler = (order) => {
    const invoiceText = `
EliteShop Invoice
Order ID: ${order._id}
Date: ${formatDate(order.createdAt)}
Payment: ${order.paymentMethod}
Total: ₹${order.totalPrice}
Status: ${order.orderStatus || "Pending"}
`;

    const blob = new Blob([invoiceText], {
      type: "text/plain",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");

    a.href = url;
    a.download = `invoice-${order._id}.txt`;
    a.click();

    URL.revokeObjectURL(url);
    toast.success("Invoice downloaded");
  };

  const getOrderBadge = (status) => {
    switch (status) {
      case "Pending":
        return "secondary";
      case "Confirmed":
        return "primary";
      case "Processing":
        return "info";
      case "Shipped":
      case "Out For Delivery":
        return "warning";
      case "Delivered":
        return "success";
      case "Cancelled":
        return "danger";
      case "Returned":
        return "dark";
      default:
        return "secondary";
    }
  };

  const addressChangeHandler = (e) => {
    const {
      name,
      value,
      type,
      checked,
    } = e.target;

    setAddressForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const resetAddressForm = () => {
    setAddressForm({
      id: null,
      fullName: "",
      phone: "",
      addressLine: "",
      city: "",
      state: "",
      postalCode: "",
      country: "India",
      type: "Home",
      isDefault: false,
    });

    setEditingAddress(false);
  };

  const saveAddressHandler = (e) => {
    e.preventDefault();

    if (
      !addressForm.fullName ||
      !addressForm.phone ||
      !addressForm.addressLine ||
      !addressForm.city ||
      !addressForm.postalCode
    ) {
      toast.error("Please fill required address fields");
      return;
    }

    if (editingAddress) {
      setAddresses((prev) =>
        prev.map((addr) => {
          if (addr.id === addressForm.id) {
            return addressForm;
          }

          if (addressForm.isDefault) {
            return {
              ...addr,
              isDefault: false,
            };
          }

          return addr;
        })
      );

      toast.success("Address updated");
    } else {
      const newAddress = {
        ...addressForm,
        id: Date.now(),
      };

      setAddresses((prev) => [
        ...(newAddress.isDefault
          ? prev.map((addr) => ({
              ...addr,
              isDefault: false,
            }))
          : prev),
        newAddress,
      ]);

      toast.success("Address added");
    }

    resetAddressForm();
  };

  const editAddressHandler = (address) => {
    setAddressForm(address);
    setEditingAddress(true);
  };

  const deleteAddressHandler = (id) => {
    setAddresses((prev) =>
      prev.filter((address) => address.id !== id)
    );

    toast.success("Address deleted");
  };

  const setDefaultAddressHandler = (id) => {
    setAddresses((prev) =>
      prev.map((address) => ({
        ...address,
        isDefault: address.id === id,
      }))
    );

    toast.success("Default address updated");
  };

  const moveWishlistToCart = (product) => {
    addToCart(
      {
        ...product,
        countInStock: product.countInStock || 10,
        slug: product.slug || product._id,
      },
      1
    );

    removeFromWishlist(product._id);
    toast.success("Moved to cart");
  };

  const markNotificationRead = (id) => {
    setNotifications((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              read: true,
            }
          : item
      )
    );
  };

  const deleteNotification = (id) => {
    setNotifications((prev) =>
      prev.filter((item) => item.id !== id)
    );
  };

  const clearNotifications = () => {
    setNotifications([]);
    toast.success("Notifications cleared");
  };

  const logoutHandler = async () => {
    await logout();
  };

  const deleteAccountHandler = () => {
    if (!deletePassword) {
      toast.error("Enter password to confirm");
      return;
    }

    toast.info("Delete account backend API is not added yet.");
    setShowDeleteModal(false);
    setDeletePassword("");
  };

  if (loading) {
    return (
      <main className="elite-user-profile-page">
        <Loader />
      </main>
    );
  }

  if (error) {
    return (
      <main className="elite-user-profile-page">
        <Message variant="danger">
          {error}
        </Message>
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
        duration: 0.3,
      }}
      className="elite-user-profile-page"
    >
      <section className="elite-profile-hero">
        <div>
          <Badge
            bg="warning"
            text="dark"
            className="elite-profile-hero-badge"
          >
            <FaCrown className="me-2" />
            EliteShop Account Center
          </Badge>

          <h1>
            <FaUser className="me-2" />
            My Profile
          </h1>

          <p>
            Manage your account, orders, addresses, wishlist, wallet,
            coupons, notifications, security and shopping activity from one
            premium dashboard.
          </p>
        </div>

        <div className="elite-profile-hero-actions">
          <Button
            variant="light"
            onClick={() => setActiveKey("edit")}
          >
            <FaEdit className="me-2" />
            Edit Profile
          </Button>

          <Button
            variant="outline-light"
            onClick={() => navigate("/orders")}
          >
            <FaShoppingBag className="me-2" />
            Orders
          </Button>

          <Button
            variant="warning"
            disabled={refreshing}
            onClick={() => fetchProfileData(true)}
          >
            <FaSyncAlt className={refreshing ? "me-2 elite-spin" : "me-2"} />
            {refreshing ? "Refreshing" : "Refresh"}
          </Button>
        </div>

        <motion.div
          className="elite-profile-floating"
          animate={{
            y: [0, -10, 0],
          }}
          transition={{
            duration: 3.5,
            repeat: Infinity,
          }}
        >
          <FaShieldAlt />
          {accountCompletion}% Complete
        </motion.div>
      </section>

      <Card className="elite-profile-header-card">
        <Card.Body>
          <Row className="align-items-end g-4">
            <Col lg={8}>
              <div className="elite-profile-user-box">
                <div className="elite-profile-avatar-wrap">
                  <Image
                    src={editForm.avatar || "/images/default-avatar.png"}
                    roundedCircle
                  />

                  <label className="elite-profile-avatar-btn">
                    {uploading ? (
                      <Spinner
                        animation="border"
                        size="sm"
                      />
                    ) : (
                      <FaCamera />
                    )}

                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={uploadAvatarHandler}
                    />
                  </label>
                </div>

                <div>
                  <h2>{profile?.name}</h2>

                  <p>
                    <FaEnvelope className="me-2" />
                    {profile?.email}
                  </p>

                  <div className="elite-profile-badges">
                    <Badge bg="dark">
                      {profile?.role || "user"}
                    </Badge>

                    <Badge bg={profile?.isVerified ? "success" : "warning"}>
                      {profile?.isVerified ? "Verified" : "Not Verified"}
                    </Badge>

                    <Badge bg="primary">
                      Joined {formatDate(profile?.createdAt)}
                    </Badge>
                  </div>
                </div>
              </div>
            </Col>

            <Col lg={4}>
              <div className="elite-profile-completion-card">
                <div>
                  <span>Account Completion</span>
                  <strong>{accountCompletion}%</strong>
                </div>

                <ProgressBar now={accountCompletion} />
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Row className="g-4 mb-4">
        <ProfileStat
          type="orders"
          title="Total Orders"
          value={stats.totalOrders}
          text={`${stats.pendingOrders} active/pending`}
          icon={<FaShoppingBag />}
        />

        <ProfileStat
          type="delivered"
          title="Delivered"
          value={stats.deliveredOrders}
          text="Completed purchases"
          icon={<FaTruck />}
        />

        <ProfileStat
          type="wishlist"
          title="Wishlist"
          value={stats.wishlistCount}
          text="Saved products"
          icon={<FaHeart />}
        />

        <ProfileStat
          type="spent"
          title="Total Spent"
          value={`₹${formatPrice(stats.totalSpent)}`}
          text={`${stats.addressCount} saved address`}
          icon={<FaWallet />}
        />
      </Row>

      <Row className="g-4">
        <Col lg={3}>
          <Card className="elite-profile-sidebar">
            <Card.Body>
              <Nav
                variant="pills"
                className="elite-profile-nav"
                activeKey={activeKey}
                onSelect={(key) => setActiveKey(key)}
              >
                <Nav.Item>
                  <Nav.Link eventKey="overview">
                    <FaUser />
                    Overview
                  </Nav.Link>
                </Nav.Item>

                <Nav.Item>
                  <Nav.Link eventKey="edit">
                    <FaEdit />
                    Edit Profile
                  </Nav.Link>
                </Nav.Item>

                <Nav.Item>
                  <Nav.Link eventKey="orders">
                    <FaShoppingBag />
                    My Orders
                    {stats.pendingOrders > 0 && (
                      <Badge bg="warning" text="dark">
                        {stats.pendingOrders}
                      </Badge>
                    )}
                  </Nav.Link>
                </Nav.Item>

                <Nav.Item>
                  <Nav.Link eventKey="addresses">
                    <FaMapMarkerAlt />
                    Addresses
                  </Nav.Link>
                </Nav.Item>

                <Nav.Item>
                  <Nav.Link eventKey="wishlist">
                    <FaHeart />
                    Wishlist
                  </Nav.Link>
                </Nav.Item>

                <Nav.Item>
                  <Nav.Link eventKey="reviews">
                    <FaStar />
                    Reviews
                  </Nav.Link>
                </Nav.Item>

                <Nav.Item>
                  <Nav.Link eventKey="returns">
                    <FaUndo />
                    Returns
                  </Nav.Link>
                </Nav.Item>

                <Nav.Item>
                  <Nav.Link eventKey="notifications">
                    <FaBell />
                    Notifications
                    {stats.unreadNotifications > 0 && (
                      <Badge bg="danger">
                        {stats.unreadNotifications}
                      </Badge>
                    )}
                  </Nav.Link>
                </Nav.Item>

                <Nav.Item>
                  <Nav.Link eventKey="wallet">
                    <FaWallet />
                    Coupons & Wallet
                  </Nav.Link>
                </Nav.Item>

                <Nav.Item>
                  <Nav.Link eventKey="security">
                    <FaShieldAlt />
                    Security
                  </Nav.Link>
                </Nav.Item>
              </Nav>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={9}>
          <Tab.Container activeKey={activeKey}>
            <Tab.Content>
              <Tab.Pane eventKey="overview">
                <Card className="elite-profile-content-card">
                  <Card.Body>
                    <SectionHeader
                      icon={<FaIdCard />}
                      title="Profile Overview"
                      text="Your personal account information and shopping summary."
                    />

                    <Row className="g-4">
                      <Col md={6}>
                        <InfoList
                          items={[
                            {
                              icon: <FaUser />,
                              label: "Name",
                              value: profile?.name,
                            },
                            {
                              icon: <FaEnvelope />,
                              label: "Email",
                              value: profile?.email,
                            },
                            {
                              icon: <FaPhone />,
                              label: "Phone",
                              value: profile?.phone || "Not added",
                            },
                            {
                              icon: <FaCalendarAlt />,
                              label: "Joined",
                              value: formatDate(profile?.createdAt),
                            },
                          ]}
                        />
                      </Col>

                      <Col md={6}>
                        <div className="elite-profile-insight-card">
                          <FaBolt />

                          <h4>Account Health</h4>

                          <p>
                            Complete profile, add address, verify contact
                            details and keep your account secure.
                          </p>

                          <ProgressBar now={accountCompletion} />

                          <strong>{accountCompletion}% complete</strong>
                        </div>
                      </Col>
                    </Row>

                    <Row className="g-4 mt-1">
                      <Col md={4}>
                        <MiniFeature
                          icon={<FaGift />}
                          title="Coupons"
                          text={`${coupons.filter((c) => c.status === "Available").length} available`}
                        />
                      </Col>

                      <Col md={4}>
                        <MiniFeature
                          icon={<FaMapMarkerAlt />}
                          title="Addresses"
                          text={`${addresses.length} saved`}
                        />
                      </Col>

                      <Col md={4}>
                        <MiniFeature
                          icon={<FaBell />}
                          title="Alerts"
                          text={`${stats.unreadNotifications} unread`}
                        />
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              </Tab.Pane>

              <Tab.Pane eventKey="edit">
                <Card className="elite-profile-content-card">
                  <Card.Body>
                    <SectionHeader
                      icon={<FaEdit />}
                      title="Edit Profile"
                      text="Update your profile information and avatar."
                    />

                    <Form onSubmit={updateProfileHandler}>
                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Name</Form.Label>
                            <Form.Control
                              name="name"
                              value={editForm.name}
                              onChange={editChangeHandler}
                              required
                            />
                          </Form.Group>
                        </Col>

                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                              type="email"
                              name="email"
                              value={editForm.email}
                              onChange={editChangeHandler}
                              required
                            />
                          </Form.Group>
                        </Col>

                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Phone</Form.Label>
                            <Form.Control
                              name="phone"
                              value={editForm.phone}
                              onChange={editChangeHandler}
                            />
                          </Form.Group>
                        </Col>

                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Gender</Form.Label>
                            <Form.Select
                              name="gender"
                              value={editForm.gender}
                              onChange={editChangeHandler}
                            >
                              <option value="">Select Gender</option>
                              <option value="Male">Male</option>
                              <option value="Female">Female</option>
                              <option value="Other">Other</option>
                            </Form.Select>
                          </Form.Group>
                        </Col>

                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Date of Birth</Form.Label>
                            <Form.Control
                              type="date"
                              name="dateOfBirth"
                              value={editForm.dateOfBirth}
                              onChange={editChangeHandler}
                            />
                          </Form.Group>
                        </Col>

                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Profile Image</Form.Label>
                            <Form.Control
                              type="file"
                              accept="image/*"
                              onChange={uploadAvatarHandler}
                            />
                          </Form.Group>
                        </Col>

                        <Col xs={12}>
                          <Form.Group className="mb-3">
                            <Form.Label>Address</Form.Label>
                            <Form.Control
                              as="textarea"
                              rows={3}
                              name="address"
                              value={editForm.address}
                              onChange={editChangeHandler}
                            />
                          </Form.Group>
                        </Col>
                      </Row>

                      <Button
                        type="submit"
                        className="elite-profile-primary-btn"
                        disabled={saving || uploading}
                      >
                        {saving ? (
                          <>
                            <Spinner
                              animation="border"
                              size="sm"
                              className="me-2"
                            />
                            Saving...
                          </>
                        ) : (
                          <>
                            <FaSave className="me-2" />
                            Save Profile
                          </>
                        )}
                      </Button>
                    </Form>
                  </Card.Body>
                </Card>

                <Card className="elite-profile-content-card mt-4">
                  <Card.Body>
                    <SectionHeader
                      icon={<FaLock />}
                      title="Change Password"
                      text="Keep your account secure with a strong password."
                    />

                    <Form onSubmit={changePasswordHandler}>
                      <Row>
                        <Col md={4}>
                          <Form.Group className="mb-3">
                            <Form.Label>Current Password</Form.Label>
                            <Form.Control
                              type={showPassword ? "text" : "password"}
                              value={passwordForm.currentPassword}
                              onChange={(e) =>
                                setPasswordForm((prev) => ({
                                  ...prev,
                                  currentPassword: e.target.value,
                                }))
                              }
                            />
                          </Form.Group>
                        </Col>

                        <Col md={4}>
                          <Form.Group className="mb-3">
                            <Form.Label>New Password</Form.Label>
                            <Form.Control
                              type={showPassword ? "text" : "password"}
                              value={passwordForm.newPassword}
                              onChange={(e) =>
                                setPasswordForm((prev) => ({
                                  ...prev,
                                  newPassword: e.target.value,
                                }))
                              }
                            />
                          </Form.Group>
                        </Col>

                        <Col md={4}>
                          <Form.Group className="mb-3">
                            <Form.Label>Confirm Password</Form.Label>
                            <Form.Control
                              type={showPassword ? "text" : "password"}
                              value={passwordForm.confirmPassword}
                              onChange={(e) =>
                                setPasswordForm((prev) => ({
                                  ...prev,
                                  confirmPassword: e.target.value,
                                }))
                              }
                            />
                          </Form.Group>
                        </Col>
                      </Row>

                      <div className="elite-profile-action-row">
                        <Button
                          type="submit"
                          className="elite-profile-primary-btn"
                          disabled={saving}
                        >
                          <FaLock className="me-2" />
                          Change Password
                        </Button>

                        <Button
                          type="button"
                          variant="outline-secondary"
                          className="elite-profile-pill-btn"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <FaEyeSlash className="me-2" />
                          ) : (
                            <FaEye className="me-2" />
                          )}
                          {showPassword ? "Hide" : "Show"}
                        </Button>
                      </div>
                    </Form>
                  </Card.Body>
                </Card>
              </Tab.Pane>

              <Tab.Pane eventKey="orders">
                <Card className="elite-profile-content-card">
                  <Card.Body>
                    <SectionHeader
                      icon={<FaShoppingBag />}
                      title="My Orders"
                      text="View recent purchases, invoices and order actions."
                    />

                    {orders.length === 0 ? (
                      <Message>No orders found.</Message>
                    ) : (
                      <Table
                        responsive
                        hover
                        className="elite-profile-table align-middle"
                      >
                        <thead>
                          <tr>
                            <th>Order</th>
                            <th>Date</th>
                            <th>Items</th>
                            <th>Total</th>
                            <th>Payment</th>
                            <th>Status</th>
                            <th>Actions</th>
                          </tr>
                        </thead>

                        <tbody>
                          {recentOrders.map((order) => (
                            <tr key={order._id}>
                              <td>
                                <strong>#{order._id.substring(0, 10)}...</strong>
                              </td>

                              <td>{formatDate(order.createdAt)}</td>

                              <td>{order.orderItems?.length || 0}</td>

                              <td>₹{formatPrice(order.totalPrice)}</td>

                              <td>
                                {order.isPaid ? (
                                  <Badge bg="success">Paid</Badge>
                                ) : (
                                  <Badge bg="danger">Not Paid</Badge>
                                )}
                              </td>

                              <td>
                                <Badge bg={getOrderBadge(order.orderStatus)}>
                                  {order.orderStatus || "Pending"}
                                </Badge>
                              </td>

                              <td>
                                <div className="elite-profile-table-actions">
                                  <Button
                                    as={Link}
                                    to={`/orders/${order._id}`}
                                    size="sm"
                                    variant="dark"
                                  >
                                    View
                                  </Button>

                                  <Button
                                    size="sm"
                                    variant="outline-success"
                                    onClick={() => downloadInvoiceHandler(order)}
                                  >
                                    <FaDownload />
                                  </Button>

                                  <Button
                                    size="sm"
                                    variant="outline-warning"
                                    onClick={() => reorderHandler(order)}
                                  >
                                    Reorder
                                  </Button>

                                  {order.orderStatus !== "Cancelled" &&
                                    !order.isDelivered && (
                                      <Button
                                        size="sm"
                                        variant="outline-danger"
                                        onClick={() => cancelOrderHandler(order._id)}
                                      >
                                        Cancel
                                      </Button>
                                    )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    )}

                    {orders.length > 5 && (
                      <Button
                        variant="outline-dark"
                        className="elite-profile-pill-btn mt-3"
                        onClick={() => navigate("/orders")}
                      >
                        View All Orders
                      </Button>
                    )}
                  </Card.Body>
                </Card>
              </Tab.Pane>

              <Tab.Pane eventKey="addresses">
                <Row className="g-4">
                  <Col lg={5}>
                    <Card className="elite-profile-content-card">
                      <Card.Body>
                        <SectionHeader
                          icon={<FaPlus />}
                          title={editingAddress ? "Edit Address" : "Add Address"}
                          text="Save delivery addresses for faster checkout."
                        />

                        <Form onSubmit={saveAddressHandler}>
                          <Form.Control
                            className="mb-3"
                            name="fullName"
                            placeholder="Full Name"
                            value={addressForm.fullName}
                            onChange={addressChangeHandler}
                          />

                          <Form.Control
                            className="mb-3"
                            name="phone"
                            placeholder="Phone"
                            value={addressForm.phone}
                            onChange={addressChangeHandler}
                          />

                          <Form.Control
                            className="mb-3"
                            name="addressLine"
                            placeholder="Address Line"
                            value={addressForm.addressLine}
                            onChange={addressChangeHandler}
                          />

                          <Row>
                            <Col md={6}>
                              <Form.Control
                                className="mb-3"
                                name="city"
                                placeholder="City"
                                value={addressForm.city}
                                onChange={addressChangeHandler}
                              />
                            </Col>

                            <Col md={6}>
                              <Form.Control
                                className="mb-3"
                                name="state"
                                placeholder="State"
                                value={addressForm.state}
                                onChange={addressChangeHandler}
                              />
                            </Col>
                          </Row>

                          <Row>
                            <Col md={6}>
                              <Form.Control
                                className="mb-3"
                                name="postalCode"
                                placeholder="Postal Code"
                                value={addressForm.postalCode}
                                onChange={addressChangeHandler}
                              />
                            </Col>

                            <Col md={6}>
                              <Form.Control
                                className="mb-3"
                                name="country"
                                placeholder="Country"
                                value={addressForm.country}
                                onChange={addressChangeHandler}
                              />
                            </Col>
                          </Row>

                          <Form.Select
                            className="mb-3"
                            name="type"
                            value={addressForm.type}
                            onChange={addressChangeHandler}
                          >
                            <option value="Home">Home</option>
                            <option value="Work">Work</option>
                            <option value="Other">Other</option>
                          </Form.Select>

                          <Form.Check
                            className="mb-3 elite-profile-check"
                            label="Set as default address"
                            name="isDefault"
                            checked={addressForm.isDefault}
                            onChange={addressChangeHandler}
                          />

                          <div className="elite-profile-action-row">
                            <Button
                              type="submit"
                              className="elite-profile-primary-btn"
                            >
                              <FaPlus className="me-2" />
                              {editingAddress ? "Update" : "Add"}
                            </Button>

                            {editingAddress && (
                              <Button
                                variant="outline-secondary"
                                className="elite-profile-pill-btn"
                                onClick={resetAddressForm}
                              >
                                Cancel
                              </Button>
                            )}
                          </div>
                        </Form>
                      </Card.Body>
                    </Card>
                  </Col>

                  <Col lg={7}>
                    <Card className="elite-profile-content-card">
                      <Card.Body>
                        <SectionHeader
                          icon={<FaLocationArrow />}
                          title="Saved Addresses"
                          text="Manage home, work and default delivery addresses."
                        />

                        {addresses.length === 0 ? (
                          <Message>No saved addresses.</Message>
                        ) : (
                          <Row className="g-3">
                            {addresses.map((address) => (
                              <Col md={6} key={address.id}>
                                <Card className="elite-address-card">
                                  <Card.Body>
                                    <div className="elite-address-top">
                                      <Badge bg="dark">
                                        {address.type === "Home" ? (
                                          <FaHome className="me-1" />
                                        ) : address.type === "Work" ? (
                                          <FaBriefcase className="me-1" />
                                        ) : (
                                          <FaMapMarkerAlt className="me-1" />
                                        )}
                                        {address.type}
                                      </Badge>

                                      {address.isDefault && (
                                        <Badge bg="success">Default</Badge>
                                      )}
                                    </div>

                                    <h5>{address.fullName}</h5>

                                    <p>{address.phone}</p>

                                    <span>
                                      {address.addressLine}, {address.city},{" "}
                                      {address.state}, {address.postalCode},{" "}
                                      {address.country}
                                    </span>

                                    <div className="elite-address-actions">
                                      <Button
                                        size="sm"
                                        variant="outline-dark"
                                        onClick={() => editAddressHandler(address)}
                                      >
                                        Edit
                                      </Button>

                                      <Button
                                        size="sm"
                                        variant="outline-success"
                                        onClick={() => setDefaultAddressHandler(address.id)}
                                      >
                                        Default
                                      </Button>

                                      <Button
                                        size="sm"
                                        variant="outline-danger"
                                        onClick={() => deleteAddressHandler(address.id)}
                                      >
                                        Delete
                                      </Button>
                                    </div>
                                  </Card.Body>
                                </Card>
                              </Col>
                            ))}
                          </Row>
                        )}
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </Tab.Pane>

              <Tab.Pane eventKey="wishlist">
                <Card className="elite-profile-content-card">
                  <Card.Body>
                    <SectionHeader
                      icon={<FaHeart />}
                      title="Wishlist"
                      text="Products you saved for later."
                    />

                    {!wishlistItems || wishlistItems.length === 0 ? (
                      <Message>Wishlist is empty.</Message>
                    ) : (
                      <Row className="g-4">
                        {wishlistItems.map((product) => (
                          <Col md={6} xl={4} key={product._id}>
                            <Card className="elite-profile-wishlist-card">
                              <Image
                                src={product.image || "/placeholder.svg"}
                              />

                              <Card.Body>
                                <h5>{product.name}</h5>

                                <p>{product.brand}</p>

                                <strong>₹{formatPrice(product.price)}</strong>

                                <div className="elite-profile-wishlist-actions">
                                  <Button
                                    as={Link}
                                    to={`/product/${product.slug || product._id}`}
                                    size="sm"
                                    variant="dark"
                                  >
                                    View
                                  </Button>

                                  <Button
                                    size="sm"
                                    variant="success"
                                    onClick={() => moveWishlistToCart(product)}
                                  >
                                    <FaShoppingCart />
                                  </Button>

                                  <Button
                                    size="sm"
                                    variant="outline-danger"
                                    onClick={() => {
                                      removeFromWishlist(product._id);
                                      toast.success("Removed from wishlist");
                                    }}
                                  >
                                    <FaTrash />
                                  </Button>
                                </div>
                              </Card.Body>
                            </Card>
                          </Col>
                        ))}
                      </Row>
                    )}
                  </Card.Body>
                </Card>
              </Tab.Pane>

              <Tab.Pane eventKey="reviews">
                <Card className="elite-profile-content-card">
                  <Card.Body>
                    <SectionHeader
                      icon={<FaStar />}
                      title="Reviews & Ratings"
                      text="Review delivered products from their product pages."
                    />

                    <Message>
                      Review management needs a backend endpoint for user-specific reviews.
                      Your product review creation already exists, so this UI is ready for future connection.
                    </Message>

                    {orders
                      .filter((order) => order.isDelivered)
                      .slice(0, 3)
                      .map((order) => (
                        <Alert
                          key={order._id}
                          variant="light"
                          className="elite-profile-alert border"
                        >
                          <strong>Delivered Order:</strong> {order._id}
                          <br />
                          Products in this order can be reviewed from the product details page.
                        </Alert>
                      ))}
                  </Card.Body>
                </Card>
              </Tab.Pane>

              <Tab.Pane eventKey="returns">
                <Card className="elite-profile-content-card">
                  <Card.Body>
                    <SectionHeader
                      icon={<FaUndo />}
                      title="Returns & Refunds"
                      text="Prepared UI for product return and refund tracking."
                    />

                    <Alert
                      variant="info"
                      className="elite-profile-alert"
                    >
                      Return request backend API is not added yet. This section is prepared for return reason, product condition, pickup status and refund tracking.
                    </Alert>

                    <Form>
                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Return Reason</Form.Label>
                            <Form.Select>
                              <option>Damaged product</option>
                              <option>Wrong product</option>
                              <option>Quality issue</option>
                              <option>Other</option>
                            </Form.Select>
                          </Form.Group>
                        </Col>

                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Product Condition</Form.Label>
                            <Form.Select>
                              <option>Unused</option>
                              <option>Opened</option>
                              <option>Damaged</option>
                            </Form.Select>
                          </Form.Group>
                        </Col>

                        <Col xs={12}>
                          <Form.Group className="mb-3">
                            <Form.Label>Description</Form.Label>
                            <Form.Control
                              as="textarea"
                              rows={4}
                              placeholder="Explain your return request"
                            />
                          </Form.Group>
                        </Col>
                      </Row>

                      <Button
                        className="elite-profile-primary-btn"
                        onClick={() =>
                          toast.info("Return backend API is not connected yet")
                        }
                      >
                        Request Return
                      </Button>
                    </Form>
                  </Card.Body>
                </Card>
              </Tab.Pane>

              <Tab.Pane eventKey="notifications">
                <Card className="elite-profile-content-card">
                  <Card.Body>
                    <div className="elite-section-head">
                      <div>
                        <h4>
                          <FaBell className="me-2" />
                          Notifications
                        </h4>

                        <p>Account alerts and shopping updates.</p>
                      </div>

                      <Button
                        size="sm"
                        variant="outline-danger"
                        className="elite-profile-pill-btn"
                        onClick={clearNotifications}
                      >
                        Clear All
                      </Button>
                    </div>

                    {notifications.length === 0 ? (
                      <Message>No notifications.</Message>
                    ) : (
                      <ListGroup className="elite-profile-notification-list">
                        {notifications.map((item) => (
                          <ListGroup.Item key={item.id}>
                            <div>
                              <Badge bg={item.read ? "secondary" : "primary"}>
                                {item.type}
                              </Badge>

                              <h6>{item.title}</h6>

                              <p>{item.message}</p>
                            </div>

                            <div className="elite-profile-notification-actions">
                              {!item.read && (
                                <Button
                                  size="sm"
                                  variant="outline-success"
                                  onClick={() => markNotificationRead(item.id)}
                                >
                                  <FaCheckCircle />
                                </Button>
                              )}

                              <Button
                                size="sm"
                                variant="outline-danger"
                                onClick={() => deleteNotification(item.id)}
                              >
                                <FaTrash />
                              </Button>
                            </div>
                          </ListGroup.Item>
                        ))}
                      </ListGroup>
                    )}
                  </Card.Body>
                </Card>
              </Tab.Pane>

              <Tab.Pane eventKey="wallet">
                <Row className="g-4">
                  <Col md={5}>
                    <Card className="elite-wallet-card">
                      <Card.Body>
                        <FaWallet />

                        <h4>Wallet Balance</h4>

                        <h2>₹0</h2>

                        <p>Refund credits and wallet money will appear here.</p>
                      </Card.Body>
                    </Card>
                  </Col>

                  <Col md={7}>
                    <Card className="elite-profile-content-card">
                      <Card.Body>
                        <SectionHeader
                          icon={<FaTicketAlt />}
                          title="Coupons"
                          text="Apply available coupons during checkout."
                        />

                        {coupons.map((coupon) => (
                          <Alert
                            key={coupon.code}
                            variant={coupon.status === "Available" ? "success" : "secondary"}
                            className="elite-coupon-card"
                          >
                            <div>
                              <strong>
                                <FaPercent className="me-2" />
                                {coupon.code}
                              </strong>

                              <p>{coupon.description}</p>
                            </div>

                            <Badge bg="dark">{coupon.discount}</Badge>
                          </Alert>
                        ))}
                      </Card.Body>
                    </Card>
                  </Col>

                  <Col xs={12}>
                    <Card className="elite-profile-content-card">
                      <Card.Body>
                        <SectionHeader
                          icon={<FaCreditCard />}
                          title="Wallet Transactions"
                          text="Refunds and wallet activity."
                        />

                        {walletTransactions.map((transaction) => (
                          <Alert
                            key={transaction.id}
                            variant="light"
                            className="elite-profile-alert border"
                          >
                            {transaction.title} - ₹{transaction.amount}
                          </Alert>
                        ))}
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </Tab.Pane>

              <Tab.Pane eventKey="security">
                <Card className="elite-profile-content-card">
                  <Card.Body>
                    <SectionHeader
                      icon={<FaShieldAlt />}
                      title="Security Settings"
                      text="Manage account status, login session and critical account actions."
                    />

                    <ListGroup className="elite-security-list">
                      <ListGroup.Item>
                        <div>
                          <strong>Account Verification</strong>
                          <p>Current verification status</p>
                        </div>

                        <Badge bg={profile?.isVerified ? "success" : "warning"}>
                          {profile?.isVerified ? "Verified" : "Not Verified"}
                        </Badge>
                      </ListGroup.Item>

                      <ListGroup.Item>
                        <div>
                          <strong>Recent Login Activity</strong>
                          <p>Current active session</p>
                        </div>

                        <Badge bg="success">Active Now</Badge>
                      </ListGroup.Item>

                      <ListGroup.Item>
                        <div>
                          <strong>Logout</strong>
                          <p>Logout from this device</p>
                        </div>

                        <Button
                          variant="outline-dark"
                          className="elite-profile-pill-btn"
                          onClick={logoutHandler}
                        >
                          <FaSignOutAlt className="me-2" />
                          Logout
                        </Button>
                      </ListGroup.Item>

                      <ListGroup.Item>
                        <div>
                          <strong className="text-danger">Delete Account</strong>
                          <p>This action cannot be undone</p>
                        </div>

                        <Button
                          variant="danger"
                          className="elite-profile-pill-btn"
                          onClick={() => setShowDeleteModal(true)}
                        >
                          Delete Account
                        </Button>
                      </ListGroup.Item>
                    </ListGroup>
                  </Card.Body>
                </Card>
              </Tab.Pane>
            </Tab.Content>
          </Tab.Container>
        </Col>
      </Row>

      <Modal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        centered
        className="elite-profile-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title className="text-danger">
            <FaTrash className="me-2" />
            Delete Account
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Alert
            variant="danger"
            className="elite-profile-alert"
          >
            <FaTimesCircle className="me-2" />
            This action cannot be undone.
          </Alert>

          <Form.Group>
            <Form.Label>Enter password to confirm</Form.Label>

            <Form.Control
              type="password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
            />
          </Form.Group>
        </Modal.Body>

        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowDeleteModal(false)}
          >
            Cancel
          </Button>

          <Button
            variant="danger"
            onClick={deleteAccountHandler}
          >
            Delete Account
          </Button>
        </Modal.Footer>
      </Modal>
    </motion.main>
  );
};

const ProfileStat = ({
  type,
  title,
  value,
  text,
  icon,
}) => (
  <Col md={6} xl={3}>
    <motion.div whileHover={{ y: -6 }}>
      <Card className={`elite-profile-stat-card ${type}`}>
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

const SectionHeader = ({
  icon,
  title,
  text,
}) => (
  <div className="elite-section-head">
    <div>
      <h4>
        {icon}
        {title}
      </h4>

      <p>{text}</p>
    </div>
  </div>
);

const InfoList = ({ items }) => (
  <ListGroup className="elite-profile-info-list">
    {items.map((item) => (
      <ListGroup.Item key={item.label}>
        <span>
          {item.icon}
          {item.label}
        </span>

        <strong>{item.value}</strong>
      </ListGroup.Item>
    ))}
  </ListGroup>
);

const MiniFeature = ({
  icon,
  title,
  text,
}) => (
  <div className="elite-profile-mini-feature">
    {icon}

    <div>
      <strong>{title}</strong>

      <span>{text}</span>
    </div>
  </div>
);

export default ProfilePage;