import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useLocation,
  Link,
  useNavigate,
} from "react-router-dom";

import {
  Row,
  Col,
  Container,
  Form,
  Button,
  Pagination,
  Badge,
  Card,
  Carousel,
  InputGroup,
  Offcanvas,
  Spinner,
} from "react-bootstrap";

import { motion } from "framer-motion";

import {
  FaFilter,
  FaSearch,
  FaFire,
  FaTruck,
  FaStar,
  FaTags,
  FaMobileAlt,
  FaLaptop,
  FaTshirt,
  FaGamepad,
  FaCouch,
  FaTv,
  FaBook,
  FaHome,
  FaGift,
  FaShoppingBag,
  FaSlidersH,
  FaBolt,
  FaPercent,
  FaBoxOpen,
  FaHeart,
  FaShoppingCart,
  FaEye,
  FaCrown,
  FaShieldAlt,
  FaUndo,
  FaTimes,
} from "react-icons/fa";

import { toast } from "react-toastify";

import Loader from "../components/Loader";
import Message from "../components/Message";

import { useCart } from "../context/CartContext";

import api from "../utils/axios";

import "../styles/ProductsPage.css";

const categories = [
  {
    name: "All",
    value: "",
    icon: <FaBoxOpen />,
    image:
      "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&w=500&q=80",
  },
  {
    name: "Mobiles",
    value: "Mobiles",
    icon: <FaMobileAlt />,
    image:
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=500&q=80",
  },
  {
    name: "Electronics",
    value: "Electronics",
    icon: <FaLaptop />,
    image:
      "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=500&q=80",
  },
  {
    name: "Fashion",
    value: "Fashion",
    icon: <FaTshirt />,
    image:
      "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=500&q=80",
  },
  {
    name: "Gaming",
    value: "Gaming",
    icon: <FaGamepad />,
    image:
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=500&q=80",
  },
  {
    name: "Furniture",
    value: "Furniture",
    icon: <FaCouch />,
    image:
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=500&q=80",
  },
  {
    name: "Appliances",
    value: "Appliances",
    icon: <FaTv />,
    image:
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=500&q=80",
  },
  {
    name: "Books",
    value: "Books",
    icon: <FaBook />,
    image:
      "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=500&q=80",
  },
  {
    name: "Home",
    value: "Home",
    icon: <FaHome />,
    image:
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=500&q=80",
  },
];

const promoSlides = [
  {
    title: "Big Shopping Days",
    subtitle: "Top deals on electronics, fashion and home essentials",
    badge: "UP TO 70% OFF",
    image:
      "https://images.unsplash.com/photo-1607082349566-187342175e2f?auto=format&fit=crop&w=1600&q=80",
    path: "/products?featured=true",
  },
  {
    title: "Free Shipping Store",
    subtitle: "Shop products with free delivery and fast checkout",
    badge: "FREE DELIVERY",
    image:
      "https://images.unsplash.com/photo-1586880244406-556ebe35f282?auto=format&fit=crop&w=1600&q=80",
    path: "/products?freeShipping=true",
  },
  {
    title: "New Arrivals",
    subtitle: "Fresh products added for your shopping collection",
    badge: "JUST LANDED",
    image:
      "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1600&q=80",
    path: "/products",
  },
];

const quickDeals = [
  {
    title: "Featured Deals",
    icon: <FaFire />,
    path: "/products?featured=true",
    color: "deal-red",
  },
  {
    title: "Free Shipping",
    icon: <FaTruck />,
    path: "/products?freeShipping=true",
    color: "deal-green",
  },
  {
    title: "Top Rated",
    icon: <FaStar />,
    path: "/products?rating=4",
    color: "deal-blue",
  },
  {
    title: "Best Offers",
    icon: <FaPercent />,
    path: "/products?sort=discount",
    color: "deal-purple",
  },
];

const formatPrice = (price) => {
  return Number(price || 0).toLocaleString("en-IN");
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

const ProductsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    addToCart,
    addToWishlist,
  } = useCart();

  const query = new URLSearchParams(location.search);

  const keyword = query.get("keyword") || "";
  const category = query.get("category") || "";
  const brand = query.get("brand") || "";
  const pageNumber = Number(query.get("pageNumber")) || 1;
  const featured = query.get("featured") || "";
  const freeShipping = query.get("freeShipping") || "";
  const rating = query.get("rating") || "";
  const stock = query.get("stock") || "";
  const minPrice = query.get("minPrice") || "";
  const maxPrice = query.get("maxPrice") || "";
  const sortFromUrl = query.get("sort") || "latest";

  const [products, setProducts] = useState([]);
  const [allPageProducts, setAllPageProducts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);

  const [localKeyword, setLocalKeyword] = useState(keyword);
  const [localCategory, setLocalCategory] = useState(category || "All");
  const [localBrand, setLocalBrand] = useState(brand);
  const [localMinPrice, setLocalMinPrice] = useState(minPrice);
  const [localMaxPrice, setLocalMaxPrice] = useState(maxPrice);
  const [localRating, setLocalRating] = useState(rating);
  const [localStock, setLocalStock] = useState(stock);
  const [localFreeShipping, setLocalFreeShipping] = useState(
    freeShipping === "true"
  );
  const [localFeatured, setLocalFeatured] = useState(featured === "true");
  const [sort, setSort] = useState(sortFromUrl);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    setLocalKeyword(keyword);
    setLocalCategory(category || "All");
    setLocalBrand(brand);
    setLocalMinPrice(minPrice);
    setLocalMaxPrice(maxPrice);
    setLocalRating(rating);
    setLocalStock(stock);
    setLocalFreeShipping(freeShipping === "true");
    setLocalFeatured(featured === "true");
    setSort(sortFromUrl);
  }, [
    keyword,
    category,
    brand,
    minPrice,
    maxPrice,
    rating,
    stock,
    freeShipping,
    featured,
    sortFromUrl,
  ]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const params = new URLSearchParams();

        if (keyword) params.set("keyword", keyword);
        if (category) params.set("category", category);
        if (brand) params.set("brand", brand);
        if (featured) params.set("featured", featured);
        if (freeShipping) params.set("freeShipping", freeShipping);
        if (rating) params.set("rating", rating);
        if (stock) params.set("stock", stock);
        if (minPrice) params.set("minPrice", minPrice);
        if (maxPrice) params.set("maxPrice", maxPrice);

        params.set("pageNumber", pageNumber);

        const { data } = await api.get(`/products?${params.toString()}`);

        const receivedProducts = Array.isArray(data)
          ? data
          : data.products || [];

        setAllPageProducts(receivedProducts);
        setPages(data.pages || 1);
        setPage(data.page || pageNumber);
      } catch (error) {
        setError(
          error.response?.data?.message ||
            error.message ||
            "Failed to load products"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [
    keyword,
    category,
    brand,
    pageNumber,
    featured,
    freeShipping,
    rating,
    stock,
    minPrice,
    maxPrice,
  ]);

  useEffect(() => {
    let sortedProducts = [...allPageProducts];

    if (sort === "low") {
      sortedProducts.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
    }

    if (sort === "high") {
      sortedProducts.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
    }

    if (sort === "rating") {
      sortedProducts.sort(
        (a, b) => Number(b.rating || 0) - Number(a.rating || 0)
      );
    }

    if (sort === "discount") {
      sortedProducts.sort(
        (a, b) =>
          getDiscountPercent(b) -
          getDiscountPercent(a)
      );
    }

    if (sort === "popular" || sort === "trending") {
      sortedProducts.sort(
        (a, b) =>
          Number(b.soldCount || 0) +
          Number(b.views || 0) -
          (Number(a.soldCount || 0) + Number(a.views || 0))
      );
    }

    setProducts(sortedProducts);
  }, [allPageProducts, sort]);

  const activeTitle = useMemo(() => {
    if (keyword && category) return `${category} results for "${keyword}"`;
    if (keyword) return `Search results for "${keyword}"`;
    if (category) return `${category} Products`;
    if (featured === "true") return "Featured Deals";
    if (freeShipping === "true") return "Free Shipping Products";

    return "All Products";
  }, [
    keyword,
    category,
    featured,
    freeShipping,
  ]);

  const availableBrands = useMemo(() => {
    const brandList = allPageProducts
      .map((item) => item.brand)
      .filter(Boolean);

    return [...new Set(brandList)];
  }, [allPageProducts]);

  const buildQueryPath = (changes = {}) => {
    const params = new URLSearchParams(location.search);

    Object.entries(changes).forEach(([key, value]) => {
      if (
        value === "" ||
        value === null ||
        value === undefined ||
        value === false
      ) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    if (!changes.pageNumber) {
      params.set("pageNumber", 1);
    }

    const queryString = params.toString();

    return queryString ? `/products?${queryString}` : "/products";
  };

  const applyFilters = (e) => {
    e.preventDefault();

    const params = new URLSearchParams();

    if (localKeyword.trim()) params.set("keyword", localKeyword.trim());

    if (localCategory && localCategory !== "All") {
      params.set("category", localCategory);
    }

    if (localBrand) params.set("brand", localBrand);
    if (localMinPrice) params.set("minPrice", localMinPrice);
    if (localMaxPrice) params.set("maxPrice", localMaxPrice);
    if (localRating) params.set("rating", localRating);
    if (localStock) params.set("stock", localStock);
    if (localFreeShipping) params.set("freeShipping", "true");
    if (localFeatured) params.set("featured", "true");
    if (sort && sort !== "latest") params.set("sort", sort);

    params.set("pageNumber", 1);

    navigate(`/products?${params.toString()}`);
    setShowMobileFilters(false);
  };

  const clearFilters = () => {
    setLocalKeyword("");
    setLocalCategory("All");
    setLocalBrand("");
    setLocalMinPrice("");
    setLocalMaxPrice("");
    setLocalRating("");
    setLocalStock("");
    setLocalFreeShipping(false);
    setLocalFeatured(false);
    setSort("latest");

    navigate("/products");
    setShowMobileFilters(false);
  };

  const sortHandler = (value) => {
    setSort(value);

    navigate(
      buildQueryPath({
        sort: value === "latest" ? "" : value,
      })
    );
  };

  const addToCartHandler = (product) => {
    addToCart(product, 1);
    toast.success("Product added to cart");
  };

  const wishlistHandler = (product) => {
    addToWishlist(product);
    toast.success("Added to wishlist");
  };

  const FilterContent = () => (
    <Form onSubmit={applyFilters} className="elite-product-filter-form">
      <div className="elite-filter-title">
        <FaSlidersH />
        <span>Smart Filters</span>
      </div>

      <Form.Group className="mb-3">
        <Form.Label>Search Products</Form.Label>

        <InputGroup>
          <InputGroup.Text>
            <FaSearch />
          </InputGroup.Text>

          <Form.Control
            value={localKeyword}
            placeholder="Search products"
            onChange={(e) => setLocalKeyword(e.target.value)}
          />
        </InputGroup>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Category</Form.Label>

        <Form.Select
          value={localCategory}
          onChange={(e) => setLocalCategory(e.target.value)}
        >
          {categories.map((cat) => (
            <option key={cat.name} value={cat.value || "All"}>
              {cat.name}
            </option>
          ))}
        </Form.Select>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Brand</Form.Label>

        <Form.Select
          value={localBrand}
          onChange={(e) => setLocalBrand(e.target.value)}
        >
          <option value="">All Brands</option>

          {availableBrands.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </Form.Select>
      </Form.Group>

      <Row>
        <Col xs={6}>
          <Form.Group className="mb-3">
            <Form.Label>Min Price</Form.Label>

            <Form.Control
              type="number"
              value={localMinPrice}
              placeholder="₹ Min"
              onChange={(e) => setLocalMinPrice(e.target.value)}
            />
          </Form.Group>
        </Col>

        <Col xs={6}>
          <Form.Group className="mb-3">
            <Form.Label>Max Price</Form.Label>

            <Form.Control
              type="number"
              value={localMaxPrice}
              placeholder="₹ Max"
              onChange={(e) => setLocalMaxPrice(e.target.value)}
            />
          </Form.Group>
        </Col>
      </Row>

      <Form.Group className="mb-3">
        <Form.Label>Rating</Form.Label>

        <Form.Select
          value={localRating}
          onChange={(e) => setLocalRating(e.target.value)}
        >
          <option value="">All Ratings</option>
          <option value="4">4★ & Above</option>
          <option value="3">3★ & Above</option>
          <option value="2">2★ & Above</option>
        </Form.Select>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Stock</Form.Label>

        <Form.Select
          value={localStock}
          onChange={(e) => setLocalStock(e.target.value)}
        >
          <option value="">All Products</option>
          <option value="instock">In Stock Only</option>
        </Form.Select>
      </Form.Group>

      <div className="elite-filter-checks">
        <Form.Check
          type="checkbox"
          label="Free Shipping"
          checked={localFreeShipping}
          onChange={(e) => setLocalFreeShipping(e.target.checked)}
        />

        <Form.Check
          type="checkbox"
          label="Featured Deals"
          checked={localFeatured}
          onChange={(e) => setLocalFeatured(e.target.checked)}
        />
      </div>

      <div className="d-grid gap-2 mt-4">
        <Button type="submit" className="elite-apply-filter-btn">
          Apply Filters
        </Button>

        <Button
          type="button"
          variant="outline-dark"
          onClick={clearFilters}
          className="rounded-pill fw-bold"
        >
          Clear All
        </Button>
      </div>
    </Form>
  );

  if (loading) {
    return (
      <Container fluid="xl" className="elite-products-page py-4">
        <div className="elite-products-loader">
          <Spinner animation="border" />
          <Loader />
          <p>Loading products...</p>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container fluid="xl" className="elite-products-page py-4">
        <Message variant="danger">{error}</Message>

        <Button
          variant="dark"
          className="rounded-pill fw-bold"
          onClick={() => window.location.reload()}
        >
          Retry
        </Button>
      </Container>
    );
  }

  return (
    <Container fluid="xl" className="elite-products-page">
      <motion.section
        className="elite-product-hero"
        initial={{
          opacity: 0,
          y: 18,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.45,
        }}
      >
        <Carousel fade controls indicators>
          {promoSlides.map((slide) => (
            <Carousel.Item key={slide.title}>
              <div
                className="elite-product-slide"
                style={{
                  backgroundImage: `linear-gradient(90deg, rgba(2,6,23,.94), rgba(2,6,23,.5), rgba(2,6,23,.12)), url(${slide.image})`,
                }}
              >
                <div className="elite-product-slide-content">
                  <Badge bg="warning" text="dark" className="mb-3">
                    <FaCrown className="me-2" />
                    {slide.badge}
                  </Badge>

                  <h1>{slide.title}</h1>

                  <p>{slide.subtitle}</p>

                  <Button
                    variant="light"
                    className="rounded-pill fw-bold"
                    onClick={() => navigate(slide.path)}
                  >
                    Shop Now
                    <FaShoppingBag className="ms-2" />
                  </Button>
                </div>
              </div>
            </Carousel.Item>
          ))}
        </Carousel>
      </motion.section>

      <section className="elite-category-cards">
        {categories.slice(0, 8).map((cat, index) => (
          <motion.div
            key={cat.name}
            initial={{
              opacity: 0,
              y: 18,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: index * 0.03,
            }}
          >
            <button
              className={
                category === cat.value || (!category && cat.name === "All")
                  ? "elite-category-card active"
                  : "elite-category-card"
              }
              onClick={() =>
                navigate(cat.value ? `/products?category=${cat.value}` : "/products")
              }
            >
              <img src={cat.image} alt={cat.name} />

              <div>
                <span>{cat.icon}</span>
                <strong>{cat.name}</strong>
              </div>
            </button>
          </motion.div>
        ))}
      </section>

      <section className="elite-deal-strip">
        {quickDeals.map((deal) => (
          <button
            key={deal.title}
            className={`elite-deal-card ${deal.color}`}
            onClick={() => navigate(deal.path)}
          >
            {deal.icon}
            <span>{deal.title}</span>
          </button>
        ))}
      </section>

      <section className="elite-products-toolbar">
        <div>
          <h2>{activeTitle}</h2>

          <p>
            Showing {products.length} product
            {products.length !== 1 ? "s" : ""} on this page
          </p>
        </div>

        <div className="elite-toolbar-actions">
          <Button
            variant="outline-dark"
            className="d-lg-none rounded-pill fw-bold"
            onClick={() => setShowMobileFilters(true)}
          >
            <FaFilter className="me-2" />
            Filters
          </Button>

          <Form.Select
            value={sort}
            onChange={(e) => sortHandler(e.target.value)}
            className="elite-sort-select"
          >
            <option value="latest">Latest Products</option>
            <option value="popular">Popular</option>
            <option value="low">Price: Low to High</option>
            <option value="high">Price: High to Low</option>
            <option value="rating">Top Rated</option>
            <option value="discount">Best Discount</option>
          </Form.Select>
        </div>
      </section>

      {(keyword ||
        category ||
        brand ||
        minPrice ||
        maxPrice ||
        rating ||
        stock ||
        freeShipping ||
        featured) && (
        <section className="elite-active-filters">
          <span>Active Filters:</span>

          {keyword && <Badge bg="dark">Search: {keyword}</Badge>}
          {category && <Badge bg="primary">Category: {category}</Badge>}
          {brand && <Badge bg="info">Brand: {brand}</Badge>}
          {minPrice && <Badge bg="secondary">Min ₹{minPrice}</Badge>}
          {maxPrice && <Badge bg="secondary">Max ₹{maxPrice}</Badge>}
          {rating && (
            <Badge bg="warning" text="dark">
              {rating}★ & Above
            </Badge>
          )}
          {stock && <Badge bg="success">In Stock</Badge>}
          {freeShipping && <Badge bg="success">Free Shipping</Badge>}
          {featured && <Badge bg="danger">Featured</Badge>}

          <Button size="sm" variant="outline-danger" onClick={clearFilters}>
            <FaTimes className="me-1" />
            Clear
          </Button>
        </section>
      )}

      <Row className="g-4">
        <Col lg={3} xl={2} className="d-none d-lg-block">
          <Card className="elite-filter-card">
            <Card.Body>
              <FilterContent />
            </Card.Body>
          </Card>
        </Col>

        <Col lg={9} xl={10}>
          {products.length === 0 ? (
            <Card className="elite-empty-products">
              <Card.Body>
                <FaSearch />

                <h3>No products found</h3>

                <p>
                  Try changing category, search keyword, price range or filters.
                </p>

                <Button variant="dark" onClick={clearFilters}>
                  View All Products
                </Button>
              </Card.Body>
            </Card>
          ) : (
            <Row>
              {products.map((product, index) => (
                <Col
                  key={product._id}
                  sm={12}
                  md={6}
                  lg={4}
                  xl={3}
                  className="mb-4"
                >
                  <motion.div
                    initial={{
                      opacity: 0,
                      y: 24,
                    }}
                    whileInView={{
                      opacity: 1,
                      y: 0,
                    }}
                    viewport={{
                      once: true,
                    }}
                    transition={{
                      duration: 0.35,
                      delay: Math.min(index * 0.03, 0.18),
                    }}
                  >
                    <MarketplaceProductCard
                      product={product}
                      addToCartHandler={addToCartHandler}
                      wishlistHandler={wishlistHandler}
                    />
                  </motion.div>
                </Col>
              ))}
            </Row>
          )}

          {pages > 1 && (
            <Pagination className="justify-content-center mt-4 elite-pagination">
              {[...Array(pages).keys()].map((x) => (
                <Pagination.Item
                  key={x + 1}
                  active={x + 1 === page}
                  as={Link}
                  to={buildQueryPath({
                    pageNumber: x + 1,
                  })}
                >
                  {x + 1}
                </Pagination.Item>
              ))}
            </Pagination>
          )}
        </Col>
      </Row>

      <Row className="g-4 mt-4">
        <Col md={4}>
          <Card className="elite-info-card">
            <Card.Body>
              <FaBolt />
              <h5>Fast Shopping</h5>
              <p>Filter, search and find products without page reload.</p>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="elite-info-card">
            <Card.Body>
              <FaTruck />
              <h5>Delivery Friendly</h5>
              <p>Find free shipping and in-stock products faster.</p>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="elite-info-card">
            <Card.Body>
              <FaTags />
              <h5>Smart Deals</h5>
              <p>Browse featured deals, offers and top rated products.</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Offcanvas
        show={showMobileFilters}
        onHide={() => setShowMobileFilters(false)}
        placement="start"
        className="elite-products-filter-offcanvas"
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Product Filters</Offcanvas.Title>
        </Offcanvas.Header>

        <Offcanvas.Body>
          <FilterContent />
        </Offcanvas.Body>
      </Offcanvas>
    </Container>
  );
};

const MarketplaceProductCard = ({
  product,
  addToCartHandler,
  wishlistHandler,
}) => {
  const productPath = `/product/${product.slug || product._id}`;
  const discountPercent = getDiscountPercent(product);
  const stock = Number(product.countInStock || 0);

  return (
    <Card className="elite-market-product-card">
      <div className="elite-market-product-image">
        <Link to={productPath}>
          <img
            src={product.image || "/images/products/product1.jpg"}
            alt={product.name}
            loading="lazy"
          />
        </Link>

        <div className="elite-market-badge-stack">
          {discountPercent > 0 && (
            <Badge className="elite-market-discount">
              {discountPercent}% OFF
            </Badge>
          )}

          {product.isFeatured && (
            <Badge className="elite-market-featured">
              Featured
            </Badge>
          )}
        </div>

        <button
          type="button"
          className="elite-market-heart"
          onClick={() => wishlistHandler(product)}
          aria-label="Add to wishlist"
        >
          <FaHeart />
        </button>

        <Link
          to={productPath}
          className="elite-market-view"
          aria-label="View product"
        >
          <FaEye />
        </Link>
      </div>

      <Card.Body>
        <div className="elite-market-category-row">
          <span>{product.category || "Elite Product"}</span>

          <Badge bg={stock > 0 ? "success" : "danger"}>
            {stock > 0 ? "In Stock" : "Out"}
          </Badge>
        </div>

        <Link to={productPath} className="elite-market-product-title">
          {product.name}
        </Link>

        <p className="elite-market-product-desc">
          {product.description ||
            "Premium quality product from EliteShop marketplace."}
        </p>

        <div className="elite-market-rating-row">
          <span>
            <FaStar />
            {Number(product.rating || 0).toFixed(1)}
          </span>

          <small>
            {product.numReviews || 0} reviews
          </small>
        </div>

        <div className="elite-market-price-row">
          <strong>₹{formatPrice(product.price)}</strong>

          {Number(product.originalPrice || 0) > Number(product.price || 0) && (
            <del>₹{formatPrice(product.originalPrice)}</del>
          )}
        </div>

        <div className="elite-market-service-row">
          <span>
            <FaTruck />
            {product.freeShipping ? "Free Delivery" : "Fast Delivery"}
          </span>

          <span>
            <FaShieldAlt />
            Secure
          </span>
        </div>

        <Button
          className="elite-market-cart-btn"
          disabled={stock === 0}
          onClick={() => addToCartHandler(product)}
        >
          <FaShoppingCart className="me-2" />
          {stock === 0 ? "Out of Stock" : "Add to Cart"}
        </Button>
      </Card.Body>
    </Card>
  );
};

export default ProductsPage;