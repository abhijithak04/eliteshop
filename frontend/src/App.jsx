import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Outlet,
  useLocation,
} from "react-router-dom";

import {
  Container,
  Alert,
} from "react-bootstrap";

import { ToastContainer } from "react-toastify";
import { AnimatePresence, motion } from "framer-motion";

import "react-toastify/dist/ReactToastify.css";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import "./styles/AppLayout.css";

const authPaths = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
];

const dashboardPaths = [
  "/admin",
  "/seller",
];

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [pathname]);

  return null;
}

function App() {
  const location = useLocation();

  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pageReady, setPageReady] = useState(false);

  const pathname = location.pathname;

  const isAuthPage = useMemo(() => {
    return authPaths.some((path) => pathname.startsWith(path));
  }, [pathname]);

  const isDashboardPage = useMemo(() => {
    return dashboardPaths.some((path) => pathname.startsWith(path));
  }, [pathname]);

  const shouldShowFooter = useMemo(() => {
    return !isAuthPage && !isDashboardPage;
  }, [isAuthPage, isDashboardPage]);

  const containerSize = useMemo(() => {
    if (isAuthPage) return false;
    if (isDashboardPage) return "fluid";
    return "xxl";
  }, [isAuthPage, isDashboardPage]);

  const mainClassName = useMemo(() => {
    return [
      "flex-grow-1",
      "main-content",
      "position-relative",
      isAuthPage ? "auth-main-content" : "",
      isDashboardPage ? "dashboard-main-content" : "",
    ]
      .filter(Boolean)
      .join(" ");
  }, [isAuthPage, isDashboardPage]);

  useEffect(() => {
    const onlineHandler = () => setIsOnline(true);
    const offlineHandler = () => setIsOnline(false);

    window.addEventListener("online", onlineHandler);
    window.addEventListener("offline", offlineHandler);

    return () => {
      window.removeEventListener("online", onlineHandler);
      window.removeEventListener("offline", offlineHandler);
    };
  }, []);

  useEffect(() => {
    setPageReady(false);

    const timer = setTimeout(() => {
      setPageReady(true);
    }, 120);

    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <div className="app-wrapper d-flex flex-column min-vh-100 position-relative overflow-hidden">
      <ScrollToTop />

      <div className="elite-app-bg">
        <div className="bg-orb orb-1"></div>
        <div className="bg-orb orb-2"></div>
        <div className="bg-orb orb-3"></div>
        <div className="bg-grid"></div>
        <div className="bg-glow-line"></div>
      </div>

      <Navbar />

      {!isOnline && (
        <motion.div
          className="elite-offline-banner"
          initial={{
            y: -80,
            opacity: 0,
          }}
          animate={{
            y: 0,
            opacity: 1,
          }}
        >
          <Alert
            variant="danger"
            className="m-0 rounded-0 border-0 text-center fw-bold"
          >
            You are offline. Some EliteShop features may not work until your
            internet connection is restored.
          </Alert>
        </motion.div>
      )}

      <main className={mainClassName}>
        <Container
          fluid={containerSize}
          className={
            isAuthPage
              ? "app-container auth-container"
              : isDashboardPage
              ? "app-container dashboard-container"
              : "app-container py-4 px-lg-4 px-3"
          }
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{
                opacity: 0,
                y: 18,
                filter: "blur(6px)",
              }}
              animate={{
                opacity: 1,
                y: 0,
                filter: "blur(0px)",
              }}
              exit={{
                opacity: 0,
                y: -10,
                filter: "blur(4px)",
              }}
              transition={{
                duration: 0.28,
                ease: "easeOut",
              }}
              className="page-transition"
            >
              {!pageReady && (
                <div className="elite-route-loader">
                  <span></span>
                </div>
              )}

              <Outlet />
            </motion.div>
          </AnimatePresence>
        </Container>
      </main>

      {shouldShowFooter && <Footer />}

      <ToastContainer
        position="top-right"
        autoClose={2500}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        toastClassName="premium-toast"
        bodyClassName="premium-toast-body"
        progressClassName="premium-toast-progress"
        limit={4}
      />
    </div>
  );
}

export default App;