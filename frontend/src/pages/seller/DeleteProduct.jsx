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
  Badge,
  Image,
  Alert,
  ListGroup,
  Form,
  Spinner,
  ProgressBar,
} from "react-bootstrap";

import {
  FaArrowLeft,
  FaTrash,
  FaEye,
  FaBoxOpen,
  FaRupeeSign,
  FaFire,
  FaStar,
  FaExclamationTriangle,
  FaStore,
  FaEdit,
  FaShieldAlt,
  FaTimesCircle,
  FaCheckCircle,
  FaImages,
  FaInfoCircle,
  FaWarehouse,
  FaTruck,
  FaTags,
  FaBolt,
  FaLock,
  FaUndo,
  FaChartLine,
} from "react-icons/fa";

import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import { motion } from "framer-motion";
import { toast } from "react-toastify";

import Loader from "../../components/Loader";
import Message from "../../components/Message";
import Rating from "../../components/Rating";

import api from "../../utils/axios";

import "../../styles/SellerDeleteProduct.css";

const formatPrice = (amount) => {
  return Number(amount || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  });
};

const DeleteProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);

  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [deactivating, setDeactivating] = useState(false);

  const [error, setError] = useState("");

  const [confirmName, setConfirmName] = useState("");
  const [confirmCheck, setConfirmCheck] = useState(false);
  const [secondConfirmCheck, setSecondConfirmCheck] = useState(false);

  const [selectedImage, setSelectedImage] = useState("");

  const fetchProduct = async () => {
    try {
      setLoading(true);
      setError("");

      const { data } = await api.get(`/products/${id}`);

      setProduct(data);
      setSelectedImage(data.image || data.images?.[0] || "");
    } catch (error) {
      setError(
        error.response?.data?.message ||
          error.message ||
          "Failed to load product"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const inventoryValue = useMemo(() => {
    return (
      Number(product?.price || 0) *
      Number(product?.countInStock || 0)
    );
  }, [product]);

  const discountPercentage = useMemo(() => {
    if (!product) return 0;

    const price = Number(product.price || 0);
    const originalPrice = Number(product.originalPrice || 0);

    if (originalPrice > price && price > 0) {
      return Math.round(
        ((originalPrice - price) / originalPrice) * 100
      );
    }

    return Number(product.discountPercentage || 0);
  }, [product]);

  const galleryImages = useMemo(() => {
    if (!product) return [];

    return Array.from(
      new Set([
        product.image,
        ...(Array.isArray(product.images) ? product.images : []),
      ].filter(Boolean))
    );
  }, [product]);

  const isLowStock = useMemo(() => {
    if (!product) return false;

    return (
      Number(product.countInStock || 0) <=
      Number(product.lowStockThreshold || 5)
    );
  }, [product]);

  const confirmationProgress = useMemo(() => {
    let progress = 0;

    if (confirmName.trim() === product?.name) {
      progress += 60;
    }

    if (confirmCheck) {
      progress += 20;
    }

    if (secondConfirmCheck) {
      progress += 20;
    }

    return progress;
  }, [
    confirmName,
    confirmCheck,
    secondConfirmCheck,
    product,
  ]);

  const canDelete =
    confirmName.trim() === product?.name &&
    confirmCheck &&
    secondConfirmCheck &&
    !deleting;

  const productRiskLevel = useMemo(() => {
    if (!product) return "Low";

    if (
      Number(product.soldCount || 0) > 0 ||
      Number(product.views || 0) > 100 ||
      Number(product.numReviews || 0) > 0
    ) {
      return "High";
    }

    if (
      Number(product.countInStock || 0) > 0 ||
      product.isFeatured
    ) {
      return "Medium";
    }

    return "Low";
  }, [product]);

  const riskVariant =
    productRiskLevel === "High"
      ? "danger"
      : productRiskLevel === "Medium"
      ? "warning"
      : "success";

  const deleteProductHandler = async () => {
    if (!product) return;

    if (confirmName.trim() !== product.name) {
      toast.error("Please type the exact product name to confirm");
      return;
    }

    if (!confirmCheck || !secondConfirmCheck) {
      toast.error("Please complete both confirmation checks");
      return;
    }

    try {
      setDeleting(true);

      await api.delete(`/products/${id}`);

      toast.success("Product deleted successfully");

      navigate("/seller/dashboard");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to delete product"
      );
    } finally {
      setDeleting(false);
    }
  };

  const deactivateProductHandler = async () => {
    if (!product) return;

    try {
      setDeactivating(true);

      const payload = {
        name: product.name,
        image: product.image,
        images: product.images || [],
        brand: product.brand,
        category: product.category,
        description: product.description,
        price: Number(product.price || 0),
        originalPrice:
          Number(product.originalPrice || 0) ||
          Number(product.price || 0),
        countInStock: Number(product.countInStock || 0),
        freeShipping: Boolean(product.freeShipping),
        shippingPrice: Number(product.shippingPrice || 0),
        tags: product.tags || [],
        isFeatured: Boolean(product.isFeatured),
        isActive: false,
        lowStockThreshold: Number(product.lowStockThreshold || 5),
      };

      await api.put(`/products/${id}`, payload);

      toast.success("Product deactivated instead of deleted");

      navigate("/seller/dashboard");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to deactivate product"
      );
    } finally {
      setDeactivating(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return (
      <main className="elite-delete-product-page">
        <Message variant="danger">
          {error}
        </Message>

        <div className="d-flex gap-2 flex-wrap mt-3">
          <Button
            variant="dark"
            className="rounded-pill fw-bold"
            onClick={fetchProduct}
          >
            Retry
          </Button>

          <Button
            variant="outline-dark"
            className="rounded-pill fw-bold"
            onClick={() => navigate("/seller/dashboard")}
          >
            Back To Dashboard
          </Button>
        </div>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="elite-delete-product-page">
        <Message variant="danger">
          Product not found
        </Message>
      </main>
    );
  }

  return (
    <motion.main
      className="elite-delete-product-page"
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
      <section className="elite-delete-hero">
        <div>
          <Badge
            bg="light"
            text="dark"
            className="elite-delete-hero-badge"
          >
            <FaShieldAlt className="me-2" />
            Seller Safety Control
          </Badge>

          <h1>Delete Product</h1>

          <p>
            Review this product carefully before removing it from your
            EliteShop seller catalog. Delete is permanent, while deactivate
            safely hides the product.
          </p>
        </div>

        <div className="elite-delete-hero-actions">
          <Button
            variant="light"
            onClick={() => navigate("/seller/dashboard")}
          >
            <FaArrowLeft className="me-2" />
            Dashboard
          </Button>

          <Button
            as={Link}
            to={`/seller/edit-product/${product._id}`}
            variant="outline-light"
          >
            <FaEdit className="me-2" />
            Edit Instead
          </Button>

          {(product.slug || product._id) && (
            <Button
              as={Link}
              to={`/product/${product.slug || product._id}`}
              variant="outline-light"
            >
              <FaEye className="me-2" />
              View Product
            </Button>
          )}
        </div>

        <motion.div
          className="elite-delete-floating"
          animate={{
            y: [0, -10, 0],
          }}
          transition={{
            duration: 3.5,
            repeat: Infinity,
          }}
        >
          <FaExclamationTriangle />
          Permanent Action
        </motion.div>
      </section>

      <Alert
        variant="danger"
        className="elite-delete-warning"
      >
        <FaExclamationTriangle />

        <div>
          <h5>Permanent Delete Warning</h5>

          <p>
            This product will be removed from your seller store. Customers
            will no longer be able to view or buy it. Use Edit or Deactivate
            if you only want to hide it temporarily.
          </p>
        </div>
      </Alert>

      <Row className="g-4 mb-4">
        <Col md={6} xl={3}>
          <Card className="elite-delete-stat-card price">
            <Card.Body>
              <div>
                <span>Price</span>
                <h2>₹{formatPrice(product.price)}</h2>
                <p>Selling price</p>
              </div>

              <FaRupeeSign />
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} xl={3}>
          <Card className="elite-delete-stat-card stock">
            <Card.Body>
              <div>
                <span>Stock</span>
                <h2>{product.countInStock || 0}</h2>
                <p>{isLowStock ? "Low stock" : "Healthy stock"}</p>
              </div>

              <FaBoxOpen />
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} xl={3}>
          <Card className="elite-delete-stat-card views">
            <Card.Body>
              <div>
                <span>Views</span>
                <h2>{product.views || 0}</h2>
                <p>Product visits</p>
              </div>

              <FaEye />
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} xl={3}>
          <Card className="elite-delete-stat-card sold">
            <Card.Body>
              <div>
                <span>Sold</span>
                <h2>{product.soldCount || 0}</h2>
                <p>Order signal</p>
              </div>

              <FaFire />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-4 mb-4">
        <Col lg={8}>
          <Card className="elite-delete-risk-card">
            <Card.Body>
              <div className="elite-delete-risk-head">
                <div>
                  <h4>
                    <FaChartLine className="me-2" />
                    Delete Risk Review
                  </h4>

                  <p>
                    Products with sales, views, reviews or stock should
                    usually be deactivated instead of deleted.
                  </p>
                </div>

                <Badge bg={riskVariant}>
                  {productRiskLevel} Risk
                </Badge>
              </div>

              <div className="elite-delete-risk-grid">
                <div>
                  <FaEye />
                  <strong>{product.views || 0}</strong>
                  <span>Views</span>
                </div>

                <div>
                  <FaFire />
                  <strong>{product.soldCount || 0}</strong>
                  <span>Sold</span>
                </div>

                <div>
                  <FaStar />
                  <strong>{product.numReviews || 0}</strong>
                  <span>Reviews</span>
                </div>

                <div>
                  <FaWarehouse />
                  <strong>₹{formatPrice(inventoryValue)}</strong>
                  <span>Inventory Value</span>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className="elite-delete-recommend-card">
            <Card.Body>
              <FaBolt />

              <h4>Recommended</h4>

              <p>
                Deactivate product first if it has stock, orders, reviews or
                customer traffic. Delete only unused test products.
              </p>

              <Button
                variant="light"
                className="w-100 rounded-pill fw-bold"
                disabled={deactivating || deleting}
                onClick={deactivateProductHandler}
              >
                {deactivating ? (
                  <>
                    <Spinner
                      animation="border"
                      size="sm"
                      className="me-2"
                    />
                    Deactivating...
                  </>
                ) : (
                  <>
                    <FaLock className="me-2" />
                    Deactivate Instead
                  </>
                )}
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-4">
        <Col lg={7}>
          <Card className="elite-delete-product-card">
            <Row className="g-0">
              <Col md={5}>
                <div className="elite-delete-image-wrap">
                  <Image
                    src={selectedImage || product.image || "/placeholder.svg"}
                    alt={product.name}
                  />

                  {product.isFeatured && (
                    <Badge
                      bg="danger"
                      className="elite-featured-badge"
                    >
                      Featured
                    </Badge>
                  )}

                  {product.isActive === false ? (
                    <Badge
                      bg="secondary"
                      className="elite-status-badge"
                    >
                      Inactive
                    </Badge>
                  ) : (
                    <Badge
                      bg="success"
                      className="elite-status-badge"
                    >
                      Active
                    </Badge>
                  )}
                </div>
              </Col>

              <Col md={7}>
                <Card.Body>
                  <div className="elite-delete-product-title">
                    <h3>{product.name}</h3>

                    {isLowStock && (
                      <Badge
                        bg="warning"
                        text="dark"
                      >
                        Low Stock
                      </Badge>
                    )}
                  </div>

                  <div className="mb-3">
                    <Rating
                      value={product.rating || 0}
                      text={`${product.numReviews || 0} reviews`}
                    />
                  </div>

                  <div className="elite-delete-price-row">
                    <strong>₹{formatPrice(product.price)}</strong>

                    {Number(product.originalPrice || 0) >
                      Number(product.price || 0) && (
                      <>
                        <del>
                          ₹{formatPrice(product.originalPrice)}
                        </del>

                        <Badge bg="success">
                          {discountPercentage}% OFF
                        </Badge>
                      </>
                    )}
                  </div>

                  <p className="elite-delete-description">
                    {product.description}
                  </p>

                  <ListGroup
                    variant="flush"
                    className="elite-delete-list"
                  >
                    <ListGroup.Item>
                      <span>Brand</span>
                      <strong>{product.brand}</strong>
                    </ListGroup.Item>

                    <ListGroup.Item>
                      <span>Category</span>
                      <Badge bg="secondary">
                        {product.category}
                      </Badge>
                    </ListGroup.Item>

                    <ListGroup.Item>
                      <span>Seller</span>
                      <strong>
                        <FaStore className="me-1" />
                        {product.seller?.sellerInfo?.shopName ||
                          product.seller?.name ||
                          "Seller"}
                      </strong>
                    </ListGroup.Item>

                    <ListGroup.Item>
                      <span>Inventory Value</span>
                      <strong>₹{formatPrice(inventoryValue)}</strong>
                    </ListGroup.Item>

                    <ListGroup.Item>
                      <span>Shipping</span>
                      <strong>
                        {product.freeShipping
                          ? "Free Shipping"
                          : `₹${formatPrice(product.shippingPrice)}`}
                      </strong>
                    </ListGroup.Item>

                    <ListGroup.Item>
                      <span>Low Stock Alert</span>
                      <strong>
                        {product.lowStockThreshold || 5}
                      </strong>
                    </ListGroup.Item>

                    <ListGroup.Item>
                      <span>Status</span>

                      {product.isActive === false ? (
                        <Badge bg="dark">
                          <FaTimesCircle className="me-1" />
                          Inactive
                        </Badge>
                      ) : (
                        <Badge bg="success">
                          <FaCheckCircle className="me-1" />
                          Active
                        </Badge>
                      )}
                    </ListGroup.Item>
                  </ListGroup>

                  {product.tags?.length > 0 && (
                    <div className="elite-delete-tags">
                      {product.tags.map((tag) => (
                        <Badge
                          bg="secondary"
                          key={tag}
                        >
                          <FaTags className="me-1" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </Card.Body>
              </Col>
            </Row>
          </Card>

          {galleryImages.length > 0 && (
            <Card className="elite-delete-gallery-card mt-4">
              <Card.Body>
                <h4>
                  <FaImages className="me-2" />
                  Product Gallery
                </h4>

                <div className="elite-delete-gallery">
                  {galleryImages.map((img, index) => (
                    <button
                      type="button"
                      key={`${img}-${index}`}
                      className={
                        selectedImage === img
                          ? "elite-delete-gallery-item active"
                          : "elite-delete-gallery-item"
                      }
                      onClick={() => setSelectedImage(img)}
                    >
                      <Image
                        src={img}
                        alt={`Product ${index + 1}`}
                      />
                    </button>
                  ))}
                </div>
              </Card.Body>
            </Card>
          )}
        </Col>

        <Col lg={5}>
          <div className="elite-delete-confirm-stack">
            <Card className="elite-delete-confirm-card">
              <Card.Body>
                <div className="elite-delete-icon">
                  <FaTrash />
                </div>

                <h3>Confirm Product Delete</h3>

                <p>
                  To prevent accidental deletion, type the exact product name
                  and complete both confirmations.
                </p>

                <Alert
                  variant="warning"
                  className="elite-delete-name-alert"
                >
                  <strong>Type exactly:</strong>
                  <span>{product.name}</span>
                </Alert>

                <div className="elite-delete-progress-box">
                  <span>Delete confirmation</span>
                  <strong>{confirmationProgress}%</strong>
                </div>

                <ProgressBar
                  now={confirmationProgress}
                  className="elite-delete-progress"
                />

                <Form className="mt-4">
                  <Form.Group className="mb-3">
                    <Form.Label>Product name confirmation</Form.Label>

                    <Form.Control
                      type="text"
                      value={confirmName}
                      onChange={(e) => setConfirmName(e.target.value)}
                      placeholder={product.name}
                      autoComplete="off"
                    />

                    {confirmName &&
                      confirmName.trim() !== product.name && (
                        <small className="text-danger fw-bold">
                          Product name does not match.
                        </small>
                      )}
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Check
                      type="checkbox"
                      label="I understand this action will permanently remove this product from my store."
                      checked={confirmCheck}
                      onChange={(e) => setConfirmCheck(e.target.checked)}
                    />
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Check
                      type="checkbox"
                      label="I understand deactivate is safer if this product has orders, reviews, stock, or customer traffic."
                      checked={secondConfirmCheck}
                      onChange={(e) => setSecondConfirmCheck(e.target.checked)}
                    />
                  </Form.Group>

                  <div className="elite-delete-button-stack">
                    <Button
                      variant="danger"
                      size="lg"
                      disabled={!canDelete}
                      onClick={deleteProductHandler}
                    >
                      {deleting ? (
                        <>
                          <Spinner
                            animation="border"
                            size="sm"
                            className="me-2"
                          />
                          Deleting...
                        </>
                      ) : (
                        <>
                          <FaTrash className="me-2" />
                          Delete Product Permanently
                        </>
                      )}
                    </Button>

                    <Button
                      variant="outline-dark"
                      onClick={() => navigate("/seller/dashboard")}
                      disabled={deleting}
                    >
                      <FaUndo className="me-2" />
                      Cancel
                    </Button>

                    <Button
                      as={Link}
                      to={`/seller/edit-product/${product._id}`}
                      variant="dark"
                      disabled={deleting}
                    >
                      <FaEdit className="me-2" />
                      Edit Product Instead
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>

            <Card className="elite-delete-safe-card">
              <Card.Body>
                <FaInfoCircle />

                <div>
                  <h5>Safer option</h5>

                  <p>
                    If you only want to hide the product, edit it and turn off
                    <strong> Active Product</strong> instead of deleting.
                  </p>
                </div>
              </Card.Body>
            </Card>
          </div>
        </Col>
      </Row>
    </motion.main>
  );
};

export default DeleteProduct;