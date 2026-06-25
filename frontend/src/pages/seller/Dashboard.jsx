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
  Button,
  Badge,
  Spinner,
  Form,
  Alert,
  Image,
  ProgressBar,
  ListGroup,
} from "react-bootstrap";

import {
  FaBoxOpen,
  FaRupeeSign,
  FaChartLine,
  FaEdit,
  FaTrash,
  FaPlus,
  FaSearch,
  FaEye,
  FaStar,
  FaWarehouse,
  FaFire,
  FaSyncAlt,
  FaExclamationTriangle,
  FaCheckCircle,
  FaTimesCircle,
  FaTruck,
  FaStore,
  FaClipboardList,
  FaTags,
  FaBolt,
  FaShoppingBag,
  FaShieldAlt,
  FaArrowRight,
  FaGem,
  FaMoneyBillWave,
} from "react-icons/fa";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import { motion } from "framer-motion";
import { toast } from "react-toastify";

import api from "../../utils/axios";
import Loader from "../../components/Loader";
import Message from "../../components/Message";

import "../../styles/SellerDashboard.css";

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

const getOrderBadge = (status) => {
  switch (status) {
    case "Delivered":
      return "success";

    case "Shipped":
    case "Out For Delivery":
      return "primary";

    case "Processing":
    case "Packed":
    case "Confirmed":
      return "warning";

    case "Cancelled":
    case "Returned":
      return "danger";

    default:
      return "secondary";
  }
};

const SellerDashboard = () => {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [sellerOrders, setSellerOrders] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [stockFilter, setStockFilter] = useState("all");
  const [sortBy, setSortBy] = useState("latest");

    const fetchProducts = async (silent = false) => {
    try {
      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const { data } = await api.get(
        "/products/seller/products"
      );

      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(
        "Seller products error:",
        error.response?.data || error.message
      );

      const status = error?.response?.status;
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to load seller products";

      if (status === 401) {
        setError(
          "Seller session expired. Please login again from seller login page."
        );
        return;
      }

      if (status === 403) {
        setError(
          message ||
            "Seller access denied. Your seller account may not be approved yet."
        );
        return;
      }

      if (error.message === "Network Error") {
        setError(
          "Network Error: Backend server is not running, CORS is blocked, or API URL is wrong."
        );
        return;
      }

      setError(message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

   const fetchSellerOrders = async () => {
    try {
      setOrdersLoading(true);

      const { data } = await api.get("/orders/seller");

      setSellerOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(
        "Seller orders error:",
        error.response?.data || error.message
      );

      const status = error?.response?.status;
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to load seller orders";

      if (status === 401) {
        toast.error(
          "Seller session expired. Please login again."
        );
      } else if (status === 403) {
        toast.error(
          message ||
            "Seller access denied. Seller may not be approved."
        );
      } else if (error.message === "Network Error") {
        toast.error(
          "Network Error: Backend is not running or CORS is blocked."
        );
      } else {
        toast.error(message);
      }

      setSellerOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  };

  const refreshDashboard = async () => {
    await Promise.all([
      fetchProducts(true),
      fetchSellerOrders(),
    ]);
  };

  useEffect(() => {
    fetchProducts();
    fetchSellerOrders();
  }, []);

  const stats = useMemo(() => {
    const totalProducts = products.length;

    const activeProducts = products.filter(
      (item) => item.isActive !== false
    ).length;

    const inactiveProducts = products.filter(
      (item) => item.isActive === false
    ).length;

    const featuredProducts = products.filter(
      (item) => item.isFeatured
    ).length;

    const lowStockProducts = products.filter((item) => {
      const stock = Number(item.countInStock || 0);
      const threshold = Number(item.lowStockThreshold || 5);

      return stock > 0 && stock <= threshold;
    });

    const outOfStockProducts = products.filter(
      (item) => Number(item.countInStock || 0) === 0
    ).length;

    const totalStock = products.reduce(
      (acc, item) =>
        acc + Number(item.countInStock || 0),
      0
    );

    const inventoryValue = products.reduce(
      (acc, item) =>
        acc +
        Number(item.price || 0) *
          Number(item.countInStock || 0),
      0
    );

    const totalSold = products.reduce(
      (acc, item) =>
        acc + Number(item.soldCount || 0),
      0
    );

    const totalViews = products.reduce(
      (acc, item) =>
        acc + Number(item.views || 0),
      0
    );

    const paidOrders = sellerOrders.filter(
      (order) => order.isPaid
    );

    const orderRevenue = paidOrders.reduce(
      (acc, order) =>
        acc + Number(order.totalPrice || 0),
      0
    );

    const activeOrders = sellerOrders.filter((order) =>
      [
        "Pending",
        "Confirmed",
        "Processing",
        "Packed",
        "Shipped",
        "Out For Delivery",
      ].includes(order.orderStatus)
    ).length;

    const deliveredOrders = sellerOrders.filter(
      (order) =>
        order.isDelivered ||
        order.orderStatus === "Delivered"
    ).length;

    const cancelledOrders = sellerOrders.filter(
      (order) => order.orderStatus === "Cancelled"
    ).length;

    const inventoryHealth =
      totalProducts > 0
        ? Math.round(
            ((totalProducts -
              lowStockProducts.length -
              outOfStockProducts) /
              totalProducts) *
              100
          )
        : 100;

    const conversionSignal =
      totalViews > 0
        ? Math.round((totalSold / totalViews) * 100)
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
      totalSold,
      totalViews,
      orderRevenue,
      totalOrders: sellerOrders.length,
      activeOrders,
      deliveredOrders,
      cancelledOrders,
      inventoryHealth: Math.max(inventoryHealth, 0),
      conversionSignal,
    };
  }, [
    products,
    sellerOrders,
  ]);

  const filteredProducts = useMemo(() => {
    let list = [...products];

    const keyword = searchTerm.toLowerCase().trim();

    if (keyword) {
      list = list.filter(
        (item) =>
          item.name?.toLowerCase().includes(keyword) ||
          item.brand?.toLowerCase().includes(keyword) ||
          item.category?.toLowerCase().includes(keyword) ||
          item.tags?.join(" ")?.toLowerCase().includes(keyword)
      );
    }

    if (stockFilter === "active") {
      list = list.filter((item) => item.isActive !== false);
    }

    if (stockFilter === "inactive") {
      list = list.filter((item) => item.isActive === false);
    }

    if (stockFilter === "featured") {
      list = list.filter((item) => item.isFeatured);
    }

    if (stockFilter === "low") {
      list = list.filter((item) => {
        const stock = Number(item.countInStock || 0);
        const threshold = Number(item.lowStockThreshold || 5);

        return stock > 0 && stock <= threshold;
      });
    }

    if (stockFilter === "out") {
      list = list.filter(
        (item) => Number(item.countInStock || 0) === 0
      );
    }

    if (sortBy === "latest") {
      list.sort(
        (a, b) =>
          new Date(b.createdAt || 0) -
          new Date(a.createdAt || 0)
      );
    }

    if (sortBy === "priceHigh") {
      list.sort(
        (a, b) => Number(b.price || 0) - Number(a.price || 0)
      );
    }

    if (sortBy === "priceLow") {
      list.sort(
        (a, b) => Number(a.price || 0) - Number(b.price || 0)
      );
    }

    if (sortBy === "stockLow") {
      list.sort(
        (a, b) =>
          Number(a.countInStock || 0) -
          Number(b.countInStock || 0)
      );
    }

    if (sortBy === "stockHigh") {
      list.sort(
        (a, b) =>
          Number(b.countInStock || 0) -
          Number(a.countInStock || 0)
      );
    }

    if (sortBy === "popular") {
      list.sort(
        (a, b) =>
          Number(b.views || 0) - Number(a.views || 0)
      );
    }

    if (sortBy === "rating") {
      list.sort(
        (a, b) =>
          Number(b.rating || 0) - Number(a.rating || 0)
      );
    }

    return list;
  }, [
    products,
    searchTerm,
    stockFilter,
    sortBy,
  ]);

  const recentOrders = useMemo(() => {
    return [...sellerOrders]
      .sort(
        (a, b) =>
          new Date(b.createdAt || 0) -
          new Date(a.createdAt || 0)
      )
      .slice(0, 5);
  }, [sellerOrders]);

  const topProducts = useMemo(() => {
    return [...products]
      .sort(
        (a, b) =>
          Number(b.views || 0) +
          Number(b.soldCount || 0) * 5 -
          (Number(a.views || 0) +
            Number(a.soldCount || 0) * 5)
      )
      .slice(0, 5);
  }, [products]);

  const deleteHandler = async (id) => {
    const confirmDelete = window.confirm(
      "Delete this product? This action cannot be undone."
    );

    if (!confirmDelete) return;

    try {
      setDeletingId(id);

      await api.delete(`/products/${id}`);

      setProducts((prev) =>
        prev.filter((item) => item._id !== id)
      );

      toast.success("Product deleted successfully");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to delete product"
      );
    } finally {
      setDeletingId("");
    }
  };

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return (
      <main className="elite-seller-dashboard-page">
        <Message variant="danger">
          {error}
        </Message>

        <Button
          variant="dark"
          onClick={() => fetchProducts()}
          className="rounded-pill fw-bold mt-3"
        >
          <FaSyncAlt className="me-2" />
          Retry
        </Button>
      </main>
    );
  }

  return (
    <motion.main
      className="elite-seller-dashboard-page"
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
      <section className="elite-seller-dashboard-hero">
        <div>
          <Badge
            bg="warning"
            text="dark"
            className="elite-seller-hero-badge"
          >
            <FaStore className="me-2" />
            Seller Control Center
          </Badge>

          <h1>Seller Dashboard</h1>

          <p>
            Manage products, track inventory, monitor orders, fix
            low-stock alerts and grow your EliteShop seller business.
          </p>
        </div>

        <div className="elite-seller-hero-actions">
          <Button
            variant="light"
            onClick={() => navigate("/seller/add-product")}
          >
            <FaPlus className="me-2" />
            Add Product
          </Button>

          <Button
            variant="outline-light"
            onClick={() => navigate("/seller/analytics")}
          >
            <FaChartLine className="me-2" />
            Analytics
          </Button>

          <Button
            variant="warning"
            disabled={refreshing}
            onClick={refreshDashboard}
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
          className="elite-seller-floating-badge"
          animate={{
            y: [0, -10, 0],
          }}
          transition={{
            duration: 3.5,
            repeat: Infinity,
          }}
        >
          <FaGem />
          Seller Growth
        </motion.div>
      </section>

      <Row className="g-4 mb-4">
        <Col md={6} xl={3}>
          <motion.div whileHover={{ y: -7 }}>
            <Card className="elite-seller-stat-card products">
              <Card.Body>
                <div>
                  <span>Total Products</span>
                  <h2>{stats.totalProducts}</h2>
                  <p>{stats.activeProducts} active listings</p>
                </div>

                <FaBoxOpen />
              </Card.Body>
            </Card>
          </motion.div>
        </Col>

        <Col md={6} xl={3}>
          <motion.div whileHover={{ y: -7 }}>
            <Card className="elite-seller-stat-card revenue">
              <Card.Body>
                <div>
                  <span>Inventory Value</span>
                  <h2>₹{formatPrice(stats.inventoryValue)}</h2>
                  <p>{stats.totalStock} items in stock</p>
                </div>

                <FaRupeeSign />
              </Card.Body>
            </Card>
          </motion.div>
        </Col>

        <Col md={6} xl={3}>
          <motion.div whileHover={{ y: -7 }}>
            <Card className="elite-seller-stat-card orders">
              <Card.Body>
                <div>
                  <span>Seller Orders</span>
                  <h2>
                    {ordersLoading ? "..." : stats.totalOrders}
                  </h2>
                  <p>₹{formatPrice(stats.orderRevenue)} paid revenue</p>
                </div>

                <FaTruck />
              </Card.Body>
            </Card>
          </motion.div>
        </Col>

        <Col md={6} xl={3}>
          <motion.div whileHover={{ y: -7 }}>
            <Card className="elite-seller-stat-card alerts">
              <Card.Body>
                <div>
                  <span>Low Stock</span>
                  <h2>{stats.lowStockProducts.length}</h2>
                  <p>{stats.outOfStockProducts} out of stock</p>
                </div>

                <FaExclamationTriangle />
              </Card.Body>
            </Card>
          </motion.div>
        </Col>
      </Row>

      <Row className="g-4 mb-4">
        <Col lg={8}>
          <Card className="elite-seller-alert-card h-100">
            <Card.Body>
              <div className="elite-seller-section-title">
                <div>
                  <h4>
                    <FaWarehouse className="me-2" />
                    Inventory Health
                  </h4>

                  <p>
                    Keep your products in stock to avoid losing orders.
                  </p>
                </div>

                <Button
                  variant="dark"
                  size="sm"
                  className="rounded-pill fw-bold"
                  disabled={refreshing}
                  onClick={refreshDashboard}
                >
                  <FaSyncAlt className="me-2" />
                  Refresh
                </Button>
              </div>

              <Row className="g-3 mb-4">
                <Col md={4}>
                  <div className="elite-seller-metric-box blue">
                    <FaChartLine />
                    <span>Inventory Health</span>
                    <strong>{stats.inventoryHealth}%</strong>
                    <ProgressBar now={stats.inventoryHealth} />
                  </div>
                </Col>

                <Col md={4}>
                  <div className="elite-seller-metric-box green">
                    <FaEye />
                    <span>Total Views</span>
                    <strong>{stats.totalViews}</strong>
                    <small>Product visits</small>
                  </div>
                </Col>

                <Col md={4}>
                  <div className="elite-seller-metric-box orange">
                    <FaFire />
                    <span>Sold Items</span>
                    <strong>{stats.totalSold}</strong>
                    <small>{stats.conversionSignal}% view-to-sale signal</small>
                  </div>
                </Col>
              </Row>

              {stats.lowStockProducts.length === 0 ? (
                <Alert
                  variant="success"
                  className="rounded-4 mb-0"
                >
                  <FaCheckCircle className="me-2" />
                  Great! No low-stock products right now.
                </Alert>
              ) : (
                <div className="elite-low-stock-list">
                  {stats.lowStockProducts.slice(0, 8).map((item) => (
                    <div
                      key={item._id}
                      className="elite-low-stock-item"
                    >
                      <Image
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        rounded
                      />

                      <div>
                        <strong>{item.name}</strong>

                        <small>
                          Stock: {item.countInStock} / Alert:{" "}
                          {item.lowStockThreshold || 5}
                        </small>
                      </div>

                      <Button
                        as={Link}
                        to={`/seller/edit-product/${item._id}`}
                        size="sm"
                        variant="outline-danger"
                      >
                        Restock
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className="elite-seller-mini-card h-100">
            <Card.Body>
              <FaBolt />

              <h4>Seller Quick Actions</h4>

              <p>
                Fast shortcuts for daily seller operations.
              </p>

              <div className="elite-quick-actions">
                <Button
                  onClick={() => navigate("/seller/add-product")}
                >
                  <FaPlus />
                  Add New Product
                </Button>

                <Button
                  variant="outline-light"
                  onClick={() => navigate("/seller/analytics")}
                >
                  <FaChartLine />
                  View Analytics
                </Button>

                <Button
                  variant="outline-light"
                  onClick={() => setStockFilter("low")}
                >
                  <FaExclamationTriangle />
                  Show Low Stock
                </Button>

                <Button
                  variant="outline-light"
                  onClick={() => setStockFilter("featured")}
                >
                  <FaStar />
                  Featured Items
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-4 mb-4">
        <Col lg={7}>
          <Card className="elite-seller-orders-card h-100">
            <Card.Body>
              <div className="elite-seller-section-title">
                <div>
                  <h4>
                    <FaClipboardList className="me-2" />
                    Recent Seller Orders
                  </h4>

                  <p>
                    Latest orders containing your products.
                  </p>
                </div>

                <Badge bg="dark">
                  {stats.activeOrders} active
                </Badge>
              </div>

              {ordersLoading ? (
                <div className="elite-seller-small-loader">
                  <Spinner animation="border" />
                </div>
              ) : recentOrders.length === 0 ? (
                <Alert
                  variant="info"
                  className="rounded-4 mb-0"
                >
                  No seller orders found yet.
                </Alert>
              ) : (
                <ListGroup
                  variant="flush"
                  className="elite-seller-order-list"
                >
                  {recentOrders.map((order) => (
                    <ListGroup.Item key={order._id}>
                      <div>
                        <strong>#{order._id?.slice(-10)}</strong>

                        <span>
                          {order.user?.name || "Customer"} •{" "}
                          {formatDate(order.createdAt)}
                        </span>
                      </div>

                      <div className="text-end">
                        <strong>
                          ₹{formatPrice(order.totalPrice)}
                        </strong>

                        <Badge bg={getOrderBadge(order.orderStatus)}>
                          {order.orderStatus || "Pending"}
                        </Badge>
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col lg={5}>
          <Card className="elite-seller-orders-card h-100">
            <Card.Body>
              <div className="elite-seller-section-title">
                <div>
                  <h4>
                    <FaStar className="me-2" />
                    Top Product Signals
                  </h4>

                  <p>
                    Views, sold count and ratings.
                  </p>
                </div>
              </div>

              {topProducts.length === 0 ? (
                <Alert
                  variant="info"
                  className="rounded-4 mb-0"
                >
                  Add products to see product signals.
                </Alert>
              ) : (
                <ListGroup
                  variant="flush"
                  className="elite-seller-top-product-list"
                >
                  {topProducts.map((product) => (
                    <ListGroup.Item key={product._id}>
                      <div className="elite-seller-top-product">
                        <Image
                          src={product.image || "/placeholder.svg"}
                          rounded
                        />

                        <div>
                          <strong>{product.name}</strong>

                          <span>
                            <FaEye /> {product.views || 0} views •{" "}
                            <FaFire /> {product.soldCount || 0} sold
                          </span>
                        </div>
                      </div>

                      <Badge bg="warning" text="dark">
                        <FaStar className="me-1" />
                        {Number(product.rating || 0).toFixed(1)}
                      </Badge>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="elite-seller-products-card">
        <Card.Body>
          <div className="elite-seller-products-header">
            <div>
              <h3>Your Products</h3>

              <p>
                Showing {filteredProducts.length} of {products.length} products
              </p>
            </div>

            <Button
              onClick={() => navigate("/seller/add-product")}
              className="elite-add-product-btn"
            >
              <FaPlus className="me-2" />
              Add Product
            </Button>
          </div>

          <Row className="g-3 mb-4">
            <Col lg={5}>
              <div className="elite-seller-search">
                <FaSearch />

                <input
                  type="text"
                  placeholder="Search product, brand, category, tag..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </Col>

            <Col md={6} lg={3}>
              <Form.Select
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value)}
              >
                <option value="all">All Products</option>
                <option value="active">Active Products</option>
                <option value="inactive">Inactive Products</option>
                <option value="featured">Featured Products</option>
                <option value="low">Low Stock</option>
                <option value="out">Out Of Stock</option>
              </Form.Select>
            </Col>

            <Col md={6} lg={4}>
              <Form.Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="latest">Latest First</option>
                <option value="priceHigh">Price High To Low</option>
                <option value="priceLow">Price Low To High</option>
                <option value="stockLow">Lowest Stock First</option>
                <option value="stockHigh">Highest Stock First</option>
                <option value="popular">Most Viewed</option>
                <option value="rating">Top Rated</option>
              </Form.Select>
            </Col>
          </Row>

          {products.length === 0 ? (
            <div className="elite-seller-empty">
              <FaBoxOpen />

              <h4>No products yet</h4>

              <p>
                Add your first product to start selling on EliteShop.
              </p>

              <Button
                onClick={() => navigate("/seller/add-product")}
                className="rounded-pill fw-bold"
              >
                <FaPlus className="me-2" />
                Add First Product
              </Button>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="elite-seller-empty">
              <FaSearch />

              <h4>No matching products</h4>

              <p>
                Try changing your search, stock filter or sorting option.
              </p>
            </div>
          ) : (
            <div className="table-responsive">
              <Table
                hover
                className="elite-seller-product-table align-middle"
              >
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Status</th>
                    <th>Signals</th>
                    <th>Rating</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredProducts.map((product) => {
                    const stock = Number(product.countInStock || 0);
                    const threshold = Number(product.lowStockThreshold || 5);

                    const lowStock =
                      stock > 0 && stock <= threshold;

                    return (
                      <tr key={product._id}>
                        <td>
                          <div className="elite-product-cell">
                            <Image
                              src={product.image || "/placeholder.svg"}
                              alt={product.name}
                              rounded
                            />

                            <div>
                              <strong>{product.name}</strong>

                              <small>{product.brand}</small>

                              <div className="elite-product-tags">
                                {product.isFeatured && (
                                  <Badge bg="danger">
                                    Featured
                                  </Badge>
                                )}

                                {product.freeShipping && (
                                  <Badge bg="success">
                                    Free Shipping
                                  </Badge>
                                )}

                                {product.tags?.slice(0, 1).map((tag) => (
                                  <Badge
                                    key={tag}
                                    bg="light"
                                    text="dark"
                                  >
                                    <FaTags className="me-1" />
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td>
                          <Badge
                            bg="secondary"
                            className="elite-seller-table-badge"
                          >
                            {product.category}
                          </Badge>
                        </td>

                        <td>
                          <strong>
                            ₹{formatPrice(product.price)}
                          </strong>

                          {Number(product.originalPrice || 0) >
                            Number(product.price || 0) && (
                            <small className="d-block text-muted">
                              <del>
                                ₹{formatPrice(product.originalPrice)}
                              </del>{" "}
                              {product.discountPercentage || 0}% off
                            </small>
                          )}
                        </td>

                        <td>
                          {stock === 0 ? (
                            <Badge bg="danger">Out</Badge>
                          ) : lowStock ? (
                            <Badge bg="warning" text="dark">
                              Low: {stock}
                            </Badge>
                          ) : (
                            <Badge bg="success">
                              {stock}
                            </Badge>
                          )}

                          <small className="d-block text-muted">
                            Alert {threshold}
                          </small>
                        </td>

                        <td>
                          {product.isActive === false ? (
                            <Badge bg="secondary">
                              <FaTimesCircle className="me-1" />
                              Inactive
                            </Badge>
                          ) : (
                            <Badge bg="success">
                              <FaCheckCircle className="me-1" />
                              Active
                            </Badge>
                          )}
                        </td>

                        <td>
                          <div className="elite-product-signal">
                            <span>
                              <FaEye />
                              {product.views || 0}
                            </span>

                            <span>
                              <FaFire />
                              {product.soldCount || 0}
                            </span>
                          </div>
                        </td>

                        <td>
                          <FaStar className="me-1 text-warning" />
                          {Number(product.rating || 0).toFixed(1)}

                          <small className="d-block text-muted">
                            {product.numReviews || 0} reviews
                          </small>
                        </td>

                        <td>
                          <div className="elite-product-actions">
                            <Button
                              as={Link}
                              to={`/product/${product.slug || product._id}`}
                              size="sm"
                              variant="outline-primary"
                            >
                              <FaEye />
                            </Button>

                            <Button
                              as={Link}
                              to={`/seller/edit-product/${product._id}`}
                              size="sm"
                              variant="dark"
                            >
                              <FaEdit />
                            </Button>

                            <Button
                              size="sm"
                              variant="danger"
                              disabled={deletingId === product._id}
                              onClick={() => deleteHandler(product._id)}
                            >
                              {deletingId === product._id ? (
                                <Spinner
                                  animation="border"
                                  size="sm"
                                />
                              ) : (
                                <FaTrash />
                              )}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>
    </motion.main>
  );
};

export default SellerDashboard;