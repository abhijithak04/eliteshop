import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Form,
  ProgressBar,
  Row,
  Spinner,
} from "react-bootstrap";

import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { motion } from "framer-motion";
import { toast } from "react-toastify";

import {
  FaArrowRight,
  FaBoxOpen,
  FaChartLine,
  FaCheckCircle,
  FaEnvelope,
  FaEye,
  FaEyeSlash,
  FaLock,
  FaRocket,
  FaShieldAlt,
  FaStore,
  FaTruck,
  FaUserTie,
  FaWallet,
  FaWarehouse,
  FaBolt,
  FaCrown,
  FaHome,
  FaShoppingBag,
  FaExclamationTriangle,
} from "react-icons/fa";

import { useAuth } from "../../context/AuthContext";

import "../../styles/SellerLogin.css";

const SellerLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    userInfo,
    sellerLogin,
    loading,
    authLoading,
    error,
    clearError,
    sellerApproved,
  } = useAuth();

  const searchParams = new URLSearchParams(location.search);

  const redirect =
    searchParams.get("redirect") || "/seller/dashboard";

  const [email, setEmail] = useState(() => {
    return localStorage.getItem("rememberedSellerEmail") || "";
  });

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberSeller, setRememberSeller] = useState(
    Boolean(localStorage.getItem("rememberedSellerEmail"))
  );

  const [formError, setFormError] = useState("");

  const isSubmitting = loading || authLoading;

  const completionScore = useMemo(() => {
    let score = 0;

    if (email.trim()) score += 45;
    if (password.trim()) score += 45;
    if (rememberSeller) score += 10;

    return Math.min(score, 100);
  }, [
    email,
    password,
    rememberSeller,
  ]);

  useEffect(() => {
    if (clearError) {
      clearError();
    }
  }, [clearError]);

  useEffect(() => {
    if (userInfo?.role !== "seller") return;

    const approved =
      sellerApproved ||
      userInfo?.sellerInfo?.isApproved ||
      userInfo?.isSellerApproved ||
      userInfo?.sellerApproved;

    if (approved) {
      navigate(redirect, {
        replace: true,
      });
    } else {
      navigate("/seller/pending", {
        replace: true,
      });
    }
  }, [
    userInfo,
    sellerApproved,
    navigate,
    redirect,
  ]);

  const safeError =
    typeof error === "string"
      ? error
      : error?.message || "";

  const validateForm = () => {
    if (!email.trim()) {
      setFormError("Please enter seller email");
      return false;
    }

    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setFormError("Please enter a valid seller email");
      return false;
    }

    if (!password.trim()) {
      setFormError("Please enter password");
      return false;
    }

    if (password.length < 6) {
      setFormError("Password must be at least 6 characters");
      return false;
    }

    setFormError("");
    return true;
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix seller login details");
      return;
    }

    const sellerEmail = email.trim().toLowerCase();

    const result = await sellerLogin(
      sellerEmail,
      password
    );

    if (!result.success) {
      toast.error(result.message || "Seller login failed");
      return;
    }

    if (rememberSeller) {
      localStorage.setItem("rememberedSellerEmail", sellerEmail);
    } else {
      localStorage.removeItem("rememberedSellerEmail");
    }

    toast.success("Seller login successful");

    const approved =
      result.data?.sellerInfo?.isApproved ||
      result.data?.isSellerApproved ||
      result.data?.sellerApproved ||
      result.approvalStatus === "approved";

    if (approved) {
      navigate(redirect, {
        replace: true,
      });
    } else {
      navigate("/seller/pending", {
        replace: true,
      });
    }
  };

  return (
    <motion.main
      className="elite-seller-login-page"
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
      <Row className="elite-seller-login-shell g-0">
        <Col lg={6} className="elite-seller-login-visual-col">
          <motion.section
            className="elite-seller-login-visual"
            initial={{
              opacity: 0,
              x: -25,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            transition={{
              duration: 0.45,
            }}
          >
            <div className="elite-seller-login-overlay">
              <Badge
                bg="warning"
                text="dark"
                className="elite-seller-login-badge"
              >
                <FaCrown className="me-2" />
                EliteShop Seller Hub
              </Badge>

              <h1>
                Sell smarter with your professional dashboard.
              </h1>

              <p>
                Login to manage products, orders, stock, low inventory,
                revenue analytics and seller performance from one premium
                control center.
              </p>

              <div className="elite-seller-login-feature-grid">
                <FeatureCard
                  icon={<FaBoxOpen />}
                  title="Products"
                  text="Add, edit and manage products"
                />

                <FeatureCard
                  icon={<FaWarehouse />}
                  title="Inventory"
                  text="Monitor stock and low-stock alerts"
                />

                <FeatureCard
                  icon={<FaChartLine />}
                  title="Analytics"
                  text="Track sales and product performance"
                />

                <FeatureCard
                  icon={<FaShieldAlt />}
                  title="Approval"
                  text="Secure seller approval system"
                />
              </div>
            </div>

            <motion.div
              className="elite-seller-login-floating-card"
              animate={{
                y: [0, -10, 0],
              }}
              transition={{
                duration: 3.5,
                repeat: Infinity,
              }}
            >
              <FaStore />

              <div>
                <strong>Seller Control Center</strong>
                <span>Products • Orders • Revenue</span>
              </div>
            </motion.div>
          </motion.section>
        </Col>

        <Col lg={6} className="elite-seller-login-form-col">
          <motion.div
            className="elite-seller-login-form-wrap"
            initial={{
              opacity: 0,
              x: 25,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            transition={{
              duration: 0.45,
            }}
          >
            <Card className="elite-seller-login-card">
              <Card.Body>
                <div className="elite-seller-login-title">
                  <div className="elite-seller-login-icon">
                    <FaStore />
                  </div>

                  <Badge
                    bg="dark"
                    className="elite-seller-login-route"
                  >
                    Seller Secure Access
                  </Badge>

                  <h2>Seller Login</h2>

                  <p>
                    Use your registered seller email and password to access
                    your EliteShop seller dashboard.
                  </p>
                </div>

                <div className="elite-seller-login-progress-box">
                  <div>
                    <span>Login Readiness</span>
                    <strong>{completionScore}%</strong>
                  </div>

                  <ProgressBar now={completionScore} />
                </div>

                {(safeError || formError) && (
                  <Alert
                    variant="danger"
                    className="elite-seller-login-alert"
                  >
                    <FaExclamationTriangle className="me-2" />
                    {formError || safeError}
                  </Alert>
                )}

                <Form onSubmit={submitHandler}>
                  <Form.Group className="mb-3">
                    <Form.Label>Seller Email</Form.Label>

                    <div className="elite-seller-login-input">
                      <FaEnvelope />

                      <input
                        type="email"
                        placeholder="seller@example.com"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setFormError("");
                        }}
                        autoComplete="email"
                      />
                    </div>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Password</Form.Label>

                    <div className="elite-seller-login-input">
                      <FaLock />

                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter password"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          setFormError("");
                        }}
                        autoComplete="current-password"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowPassword((prev) => !prev)
                        }
                        aria-label="Toggle password visibility"
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </Form.Group>

                  <div className="elite-seller-login-options">
                    <Form.Check
                      type="checkbox"
                      id="rememberSeller"
                      label="Remember seller email"
                      checked={rememberSeller}
                      onChange={(e) =>
                        setRememberSeller(e.target.checked)
                      }
                    />

                    <Link to="/forgot-password">
                      Forgot password?
                    </Link>
                  </div>

                  <Button
                    type="submit"
                    className="elite-seller-login-submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Spinner
                          animation="border"
                          size="sm"
                          className="me-2"
                        />
                        Logging in...
                      </>
                    ) : (
                      <>
                        <FaRocket className="me-2" />
                        Login As Seller
                        <FaArrowRight className="ms-2" />
                      </>
                    )}
                  </Button>
                </Form>

                <div className="elite-seller-login-divider">
                  <span>seller account actions</span>
                </div>

                <div className="elite-seller-login-links">
                  <Link to="/seller/register">
                    <FaUserTie className="me-2" />
                    Create Seller Account
                  </Link>

                  <Link to="/login">
                    <FaShoppingBag className="me-2" />
                    Customer Login
                  </Link>
                </div>

                <div className="elite-seller-login-switch">
                  <Link to="/">
                    <FaHome className="me-2" />
                    Back Home
                  </Link>

                  <Link to="/support">
                    <FaShieldAlt className="me-2" />
                    Need Help?
                  </Link>
                </div>

                <div className="elite-seller-login-secure-note">
                  <FaCheckCircle />
                  Seller access is protected with role-based authentication
                  and admin approval.
                </div>
              </Card.Body>
            </Card>

            <div className="elite-seller-login-mini-strip">
              <span>
                <FaBolt />
                Fast Product Control
              </span>

              <span>
                <FaWallet />
                Revenue Tracking
              </span>

              <span>
                <FaTruck />
                Order Management
              </span>
            </div>
          </motion.div>
        </Col>
      </Row>
    </motion.main>
  );
};

const FeatureCard = ({
  icon,
  title,
  text,
}) => (
  <div className="elite-seller-login-feature-card">
    {icon}

    <div>
      <strong>{title}</strong>
      <span>{text}</span>
    </div>
  </div>
);

export default SellerLogin;