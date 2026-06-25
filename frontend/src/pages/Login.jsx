"use client";

import { useState, useEffect } from "react";
import {
  Form,
  Button,
  Card,
  Container,
  Row,
  Col,
  InputGroup,
} from "react-bootstrap";

import {
  Link,
  useNavigate,
  useLocation,
} from "react-router-dom";

import { motion } from "framer-motion";

import {
  FaEye,
  FaEyeSlash,
  FaEnvelope,
  FaLock,
  FaUserCircle,
} from "react-icons/fa";

import { toast } from "react-toastify";

import Loader from "../components/Loader";

import { useAuth } from "../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    login,
    userInfo,
    loading,
    error,
    clearError,
  } = useAuth();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const redirect =
    new URLSearchParams(
      location.search
    ).get("redirect") || "/";

  // ===================================
  // REDIRECT AFTER LOGIN
  // ===================================

  useEffect(() => {
    if (!userInfo) return;

    if (userInfo.role === "admin") {
      navigate("/admin/dashboard");
      return;
    }

    if (userInfo.role === "seller") {
      navigate("/seller/dashboard");
      return;
    }

    navigate(redirect);
  }, [
    userInfo,
    navigate,
    redirect,
  ]);

  // ===================================
  // ERROR HANDLING
  // ===================================

  useEffect(() => {
    if (!error) return;

    toast.error(error);

    const timer = setTimeout(() => {
      clearError();
    }, 3000);

    return () =>
      clearTimeout(timer);
  }, [error, clearError]);

  // ===================================
  // SUBMIT
  // ===================================

  const submitHandler = async (
    e
  ) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error(
        "Please enter email"
      );
      return;
    }

    if (!password.trim()) {
      toast.error(
        "Please enter password"
      );
      return;
    }

    const result =
      await login(
        email.trim().toLowerCase(),
        password
      );

    if (result.success) {
      toast.success(
        "Login Successful"
      );
    }
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center align-items-center">
        <Col
          lg={5}
          md={7}
        >
          <motion.div
            initial={{
              opacity: 0,
              y: 40,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.5,
            }}
          >
            <Card className="border-0 shadow-lg rounded-4 overflow-hidden">

              <Card.Body className="p-4 p-md-5">

                <div className="text-center mb-4">

                  <FaUserCircle
                    size={60}
                    className="text-primary mb-3"
                  />

                  <h2 className="fw-bold">
                    Welcome Back
                  </h2>

                  <p className="text-muted">
                    Sign in to continue shopping
                  </p>

                </div>

                <Form
                  onSubmit={
                    submitHandler
                  }
                >

                  {/* EMAIL */}

                  <Form.Group className="mb-3">

                    <Form.Label>
                      Email Address
                    </Form.Label>

                    <InputGroup>

                      <InputGroup.Text>
                        <FaEnvelope />
                      </InputGroup.Text>

                      <Form.Control
                        type="email"
                        placeholder="Enter email"
                        value={email}
                        onChange={(e) =>
                          setEmail(
                            e.target.value
                          )
                        }
                        autoComplete="email"
                        required
                      />

                    </InputGroup>

                  </Form.Group>

                  {/* PASSWORD */}

                  <Form.Group className="mb-4">

                    <Form.Label>
                      Password
                    </Form.Label>

                    <InputGroup>

                      <InputGroup.Text>
                        <FaLock />
                      </InputGroup.Text>

                      <Form.Control
                        type={
                          showPassword
                            ? "text"
                            : "password"
                        }
                        placeholder="Enter password"
                        value={password}
                        onChange={(e) =>
                          setPassword(
                            e.target.value
                          )
                        }
                        autoComplete="current-password"
                        required
                      />

                      <Button
                        variant="outline-secondary"
                        type="button"
                        onClick={() =>
                          setShowPassword(
                            !showPassword
                          )
                        }
                      >
                        {showPassword ? (
                          <FaEyeSlash />
                        ) : (
                          <FaEye />
                        )}
                      </Button>

                    </InputGroup>

                  </Form.Group>

                  <Button
                    type="submit"
                    className="w-100 rounded-3"
                    size="lg"
                    disabled={loading}
                  >
                    {loading
                      ? "Signing In..."
                      : "Login"}
                  </Button>

                </Form>

                {loading && (
                  <div className="text-center mt-3">
                    <Loader />
                  </div>
                )}

                <div className="text-center mt-4">

                  <small className="text-muted">

                    New Customer?{" "}

                    <Link
                      to={`/register?redirect=${redirect}`}
                      className="fw-semibold text-decoration-none"
                    >
                      Create Account
                    </Link>

                  </small>

                </div>

              </Card.Body>

            </Card>
          </motion.div>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;