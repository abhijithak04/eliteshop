import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Row,
  Col,
  Card,
  Table,
  Badge,
  Button,
  ProgressBar,
  ListGroup,
  Image,
  Spinner,
} from "react-bootstrap";

import {
  FaBoxOpen,
  FaUsers,
  FaShoppingCart,
  FaRupeeSign,
  FaExclamationTriangle,
  FaStore,
  FaUserClock,
  FaStar,
  FaArrowRight,
  FaSyncAlt,
  FaEye,
  FaChartLine,
  FaShieldAlt,
  FaTruck,
  FaCrown,
  FaWarehouse,
  FaClipboardList,
  FaMoneyBillWave,
  FaBolt,
  FaUserCheck,
  FaBoxes,
  FaShoppingBag,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";

import {
  Link,
} from "react-router-dom";

import { motion } from "framer-motion";

import axios from "../../utils/axios";

import Loader from "../../components/Loader";
import Message from "../../components/Message";

import "../../styles/AdminDashboard.css";

const formatMoney = (value) => {
  return Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
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

const getOrderBadge = (status) => {
  switch (status) {
    case "Confirmed":
      return "primary";

    case "Processing":
    case "Packed":
      return "info";

    case "Shipped":
    case "Out For Delivery":
      return "warning";

    case "Delivered":
      return "success";

    case "Cancelled":
    case "Returned":
      return "danger";

    case "Pending":
    default:
      return "secondary";
  }
};

const AdminDashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);

  const fetchAllProducts = async () => {
    const productRes = await axios.get("/products");

    let allProducts =
      productRes.data.products ||
      productRes.data ||
      [];

    const totalPages = productRes.data.pages || 1;

    if (totalPages > 1) {
      const productRequests = [];

      for (
        let pageNumber = 2;
        pageNumber <= totalPages;
        pageNumber += 1
      ) {
        productRequests.push(
          axios.get(`/products?pageNumber=${pageNumber}`)
        );
      }

      const productResponses = await Promise.all(productRequests);

      productResponses.forEach((res) => {
        allProducts = [
          ...allProducts,
          ...(res.data.products || []),
        ];
      });
    }

    return Array.isArray(allProducts) ? allProducts : [];
  };

  const fetchDashboardData = async (silent = false) => {
    try {
      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const [
        allProducts,
        ordersRes,
        usersRes,
      ] = await Promise.all([
        fetchAllProducts(),
        axios.get("/orders"),
        axios.get("/users"),
      ]);

      setProducts(allProducts);
      setOrders(Array.isArray(ordersRes.data) ? ordersRes.data : []);
      setUsers(Array.isArray(usersRes.data) ? usersRes.data : []);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          error.message ||
          "Failed to load dashboard data"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const dashboard = useMemo(() => {
    const totalProducts = products.length;

    const totalCustomers = users.filter(
      (user) => user.role === "user"
    ).length;

    const totalSellers = users.filter(
      (user) => user.role === "seller"
    ).length;

    const totalAdmins = users.filter(
      (user) =>
        user.role === "admin" ||
        user.isAdmin
    ).length;

    const approvedSellers = users.filter(
      (user) =>
        user.role === "seller" &&
        user.sellerInfo?.isApproved
    ).length;

    const pendingSellers = users.filter(
      (user) =>
        user.role === "seller" &&
        !user.sellerInfo?.isApproved
    ).length;

    const totalOrders = orders.length;

    const paidOrders = orders.filter(
      (order) => order.isPaid
    ).length;

    const unpaidOrders = orders.filter(
      (order) => !order.isPaid
    ).length;

    const pendingOrders = orders.filter((order) =>
      ["Pending", "Confirmed", "Processing", "Packed"].includes(
        order.orderStatus
      )
    ).length;

    const shippedOrders = orders.filter((order) =>
      ["Shipped", "Out For Delivery"].includes(order.orderStatus)
    ).length;

    const deliveredOrders = orders.filter(
      (order) =>
        order.isDelivered ||
        order.orderStatus === "Delivered"
    ).length;

    const cancelledOrders = orders.filter(
      (order) => order.orderStatus === "Cancelled"
    ).length;

    const totalRevenue = orders
      .filter((order) => order.isPaid)
      .reduce(
        (acc, order) =>
          acc + Number(order.totalPrice || 0),
        0
      );

    const pendingRevenue = orders
      .filter((order) => !order.isPaid)
      .reduce(
        (acc, order) =>
          acc + Number(order.totalPrice || 0),
        0
      );

    const lowStockProducts = products.filter((product) => {
      const stock = Number(product.countInStock || 0);
      const threshold = Number(product.lowStockThreshold || 5);

      return stock > 0 && stock <= threshold;
    });

    const outOfStockProducts = products.filter(
      (product) => Number(product.countInStock || 0) === 0
    );

    const featuredProducts = products.filter(
      (product) => product.isFeatured
    );

    const activeProducts = products.filter(
      (product) => product.isActive !== false
    );

    const totalInventoryValue = products.reduce(
      (acc, product) =>
        acc +
        Number(product.price || 0) *
          Number(product.countInStock || 0),
      0
    );

    const recentOrders = [...orders]
      .sort(
        (a, b) =>
          new Date(b.createdAt || 0) -
          new Date(a.createdAt || 0)
      )
      .slice(0, 6);

    const latestProducts = [...products]
      .sort(
        (a, b) =>
          new Date(b.createdAt || 0) -
          new Date(a.createdAt || 0)
      )
      .slice(0, 6);

    const topProducts = [...products]
      .sort(
        (a, b) =>
          Number(b.rating || 0) -
          Number(a.rating || 0)
      )
      .slice(0, 5);

    const lowStockTop = [...lowStockProducts]
      .sort(
        (a, b) =>
          Number(a.countInStock || 0) -
          Number(b.countInStock || 0)
      )
      .slice(0, 5);

    const orderCompletionRate =
      totalOrders > 0
        ? Math.round((deliveredOrders / totalOrders) * 100)
        : 0;

    const paymentSuccessRate =
      totalOrders > 0
        ? Math.round((paidOrders / totalOrders) * 100)
        : 0;

    const sellerApprovalRate =
      totalSellers > 0
        ? Math.round((approvedSellers / totalSellers) * 100)
        : 0;

    const inventoryHealthRate =
      totalProducts > 0
        ? Math.round(
            ((totalProducts -
              lowStockProducts.length -
              outOfStockProducts.length) /
              totalProducts) *
              100
          )
        : 0;

    return {
      totalProducts,
      totalCustomers,
      totalSellers,
      totalAdmins,
      approvedSellers,
      pendingSellers,
      totalOrders,
      paidOrders,
      unpaidOrders,
      pendingOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
      totalRevenue,
      pendingRevenue,
      lowStockProducts,
      outOfStockProducts,
      featuredProducts,
      activeProducts,
      totalInventoryValue,
      recentOrders,
      latestProducts,
      topProducts,
      lowStockTop,
      orderCompletionRate,
      paymentSuccessRate,
      sellerApprovalRate,
      inventoryHealthRate,
    };
  }, [
    products,
    orders,
    users,
  ]);

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return (
      <main className="elite-admin-dashboard-page">
        <Card className="elite-admin-dashboard-error-card">
          <Card.Body>
            <Message variant="danger">
              {error}
            </Message>

            <Button
              variant="dark"
              className="rounded-pill fw-bold mt-3"
              onClick={() => fetchDashboardData()}
            >
              Retry Dashboard
            </Button>
          </Card.Body>
        </Card>
      </main>
    );
  }

  return (
    <main className="elite-admin-dashboard-page">
      <motion.section
        className="elite-admin-dashboard-hero"
        initial={{
          opacity: 0,
          y: 18,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.35,
        }}
      >
        <div className="elite-admin-dashboard-hero-orb elite-admin-dashboard-hero-orb-1" />
        <div className="elite-admin-dashboard-hero-orb elite-admin-dashboard-hero-orb-2" />

        <Row className="align-items-center g-4">
          <Col lg={8}>
            <Badge
              bg="warning"
              text="dark"
              className="elite-admin-dashboard-hero-badge"
            >
              <FaCrown className="me-2" />
              EliteShop Admin Command Center
            </Badge>

            <h1 className="elite-admin-dashboard-hero-title">
              Control Your Marketplace Like A Real Ecommerce Platform
            </h1>

            <p className="elite-admin-dashboard-hero-text">
              Monitor revenue, orders, sellers, users, inventory,
              product performance, seller approvals and urgent alerts
              from one modern admin dashboard.
            </p>

            <div className="elite-admin-dashboard-hero-actions">
              <Button
                as={Link}
                to="/admin/orders"
                variant="light"
              >
                <FaShoppingCart className="me-2" />
                Manage Orders
              </Button>

              <Button
                as={Link}
                to="/admin/products"
                variant="outline-light"
              >
                <FaBoxOpen className="me-2" />
                Manage Products
              </Button>

              <Button
                variant="warning"
                disabled={refreshing}
                onClick={() => fetchDashboardData(true)}
              >
                {refreshing ? (
                  <>
                    <Spinner
                      animation="border"
                      size="sm"
                      className="me-2"
                    />
                    Refreshing
                  </>
                ) : (
                  <>
                    <FaSyncAlt className="me-2" />
                    Refresh
                  </>
                )}
              </Button>
            </div>
          </Col>

          <Col lg={4}>
            <motion.div
              className="elite-admin-dashboard-hero-card"
              animate={{
                y: [0, -10, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
              }}
            >
              <div className="elite-admin-dashboard-hero-icon">
                <FaChartLine />
              </div>

              <h4>Business Pulse</h4>

              <p>
                ₹{formatMoney(dashboard.totalRevenue)} paid revenue
                from {dashboard.paidOrders} paid orders.
              </p>

              <div className="elite-admin-dashboard-hero-progress-row">
                <span>Payment Success</span>
                <strong>{dashboard.paymentSuccessRate}%</strong>
              </div>

              <ProgressBar
                now={dashboard.paymentSuccessRate}
                className="elite-admin-dashboard-progress"
              />
            </motion.div>
          </Col>
        </Row>
      </motion.section>

      <Row className="g-4 mb-4">
        <Col xl={3} md={6}>
          <motion.div whileHover={{ y: -7 }}>
            <Card className="elite-admin-dashboard-kpi-card gradient-revenue">
              <Card.Body>
                <div className="elite-admin-dashboard-kpi-icon">
                  <FaRupeeSign />
                </div>

                <p>Total Revenue</p>
                <h3>₹{formatMoney(dashboard.totalRevenue)}</h3>
                <span>Paid orders only</span>
              </Card.Body>
            </Card>
          </motion.div>
        </Col>

        <Col xl={3} md={6}>
          <motion.div whileHover={{ y: -7 }}>
            <Card className="elite-admin-dashboard-kpi-card gradient-orders">
              <Card.Body>
                <div className="elite-admin-dashboard-kpi-icon">
                  <FaShoppingCart />
                </div>

                <p>Total Orders</p>
                <h3>{dashboard.totalOrders}</h3>
                <span>{dashboard.pendingOrders} active orders</span>
              </Card.Body>
            </Card>
          </motion.div>
        </Col>

        <Col xl={3} md={6}>
          <motion.div whileHover={{ y: -7 }}>
            <Card className="elite-admin-dashboard-kpi-card gradient-products">
              <Card.Body>
                <div className="elite-admin-dashboard-kpi-icon">
                  <FaBoxOpen />
                </div>

                <p>Products</p>
                <h3>{dashboard.totalProducts}</h3>
                <span>{dashboard.lowStockProducts.length} low stock</span>
              </Card.Body>
            </Card>
          </motion.div>
        </Col>

        <Col xl={3} md={6}>
          <motion.div whileHover={{ y: -7 }}>
            <Card className="elite-admin-dashboard-kpi-card gradient-users">
              <Card.Body>
                <div className="elite-admin-dashboard-kpi-icon">
                  <FaUsers />
                </div>

                <p>Total Accounts</p>
                <h3>{users.length}</h3>
                <span>{dashboard.totalCustomers} customers</span>
              </Card.Body>
            </Card>
          </motion.div>
        </Col>
      </Row>

      <Row className="g-4 mb-4">
        <Col lg={4}>
          <Card className="elite-admin-dashboard-glass-card h-100">
            <Card.Body>
              <div className="elite-admin-dashboard-section-header">
                <div>
                  <h4>Order Performance</h4>
                  <p>Delivery and payment tracking.</p>
                </div>

                <FaTruck />
              </div>

              <div className="elite-admin-dashboard-metric-row">
                <span>Delivered Orders</span>
                <strong>{dashboard.orderCompletionRate}%</strong>
              </div>

              <ProgressBar
                now={dashboard.orderCompletionRate}
                variant="success"
                className="elite-admin-dashboard-progress mb-3"
              />

              <div className="elite-admin-dashboard-metric-row">
                <span>Payment Success</span>
                <strong>{dashboard.paymentSuccessRate}%</strong>
              </div>

              <ProgressBar
                now={dashboard.paymentSuccessRate}
                variant="primary"
                className="elite-admin-dashboard-progress mb-3"
              />

              <div className="elite-admin-dashboard-mini-grid">
                <div>
                  <h6>{dashboard.pendingOrders}</h6>
                  <span>Active</span>
                </div>

                <div>
                  <h6>{dashboard.shippedOrders}</h6>
                  <span>Shipping</span>
                </div>

                <div>
                  <h6>{dashboard.cancelledOrders}</h6>
                  <span>Cancelled</span>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className="elite-admin-dashboard-glass-card h-100">
            <Card.Body>
              <div className="elite-admin-dashboard-section-header">
                <div>
                  <h4>Seller Overview</h4>
                  <p>Marketplace seller approval flow.</p>
                </div>

                <FaStore />
              </div>

              <div className="elite-admin-dashboard-metric-row">
                <span>Total Sellers</span>
                <strong>{dashboard.totalSellers}</strong>
              </div>

              <div className="elite-admin-dashboard-metric-row text-success">
                <span>Approved Sellers</span>
                <strong>{dashboard.approvedSellers}</strong>
              </div>

              <div className="elite-admin-dashboard-metric-row text-warning">
                <span>Pending Approval</span>
                <strong>{dashboard.pendingSellers}</strong>
              </div>

              <ProgressBar
                now={dashboard.sellerApprovalRate}
                variant="success"
                className="elite-admin-dashboard-progress mt-3"
              />

              <Button
                as={Link}
                to="/admin/approvals"
                variant="outline-dark"
                className="rounded-pill fw-bold mt-3"
              >
                Review Seller Approvals
                <FaArrowRight className="ms-2" />
              </Button>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className="elite-admin-dashboard-glass-card h-100">
            <Card.Body>
              <div className="elite-admin-dashboard-section-header">
                <div>
                  <h4>Inventory Health</h4>
                  <p>Stock, value and featured products.</p>
                </div>

                <FaWarehouse />
              </div>

              <div className="elite-admin-dashboard-metric-row">
                <span>Inventory Value</span>
                <strong>₹{formatMoney(dashboard.totalInventoryValue)}</strong>
              </div>

              <div className="elite-admin-dashboard-metric-row text-danger">
                <span>Out Of Stock</span>
                <strong>{dashboard.outOfStockProducts.length}</strong>
              </div>

              <div className="elite-admin-dashboard-metric-row text-warning">
                <span>Low Stock</span>
                <strong>{dashboard.lowStockProducts.length}</strong>
              </div>

              <div className="elite-admin-dashboard-metric-row text-success">
                <span>Featured</span>
                <strong>{dashboard.featuredProducts.length}</strong>
              </div>

              <ProgressBar
                now={dashboard.inventoryHealthRate}
                variant="success"
                className="elite-admin-dashboard-progress mt-3"
              />

              <Button
                as={Link}
                to="/admin/low-stock"
                variant="outline-danger"
                className="rounded-pill fw-bold mt-3"
              >
                View Low Stock
                <FaArrowRight className="ms-2" />
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-4 mb-4">
        <Col md={3}>
          <motion.div whileHover={{ y: -6, scale: 1.01 }}>
            <Button
              as={Link}
              to="/admin/products"
              className="elite-admin-dashboard-action-btn action-products"
            >
              <FaBoxOpen />
              Manage Products
            </Button>
          </motion.div>
        </Col>

        <Col md={3}>
          <motion.div whileHover={{ y: -6, scale: 1.01 }}>
            <Button
              as={Link}
              to="/admin/orders"
              className="elite-admin-dashboard-action-btn action-orders"
            >
              <FaShoppingCart />
              Manage Orders
            </Button>
          </motion.div>
        </Col>

        <Col md={3}>
          <motion.div whileHover={{ y: -6, scale: 1.01 }}>
            <Button
              as={Link}
              to="/admin/users"
              className="elite-admin-dashboard-action-btn action-users"
            >
              <FaUsers />
              Manage Users
            </Button>
          </motion.div>
        </Col>

        <Col md={3}>
          <motion.div whileHover={{ y: -6, scale: 1.01 }}>
            <Button
              as={Link}
              to="/admin/sellers"
              className="elite-admin-dashboard-action-btn action-sellers"
            >
              <FaStore />
              Manage Sellers
            </Button>
          </motion.div>
        </Col>
      </Row>

      <Row className="g-4 mb-4">
        <Col xl={8}>
          <Card className="elite-admin-dashboard-business-card h-100">
            <Card.Body>
              <Row className="align-items-center g-4">
                <Col lg={8}>
                  <Badge bg="warning" text="dark" className="rounded-pill mb-3">
                    <FaBolt className="me-2" />
                    Today’s Admin Snapshot
                  </Badge>

                  <h3>EliteShop Business Control</h3>

                  <p>
                    Use this dashboard to keep the marketplace healthy:
                    process orders, approve verified sellers, fix low
                    stock, highlight featured products and monitor
                    revenue.
                  </p>

                  <Row className="g-3 mt-2">
                    <Col sm={4}>
                      <div className="elite-admin-dashboard-snapshot-box">
                        <FaMoneyBillWave />
                        <h5>₹{formatMoney(dashboard.pendingRevenue)}</h5>
                        <span>Pending Payment</span>
                      </div>
                    </Col>

                    <Col sm={4}>
                      <div className="elite-admin-dashboard-snapshot-box">
                        <FaUserCheck />
                        <h5>{dashboard.approvedSellers}</h5>
                        <span>Trusted Sellers</span>
                      </div>
                    </Col>

                    <Col sm={4}>
                      <div className="elite-admin-dashboard-snapshot-box">
                        <FaStar />
                        <h5>{dashboard.featuredProducts.length}</h5>
                        <span>Featured Items</span>
                      </div>
                    </Col>
                  </Row>
                </Col>

                <Col lg={4}>
                  <div className="elite-admin-dashboard-circle-stat">
                    <span>{dashboard.inventoryHealthRate}%</span>
                    <p>Inventory Health</p>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>

        <Col xl={4}>
          <Card className="elite-admin-dashboard-alert-card h-100">
            <Card.Body>
              <div className="elite-admin-dashboard-section-header">
                <div>
                  <h4>Admin Alerts</h4>
                  <p>High-priority things to fix.</p>
                </div>

                <FaExclamationTriangle />
              </div>

              <ListGroup variant="flush" className="elite-admin-dashboard-alert-list">
                <ListGroup.Item>
                  <span>
                    <FaExclamationTriangle className="text-danger me-2" />
                    Out Of Stock
                  </span>

                  <Badge bg="danger">
                    {dashboard.outOfStockProducts.length}
                  </Badge>
                </ListGroup.Item>

                <ListGroup.Item>
                  <span>
                    <FaExclamationTriangle className="text-warning me-2" />
                    Low Stock
                  </span>

                  <Badge bg="warning" text="dark">
                    {dashboard.lowStockProducts.length}
                  </Badge>
                </ListGroup.Item>

                <ListGroup.Item>
                  <span>
                    <FaUserClock className="text-warning me-2" />
                    Seller Requests
                  </span>

                  <Badge bg="warning" text="dark">
                    {dashboard.pendingSellers}
                  </Badge>
                </ListGroup.Item>

                <ListGroup.Item>
                  <span>
                    <FaShoppingCart className="text-primary me-2" />
                    Active Orders
                  </span>

                  <Badge bg="primary">
                    {dashboard.pendingOrders}
                  </Badge>
                </ListGroup.Item>
              </ListGroup>

              <div className="d-grid gap-2 mt-4">
                <Button
                  as={Link}
                  to="/admin/low-stock"
                  variant="outline-danger"
                >
                  Fix Inventory
                </Button>

                <Button
                  as={Link}
                  to="/admin/approvals"
                  variant="outline-warning"
                >
                  Seller Approvals
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-4">
        <Col xl={8}>
          <Card className="elite-admin-dashboard-table-card h-100">
            <Card.Body>
              <div className="elite-admin-dashboard-section-header">
                <div>
                  <h4>Recent Orders</h4>
                  <p>Latest customer purchases and payment status.</p>
                </div>

                <Button
                  as={Link}
                  to="/admin/orders"
                  variant="outline-dark"
                  className="rounded-pill fw-bold"
                >
                  View All
                </Button>
              </div>

              {dashboard.recentOrders.length === 0 ? (
                <Message>
                  No orders found
                </Message>
              ) : (
                <Table
                  responsive
                  hover
                  className="elite-admin-dashboard-table"
                >
                  <thead>
                    <tr>
                      <th>Order</th>
                      <th>User</th>
                      <th>Total</th>
                      <th>Payment</th>
                      <th>Status</th>
                      <th>View</th>
                    </tr>
                  </thead>

                  <tbody>
                    {dashboard.recentOrders.map((order) => (
                      <tr key={order._id}>
                        <td>
                          <strong>#{order._id?.slice(-10)}</strong>

                          <div className="small text-muted">
                            {formatDate(order.createdAt)}
                          </div>
                        </td>

                        <td>
                          {order.user?.name || "Deleted User"}
                        </td>

                        <td>
                          <strong>
                            ₹{formatMoney(order.totalPrice)}
                          </strong>
                        </td>

                        <td>
                          {order.isPaid ? (
                            <Badge bg="success">
                              Paid
                            </Badge>
                          ) : (
                            <Badge bg="danger">
                              Not Paid
                            </Badge>
                          )}
                        </td>

                        <td>
                          <Badge bg={getOrderBadge(order.orderStatus)}>
                            {order.orderStatus}
                          </Badge>
                        </td>

                        <td>
                          <Button
                            as={Link}
                            to={`/orders/${order._id}`}
                            variant="outline-dark"
                            size="sm"
                          >
                            <FaEye />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col xl={4}>
          <Card className="elite-admin-dashboard-table-card h-100">
            <Card.Body>
              <div className="elite-admin-dashboard-section-header">
                <div>
                  <h4>Low Stock Focus</h4>
                  <p>Products needing urgent restock.</p>
                </div>

                <Button
                  as={Link}
                  to="/admin/low-stock"
                  variant="outline-danger"
                  className="rounded-pill fw-bold"
                >
                  Fix
                </Button>
              </div>

              {dashboard.lowStockTop.length === 0 ? (
                <Message>
                  No low stock products
                </Message>
              ) : (
                <ListGroup
                  variant="flush"
                  className="elite-admin-dashboard-top-list"
                >
                  {dashboard.lowStockTop.map((product) => (
                    <ListGroup.Item key={product._id}>
                      <div className="elite-admin-dashboard-product-cell">
                        <Image
                          src={product.image || "/placeholder.svg"}
                          rounded
                          className="elite-admin-dashboard-product-img"
                        />

                        <div>
                          <strong>{product.name}</strong>

                          <span>{product.category}</span>
                        </div>
                      </div>

                      <Badge
                        bg={
                          Number(product.countInStock || 0) === 0
                            ? "danger"
                            : "warning"
                        }
                        text={
                          Number(product.countInStock || 0) === 0
                            ? undefined
                            : "dark"
                        }
                      >
                        {product.countInStock} left
                      </Badge>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col xl={7}>
          <Card className="elite-admin-dashboard-table-card">
            <Card.Body>
              <div className="elite-admin-dashboard-section-header">
                <div>
                  <h4>Latest Products</h4>
                  <p>Newest inventory added to EliteShop.</p>
                </div>

                <Button
                  as={Link}
                  to="/admin/products"
                  variant="outline-dark"
                  className="rounded-pill fw-bold"
                >
                  Manage
                </Button>
              </div>

              {dashboard.latestProducts.length === 0 ? (
                <Message>
                  No products found
                </Message>
              ) : (
                <Table
                  responsive
                  hover
                  className="elite-admin-dashboard-table"
                >
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Price</th>
                      <th>Stock</th>
                      <th>Category</th>
                    </tr>
                  </thead>

                  <tbody>
                    {dashboard.latestProducts.map((product) => (
                      <tr key={product._id}>
                        <td>
                          <div className="elite-admin-dashboard-product-cell">
                            <Image
                              src={product.image || "/placeholder.svg"}
                              rounded
                              className="elite-admin-dashboard-product-img"
                            />

                            <div>
                              <strong>{product.name}</strong>

                              <span>{product.brand}</span>
                            </div>
                          </div>
                        </td>

                        <td>
                          ₹{formatMoney(product.price)}
                        </td>

                        <td>
                          {Number(product.countInStock || 0) === 0 ? (
                            <Badge bg="danger">
                              Out
                            </Badge>
                          ) : Number(product.countInStock || 0) <=
                            Number(product.lowStockThreshold || 5) ? (
                            <Badge bg="warning" text="dark">
                              {product.countInStock}
                            </Badge>
                          ) : (
                            <Badge bg="success">
                              {product.countInStock}
                            </Badge>
                          )}
                        </td>

                        <td>
                          <Badge bg="secondary">
                            {product.category}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col xl={5}>
          <Card className="elite-admin-dashboard-table-card">
            <Card.Body>
              <div className="elite-admin-dashboard-section-header">
                <div>
                  <h4>Top Rated Products</h4>
                  <p>Best performing product ratings.</p>
                </div>
              </div>

              {dashboard.topProducts.length === 0 ? (
                <Message>
                  No products found
                </Message>
              ) : (
                <ListGroup
                  variant="flush"
                  className="elite-admin-dashboard-top-list"
                >
                  {dashboard.topProducts.map((product) => (
                    <ListGroup.Item key={product._id}>
                      <div className="elite-admin-dashboard-product-cell">
                        <Image
                          src={product.image || "/placeholder.svg"}
                          rounded
                          className="elite-admin-dashboard-product-img"
                        />

                        <div>
                          <strong>{product.name}</strong>

                          <span>{product.category}</span>
                        </div>
                      </div>

                      <Badge bg="warning" text="dark">
                        <FaStar className="me-1" />
                        {product.rating || 0}
                      </Badge>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </main>
  );
};

export default AdminDashboardPage;