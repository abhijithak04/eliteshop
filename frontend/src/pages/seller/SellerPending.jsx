import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Badge,
  Button,
  Card,
  Col,
  ProgressBar,
  Row,
  Spinner,
  Alert,
} from "react-bootstrap";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import { motion } from "framer-motion";
import { toast } from "react-toastify";

import {
  FaBoxOpen,
  FaChartLine,
  FaCheckCircle,
  FaClock,
  FaEnvelope,
  FaHeadset,
  FaHome,
  FaRocket,
  FaShieldAlt,
  FaSignOutAlt,
  FaStore,
  FaSyncAlt,
  FaTruck,
  FaUserCheck,
  FaWallet,
  FaWarehouse,
  FaCrown,
  FaHourglassHalf,
  FaInfoCircle,
} from "react-icons/fa";

import { useAuth } from "../../context/AuthContext";

import "../../styles/SellerPending.css";

const SellerPendingPage = () => {
  const navigate = useNavigate();

  const {
    userInfo,
    sellerLogout,
    refreshProfile,
    sellerApproved,
    profileLoading,
  } = useAuth();

  const [checking, setChecking] = useState(false);
  const [nextCheck, setNextCheck] = useState(60);

  const shopName =
    userInfo?.sellerInfo?.shopName ||
    userInfo?.shopName ||
    "EliteShop Seller Store";

  const sellerEmail =
    userInfo?.email ||
    userInfo?.sellerInfo?.businessEmail ||
    "seller@example.com";

  const sellerCategory =
    userInfo?.sellerInfo?.shopCategory ||
    userInfo?.sellerInfo?.productCategory ||
    userInfo?.productCategory ||
    "Multiple Categories";

  const approved = useMemo(() => {
    return Boolean(
      sellerApproved ||
        userInfo?.sellerInfo?.isApproved ||
        userInfo?.isSellerApproved ||
        userInfo?.sellerApproved
    );
  }, [
    sellerApproved,
    userInfo,
  ]);

  useEffect(() => {
    if (approved) {
      toast.success("Seller approved! Redirecting to dashboard.");

      navigate("/seller/dashboard", {
        replace: true,
      });
    }
  }, [
    approved,
    navigate,
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setNextCheck((prev) => {
        if (prev <= 1) {
          return 60;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (nextCheck !== 60) return;

    const silentCheck = async () => {
      const result = await refreshProfile();

      const isApproved =
        result.success &&
        Boolean(
          result.data?.sellerInfo?.isApproved ||
            result.data?.isSellerApproved ||
            result.data?.sellerApproved
        );

      if (isApproved) {
        toast.success("Seller approved! Redirecting to dashboard.");

        navigate("/seller/dashboard", {
          replace: true,
        });
      }
    };

    silentCheck();
  }, [
    nextCheck,
    refreshProfile,
    navigate,
  ]);

  const refreshHandler = async () => {
    try {
      setChecking(true);

      const result = await refreshProfile();

      const isApproved =
        result.success &&
        Boolean(
          result.data?.sellerInfo?.isApproved ||
            result.data?.isSellerApproved ||
            result.data?.sellerApproved
        );

      if (isApproved) {
        toast.success("Seller approved! Redirecting to dashboard.");

        navigate("/seller/dashboard", {
          replace: true,
        });
      } else {
        toast.info("Your seller account is still under admin review.");
      }
    } catch (error) {
      toast.error("Unable to check approval status");
    } finally {
      setChecking(false);
      setNextCheck(60);
    }
  };

  const logoutHandler = async () => {
    await sellerLogout();
  };

  return (
    <motion.main
      className="elite-seller-pending-page"
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
      <Row className="elite-seller-pending-shell g-0">
        <Col lg={5} className="elite-seller-pending-visual-col">
          <motion.section
            className="elite-seller-pending-visual"
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
            <div className="elite-seller-pending-overlay">
              <Badge
                bg="warning"
                text="dark"
                className="elite-seller-pending-badge"
              >
                <FaCrown className="me-2" />
                EliteShop Seller Verification
              </Badge>

              <h1>Your seller account is almost ready.</h1>

              <p>
                Admin is reviewing your seller profile, business details, pickup
                address and store information. Once approved, you can access the
                seller dashboard and start managing products.
              </p>

              <div className="elite-seller-pending-feature-grid">
                <FeatureCard
                  icon={<FaStore />}
                  title="Store Review"
                  text="Shop details are verified"
                />

                <FeatureCard
                  icon={<FaWarehouse />}
                  title="Inventory Ready"
                  text="Dashboard unlocks after approval"
                />

                <FeatureCard
                  icon={<FaChartLine />}
                  title="Analytics"
                  text="Track growth after approval"
                />

                <FeatureCard
                  icon={<FaShieldAlt />}
                  title="Trusted Selling"
                  text="Admin approval improves trust"
                />
              </div>
            </div>

            <motion.div
              className="elite-seller-pending-floating-card"
              animate={{
                y: [0, -10, 0],
              }}
              transition={{
                duration: 3.5,
                repeat: Infinity,
              }}
            >
              <FaHourglassHalf />

              <div>
                <strong>Approval Pending</strong>
                <span>Next auto check in {nextCheck}s</span>
              </div>
            </motion.div>
          </motion.section>
        </Col>

        <Col lg={7} className="elite-seller-pending-content-col">
          <motion.div
            className="elite-seller-pending-content-wrap"
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
            <Card className="elite-seller-pending-card">
              <Card.Body>
                <div className="elite-seller-pending-top">
                  <div className="elite-pending-icon">
                    <FaClock />
                  </div>

                  <Badge
                    bg="warning"
                    text="dark"
                    className="elite-pending-status-badge"
                  >
                    Pending Admin Approval
                  </Badge>

                  <h1>Seller Account Under Review</h1>

                  <p>
                    Hello{" "}
                    <strong>{userInfo?.name || "Seller"}</strong>, your seller
                    request has been submitted successfully. You will get access
                    to the seller dashboard after admin approval.
                  </p>
                </div>

                <div className="elite-pending-progress-box">
                  <div>
                    <span>Approval Progress</span>
                    <strong>66%</strong>
                  </div>

                  <ProgressBar now={66} />
                </div>

                <Alert
                  variant="info"
                  className="elite-pending-info-alert"
                >
                  <FaInfoCircle className="me-2" />
                  You can keep checking this page. The system will also auto
                  refresh your approval status every 60 seconds.
                </Alert>

                <div className="elite-pending-shop-box">
                  <div className="elite-pending-shop-icon">
                    <FaStore />
                  </div>

                  <div>
                    <span>Shop Name</span>
                    <strong>{shopName}</strong>
                  </div>

                  <Badge bg="dark">
                    {sellerCategory}
                  </Badge>
                </div>

                <div className="elite-pending-details-grid">
                  <DetailBox
                    icon={<FaEnvelope />}
                    label="Seller Email"
                    value={sellerEmail}
                  />

                  <DetailBox
                    icon={<FaBoxOpen />}
                    label="Selling Category"
                    value={sellerCategory}
                  />

                  <DetailBox
                    icon={<FaTruck />}
                    label="Pickup Setup"
                    value="Waiting Approval"
                  />

                  <DetailBox
                    icon={<FaWallet />}
                    label="Revenue Access"
                    value="Locked Until Approval"
                  />
                </div>

                <div className="elite-pending-steps">
                  <div className="done">
                    <FaStore />
                    <strong>Registered</strong>
                    <span>Seller form submitted</span>
                  </div>

                  <div className="active">
                    <FaShieldAlt />
                    <strong>Admin Review</strong>
                    <span>Verification in progress</span>
                  </div>

                  <div>
                    <FaUserCheck />
                    <strong>Approved</strong>
                    <span>Dashboard will unlock</span>
                  </div>
                </div>

                <div className="elite-pending-actions">
                  <Button
                    onClick={refreshHandler}
                    className="elite-pending-primary-btn"
                    disabled={checking || profileLoading}
                  >
                    {checking || profileLoading ? (
                      <>
                        <Spinner
                          animation="border"
                          size="sm"
                          className="me-2"
                        />
                        Checking...
                      </>
                    ) : (
                      <>
                        <FaSyncAlt className="me-2" />
                        Check Approval Status
                      </>
                    )}
                  </Button>

                  <Button
                    as={Link}
                    to="/"
                    variant="outline-dark"
                    className="elite-pending-pill-btn"
                  >
                    <FaHome className="me-2" />
                    Go Home
                  </Button>

                  <Button
                    as={Link}
                    to="/support"
                    variant="outline-primary"
                    className="elite-pending-pill-btn"
                  >
                    <FaHeadset className="me-2" />
                    Support
                  </Button>

                  <Button
                    variant="outline-danger"
                    className="elite-pending-pill-btn"
                    onClick={logoutHandler}
                  >
                    <FaSignOutAlt className="me-2" />
                    Logout
                  </Button>
                </div>
              </Card.Body>
            </Card>

            <div className="elite-seller-pending-mini-strip">
              <span>
                <FaRocket />
                Dashboard unlocks after approval
              </span>

              <span>
                <FaShieldAlt />
                Seller verification active
              </span>

              <span>
                <FaCheckCircle />
                Registration completed
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
  <div className="elite-seller-pending-feature-card">
    {icon}

    <div>
      <strong>{title}</strong>
      <span>{text}</span>
    </div>
  </div>
);

const DetailBox = ({
  icon,
  label,
  value,
}) => (
  <div className="elite-pending-detail-box">
    {icon}

    <div>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  </div>
);

export default SellerPendingPage;