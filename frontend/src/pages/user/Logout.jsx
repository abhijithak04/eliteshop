"use client";

import { useEffect } from "react";
import { Card, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-toastify";

import { useAuth } from "../../context/AuthContext";

const LogoutPage = () => {
  const navigate = useNavigate();

  const { logout } = useAuth();

  useEffect(() => {
    const handleLogout = async () => {
      try {
        await logout();

        toast.success("Logged out successfully");

        navigate("/login", {
          replace: true,
        });
      } catch (error) {
        toast.error(
          error?.response?.data?.message ||
            error.message ||
            "Logout failed"
        );

        navigate("/login", {
          replace: true,
        });
      }
    };

    handleLogout();
  }, [logout, navigate]);

  return (
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
        duration: 0.4,
      }}
      className="d-flex justify-content-center align-items-center py-5"
    >
      <Card
        className="border-0 shadow-lg rounded-4 text-center p-5"
        style={{
          maxWidth: "420px",
          width: "100%",
        }}
      >
        <Spinner
          animation="border"
          className="mx-auto mb-4"
        />

        <h3 className="fw-bold">
          Logging you out...
        </h3>

        <p className="text-muted mb-0">
          Please wait while we securely end your session.
        </p>
      </Card>
    </motion.div>
  );
};

export default LogoutPage;