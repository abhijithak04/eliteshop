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
  Button,
  Image,
  Badge,
  Form,
  Alert,
  Dropdown,
} from "react-bootstrap";

import {
  FaHeart,
  FaTrash,
  FaShoppingCart,
  FaEye,
  FaBell,
  FaShareAlt,
  FaCheck,
  FaArrowDown,
  FaBoxOpen,
  FaTags,
  FaSearch,
  FaLayerGroup,
  FaGift,
  FaBolt,
  FaFire,
  FaShieldAlt,
  FaStore,
  FaClock,
  FaStar,
  FaFilter,
  FaCartPlus,
  FaRupeeSign,
  FaMagic,
  FaTimesCircle,
  FaCheckCircle,
} from "react-icons/fa";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import { motion } from "framer-motion";
import { toast } from "react-toastify";

import Loader from "../../components/Loader";
import Message from "../../components/Message";
import Rating from "../../components/Rating";
import ProductCard from "../../components/ProductCard";

import { useCart } from "../../context/CartContext";
import api from "../../utils/axios";

import "../../styles/UserWishlist.css";

const collections = [
  "Default",
  "Favorites",
  "Gift Ideas",
  "Buy Later",
  "Price Watch",
];

const formatPrice = (value) => {
  return Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  });
};

const WishlistPage = () => {
  const navigate = useNavigate();

  const {
    wishlistItems,
    removeFromWishlist,
    addToCart,
  } = useCart();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [selectedItems, setSelectedItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [stockFilter, setStockFilter] = useState("All");
  const [sortBy, setSortBy] = useState("latest");

  const [copied, setCopied] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);

  const [wishlistMeta, setWishlistMeta] = useState(() => {
    try {
      const saved = localStorage.getItem("wishlistMeta");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem(
      "wishlistMeta",
      JSON.stringify(wishlistMeta)
    );
  }, [wishlistMeta]);

  useEffect(() => {
    const updatedMeta = {
      ...wishlistMeta,
    };

    wishlistItems.forEach((item) => {
      if (!updatedMeta[item._id]) {
        updatedMeta[item._id] = {
          priceWhenAdded: Number(item.price) || 0,
          notifyPriceDrop: false,
          notifyBackInStock: false,
          collection: "Default",
          addedAt: new Date().toISOString(),
        };
      }
    });

    setWishlistMeta(updatedMeta);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wishlistItems]);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        setError("");

        let products = [];

        try {
          const { data } = await api.get("/products/top");
          products = Array.isArray(data) ? data : [];
        } catch {
          const { data } = await api.get("/products?pageNumber=1");
          products = data.products || [];
        }

        const wishlistIds = wishlistItems.map((item) => item._id);

        setRecommendations(
          products
            .filter((product) => !wishlistIds.includes(product._id))
            .slice(0, 8)
        );
      } catch (error) {
        setError(
          error.response?.data?.message ||
            error.message ||
            "Failed to load wishlist recommendations"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();

    try {
      const recent = localStorage.getItem("recentlyViewedProducts");

      if (recent) {
        setRecentlyViewed(JSON.parse(recent).slice(0, 4));
      }
    } catch {
      setRecentlyViewed([]);
    }
  }, [wishlistItems]);

  const enhancedWishlist = useMemo(() => {
    return wishlistItems.map((item) => {
      const meta = wishlistMeta[item._id] || {};

      const priceWhenAdded = Number(
        meta.priceWhenAdded ||
          item.originalPrice ||
          item.price ||
          0
      );

      const currentPrice = Number(item.price || 0);
      const priceDropped = priceWhenAdded > currentPrice;
      const savedAmount = priceDropped
        ? priceWhenAdded - currentPrice
        : 0;

      return {
        ...item,
        slug: item.slug || item._id,
        category: item.category || "General",
        brand: item.brand || "EliteShop",
        rating: Number(item.rating || 0),
        numReviews: Number(item.numReviews || 0),
        countInStock: item.countInStock ?? 10,
        originalPrice: item.originalPrice || priceWhenAdded,
        discountPercentage:
          item.discountPercentage ||
          (priceDropped
            ? Math.round((savedAmount / priceWhenAdded) * 100)
            : 0),
        priceWhenAdded,
        currentPrice,
        priceDropped,
        savedAmount,
        notifyPriceDrop: meta.notifyPriceDrop || false,
        notifyBackInStock: meta.notifyBackInStock || false,
        collection: meta.collection || "Default",
        addedAt: meta.addedAt || new Date().toISOString(),
      };
    });
  }, [
    wishlistItems,
    wishlistMeta,
  ]);

  const categories = useMemo(() => {
    return [
      "All",
      ...new Set(enhancedWishlist.map((item) => item.category)),
    ];
  }, [enhancedWishlist]);

  const filteredWishlist = useMemo(() => {
    let result = [...enhancedWishlist];

    const search = searchTerm.toLowerCase().trim();

    if (search) {
      result = result.filter(
        (item) =>
          item.name?.toLowerCase().includes(search) ||
          item.brand?.toLowerCase().includes(search) ||
          item.category?.toLowerCase().includes(search) ||
          item.collection?.toLowerCase().includes(search)
      );
    }

    if (categoryFilter !== "All") {
      result = result.filter((item) => item.category === categoryFilter);
    }

    if (stockFilter === "In Stock") {
      result = result.filter((item) => item.countInStock > 0);
    }

    if (stockFilter === "Out Of Stock") {
      result = result.filter((item) => item.countInStock === 0);
    }

    if (stockFilter === "Price Dropped") {
      result = result.filter((item) => item.priceDropped);
    }

    if (stockFilter === "Alerts On") {
      result = result.filter(
        (item) => item.notifyPriceDrop || item.notifyBackInStock
      );
    }

    if (sortBy === "price-low") {
      result.sort((a, b) => a.currentPrice - b.currentPrice);
    }

    if (sortBy === "price-high") {
      result.sort((a, b) => b.currentPrice - a.currentPrice);
    }

    if (sortBy === "rating") {
      result.sort((a, b) => b.rating - a.rating);
    }

    if (sortBy === "price-drop") {
      result.sort((a, b) => b.savedAmount - a.savedAmount);
    }

    if (sortBy === "latest") {
      result.sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt));
    }

    return result;
  }, [
    enhancedWishlist,
    searchTerm,
    categoryFilter,
    stockFilter,
    sortBy,
  ]);

  const wishlistStats = useMemo(() => {
    const totalItems = enhancedWishlist.length;

    const priceDropItems = enhancedWishlist.filter(
      (item) => item.priceDropped
    ).length;

    const outOfStockItems = enhancedWishlist.filter(
      (item) => item.countInStock === 0
    ).length;

    const alertItems = enhancedWishlist.filter(
      (item) => item.notifyPriceDrop || item.notifyBackInStock
    ).length;

    const totalSavings = enhancedWishlist.reduce(
      (acc, item) => acc + item.savedAmount,
      0
    );

    const totalValue = enhancedWishlist.reduce(
      (acc, item) => acc + item.currentPrice,
      0
    );

    return {
      totalItems,
      priceDropItems,
      outOfStockItems,
      alertItems,
      totalSavings,
      totalValue,
    };
  }, [enhancedWishlist]);

  const toggleSelected = (id) => {
    setSelectedItems((prev) =>
      prev.includes(id)
        ? prev.filter((itemId) => itemId !== id)
        : [...prev, id]
    );
  };

  const selectAllHandler = () => {
    if (selectedItems.length === filteredWishlist.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredWishlist.map((item) => item._id));
    }
  };

  const removeHandler = (id) => {
    removeFromWishlist(id);

    setSelectedItems((prev) =>
      prev.filter((itemId) => itemId !== id)
    );

    toast.success("Removed from wishlist");
  };

  const moveToCartHandler = (product) => {
    if (product.countInStock === 0) {
      toast.error("Product is out of stock");
      return;
    }

    addToCart(
      {
        ...product,
        countInStock: product.countInStock || 10,
      },
      1
    );

    removeFromWishlist(product._id);

    toast.success("Moved to cart");
  };

  const bulkMoveToCart = () => {
    if (selectedItems.length === 0) {
      toast.error("Select at least one product");
      return;
    }

    const selectedProducts = enhancedWishlist.filter(
      (item) =>
        selectedItems.includes(item._id) &&
        item.countInStock > 0
    );

    if (selectedProducts.length === 0) {
      toast.error("Selected products are out of stock");
      return;
    }

    selectedProducts.forEach((product) => {
      addToCart(
        {
          ...product,
          countInStock: product.countInStock || 10,
        },
        1
      );

      removeFromWishlist(product._id);
    });

    setSelectedItems([]);

    toast.success(`${selectedProducts.length} item(s) moved to cart`);
  };

  const bulkRemove = () => {
    if (selectedItems.length === 0) {
      toast.error("Select at least one product");
      return;
    }

    selectedItems.forEach((id) => removeFromWishlist(id));
    setSelectedItems([]);

    toast.success("Selected items removed");
  };

  const togglePriceDropAlert = (id) => {
    setWishlistMeta((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        notifyPriceDrop: !prev[id]?.notifyPriceDrop,
      },
    }));

    toast.success("Price drop alert updated");
  };

  const toggleStockAlert = (id) => {
    setWishlistMeta((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        notifyBackInStock: !prev[id]?.notifyBackInStock,
      },
    }));

    toast.success("Stock alert updated");
  };

  const updateCollection = (id, collection) => {
    setWishlistMeta((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        collection,
      },
    }));

    toast.success("Wishlist collection updated");
  };

  const shareWishlistHandler = async () => {
    const text = `Check out my EliteShop wishlist: ${window.location.href}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: "My EliteShop Wishlist",
          text,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);

        setCopied(true);

        setTimeout(() => setCopied(false), 1500);

        toast.success("Wishlist link copied");
      }
    } catch {
      toast.error("Could not share wishlist");
    }
  };

  const resetFilters = () => {
    setSearchTerm("");
    setCategoryFilter("All");
    setStockFilter("All");
    setSortBy("latest");
  };

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return (
      <main className="elite-wishlist-page">
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
        duration: 0.28,
      }}
      className="elite-wishlist-page"
    >
      <section className="elite-wishlist-hero">
        <div>
          <Badge
            bg="warning"
            text="dark"
            className="elite-wishlist-hero-badge"
          >
            <FaShieldAlt className="me-2" />
            EliteShop Smart Wishlist
          </Badge>

          <h1>
            <FaHeart className="me-2" />
            My Wishlist
          </h1>

          <p>
            Save products, track price drops, organize collections,
            enable alerts, compare stock, and move favorites to cart faster.
          </p>
        </div>

        <div className="elite-wishlist-hero-actions">
          <Button
            variant="light"
            onClick={shareWishlistHandler}
          >
            {copied ? (
              <FaCheck className="me-2" />
            ) : (
              <FaShareAlt className="me-2" />
            )}
            {copied ? "Copied" : "Share"}
          </Button>

          <Button
            variant="outline-light"
            onClick={() => navigate("/products")}
          >
            <FaStore className="me-2" />
            Explore Products
          </Button>
        </div>

        <motion.div
          className="elite-wishlist-floating"
          animate={{
            y: [0, -10, 0],
          }}
          transition={{
            duration: 3.5,
            repeat: Infinity,
          }}
        >
          <FaMagic />
          Smart Picks
        </motion.div>
      </section>

      <Row className="g-4 mb-4">
        <WishlistStat
          type="items"
          title="Wishlist Items"
          value={wishlistStats.totalItems}
          text="Saved favorites"
          icon={<FaHeart />}
        />

        <WishlistStat
          type="drops"
          title="Price Drops"
          value={wishlistStats.priceDropItems}
          text={`₹${formatPrice(wishlistStats.totalSavings)} saved`}
          icon={<FaArrowDown />}
        />

        <WishlistStat
          type="stock"
          title="Out Of Stock"
          value={wishlistStats.outOfStockItems}
          text="Need restock alert"
          icon={<FaBoxOpen />}
        />

        <WishlistStat
          type="value"
          title="Wishlist Value"
          value={`₹${formatPrice(wishlistStats.totalValue)}`}
          text={`${wishlistStats.alertItems} alerts active`}
          icon={<FaRupeeSign />}
        />
      </Row>

      {enhancedWishlist.length === 0 ? (
        <Card className="elite-wishlist-empty-card">
          <Card.Body>
            <motion.div
              animate={{
                scale: [1, 1.08, 1],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
              }}
              className="elite-wishlist-empty-icon"
            >
              <FaHeart />
            </motion.div>

            <h3>Your wishlist is empty</h3>

            <p>
              Start saving products you love. EliteShop will help you track
              price drops, stock status, and buying decisions.
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
      ) : (
        <>
          <Card className="elite-wishlist-filter-card mb-4">
            <Card.Body>
              <Row className="g-3 align-items-center">
                <Col lg={4}>
                  <div className="elite-wishlist-search">
                    <FaSearch />

                    <input
                      type="text"
                      placeholder="Search wishlist, brand, category, collection..."
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

                <Col md={6} lg={2}>
                  <Form.Select
                    value={stockFilter}
                    onChange={(e) => setStockFilter(e.target.value)}
                  >
                    <option value="All">All Stock</option>
                    <option value="In Stock">In Stock</option>
                    <option value="Out Of Stock">Out Of Stock</option>
                    <option value="Price Dropped">Price Dropped</option>
                    <option value="Alerts On">Alerts On</option>
                  </Form.Select>
                </Col>

                <Col md={6} lg={2}>
                  <Form.Select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="latest">Latest Added</option>
                    <option value="price-low">Price Low to High</option>
                    <option value="price-high">Price High to Low</option>
                    <option value="rating">Top Rated</option>
                    <option value="price-drop">Biggest Price Drop</option>
                  </Form.Select>
                </Col>

                <Col md={6} lg={2}>
                  <Button
                    variant="dark"
                    className="elite-wishlist-select-btn"
                    onClick={selectAllHandler}
                  >
                    <FaFilter className="me-2" />
                    {selectedItems.length === filteredWishlist.length
                      ? "Clear"
                      : "Select"}
                  </Button>
                </Col>
              </Row>

              <div className="elite-wishlist-filter-footer">
                <span>
                  Showing <strong>{filteredWishlist.length}</strong> of{" "}
                  <strong>{enhancedWishlist.length}</strong> wishlist products
                </span>

                <Button
                  variant="link"
                  onClick={resetFilters}
                >
                  Reset filters
                </Button>
              </div>

              {selectedItems.length > 0 && (
                <Alert
                  variant="dark"
                  className="elite-wishlist-bulk-bar"
                >
                  <span>
                    <FaCheckCircle className="me-2" />
                    {selectedItems.length} item(s) selected
                  </span>

                  <div>
                    <Button
                      size="sm"
                      variant="success"
                      onClick={bulkMoveToCart}
                    >
                      <FaCartPlus className="me-1" />
                      Move to Cart
                    </Button>

                    <Button
                      size="sm"
                      variant="danger"
                      onClick={bulkRemove}
                    >
                      <FaTrash className="me-1" />
                      Remove
                    </Button>
                  </div>
                </Alert>
              )}
            </Card.Body>
          </Card>

          {filteredWishlist.length === 0 ? (
            <Card className="elite-wishlist-empty-card">
              <Card.Body>
                <FaSearch className="elite-wishlist-no-result-icon" />

                <h3>No matching wishlist products</h3>

                <p>
                  Try changing your search, category, stock filter, or sorting option.
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
            <Row className="g-4">
              {filteredWishlist.map((product, index) => (
                <Col
                  md={6}
                  xl={4}
                  key={product._id}
                >
                  <motion.div
                    initial={{
                      opacity: 0,
                      y: 25,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    transition={{
                      duration: 0.28,
                      delay: index * 0.035,
                    }}
                    whileHover={{
                      y: -7,
                    }}
                    className="h-100"
                  >
                    <Card
                      className={
                        selectedItems.includes(product._id)
                          ? "elite-wishlist-product-card selected"
                          : "elite-wishlist-product-card"
                      }
                    >
                      <div className="elite-wishlist-img-wrap">
                        <Form.Check
                          type="checkbox"
                          checked={selectedItems.includes(product._id)}
                          onChange={() => toggleSelected(product._id)}
                          className="elite-wishlist-check"
                        />

                        {product.priceDropped && (
                          <Badge
                            bg="success"
                            className="elite-price-drop-badge"
                          >
                            <FaArrowDown className="me-1" />
                            ₹{formatPrice(product.savedAmount)} Drop
                          </Badge>
                        )}

                        {product.countInStock === 0 && (
                          <Badge
                            bg="danger"
                            className="elite-stock-badge"
                          >
                            Out
                          </Badge>
                        )}

                        <Image
                          src={product.image || "/placeholder.svg"}
                          alt={product.name}
                        />

                        <div className="elite-wishlist-img-actions">
                          <Button
                            as={Link}
                            to={`/product/${product.slug}`}
                            variant="light"
                            size="sm"
                          >
                            <FaEye />
                          </Button>

                          <Button
                            variant="light"
                            size="sm"
                            onClick={() => togglePriceDropAlert(product._id)}
                          >
                            <FaBell />
                          </Button>
                        </div>
                      </div>

                      <Card.Body>
                        <div className="elite-wishlist-card-top">
                          <div>
                            <Badge bg="secondary">
                              {product.category}
                            </Badge>

                            <Badge bg="dark">
                              {product.collection}
                            </Badge>
                          </div>

                          <Dropdown align="end">
                            <Dropdown.Toggle
                              variant="light"
                              size="sm"
                              className="elite-collection-btn"
                            >
                              <FaLayerGroup />
                            </Dropdown.Toggle>

                            <Dropdown.Menu>
                              {collections.map((collection) => (
                                <Dropdown.Item
                                  key={collection}
                                  onClick={() =>
                                    updateCollection(product._id, collection)
                                  }
                                >
                                  {collection}
                                </Dropdown.Item>
                              ))}
                            </Dropdown.Menu>
                          </Dropdown>
                        </div>

                        <Link
                          to={`/product/${product.slug}`}
                          className="elite-wishlist-title"
                        >
                          {product.name}
                        </Link>

                        <p className="elite-wishlist-brand">
                          {product.brand}
                        </p>

                        <Rating
                          value={product.rating}
                          text={`${product.numReviews || 0} reviews`}
                        />

                        <div className="elite-wishlist-price-row">
                          <strong>₹{formatPrice(product.currentPrice)}</strong>

                          {product.originalPrice > product.currentPrice && (
                            <>
                              <del>₹{formatPrice(product.originalPrice)}</del>

                              <Badge bg="success">
                                {product.discountPercentage}% OFF
                              </Badge>
                            </>
                          )}
                        </div>

                        {product.priceDropped && (
                          <div className="elite-price-drop-box">
                            <FaArrowDown />

                            <div>
                              <strong>Price dropped!</strong>

                              <span>
                                Added at ₹{formatPrice(product.priceWhenAdded)} •
                                Now ₹{formatPrice(product.currentPrice)}
                              </span>
                            </div>
                          </div>
                        )}

                        <div className="elite-wishlist-status-row">
                          {product.countInStock > 0 ? (
                            <Badge bg="success">
                              <FaCheckCircle className="me-1" />
                              In Stock
                            </Badge>
                          ) : (
                            <Badge bg="danger">
                              <FaTimesCircle className="me-1" />
                              Out Of Stock
                            </Badge>
                          )}

                          <span>
                            <FaClock className="me-1" />
                            Saved{" "}
                            {new Date(product.addedAt).toLocaleDateString("en-IN")}
                          </span>
                        </div>

                        <div className="elite-wishlist-alerts">
                          <Form.Check
                            type="switch"
                            label="Price drop alert"
                            checked={product.notifyPriceDrop}
                            onChange={() => togglePriceDropAlert(product._id)}
                          />

                          {product.countInStock === 0 && (
                            <Form.Check
                              type="switch"
                              label="Back in stock alert"
                              checked={product.notifyBackInStock}
                              onChange={() => toggleStockAlert(product._id)}
                            />
                          )}
                        </div>

                        <div className="elite-wishlist-actions">
                          <Button
                            as={Link}
                            to={`/product/${product.slug}`}
                            variant="dark"
                          >
                            <FaEye className="me-1" />
                            View
                          </Button>

                          <Button
                            variant="success"
                            disabled={product.countInStock === 0}
                            onClick={() => moveToCartHandler(product)}
                          >
                            <FaShoppingCart className="me-1" />
                            Cart
                          </Button>

                          <Button
                            variant="outline-danger"
                            onClick={() => removeHandler(product._id)}
                          >
                            <FaTrash />
                          </Button>
                        </div>
                      </Card.Body>
                    </Card>
                  </motion.div>
                </Col>
              ))}
            </Row>
          )}
        </>
      )}

      {wishlistStats.outOfStockItems > 0 && recommendations.length > 0 && (
        <WishlistSection
          title="Alternatives for Out of Stock Items"
          subtitle="Similar products you can buy now instead of waiting."
          buttonText="View All"
          onClick={() => navigate("/products")}
          products={recommendations.slice(0, 4)}
        />
      )}

      {recentlyViewed.length > 0 && (
        <WishlistSection
          title="Recently Viewed"
          subtitle="Continue from products you checked earlier."
          buttonText="Explore More"
          onClick={() => navigate("/products")}
          products={recentlyViewed}
        />
      )}

      {recommendations.length > 0 && (
        <WishlistSection
          title="Recommended For You"
          subtitle="Fresh picks based on trending EliteShop products."
          buttonText="Explore More"
          onClick={() => navigate("/products")}
          products={recommendations.slice(0, 4)}
        />
      )}
    </motion.main>
  );
};

const WishlistStat = ({
  type,
  title,
  value,
  text,
  icon,
}) => (
  <Col md={6} xl={3}>
    <motion.div whileHover={{ y: -6 }}>
      <Card className={`elite-wishlist-stat-card ${type}`}>
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

const WishlistSection = ({
  title,
  subtitle,
  buttonText,
  onClick,
  products,
}) => {
  if (!products || products.length === 0) return null;

  return (
    <section className="elite-wishlist-section">
      <div className="elite-wishlist-section-head">
        <div>
          <h3>
            <FaBolt className="me-2" />
            {title}
          </h3>

          <p>{subtitle}</p>
        </div>

        <Button
          variant="outline-dark"
          onClick={onClick}
        >
          {buttonText}
        </Button>
      </div>

      <Row className="g-4">
        {products.map((product) => (
          <Col
            md={6}
            xl={3}
            key={product._id}
          >
            <ProductCard product={product} />
          </Col>
        ))}
      </Row>
    </section>
  );
};

export default WishlistPage;