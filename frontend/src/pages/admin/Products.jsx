import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Table,
  Button,
  Card,
  Badge,
  Row,
  Col,
  Image,
  InputGroup,
  Form,
  Modal,
  Spinner,
  Alert,
} from "react-bootstrap";

import {
  FaSearch,
  FaEdit,
  FaTrash,
  FaEye,
  FaBoxOpen,
  FaExclamationTriangle,
  FaStar,
  FaUpload,
  FaSyncAlt,
  FaRupeeSign,
  FaFilter,
  FaStore,
  FaTags,
  FaShippingFast,
  FaCheckCircle,
  FaTimesCircle,
  FaCrown,
  FaChartLine,
} from "react-icons/fa";

import { Link } from "react-router-dom";

import { motion } from "framer-motion";

import { toast } from "react-toastify";

import Loader from "../../components/Loader";
import Message from "../../components/Message";

import axios from "../../utils/axios";

import "../../styles/AdminProducts.css";

const categories = [
  "Mobiles",
  "Electronics",
  "Fashion",
  "Shoes",
  "Watches",
  "Beauty",
  "Home & Kitchen",
  "Furniture",
  "Grocery",
  "Sports",
  "Gaming",
  "Books",
  "Appliances",
];

const formatPrice = (value) => {
  return Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const calculateDiscount = (product) => {
  const originalPrice = Number(product.originalPrice || 0);
  const price = Number(product.price || 0);

  if (!originalPrice || originalPrice <= price) {
    return Number(product.discountPercentage || 0);
  }

  return Math.round(((originalPrice - price) / originalPrice) * 100);
};

const AdminProductsPage = () => {
  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const [showModal, setShowModal] = useState(false);

  const [selectedProduct, setSelectedProduct] = useState(null);

  const [updating, setUpdating] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    image: "",
    brand: "",
    category: "",
    description: "",
    price: "",
    originalPrice: "",
    countInStock: "",
    lowStockThreshold: 5,
    freeShipping: false,
    shippingPrice: "",
    tags: "",
    isFeatured: false,
    isActive: true,
  });

  const fetchProducts = async (silent = false) => {
    try {
      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const firstRes = await axios.get("/products");

      const firstData = firstRes.data;

      let allProducts = firstData.products || firstData || [];

      const totalPages = firstData.pages || 1;

      if (totalPages > 1) {
        const requests = [];

        for (
          let pageNumber = 2;
          pageNumber <= totalPages;
          pageNumber += 1
        ) {
          requests.push(
            axios.get(`/products?pageNumber=${pageNumber}`)
          );
        }

        const responses = await Promise.all(requests);

        responses.forEach((res) => {
          allProducts = [
            ...allProducts,
            ...(res.data.products || []),
          ];
        });
      }

      setProducts(Array.isArray(allProducts) ? allProducts : []);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch products"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const stats = useMemo(() => {
    const totalProducts = products.length;

    const lowStockProducts = products.filter((product) => {
      const stock = Number(product.countInStock || 0);
      const threshold = Number(product.lowStockThreshold || 5);

      return stock > 0 && stock <= threshold;
    }).length;

    const outOfStockProducts = products.filter(
      (product) => Number(product.countInStock || 0) === 0
    ).length;

    const featuredProducts = products.filter(
      (product) => product.isFeatured
    ).length;

    const activeProducts = products.filter(
      (product) => product.isActive !== false
    ).length;

    const inventoryValue = products.reduce(
      (acc, product) =>
        acc +
        Number(product.price || 0) *
          Number(product.countInStock || 0),
      0
    );

    return {
      totalProducts,
      lowStockProducts,
      outOfStockProducts,
      featuredProducts,
      activeProducts,
      inventoryValue,
    };
  }, [products]);

  const filteredProducts = useMemo(() => {
    const search = searchTerm.toLowerCase();

    let result = products.filter((product) => {
      const stock = Number(product.countInStock || 0);
      const threshold = Number(product.lowStockThreshold || 5);

      const matchesSearch =
        product.name?.toLowerCase().includes(search) ||
        product.brand?.toLowerCase().includes(search) ||
        product.category?.toLowerCase().includes(search) ||
        product.seller?.name?.toLowerCase().includes(search) ||
        product.user?.name?.toLowerCase().includes(search) ||
        product.tags?.join(" ")?.toLowerCase().includes(search);

      const matchesCategory =
        categoryFilter === "all" ||
        product.category === categoryFilter;

      const matchesStock =
        stockFilter === "all" ||
        (stockFilter === "available" && stock > threshold) ||
        (stockFilter === "low" && stock > 0 && stock <= threshold) ||
        (stockFilter === "out" && stock === 0) ||
        (stockFilter === "featured" && product.isFeatured) ||
        (stockFilter === "hidden" && product.isActive === false) ||
        (stockFilter === "active" && product.isActive !== false);

      return matchesSearch && matchesCategory && matchesStock;
    });

    result.sort((a, b) => {
      if (sortBy === "oldest") {
        return new Date(a.createdAt) - new Date(b.createdAt);
      }

      if (sortBy === "priceHigh") {
        return Number(b.price || 0) - Number(a.price || 0);
      }

      if (sortBy === "priceLow") {
        return Number(a.price || 0) - Number(b.price || 0);
      }

      if (sortBy === "stockHigh") {
        return Number(b.countInStock || 0) - Number(a.countInStock || 0);
      }

      if (sortBy === "stockLow") {
        return Number(a.countInStock || 0) - Number(b.countInStock || 0);
      }

      if (sortBy === "rating") {
        return Number(b.rating || 0) - Number(a.rating || 0);
      }

      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });

    return result;
  }, [
    products,
    searchTerm,
    categoryFilter,
    stockFilter,
    sortBy,
  ]);

  const openEditModal = (product) => {
    setSelectedProduct(product);

    setFormData({
      name: product.name || "",
      image: product.image || "",
      brand: product.brand || "",
      category: product.category || "",
      description: product.description || "",
      price: product.price || "",
      originalPrice: product.originalPrice || "",
      countInStock: product.countInStock || "",
      lowStockThreshold: product.lowStockThreshold || 5,
      freeShipping: Boolean(product.freeShipping),
      shippingPrice: product.shippingPrice || "",
      tags:
        product.tags?.length > 0
          ? product.tags.join(", ")
          : "",
      isFeatured: Boolean(product.isFeatured),
      isActive: product.isActive !== false,
    });

    setShowModal(true);
  };

  const changeHandler = (e) => {
    const {
      name,
      value,
      type,
      checked,
    } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ||
        type === "switch"
          ? checked
          : value,
    }));
  };

  const uploadFileHandler = async (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const uploadData = new FormData();

    uploadData.append("image", file);

    try {
      setUploading(true);

      const { data } = await axios.post(
        "/upload",
        uploadData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setFormData((prev) => ({
        ...prev,
        image:
          data.image ||
          data.url ||
          data.secure_url ||
          "",
      }));

      toast.success("Image uploaded successfully");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Image upload failed"
      );
    } finally {
      setUploading(false);
    }
  };

  const updateProductHandler = async (e) => {
    e.preventDefault();

    if (!selectedProduct) return;

    try {
      setUpdating(true);

      const payload = {
        name: formData.name,
        image: formData.image,
        images: formData.image ? [formData.image] : [],
        brand: formData.brand,
        category: formData.category,
        description: formData.description,
        price: Number(formData.price || 0),
        originalPrice:
          Number(formData.originalPrice || 0) ||
          Number(formData.price || 0),
        countInStock: Number(formData.countInStock || 0),
        lowStockThreshold: Number(formData.lowStockThreshold || 5),
        freeShipping: Boolean(formData.freeShipping),
        shippingPrice: Number(formData.shippingPrice || 0),
        tags:
          formData.tags.trim().length > 0
            ? formData.tags
                .split(",")
                .map((tag) => tag.trim())
                .filter(Boolean)
            : [],
        isFeatured: Boolean(formData.isFeatured),
        isActive: Boolean(formData.isActive),
      };

      await axios.put(
        `/products/${selectedProduct._id}`,
        payload
      );

      toast.success("Product updated successfully");

      setShowModal(false);

      fetchProducts(true);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to update product"
      );
    } finally {
      setUpdating(false);
    }
  };

  const deleteProductHandler = async (product) => {
    if (
      !window.confirm(
        `Are you sure you want to delete "${product.name}"?`
      )
    ) {
      return;
    }

    try {
      setDeletingId(product._id);

      await axios.delete(`/products/${product._id}`);

      toast.success("Product deleted successfully");

      setProducts((prev) =>
        prev.filter((item) => item._id !== product._id)
      );
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
      <main className="elite-admin-products-page">
        <Message variant="danger">
          {error}
        </Message>

        <Button
          variant="dark"
          className="rounded-pill fw-bold mt-3"
          onClick={() => fetchProducts()}
        >
          Retry
        </Button>
      </main>
    );
  }

  return (
    <main className="elite-admin-products-page">
      <motion.section
        className="elite-admin-products-hero"
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
        <div>
          <Badge
            bg="warning"
            text="dark"
            className="elite-admin-products-hero-badge"
          >
            <FaCrown className="me-2" />
            EliteShop Inventory Control
          </Badge>

          <h1>Manage Products</h1>

          <p>
            Edit products, update stock, highlight featured items,
            manage discounts, control product visibility and keep your
            marketplace inventory production-ready.
          </p>
        </div>

        <div className="elite-admin-products-hero-actions">
          <Button
            variant="light"
            as={Link}
            to="/seller/add-product"
          >
            Add Product
          </Button>

          <Button
            variant="outline-light"
            disabled={refreshing}
            onClick={() => fetchProducts(true)}
          >
            <FaSyncAlt className="me-2" />
            {refreshing ? "Refreshing..." : "Refresh"}
          </Button>
        </div>

        <motion.div
          className="elite-admin-products-floating-badge"
          animate={{
            y: [0, -10, 0],
          }}
          transition={{
            duration: 3.5,
            repeat: Infinity,
          }}
        >
          <FaStore />
          Live Stock
        </motion.div>
      </motion.section>

      <Row className="g-4 mb-4">
        <Col md={6} xl={3}>
          <Card className="elite-admin-product-stat total">
            <Card.Body>
              <FaBoxOpen />
              <span>Total Products</span>
              <h2>{stats.totalProducts}</h2>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} xl={3}>
          <Card className="elite-admin-product-stat revenue">
            <Card.Body>
              <FaRupeeSign />
              <span>Inventory Value</span>
              <h2>₹{formatPrice(stats.inventoryValue)}</h2>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} xl={3}>
          <Card className="elite-admin-product-stat warning">
            <Card.Body>
              <FaExclamationTriangle />
              <span>Low Stock</span>
              <h2>{stats.lowStockProducts}</h2>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} xl={3}>
          <Card className="elite-admin-product-stat featured">
            <Card.Body>
              <FaStar />
              <span>Featured</span>
              <h2>{stats.featuredProducts}</h2>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-4 mb-4">
        <Col lg={8}>
          <Card className="elite-admin-products-showcase-card">
            <Card.Body>
              <div className="elite-admin-products-section-heading">
                <div>
                  <h4>Inventory Overview</h4>
                  <p>
                    Fast actions for stock, visibility, featured products
                    and low stock monitoring.
                  </p>
                </div>

                <Badge bg="dark">
                  {stats.activeProducts} active
                </Badge>
              </div>

              <Row className="g-3">
                <Col md={4}>
                  <div className="elite-admin-products-mini-card blue">
                    <FaChartLine />
                    <span>Active Products</span>
                    <strong>{stats.activeProducts}</strong>
                  </div>
                </Col>

                <Col md={4}>
                  <div className="elite-admin-products-mini-card red">
                    <FaTimesCircle />
                    <span>Out Of Stock</span>
                    <strong>{stats.outOfStockProducts}</strong>
                  </div>
                </Col>

                <Col md={4}>
                  <div className="elite-admin-products-mini-card green">
                    <FaCheckCircle />
                    <span>Healthy Stock</span>
                    <strong>
                      {Math.max(
                        stats.totalProducts -
                          stats.lowStockProducts -
                          stats.outOfStockProducts,
                        0
                      )}
                    </strong>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className="elite-admin-products-tip-card">
            <Card.Body>
              <FaShippingFast />
              <h4>Seller Quality Tip</h4>
              <p>
                Keep stock updated and use featured products only for
                best-performing items. This improves the customer
                shopping flow.
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="elite-admin-products-filter-card">
        <Card.Body>
          <Row className="g-3 align-items-center">
            <Col lg={4}>
              <InputGroup className="elite-admin-products-search">
                <InputGroup.Text>
                  <FaSearch />
                </InputGroup.Text>

                <Form.Control
                  type="text"
                  placeholder="Search products, brand, category, seller, tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Col>

            <Col md={4} lg={2}>
              <Form.Select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="all">All Categories</option>

                {categories.map((category) => (
                  <option
                    key={category}
                    value={category}
                  >
                    {category}
                  </option>
                ))}
              </Form.Select>
            </Col>

            <Col md={4} lg={2}>
              <Form.Select
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value)}
              >
                <option value="all">All Stock</option>
                <option value="active">Active</option>
                <option value="hidden">Hidden</option>
                <option value="available">Available</option>
                <option value="low">Low Stock</option>
                <option value="out">Out Of Stock</option>
                <option value="featured">Featured</option>
              </Form.Select>
            </Col>

            <Col md={4} lg={2}>
              <Form.Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="priceHigh">Price High</option>
                <option value="priceLow">Price Low</option>
                <option value="stockHigh">Stock High</option>
                <option value="stockLow">Stock Low</option>
                <option value="rating">Top Rated</option>
              </Form.Select>
            </Col>

            <Col lg={2}>
              <Button
                className="elite-admin-products-refresh-btn"
                disabled={refreshing}
                onClick={() => fetchProducts(true)}
              >
                <FaFilter className="me-2" />
                Apply
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <div className="elite-admin-products-active-filter">
        <span>
          <FaFilter />
          Showing:
        </span>

        <Badge bg="primary">
          {filteredProducts.length} product(s)
        </Badge>

        <Badge bg="success">
          {stats.activeProducts} active
        </Badge>

        <Badge bg="warning" text="dark">
          {stats.lowStockProducts} low stock
        </Badge>

        <Badge bg="danger">
          {stats.outOfStockProducts} out
        </Badge>
      </div>

      <Card className="elite-admin-products-table-card">
        <Card.Body>
          <div className="elite-admin-products-section-heading">
            <div>
              <h4>Products List</h4>
              <p>
                Manage product price, stock, status, featured visibility
                and seller inventory.
              </p>
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="elite-admin-products-empty">
              <FaBoxOpen />

              <h4>No products found</h4>

              <p>
                Try changing search text, stock filter or category.
              </p>
            </div>
          ) : (
            <Table
              responsive
              hover
              className="elite-admin-products-table"
            >
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Seller</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Featured</th>
                  <th>Status</th>
                  <th>Rating</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredProducts.map((product) => {
                  const stock = Number(product.countInStock || 0);
                  const threshold = Number(product.lowStockThreshold || 5);
                  const lowStock = stock > 0 && stock <= threshold;
                  const discount = calculateDiscount(product);

                  return (
                    <tr key={product._id}>
                      <td>
                        <div className="elite-admin-product-info">
                          <Image
                            src={product.image || "/placeholder.svg"}
                            alt={product.name}
                          />

                          <div>
                            <strong>{product.name}</strong>

                            <small>{product.brand || "EliteShop"}</small>

                            {product.tags?.length > 0 && (
                              <div className="elite-admin-product-tags">
                                {product.tags.slice(0, 2).map((tag) => (
                                  <span key={tag}>
                                    <FaTags />
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      <td>
                        <Badge
                          bg="secondary"
                          className="elite-admin-products-badge"
                        >
                          {product.category}
                        </Badge>
                      </td>

                      <td>
                        <strong>
                          {product.seller?.name ||
                            product.user?.name ||
                            "Admin"}
                        </strong>
                      </td>

                      <td>
                        <strong className="elite-admin-product-price">
                          ₹{formatPrice(product.price)}
                        </strong>

                        {Number(product.originalPrice || 0) >
                          Number(product.price || 0) && (
                          <div className="elite-admin-product-discount">
                            {discount}% OFF
                          </div>
                        )}
                      </td>

                      <td>
                        {stock === 0 ? (
                          <Badge
                            bg="danger"
                            className="elite-admin-products-badge"
                          >
                            Out
                          </Badge>
                        ) : lowStock ? (
                          <Badge
                            bg="warning"
                            text="dark"
                            className="elite-admin-products-badge"
                          >
                            {stock} left
                          </Badge>
                        ) : (
                          <Badge
                            bg="success"
                            className="elite-admin-products-badge"
                          >
                            {stock}
                          </Badge>
                        )}
                      </td>

                      <td>
                        {product.isFeatured ? (
                          <Badge
                            bg="success"
                            className="elite-admin-products-badge"
                          >
                            Yes
                          </Badge>
                        ) : (
                          <Badge
                            bg="light"
                            text="dark"
                            className="elite-admin-products-badge"
                          >
                            No
                          </Badge>
                        )}
                      </td>

                      <td>
                        {product.isActive === false ? (
                          <Badge
                            bg="danger"
                            className="elite-admin-products-badge"
                          >
                            Hidden
                          </Badge>
                        ) : (
                          <Badge
                            bg="primary"
                            className="elite-admin-products-badge"
                          >
                            Active
                          </Badge>
                        )}
                      </td>

                      <td>
                        <strong>⭐ {product.rating || 0}</strong>

                        <small className="d-block text-muted">
                          {product.numReviews || 0} reviews
                        </small>
                      </td>

                      <td>
                        <div className="elite-admin-products-actions">
                          <Button
                            as={Link}
                            to={`/product/${product.slug || product._id}`}
                            size="sm"
                            variant="outline-dark"
                          >
                            <FaEye />
                          </Button>

                          <Button
                            size="sm"
                            variant="dark"
                            onClick={() => openEditModal(product)}
                          >
                            <FaEdit />
                          </Button>

                          <Button
                            size="sm"
                            variant="danger"
                            disabled={deletingId === product._id}
                            onClick={() => deleteProductHandler(product)}
                          >
                            {deletingId === product._id ? (
                              "..."
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
          )}
        </Card.Body>
      </Card>

      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        centered
        size="lg"
        className="elite-admin-products-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <FaEdit className="me-2" />
            Edit Product
          </Modal.Title>
        </Modal.Header>

        <Form onSubmit={updateProductHandler}>
          <Modal.Body>
            <Row className="g-4">
              <Col md={4}>
                <div className="elite-admin-products-image-preview">
                  <Image
                    src={formData.image || "/placeholder.svg"}
                    alt={formData.name}
                  />

                  {formData.isFeatured && (
                    <span>
                      <FaStar />
                      Featured
                    </span>
                  )}
                </div>

                <Form.Group className="mb-3">
                  <Form.Label>Upload Image</Form.Label>

                  <Form.Control
                    type="file"
                    accept="image/*"
                    onChange={uploadFileHandler}
                  />

                  {uploading && (
                    <div className="elite-admin-products-uploading">
                      <Spinner
                        animation="border"
                        size="sm"
                      />
                      Uploading...
                    </div>
                  )}
                </Form.Group>

                <Alert
                  variant="info"
                  className="elite-admin-products-alert"
                >
                  Upload a clear product image for a premium ecommerce
                  look.
                </Alert>
              </Col>

              <Col md={8}>
                <Row className="g-3">
                  <Col md={12}>
                    <Form.Group>
                      <Form.Label>Product Name</Form.Label>

                      <Form.Control
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={changeHandler}
                        required
                      />
                    </Form.Group>
                  </Col>

                  <Col md={12}>
                    <Form.Group>
                      <Form.Label>Image URL</Form.Label>

                      <Form.Control
                        type="text"
                        name="image"
                        value={formData.image}
                        onChange={changeHandler}
                        required
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Brand</Form.Label>

                      <Form.Control
                        type="text"
                        name="brand"
                        value={formData.brand}
                        onChange={changeHandler}
                        required
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Category</Form.Label>

                      <Form.Select
                        name="category"
                        value={formData.category}
                        onChange={changeHandler}
                        required
                      >
                        <option value="">Select Category</option>

                        {categories.map((category) => (
                          <option
                            key={category}
                            value={category}
                          >
                            {category}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>

                  <Col md={12}>
                    <Form.Group>
                      <Form.Label>Description</Form.Label>

                      <Form.Control
                        as="textarea"
                        rows={4}
                        name="description"
                        value={formData.description}
                        onChange={changeHandler}
                        required
                      />
                    </Form.Group>
                  </Col>

                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Price</Form.Label>

                      <Form.Control
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={changeHandler}
                        required
                      />
                    </Form.Group>
                  </Col>

                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Original Price</Form.Label>

                      <Form.Control
                        type="number"
                        name="originalPrice"
                        value={formData.originalPrice}
                        onChange={changeHandler}
                      />
                    </Form.Group>
                  </Col>

                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Stock</Form.Label>

                      <Form.Control
                        type="number"
                        name="countInStock"
                        value={formData.countInStock}
                        onChange={changeHandler}
                        required
                      />
                    </Form.Group>
                  </Col>

                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Low Stock Alert</Form.Label>

                      <Form.Control
                        type="number"
                        name="lowStockThreshold"
                        value={formData.lowStockThreshold}
                        onChange={changeHandler}
                      />
                    </Form.Group>
                  </Col>

                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Shipping Price</Form.Label>

                      <Form.Control
                        type="number"
                        name="shippingPrice"
                        value={formData.shippingPrice}
                        onChange={changeHandler}
                      />
                    </Form.Group>
                  </Col>

                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Tags</Form.Label>

                      <Form.Control
                        type="text"
                        name="tags"
                        value={formData.tags}
                        onChange={changeHandler}
                        placeholder="mobile, premium, trending"
                      />
                    </Form.Group>
                  </Col>

                  <Col md={4}>
                    <Form.Check
                      type="switch"
                      label="Free Shipping"
                      name="freeShipping"
                      checked={formData.freeShipping}
                      onChange={changeHandler}
                      className="elite-admin-products-switch"
                    />
                  </Col>

                  <Col md={4}>
                    <Form.Check
                      type="switch"
                      label="Featured Product"
                      name="isFeatured"
                      checked={formData.isFeatured}
                      onChange={changeHandler}
                      className="elite-admin-products-switch"
                    />
                  </Col>

                  <Col md={4}>
                    <Form.Check
                      type="switch"
                      label="Active Product"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={changeHandler}
                      className="elite-admin-products-switch"
                    />
                  </Col>
                </Row>
              </Col>
            </Row>
          </Modal.Body>

          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => setShowModal(false)}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              variant="dark"
              disabled={updating || uploading}
            >
              {updating ? (
                <>
                  <Spinner
                    animation="border"
                    size="sm"
                    className="me-2"
                  />
                  Updating...
                </>
              ) : (
                "Update Product"
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </main>
  );
};

export default AdminProductsPage;