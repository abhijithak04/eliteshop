import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Image,
  Badge,
  Alert,
  Spinner,
} from "react-bootstrap";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import { motion } from "framer-motion";
import { toast } from "react-toastify";

import {
  FaTrash,
  FaShoppingCart,
  FaHeart,
  FaArrowLeft,
  FaStore,
  FaTag,
  FaBoxOpen,
  FaCheckCircle,
  FaTimesCircle,
  FaGift,
} from "react-icons/fa";

import Loader from "../../components/Loader";
import Rating from "../../components/Rating";

import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";

import api from "../../utils/axios";

const formatPrice = (value) => {
  return Number(value || 0).toLocaleString("en-IN");
};

const WishlistPage = () => {
  const navigate = useNavigate();

  const { userInfo } = useAuth();
  const { addToCart } = useCart();

  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState("");

  const wishlistCount = wishlist.length;

  const totalWishlistValue = useMemo(() => {
    return wishlist.reduce(
      (acc, product) => acc + Number(product.price || 0),
      0
    );
  }, [wishlist]);

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        setLoading(true);

        const { data } = await api.get("/users/wishlist");

        const list = Array.isArray(data)
          ? data
          : data?.wishlist || data?.products || [];

        setWishlist(list);
      } catch (error) {
        toast.error(
          error.response?.data?.message ||
            error.message ||
            "Failed to load wishlist"
        );
      } finally {
        setLoading(false);
      }
    };

    if (!userInfo) {
      navigate("/login?redirect=/wishlist");
      return;
    }

    fetchWishlist();
  }, [
    userInfo,
    navigate,
  ]);

  const removeWishlistHandler = async (productId) => {
    try {
      setRemovingId(productId);

      await api.delete(`/users/wishlist/${productId}`);

      setWishlist((prev) =>
        prev.filter((item) => item._id !== productId)
      );

      toast.success("Removed from wishlist");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to remove wishlist item"
      );
    } finally {
      setRemovingId("");
    }
  };

  const addToCartHandler = (product) => {
    if (Number(product.countInStock || 0) === 0) {
      toast.error("Product is out of stock");
      return;
    }

    addToCart(product, 1);

    toast.success("Added to cart");
    navigate("/cart");
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <main
      className="py-4"
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top left, rgba(37,99,235,.1), transparent 28%), linear-gradient(180deg, #f8fafc, #eef2ff 45%, #ffffff)",
      }}
    >
      <Container fluid="xl">
        <motion.section
          className="p-4 p-md-5 rounded-4 shadow-lg text-white mb-4"
          style={{
            background:
              "radial-gradient(circle at top right, rgba(250,204,21,.22), transparent 28%), linear-gradient(135deg, #020617, #172554 45%, #e11d48)",
          }}
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
          <Badge
            bg="warning"
            text="dark"
            className="rounded-pill px-3 py-2 fw-bold mb-3"
          >
            <FaHeart className="me-2" />
            EliteShop Wishlist
          </Badge>

          <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
            <div>
              <h1 className="fw-bold display-5 mb-2">
                My Wishlist
              </h1>

              <p
                className="mb-0"
                style={{
                  color: "rgba(255,255,255,.82)",
                  maxWidth: "720px",
                  fontWeight: 600,
                }}
              >
                Products you saved for later. Move items to cart when you are ready to buy.
              </p>
            </div>

            <Button
              variant="light"
              className="rounded-pill fw-bold px-4"
              onClick={() => navigate("/products")}
            >
              <FaArrowLeft className="me-2" />
              Continue Shopping
            </Button>
          </div>
        </motion.section>

        <Row className="g-4 mb-4">
          <Col md={4}>
            <Card className="border-0 rounded-4 shadow-sm h-100">
              <Card.Body>
                <FaHeart className="fs-3 text-danger mb-2" />
                <span className="text-muted fw-bold d-block">
                  Saved Items
                </span>
                <h3 className="fw-bold mb-0">
                  {wishlistCount}
                </h3>
              </Card.Body>
            </Card>
          </Col>

          <Col md={4}>
            <Card className="border-0 rounded-4 shadow-sm h-100">
              <Card.Body>
                <FaGift className="fs-3 text-success mb-2" />
                <span className="text-muted fw-bold d-block">
                  Wishlist Value
                </span>
                <h3 className="fw-bold mb-0">
                  ₹{formatPrice(totalWishlistValue)}
                </h3>
              </Card.Body>
            </Card>
          </Col>

          <Col md={4}>
            <Card className="border-0 rounded-4 shadow-sm h-100">
              <Card.Body>
                <FaShoppingCart className="fs-3 text-primary mb-2" />
                <span className="text-muted fw-bold d-block">
                  Quick Action
                </span>
                <h3 className="fw-bold mb-0">
                  Cart Ready
                </h3>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {wishlist.length === 0 ? (
          <Card className="border-0 rounded-4 shadow-sm text-center">
            <Card.Body className="p-5">
              <div
                className="mx-auto mb-3 rounded-4 d-grid place-items-center"
                style={{
                  width: "92px",
                  height: "92px",
                  background: "linear-gradient(135deg, #2563eb, #e11d48)",
                  color: "#fff",
                  fontSize: "2.4rem",
                  display: "grid",
                  placeItems: "center",
                }}
              >
                <FaHeart />
              </div>

              <h3 className="fw-bold">
                Your wishlist is empty
              </h3>

              <p className="text-muted fw-semibold">
                Save products you like and buy them later.
              </p>

              <Button
                variant="dark"
                className="rounded-pill fw-bold px-4"
                onClick={() => navigate("/products")}
              >
                Explore Products
              </Button>
            </Card.Body>
          </Card>
        ) : (
          <Row className="g-4">
            {wishlist.map((product, index) => {
              const productPath = `/product/${product.slug || product._id}`;
              const isOutOfStock = Number(product.countInStock || 0) === 0;

              return (
                <Col
                  key={product._id}
                  sm={12}
                  md={6}
                  lg={4}
                  xl={3}
                >
                  <motion.div
                    initial={{
                      opacity: 0,
                      y: 20,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    transition={{
                      duration: 0.3,
                      delay: index * 0.04,
                    }}
                    whileHover={{
                      y: -5,
                    }}
                  >
                    <Card className="shadow-sm border-0 rounded-4 h-100 overflow-hidden">
                      <div className="position-relative">
                        {product.isFeatured && (
                          <Badge
                            bg="danger"
                            className="position-absolute top-0 start-0 m-2 rounded-pill"
                          >
                            Featured
                          </Badge>
                        )}

                        {isOutOfStock && (
                          <Badge
                            bg="secondary"
                            className="position-absolute top-0 end-0 m-2 rounded-pill"
                          >
                            Out Of Stock
                          </Badge>
                        )}

                        <Link to={productPath}>
                          <Image
                            src={product.image || "/placeholder.svg"}
                            alt={product.name}
                            fluid
                            loading="lazy"
                            style={{
                              width: "100%",
                              height: "240px",
                              objectFit: "cover",
                            }}
                          />
                        </Link>
                      </div>

                      <Card.Body className="d-flex flex-column">
                        <Link
                          to={productPath}
                          className="text-decoration-none"
                        >
                          <Card.Title className="fw-bold text-dark">
                            {product.name}
                          </Card.Title>
                        </Link>

                        <div className="mb-2">
                          <Rating
                            value={Number(product.rating || 0)}
                            text={`${product.numReviews || 0} reviews`}
                          />
                        </div>

                        <div className="mb-2">
                          <strong className="text-primary fs-5">
                            ₹{formatPrice(product.price)}
                          </strong>

                          {Number(product.originalPrice || 0) >
                            Number(product.price || 0) && (
                            <>
                              <del className="text-muted ms-2">
                                ₹{formatPrice(product.originalPrice)}
                              </del>

                              <Badge
                                bg="success"
                                className="ms-2 rounded-pill"
                              >
                                {product.discountPercentage || "Deal"} OFF
                              </Badge>
                            </>
                          )}
                        </div>

                        <div className="small text-muted fw-semibold mb-3 d-flex flex-column gap-1">
                          <span>
                            <FaStore className="me-1" />
                            {product.brand || "EliteShop"}
                          </span>

                          <span>
                            <FaTag className="me-1" />
                            {product.category || "Product"}
                          </span>

                          <span>
                            {isOutOfStock ? (
                              <>
                                <FaTimesCircle className="me-1 text-danger" />
                                Out of stock
                              </>
                            ) : (
                              <>
                                <FaCheckCircle className="me-1 text-success" />
                                In stock
                              </>
                            )}
                          </span>
                        </div>

                        <div className="mt-auto d-grid gap-2">
                          <Button
                            variant="dark"
                            disabled={isOutOfStock}
                            onClick={() => addToCartHandler(product)}
                          >
                            <FaShoppingCart className="me-2" />
                            Add To Cart
                          </Button>

                          <Button
                            variant="outline-danger"
                            disabled={removingId === product._id}
                            onClick={() => removeWishlistHandler(product._id)}
                          >
                            {removingId === product._id ? (
                              <>
                                <Spinner
                                  animation="border"
                                  size="sm"
                                  className="me-2"
                                />
                                Removing...
                              </>
                            ) : (
                              <>
                                <FaTrash className="me-2" />
                                Remove
                              </>
                            )}
                          </Button>
                        </div>
                      </Card.Body>
                    </Card>
                  </motion.div>
                </Col>
              );
            })}
          </Row>
        )}

        {wishlist.length > 0 && (
          <Alert
            variant="info"
            className="border-0 rounded-4 mt-4 fw-semibold"
          >
            <FaBoxOpen className="me-2" />
            Wishlist products are saved in your account. You can move them to cart anytime.
          </Alert>
        )}
      </Container>
    </main>
  );
};

export default WishlistPage;