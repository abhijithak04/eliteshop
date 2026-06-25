import { useEffect, useMemo, useState } from "react";
import {
  Row,
  Col,
  Card,
  Form,
  Button,
  InputGroup,
  Badge,
  Alert,
  ProgressBar,
  Spinner,
} from "react-bootstrap";
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaPhone,
  FaStore,
  FaMapMarkerAlt,
  FaShieldAlt,
  FaCheckCircle,
  FaShoppingBag,
  FaCrown,
  FaRocket,
  FaGift,
  FaTruck,
  FaHeart,
  FaTags,
  FaBolt,
  FaArrowRight,
  FaExclamationTriangle,
} from "react-icons/fa";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-toastify";

import { useAuth } from "../../context/AuthContext";
import api from "../../utils/axios";

import "../../styles/UserRegister.css";

const initialForm = {
  name: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
  role: "user",
  shopName: "",
  shopCategory: "",
  businessPhone: "",
  businessAddress: "",
  agreeTerms: false,
  marketingOptIn: true,
};

const Register = () => {
  const navigate = useNavigate();
  const { search } = useLocation();

  const { userInfo } = useAuth();

  const redirect = new URLSearchParams(search).get("redirect") || "/login";

  const [formData, setFormData] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (userInfo) {
      if (userInfo.role === "admin") {
        navigate("/admin/dashboard");
      } else if (userInfo.role === "seller") {
        navigate("/seller/dashboard");
      } else {
        navigate("/");
      }
    }
  }, [userInfo, navigate]);

  const passwordStrength = useMemo(() => {
    let score = 0;

    if (formData.password.length >= 6) score += 25;
    if (/[A-Z]/.test(formData.password)) score += 20;
    if (/[0-9]/.test(formData.password)) score += 20;
    if (/[^A-Za-z0-9]/.test(formData.password)) score += 20;
    if (formData.password.length >= 10) score += 15;

    return Math.min(score, 100);
  }, [formData.password]);

  const passwordStrengthLabel = useMemo(() => {
    if (passwordStrength >= 80) return "Strong";
    if (passwordStrength >= 55) return "Good";
    if (passwordStrength >= 30) return "Weak";
    return "Very Weak";
  }, [passwordStrength]);

  const completionScore = useMemo(() => {
    let score = 0;

    if (formData.name.trim()) score += 15;
    if (formData.email.trim()) score += 15;
    if (formData.phone.trim()) score += 10;
    if (formData.password) score += 15;
    if (formData.confirmPassword) score += 10;
    if (formData.password === formData.confirmPassword && formData.password) {
      score += 10;
    }

    if (formData.role === "seller") {
      if (formData.shopName.trim()) score += 8;
      if (formData.shopCategory.trim()) score += 7;
      if (formData.businessPhone.trim()) score += 5;
      if (formData.businessAddress.trim()) score += 5;
    } else {
      score += 25;
    }

    if (formData.agreeTerms) score += 10;

    return Math.min(score, 100);
  }, [formData]);

  const changeHandler = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
      submit: "",
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Full name is required";
    } else if (formData.name.trim().length < 3) {
      newErrors.name = "Name must be at least 3 characters";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = "Enter a valid email address";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^[6-9]\d{9}$/.test(formData.phone.trim())) {
      newErrors.phone = "Enter a valid 10-digit Indian phone number";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Confirm password is required";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (formData.role === "seller") {
      if (!formData.shopName.trim()) {
        newErrors.shopName = "Shop name is required";
      }

      if (!formData.shopCategory.trim()) {
        newErrors.shopCategory = "Shop category is required";
      }

      if (!formData.businessPhone.trim()) {
        newErrors.businessPhone = "Business phone is required";
      }

      if (!formData.businessAddress.trim()) {
        newErrors.businessAddress = "Business address is required";
      }
    }

    if (!formData.agreeTerms) {
      newErrors.agreeTerms = "You must agree to EliteShop terms";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the highlighted fields");
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        password: formData.password,
        role: formData.role,
        marketingOptIn: formData.marketingOptIn,
      };

      if (formData.role === "seller") {
        payload.sellerInfo = {
          shopName: formData.shopName.trim(),
          shopCategory: formData.shopCategory.trim(),
          businessPhone: formData.businessPhone.trim(),
          businessAddress: formData.businessAddress.trim(),
          isApproved: false,
        };
      }

      await api.post("/users", payload);

      toast.success(
        formData.role === "seller"
          ? "Seller account created. Please login and wait for admin approval."
          : "Account created successfully. Please login."
      );

      navigate(`${redirect === "/login" ? "/login" : `/login?redirect=${redirect}`}`);
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Registration failed";

      setErrors((prev) => ({
        ...prev,
        submit: message,
      }));

      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.main
      className="elite-register-page"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <section className="elite-register-hero">
        <div>
          <Badge bg="warning" text="dark" className="elite-register-hero-badge">
            <FaCrown className="me-2" />
            EliteShop Account
          </Badge>

          <h1>Create Your Account</h1>

          <p>
            Join EliteShop to shop faster, track orders, save wishlist products,
            manage addresses, and unlock a premium ecommerce experience.
          </p>
        </div>

        <motion.div
          className="elite-register-floating"
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 3.5, repeat: Infinity }}
        >
          <FaShieldAlt />
          Secure Signup
        </motion.div>
      </section>

      <Row className="g-4 align-items-stretch">
        <Col lg={7}>
          <Card className="elite-register-card">
            <Card.Body>
              <div className="elite-register-card-head">
                <div>
                  <h3>
                    <FaUser className="me-2" />
                    Register
                  </h3>

                  <p>
                    Fill your details carefully. Seller accounts require admin approval.
                  </p>
                </div>

                <div className="elite-register-score">
                  <strong>{completionScore}%</strong>
                  <span>Complete</span>
                </div>
              </div>

              <ProgressBar now={completionScore} className="elite-register-progress" />

              {errors.submit && (
                <Alert variant="danger" className="elite-register-alert">
                  <FaExclamationTriangle className="me-2" />
                  {errors.submit}
                </Alert>
              )}

              <Form onSubmit={submitHandler}>
                <div className="elite-register-role-grid">
                  <button
                    type="button"
                    className={
                      formData.role === "user"
                        ? "elite-register-role active"
                        : "elite-register-role"
                    }
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        role: "user",
                      }))
                    }
                  >
                    <FaShoppingBag />
                    <strong>Customer</strong>
                    <span>Shop products, track orders and manage wishlist</span>
                  </button>

                  <button
                    type="button"
                    className={
                      formData.role === "seller"
                        ? "elite-register-role active"
                        : "elite-register-role"
                    }
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        role: "seller",
                      }))
                    }
                  >
                    <FaStore />
                    <strong>Seller</strong>
                    <span>Sell products after admin approval</span>
                  </button>
                </div>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Full Name *</Form.Label>

                      <InputGroup>
                        <InputGroup.Text>
                          <FaUser />
                        </InputGroup.Text>

                        <Form.Control
                          name="name"
                          value={formData.name}
                          onChange={changeHandler}
                          placeholder="Enter your full name"
                          isInvalid={!!errors.name}
                        />

                        <Form.Control.Feedback type="invalid">
                          {errors.name}
                        </Form.Control.Feedback>
                      </InputGroup>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Email *</Form.Label>

                      <InputGroup>
                        <InputGroup.Text>
                          <FaEnvelope />
                        </InputGroup.Text>

                        <Form.Control
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={changeHandler}
                          placeholder="example@email.com"
                          isInvalid={!!errors.email}
                        />

                        <Form.Control.Feedback type="invalid">
                          {errors.email}
                        </Form.Control.Feedback>
                      </InputGroup>
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Phone Number *</Form.Label>

                  <InputGroup>
                    <InputGroup.Text>
                      <FaPhone />
                    </InputGroup.Text>

                    <Form.Control
                      name="phone"
                      value={formData.phone}
                      onChange={changeHandler}
                      placeholder="10-digit mobile number"
                      isInvalid={!!errors.phone}
                    />

                    <Form.Control.Feedback type="invalid">
                      {errors.phone}
                    </Form.Control.Feedback>
                  </InputGroup>
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Password *</Form.Label>

                      <InputGroup>
                        <InputGroup.Text>
                          <FaLock />
                        </InputGroup.Text>

                        <Form.Control
                          type={showPassword ? "text" : "password"}
                          name="password"
                          value={formData.password}
                          onChange={changeHandler}
                          placeholder="Create password"
                          isInvalid={!!errors.password}
                        />

                        <Button
                          type="button"
                          variant="outline-secondary"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </Button>

                        <Form.Control.Feedback type="invalid">
                          {errors.password}
                        </Form.Control.Feedback>
                      </InputGroup>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Confirm Password *</Form.Label>

                      <InputGroup>
                        <InputGroup.Text>
                          <FaShieldAlt />
                        </InputGroup.Text>

                        <Form.Control
                          type={showConfirmPassword ? "text" : "password"}
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={changeHandler}
                          placeholder="Confirm password"
                          isInvalid={!!errors.confirmPassword}
                        />

                        <Button
                          type="button"
                          variant="outline-secondary"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                        </Button>

                        <Form.Control.Feedback type="invalid">
                          {errors.confirmPassword}
                        </Form.Control.Feedback>
                      </InputGroup>
                    </Form.Group>
                  </Col>
                </Row>

                <div className="elite-password-meter">
                  <div>
                    <span>Password Strength</span>
                    <strong>{passwordStrengthLabel}</strong>
                  </div>

                  <ProgressBar
                    now={passwordStrength}
                    variant={
                      passwordStrength >= 80
                        ? "success"
                        : passwordStrength >= 55
                        ? "info"
                        : passwordStrength >= 30
                        ? "warning"
                        : "danger"
                    }
                  />
                </div>

                {formData.role === "seller" && (
                  <motion.div
                    className="elite-seller-register-box"
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="elite-seller-register-head">
                      <FaStore />
                      <div>
                        <h5>Seller Business Details</h5>
                        <p>Your seller account will be reviewed by admin.</p>
                      </div>
                    </div>

                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Shop Name *</Form.Label>

                          <Form.Control
                            name="shopName"
                            value={formData.shopName}
                            onChange={changeHandler}
                            placeholder="Elite Mobile Store"
                            isInvalid={!!errors.shopName}
                          />

                          <Form.Control.Feedback type="invalid">
                            {errors.shopName}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>

                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Shop Category *</Form.Label>

                          <Form.Select
                            name="shopCategory"
                            value={formData.shopCategory}
                            onChange={changeHandler}
                            isInvalid={!!errors.shopCategory}
                          >
                            <option value="">Select category</option>
                            <option value="Electronics">Electronics</option>
                            <option value="Fashion">Fashion</option>
                            <option value="Mobiles">Mobiles</option>
                            <option value="Home & Kitchen">Home & Kitchen</option>
                            <option value="Beauty">Beauty</option>
                            <option value="Grocery">Grocery</option>
                            <option value="Sports">Sports</option>
                            <option value="Other">Other</option>
                          </Form.Select>

                          <Form.Control.Feedback type="invalid">
                            {errors.shopCategory}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>

                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Business Phone *</Form.Label>

                          <Form.Control
                            name="businessPhone"
                            value={formData.businessPhone}
                            onChange={changeHandler}
                            placeholder="Business contact number"
                            isInvalid={!!errors.businessPhone}
                          />

                          <Form.Control.Feedback type="invalid">
                            {errors.businessPhone}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>

                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Business Address *</Form.Label>

                          <Form.Control
                            name="businessAddress"
                            value={formData.businessAddress}
                            onChange={changeHandler}
                            placeholder="Shop / business address"
                            isInvalid={!!errors.businessAddress}
                          />

                          <Form.Control.Feedback type="invalid">
                            {errors.businessAddress}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                    </Row>
                  </motion.div>
                )}

                <div className="elite-register-checks">
                  <Form.Check
                    type="checkbox"
                    name="agreeTerms"
                    checked={formData.agreeTerms}
                    onChange={changeHandler}
                    label={
                      <>
                        I agree to EliteShop{" "}
                        <Link to="/terms">Terms</Link> and{" "}
                        <Link to="/privacy">Privacy Policy</Link>
                      </>
                    }
                    isInvalid={!!errors.agreeTerms}
                    feedback={errors.agreeTerms}
                    feedbackType="invalid"
                  />

                  <Form.Check
                    type="checkbox"
                    name="marketingOptIn"
                    checked={formData.marketingOptIn}
                    onChange={changeHandler}
                    label="Send me offers, order alerts and shopping updates"
                  />
                </div>

                <Button
                  type="submit"
                  className="elite-register-submit-btn"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Creating Account...
                    </>
                  ) : (
                    <>
                      <FaRocket className="me-2" />
                      Create Account
                      <FaArrowRight className="ms-2" />
                    </>
                  )}
                </Button>

                <div className="elite-register-login-link">
                  Already have an account?{" "}
                  <Link to="/login">Login here</Link>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={5}>
          <div className="elite-register-side-stack">
            <Card className="elite-register-preview-card">
              <Card.Body>
                <div className="elite-register-preview-icon">
                  {formData.role === "seller" ? <FaStore /> : <FaUser />}
                </div>

                <h4>
                  {formData.name || "Your Name"}
                </h4>

                <p>
                  {formData.email || "your@email.com"}
                </p>

                <div className="elite-register-preview-badges">
                  <Badge bg="dark">
                    {formData.role === "seller" ? "Seller Account" : "Customer Account"}
                  </Badge>

                  <Badge bg={completionScore >= 80 ? "success" : "warning"}>
                    {completionScore}% Ready
                  </Badge>
                </div>

                {formData.role === "seller" && (
                  <div className="elite-register-shop-preview">
                    <strong>{formData.shopName || "Your Shop Name"}</strong>
                    <span>{formData.shopCategory || "Shop Category"}</span>
                  </div>
                )}
              </Card.Body>
            </Card>

            <Card className="elite-register-benefits-card">
              <Card.Body>
                <h4>
                  <FaGift className="me-2" />
                  Why Join EliteShop?
                </h4>

                <div className="elite-register-benefit">
                  <FaTruck />
                  <div>
                    <strong>Fast order tracking</strong>
                    <span>Track order, payment and delivery status.</span>
                  </div>
                </div>

                <div className="elite-register-benefit">
                  <FaHeart />
                  <div>
                    <strong>Smart wishlist</strong>
                    <span>Save products and get price drop alerts.</span>
                  </div>
                </div>

                <div className="elite-register-benefit">
                  <FaTags />
                  <div>
                    <strong>Exclusive offers</strong>
                    <span>Get coupons, deals and festive discounts.</span>
                  </div>
                </div>

                <div className="elite-register-benefit">
                  <FaBolt />
                  <div>
                    <strong>Seller tools</strong>
                    <span>List products after seller approval.</span>
                  </div>
                </div>
              </Card.Body>
            </Card>

            <Alert variant="info" className="elite-register-info-alert">
              <FaCheckCircle className="me-2" />
              After registration, login using your email and password. Seller
              dashboard access depends on admin approval.
            </Alert>
          </div>
        </Col>
      </Row>
    </motion.main>
  );
};

export default Register;