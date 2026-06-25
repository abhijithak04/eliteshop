import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Container,
  Badge,
  Form,
  Dropdown,
  Offcanvas,
  Button,
} from "react-bootstrap";

import {
  FaBars,
  FaSearch,
  FaShoppingCart,
  FaUser,
  FaHeart,
  FaBell,
  FaSignOutAlt,
  FaUserShield,
  FaStore,
  FaBoxOpen,
  FaClipboardList,
  FaUsers,
  FaPlusCircle,
  FaChartLine,
  FaMobileAlt,
  FaLaptop,
  FaTshirt,
  FaGamepad,
  FaCouch,
  FaTv,
  FaBook,
  FaHome,
  FaMapMarkerAlt,
  FaHeadset,
  FaBullhorn,
  FaFire,
  FaGift,
  FaTruck,
  FaTimes,
  FaShoppingBag,
  FaShieldAlt,
  FaRocket,
  FaClock,
  FaUserPlus,
  FaSignInAlt,
  FaTags,
} from "react-icons/fa";

import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

import "../styles/Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    userInfo,
    logout,
    sellerLogout,
  } = useAuth();

  const {
    cartItems = [],
    wishlistItems = [],
  } = useCart();

  const [keyword, setKeyword] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState("All");
  const [scrolled, setScrolled] = useState(false);
  const [showMobileMenu, setShowMobileMenu] =
    useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 12);
    };

    window.addEventListener("scroll", handleScroll);

    return () =>
      window.removeEventListener(
        "scroll",
        handleScroll
      );
  }, []);

  const cartCount = useMemo(() => {
    return cartItems.reduce(
      (acc, item) => acc + Number(item.qty || 0),
      0
    );
  }, [cartItems]);

  const wishlistCount = wishlistItems?.length || 0;

  const role = userInfo?.role || "guest";
  const isAdmin = role === "admin";
  const isSeller = role === "seller";
  const isApprovedSeller =
    isSeller && userInfo?.sellerInfo?.isApproved;

  const categories = [
    {
      name: "All",
      icon: <FaBars />,
      path: "/products",
    },
    {
      name: "Mobiles",
      icon: <FaMobileAlt />,
      path: "/products?category=Mobiles",
    },
    {
      name: "Electronics",
      icon: <FaLaptop />,
      path: "/products?category=Electronics",
    },
    {
      name: "Fashion",
      icon: <FaTshirt />,
      path: "/products?category=Fashion",
    },
    {
      name: "Home & Kitchen",
      icon: <FaHome />,
      path: "/products?category=Home",
    },
    {
      name: "Beauty",
      icon: <FaGift />,
      path: "/products?category=Beauty",
    },
    {
      name: "Grocery",
      icon: <FaShoppingBag />,
      path: "/products?category=Grocery",
    },
    {
      name: "Appliances",
      icon: <FaTv />,
      path: "/products?category=Appliances",
    },
    {
      name: "Gaming",
      icon: <FaGamepad />,
      path: "/products?category=Gaming",
    },
    {
      name: "Furniture",
      icon: <FaCouch />,
      path: "/products?category=Furniture",
    },
    {
      name: "Books",
      icon: <FaBook />,
      path: "/products?category=Books",
    },
    {
      name: "Offers",
      icon: <FaFire />,
      path: "/products?featured=true",
    },
    {
      name: "New Arrivals",
      icon: <FaBullhorn />,
      path: "/products?sort=latest",
    },
  ];

  const searchCategories = [
    "All",
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

  const currentCategory = useMemo(() => {
    const params = new URLSearchParams(
      location.search
    );

    return params.get("category") || "";
  }, [location.search]);

  const closeMobileMenu = () => {
    setShowMobileMenu(false);
  };

  const goTo = (path) => {
    navigate(path);
    closeMobileMenu();
  };

  const submitHandler = (e) => {
    e.preventDefault();

    const trimmedKeyword = keyword.trim();

    const params = new URLSearchParams();

    if (trimmedKeyword) {
      params.set("keyword", trimmedKeyword);
    }

    if (
      selectedCategory &&
      selectedCategory !== "All"
    ) {
      params.set("category", selectedCategory);
    }

    const queryString = params.toString();

    navigate(
      queryString
        ? `/products?${queryString}`
        : "/products"
    );
  };

  const logoutHandler = async () => {
    if (isSeller && sellerLogout) {
      await sellerLogout();
      return;
    }

    await logout();

    closeMobileMenu();
  };

  const accountTitle = () => {
    if (!userInfo) {
      return "Login";
    }

    if (isAdmin) {
      return "Admin";
    }

    if (isSeller) {
      return isApprovedSeller
        ? "Seller"
        : "Pending";
    }

    return userInfo.name;
  };

  const sellerPrimaryPath = () => {
    if (!userInfo) {
      return "/seller/login";
    }

    if (isSeller && !isApprovedSeller) {
      return "/seller/pending";
    }

    if (isApprovedSeller) {
      return "/seller/dashboard";
    }

    return "/seller/register";
  };

  return (
    <>
      <header
        className={
          scrolled
            ? "elite-navbar elite-navbar-scrolled"
            : "elite-navbar"
        }
      >
        <Container fluid="xl">
          <div className="elite-navbar-main">
            <Link
              to="/"
              className="elite-logo"
            >
              ELITE<span>SHOP</span>
            </Link>

            <button
              type="button"
              className="elite-location d-none d-lg-flex"
              onClick={() => goTo("/profile")}
            >
              <FaMapMarkerAlt />

              <span>
                <small>Deliver to</small>
                <strong>Select Location</strong>
              </span>
            </button>

            <Form
              className="elite-search"
              onSubmit={submitHandler}
            >
              <select
                value={selectedCategory}
                onChange={(e) =>
                  setSelectedCategory(e.target.value)
                }
                aria-label="Select search category"
              >
                {searchCategories.map((cat) => (
                  <option
                    key={cat}
                    value={cat}
                  >
                    {cat}
                  </option>
                ))}
              </select>

              <input
                type="text"
                placeholder="Search products, brands and categories"
                value={keyword}
                onChange={(e) =>
                  setKeyword(e.target.value)
                }
                aria-label="Search products"
              />

              {keyword && (
                <button
                  type="button"
                  className="elite-search-clear"
                  onClick={() => setKeyword("")}
                  aria-label="Clear search"
                >
                  <FaTimes />
                </button>
              )}

              <button
                type="submit"
                className="elite-search-btn"
                aria-label="Search"
              >
                <FaSearch />
              </button>
            </Form>

            <div className="elite-actions">
              {!userInfo && (
                <button
                  type="button"
                  className="elite-sell-link d-none d-xl-inline-flex"
                  onClick={() =>
                    goTo("/seller/register")
                  }
                >
                  <FaRocket />
                  <span>Sell on EliteShop</span>
                </button>
              )}

              {userInfo ? (
                <Dropdown align="end">
                  <Dropdown.Toggle className="elite-account-btn">
                    {isAdmin ? (
                      <FaUserShield />
                    ) : isSeller ? (
                      <FaStore />
                    ) : (
                      <FaUser />
                    )}

                    <span>
                      <small>Hello,</small>
                      <strong>
                        {accountTitle()}
                      </strong>
                    </span>
                  </Dropdown.Toggle>

                  <Dropdown.Menu className="elite-dropdown-menu">
                    <div className="elite-dropdown-user">
                      <div className="elite-avatar">
                        {(userInfo.name || "U")
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <div>
                        <strong>{userInfo.name}</strong>
                        <small>{userInfo.email}</small>

                        <Badge
                          bg={
                            isAdmin
                              ? "danger"
                              : isSeller
                              ? isApprovedSeller
                                ? "success"
                                : "warning"
                              : "primary"
                          }
                          text={
                            isSeller &&
                            !isApprovedSeller
                              ? "dark"
                              : undefined
                          }
                          className="mt-1"
                        >
                          {isSeller &&
                          !isApprovedSeller
                            ? "PENDING SELLER"
                            : role.toUpperCase()}
                        </Badge>
                      </div>
                    </div>

                    <Dropdown.Divider />

                    <Dropdown.Item
                      onClick={() => goTo("/profile")}
                    >
                      <FaUser className="me-2" />
                      Profile
                    </Dropdown.Item>

                    {!isSeller && (
                      <>
                        <Dropdown.Item
                          onClick={() => goTo("/orders")}
                        >
                          <FaClipboardList className="me-2" />
                          My Orders
                        </Dropdown.Item>

                        <Dropdown.Item
                          onClick={() =>
                            goTo("/wishlist")
                          }
                        >
                          <FaHeart className="me-2" />
                          Wishlist
                        </Dropdown.Item>

                        <Dropdown.Item
                          onClick={() =>
                            goTo("/notifications")
                          }
                        >
                          <FaBell className="me-2" />
                          Notifications
                        </Dropdown.Item>
                      </>
                    )}

                    {!isSeller && !isAdmin && (
                      <>
                        <Dropdown.Divider />

                        <Dropdown.Item
                          onClick={() =>
                            goTo("/seller/register")
                          }
                        >
                          <FaStore className="me-2" />
                          Register as Seller
                        </Dropdown.Item>

                        <Dropdown.Item
                          onClick={() =>
                            goTo("/seller/login")
                          }
                        >
                          <FaSignInAlt className="me-2" />
                          Seller Login
                        </Dropdown.Item>
                      </>
                    )}

                    {isAdmin && (
                      <>
                        <Dropdown.Divider />

                        <Dropdown.Item
                          onClick={() =>
                            goTo("/admin/dashboard")
                          }
                        >
                          <FaUserShield className="me-2" />
                          Admin Dashboard
                        </Dropdown.Item>

                        <Dropdown.Item
                          onClick={() =>
                            goTo("/admin/products")
                          }
                        >
                          <FaBoxOpen className="me-2" />
                          Manage Products
                        </Dropdown.Item>

                        <Dropdown.Item
                          onClick={() =>
                            goTo("/admin/orders")
                          }
                        >
                          <FaClipboardList className="me-2" />
                          Manage Orders
                        </Dropdown.Item>

                        <Dropdown.Item
                          onClick={() =>
                            goTo("/admin/users")
                          }
                        >
                          <FaUsers className="me-2" />
                          Manage Users
                        </Dropdown.Item>

                        <Dropdown.Item
                          onClick={() =>
                            goTo("/admin/approvals")
                          }
                        >
                          <FaShieldAlt className="me-2" />
                          Seller Approvals
                        </Dropdown.Item>

                        <Dropdown.Item
                          onClick={() =>
                            goTo("/admin/low-stock")
                          }
                        >
                          <FaTags className="me-2" />
                          Low Stock
                        </Dropdown.Item>
                      </>
                    )}

                    {isSeller && (
                      <>
                        <Dropdown.Divider />

                        {!isApprovedSeller ? (
                          <Dropdown.Item
                            onClick={() =>
                              goTo("/seller/pending")
                            }
                          >
                            <FaClock className="me-2" />
                            Approval Pending
                          </Dropdown.Item>
                        ) : (
                          <>
                            <Dropdown.Item
                              onClick={() =>
                                goTo(
                                  "/seller/dashboard"
                                )
                              }
                            >
                              <FaStore className="me-2" />
                              Seller Dashboard
                            </Dropdown.Item>

                            <Dropdown.Item
                              onClick={() =>
                                goTo(
                                  "/seller/add-product"
                                )
                              }
                            >
                              <FaPlusCircle className="me-2" />
                              Add Product
                            </Dropdown.Item>

                            <Dropdown.Item
                              onClick={() =>
                                goTo(
                                  "/seller/analytics"
                                )
                              }
                            >
                              <FaChartLine className="me-2" />
                              Analytics
                            </Dropdown.Item>
                          </>
                        )}
                      </>
                    )}

                    <Dropdown.Divider />

                    <Dropdown.Item
                      className="text-danger"
                      onClick={logoutHandler}
                    >
                      <FaSignOutAlt className="me-2" />
                      Logout
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              ) : (
                <Dropdown align="end">
                  <Dropdown.Toggle className="elite-login-btn">
                    <FaUser />
                    <span>
                      <small>Hello, sign in</small>
                      <strong>Account</strong>
                    </span>
                  </Dropdown.Toggle>

                  <Dropdown.Menu className="elite-dropdown-menu elite-guest-menu">
                    <Dropdown.Item
                      onClick={() => goTo("/login")}
                    >
                      <FaSignInAlt className="me-2" />
                      Customer Login
                    </Dropdown.Item>

                    <Dropdown.Item
                      onClick={() =>
                        goTo("/register")
                      }
                    >
                      <FaUserPlus className="me-2" />
                      Customer Register
                    </Dropdown.Item>

                    <Dropdown.Divider />

                    <Dropdown.Item
                      onClick={() =>
                        goTo("/seller/login")
                      }
                    >
                      <FaStore className="me-2" />
                      Seller Login
                    </Dropdown.Item>

                    <Dropdown.Item
                      onClick={() =>
                        goTo("/seller/register")
                      }
                    >
                      <FaRocket className="me-2" />
                      Start Selling
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              )}

              <button
                type="button"
                className="elite-order-link d-none d-md-flex"
                onClick={() => goTo("/orders")}
              >
                <small>Returns</small>
                <strong>& Orders</strong>
              </button>

              <button
                type="button"
                className="elite-icon-link d-none d-md-flex"
                onClick={() => goTo("/wishlist")}
                aria-label="Wishlist"
              >
                <FaHeart />

                {wishlistCount > 0 && (
                  <Badge
                    pill
                    className="elite-mini-badge"
                  >
                    {wishlistCount}
                  </Badge>
                )}
              </button>

              <button
                type="button"
                className="elite-cart-btn"
                onClick={() => goTo("/cart")}
              >
                <FaShoppingCart />

                <span>Cart</span>

                {cartCount > 0 && (
                  <Badge
                    pill
                    className="elite-cart-badge"
                  >
                    {cartCount}
                  </Badge>
                )}
              </button>

              <button
                type="button"
                className="elite-mobile-menu-btn d-lg-none"
                onClick={() =>
                  setShowMobileMenu(true)
                }
                aria-label="Open menu"
              >
                <FaBars />
              </button>
            </div>
          </div>
        </Container>
      </header>

      <nav className="elite-category-navbar">
        <Container fluid="xl">
          <div className="elite-category-scroll">
            {categories.map((cat) => {
              const isAllActive =
                cat.name === "All" &&
                location.pathname === "/products" &&
                !currentCategory;

              const isCategoryActive =
                currentCategory === cat.name ||
                (cat.name === "Home & Kitchen" &&
                  currentCategory === "Home");

              return (
                <button
                  key={cat.name}
                  type="button"
                  className={
                    isAllActive || isCategoryActive
                      ? "elite-category-item active"
                      : "elite-category-item"
                  }
                  onClick={() => goTo(cat.path)}
                >
                  {cat.icon}
                  <span>{cat.name}</span>
                </button>
              );
            })}

            {!userInfo && (
              <button
                type="button"
                className="elite-role-pill seller guest"
                onClick={() =>
                  goTo("/seller/register")
                }
              >
                <FaRocket />
                Sell on EliteShop
              </button>
            )}

            {isAdmin && (
              <button
                type="button"
                className="elite-role-pill admin"
                onClick={() =>
                  goTo("/admin/dashboard")
                }
              >
                <FaUserShield />
                Admin Center
              </button>
            )}

            {isSeller && (
              <button
                type="button"
                className={
                  isApprovedSeller
                    ? "elite-role-pill seller"
                    : "elite-role-pill seller pending"
                }
                onClick={() =>
                  goTo(sellerPrimaryPath())
                }
              >
                {isApprovedSeller ? (
                  <FaStore />
                ) : (
                  <FaClock />
                )}
                {isApprovedSeller
                  ? "Seller Center"
                  : "Approval Pending"}
              </button>
            )}
          </div>
        </Container>
      </nav>

      <Offcanvas
        show={showMobileMenu}
        onHide={closeMobileMenu}
        placement="end"
        className="elite-mobile-offcanvas"
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>
            ELITE<span>SHOP</span>
          </Offcanvas.Title>
        </Offcanvas.Header>

        <Offcanvas.Body>
          <div className="elite-mobile-user-box">
            {userInfo ? (
              <>
                <div className="elite-avatar">
                  {(userInfo.name || "U")
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <div>
                  <strong>{userInfo.name}</strong>
                  <small>{userInfo.email}</small>

                  {isSeller &&
                    !isApprovedSeller && (
                      <Badge
                        bg="warning"
                        text="dark"
                        className="mt-1"
                      >
                        Seller Pending
                      </Badge>
                    )}
                </div>
              </>
            ) : (
              <div className="elite-mobile-auth-buttons">
                <Button
                  variant="dark"
                  className="rounded-pill"
                  onClick={() => goTo("/login")}
                >
                  Customer Login
                </Button>

                <Button
                  variant="warning"
                  className="rounded-pill"
                  onClick={() =>
                    goTo("/seller/login")
                  }
                >
                  Seller Login
                </Button>
              </div>
            )}
          </div>

          <div className="elite-mobile-links">
            <button onClick={() => goTo("/")}>
              <FaHome />
              Home
            </button>

            <button
              onClick={() => goTo("/products")}
            >
              <FaBoxOpen />
              All Products
            </button>

            {!isSeller && (
              <>
                <button
                  onClick={() => goTo("/orders")}
                >
                  <FaClipboardList />
                  My Orders
                </button>

                <button
                  onClick={() => goTo("/wishlist")}
                >
                  <FaHeart />
                  Wishlist
                </button>

                <button
                  onClick={() =>
                    goTo("/notifications")
                  }
                >
                  <FaBell />
                  Notifications
                </button>
              </>
            )}

            <button onClick={() => goTo("/cart")}>
              <FaShoppingCart />
              Cart
            </button>

            <button onClick={() => goTo("/support")}>
              <FaHeadset />
              Support
            </button>

            {!userInfo && (
              <>
                <hr />

                <button
                  onClick={() =>
                    goTo("/seller/register")
                  }
                >
                  <FaRocket />
                  Sell on EliteShop
                </button>

                <button
                  onClick={() =>
                    goTo("/seller/login")
                  }
                >
                  <FaStore />
                  Seller Login
                </button>
              </>
            )}

            {userInfo && !isSeller && !isAdmin && (
              <>
                <hr />

                <button
                  onClick={() =>
                    goTo("/seller/register")
                  }
                >
                  <FaRocket />
                  Become Seller
                </button>
              </>
            )}

            {isAdmin && (
              <>
                <hr />

                <button
                  onClick={() =>
                    goTo("/admin/dashboard")
                  }
                >
                  <FaUserShield />
                  Admin Dashboard
                </button>

                <button
                  onClick={() =>
                    goTo("/admin/products")
                  }
                >
                  <FaBoxOpen />
                  Manage Products
                </button>

                <button
                  onClick={() =>
                    goTo("/admin/orders")
                  }
                >
                  <FaClipboardList />
                  Manage Orders
                </button>

                <button
                  onClick={() =>
                    goTo("/admin/users")
                  }
                >
                  <FaUsers />
                  Manage Users
                </button>

                <button
                  onClick={() =>
                    goTo("/admin/approvals")
                  }
                >
                  <FaShieldAlt />
                  Seller Approvals
                </button>
              </>
            )}

            {isSeller && (
              <>
                <hr />

                {!isApprovedSeller ? (
                  <button
                    onClick={() =>
                      goTo("/seller/pending")
                    }
                  >
                    <FaClock />
                    Approval Pending
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() =>
                        goTo(
                          "/seller/dashboard"
                        )
                      }
                    >
                      <FaStore />
                      Seller Dashboard
                    </button>

                    <button
                      onClick={() =>
                        goTo(
                          "/seller/add-product"
                        )
                      }
                    >
                      <FaPlusCircle />
                      Add Product
                    </button>

                    <button
                      onClick={() =>
                        goTo(
                          "/seller/analytics"
                        )
                      }
                    >
                      <FaChartLine />
                      Analytics
                    </button>
                  </>
                )}
              </>
            )}

            <hr />

            {categories.map((cat) => (
              <button
                key={cat.name}
                onClick={() => goTo(cat.path)}
              >
                {cat.icon}
                {cat.name}
              </button>
            ))}

            {userInfo && (
              <>
                <hr />

                <Button
                  variant="danger"
                  className="rounded-pill"
                  onClick={logoutHandler}
                >
                  <FaSignOutAlt className="me-2" />
                  Logout
                </Button>
              </>
            )}
          </div>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
};

export default Navbar;