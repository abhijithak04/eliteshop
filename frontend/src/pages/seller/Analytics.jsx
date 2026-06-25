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
  Alert,
  Form,
  Spinner,
} from "react-bootstrap";

import {
  FaBoxOpen,
  FaChartLine,
  FaClipboardList,
  FaEye,
  FaFire,
  FaRupeeSign,
  FaShoppingCart,
  FaStar,
  FaStore,
  FaSyncAlt,
  FaTruck,
  FaExclamationTriangle,
  FaPlus,
  FaEdit,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaWarehouse,
  FaBolt,
  FaGem,
  FaMoneyBillWave,
  FaChartPie,
  FaArrowUp,
  FaShieldAlt,
  FaTags,
  FaCrown,
  FaFilter,
} from "react-icons/fa";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import { motion } from "framer-motion";
import { toast } from "react-toastify";

import Loader from "../../components/Loader";
import Message from "../../components/Message";

import api from "../../utils/axios";

import "../../styles/SellerAnalytics.css";

const formatPrice = (amount) => {
  return Number(amount || 0).toLocaleString("en-IN", {
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

const getOrderBadge = (status = "Pending") => {
  switch (status) {
    case "Confirmed":
      return "primary";

    case "Processing":
    case "Packed":
      return "info";

    case "Shipped":
    case "Out for Delivery":
    case "Out For Delivery":
      return "warning";

    case "Delivered":
      return "success";

    case "Cancelled":
      return "danger";

    case "Returned":
    case "Refunded":
    case "Refund Processing":
      return "dark";

    default:
      return "secondary";
  }
};

const SellerAnalytics = () => {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  const [orderFilter, setOrderFilter] = useState("all");
  const [productMetric, setProductMetric] = useState("views");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchSellerData = async (silent = false) => {
    try {
      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const [productsRes, ordersRes] = await Promise.all([
        api.get("/products/seller/products"),
        api.get("/orders/seller"),
      ]);

      setProducts(
        Array.isArray(productsRes.data)
          ? productsRes.data
          : []
      );

      setOrders(
        Array.isArray(ordersRes.data)
          ? ordersRes.data
          : []
      );
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to load seller analytics";

      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSellerData();
  }, []);

  const sellerProductIds = useMemo(() => {
    return new Set(products.map((product) => product._id));
  }, [products]);

  const getSellerOrderTotal = (order) => {
    const items = Array.isArray(order.orderItems)
      ? order.orderItems
      : [];

    const sellerTotal = items
      .filter((item) => {
        const productId =
          typeof item.product === "object"
            ? item.product?._id
            : item.product;

        return sellerProductIds.has(productId);
      })
      .reduce((sum, item) => {
        const qty = Number(item.qty || item.quantity || 0);
        const price = Number(item.price || 0);

        return sum + price * qty;
      }, 0);

    return sellerTotal || Number(order.totalPrice || 0);
  };

  const analytics = useMemo(() => {
    const totalProducts = products.length;

    const activeProducts = products.filter(
      (product) => product.isActive !== false
    ).length;

    const inactiveProducts = products.filter(
      (product) => product.isActive === false
    ).length;

    const featuredProducts = products.filter(
      (product) => product.isFeatured
    ).length;

    const lowStockProducts = products.filter((product) => {
      const stock = Number(product.countInStock || 0);
      const threshold = Number(product.lowStockThreshold || 5);

      return stock <= threshold;
    });

    const outOfStockProducts = products.filter(
      (product) => Number(product.countInStock || 0) === 0
    );

    const totalStock = products.reduce(
      (acc, product) =>
        acc + Number(product.countInStock || 0),
      0
    );

    const inventoryValue = products.reduce(
      (acc, product) =>
        acc +
        Number(product.price || 0) *
          Number(product.countInStock || 0),
      0
    );

    const totalViews = products.reduce(
      (acc, product) =>
        acc + Number(product.views || 0),
      0
    );

    const totalSold = products.reduce(
      (acc, product) =>
        acc + Number(product.soldCount || 0),
      0
    );

    const totalReviews = products.reduce(
      (acc, product) =>
        acc + Number(product.numReviews || 0),
      0
    );

    const averageRating =
      totalProducts > 0
        ? (
            products.reduce(
              (acc, product) =>
                acc + Number(product.rating || 0),
              0
            ) / totalProducts
          ).toFixed(1)
        : "0.0";

    const totalOrders = orders.length;

    const paidOrders = orders.filter((order) => order.isPaid);

    const deliveredOrders = orders.filter(
      (order) =>
        order.isDelivered ||
        order.orderStatus === "Delivered" ||
        order.deliveryStatus === "Delivered"
    );

    const pendingOrders = orders.filter(
      (order) =>
        order.orderStatus === "Pending" ||
        !order.isPaid
    );

    const processingOrders = orders.filter((order) =>
      [
        "Confirmed",
        "Processing",
        "Packed",
      ].includes(order.orderStatus)
    );

    const shippedOrders = orders.filter((order) =>
      [
        "Shipped",
        "Out for Delivery",
        "Out For Delivery",
      ].includes(order.orderStatus)
    );

    const cancelledOrders = orders.filter(
      (order) => order.orderStatus === "Cancelled"
    );

    const sellerRevenue = orders.reduce((acc, order) => {
      return order.isPaid
        ? acc + getSellerOrderTotal(order)
        : acc;
    }, 0);

    const pendingRevenue = orders.reduce((acc, order) => {
      return !order.isPaid
        ? acc + getSellerOrderTotal(order)
        : acc;
    }, 0);

    const grossOrderValue = orders.reduce((acc, order) => {
      return acc + getSellerOrderTotal(order);
    }, 0);

    const paymentRate =
      totalOrders > 0
        ? Math.round((paidOrders.length / totalOrders) * 100)
        : 0;

    const deliveryRate =
      totalOrders > 0
        ? Math.round((deliveredOrders.length / totalOrders) * 100)
        : 0;

    const cancellationRate =
      totalOrders > 0
        ? Math.round((cancelledOrders.length / totalOrders) * 100)
        : 0;

    const stockHealth =
      totalProducts > 0
        ? Math.max(
            Math.round(
              ((totalProducts - lowStockProducts.length) /
                totalProducts) *
                100
            ),
            0
          )
        : 100;

    const conversionHint =
      totalViews > 0
        ? ((totalSold / totalViews) * 100).toFixed(1)
        : "0.0";

    const avgOrderValue =
      paidOrders.length > 0
        ? Math.round(sellerRevenue / paidOrders.length)
        : 0;

    const activeRate =
      totalProducts > 0
        ? Math.round((activeProducts / totalProducts) * 100)
        : 0;

    return {
      totalProducts,
      activeProducts,
      inactiveProducts,
      featuredProducts,
      lowStockProducts,
      outOfStockProducts,
      totalStock,
      inventoryValue,
      totalViews,
      totalSold,
      totalReviews,
      averageRating,
      totalOrders,
      paidOrders,
      deliveredOrders,
      pendingOrders,
      processingOrders,
      shippedOrders,
      cancelledOrders,
      sellerRevenue,
      pendingRevenue,
      grossOrderValue,
      paymentRate,
      deliveryRate,
      cancellationRate,
      stockHealth,
      conversionHint,
      avgOrderValue,
      activeRate,
    };
  }, [
    products,
    orders,
    sellerProductIds,
  ]);

  const recentOrders = useMemo(() => {
    let list = [...orders];

    if (orderFilter === "paid") {
      list = list.filter((order) => order.isPaid);
    }

    if (orderFilter === "pending") {
      list = list.filter(
        (order) => order.orderStatus === "Pending" || !order.isPaid
      );
    }

    if (orderFilter === "delivered") {
      list = list.filter(
        (order) =>
          order.isDelivered ||
          order.orderStatus === "Delivered"
      );
    }

    if (orderFilter === "cancelled") {
      list = list.filter(
        (order) => order.orderStatus === "Cancelled"
      );
    }

    return list
      .sort(
        (a, b) =>
          new Date(b.createdAt || 0) -
          new Date(a.createdAt || 0)
      )
      .slice(0, 8);
  }, [
    orders,
    orderFilter,
  ]);

  const rankedProducts = useMemo(() => {
    let list = [...products];

    const keyword = searchTerm.toLowerCase().trim();

    if (keyword) {
      list = list.filter(
        (product) =>
          product.name?.toLowerCase().includes(keyword) ||
          product.brand?.toLowerCase().includes(keyword) ||
          product.category?.toLowerCase().includes(keyword) ||
          product.tags?.join(" ")?.toLowerCase().includes(keyword)
      );
    }

    if (productMetric === "rating") {
      return list
        .sort(
          (a, b) =>
            Number(b.rating || 0) - Number(a.rating || 0)
        )
        .slice(0, 8);
    }

    if (productMetric === "sold") {
      return list
        .sort(
          (a, b) =>
            Number(b.soldCount || 0) -
            Number(a.soldCount || 0)
        )
        .slice(0, 8);
    }

    if (productMetric === "stock") {
      return list
        .sort(
          (a, b) =>
            Number(a.countInStock || 0) -
            Number(b.countInStock || 0)
        )
        .slice(0, 8);
    }

    if (productMetric === "revenue") {
      return list
        .sort(
          (a, b) =>
            Number(b.price || 0) * Number(b.soldCount || 0) -
            Number(a.price || 0) * Number(a.soldCount || 0)
        )
        .slice(0, 8);
    }

    return list
      .sort(
        (a, b) =>
          Number(b.views || 0) - Number(a.views || 0)
      )
      .slice(0, 8);
  }, [
    products,
    productMetric,
    searchTerm,
  ]);

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return (
      <main className="elite-seller-analytics-page">
        <Message variant="danger">
          {error}
        </Message>

        <Button
          variant="dark"
          className="rounded-pill fw-bold mt-3"
          onClick={() => fetchSellerData()}
        >
          <FaSyncAlt className="me-2" />
          Retry
        </Button>
      </main>
    );
  }

  return (
    <motion.main
      className="elite-seller-analytics-page"
      initial={{
        opacity: 0,
        y: 16,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.25,
      }}
    >
      <section className="elite-analytics-hero">
        <div>
          <Badge
            bg="warning"
            text="dark"
            className="elite-analytics-hero-badge"
          >
            <FaGem className="me-2" />
            EliteShop Seller Insights
          </Badge>

          <h1>Seller Analytics</h1>

          <p>
            Track revenue, orders, product performance, stock health,
            customer interest, conversion signal and seller growth in one
            dashboard.
          </p>
        </div>

        <div className="elite-analytics-hero-actions">
          <Button
            variant="light"
            onClick={() => navigate("/seller/add-product")}
          >
            <FaPlus className="me-2" />
            Add Product
          </Button>

          <Button
            variant="outline-light"
            onClick={() => navigate("/seller/dashboard")}
          >
            <FaStore className="me-2" />
            Dashboard
          </Button>

          <Button
            variant="warning"
            disabled={refreshing}
            onClick={() => fetchSellerData(true)}
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

        <motion.div
          className="elite-analytics-floating-card"
          animate={{
            y: [0, -10, 0],
          }}
          transition={{
            duration: 3.8,
            repeat: Infinity,
          }}
        >
          <FaChartLine />
          ₹{formatPrice(analytics.sellerRevenue)}
        </motion.div>
      </section>

      <Row className="g-4 mb-4">
        <KpiCard
          className="revenue"
          title="Total Revenue"
          value={`₹${formatPrice(analytics.sellerRevenue)}`}
          text={`Avg order ₹${formatPrice(analytics.avgOrderValue)}`}
          icon={<FaRupeeSign />}
        />

        <KpiCard
          className="orders"
          title="Total Orders"
          value={analytics.totalOrders}
          text={`${analytics.pendingOrders.length} pending/unpaid`}
          icon={<FaShoppingCart />}
        />

        <KpiCard
          className="products"
          title="Products"
          value={analytics.totalProducts}
          text={`${analytics.lowStockProducts.length} low-stock alerts`}
          icon={<FaBoxOpen />}
        />

        <KpiCard
          className="rating"
          title="Store Rating"
          value={analytics.averageRating}
          text={`${analytics.totalReviews} product reviews`}
          icon={<FaStar />}
        />
      </Row>

      <Row className="g-4 mb-4">
        <Col lg={4}>
          <Card className="elite-analytics-health-card">
            <Card.Body>
              <div className="elite-card-title">
                <h4>
                  <FaMoneyBillWave className="me-2" />
                  Sales Performance
                </h4>

                <p>Payment, delivery and cancellation health.</p>
              </div>

              <MetricProgress
                label="Payment Success"
                value={analytics.paymentRate}
                variant="success"
              />

              <MetricProgress
                label="Delivery Completed"
                value={analytics.deliveryRate}
                variant="primary"
              />

              <MetricProgress
                label="Cancellation Rate"
                value={analytics.cancellationRate}
                variant={
                  analytics.cancellationRate > 30
                    ? "danger"
                    : "warning"
                }
              />

              <div className="elite-mini-summary">
                <div>
                  <span>Pending Revenue</span>
                  <strong>
                    ₹{formatPrice(analytics.pendingRevenue)}
                  </strong>
                </div>

                <div>
                  <span>Gross Value</span>
                  <strong>
                    ₹{formatPrice(analytics.grossOrderValue)}
                  </strong>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className="elite-analytics-health-card">
            <Card.Body>
              <div className="elite-card-title">
                <h4>
                  <FaWarehouse className="me-2" />
                  Inventory Health
                </h4>

                <p>Stock quality and product availability.</p>
              </div>

              <MetricProgress
                label="Stock Health"
                value={analytics.stockHealth}
                variant={
                  analytics.stockHealth > 60
                    ? "success"
                    : analytics.stockHealth > 30
                    ? "warning"
                    : "danger"
                }
              />

              <MetricProgress
                label="Active Product Rate"
                value={analytics.activeRate}
                variant="info"
              />

              <div className="elite-analytics-info-grid">
                <div>
                  <span>Inventory Value</span>
                  <strong>
                    ₹{formatPrice(analytics.inventoryValue)}
                  </strong>
                </div>

                <div>
                  <span>Total Stock</span>
                  <strong>{analytics.totalStock}</strong>
                </div>

                <div>
                  <span>Out of Stock</span>
                  <strong>{analytics.outOfStockProducts.length}</strong>
                </div>

                <div>
                  <span>Featured</span>
                  <strong>{analytics.featuredProducts}</strong>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className="elite-analytics-growth-card">
            <Card.Body>
              <FaBolt />

              <h4>Store Growth Snapshot</h4>

              <p>
                Your store generated{" "}
                <strong>{analytics.totalViews}</strong> views and{" "}
                <strong>{analytics.totalSold}</strong> sold count.
              </p>

              <div className="elite-growth-number">
                {analytics.conversionHint}%
              </div>

              <span>View-to-sale signal</span>

              <Button
                as={Link}
                to="/seller/dashboard"
                variant="light"
                className="mt-3"
              >
                <FaStore className="me-2" />
                Manage Store
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-4 mb-4">
        <QuickAction
          to="/seller/add-product"
          className="dark"
          icon={<FaPlus />}
          text="Add Product"
        />

        <QuickAction
          to="/seller/dashboard"
          className="blue"
          icon={<FaStore />}
          text="Manage Store"
        />

        <QuickAction
          className="orange"
          icon={<FaExclamationTriangle />}
          text="Low Stock"
          onClick={() => setProductMetric("stock")}
        />

        <QuickAction
          className="green"
          icon={<FaSyncAlt />}
          text="Refresh Analytics"
          onClick={() => fetchSellerData(true)}
        />
      </Row>

      <Row className="g-4">
        <Col xl={8}>
          <Card className="elite-analytics-table-card">
            <Card.Body>
              <div className="elite-table-topbar">
                <div>
                  <h4>
                    <FaClipboardList className="me-2" />
                    Recent Seller Orders
                  </h4>

                  <p>Latest order activity from seller products.</p>
                </div>

                <Form.Select
                  value={orderFilter}
                  onChange={(e) => setOrderFilter(e.target.value)}
                >
                  <option value="all">All Orders</option>
                  <option value="paid">Paid Orders</option>
                  <option value="pending">Pending / Unpaid</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </Form.Select>
              </div>

              {recentOrders.length === 0 ? (
                <Alert
                  variant="info"
                  className="elite-empty-alert"
                >
                  No seller orders found yet.
                </Alert>
              ) : (
                <Table
                  responsive
                  hover
                  className="elite-analytics-table align-middle"
                >
                  <thead>
                    <tr>
                      <th>Order</th>
                      <th>Customer</th>
                      <th>Payment</th>
                      <th>Status</th>
                      <th>Total</th>
                      <th>View</th>
                    </tr>
                  </thead>

                  <tbody>
                    {recentOrders.map((order) => (
                      <tr key={order._id}>
                        <td>
                          <strong>
                            #{order._id?.substring(0, 10)}
                          </strong>

                          <small>{formatDate(order.createdAt)}</small>
                        </td>

                        <td>
                          <strong>
                            {order.user?.name || "Customer"}
                          </strong>

                          <small>
                            {order.user?.email || "No email"}
                          </small>
                        </td>

                        <td>
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
                        </td>

                        <td>
                          <Badge bg={getOrderBadge(order.orderStatus)}>
                            {order.orderStatus || "Pending"}
                          </Badge>
                        </td>

                        <td>
                          ₹{formatPrice(getSellerOrderTotal(order))}
                        </td>

                        <td>
                          <Button
                            as={Link}
                            to={`/orders/${order._id}`}
                            size="sm"
                            variant="outline-dark"
                            className="rounded-circle"
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
          <Card className="elite-order-summary-card">
            <Card.Body>
              <h4>
                <FaChartPie className="me-2" />
                Order Summary
              </h4>

              <SummaryItem
                icon={<FaClock />}
                label="Pending"
                value={analytics.pendingOrders.length}
                color="secondary"
              />

              <SummaryItem
                icon={<FaBoxOpen />}
                label="Processing"
                value={analytics.processingOrders.length}
                color="info"
              />

              <SummaryItem
                icon={<FaTruck />}
                label="Shipped"
                value={analytics.shippedOrders.length}
                color="warning"
              />

              <SummaryItem
                icon={<FaCheckCircle />}
                label="Delivered"
                value={analytics.deliveredOrders.length}
                color="success"
              />

              <SummaryItem
                icon={<FaTimesCircle />}
                label="Cancelled"
                value={analytics.cancelledOrders.length}
                color="danger"
              />
            </Card.Body>
          </Card>
        </Col>

        <Col xl={6}>
          <Card className="elite-analytics-table-card">
            <Card.Body>
              <div className="elite-table-topbar">
                <div>
                  <h4>
                    <FaFire className="me-2" />
                    Product Ranking
                  </h4>

                  <p>Compare best-performing products.</p>
                </div>

                <Form.Select
                  value={productMetric}
                  onChange={(e) => setProductMetric(e.target.value)}
                >
                  <option value="views">Most Viewed</option>
                  <option value="sold">Most Sold</option>
                  <option value="rating">Best Rated</option>
                  <option value="stock">Lowest Stock</option>
                  <option value="revenue">Revenue Signal</option>
                </Form.Select>
              </div>

              <div className="elite-product-search">
                <FaFilter />

                <input
                  type="text"
                  placeholder="Search ranked products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {rankedProducts.length === 0 ? (
                <Alert
                  variant="info"
                  className="elite-empty-alert mt-3"
                >
                  No products found.
                </Alert>
              ) : (
                <ListGroup
                  variant="flush"
                  className="elite-product-rank-list mt-3"
                >
                  {rankedProducts.map((product, index) => (
                    <ListGroup.Item key={product._id}>
                      <div className="elite-rank-product">
                        <div className="elite-rank-number">
                          {index + 1}
                        </div>

                        <Image
                          src={product.image || "/placeholder.svg"}
                          rounded
                        />

                        <div>
                          <strong>{product.name}</strong>

                          <small>
                            {product.category} • ₹{formatPrice(product.price)}
                          </small>

                          <div className="elite-rank-tags">
                            {product.isFeatured && (
                              <Badge bg="danger">
                                <FaCrown className="me-1" />
                                Featured
                              </Badge>
                            )}

                            {product.tags?.slice(0, 1).map((tag) => (
                              <Badge
                                bg="light"
                                text="dark"
                                key={tag}
                              >
                                <FaTags className="me-1" />
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="elite-rank-actions">
                        <Badge bg="primary">
                          <FaEye className="me-1" />
                          {product.views || 0}
                        </Badge>

                        <Badge
                          bg="warning"
                          text="dark"
                        >
                          <FaStar className="me-1" />
                          {product.rating || 0}
                        </Badge>

                        <Badge bg="success">
                          <FaFire className="me-1" />
                          {product.soldCount || 0}
                        </Badge>

                        <Button
                          as={Link}
                          to={`/seller/edit-product/${product._id}`}
                          size="sm"
                          variant="outline-dark"
                        >
                          <FaEdit />
                        </Button>
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col xl={6}>
          <Card className="elite-analytics-table-card">
            <Card.Body>
              <div className="elite-table-topbar">
                <div>
                  <h4>
                    <FaExclamationTriangle className="me-2" />
                    Low Stock Alerts
                  </h4>

                  <p>Restock products before losing sales.</p>
                </div>

                <Badge bg="danger">
                  {analytics.lowStockProducts.length} alerts
                </Badge>
              </div>

              {analytics.lowStockProducts.length === 0 ? (
                <Alert
                  variant="success"
                  className="elite-empty-alert"
                >
                  Great! No low-stock products right now.
                </Alert>
              ) : (
                <Table
                  responsive
                  hover
                  className="elite-analytics-table align-middle"
                >
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Stock</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {analytics.lowStockProducts
                      .slice(0, 8)
                      .map((product) => (
                        <tr key={product._id}>
                          <td>
                            <div className="elite-table-product">
                              <Image
                                src={product.image || "/placeholder.svg"}
                                rounded
                              />

                              <div>
                                <strong>{product.name}</strong>

                                <small>{product.category}</small>
                              </div>
                            </div>
                          </td>

                          <td>
                            <strong>{product.countInStock}</strong>

                            <small>
                              Alert {product.lowStockThreshold || 5}
                            </small>
                          </td>

                          <td>
                            {Number(product.countInStock || 0) === 0 ? (
                              <Badge bg="danger">
                                Out of Stock
                              </Badge>
                            ) : (
                              <Badge
                                bg="warning"
                                text="dark"
                              >
                                Low Stock
                              </Badge>
                            )}
                          </td>

                          <td>
                            <Button
                              as={Link}
                              to={`/seller/edit-product/${product._id}`}
                              size="sm"
                              variant="dark"
                              className="rounded-pill fw-bold"
                            >
                              Update
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
      </Row>
    </motion.main>
  );
};

const KpiCard = ({
  className,
  title,
  value,
  text,
  icon,
}) => (
  <Col md={6} xl={3}>
    <motion.div whileHover={{ y: -7 }}>
      <Card className={`elite-analytics-kpi-card ${className}`}>
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

const MetricProgress = ({
  label,
  value,
  variant,
}) => (
  <div className="elite-metric-progress">
    <div>
      <span>{label}</span>

      <strong>{value}%</strong>
    </div>

    <ProgressBar
      now={value}
      variant={variant}
    />
  </div>
);

const SummaryItem = ({
  icon,
  label,
  value,
  color,
}) => (
  <div className="elite-summary-item">
    <span>
      {icon}
      {label}
    </span>

    <Badge bg={color}>
      {value}
    </Badge>
  </div>
);

const QuickAction = ({
  to,
  className,
  icon,
  text,
  onClick,
}) => {
  if (to) {
    return (
      <Col md={6} xl={3}>
        <Button
          as={Link}
          to={to}
          className={`elite-analytics-action-btn ${className}`}
        >
          {icon}
          {text}
        </Button>
      </Col>
    );
  }

  return (
    <Col md={6} xl={3}>
      <Button
        className={`elite-analytics-action-btn ${className}`}
        onClick={onClick}
      >
        {icon}
        {text}
      </Button>
    </Col>
  );
};

export default SellerAnalytics;