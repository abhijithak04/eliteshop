import {
  Navigate,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  Alert,
  Badge,
  Button,
  Card,
  Spinner,
} from "react-bootstrap";

import { motion } from "framer-motion";

import {
  FaLock,
  FaShieldAlt,
  FaUserShield,
  FaStore,
  FaHome,
  FaSignInAlt,
  FaExclamationTriangle,
  FaClock,
  FaArrowLeft,
  FaRocket,
} from "react-icons/fa";

import { useAuth } from "../context/AuthContext";

import "../styles/ProtectedRoute.css";

const roleDashboardMap = {
  admin: "/admin/dashboard",
  seller: "/seller/dashboard",
  user: "/",
  customer: "/",
};

const normalizeRole = (role) => {
  return role?.toLowerCase?.() || "user";
};

const ProtectedRoute = ({
  allowedRoles = [],
  requireSellerApproval = false,
}) => {
  const {
    userInfo,
    loading,
  } = useAuth();

  const location = useLocation();
  const navigate = useNavigate();

  const fullRedirectPath = `${location.pathname}${location.search || ""}`;

  const isSellerRoute = location.pathname.startsWith("/seller");

  const loginPath = isSellerRoute
    ? `/seller/login?redirect=${encodeURIComponent(fullRedirectPath)}`
    : `/login?redirect=${encodeURIComponent(fullRedirectPath)}`;

  if (loading) {
    return (
      <RouteStatusScreen
        type="loading"
        title="Checking secure access"
        message="Please wait while EliteShop verifies your session and role permissions."
      />
    );
  }

  if (!userInfo) {
    return (
      <Navigate
        to={loginPath}
        replace
      />
    );
  }

  const userRole = normalizeRole(userInfo.role);

  const normalizedRoles = allowedRoles.map((role) =>
    role.toLowerCase()
  );

  const hasRoleAccess =
    normalizedRoles.length === 0 ||
    normalizedRoles.includes(userRole);

  if (!hasRoleAccess) {
    return (
      <RouteStatusScreen
        type="denied"
        title="Access denied"
        message={`Your current role is "${userRole}". This page requires ${
          normalizedRoles.length > 0
            ? normalizedRoles.join(" or ")
            : "authenticated"
        } access.`}
        userRole={userRole}
        onPrimary={() =>
          navigate(roleDashboardMap[userRole] || "/", {
            replace: true,
          })
        }
        onSecondary={() => navigate(-1)}
      />
    );
  }

  const sellerApproved =
    userInfo.sellerInfo?.isApproved ||
    userInfo.isSellerApproved ||
    userInfo.sellerApproved ||
    false;

  if (
    requireSellerApproval &&
    userRole === "seller" &&
    !sellerApproved
  ) {
    if (location.pathname !== "/seller/pending") {
      return (
        <Navigate
          to="/seller/pending"
          replace
        />
      );
    }

    return (
      <RouteStatusScreen
        type="pending"
        title="Seller approval pending"
        message="Your seller account is created, but admin approval is still pending. You can access the seller dashboard after approval."
        userRole={userRole}
        onPrimary={() => navigate("/seller/pending")}
        onSecondary={() => navigate("/")}
      />
    );
  }

  return <Outlet />;
};

const RouteStatusScreen = ({
  type,
  title,
  message,
  userRole,
  onPrimary,
  onSecondary,
}) => {
  const isLoading = type === "loading";
  const isDenied = type === "denied";
  const isPending = type === "pending";

  const icon = isLoading ? (
    <Spinner animation="border" />
  ) : isPending ? (
    <FaClock />
  ) : isDenied ? (
    <FaExclamationTriangle />
  ) : (
    <FaShieldAlt />
  );

  return (
    <main className="elite-protected-page">
      <motion.div
        initial={{
          opacity: 0,
          y: 18,
          scale: 0.98,
        }}
        animate={{
          opacity: 1,
          y: 0,
          scale: 1,
        }}
        transition={{
          duration: 0.28,
        }}
        className="elite-protected-wrapper"
      >
        <Card className={`elite-protected-card ${type}`}>
          <Card.Body>
            <div className="elite-protected-icon">
              {icon}
            </div>

            <Badge
              bg={
                isLoading
                  ? "primary"
                  : isPending
                  ? "warning"
                  : "danger"
              }
              text={isPending ? "dark" : undefined}
              className="elite-protected-badge"
            >
              {isLoading
                ? "Verifying Access"
                : isPending
                ? "Approval Required"
                : "Restricted Area"}
            </Badge>

            <h1>{title}</h1>

            <p>{message}</p>

            {userRole && (
              <Alert
                variant={isDenied ? "danger" : "warning"}
                className="elite-protected-alert"
              >
                <FaUserShield className="me-2" />
                Current role: <strong>{userRole}</strong>
              </Alert>
            )}

            {!isLoading && (
              <div className="elite-protected-actions">
                <Button
                  variant="dark"
                  onClick={onPrimary}
                >
                  {isPending ? (
                    <>
                      <FaStore className="me-2" />
                      Seller Status
                    </>
                  ) : (
                    <>
                      <FaRocket className="me-2" />
                      Go to Dashboard
                    </>
                  )}
                </Button>

                <Button
                  variant="outline-secondary"
                  onClick={onSecondary}
                >
                  <FaArrowLeft className="me-2" />
                  Go Back
                </Button>

                <Button
                  variant="outline-primary"
                  onClick={() => {
                    window.location.href = "/";
                  }}
                >
                  <FaHome className="me-2" />
                  Home
                </Button>
              </div>
            )}

            {isLoading && (
              <div className="elite-protected-loading-line">
                <span></span>
              </div>
            )}
          </Card.Body>
        </Card>

        <div className="elite-protected-note">
          <FaLock />
          EliteShop protects private account, admin, seller and checkout pages
          using role-based access control.
        </div>
      </motion.div>
    </main>
  );
};

export default ProtectedRoute;