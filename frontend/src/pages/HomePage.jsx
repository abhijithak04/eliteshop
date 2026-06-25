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
  Badge,
  Form,
  Spinner,
} from "react-bootstrap";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import { motion } from "framer-motion";

import {
  FaMobileAlt,
  FaLaptop,
  FaTshirt,
  FaSpa,
  FaHome,
  FaCouch,
  FaShoppingBasket,
  FaBook,
  FaGamepad,
  FaBlender,
  FaStar,
  FaTruck,
  FaShieldAlt,
  FaHeadset,
  FaUndo,
  FaHeart,
  FaShoppingCart,
  FaFire,
  FaBolt,
  FaArrowRight,
  FaCrown,
  FaEnvelope,
  FaGooglePlay,
  FaApple,
  FaStore,
  FaTags,
  FaCheckCircle,
  FaWarehouse,
  FaBoxOpen,
  FaGem,
  FaEye,
} from "react-icons/fa";

import { toast } from "react-toastify";

import Loader from "../components/Loader";
import Message from "../components/Message";

import { useCart } from "../context/CartContext";

import api from "../utils/axios";

import "../styles/HomePage.css";

const CATEGORY_KEYS = [
  "Mobiles",
  "Electronics",
  "Fashion",
  "Home",
  "Beauty",
  "Grocery",
  "Appliances",
  "Gaming",
  "Furniture",
  "Books",
];

const categories = [
  {
    title: "Mobiles",
    offer: "Latest 5G smartphones",
    icon: <FaMobileAlt />,
    image:
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=80",
    path: "/products?category=Mobiles",
  },
  {
    title: "Electronics",
    offer: "Gadgets and accessories",
    icon: <FaLaptop />,
    image:
      "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=900&q=80",
    path: "/products?category=Electronics",
  },
  {
    title: "Fashion",
    offer: "Outfits, shoes and style",
    icon: <FaTshirt />,
    image:
      "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=900&q=80",
    path: "/products?category=Fashion",
  },
  {
    title: "Home",
    offer: "Kitchen and home essentials",
    icon: <FaHome />,
    image:
      "https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=900&q=80",
    path: "/products?category=Home",
  },
  {
    title: "Beauty",
    offer: "Skincare and grooming",
    icon: <FaSpa />,
    image:
      "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=900&q=80",
    path: "/products?category=Beauty",
  },
  {
    title: "Grocery",
    offer: "Daily needs and food",
    icon: <FaShoppingBasket />,
    image:
      "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=80",
    path: "/products?category=Grocery",
  },
  {
    title: "Appliances",
    offer: "Kitchen and home machines",
    icon: <FaBlender />,
    image:
      "https://images.unsplash.com/photo-1581091870622-2c70c1207987?auto=format&fit=crop&w=900&q=80",
    path: "/products?category=Appliances",
  },
  {
    title: "Gaming",
    offer: "Consoles and gaming gear",
    icon: <FaGamepad />,
    image:
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=900&q=80",
    path: "/products?category=Gaming",
  },
  {
    title: "Furniture",
    offer: "Comfort and decor",
    icon: <FaCouch />,
    image:
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=900&q=80",
    path: "/products?category=Furniture",
  },
  {
    title: "Books",
    offer: "Learning and stories",
    icon: <FaBook />,
    image:
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=900&q=80",
    path: "/products?category=Books",
  },
];

const heroSlides = [
  {
    title: "EliteShop Mega Deals",
    subtitle:
      "Shop mobiles, electronics, fashion, grocery, books and home essentials with premium offers.",
    offer: "Up to 70% OFF",
    image:
      "https://images.unsplash.com/photo-1607082349566-187342175e2f?auto=format&fit=crop&w=1800&q=80",
    primaryPath: "/products",
    secondaryPath: "/products?featured=true",
  },
  {
    title: "Electronics Fest",
    subtitle:
      "Upgrade your setup with smart gadgets, audio gear, keyboards, accessories and appliances.",
    offer: "Free Delivery Deals",
    image:
      "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=1800&q=80",
    primaryPath: "/products?category=Electronics",
    secondaryPath: "/products?category=Appliances",
  },
  {
    title: "Fashion & Beauty Picks",
    subtitle:
      "Discover premium outfits, shoes, grooming essentials and beauty products.",
    offer: "Fresh Arrivals",
    image:
      "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1800&q=80",
    primaryPath: "/products?category=Fashion",
    secondaryPath: "/products?category=Beauty",
  },
];

const adCards = [
  {
    title: "Upgrade Your Smartphone",
    offer: "Best exchange-style deals and hot mobile picks",
    image:
      "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=900&q=80",
    path: "/products?category=Mobiles",
  },
  {
    title: "Style Your Wardrobe",
    offer: "Fashion picks with premium discounts",
    image:
      "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=900&q=80",
    path: "/products?category=Fashion",
  },
  {
    title: "Gaming Accessories",
    offer: "RGB gear and pro setups",
    image:
      "https://images.unsplash.com/photo-1542751110-97427bbecf20?auto=format&fit=crop&w=900&q=80",
    path: "/products?category=Gaming",
  },
  {
    title: "Kitchen Must-Haves",
    offer: "Save more on home essentials",
    image:
      "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=900&q=80",
    path: "/products?category=Home",
  },
  {
    title: "Study & Work Setup",
    offer: "Books, furniture and electronics",
    image:
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=80",
    path: "/products?keyword=work",
  },
  {
    title: "Daily Needs Store",
    offer: "Grocery and household essentials",
    image:
      "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=80",
    path: "/products?category=Grocery",
  },
];

const trustCards = [
  {
    title: "Fast Delivery",
    text: "Quick delivery support for selected products.",
    icon: <FaTruck />,
  },
  {
    title: "Secure Payment",
    text: "Razorpay and COD-ready payment flow.",
    icon: <FaShieldAlt />,
  },
  {
    title: "Easy Returns",
    text: "Simple return support for eligible orders.",
    icon: <FaUndo />,
  },
  {
    title: "24/7 Support",
    text: "Customer support and order assistance.",
    icon: <FaHeadset />,
  },
];

const brands = [
  "APPLE",
  "SAMSUNG",
  "SONY",
  "NIKE",
  "PRESTIGE",
  "LG",
  "PHILIPS",
  "PENGUIN",
  "BOAT",
  "ELITESHOP",
];

const sectionMotion = {
  initial: {
    opacity: 0,
    y: 24,
  },
  whileInView: {
    opacity: 1,
    y: 0,
  },
  viewport: {
    once: true,
    amount: 0.1,
  },
  transition: {
    duration: 0.28,
  },
};

const formatPrice = (price) => {
  return Number(price || 0).toLocaleString("en-IN");
};

const normalizeText = (value = "") => {
  return value.toString().trim().toLowerCase();
};

const normalizeProductResponse = (data) => {
  if (Array.isArray(data)) return data;

  if (Array.isArray(data?.products)) return data.products;

  if (Array.isArray(data?.data)) return data.data;

  return [];
};

const uniqueProducts = (items = []) => {
  const map = new Map();

  items.forEach((item) => {
    const key = item?._id || item?.slug || item?.name;

    if (key && !map.has(key)) {
      map.set(key, item);
    }
  });

  return Array.from(map.values());
};

const hasDiscount = (product) => {
  return (
    Number(product.discountPercentage || 0) > 0 ||
    Number(product.originalPrice || 0) > Number(product.price || 0)
  );
};

const getDiscountPercent = (product) => {
  if (Number(product.discountPercentage || 0) > 0) {
    return Number(product.discountPercentage || 0);
  }

  const price = Number(product.price || 0);
  const originalPrice = Number(product.originalPrice || 0);

  if (originalPrice > price && price > 0) {
    return Math.round(((originalPrice - price) / originalPrice) * 100);
  }

  return 0;
};

const categoryMatches = (product, allowedCategories = []) => {
  const productCategory = normalizeText(product.category);

  return allowedCategories.some((category) => {
    const safeCategory = normalizeText(category);

    return (
      productCategory === safeCategory ||
      productCategory.includes(safeCategory) ||
      safeCategory.includes(productCategory)
    );
  });
};

const getProductImageFallback = (product) => {
  const keyword = encodeURIComponent(
    product?.category ||
      product?.brand ||
      product?.name ||
      "ecommerce product"
  );

  const lock = String(product?._id || product?.slug || product?.name || 50)
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);

  return `https://loremflickr.com/900/900/${keyword}?lock=${lock}`;
};

const getProductImage = (product) => {
  const image =
    product?.image ||
    product?.images?.[0] ||
    product?.imageUrl ||
    "";

  if (!image) {
    return getProductImageFallback(product);
  }

  if (
    image.includes("placehold.co") ||
    image.includes("source.unsplash.com") ||
    image.includes("C:\\fakepath")
  ) {
    return getProductImageFallback(product);
  }

  return image;
};

const HomeProductCard = ({
  product,
  addToCartHandler,
  wishlistHandler,
}) => {
  const productPath = `/product/${product.slug || product._id}`;
  const discountPercent = getDiscountPercent(product);
  const stock = Number(product.countInStock || 0);

  return (
    <motion.div
      whileHover={{
        y: -7,
      }}
      transition={{
        duration: 0.18,
      }}
      className="elite-home-product-card"
    >
      <div className="elite-home-product-image">
        <Link to={productPath}>
          <img
            src={getProductImage(product)}
            alt={product.name}
            loading="lazy"
            onError={(event) => {
              event.currentTarget.onerror = null;
              event.currentTarget.src = getProductImageFallback(product);
            }}
          />
        </Link>

        <div className="elite-home-product-badge-stack">
          {discountPercent > 0 && (
            <Badge className="elite-home-discount-badge">
              {discountPercent}% OFF
            </Badge>
          )}

          {product.isFeatured && (
            <Badge className="elite-home-featured-badge">
              Featured
            </Badge>
          )}
        </div>

        <button
          type="button"
          className="elite-home-wishlist-btn"
          onClick={() => wishlistHandler(product)}
          aria-label="Add to wishlist"
        >
          <FaHeart />
        </button>

        <Link
          to={productPath}
          className="elite-home-view-btn"
          aria-label="View product"
        >
          <FaEye />
        </Link>
      </div>

      <div className="elite-home-product-body">
        <small className="elite-home-product-category">
          {product.category || "Elite Product"}
        </small>

        <Link
          to={productPath}
          className="elite-home-product-name"
        >
          {product.name}
        </Link>

        <div className="elite-home-rating">
          <span>
            <FaStar />
            {Number(product.rating || 0).toFixed(1)}
          </span>

          <small>
            ({product.numReviews || 0} reviews)
          </small>
        </div>

        <div className="elite-home-price-row">
          <strong>₹{formatPrice(product.price)}</strong>

          {Number(product.originalPrice || 0) >
            Number(product.price || 0) && (
            <del>₹{formatPrice(product.originalPrice)}</del>
          )}
        </div>

        <div className="elite-home-meta-row">
          <Badge bg={product.freeShipping ? "primary" : "secondary"}>
            {product.freeShipping ? "Free Delivery" : "Fast Delivery"}
          </Badge>

          <Badge bg={stock > 0 ? "success" : "danger"}>
            {stock > 0 ? `${stock} left` : "Out"}
          </Badge>
        </div>

        <Button
          className="elite-home-cart-btn"
          disabled={stock === 0}
          onClick={() => addToCartHandler(product)}
        >
          <FaShoppingCart className="me-2" />
          {stock === 0 ? "Out of Stock" : "Add to Cart"}
        </Button>
      </div>
    </motion.div>
  );
};

const ProductRow = ({
  title,
  subtitle,
  products = [],
  path,
  icon,
  emptyMessage,
  addToCartHandler,
  wishlistHandler,
}) => {
  return (
    <motion.section
      className="elite-home-section"
      {...sectionMotion}
    >
      <Container fluid="xl">
        <div className="elite-home-section-heading">
          <div>
            <h2>
              {icon}
              {title}
            </h2>

            <p>{subtitle}</p>
          </div>

          <Button
            as={Link}
            to={path}
            variant="outline-dark"
            className="elite-home-outline-btn"
          >
            View All
            <FaArrowRight className="ms-2" />
          </Button>
        </div>

        {products.length === 0 ? (
          <Card className="elite-home-empty-row-card">
            <Card.Body>
              <FaBoxOpen />
              <strong>{emptyMessage || "No products available yet."}</strong>
            </Card.Body>
          </Card>
        ) : (
          <div className="elite-home-product-row">
            {products.map((product) => (
              <div
                key={product._id || product.slug || product.name}
                className="elite-home-product-item"
              >
                <HomeProductCard
                  product={product}
                  addToCartHandler={addToCartHandler}
                  wishlistHandler={wishlistHandler}
                />
              </div>
            ))}
          </div>
        )}
      </Container>
    </motion.section>
  );
};

const HomePage = () => {
  const navigate = useNavigate();

  const {
    addToCart,
    addToWishlist,
  } = useCart();

  const [activeHero, setActiveHero] = useState(0);
  const [products, setProducts] = useState([]);
  const [categoryProducts, setCategoryProducts] = useState({});
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [pageReady, setPageReady] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    document.documentElement.style.overflowY = "auto";
    document.body.style.overflowY = "auto";
    document.body.style.height = "auto";
    document.body.style.minHeight = "100vh";

    return () => {
      document.documentElement.style.overflowY = "";
      document.body.style.overflowY = "";
      document.body.style.height = "";
      document.body.style.minHeight = "";
    };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveHero((prev) =>
        prev === heroSlides.length - 1 ? 0 : prev + 1
      );
    }, 6500);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const readyTimer = setTimeout(() => {
      setPageReady(true);
    }, 120);

    return () => clearTimeout(readyTimer);
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const allRequest = api.get(
          "/products?pageSize=250&limit=250"
        );

        const categoryRequests = CATEGORY_KEYS.map((category) =>
          api.get(
            `/products?category=${encodeURIComponent(
              category
            )}&pageSize=24&limit=24`
          )
        );

        const results = await Promise.allSettled([
          allRequest,
          ...categoryRequests,
        ]);

        const allProducts =
          results[0].status === "fulfilled"
            ? normalizeProductResponse(results[0].value.data)
            : [];

        const categoryMap = {};

        CATEGORY_KEYS.forEach((category, index) => {
          const result = results[index + 1];

          const apiItems =
            result?.status === "fulfilled"
              ? normalizeProductResponse(result.value.data)
              : [];

          const fallbackItems = allProducts.filter((item) =>
            categoryMatches(item, [category])
          );

          categoryMap[category] = uniqueProducts([
            ...apiItems,
            ...fallbackItems,
          ]).slice(0, 12);
        });

        const mergedProducts = uniqueProducts([
          ...allProducts,
          ...Object.values(categoryMap).flat(),
        ]);

        setProducts(mergedProducts);
        setCategoryProducts(categoryMap);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            err.message ||
            "Failed to load products"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const bestDeals = useMemo(() => {
    return products
      .filter((product) => hasDiscount(product))
      .sort((a, b) => getDiscountPercent(b) - getDiscountPercent(a))
      .slice(0, 12);
  }, [products]);

  const featuredProducts = useMemo(() => {
    const featured = products.filter((item) => item.isFeatured === true);

    return (featured.length ? featured : products)
      .slice(0, 12);
  }, [products]);

  const electronicsProducts = useMemo(() => {
    return (
      categoryProducts.Electronics?.length
        ? categoryProducts.Electronics
        : products.filter((item) =>
            categoryMatches(item, ["Electronics"])
          )
    ).slice(0, 12);
  }, [categoryProducts, products]);

  const fashionProducts = useMemo(() => {
    return (
      categoryProducts.Fashion?.length
        ? categoryProducts.Fashion
        : products.filter((item) =>
            categoryMatches(item, ["Fashion", "Beauty"])
          )
    ).slice(0, 12);
  }, [categoryProducts, products]);

  const mobileProducts = useMemo(() => {
    return (
      categoryProducts.Mobiles?.length
        ? categoryProducts.Mobiles
        : products.filter((item) =>
            categoryMatches(item, ["Mobiles", "Mobile", "Phone"])
          )
    ).slice(0, 12);
  }, [categoryProducts, products]);

  const homeProducts = useMemo(() => {
    const combined = uniqueProducts([
      ...(categoryProducts.Home || []),
      ...(categoryProducts.Furniture || []),
      ...(categoryProducts.Appliances || []),
    ]);

    return (
      combined.length
        ? combined
        : products.filter((item) =>
            categoryMatches(item, [
              "Home",
              "Furniture",
              "Appliances",
              "Kitchen",
            ])
          )
    ).slice(0, 12);
  }, [categoryProducts, products]);

  const groceryProducts = useMemo(() => {
    return (
      categoryProducts.Grocery?.length
        ? categoryProducts.Grocery
        : products.filter((item) =>
            categoryMatches(item, ["Grocery"])
          )
    ).slice(0, 12);
  }, [categoryProducts, products]);

  const gamingProducts = useMemo(() => {
    return (
      categoryProducts.Gaming?.length
        ? categoryProducts.Gaming
        : products.filter((item) =>
            categoryMatches(item, ["Gaming"])
          )
    ).slice(0, 12);
  }, [categoryProducts, products]);

  const booksProducts = useMemo(() => {
    return (
      categoryProducts.Books?.length
        ? categoryProducts.Books
        : products.filter((item) =>
            categoryMatches(item, ["Books"])
          )
    ).slice(0, 12);
  }, [categoryProducts, products]);

  const recommendedProducts = useMemo(() => {
    return [...products]
      .sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0))
      .slice(0, 12);
  }, [products]);

  const flashProducts = bestDeals.length
    ? bestDeals
    : featuredProducts.length
    ? featuredProducts
    : recommendedProducts;

  const hero = heroSlides[activeHero];

  const totalProducts = products.length;
  const featuredCount = featuredProducts.length;
  const dealsCount = bestDeals.length;
  const categoryCount = new Set(
    products.map((item) => item.category).filter(Boolean)
  ).size;

  const addToCartHandler = async (product) => {
    try {
      await addToCart(product, 1);
      toast.success("Product added to cart");
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Please login to add product"
      );
    }
  };

  const wishlistHandler = async (product) => {
    try {
      await addToWishlist(product);
      toast.success("Added to wishlist");
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Please login to use wishlist"
      );
    }
  };

  const newsletterHandler = (event) => {
    event.preventDefault();

    if (!newsletterEmail.trim()) {
      toast.error("Please enter your email");
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(newsletterEmail.trim())) {
      toast.error("Please enter a valid email");
      return;
    }

    toast.success("Subscribed successfully");
    setNewsletterEmail("");
  };

  return (
    <main className={pageReady ? "elite-home page-ready" : "elite-home"}>
      <section
        className="elite-home-hero"
        style={{
          backgroundImage: `linear-gradient(90deg, rgba(2,6,23,.96), rgba(2,6,23,.72), rgba(2,6,23,.24)), url(${hero.image})`,
        }}
      >
        <Container fluid="xl" className="elite-home-hero-container">
          <motion.div
            key={hero.title}
            initial={{
              opacity: 0,
              x: -30,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            transition={{
              duration: 0.4,
            }}
            className="elite-home-hero-content"
          >
            <Badge
              bg="warning"
              text="dark"
              className="elite-home-hero-badge"
            >
              <FaCrown className="me-2" />
              {hero.offer}
            </Badge>

            <h1>{hero.title}</h1>

            <p>{hero.subtitle}</p>

            <div className="elite-home-hero-actions">
              <Button
                variant="light"
                onClick={() => navigate(hero.primaryPath)}
              >
                Shop Now
                <FaArrowRight className="ms-2" />
              </Button>

              <Button
                variant="outline-light"
                onClick={() => navigate(hero.secondaryPath)}
              >
                Explore Deals
              </Button>

              <Button
                variant="warning"
                onClick={() => navigate("/seller/register")}
              >
                Start Selling
              </Button>
            </div>

            <div className="elite-home-hero-stats">
              <div>
                <strong>{totalProducts}+</strong>
                <span>Products</span>
              </div>

              <div>
                <strong>{categoryCount || categories.length}+</strong>
                <span>Categories</span>
              </div>

              <div>
                <strong>{dealsCount}+</strong>
                <span>Deals</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="elite-home-floating-card card-one"
            animate={{
              y: [0, -10, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
            }}
          >
            <FaFire />
            <span>Flash Deals</span>
          </motion.div>

          <motion.div
            className="elite-home-floating-card card-two"
            animate={{
              y: [0, 12, 0],
            }}
            transition={{
              duration: 4.5,
              repeat: Infinity,
            }}
          >
            <FaTruck />
            <span>Fast Delivery</span>
          </motion.div>

          <div className="elite-home-hero-dots">
            {heroSlides.map((slide, index) => (
              <button
                key={slide.title}
                type="button"
                onClick={() => setActiveHero(index)}
                className={index === activeHero ? "active" : ""}
                aria-label={`Go to ${slide.title}`}
              />
            ))}
          </div>
        </Container>
      </section>

      <motion.section className="elite-home-trust-rail-section" {...sectionMotion}>
        <Container fluid="xl">
          <div className="elite-home-trust-rail">
            {trustCards.map((item) => (
              <div key={item.title}>
                <span>{item.icon}</span>

                <div>
                  <strong>{item.title}</strong>
                  <small>{item.text}</small>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </motion.section>

      <motion.section className="elite-home-ad-section" {...sectionMotion}>
        <Container fluid="xl">
          <Row className="g-4">
            <Col lg={7}>
              <Card className="elite-home-main-ad">
                <Card.Body>
                  <div>
                    <Badge bg="light" text="dark">
                      <FaGem className="me-1" />
                      EliteShop Premium Deals
                    </Badge>

                    <h2>Big Savings On Everything You Love</h2>

                    <p>
                      Premium offers across mobiles, electronics, fashion,
                      grocery, books and home essentials.
                    </p>

                    <Button
                      variant="light"
                      onClick={() => navigate("/products")}
                    >
                      Explore Deals
                      <FaArrowRight className="ms-2" />
                    </Button>
                  </div>

                  <img
                    src="https://images.unsplash.com/photo-1607083206968-13611e3d76db?auto=format&fit=crop&w=900&q=80"
                    alt="EliteShop sale"
                    loading="lazy"
                  />
                </Card.Body>
              </Card>
            </Col>

            <Col lg={5}>
              <div className="elite-home-small-ad-stack">
                <Card className="elite-home-small-ad fashion">
                  <Card.Body>
                    <FaTshirt />

                    <div>
                      <h4>Fashion Sale</h4>
                      <p>Fresh styles and new arrivals</p>
                    </div>

                    <Button
                      size="sm"
                      variant="light"
                      onClick={() => navigate("/products?category=Fashion")}
                    >
                      Shop
                    </Button>
                  </Card.Body>
                </Card>

                <Card className="elite-home-small-ad delivery">
                  <Card.Body>
                    <FaTruck />

                    <div>
                      <h4>Free Delivery Weekend</h4>
                      <p>Selected products only</p>
                    </div>

                    <Button
                      size="sm"
                      variant="light"
                      onClick={() => navigate("/products")}
                    >
                      View
                    </Button>
                  </Card.Body>
                </Card>
              </div>
            </Col>
          </Row>
        </Container>
      </motion.section>

      <motion.section className="elite-home-category-section" {...sectionMotion}>
        <Container fluid="xl">
          <div className="elite-home-section-heading">
            <div>
              <h2>
                <FaBoxOpen className="elite-home-section-icon" />
                Shop By Category
              </h2>

              <p>Explore real product categories from EliteShop sellers.</p>
            </div>

            <Button
              variant="outline-dark"
              className="elite-home-outline-btn"
              onClick={() => navigate("/products")}
            >
              View All
              <FaArrowRight className="ms-2" />
            </Button>
          </div>

          <div className="elite-home-category-grid">
            {categories.map((category) => (
              <motion.button
                whileHover={{
                  y: -6,
                }}
                transition={{
                  duration: 0.18,
                }}
                type="button"
                key={category.title}
                className="elite-home-category-card"
                onClick={() => navigate(category.path)}
              >
                <img
                  src={category.image}
                  alt={category.title}
                  loading="lazy"
                />

                <div>
                  <span>{category.icon}</span>
                  <h4>{category.title}</h4>
                  <p>{category.offer}</p>
                </div>
              </motion.button>
            ))}
          </div>
        </Container>
      </motion.section>

      {loading ? (
        <Container fluid="xl" className="py-5">
          <div className="elite-home-loading-card">
            <Spinner animation="border" />
            <Loader />
            <p>Loading premium products...</p>
          </div>
        </Container>
      ) : error ? (
        <Container fluid="xl" className="py-5">
          <Message variant="danger">{error}</Message>
        </Container>
      ) : products.length === 0 ? (
        <Container fluid="xl" className="py-5">
          <Card className="elite-home-empty-card">
            <Card.Body>
              <FaWarehouse />

              <h3>No products available yet</h3>

              <p>
                Add products from seller/admin dashboard or run your product
                seeder to fill the marketplace.
              </p>

              <div>
                <Button
                  variant="dark"
                  onClick={() => navigate("/seller/add-product")}
                >
                  Add Product
                </Button>

                <Button
                  variant="outline-dark"
                  onClick={() => navigate("/admin/products")}
                >
                  Admin Products
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Container>
      ) : (
        <>
          <ProductRow
            title="Today's Best Deals"
            subtitle="Discounted products with strong offers appear here."
            products={bestDeals}
            path="/products"
            icon={<FaFire className="elite-home-section-icon" />}
            emptyMessage="No discount products available yet."
            addToCartHandler={addToCartHandler}
            wishlistHandler={wishlistHandler}
          />

          <ProductRow
            title="Featured Products"
            subtitle="Premium products highlighted for EliteShop customers."
            products={featuredProducts}
            path="/products?featured=true"
            icon={<FaStar className="elite-home-section-icon" />}
            emptyMessage="No featured products available yet."
            addToCartHandler={addToCartHandler}
            wishlistHandler={wishlistHandler}
          />

          <motion.section className="elite-home-flash-section" {...sectionMotion}>
            <Container fluid="xl">
              <Card className="elite-home-flash-card">
                <Card.Body>
                  <div>
                    <Badge bg="warning" text="dark">
                      <FaBolt className="me-1" />
                      Flash Sale Live
                    </Badge>

                    <h2>Hurry! Deals Are Selling Fast</h2>

                    <p>
                      Flash sale shows discounted or featured products from the
                      current marketplace.
                    </p>

                    <Button
                      variant="light"
                      onClick={() => navigate("/products")}
                    >
                      Shop Flash Deals
                      <FaArrowRight className="ms-2" />
                    </Button>
                  </div>

                  <div className="elite-home-flash-images">
                    {flashProducts.slice(0, 3).map((item) => (
                      <img
                        key={item._id || item.slug}
                        src={getProductImage(item)}
                        alt={item.name}
                        loading="lazy"
                        onError={(event) => {
                          event.currentTarget.onerror = null;
                          event.currentTarget.src =
                            getProductImageFallback(item);
                        }}
                      />
                    ))}
                  </div>
                </Card.Body>
              </Card>
            </Container>
          </motion.section>

          <ProductRow
            title="Trending Electronics"
            subtitle="Only electronics category products appear here."
            products={electronicsProducts}
            path="/products?category=Electronics"
            icon={<FaLaptop className="elite-home-section-icon" />}
            emptyMessage="No electronics products available yet."
            addToCartHandler={addToCartHandler}
            wishlistHandler={wishlistHandler}
          />

          <ProductRow
            title="Fashion Picks"
            subtitle="Fashion and style products appear here."
            products={fashionProducts}
            path="/products?category=Fashion"
            icon={<FaTshirt className="elite-home-section-icon" />}
            emptyMessage="No fashion products available yet."
            addToCartHandler={addToCartHandler}
            wishlistHandler={wishlistHandler}
          />

          <ProductRow
            title="Top Deals On Mobiles"
            subtitle="Only mobile category products appear here."
            products={mobileProducts}
            path="/products?category=Mobiles"
            icon={<FaMobileAlt className="elite-home-section-icon" />}
            emptyMessage="No mobile products available yet."
            addToCartHandler={addToCartHandler}
            wishlistHandler={wishlistHandler}
          />

          <motion.section className="elite-home-plus-section" {...sectionMotion}>
            <Container fluid="xl">
              <Card className="elite-home-plus-card">
                <Card.Body>
                  <div>
                    <Badge bg="light" text="dark">
                      <FaCrown className="me-1" />
                      EliteShop Plus
                    </Badge>

                    <h2>Unlock Premium Shopping Benefits</h2>

                    <p>
                      Free delivery, early access, exclusive deals and priority
                      support.
                    </p>

                    <div className="elite-home-plus-tags">
                      <span>Free Delivery</span>
                      <span>Early Access</span>
                      <span>Extra Discounts</span>
                      <span>Priority Support</span>
                    </div>
                  </div>

                  <Button
                    variant="warning"
                    onClick={() => navigate("/products")}
                  >
                    Explore Benefits
                  </Button>
                </Card.Body>
              </Card>
            </Container>
          </motion.section>

          <ProductRow
            title="Home Essentials"
            subtitle="Home, furniture, kitchen and appliance products."
            products={homeProducts}
            path="/products?category=Home"
            icon={<FaHome className="elite-home-section-icon" />}
            emptyMessage="No home products available yet."
            addToCartHandler={addToCartHandler}
            wishlistHandler={wishlistHandler}
          />

          <ProductRow
            title="Grocery Store"
            subtitle="Daily needs, drinks, food and household essentials."
            products={groceryProducts}
            path="/products?category=Grocery"
            icon={<FaShoppingBasket className="elite-home-section-icon" />}
            emptyMessage="No grocery products available yet."
            addToCartHandler={addToCartHandler}
            wishlistHandler={wishlistHandler}
          />

          <ProductRow
            title="Gaming Zone"
            subtitle="Gaming consoles, accessories and setup gear."
            products={gamingProducts}
            path="/products?category=Gaming"
            icon={<FaGamepad className="elite-home-section-icon" />}
            emptyMessage="No gaming products available yet."
            addToCartHandler={addToCartHandler}
            wishlistHandler={wishlistHandler}
          />

          <ProductRow
            title="Books & Learning"
            subtitle="Books for students, developers and professionals."
            products={booksProducts}
            path="/products?category=Books"
            icon={<FaBook className="elite-home-section-icon" />}
            emptyMessage="No books available yet."
            addToCartHandler={addToCartHandler}
            wishlistHandler={wishlistHandler}
          />

          <motion.section className="elite-home-smart-ads" {...sectionMotion}>
            <Container fluid="xl">
              <div className="elite-home-section-heading">
                <div>
                  <h2>
                    <FaTags className="elite-home-section-icon" />
                    Smart Shopping Picks
                  </h2>

                  <p>Curated collections for faster shopping.</p>
                </div>
              </div>

              <Row className="g-4">
                {adCards.map((ad) => (
                  <Col
                    key={ad.title}
                    md={6}
                    lg={4}
                  >
                    <Card className="elite-home-smart-ad-card">
                      <img
                        src={ad.image}
                        alt={ad.title}
                        loading="lazy"
                      />

                      <Card.Body>
                        <h4>{ad.title}</h4>

                        <p>{ad.offer}</p>

                        <Button
                          variant="light"
                          size="sm"
                          onClick={() => navigate(ad.path)}
                        >
                          Shop Now
                        </Button>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Container>
          </motion.section>

          <ProductRow
            title="Recommended For You"
            subtitle="Popular products sorted by customer rating."
            products={recommendedProducts}
            path="/products"
            icon={<FaStar className="elite-home-section-icon" />}
            emptyMessage="No recommended products available yet."
            addToCartHandler={addToCartHandler}
            wishlistHandler={wishlistHandler}
          />
        </>
      )}

      <motion.section className="elite-home-brand-section" {...sectionMotion}>
        <Container fluid="xl">
          <div className="elite-home-section-heading">
            <div>
              <h2>
                <FaStore className="elite-home-section-icon" />
                Popular Brands
              </h2>

              <p>Explore trusted product collections.</p>
            </div>
          </div>

          <div className="elite-home-brand-marquee">
            <div className="elite-home-brand-track">
              {[...brands, ...brands].map((brand, index) => (
                <div
                  key={`${brand}-${index}`}
                  className="elite-home-brand-card"
                >
                  {brand}
                </div>
              ))}
            </div>
          </div>
        </Container>
      </motion.section>

      <motion.section className="elite-home-seller-section" {...sectionMotion}>
        <Container fluid="xl">
          <Card className="elite-home-seller-card">
            <Card.Body>
              <div>
                <Badge bg="warning" text="dark">
                  <FaStore className="me-1" />
                  Seller Program
                </Badge>

                <h2>Start Selling On EliteShop</h2>

                <p>
                  Create your seller account, get admin approval and manage
                  products, orders, inventory and analytics from your dashboard.
                </p>
              </div>

              <Button
                variant="dark"
                onClick={() => navigate("/seller/register")}
              >
                Become Seller
                <FaArrowRight className="ms-2" />
              </Button>
            </Card.Body>
          </Card>
        </Container>
      </motion.section>

      <motion.section className="elite-home-trust-section" {...sectionMotion}>
        <Container fluid="xl">
          <div className="elite-home-section-heading">
            <div>
              <h2>
                <FaShieldAlt className="elite-home-section-icon" />
                Why Shop With EliteShop?
              </h2>

              <p>Built for trust, speed and smooth shopping.</p>
            </div>
          </div>

          <Row className="g-4">
            {trustCards.map((card) => (
              <Col
                key={card.title}
                md={6}
                lg={3}
              >
                <div className="elite-home-trust-card">
                  <span>{card.icon}</span>
                  <h5>{card.title}</h5>
                  <p>{card.text}</p>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </motion.section>

      <motion.section className="elite-home-newsletter-section" {...sectionMotion}>
        <Container fluid="xl">
          <Card className="elite-home-newsletter-card">
            <Card.Body>
              <Row className="align-items-center g-4">
                <Col lg={7}>
                  <Badge bg="warning" text="dark">
                    Stay Updated
                  </Badge>

                  <h2>Get Deals, Price Drops & App Offers</h2>

                  <p>
                    Subscribe to receive exclusive offers and shopping updates.
                  </p>

                  <Form
                    className="elite-home-newsletter-form"
                    onSubmit={newsletterHandler}
                  >
                    <div>
                      <FaEnvelope />

                      <input
                        type="email"
                        placeholder="Enter your email"
                        value={newsletterEmail}
                        onChange={(event) =>
                          setNewsletterEmail(event.target.value)
                        }
                      />
                    </div>

                    <Button type="submit">
                      Subscribe
                    </Button>
                  </Form>

                  <div className="elite-home-app-buttons">
                    <button type="button">
                      <FaGooglePlay />
                      Google Play
                    </button>

                    <button type="button">
                      <FaApple />
                      App Store
                    </button>
                  </div>
                </Col>

                <Col lg={5}>
                  <div className="elite-home-phone">
                    <div>
                      <h5>EliteShop App</h5>
                      <p>Fast checkout</p>
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Container>
      </motion.section>
    </main>
  );
};

export default HomePage;