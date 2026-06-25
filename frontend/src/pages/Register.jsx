"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  Form,
  Button,
  Row,
  Col,
  Card,
  InputGroup,
  ProgressBar,
  Badge,
  Alert,
} from "react-bootstrap";

import { motion } from "framer-motion";
import { toast } from "react-toastify";

import {
  FaUser,
  FaEnvelope,
  FaPhoneAlt,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaCheckCircle,
  FaTimesCircle,
  FaShoppingCart,
  FaTruck,
  FaHeart,
  FaBell,
  FaMapMarkerAlt,
  FaGift,
  FaShieldAlt,
  FaUndo,
} from "react-icons/fa";

import { useAuth } from "../context/AuthContext";
import api from "../utils/axios";

import "./Register.css";

const Register = () => {
  const navigate = useNavigate();
  const { search } = useLocation();

  const { userInfo } = useAuth();

  const sp = new URLSearchParams(search);

  const redirect = sp.get("redirect") || "/";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [gender, setGender] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");

  const [profilePreview, setProfilePreview] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [acceptTerms, setAcceptTerms] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // ======================================
  // ALREADY LOGGED IN
  // ======================================

  useEffect(() => {
    if (userInfo) {
      navigate(redirect, {
        replace: true,
      });
    }
  }, [userInfo, navigate, redirect]);

  // ======================================
  // PASSWORD CHECKS
  // ======================================

  const passwordChecks = useMemo(() => {
    return {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[^A-Za-z0-9]/.test(password),
    };
  }, [password]);

  const passwordScore = useMemo(() => {
    return Object.values(passwordChecks).filter(Boolean).length;
  }, [passwordChecks]);

  const passwordStrength = useMemo(() => {
    if (passwordScore <= 1) {
      return {
        label: "Weak",
        variant: "danger",
        value: 25,
      };
    }

    if (passwordScore <= 3) {
      return {
        label: "Medium",
        variant: "warning",
        value: 60,
      };
    }

    if (passwordScore === 4) {
      return {
        label: "Good",
        variant: "info",
        value: 80,
      };
    }

    return {
      label: "Strong",
      variant: "success",
      value: 100,
    };
  }, [passwordScore]);

  // ======================================
  // VALIDATION
  // ======================================

  const validateForm = () => {
    const newErrors = {};

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedPhone = phone.trim();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const indianPhoneRegex = /^[6-9]\d{9}$/;

    if (!trimmedName) {
      newErrors.name = "Full name is required";
    } else if (trimmedName.length < 3) {
      newErrors.name = "Name must be at least 3 characters";
    }

    if (!trimmedEmail) {
      newErrors.email = "Email address is required";
    } else if (!emailRegex.test(trimmedEmail)) {
      newErrors.email = "Enter a valid email address";
    }

    if (!trimmedPhone) {
      newErrors.phone = "Phone number is required";
    } else if (!indianPhoneRegex.test(trimmedPhone)) {
      newErrors.phone =
        "Enter a valid 10-digit Indian mobile number";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (passwordScore < 5) {
      newErrors.password =
        "Password must meet all security requirements";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Confirm password is required";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!acceptTerms) {
      newErrors.acceptTerms =
        "You must accept the terms and conditions";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // ======================================
  // PROFILE IMAGE PREVIEW ONLY
  // Backend profile image upload can be added later
  // ======================================

  const profileImageHandler = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }

    const previewUrl = URL.createObjectURL(file);

    setProfilePreview(previewUrl);

    toast.info(
      "Profile image preview added. Backend profile image saving can be connected later."
    );
  };

  // ======================================
  // SUBMIT
  // ======================================

  const submitHandler = async (e) => {
    e.preventDefault();

    if (loading) return;

    if (!validateForm()) {
      toast.error("Please fix the highlighted fields");
      return;
    }

    try {
      setLoading(true);

      const { data } = await api.post("/users", {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        password,
        gender,
        dateOfBirth,
      });

      toast.success(
        data?.message || "Account created successfully"
      );

      setPassword("");
      setConfirmPassword("");

      if (data?.token || data?._id) {
        const userInfo = {
          _id: data._id,
          name: data.name,
          email: data.email,
          phone: data.phone,
          role: data.role || "user",
          token: data.token,
        };

        localStorage.setItem(
          "userInfo",
          JSON.stringify(userInfo)
        );

        window.location.href = redirect || "/";
        return;
      }

      navigate(`/login?redirect=${encodeURIComponent(redirect)}`);
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Registration failed";

      if (
        message.toLowerCase().includes("already") ||
        message.toLowerCase().includes("exists")
      ) {
        setErrors((prev) => ({
          ...prev,
          email: "This email is already registered",
        }));
      }

      toast.error(message);

      setPassword("");
      setConfirmPassword("");
    } finally {
      setLoading(false);
    }
  };

  const RequirementItem = ({ valid, text }) => {
    return (
      <li
        className={
          valid
            ? "register-requirement valid"
            : "register-requirement"
        }
      >
        {valid ? <FaCheckCircle /> : <FaTimesCircle />}
        <span>{text}</span>
      </li>
    );
  };

  const benefits = [
    {
      icon: <FaShoppingCart />,
      title: "Faster checkout",
      text: "Save your details and checkout quickly.",
    },
    {
      icon: <FaTruck />,
      title: "Track orders easily",
      text: "Get live updates on your orders.",
    },
    {
      icon: <FaHeart />,
      title: "Save wishlist items",
      text: "Keep products you love for later.",
    },
    {
      icon: <FaBell />,
      title: "Price drop alerts",
      text: "Get notified when prices go down.",
    },
    {
      icon: <FaMapMarkerAlt />,
      title: "Manage addresses",
      text: "Save home, work and delivery addresses.",
    },
    {
      icon: <FaGift />,
      title: "Exclusive offers",
      text: "Access coupons and member-only deals.",
    },
    {
      icon: <FaUndo />,
      title: "Easy returns",
      text: "Manage returns and refunds smoothly.",
    },
    {
      icon: <FaShieldAlt />,
      title: "Secure account",
      text: "Your account stays protected.",
    },
  ];

  return (
    <motion.div
      className="register-page"
      initial={{
        opacity: 0,
        y: 20,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.45,
      }}
    >
      <Row className="g-4 align-items-stretch">
        {/* LEFT BENEFITS */}

        <Col lg={5}>
          <motion.div
            className="register-benefits-panel"
            initial={{
              opacity: 0,
              x: -25,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            transition={{
              duration: 0.5,
            }}
          >
            <Badge bg="light" text="dark" className="mb-3 px-3 py-2">
              Join EliteShop
            </Badge>

            <h1 className="register-benefits-title">
              Create your shopping account
            </h1>

            <p className="register-benefits-subtitle">
              Sign up once and enjoy faster checkout, order tracking,
              wishlist alerts, exclusive offers and easy returns.
            </p>

            <div className="register-benefits-grid">
              {benefits.map((item, index) => (
                <motion.div
                  key={item.title}
                  className="register-benefit-card"
                  whileHover={{
                    y: -5,
                  }}
                  transition={{
                    duration: 0.25,
                    delay: index * 0.02,
                  }}
                >
                  <div className="register-benefit-icon">
                    {item.icon}
                  </div>

                  <div>
                    <h6>{item.title}</h6>
                    <p>{item.text}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </Col>

        {/* RIGHT FORM */}

        <Col lg={7}>
          <Card className="register-card">
            <Card.Body className="p-4 p-md-5">
              <div className="text-center mb-4">
                <h2 className="fw-bold mb-2">Register</h2>

                <p className="text-muted mb-0">
                  Create your EliteShop account in less than a minute.
                </p>
              </div>

              <Form onSubmit={submitHandler} noValidate>
                <Row>
                  {/* PROFILE IMAGE */}

                  <Col xs={12}>
                    <div className="register-avatar-box mb-4">
                      <div className="register-avatar-preview">
                        {profilePreview ? (
                          <img
                            src={profilePreview}
                            alt="Profile preview"
                          />
                        ) : (
                          <FaUser />
                        )}
                      </div>

                      <div>
                        <Form.Label className="fw-semibold mb-1">
                          Profile Image{" "}
                          <span className="text-muted">(Optional)</span>
                        </Form.Label>

                        <Form.Control
                          type="file"
                          accept="image/*"
                          onChange={profileImageHandler}
                        />

                        <small className="text-muted">
                          JPG, PNG or WEBP recommended.
                        </small>
                      </div>
                    </div>
                  </Col>

                  {/* NAME */}

                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="name">
                      <Form.Label>
                        Full Name <span className="text-danger">*</span>
                      </Form.Label>

                      <InputGroup>
                        <InputGroup.Text>
                          <FaUser />
                        </InputGroup.Text>

                        <Form.Control
                          type="text"
                          placeholder="Enter full name"
                          value={name}
                          autoComplete="name"
                          aria-invalid={!!errors.name}
                          isInvalid={!!errors.name}
                          onChange={(e) => {
                            setName(e.target.value);
                            setErrors((prev) => ({
                              ...prev,
                              name: "",
                            }));
                          }}
                        />

                        <Form.Control.Feedback type="invalid">
                          {errors.name}
                        </Form.Control.Feedback>
                      </InputGroup>
                    </Form.Group>
                  </Col>

                  {/* EMAIL */}

                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="email">
                      <Form.Label>
                        Email Address{" "}
                        <span className="text-danger">*</span>
                      </Form.Label>

                      <InputGroup>
                        <InputGroup.Text>
                          <FaEnvelope />
                        </InputGroup.Text>

                        <Form.Control
                          type="email"
                          placeholder="Enter email"
                          value={email}
                          autoComplete="email"
                          aria-invalid={!!errors.email}
                          isInvalid={!!errors.email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            setErrors((prev) => ({
                              ...prev,
                              email: "",
                            }));
                          }}
                        />

                        <Form.Control.Feedback type="invalid">
                          {errors.email}
                        </Form.Control.Feedback>
                      </InputGroup>
                    </Form.Group>
                  </Col>

                  {/* PHONE */}

                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="phone">
                      <Form.Label>
                        Phone Number{" "}
                        <span className="text-danger">*</span>
                      </Form.Label>

                      <InputGroup>
                        <InputGroup.Text>
                          <FaPhoneAlt />
                        </InputGroup.Text>

                        <Form.Control
                          type="tel"
                          placeholder="10-digit mobile number"
                          value={phone}
                          maxLength={10}
                          autoComplete="tel"
                          aria-invalid={!!errors.phone}
                          isInvalid={!!errors.phone}
                          onChange={(e) => {
                            const onlyNumbers =
                              e.target.value.replace(/\D/g, "");
                            setPhone(onlyNumbers);
                            setErrors((prev) => ({
                              ...prev,
                              phone: "",
                            }));
                          }}
                        />

                        <Form.Control.Feedback type="invalid">
                          {errors.phone}
                        </Form.Control.Feedback>
                      </InputGroup>
                    </Form.Group>
                  </Col>

                  {/* GENDER */}

                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="gender">
                      <Form.Label>
                        Gender{" "}
                        <span className="text-muted">(Optional)</span>
                      </Form.Label>

                      <Form.Select
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                      >
                        <option value="">Select gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                        <option value="prefer-not-to-say">
                          Prefer not to say
                        </option>
                      </Form.Select>
                    </Form.Group>
                  </Col>

                  {/* DOB */}

                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="dateOfBirth">
                      <Form.Label>
                        Date of Birth{" "}
                        <span className="text-muted">(Optional)</span>
                      </Form.Label>

                      <Form.Control
                        type="date"
                        value={dateOfBirth}
                        onChange={(e) => setDateOfBirth(e.target.value)}
                      />
                    </Form.Group>
                  </Col>

                  {/* PASSWORD */}

                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="password">
                      <Form.Label>
                        Password <span className="text-danger">*</span>
                      </Form.Label>

                      <InputGroup>
                        <InputGroup.Text>
                          <FaLock />
                        </InputGroup.Text>

                        <Form.Control
                          type={showPassword ? "text" : "password"}
                          placeholder="Create password"
                          value={password}
                          autoComplete="new-password"
                          aria-invalid={!!errors.password}
                          isInvalid={!!errors.password}
                          onKeyUp={(e) =>
                            setCapsLockOn(
                              e.getModifierState &&
                                e.getModifierState("CapsLock")
                            )
                          }
                          onChange={(e) => {
                            setPassword(e.target.value);
                            setErrors((prev) => ({
                              ...prev,
                              password: "",
                            }));
                          }}
                        />

                        <Button
                          type="button"
                          variant="outline-secondary"
                          onClick={() =>
                            setShowPassword((prev) => !prev)
                          }
                        >
                          {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </Button>

                        <Form.Control.Feedback type="invalid">
                          {errors.password}
                        </Form.Control.Feedback>
                      </InputGroup>
                    </Form.Group>
                  </Col>

                  {/* CONFIRM PASSWORD */}

                  <Col md={6}>
                    <Form.Group
                      className="mb-3"
                      controlId="confirmPassword"
                    >
                      <Form.Label>
                        Confirm Password{" "}
                        <span className="text-danger">*</span>
                      </Form.Label>

                      <InputGroup>
                        <InputGroup.Text>
                          <FaLock />
                        </InputGroup.Text>

                        <Form.Control
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm password"
                          value={confirmPassword}
                          autoComplete="new-password"
                          aria-invalid={!!errors.confirmPassword}
                          isInvalid={!!errors.confirmPassword}
                          onPaste={(e) => e.preventDefault()}
                          onChange={(e) => {
                            setConfirmPassword(e.target.value);
                            setErrors((prev) => ({
                              ...prev,
                              confirmPassword: "",
                            }));
                          }}
                        />

                        <Button
                          type="button"
                          variant="outline-secondary"
                          onClick={() =>
                            setShowConfirmPassword((prev) => !prev)
                          }
                        >
                          {showConfirmPassword ? (
                            <FaEyeSlash />
                          ) : (
                            <FaEye />
                          )}
                        </Button>

                        <Form.Control.Feedback type="invalid">
                          {errors.confirmPassword}
                        </Form.Control.Feedback>
                      </InputGroup>
                    </Form.Group>
                  </Col>
                </Row>

                {capsLockOn && (
                  <Alert variant="warning" className="py-2">
                    Caps Lock is on.
                  </Alert>
                )}

                {/* PASSWORD STRENGTH */}

                {password && (
                  <div className="register-password-box mb-3">
                    <div className="d-flex justify-content-between mb-2">
                      <small className="fw-semibold">
                        Password strength
                      </small>

                      <Badge bg={passwordStrength.variant}>
                        {passwordStrength.label}
                      </Badge>
                    </div>

                    <ProgressBar
                      now={passwordStrength.value}
                      variant={passwordStrength.variant}
                      className="register-strength-bar"
                    />

                    <ul className="register-requirements-list mt-3">
                      <RequirementItem
                        valid={passwordChecks.length}
                        text="At least 8 characters"
                      />

                      <RequirementItem
                        valid={passwordChecks.uppercase}
                        text="One uppercase letter"
                      />

                      <RequirementItem
                        valid={passwordChecks.lowercase}
                        text="One lowercase letter"
                      />

                      <RequirementItem
                        valid={passwordChecks.number}
                        text="One number"
                      />

                      <RequirementItem
                        valid={passwordChecks.special}
                        text="One special character"
                      />
                    </ul>
                  </div>
                )}

                {/* TERMS */}

                <Form.Group className="mb-4" controlId="acceptTerms">
                  <Form.Check
                    type="checkbox"
                    checked={acceptTerms}
                    isInvalid={!!errors.acceptTerms}
                    onChange={(e) => {
                      setAcceptTerms(e.target.checked);
                      setErrors((prev) => ({
                        ...prev,
                        acceptTerms: "",
                      }));
                    }}
                    label={
                      <span>
                        I agree to the{" "}
                        <Link to="/terms" className="text-decoration-none">
                          Terms & Conditions
                        </Link>{" "}
                        and{" "}
                        <Link
                          to="/privacy"
                          className="text-decoration-none"
                        >
                          Privacy Policy
                        </Link>
                      </span>
                    }
                  />

                  {errors.acceptTerms && (
                    <div className="register-error-text">
                      {errors.acceptTerms}
                    </div>
                  )}
                </Form.Group>

                {/* SUBMIT */}

                <Button
                  type="submit"
                  disabled={loading}
                  className="register-submit-btn w-100"
                >
                  {loading ? "Creating Account..." : "Create Account"}
                </Button>
              </Form>

              <div className="text-center mt-4">
                Already have an account?{" "}
                <Link
                  to={`/login?redirect=${encodeURIComponent(redirect)}`}
                  className="text-decoration-none fw-semibold"
                >
                  Login
                </Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </motion.div>
  );
};

export default Register;