"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Row,
  Col,
  Card,
  Image,
  Badge,
  Tabs,
  Tab,
  Form,
  Button,
  Table,
  ListGroup,
  Spinner,
  ProgressBar,
  Alert,
  InputGroup,
} from "react-bootstrap";

import {
  FaCamera,
  FaUser,
  FaUserShield,
  FaStore,
  FaBoxOpen,
  FaRupeeSign,
  FaCheck,
  FaTimes,
  FaEnvelope,
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaTruck,
  FaHeart,
  FaGift,
  FaWallet,
  FaBell,
  FaShieldAlt,
  FaEdit,
  FaSignOutAlt,
  FaShoppingBag,
  FaCalendarAlt,
  FaCrown,
  FaChartLine,
  FaDownload,
} from "react-icons/fa";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import { motion } from "framer-motion";

import { toast } from "react-toastify";

import Message from "../components/Message";
import Loader from "../components/Loader";

import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

import axios from "../utils/axios";

import "../styles/Profile.css";

const ProfilePage = () => {
  const navigate = useNavigate();

  const {
    userInfo,
    logout,
  } = useAuth();

  const {
    wishlistItems,
    cartItems,
  } = useCart();

  const [activeTab, setActiveTab] =
    useState("overview");

  const [profile, setProfile] =
    useState(null);

  const [orders, setOrders] =
    useState([]);

  const [loadingProfile, setLoadingProfile] =
    useState(true);

  const [loadingOrders, setLoadingOrders] =
    useState(true);

  const [loadingUpdateProfile, setLoadingUpdateProfile] =
    useState(false);

  const [uploading, setUploading] =
    useState(false);

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [formData, setFormData] =
    useState({
      name: "",
      email: "",
      phone: "",
      address: "",
      gender: "",
      dateOfBirth: "",
      avatar: "",
      password: "",
      confirmPassword: "",
      shopName: "",
      shopAddress: "",
      gstNumber: "",
      bankAccount: "",
    });

  // =====================================
  // LOAD PROFILE + ORDERS
  // =====================================

  const fetchProfile = async () => {
    try {
      setLoadingProfile(true);

      const { data } =
        await axios.get(
          "/users/profile"
        );

      setProfile(data);

      setFormData({
        name: data.name || "",
        email: data.email || "",
        phone: data.phone || "",
        address: data.address || "",
        gender: data.gender || "",
        dateOfBirth:
          data.dateOfBirth
            ? data.dateOfBirth.substring(
                0,
                10
              )
            : "",
        avatar:
          data.avatar ||
          "/images/default-avatar.png",
        password: "",
        confirmPassword: "",
        shopName:
          data.sellerInfo?.shopName ||
          "",
        shopAddress:
          data.sellerInfo?.shopAddress ||
          "",
        gstNumber:
          data.sellerInfo?.gstNumber ||
          "",
        bankAccount:
          data.sellerInfo?.bankAccount ||
          "",
      });
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message
      );
    } finally {
      setLoadingProfile(false);
    }
  };

  const fetchOrders = async () => {
    try {
      setLoadingOrders(true);

      const { data } =
        await axios.get(
          "/orders/myorders"
        );

      setOrders(data || []);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message
      );
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    if (!userInfo) {
      navigate(
        "/login?redirect=/profile"
      );
      return;
    }

    fetchProfile();
    fetchOrders();
  }, [userInfo, navigate]);

  // =====================================
  // STATS
  // =====================================

  const stats = useMemo(() => {
    const totalOrders =
      orders.length;

    const paidOrders =
      orders.filter(
        (order) => order.isPaid
      ).length;

    const deliveredOrders =
      orders.filter(
        (order) => order.isDelivered
      ).length;

    const pendingOrders =
      orders.filter(
        (order) =>
          !order.isDelivered &&
          order.orderStatus !==
            "Cancelled"
      ).length;

    const cancelledOrders =
      orders.filter(
        (order) =>
          order.orderStatus ===
          "Cancelled"
      ).length;

    const totalSpent =
      orders.reduce(
        (acc, order) =>
          acc +
          Number(
            order.totalPrice || 0
          ),
        0
      );

    return {
      totalOrders,
      paidOrders,
      deliveredOrders,
      pendingOrders,
      cancelledOrders,
      totalSpent,
      wishlistCount:
        wishlistItems?.length || 0,
      cartCount:
        cartItems?.length || 0,
    };
  }, [
    orders,
    wishlistItems,
    cartItems,
  ]);

  const profileCompletion = useMemo(() => {
    const fields = [
      formData.name,
      formData.email,
      formData.phone,
      formData.address,
      formData.avatar,
    ];

    const completed =
      fields.filter(Boolean).length;

    return Math.round(
      (completed / fields.length) *
        100
    );
  }, [formData]);

  const recentOrders =
    orders.slice(0, 5);

  // =====================================
  // HELPERS
  // =====================================

  const getRoleIcon = () => {
    if (
      userInfo?.role === "admin"
    ) {
      return <FaUserShield />;
    }

    if (
      userInfo?.role === "seller"
    ) {
      return <FaStore />;
    }

    return <FaUser />;
  };

  const getRoleBadge = () => {
    if (
      userInfo?.role === "admin"
    ) {
      return "danger";
    }

    if (
      userInfo?.role === "seller"
    ) {
      return "success";
    }

    return "primary";
  };

  const getOrderStatusBadge = (
    status
  ) => {
    switch (status) {
      case "Delivered":
        return "success";

      case "Cancelled":
        return "danger";

      case "Shipped":
      case "Out for Delivery":
        return "warning";

      case "Processing":
      case "Confirmed":
        return "info";

      default:
        return "secondary";
    }
  };

  const getAccountStatus = () => {
    if (
      userInfo?.role === "seller" &&
      profile?.sellerInfo &&
      profile?.sellerInfo
        ?.isApproved === false
    ) {
      return {
        text: "Seller Approval Pending",
        variant: "warning",
      };
    }

    return {
      text: "Active Account",
      variant: "success",
    };
  };

  // =====================================
  // CHANGE HANDLER
  // =====================================

  const changeHandler = (e) => {
    const {
      name,
      value,
    } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =====================================
  // IMAGE UPLOAD
  // =====================================

  const uploadFileHandler =
    async (e) => {
      const file =
        e.target.files[0];

      if (!file) return;

      const formDataImage =
        new FormData();

      formDataImage.append(
        "image",
        file
      );

      try {
        setUploading(true);

        const config = {
          headers: {
            "Content-Type":
              "multipart/form-data",
          },
        };

        const { data } =
          await axios.post(
            "/upload",
            formDataImage,
            config
          );

        setFormData((prev) => ({
          ...prev,
          avatar: data.image,
        }));

        toast.success(
          "Profile image uploaded"
        );
      } catch (error) {
        toast.error(
          error.response?.data?.message ||
            error.message
        );
      } finally {
        setUploading(false);
      }
    };

  // =====================================
  // UPDATE PROFILE
  // =====================================

  const submitHandler = async (e) => {
    e.preventDefault();

    if (
      formData.password &&
      formData.password !==
        formData.confirmPassword
    ) {
      toast.error(
        "Passwords do not match"
      );
      return;
    }

    if (
      formData.password &&
      formData.password.length < 8
    ) {
      toast.error(
        "Password must be at least 8 characters"
      );
      return;
    }

    try {
      setLoadingUpdateProfile(true);

      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        gender: formData.gender,
        dateOfBirth:
          formData.dateOfBirth,
        avatar: formData.avatar,
      };

      if (formData.password) {
        payload.password =
          formData.password;
      }

      if (
        userInfo?.role === "seller"
      ) {
        payload.shopName =
          formData.shopName;
        payload.shopAddress =
          formData.shopAddress;
        payload.gstNumber =
          formData.gstNumber;
        payload.bankAccount =
          formData.bankAccount;
      }

      await axios.put(
        "/users/profile",
        payload
      );

      const updatedUserInfo = {
        ...userInfo,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        avatar: formData.avatar,
      };

      localStorage.setItem(
        "userInfo",
        JSON.stringify(
          updatedUserInfo
        )
      );

      toast.success(
        "Profile updated successfully"
      );

      setFormData((prev) => ({
        ...prev,
        password: "",
        confirmPassword: "",
      }));

      fetchProfile();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message
      );
    } finally {
      setLoadingUpdateProfile(false);
    }
  };

  const logoutHandler = async () => {
    await logout();
  };

  if (loadingProfile) {
    return <Loader />;
  }

  const accountStatus =
    getAccountStatus();

  return (
    <motion.div
      className="profile-page"
      initial={{
        opacity: 0,
      }}
      animate={{
        opacity: 1,
      }}
      transition={{
        duration: 0.45,
      }}
    >
      {/* HERO */}

      <div className="profile-hero">
        <div className="profile-hero-glow profile-hero-glow-1"></div>
        <div className="profile-hero-glow profile-hero-glow-2"></div>

        <Row className="align-items-center g-4 position-relative">
          <Col lg={8}>
            <Badge
              bg="light"
              text="dark"
              className="px-3 py-2 mb-3"
            >
              EliteShop Account Center
            </Badge>

            <h1 className="profile-hero-title">
              Welcome back,{" "}
              <span>
                {formData.name ||
                  "Customer"}
              </span>
            </h1>

            <p className="profile-hero-text">
              Manage your profile, orders,
              wishlist, security, seller
              details and shopping activity
              from one colorful dashboard.
            </p>

            <div className="d-flex gap-2 flex-wrap">
              <Button
                variant="light"
                onClick={() =>
                  navigate("/products")
                }
              >
                <FaShoppingBag className="me-2" />
                Continue Shopping
              </Button>

              <Button
                variant="outline-light"
                onClick={() =>
                  navigate("/orders")
                }
              >
                <FaTruck className="me-2" />
                Track Orders
              </Button>
            </div>
          </Col>

          <Col lg={4}>
            <Card className="profile-hero-mini-card">
              <div className="d-flex align-items-center gap-3">
                <div className="profile-mini-icon">
                  <FaCrown />
                </div>

                <div>
                  <h5 className="mb-1">
                    Premium Member
                  </h5>
                  <p className="mb-0">
                    Profile completion{" "}
                    {profileCompletion}%
                  </p>
                </div>
              </div>

              <ProgressBar
                now={profileCompletion}
                className="mt-3 profile-progress"
              />
            </Card>
          </Col>
        </Row>
      </div>

      <Row className="g-4">
        {/* LEFT PROFILE CARD */}

        <Col lg={4}>
          <motion.div
            initial={{
              opacity: 0,
              x: -25,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            transition={{
              duration: 0.4,
            }}
          >
            <Card className="profile-card-main">
              <div className="profile-cover"></div>

              <Card.Body className="text-center profile-card-body">
                <div className="profile-avatar-wrap">
                  <Image
                    src={
                      formData.avatar ||
                      "/images/default-avatar.png"
                    }
                    roundedCircle
                    className="profile-avatar"
                  />

                  <label
                    htmlFor="avatarUpload"
                    className="profile-camera-btn"
                  >
                    {uploading ? (
                      <Spinner
                        animation="border"
                        size="sm"
                      />
                    ) : (
                      <FaCamera />
                    )}
                  </label>

                  <input
                    id="avatarUpload"
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={
                      uploadFileHandler
                    }
                  />
                </div>

                <h3 className="fw-bold mt-3 mb-1">
                  {formData.name}
                </h3>

                <p className="text-muted mb-2">
                  {formData.email}
                </p>

                <div className="d-flex justify-content-center gap-2 flex-wrap mb-3">
                  <Badge
                    bg={getRoleBadge()}
                    className="profile-role-badge"
                  >
                    {getRoleIcon()}{" "}
                    {userInfo?.role?.toUpperCase() ||
                      "USER"}
                  </Badge>

                  <Badge
                    bg={
                      accountStatus.variant
                    }
                    className="profile-role-badge"
                  >
                    {
                      accountStatus.text
                    }
                  </Badge>
                </div>

                <ListGroup
                  variant="flush"
                  className="profile-info-list text-start"
                >
                  <ListGroup.Item>
                    <FaPhoneAlt className="me-2 text-primary" />
                    <strong>Phone:</strong>{" "}
                    {formData.phone ||
                      "Not added"}
                  </ListGroup.Item>

                  <ListGroup.Item>
                    <FaMapMarkerAlt className="me-2 text-danger" />
                    <strong>Address:</strong>{" "}
                    {formData.address ||
                      "Not added"}
                  </ListGroup.Item>

                  <ListGroup.Item>
                    <FaCalendarAlt className="me-2 text-success" />
                    <strong>Joined:</strong>{" "}
                    {profile?.createdAt
                      ? new Date(
                          profile.createdAt
                        ).toLocaleDateString()
                      : "Recently"}
                  </ListGroup.Item>
                </ListGroup>

                <div className="d-grid gap-2 mt-4">
                  <Button
                    variant="dark"
                    onClick={() =>
                      setActiveTab("edit")
                    }
                  >
                    <FaEdit className="me-2" />
                    Edit Profile
                  </Button>

                  <Button
                    variant="outline-danger"
                    onClick={logoutHandler}
                  >
                    <FaSignOutAlt className="me-2" />
                    Logout
                  </Button>
                </div>
              </Card.Body>
            </Card>

            <Row className="g-3 mt-1">
              <Col xs={6}>
                <Card className="profile-side-stat stat-purple">
                  <FaBoxOpen />
                  <h4>
                    {stats.totalOrders}
                  </h4>
                  <span>Orders</span>
                </Card>
              </Col>

              <Col xs={6}>
                <Card className="profile-side-stat stat-green">
                  <FaRupeeSign />
                  <h4>
                    ₹
                    {stats.totalSpent.toLocaleString()}
                  </h4>
                  <span>Spent</span>
                </Card>
              </Col>

              <Col xs={6}>
                <Card className="profile-side-stat stat-pink">
                  <FaHeart />
                  <h4>
                    {stats.wishlistCount}
                  </h4>
                  <span>Wishlist</span>
                </Card>
              </Col>

              <Col xs={6}>
                <Card className="profile-side-stat stat-orange">
                  <FaTruck />
                  <h4>
                    {stats.deliveredOrders}
                  </h4>
                  <span>Delivered</span>
                </Card>
              </Col>
            </Row>
          </motion.div>
        </Col>

        {/* RIGHT DASHBOARD */}

        <Col lg={8}>
          <motion.div
            initial={{
              opacity: 0,
              x: 25,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            transition={{
              duration: 0.4,
            }}
          >
            {/* TOP STATS */}

            <Row className="g-3 mb-4">
              <Col md={6} xl={3}>
                <Card className="profile-stat-card gradient-blue">
                  <FaBoxOpen />
                  <h3>
                    {stats.totalOrders}
                  </h3>
                  <p>Total Orders</p>
                </Card>
              </Col>

              <Col md={6} xl={3}>
                <Card className="profile-stat-card gradient-green">
                  <FaTruck />
                  <h3>
                    {
                      stats.deliveredOrders
                    }
                  </h3>
                  <p>Delivered</p>
                </Card>
              </Col>

              <Col md={6} xl={3}>
                <Card className="profile-stat-card gradient-pink">
                  <FaHeart />
                  <h3>
                    {stats.wishlistCount}
                  </h3>
                  <p>Wishlist</p>
                </Card>
              </Col>

              <Col md={6} xl={3}>
                <Card className="profile-stat-card gradient-orange">
                  <FaWallet />
                  <h3>
                    ₹0
                  </h3>
                  <p>Wallet</p>
                </Card>
              </Col>
            </Row>

            <Card className="profile-dashboard-card">
              <Card.Body className="p-3 p-md-4">
                <Tabs
                  activeKey={activeTab}
                  onSelect={(key) =>
                    setActiveTab(key)
                  }
                  className="profile-tabs mb-4"
                >
                  {/* OVERVIEW */}

                  <Tab
                    eventKey="overview"
                    title="Overview"
                  >
                    <Row className="g-4">
                      <Col md={7}>
                        <Card className="profile-inner-card h-100">
                          <Card.Body>
                            <h5 className="fw-bold mb-3">
                              Shopping Summary
                            </h5>

                            <ListGroup variant="flush">
                              <ListGroup.Item className="d-flex justify-content-between">
                                <span>
                                  Total Orders
                                </span>
                                <strong>
                                  {
                                    stats.totalOrders
                                  }
                                </strong>
                              </ListGroup.Item>

                              <ListGroup.Item className="d-flex justify-content-between">
                                <span>
                                  Pending Orders
                                </span>
                                <strong>
                                  {
                                    stats.pendingOrders
                                  }
                                </strong>
                              </ListGroup.Item>

                              <ListGroup.Item className="d-flex justify-content-between">
                                <span>
                                  Delivered Orders
                                </span>
                                <strong>
                                  {
                                    stats.deliveredOrders
                                  }
                                </strong>
                              </ListGroup.Item>

                              <ListGroup.Item className="d-flex justify-content-between">
                                <span>
                                  Cancelled Orders
                                </span>
                                <strong>
                                  {
                                    stats.cancelledOrders
                                  }
                                </strong>
                              </ListGroup.Item>

                              <ListGroup.Item className="d-flex justify-content-between">
                                <span>
                                  Cart Items
                                </span>
                                <strong>
                                  {
                                    stats.cartCount
                                  }
                                </strong>
                              </ListGroup.Item>
                            </ListGroup>
                          </Card.Body>
                        </Card>
                      </Col>

                      <Col md={5}>
                        <Card className="profile-offer-card h-100">
                          <Card.Body>
                            <FaGift className="profile-offer-icon" />

                            <h5 className="fw-bold">
                              Exclusive Offer
                            </h5>

                            <p>
                              Use coupon{" "}
                              <strong>
                                WELCOME10
                              </strong>{" "}
                              on your next order.
                            </p>

                            <Button
                              variant="light"
                              onClick={() =>
                                navigate(
                                  "/products"
                                )
                              }
                            >
                              Shop Deals
                            </Button>
                          </Card.Body>
                        </Card>
                      </Col>

                      <Col xs={12}>
                        <Card className="profile-inner-card">
                          <Card.Body>
                            <div className="d-flex justify-content-between align-items-center mb-3">
                              <h5 className="fw-bold mb-0">
                                Recent Orders
                              </h5>

                              <Button
                                size="sm"
                                variant="outline-dark"
                                onClick={() =>
                                  navigate(
                                    "/orders"
                                  )
                                }
                              >
                                View All
                              </Button>
                            </div>

                            {loadingOrders ? (
                              <Loader />
                            ) : recentOrders.length ===
                              0 ? (
                              <Message>
                                No orders found.
                              </Message>
                            ) : (
                              <div className="table-responsive">
                                <Table
                                  hover
                                  className="align-middle mb-0"
                                >
                                  <thead>
                                    <tr>
                                      <th>
                                        Order
                                      </th>
                                      <th>
                                        Date
                                      </th>
                                      <th>
                                        Total
                                      </th>
                                      <th>
                                        Status
                                      </th>
                                      <th></th>
                                    </tr>
                                  </thead>

                                  <tbody>
                                    {recentOrders.map(
                                      (
                                        order
                                      ) => (
                                        <tr
                                          key={
                                            order._id
                                          }
                                        >
                                          <td>
                                            #
                                            {order._id.substring(
                                              0,
                                              8
                                            )}
                                          </td>

                                          <td>
                                            {order.createdAt?.substring(
                                              0,
                                              10
                                            )}
                                          </td>

                                          <td>
                                            ₹
                                            {
                                              order.totalPrice
                                            }
                                          </td>

                                          <td>
                                            <Badge
                                              bg={getOrderStatusBadge(
                                                order.orderStatus ||
                                                  "Pending"
                                              )}
                                            >
                                              {order.orderStatus ||
                                                "Pending"}
                                            </Badge>
                                          </td>

                                          <td>
                                            <Button
                                              as={
                                                Link
                                              }
                                              to={`/orders/${order._id}`}
                                              size="sm"
                                              variant="dark"
                                            >
                                              Details
                                            </Button>
                                          </td>
                                        </tr>
                                      )
                                    )}
                                  </tbody>
                                </Table>
                              </div>
                            )}
                          </Card.Body>
                        </Card>
                      </Col>
                    </Row>
                  </Tab>

                  {/* EDIT PROFILE */}

                  <Tab
                    eventKey="edit"
                    title="Edit Profile"
                  >
                    <Form onSubmit={submitHandler}>
                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>
                              Full Name
                            </Form.Label>

                            <InputGroup>
                              <InputGroup.Text>
                                <FaUser />
                              </InputGroup.Text>

                              <Form.Control
                                name="name"
                                value={
                                  formData.name
                                }
                                onChange={
                                  changeHandler
                                }
                                required
                              />
                            </InputGroup>
                          </Form.Group>
                        </Col>

                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>
                              Email
                            </Form.Label>

                            <InputGroup>
                              <InputGroup.Text>
                                <FaEnvelope />
                              </InputGroup.Text>

                              <Form.Control
                                name="email"
                                type="email"
                                value={
                                  formData.email
                                }
                                onChange={
                                  changeHandler
                                }
                                required
                              />
                            </InputGroup>
                          </Form.Group>
                        </Col>

                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>
                              Phone
                            </Form.Label>

                            <InputGroup>
                              <InputGroup.Text>
                                <FaPhoneAlt />
                              </InputGroup.Text>

                              <Form.Control
                                name="phone"
                                value={
                                  formData.phone
                                }
                                onChange={
                                  changeHandler
                                }
                              />
                            </InputGroup>
                          </Form.Group>
                        </Col>

                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>
                              Gender
                            </Form.Label>

                            <Form.Select
                              name="gender"
                              value={
                                formData.gender
                              }
                              onChange={
                                changeHandler
                              }
                            >
                              <option value="">
                                Select gender
                              </option>
                              <option value="male">
                                Male
                              </option>
                              <option value="female">
                                Female
                              </option>
                              <option value="other">
                                Other
                              </option>
                              <option value="prefer-not-to-say">
                                Prefer not to say
                              </option>
                            </Form.Select>
                          </Form.Group>
                        </Col>

                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>
                              Date of Birth
                            </Form.Label>

                            <Form.Control
                              name="dateOfBirth"
                              type="date"
                              value={
                                formData.dateOfBirth
                              }
                              onChange={
                                changeHandler
                              }
                            />
                          </Form.Group>
                        </Col>

                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>
                              Profile Image URL
                            </Form.Label>

                            <Form.Control
                              name="avatar"
                              value={
                                formData.avatar
                              }
                              onChange={
                                changeHandler
                              }
                            />
                          </Form.Group>
                        </Col>

                        <Col xs={12}>
                          <Form.Group className="mb-3">
                            <Form.Label>
                              Address
                            </Form.Label>

                            <Form.Control
                              as="textarea"
                              rows={3}
                              name="address"
                              value={
                                formData.address
                              }
                              onChange={
                                changeHandler
                              }
                            />
                          </Form.Group>
                        </Col>
                      </Row>

                      {userInfo?.role ===
                        "seller" && (
                        <div className="seller-box mt-3">
                          <h5 className="fw-bold mb-3">
                            <FaStore className="me-2" />
                            Seller Profile
                          </h5>

                          <Row>
                            <Col md={6}>
                              <Form.Group className="mb-3">
                                <Form.Label>
                                  Shop Name
                                </Form.Label>

                                <Form.Control
                                  name="shopName"
                                  value={
                                    formData.shopName
                                  }
                                  onChange={
                                    changeHandler
                                  }
                                />
                              </Form.Group>
                            </Col>

                            <Col md={6}>
                              <Form.Group className="mb-3">
                                <Form.Label>
                                  GST Number
                                </Form.Label>

                                <Form.Control
                                  name="gstNumber"
                                  value={
                                    formData.gstNumber
                                  }
                                  onChange={
                                    changeHandler
                                  }
                                />
                              </Form.Group>
                            </Col>

                            <Col xs={12}>
                              <Form.Group className="mb-3">
                                <Form.Label>
                                  Shop Address
                                </Form.Label>

                                <Form.Control
                                  as="textarea"
                                  rows={2}
                                  name="shopAddress"
                                  value={
                                    formData.shopAddress
                                  }
                                  onChange={
                                    changeHandler
                                  }
                                />
                              </Form.Group>
                            </Col>

                            <Col xs={12}>
                              <Form.Group className="mb-3">
                                <Form.Label>
                                  Bank Account
                                </Form.Label>

                                <Form.Control
                                  name="bankAccount"
                                  value={
                                    formData.bankAccount
                                  }
                                  onChange={
                                    changeHandler
                                  }
                                />
                              </Form.Group>
                            </Col>
                          </Row>
                        </div>
                      )}

                      <div className="security-box mt-4">
                        <h5 className="fw-bold mb-3">
                          <FaLock className="me-2" />
                          Change Password
                        </h5>

                        <Row>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>
                                New Password
                              </Form.Label>

                              <InputGroup>
                                <Form.Control
                                  name="password"
                                  type={
                                    showPassword
                                      ? "text"
                                      : "password"
                                  }
                                  value={
                                    formData.password
                                  }
                                  placeholder="Leave empty to keep current"
                                  onChange={
                                    changeHandler
                                  }
                                />

                                <Button
                                  type="button"
                                  variant="outline-secondary"
                                  onClick={() =>
                                    setShowPassword(
                                      (prev) =>
                                        !prev
                                    )
                                  }
                                >
                                  {showPassword ? (
                                    <FaEyeSlash />
                                  ) : (
                                    <FaEye />
                                  )}
                                </Button>
                              </InputGroup>
                            </Form.Group>
                          </Col>

                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>
                                Confirm Password
                              </Form.Label>

                              <InputGroup>
                                <Form.Control
                                  name="confirmPassword"
                                  type={
                                    showConfirmPassword
                                      ? "text"
                                      : "password"
                                  }
                                  value={
                                    formData.confirmPassword
                                  }
                                  onChange={
                                    changeHandler
                                  }
                                />

                                <Button
                                  type="button"
                                  variant="outline-secondary"
                                  onClick={() =>
                                    setShowConfirmPassword(
                                      (prev) =>
                                        !prev
                                    )
                                  }
                                >
                                  {showConfirmPassword ? (
                                    <FaEyeSlash />
                                  ) : (
                                    <FaEye />
                                  )}
                                </Button>
                              </InputGroup>
                            </Form.Group>
                          </Col>
                        </Row>
                      </div>

                      <Button
                        type="submit"
                        className="profile-save-btn mt-3"
                        disabled={
                          loadingUpdateProfile
                        }
                      >
                        {loadingUpdateProfile ? (
                          <>
                            <Spinner
                              animation="border"
                              size="sm"
                              className="me-2"
                            />
                            Saving...
                          </>
                        ) : (
                          "Save Profile"
                        )}
                      </Button>
                    </Form>
                  </Tab>

                  {/* ORDERS */}

                  <Tab
                    eventKey="orders"
                    title="Orders"
                  >
                    <div className="d-flex gap-2 flex-wrap mb-3">
                      <Badge bg="primary">
                        Total:{" "}
                        {stats.totalOrders}
                      </Badge>
                      <Badge bg="success">
                        Paid:{" "}
                        {stats.paidOrders}
                      </Badge>
                      <Badge bg="info">
                        Delivered:{" "}
                        {
                          stats.deliveredOrders
                        }
                      </Badge>
                    </div>

                    {loadingOrders ? (
                      <Loader />
                    ) : orders.length === 0 ? (
                      <Message>
                        No orders found.
                      </Message>
                    ) : (
                      <div className="table-responsive">
                        <Table
                          hover
                          className="align-middle"
                        >
                          <thead>
                            <tr>
                              <th>ID</th>
                              <th>Date</th>
                              <th>Total</th>
                              <th>Paid</th>
                              <th>
                                Delivered
                              </th>
                              <th>Status</th>
                              <th></th>
                            </tr>
                          </thead>

                          <tbody>
                            {orders.map(
                              (order) => (
                                <tr
                                  key={
                                    order._id
                                  }
                                >
                                  <td>
                                    #
                                    {order._id.substring(
                                      0,
                                      8
                                    )}
                                  </td>

                                  <td>
                                    {order.createdAt?.substring(
                                      0,
                                      10
                                    )}
                                  </td>

                                  <td>
                                    ₹
                                    {
                                      order.totalPrice
                                    }
                                  </td>

                                  <td>
                                    {order.isPaid ? (
                                      <FaCheck className="text-success" />
                                    ) : (
                                      <FaTimes className="text-danger" />
                                    )}
                                  </td>

                                  <td>
                                    {order.isDelivered ? (
                                      <FaCheck className="text-success" />
                                    ) : (
                                      <FaTimes className="text-danger" />
                                    )}
                                  </td>

                                  <td>
                                    <Badge
                                      bg={getOrderStatusBadge(
                                        order.orderStatus ||
                                          "Pending"
                                      )}
                                    >
                                      {order.orderStatus ||
                                        "Pending"}
                                    </Badge>
                                  </td>

                                  <td>
                                    <Button
                                      as={Link}
                                      to={`/orders/${order._id}`}
                                      size="sm"
                                      variant="dark"
                                    >
                                      Details
                                    </Button>
                                  </td>
                                </tr>
                              )
                            )}
                          </tbody>
                        </Table>
                      </div>
                    )}
                  </Tab>

                  {/* WALLET */}

                  <Tab
                    eventKey="wallet"
                    title="Wallet & Offers"
                  >
                    <Row className="g-4">
                      <Col md={6}>
                        <Card className="wallet-card">
                          <Card.Body>
                            <FaWallet className="wallet-icon" />
                            <h5 className="fw-bold">
                              Wallet Balance
                            </h5>
                            <h2>₹0</h2>
                            <p>
                              Refund credits and wallet
                              rewards will appear
                              here.
                            </p>
                          </Card.Body>
                        </Card>
                      </Col>

                      <Col md={6}>
                        <Card className="coupon-card">
                          <Card.Body>
                            <FaGift className="wallet-icon" />
                            <h5 className="fw-bold">
                              Available Coupon
                            </h5>
                            <h2>
                              WELCOME10
                            </h2>
                            <p>
                              Save more on your
                              next order.
                            </p>
                          </Card.Body>
                        </Card>
                      </Col>
                    </Row>
                  </Tab>

                  {/* SECURITY */}

                  <Tab
                    eventKey="security"
                    title="Security"
                  >
                    <Row className="g-4">
                      <Col md={6}>
                        <Alert variant="success">
                          <FaShieldAlt className="me-2" />
                          JWT login session is
                          active.
                        </Alert>
                      </Col>

                      <Col md={6}>
                        <Alert variant="info">
                          <FaBell className="me-2" />
                          Security alerts will
                          appear in your
                          notifications.
                        </Alert>
                      </Col>

                      <Col xs={12}>
                        <Card className="profile-inner-card">
                          <Card.Body>
                            <h5 className="fw-bold">
                              Account Safety
                            </h5>
                            <p className="text-muted">
                              Use a strong
                              password, never
                              share OTPs or
                              secrets, and logout
                              from shared devices.
                            </p>

                            <Button
                              variant="outline-danger"
                              onClick={
                                logoutHandler
                              }
                            >
                              <FaSignOutAlt className="me-2" />
                              Logout Securely
                            </Button>
                          </Card.Body>
                        </Card>
                      </Col>
                    </Row>
                  </Tab>
                </Tabs>
              </Card.Body>
            </Card>
          </motion.div>
        </Col>
      </Row>
    </motion.div>
  );
};

export default ProfilePage;