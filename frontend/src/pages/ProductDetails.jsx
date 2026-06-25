import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useParams,
  useNavigate,
  Link,
} from "react-router-dom";

import {
  Row,
  Col,
  Image,
  ListGroup,
  Card,
  Button,
  Form,
  Badge,
  Spinner,
  Container,
  Alert,
  InputGroup,
} from "react-bootstrap";

import { motion } from "framer-motion";

import {
  FaEye,
  FaFire,
  FaTruck,
  FaStore,
  FaBolt,
  FaShieldAlt,
  FaHeart,
  FaShareAlt,
  FaShoppingCart,
  FaArrowLeft,
  FaArrowRight,
  FaBoxOpen,
  FaCheckCircle,
  FaTimesCircle,
  FaExchangeAlt,
  FaLock,
  FaStar,
  FaPlus,
  FaMinus,
  FaTags,
  FaImages,
  FaCrown,
  FaHeadset,
  FaUndo,
  FaMapMarkerAlt,
  FaCreditCard,
  FaGem,
  FaClipboardCheck,
  FaWarehouse,
} from "react-icons/fa";

import { toast } from "react-toastify";

import Rating from "../components/Rating";
import Loader from "../components/Loader";
import Message from "../components/Message";
import ProductCard from "../components/ProductCard";

import { useCart } from "../context/CartContext";

import api from "../utils/axios";

import "../styles/ProductDetails.css";

const formatPrice = (value) => {
  return Number(value || 0).toLocaleString("en-IN");
};

const getDiscountPercentage = (product) => {
  if (Number(product?.discountPercentage || 0) > 0) {
    return Number(product.discountPercentage);
  }

  const price = Number(product?.price || 0);
  const originalPrice = Number(product?.originalPrice || 0);

  if (originalPrice > price && price > 0) {
    return Math.round(((originalPrice - price) / originalPrice) * 100);
  }

  return 0;
};

const ProductDetailsPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  const {
    addToCart,
    addToWishlist,
  } = useCart();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [relatedLoading, setRelatedLoading] = useState(false);
  const [error, setError] = useState("");

  const [qty, setQty] = useState(1);
  const [mainImage, setMainImage] = useState("");
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const [addingCart, setAddingCart] = useState(false);
  const [buyingNow, setBuyingNow] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  const [pinCode, setPinCode] = useState("");
  const [deliveryChecked, setDeliveryChecked] = useState(false);

  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);

  const images = useMemo(() => {
    if (!product) return [];

    return Array.from(
      new Set([
        product.image,
        ...(Array.isArray(product.images) ? product.images : []),
      ].filter(Boolean))
    );
  }, [product]);

  const discountPercentage = useMemo(() => {
    return getDiscountPercentage(product);
  }, [product]);

  const price = Number(product?.price || 0);
  const originalPrice = Number(product?.originalPrice || 0);
  const stockCount = Number(product?.countInStock || 0);

  const isOutOfStock = stockCount === 0;

  const isLowStock =
    stockCount > 0 &&
    stockCount <= Number(product?.lowStockThreshold || 5);

  const deliveryDate = useMemo(() => {
    return new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString(
      "en-IN",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  }, []);

  const sellerName =
    product?.seller?.sellerInfo?.shopName ||
    product?.seller?.name ||
    "Elite Seller";

  const productHighlights = useMemo(() => {
    const tags = Array.isArray(product?.tags) ? product.tags : [];

    const defaultHighlights = [
      product?.brand ? `Brand: ${product.brand}` : "Premium quality product",
      product?.category ? `Category: ${product.category}` : "Trusted category",
      product?.freeShipping ? "Free delivery available" : "Fast delivery support",
      isOutOfStock ? "Currently out of stock" : `${stockCount} items available`,
    ];

    return [...tags, ...defaultHighlights].filter(Boolean).slice(0, 6);
  }, [
    product,
    isOutOfStock,
    stockCount,
  ]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      setError("");

      let data;

      try {
        const response = await api.get(`/products/slug/${slug}`);
        data = response.data;
      } catch {
        const response = await api.get(`/products/${slug}`);
        data = response.data;
      }

      if (!data) {
        throw new Error("Product not found");
      }

      setProduct(data);
      setMainImage(data.image || data.images?.[0] || "");
      setActiveImageIndex(0);
      setQty(1);
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

  const fetchRelatedProducts = async (category, currentId) => {
    if (!category) return;

    try {
      setRelatedLoading(true);

      const { data } = await api.get(
        `/products?category=${encodeURIComponent(category)}`
      );

      const list = Array.isArray(data) ? data : data.products || [];

      setRelatedProducts(
        list
          .filter((item) => item._id !== currentId)
          .slice(0, 8)
      );
    } catch {
      setRelatedProducts([]);
    } finally {
      setRelatedLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [slug]);

  useEffect(() => {
    if (product?._id && product?.category) {
      fetchRelatedProducts(product.category, product._id);
    }
  }, [
    product?._id,
    product?.category,
  ]);

  const changeImage = (img, index) => {
    setMainImage(img);
    setActiveImageIndex(index);
  };

  const nextImage = () => {
    if (images.length <= 1) return;

    const nextIndex =
      activeImageIndex === images.length - 1
        ? 0
        : activeImageIndex + 1;

    setActiveImageIndex(nextIndex);
    setMainImage(images[nextIndex]);
  };

  const previousImage = () => {
    if (images.length <= 1) return;

    const previousIndex =
      activeImageIndex === 0
        ? images.length - 1
        : activeImageIndex - 1;

    setActiveImageIndex(previousIndex);
    setMainImage(images[previousIndex]);
  };

  const increaseQty = () => {
    if (qty >= Math.min(stockCount, 10)) return;
    setQty((prev) => prev + 1);
  };

  const decreaseQty = () => {
    if (qty <= 1) return;
    setQty((prev) => prev - 1);
  };

  const addToCartHandler = async () => {
    if (isOutOfStock) {
      toast.error("Product is out of stock");
      return;
    }

    try {
      setAddingCart(true);
      addToCart(product, qty);
      toast.success("Product added to cart");

      setTimeout(() => {
        navigate("/cart");
      }, 350);
    } finally {
      setAddingCart(false);
    }
  };

  const buyNowHandler = () => {
    if (isOutOfStock) {
      toast.error("Product is out of stock");
      return;
    }

    setBuyingNow(true);
    addToCart(product, qty);

    setTimeout(() => {
      setBuyingNow(false);
      navigate("/shipping");
    }, 300);
  };

  const wishlistHandler = async () => {
    if (!product?._id) return;

    try {
      setWishlistLoading(true);

      try {
        await api.post(`/users/wishlist/${product._id}`);
      } catch {
        // Context wishlist still works even if backend wishlist route is unavailable.
      }

      if (typeof addToWishlist === "function") {
        addToWishlist(product);
      }

      toast.success("Added to wishlist");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to add wishlist"
      );
    } finally {
      setWishlistLoading(false);
    }
  };

  const shareHandler = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: product.name,
          text: product.description,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Product link copied");
      }
    } catch {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Product link copied");
    }
  };

  const checkDeliveryHandler = (e) => {
    e.preventDefault();

    if (!/^[1-9][0-9]{5}$/.test(pinCode.trim())) {
      toast.error("Enter a valid 6-digit pincode");
      return;
    }

    setDeliveryChecked(true);
    toast.success("Delivery available for this pincode");
  };

  const submitReviewHandler = async (e) => {
    e.preventDefault();

    if (!reviewComment.trim()) {
      toast.error("Please write a review comment");
      return;
    }

    try {
      setReviewLoading(true);

      await api.post(`/products/${product._id}/reviews`, {
        rating: Number(reviewRating),
        comment: reviewComment.trim(),
      });

      toast.success("Review submitted successfully");

      setReviewRating(5);
      setReviewComment("");

      await fetchProduct();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to submit review"
      );
    } finally {
      setReviewLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="elite-product-details-loader">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <Container className="py-4">
        <Message variant="danger">{error}</Message>

        <Button
          variant="dark"
          className="rounded-pill fw-bold"
          onClick={() => navigate("/products")}
        >
          Go To Products
        </Button>
      </Container>
    );
  }

  if (!product) {
    return (
      <Container className="py-4">
        <Message variant="danger">Product not found</Message>
      </Container>
    );
  }

  return (
    <main className="elite-product-details-page">
      <Container fluid="xl">
        <motion.section
          className="elite-details-hero"
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
            <div className="elite-details-breadcrumb">
              <Link to="/">Home</Link>
              <span>/</span>
              <Link to="/products">Products</Link>
              <span>/</span>
              <Link to={`/products?category=${encodeURIComponent(product.category || "")}`}>
                {product.category || "Product"}
              </Link>
            </div>

            <Badge bg="warning" text="dark" className="elite-details-hero-badge">
              <FaCrown className="me-2" />
              EliteShop Product
            </Badge>

            <h1>{product.name}</h1>

            <p>
              Premium product details, fast delivery, secure checkout and trusted
              seller support.
            </p>
          </div>

          <div className="elite-details-hero-actions">
            <Button variant="light" onClick={() => navigate(-1)}>
              <FaArrowLeft className="me-2" />
              Go Back
            </Button>

            <Button variant="outline-light" onClick={shareHandler}>
              <FaShareAlt className="me-2" />
              Share
            </Button>
          </div>

          <motion.div
            className="elite-details-floating-badge"
            animate={{
              y: [0, -10, 0],
            }}
            transition={{
              duration: 3.5,
              repeat: Infinity,
            }}
          >
            <FaBolt />
            Fast Checkout
          </motion.div>
        </motion.section>

        <Row className="g-4">
          <Col lg={5}>
            <motion.div
              initial={{
                opacity: 0,
                x: -24,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              transition={{
                duration: 0.35,
              }}
              className="elite-details-gallery-card"
            >
              <div className="elite-details-main-image-wrap">
                {product.isFeatured && (
                  <Badge className="elite-details-featured-badge">
                    <FaBolt />
                    Featured
                  </Badge>
                )}

                {discountPercentage > 0 && (
                  <Badge className="elite-details-discount-badge">
                    {discountPercentage}% OFF
                  </Badge>
                )}

                <Image
                  src={mainImage || "/placeholder.svg"}
                  alt={product.name}
                  className="elite-details-main-image"
                />

                {images.length > 1 && (
                  <>
                    <button
                      type="button"
                      className="elite-details-gallery-nav prev"
                      onClick={previousImage}
                      aria-label="Previous image"
                    >
                      <FaArrowLeft />
                    </button>

                    <button
                      type="button"
                      className="elite-details-gallery-nav next"
                      onClick={nextImage}
                      aria-label="Next image"
                    >
                      <FaArrowRight />
                    </button>
                  </>
                )}
              </div>

              {images.length > 0 && (
                <div className="elite-details-thumb-row">
                  {images.map((img, index) => (
                    <button
                      type="button"
                      key={`${img}-${index}`}
                      className={
                        mainImage === img
                          ? "elite-details-thumb active"
                          : "elite-details-thumb"
                      }
                      onClick={() => changeImage(img, index)}
                    >
                      <Image src={img} alt={`${product.name} ${index + 1}`} />
                    </button>
                  ))}
                </div>
              )}

              <div className="elite-details-gallery-info">
                <div>
                  <FaImages />
                  <span>{images.length || 1} Product Images</span>
                </div>

                <div>
                  <FaShieldAlt />
                  <span>Verified Listing</span>
                </div>
              </div>
            </motion.div>
          </Col>

          <Col lg={4}>
            <motion.div
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
              <Card className="elite-details-info-card">
                <Card.Body>
                  <div className="elite-details-title-row">
                    <div>
                      <Badge bg="light" text="dark">
                        {product.category || "Product"}
                      </Badge>

                      <h2>{product.name}</h2>
                    </div>

                    <Button
                      variant="light"
                      className="elite-details-icon-btn"
                      onClick={shareHandler}
                    >
                      <FaShareAlt />
                    </Button>
                  </div>

                  <div className="elite-details-rating-row">
                    <Rating
                      value={Number(product.rating || 0)}
                      text={`${product.numReviews || 0} reviews`}
                    />

                    <Badge bg="warning" text="dark">
                      <FaStar className="me-1" />
                      {Number(product.rating || 0).toFixed(1)}
                    </Badge>
                  </div>

                  <div className="elite-details-price-row">
                    <strong>₹{formatPrice(price)}</strong>

                    {originalPrice > price && (
                      <>
                        <del>₹{formatPrice(originalPrice)}</del>

                        <Badge bg="danger">
                          {discountPercentage}% OFF
                        </Badge>
                      </>
                    )}
                  </div>

                  <p className="elite-details-description">
                    {product.description || "Premium product from EliteShop marketplace."}
                  </p>

                  <div className="elite-details-highlight-box">
                    <h5>
                      <FaGem className="me-2" />
                      Product Highlights
                    </h5>

                    <div>
                      {productHighlights.map((item) => (
                        <span key={item}>
                          <FaCheckCircle />
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="elite-details-metric-grid">
                    <div>
                      <FaEye />
                      <span>{product.views || 0}</span>
                      <small>Views</small>
                    </div>

                    <div>
                      <FaFire />
                      <span>{product.soldCount || 0}</span>
                      <small>Sold</small>
                    </div>

                    <div>
                      <FaBoxOpen />
                      <span>{stockCount}</span>
                      <small>Stock</small>
                    </div>
                  </div>

                  <ListGroup variant="flush" className="elite-details-list">
                    <ListGroup.Item>
                      <span>Brand</span>
                      <strong>{product.brand || "EliteShop"}</strong>
                    </ListGroup.Item>

                    <ListGroup.Item>
                      <span>Category</span>
                      <strong>{product.category || "General"}</strong>
                    </ListGroup.Item>

                    <ListGroup.Item>
                      <span>Seller</span>
                      <strong>
                        <FaStore className="me-1 text-success" />
                        {sellerName}
                      </strong>
                    </ListGroup.Item>

                    <ListGroup.Item>
                      <span>Status</span>

                      {isOutOfStock ? (
                        <Badge bg="danger">
                          <FaTimesCircle className="me-1" />
                          Out of Stock
                        </Badge>
                      ) : isLowStock ? (
                        <Badge bg="warning" text="dark">
                          <FaFire className="me-1" />
                          Only {stockCount} Left
                        </Badge>
                      ) : (
                        <Badge bg="success">
                          <FaCheckCircle className="me-1" />
                          In Stock
                        </Badge>
                      )}
                    </ListGroup.Item>

                    <ListGroup.Item>
                      <span>Shipping</span>

                      {product.freeShipping ? (
                        <strong className="text-success">
                          <FaTruck className="me-1" />
                          Free Shipping
                        </strong>
                      ) : (
                        <strong>
                          ₹{formatPrice(product.shippingPrice)}
                        </strong>
                      )}
                    </ListGroup.Item>

                    <ListGroup.Item>
                      <span>Delivery</span>
                      <strong>{deliveryDate}</strong>
                    </ListGroup.Item>
                  </ListGroup>
                </Card.Body>
              </Card>
            </motion.div>
          </Col>

          <Col lg={3}>
            <motion.div
              initial={{
                opacity: 0,
                x: 24,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              transition={{
                duration: 0.35,
              }}
              className="elite-details-buy-stack"
            >
              <Card className="elite-details-buy-card">
                <Card.Header>
                  <FaShoppingCart className="me-2" />
                  Purchase Details
                </Card.Header>

                <Card.Body>
                  <div className="elite-buy-price-box">
                    <span>Total Price</span>
                    <strong>₹{formatPrice(price * qty)}</strong>
                    <small>Inclusive of selected quantity</small>
                  </div>

                  <div className="elite-buy-stock-row">
                    <span>Availability</span>

                    {isOutOfStock ? (
                      <Badge bg="danger">Out of Stock</Badge>
                    ) : (
                      <Badge bg="success">In Stock</Badge>
                    )}
                  </div>

                  {!isOutOfStock && (
                    <div className="elite-qty-stepper">
                      <span>Quantity</span>

                      <div>
                        <button type="button" onClick={decreaseQty}>
                          <FaMinus />
                        </button>

                        <strong>{qty}</strong>

                        <button type="button" onClick={increaseQty}>
                          <FaPlus />
                        </button>
                      </div>
                    </div>
                  )}

                  <Form
                    className="elite-delivery-check"
                    onSubmit={checkDeliveryHandler}
                  >
                    <Form.Label>
                      <FaMapMarkerAlt className="me-2" />
                      Check Delivery
                    </Form.Label>

                    <InputGroup>
                      <Form.Control
                        value={pinCode}
                        onChange={(e) => {
                          setPinCode(e.target.value);
                          setDeliveryChecked(false);
                        }}
                        placeholder="Enter pincode"
                        maxLength={6}
                      />

                      <Button type="submit" variant="dark">
                        Check
                      </Button>
                    </InputGroup>

                    {deliveryChecked && (
                      <small className="text-success fw-bold d-block mt-2">
                        Delivery available by {deliveryDate}
                      </small>
                    )}
                  </Form>

                  <Button
                    className="elite-details-cart-btn"
                    disabled={isOutOfStock || addingCart}
                    onClick={addToCartHandler}
                  >
                    {addingCart ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <FaShoppingCart className="me-2" />
                        Add To Cart
                      </>
                    )}
                  </Button>

                  <Button
                    className="elite-details-buy-btn"
                    disabled={isOutOfStock || buyingNow}
                    onClick={buyNowHandler}
                  >
                    {buyingNow ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <FaBolt className="me-2" />
                        Buy Now
                      </>
                    )}
                  </Button>

                  <Button
                    variant="outline-danger"
                    className="elite-details-wishlist-btn"
                    disabled={wishlistLoading}
                    onClick={wishlistHandler}
                  >
                    {wishlistLoading ? (
                      <Spinner animation="border" size="sm" />
                    ) : (
                      <>
                        <FaHeart className="me-2" />
                        Add To Wishlist
                      </>
                    )}
                  </Button>
                </Card.Body>
              </Card>

              <Card className="elite-details-seller-card">
                <Card.Body>
                  <div className="elite-seller-avatar">
                    <FaStore />
                  </div>

                  <div>
                    <span>Sold by</span>
                    <strong>{sellerName}</strong>
                    <small>Verified EliteShop seller</small>
                  </div>
                </Card.Body>
              </Card>

              <Card className="elite-details-trust-card">
                <Card.Body>
                  <div>
                    <FaShieldAlt />
                    <span>Secure Payment</span>
                  </div>

                  <div>
                    <FaUndo />
                    <span>Easy Returns</span>
                  </div>

                  <div>
                    <FaTruck />
                    <span>Fast Delivery</span>
                  </div>

                  <div>
                    <FaHeadset />
                    <span>24/7 Support</span>
                  </div>

                  <div>
                    <FaCreditCard />
                    <span>Razorpay / COD Ready</span>
                  </div>

                  <div>
                    <FaLock />
                    <span>Protected Checkout</span>
                  </div>
                </Card.Body>
              </Card>
            </motion.div>
          </Col>
        </Row>

        <Row className="g-4 mt-4">
          <Col lg={8}>
            <Card className="elite-details-reviews-card">
              <Card.Body>
                <div className="elite-details-section-title">
                  <div>
                    <h3>Customer Reviews</h3>
                    <p>See what buyers are saying about this product.</p>
                  </div>

                  <Badge bg="warning" text="dark">
                    {product.reviews?.length || 0} Reviews
                  </Badge>
                </div>

                {product.reviews?.length > 0 ? (
                  <div className="elite-review-list">
                    {product.reviews.map((review) => (
                      <Card key={review._id} className="elite-review-card">
                        <Card.Body>
                          <div className="elite-review-top">
                            <div>
                              <strong>{review.name}</strong>

                              <Rating value={review.rating} text="" />
                            </div>

                            <small>
                              {review.createdAt
                                ? new Date(review.createdAt).toLocaleDateString()
                                : ""}
                            </small>
                          </div>

                          <p>{review.comment}</p>
                        </Card.Body>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Alert variant="info" className="elite-details-alert">
                    No reviews yet. Be the first to review this product.
                  </Alert>
                )}
              </Card.Body>
            </Card>
          </Col>

          <Col lg={4}>
            <Card className="elite-details-review-form-card">
              <Card.Body>
                <h3>Write A Review</h3>

                <p>Share your experience with other buyers.</p>

                <Form onSubmit={submitReviewHandler}>
                  <Form.Group className="mb-3">
                    <Form.Label>Rating</Form.Label>

                    <Form.Select
                      value={reviewRating}
                      onChange={(e) => setReviewRating(e.target.value)}
                    >
                      <option value="5">5 - Excellent</option>
                      <option value="4">4 - Very Good</option>
                      <option value="3">3 - Good</option>
                      <option value="2">2 - Fair</option>
                      <option value="1">1 - Poor</option>
                    </Form.Select>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Comment</Form.Label>

                    <Form.Control
                      as="textarea"
                      rows={4}
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Write your review..."
                    />
                  </Form.Group>

                  <Button
                    type="submit"
                    className="elite-details-review-btn"
                    disabled={reviewLoading}
                  >
                    {reviewLoading ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <FaStar className="me-2" />
                        Submit Review
                      </>
                    )}
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <section className="elite-details-policy-section">
          <Row className="g-4">
            <Col md={4}>
              <PolicyCard
                icon={<FaExchangeAlt />}
                title="Easy Replacement"
                text="Replacement support for eligible products."
              />
            </Col>

            <Col md={4}>
              <PolicyCard
                icon={<FaClipboardCheck />}
                title="Quality Checked"
                text="Product listing verified by EliteShop."
              />
            </Col>

            <Col md={4}>
              <PolicyCard
                icon={<FaWarehouse />}
                title="Inventory Updated"
                text="Stock information is updated from seller inventory."
              />
            </Col>
          </Row>
        </section>

        <section className="elite-details-related-section">
          <div className="elite-details-section-title">
            <div>
              <h3>
                <FaTags className="me-2" />
                Related Products
              </h3>

              <p>More products from the same category.</p>
            </div>

            <Button
              as={Link}
              to={`/products?category=${encodeURIComponent(product.category || "")}`}
              variant="outline-dark"
              className="rounded-pill fw-bold"
            >
              View All
            </Button>
          </div>

          {relatedLoading ? (
            <Loader />
          ) : relatedProducts.length === 0 ? (
            <Alert variant="info" className="elite-details-alert">
              No related products available yet.
            </Alert>
          ) : (
            <div className="elite-details-related-row">
              {relatedProducts.map((item) => (
                <div key={item._id} className="elite-details-related-item">
                  <ProductCard product={item} />
                </div>
              ))}
            </div>
          )}
        </section>
      </Container>
    </main>
  );
};

const PolicyCard = ({
  icon,
  title,
  text,
}) => (
  <Card className="elite-policy-card">
    <Card.Body>
      {icon}
      <h5>{title}</h5>
      <p>{text}</p>
    </Card.Body>
  </Card>
);

export default ProductDetailsPage;