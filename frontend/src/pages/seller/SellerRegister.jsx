import {
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
  FaIdCard,
  FaInfoCircle,
  FaLock,
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaPhone,
  FaRocket,
  FaShieldAlt,
  FaStore,
  FaTruck,
  FaUniversity,
  FaUser,
  FaUserTie,
  FaWarehouse,
  FaCrown,
  FaBolt,
  FaHome,
  FaShoppingBag,
  FaExclamationTriangle,
} from "react-icons/fa";

import { useAuth } from "../../context/AuthContext";

import "../../styles/SellerRegister.css";

const categories = [
  "Mobiles",
  "Electronics",
  "Fashion",
  "Shoes",
  "Watches",
  "Beauty",
  "Home",
  "Appliances",
  "Furniture",
  "Grocery",
  "Sports",
  "Gaming",
  "Books",
  "Multiple Categories",
];

const initialForm = {
  name: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
  shopName: "",
  shopAddress: "",
  gstNumber: "",
  bankAccount: "",
  businessPhone: "",
  businessEmail: "",
  pickupAddress: "",
  productCategory: "",
  businessDescription: "",
  agreeTerms: false,
};

const SellerRegisterPage = () => {
  const navigate = useNavigate();

  const {
    sellerRegister,
    loading,
    authLoading,
    error,
  } = useAuth();

  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [activeStep, setActiveStep] = useState("account");

  const isSubmitting = loading || authLoading;

  const completion = useMemo(() => {
    const requiredFields = [
      "name",
      "email",
      "phone",
      "password",
      "confirmPassword",
      "shopName",
      "shopAddress",
      "businessPhone",
      "businessEmail",
      "pickupAddress",
      "productCategory",
      "businessDescription",
      "agreeTerms",
    ];

    const filled = requiredFields.filter((key) => {
      if (key === "agreeTerms") {
        return form.agreeTerms;
      }

      return Boolean(String(form[key] || "").trim());
    }).length;

    return Math.round((filled / requiredFields.length) * 100);
  }, [form]);

  const passwordStrength = useMemo(() => {
    let score = 0;

    if (form.password.length >= 6) score += 25;
    if (/[A-Z]/.test(form.password)) score += 20;
    if (/[0-9]/.test(form.password)) score += 20;
    if (/[^A-Za-z0-9]/.test(form.password)) score += 20;
    if (form.password.length >= 10) score += 15;

    return Math.min(score, 100);
  }, [form.password]);

  const businessReadiness = useMemo(() => {
    let score = 0;

    if (form.shopName.trim()) score += 15;
    if (form.shopAddress.trim()) score += 15;
    if (form.businessPhone.trim()) score += 15;
    if (form.businessEmail.trim()) score += 15;
    if (form.pickupAddress.trim()) score += 15;
    if (form.productCategory) score += 15;
    if (form.businessDescription.trim().length >= 30) score += 10;

    return Math.min(score, 100);
  }, [form]);

  const passwordLabel = useMemo(() => {
    if (passwordStrength >= 80) return "Strong";
    if (passwordStrength >= 55) return "Good";
    if (passwordStrength >= 30) return "Weak";
    return "Very Weak";
  }, [passwordStrength]);

  const changeHandler = (e) => {
    const {
      name,
      value,
      type,
      checked,
    } = e.target;

    setForm((prev) => {
      const updated = {
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      };

      if (name === "email" && !prev.businessEmail) {
        updated.businessEmail = value;
      }

      if (name === "phone" && !prev.businessPhone) {
        updated.businessPhone = value;
      }

      if (name === "shopAddress" && !prev.pickupAddress) {
        updated.pickupAddress = value;
      }

      return updated;
    });

    setErrors((prev) => ({
      ...prev,
      [name]: "",
      submit: "",
    }));
  };

  const validate = () => {
    const newErrors = {};

    if (!form.name.trim()) {
      newErrors.name = "Owner name is required";
    } else if (form.name.trim().length < 3) {
      newErrors.name = "Owner name must be at least 3 characters";
    }

    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) {
      newErrors.email = "Enter a valid email";
    }

    if (!form.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^[6-9]\d{9}$/.test(form.phone.trim())) {
      newErrors.phone = "Enter valid Indian mobile number";
    }

    if (!form.password) {
      newErrors.password = "Password is required";
    } else if (form.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!form.confirmPassword) {
      newErrors.confirmPassword = "Confirm password is required";
    } else if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!form.shopName.trim()) {
      newErrors.shopName = "Shop name is required";
    }

    if (!form.shopAddress.trim()) {
      newErrors.shopAddress = "Shop address is required";
    }

    if (!form.businessPhone.trim()) {
      newErrors.businessPhone = "Business phone is required";
    } else if (!/^[6-9]\d{9}$/.test(form.businessPhone.trim())) {
      newErrors.businessPhone = "Enter valid business phone";
    }

    if (!form.businessEmail.trim()) {
      newErrors.businessEmail = "Business email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(form.businessEmail.trim())) {
      newErrors.businessEmail = "Enter valid business email";
    }

    if (!form.pickupAddress.trim()) {
      newErrors.pickupAddress = "Pickup address is required";
    }

    if (!form.productCategory) {
      newErrors.productCategory = "Select product category";
    }

    if (form.businessDescription.trim().length < 30) {
      newErrors.businessDescription =
        "Business description must be at least 30 characters";
    }

    if (!form.agreeTerms) {
      newErrors.agreeTerms = "You must accept seller terms";
    }

    setErrors(newErrors);

    if (
      newErrors.name ||
      newErrors.email ||
      newErrors.phone ||
      newErrors.password ||
      newErrors.confirmPassword
    ) {
      setActiveStep("account");
    } else if (
      newErrors.shopName ||
      newErrors.shopAddress ||
      newErrors.businessPhone ||
      newErrors.businessEmail ||
      newErrors.pickupAddress ||
      newErrors.productCategory ||
      newErrors.businessDescription
    ) {
      setActiveStep("business");
    }

    return Object.keys(newErrors).length === 0;
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    if (!validate()) {
      toast.error("Please fix seller registration details");
      return;
    }

    const sellerData = {
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      phone: form.phone.trim(),
      password: form.password,
      role: "seller",

      shopName: form.shopName.trim(),
      shopAddress: form.shopAddress.trim(),
      gstNumber: form.gstNumber.trim(),
      bankAccount: form.bankAccount.trim(),
      businessPhone: form.businessPhone.trim(),
      businessEmail: form.businessEmail.trim().toLowerCase(),
      pickupAddress: form.pickupAddress.trim(),
      productCategory: form.productCategory,
      businessDescription: form.businessDescription.trim(),

      sellerInfo: {
        shopName: form.shopName.trim(),
        shopCategory: form.productCategory,
        shopAddress: form.shopAddress.trim(),
        businessPhone: form.businessPhone.trim(),
        businessEmail: form.businessEmail.trim().toLowerCase(),
        pickupAddress: form.pickupAddress.trim(),
        gstNumber: form.gstNumber.trim(),
        bankAccount: form.bankAccount.trim(),
        businessDescription: form.businessDescription.trim(),
        isApproved: false,
      },
    };

    const result = await sellerRegister(sellerData);

    if (result.success) {
      toast.success("Seller account created. Please login and wait for admin approval.");
      navigate("/seller/login");
    } else {
      toast.error(result.message || "Seller registration failed");

      setErrors((prev) => ({
        ...prev,
        submit: result.message || "Seller registration failed",
      }));
    }
  };

  const safeError =
    typeof error === "string"
      ? error
      : error?.message || "";

  return (
    <motion.main
      className="elite-seller-register-page"
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
      <Row className="elite-seller-register-shell g-0">
        <Col lg={5} className="elite-seller-register-visual-col">
          <motion.section
            className="elite-seller-register-visual"
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
            <div className="elite-seller-register-overlay">
              <Badge
                bg="warning"
                text="dark"
                className="elite-seller-register-badge"
              >
                <FaCrown className="me-2" />
                Become EliteShop Seller
              </Badge>

              <h1>Build your online store with EliteShop.</h1>

              <p>
                Register your business, submit seller details, wait for admin
                approval and start managing products, orders, stock and revenue.
              </p>

              <div className="elite-seller-register-feature-grid">
                <FeatureCard
                  icon={<FaMoneyBillWave />}
                  title="Sell Products"
                  text="Earn from real customer orders"
                />

                <FeatureCard
                  icon={<FaChartLine />}
                  title="Growth Dashboard"
                  text="Track revenue and product activity"
                />

                <FeatureCard
                  icon={<FaWarehouse />}
                  title="Inventory Tools"
                  text="Manage stock and low-stock alerts"
                />

                <FeatureCard
                  icon={<FaShieldAlt />}
                  title="Verified Selling"
                  text="Admin approval for trusted sellers"
                />
              </div>
            </div>

            <motion.div
              className="elite-seller-register-floating-card"
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
                <strong>Seller Onboarding</strong>
                <span>{completion}% profile completed</span>
              </div>
            </motion.div>
          </motion.section>
        </Col>

        <Col lg={7} className="elite-seller-register-form-col">
          <motion.div
            className="elite-seller-register-form-wrap"
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
            <Card className="elite-seller-register-card">
              <Card.Body>
                <div className="elite-seller-register-title">
                  <div className="elite-seller-register-icon">
                    <FaStore />
                  </div>

                  <Badge
                    bg="dark"
                    className="elite-seller-register-route"
                  >
                    Seller Registration
                  </Badge>

                  <h2>Create Seller Account</h2>

                  <p>
                    Fill your owner and business details for admin review.
                  </p>
                </div>

                <div className="elite-seller-register-score-grid">
                  <ScoreBox
                    title="Profile Completion"
                    value={`${completion}%`}
                    progress={completion}
                    icon={<FaRocket />}
                  />

                  <ScoreBox
                    title="Business Readiness"
                    value={`${businessReadiness}%`}
                    progress={businessReadiness}
                    icon={<FaStore />}
                  />

                  <ScoreBox
                    title="Password"
                    value={passwordLabel}
                    progress={passwordStrength}
                    icon={<FaLock />}
                  />
                </div>

                {(safeError || errors.submit) && (
                  <Alert
                    variant="danger"
                    className="elite-seller-register-alert"
                  >
                    <FaExclamationTriangle className="me-2" />
                    {errors.submit || safeError}
                  </Alert>
                )}

                <div className="elite-seller-register-step-tabs">
                  <button
                    type="button"
                    className={activeStep === "account" ? "active" : ""}
                    onClick={() => setActiveStep("account")}
                  >
                    <FaUserTie />
                    Owner Account
                  </button>

                  <button
                    type="button"
                    className={activeStep === "business" ? "active" : ""}
                    onClick={() => setActiveStep("business")}
                  >
                    <FaStore />
                    Business Details
                  </button>

                  <button
                    type="button"
                    className={activeStep === "review" ? "active" : ""}
                    onClick={() => setActiveStep("review")}
                  >
                    <FaCheckCircle />
                    Review
                  </button>
                </div>

                <Form onSubmit={submitHandler}>
                  {activeStep === "account" && (
                    <motion.div
                      initial={{
                        opacity: 0,
                        y: 12,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                    >
                      <Row>
                        <Col md={6}>
                          <SellerInput
                            icon={<FaUser />}
                            label="Owner Name"
                            name="name"
                            value={form.name}
                            error={errors.name}
                            onChange={changeHandler}
                            placeholder="Enter owner name"
                          />
                        </Col>

                        <Col md={6}>
                          <SellerInput
                            icon={<FaEnvelope />}
                            label="Email"
                            name="email"
                            type="email"
                            value={form.email}
                            error={errors.email}
                            onChange={changeHandler}
                            placeholder="seller@example.com"
                          />
                        </Col>

                        <Col md={6}>
                          <SellerInput
                            icon={<FaPhone />}
                            label="Phone"
                            name="phone"
                            value={form.phone}
                            error={errors.phone}
                            onChange={changeHandler}
                            placeholder="10-digit mobile number"
                          />
                        </Col>

                        <Col md={6}>
                          <SellerInput
                            icon={<FaLock />}
                            label="Password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            value={form.password}
                            error={errors.password}
                            onChange={changeHandler}
                            placeholder="Create password"
                            rightButton={
                              <button
                                type="button"
                                onClick={() => setShowPassword((prev) => !prev)}
                              >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                              </button>
                            }
                          />
                        </Col>

                        <Col md={6}>
                          <SellerInput
                            icon={<FaShieldAlt />}
                            label="Confirm Password"
                            name="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            value={form.confirmPassword}
                            error={errors.confirmPassword}
                            onChange={changeHandler}
                            placeholder="Confirm password"
                            rightButton={
                              <button
                                type="button"
                                onClick={() =>
                                  setShowConfirmPassword((prev) => !prev)
                                }
                              >
                                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                              </button>
                            }
                          />
                        </Col>
                      </Row>

                      <div className="elite-seller-register-actions">
                        <Button
                          type="button"
                          className="elite-seller-register-submit"
                          onClick={() => setActiveStep("business")}
                        >
                          Continue Business Details
                          <FaArrowRight className="ms-2" />
                        </Button>
                      </div>
                    </motion.div>
                  )}

                  {activeStep === "business" && (
                    <motion.div
                      initial={{
                        opacity: 0,
                        y: 12,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                    >
                      <Row>
                        <Col md={6}>
                          <SellerInput
                            icon={<FaStore />}
                            label="Shop Name"
                            name="shopName"
                            value={form.shopName}
                            error={errors.shopName}
                            onChange={changeHandler}
                            placeholder="Elite Mobile Store"
                          />
                        </Col>

                        <Col md={6}>
                          <SellerInput
                            icon={<FaPhone />}
                            label="Business Phone"
                            name="businessPhone"
                            value={form.businessPhone}
                            error={errors.businessPhone}
                            onChange={changeHandler}
                            placeholder="Business contact number"
                          />
                        </Col>

                        <Col md={6}>
                          <SellerInput
                            icon={<FaEnvelope />}
                            label="Business Email"
                            name="businessEmail"
                            type="email"
                            value={form.businessEmail}
                            error={errors.businessEmail}
                            onChange={changeHandler}
                            placeholder="business@example.com"
                          />
                        </Col>

                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>
                              <FaBoxOpen className="me-2" />
                              Product Category
                            </Form.Label>

                            <Form.Select
                              name="productCategory"
                              value={form.productCategory}
                              onChange={changeHandler}
                              isInvalid={!!errors.productCategory}
                            >
                              <option value="">Select Category</option>

                              {categories.map((item) => (
                                <option key={item} value={item}>
                                  {item}
                                </option>
                              ))}
                            </Form.Select>

                            <Form.Control.Feedback type="invalid">
                              {errors.productCategory}
                            </Form.Control.Feedback>
                          </Form.Group>
                        </Col>

                        <Col md={6}>
                          <SellerInput
                            icon={<FaIdCard />}
                            label="GST Number Optional"
                            name="gstNumber"
                            value={form.gstNumber}
                            onChange={changeHandler}
                            placeholder="GSTIN optional"
                          />
                        </Col>

                        <Col md={6}>
                          <SellerInput
                            icon={<FaUniversity />}
                            label="Bank Account Optional"
                            name="bankAccount"
                            value={form.bankAccount}
                            onChange={changeHandler}
                            placeholder="Account number optional"
                          />
                        </Col>

                        <Col md={6}>
                          <TextArea
                            icon={<FaMapMarkerAlt />}
                            label="Shop Address"
                            name="shopAddress"
                            value={form.shopAddress}
                            error={errors.shopAddress}
                            onChange={changeHandler}
                            placeholder="Enter shop address"
                          />
                        </Col>

                        <Col md={6}>
                          <TextArea
                            icon={<FaTruck />}
                            label="Pickup Address"
                            name="pickupAddress"
                            value={form.pickupAddress}
                            error={errors.pickupAddress}
                            onChange={changeHandler}
                            placeholder="Enter pickup address"
                          />
                        </Col>

                        <Col md={12}>
                          <TextArea
                            icon={<FaInfoCircle />}
                            label="Business Description"
                            name="businessDescription"
                            value={form.businessDescription}
                            error={errors.businessDescription}
                            onChange={changeHandler}
                            rows={4}
                            placeholder="Explain your business, products, service area and selling category..."
                          />
                        </Col>
                      </Row>

                      <div className="elite-seller-register-actions">
                        <Button
                          type="button"
                          variant="outline-secondary"
                          className="elite-seller-register-pill-btn"
                          onClick={() => setActiveStep("account")}
                        >
                          Back
                        </Button>

                        <Button
                          type="button"
                          className="elite-seller-register-submit"
                          onClick={() => setActiveStep("review")}
                        >
                          Review Details
                          <FaArrowRight className="ms-2" />
                        </Button>
                      </div>
                    </motion.div>
                  )}

                  {activeStep === "review" && (
                    <motion.div
                      initial={{
                        opacity: 0,
                        y: 12,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                    >
                      <div className="elite-seller-register-review">
                        <div>
                          <span>Owner</span>
                          <strong>{form.name || "Not added"}</strong>
                        </div>

                        <div>
                          <span>Email</span>
                          <strong>{form.email || "Not added"}</strong>
                        </div>

                        <div>
                          <span>Shop</span>
                          <strong>{form.shopName || "Not added"}</strong>
                        </div>

                        <div>
                          <span>Category</span>
                          <strong>{form.productCategory || "Not selected"}</strong>
                        </div>

                        <div>
                          <span>Business Phone</span>
                          <strong>{form.businessPhone || "Not added"}</strong>
                        </div>

                        <div>
                          <span>Business Readiness</span>
                          <strong>{businessReadiness}%</strong>
                        </div>
                      </div>

                      <div className="elite-seller-register-terms">
                        <Form.Check
                          type="checkbox"
                          name="agreeTerms"
                          checked={form.agreeTerms}
                          onChange={changeHandler}
                          label="I confirm all seller details are correct and agree to EliteShop seller terms."
                          isInvalid={!!errors.agreeTerms}
                          feedback={errors.agreeTerms}
                          feedbackType="invalid"
                        />
                      </div>

                      <div className="elite-seller-register-actions">
                        <Button
                          type="button"
                          variant="outline-secondary"
                          className="elite-seller-register-pill-btn"
                          onClick={() => setActiveStep("business")}
                        >
                          Back
                        </Button>

                        <Button
                          type="submit"
                          className="elite-seller-register-submit"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <>
                              <Spinner
                                animation="border"
                                size="sm"
                                className="me-2"
                              />
                              Creating Seller...
                            </>
                          ) : (
                            <>
                              <FaRocket className="me-2" />
                              Create Seller Account
                              <FaArrowRight className="ms-2" />
                            </>
                          )}
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </Form>

                <div className="elite-seller-register-links">
                  <span>Already seller?</span>

                  <Link to="/seller/login">
                    Login here
                  </Link>
                </div>

                <div className="elite-seller-register-switch">
                  <Link to="/login">
                    <FaShoppingBag className="me-2" />
                    Customer Login
                  </Link>

                  <Link to="/">
                    <FaHome className="me-2" />
                    Back Home
                  </Link>
                </div>
              </Card.Body>
            </Card>

            <div className="elite-seller-register-mini-strip">
              <span>
                <FaBolt />
                Admin Approval
              </span>

              <span>
                <FaShieldAlt />
                Secure Seller Account
              </span>

              <span>
                <FaTruck />
                Pickup Ready
              </span>
            </div>
          </motion.div>
        </Col>
      </Row>
    </motion.main>
  );
};

const SellerInput = ({
  icon,
  label,
  name,
  value,
  onChange,
  error,
  type = "text",
  placeholder = "",
  rightButton = null,
}) => (
  <Form.Group className="mb-3">
    <Form.Label>
      {icon}
      <span className="ms-2">{label}</span>
    </Form.Label>

    <div className={error ? "elite-seller-register-input is-invalid" : "elite-seller-register-input"}>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />

      {rightButton}
    </div>

    {error && (
      <div className="elite-seller-register-invalid">
        {error}
      </div>
    )}
  </Form.Group>
);

const TextArea = ({
  icon,
  label,
  name,
  value,
  onChange,
  error,
  rows = 3,
  placeholder = "",
}) => (
  <Form.Group className="mb-3">
    <Form.Label>
      {icon}
      <span className="ms-2">{label}</span>
    </Form.Label>

    <Form.Control
      as="textarea"
      rows={rows}
      name={name}
      value={value}
      onChange={onChange}
      isInvalid={!!error}
      placeholder={placeholder}
      className="elite-seller-register-textarea"
    />

    <Form.Control.Feedback type="invalid">
      {error}
    </Form.Control.Feedback>
  </Form.Group>
);

const FeatureCard = ({
  icon,
  title,
  text,
}) => (
  <div className="elite-seller-register-feature-card">
    {icon}

    <div>
      <strong>{title}</strong>
      <span>{text}</span>
    </div>
  </div>
);

const ScoreBox = ({
  icon,
  title,
  value,
  progress,
}) => (
  <div className="elite-seller-register-score-box">
    <div>
      {icon}

      <span>{title}</span>
    </div>

    <strong>{value}</strong>

    <ProgressBar now={progress} />
  </div>
);

export default SellerRegisterPage;