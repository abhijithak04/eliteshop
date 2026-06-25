import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Form,
  Button,
  Card,
  Row,
  Col,
  Container,
  Badge,
  Alert,
  ProgressBar,
} from "react-bootstrap";

import {
  FaArrowLeft,
  FaArrowRight,
  FaCheckCircle,
  FaCity,
  FaHome,
  FaMapMarkedAlt,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaShieldAlt,
  FaShippingFast,
  FaTruck,
  FaUser,
  FaLock,
  FaGift,
  FaBriefcase,
  FaBuilding,
  FaClipboardCheck,
  FaRoute,
  FaBoxOpen,
  FaExclamationTriangle,
} from "react-icons/fa";

import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-toastify";

import CheckoutSteps from "../components/CheckoutSteps";

import { useCart } from "../context/CartContext";

import "../styles/Shipping.css";

const indianStates = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Tamil Nadu",
  "Telangana",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
];

const addressTypes = [
  {
    label: "Home",
    icon: <FaHome />,
  },
  {
    label: "Office",
    icon: <FaBriefcase />,
  },
  {
    label: "Other",
    icon: <FaBuilding />,
  },
];

const deliveryModes = [
  {
    id: "standard",
    title: "Standard Delivery",
    text: "Delivery in 4-6 business days",
    price: "Free / Normal",
  },
  {
    id: "express",
    title: "Express Delivery",
    text: "Faster delivery for selected locations",
    price: "Available soon",
  },
];

const initialForm = {
  fullName: "",
  phone: "",
  address: "",
  landmark: "",
  city: "",
  state: "",
  postalCode: "",
  country: "India",
  addressType: "Home",
  deliveryInstruction: "",
  deliveryMode: "standard",
};

const ShippingPage = () => {
  const navigate = useNavigate();

  const {
    shippingAddress,
    saveShippingAddress,
    cartItems = [],
    totalPrice = 0,
  } = useCart();

  const [formData, setFormData] = useState({
    ...initialForm,
    ...(shippingAddress || {}),
    deliveryMode: shippingAddress?.deliveryMode || "standard",
  });

  const [errors, setErrors] = useState({});

  const totalItems = useMemo(() => {
    return cartItems.reduce(
      (acc, item) => acc + Number(item.qty || 0),
      0
    );
  }, [cartItems]);

  const completion = useMemo(() => {
    const requiredFields = [
      "fullName",
      "phone",
      "address",
      "city",
      "state",
      "postalCode",
      "country",
    ];

    const completed = requiredFields.filter((field) =>
      String(formData[field] || "").trim()
    ).length;

    return Math.round((completed / requiredFields.length) * 100);
  }, [formData]);

  const estimatedDelivery = useMemo(() => {
    const days = formData.deliveryMode === "express" ? 3 : 5;

    return new Date(
      Date.now() + days * 24 * 60 * 60 * 1000
    ).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }, [formData.deliveryMode]);

  useEffect(() => {
    if (!cartItems.length) {
      toast.info("Your cart is empty");
      navigate("/cart", {
        replace: true,
      });
    }
  }, [
    cartItems.length,
    navigate,
  ]);

  const changeHandler = (e) => {
    const {
      name,
      value,
    } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
      submit: "",
    }));
  };

  const updateField = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
      submit: "",
    }));
  };

  const validateForm = () => {
    const nextErrors = {};

    if (!formData.fullName.trim()) {
      nextErrors.fullName = "Full name is required";
    } else if (formData.fullName.trim().length < 3) {
      nextErrors.fullName = "Full name must be at least 3 characters";
    }

    if (!formData.phone.trim()) {
      nextErrors.phone = "Phone number is required";
    } else if (!/^[6-9]\d{9}$/.test(formData.phone.trim())) {
      nextErrors.phone = "Enter a valid Indian mobile number";
    }

    if (!formData.address.trim()) {
      nextErrors.address = "Address is required";
    } else if (formData.address.trim().length < 8) {
      nextErrors.address = "Please enter a complete address";
    }

    if (!formData.city.trim()) {
      nextErrors.city = "City is required";
    }

    if (!formData.state.trim()) {
      nextErrors.state = "State is required";
    }

    if (!formData.postalCode.trim()) {
      nextErrors.postalCode = "PIN code is required";
    } else if (!/^[1-9][0-9]{5}$/.test(formData.postalCode.trim())) {
      nextErrors.postalCode = "Enter a valid 6-digit Indian PIN code";
    }

    if (!formData.country.trim()) {
      nextErrors.country = "Country is required";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const submitHandler = (e) => {
    e.preventDefault();

    if (!cartItems.length) {
      toast.error("Your cart is empty");
      navigate("/cart");
      return;
    }

    if (!validateForm()) {
      toast.error("Please fix shipping address errors");
      return;
    }

    saveShippingAddress({
      fullName: formData.fullName.trim(),
      phone: formData.phone.trim(),
      address: formData.address.trim(),
      landmark: formData.landmark.trim(),
      city: formData.city.trim(),
      state: formData.state.trim(),
      postalCode: formData.postalCode.trim(),
      country: formData.country.trim(),
      addressType: formData.addressType,
      deliveryInstruction: formData.deliveryInstruction.trim(),
      deliveryMode: formData.deliveryMode,
    });

    toast.success("Shipping address saved");
    navigate("/payment");
  };

  return (
    <main className="elite-shipping-page">
      <Container fluid="xl">
        <motion.section
          className="elite-shipping-hero"
          initial={{
            opacity: 0,
            y: 18,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.3,
          }}
        >
          <div>
            <Badge
              bg="warning"
              text="dark"
              className="elite-shipping-hero-badge"
            >
              <FaShippingFast className="me-2" />
              EliteShop Checkout
            </Badge>

            <h1>Shipping Address</h1>

            <p>
              Add accurate delivery details so your order reaches the right
              place without delay.
            </p>
          </div>

          <div className="elite-shipping-hero-actions">
            <Button
              variant="light"
              onClick={() => navigate("/cart")}
            >
              <FaArrowLeft className="me-2" />
              Back To Cart
            </Button>

            <Button
              variant="outline-light"
              onClick={() => navigate("/products")}
            >
              <FaBoxOpen className="me-2" />
              Continue Shopping
            </Button>
          </div>

          <motion.div
            className="elite-shipping-floating-badge"
            animate={{
              y: [0, -10, 0],
            }}
            transition={{
              duration: 3.5,
              repeat: Infinity,
            }}
          >
            <FaTruck />
            Fast Delivery
          </motion.div>
        </motion.section>

        <div className="elite-shipping-steps">
          <CheckoutSteps step1 step2 />
        </div>

        <Row className="g-4">
          <Col lg={8}>
            <motion.div
              initial={{
                opacity: 0,
                x: -18,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              transition={{
                duration: 0.3,
              }}
            >
              <Card className="elite-shipping-form-card">
                <Card.Body>
                  <div className="elite-shipping-card-heading">
                    <div>
                      <h2>
                        <FaMapMarkedAlt className="me-2" />
                        Delivery Information
                      </h2>

                      <p>
                        Use complete address details with a valid phone number
                        for faster delivery.
                      </p>
                    </div>

                    <div className="elite-shipping-progress-box">
                      <strong>{completion}%</strong>
                      <span>Complete</span>
                    </div>
                  </div>

                  <ProgressBar
                    now={completion}
                    className="elite-shipping-progress"
                  />

                  {errors.submit && (
                    <Alert variant="danger" className="elite-shipping-alert">
                      <FaExclamationTriangle className="me-2" />
                      {errors.submit}
                    </Alert>
                  )}

                  <Form
                    onSubmit={submitHandler}
                    className="elite-shipping-form"
                  >
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3" controlId="fullName">
                          <Form.Label>
                            <FaUser className="me-2" />
                            Full Name *
                          </Form.Label>

                          <Form.Control
                            type="text"
                            name="fullName"
                            placeholder="Enter full name"
                            value={formData.fullName}
                            onChange={changeHandler}
                            isInvalid={!!errors.fullName}
                            autoComplete="name"
                          />

                          <Form.Control.Feedback type="invalid">
                            {errors.fullName}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>

                      <Col md={6}>
                        <Form.Group className="mb-3" controlId="phone">
                          <Form.Label>
                            <FaPhoneAlt className="me-2" />
                            Phone Number *
                          </Form.Label>

                          <Form.Control
                            type="tel"
                            name="phone"
                            placeholder="10-digit mobile number"
                            value={formData.phone}
                            onChange={changeHandler}
                            isInvalid={!!errors.phone}
                            autoComplete="tel"
                            maxLength={10}
                          />

                          <Form.Control.Feedback type="invalid">
                            {errors.phone}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                    </Row>

                    <Form.Group className="mb-3" controlId="address">
                      <Form.Label>
                        <FaHome className="me-2" />
                        Full Address *
                      </Form.Label>

                      <Form.Control
                        as="textarea"
                        rows={3}
                        name="address"
                        placeholder="House No, Street, Area"
                        value={formData.address}
                        onChange={changeHandler}
                        isInvalid={!!errors.address}
                        autoComplete="street-address"
                      />

                      <Form.Control.Feedback type="invalid">
                        {errors.address}
                      </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="landmark">
                      <Form.Label>
                        <FaMapMarkerAlt className="me-2" />
                        Landmark
                      </Form.Label>

                      <Form.Control
                        type="text"
                        name="landmark"
                        placeholder="Nearby landmark, building, mall, etc."
                        value={formData.landmark}
                        onChange={changeHandler}
                      />
                    </Form.Group>

                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3" controlId="city">
                          <Form.Label>
                            <FaCity className="me-2" />
                            City *
                          </Form.Label>

                          <Form.Control
                            type="text"
                            name="city"
                            placeholder="Enter city"
                            value={formData.city}
                            onChange={changeHandler}
                            isInvalid={!!errors.city}
                            autoComplete="address-level2"
                          />

                          <Form.Control.Feedback type="invalid">
                            {errors.city}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>

                      <Col md={6}>
                        <Form.Group className="mb-3" controlId="state">
                          <Form.Label>
                            <FaMapMarkedAlt className="me-2" />
                            State *
                          </Form.Label>

                          <Form.Select
                            name="state"
                            value={formData.state}
                            onChange={changeHandler}
                            isInvalid={!!errors.state}
                            autoComplete="address-level1"
                          >
                            <option value="">Select state</option>

                            {indianStates.map((stateName) => (
                              <option key={stateName} value={stateName}>
                                {stateName}
                              </option>
                            ))}
                          </Form.Select>

                          <Form.Control.Feedback type="invalid">
                            {errors.state}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                    </Row>

                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3" controlId="postalCode">
                          <Form.Label>
                            <FaMapMarkerAlt className="me-2" />
                            PIN Code *
                          </Form.Label>

                          <Form.Control
                            type="text"
                            name="postalCode"
                            placeholder="6-digit PIN code"
                            value={formData.postalCode}
                            onChange={changeHandler}
                            isInvalid={!!errors.postalCode}
                            autoComplete="postal-code"
                            maxLength={6}
                          />

                          <Form.Control.Feedback type="invalid">
                            {errors.postalCode}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>

                      <Col md={6}>
                        <Form.Group className="mb-3" controlId="country">
                          <Form.Label>
                            <FaMapMarkedAlt className="me-2" />
                            Country *
                          </Form.Label>

                          <Form.Control
                            type="text"
                            name="country"
                            placeholder="Country"
                            value={formData.country}
                            onChange={changeHandler}
                            isInvalid={!!errors.country}
                            autoComplete="country-name"
                          />

                          <Form.Control.Feedback type="invalid">
                            {errors.country}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                    </Row>

                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3" controlId="addressType">
                          <Form.Label>Address Type</Form.Label>

                          <div className="elite-shipping-address-types">
                            {addressTypes.map((type) => (
                              <button
                                key={type.label}
                                type="button"
                                className={
                                  formData.addressType === type.label
                                    ? "active"
                                    : ""
                                }
                                onClick={() =>
                                  updateField("addressType", type.label)
                                }
                              >
                                {type.icon}
                                {type.label}
                              </button>
                            ))}
                          </div>
                        </Form.Group>
                      </Col>

                      <Col md={6}>
                        <Form.Group
                          className="mb-3"
                          controlId="deliveryInstruction"
                        >
                          <Form.Label>Delivery Instruction</Form.Label>

                          <Form.Control
                            type="text"
                            name="deliveryInstruction"
                            placeholder="Call before delivery, leave at gate..."
                            value={formData.deliveryInstruction}
                            onChange={changeHandler}
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <Form.Group className="mb-3">
                      <Form.Label>
                        <FaRoute className="me-2" />
                        Delivery Mode
                      </Form.Label>

                      <div className="elite-delivery-mode-grid">
                        {deliveryModes.map((mode) => (
                          <button
                            key={mode.id}
                            type="button"
                            className={
                              formData.deliveryMode === mode.id
                                ? "active"
                                : ""
                            }
                            onClick={() =>
                              updateField("deliveryMode", mode.id)
                            }
                          >
                            <strong>{mode.title}</strong>
                            <span>{mode.text}</span>
                            <small>{mode.price}</small>
                          </button>
                        ))}
                      </div>
                    </Form.Group>

                    <div className="elite-shipping-form-actions">
                      <Button
                        type="button"
                        variant="outline-dark"
                        onClick={() => navigate("/cart")}
                      >
                        <FaArrowLeft className="me-2" />
                        Back To Cart
                      </Button>

                      <Button
                        type="submit"
                        className="elite-shipping-submit-btn"
                      >
                        Continue To Payment
                        <FaArrowRight className="ms-2" />
                      </Button>
                    </div>
                  </Form>
                </Card.Body>
              </Card>
            </motion.div>
          </Col>

          <Col lg={4}>
            <motion.div
              className="elite-shipping-side-stack"
              initial={{
                opacity: 0,
                x: 18,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              transition={{
                duration: 0.3,
              }}
            >
              <Card className="elite-shipping-summary-card">
                <Card.Header>
                  <FaGift className="me-2" />
                  Delivery Summary
                </Card.Header>

                <Card.Body>
                  <div className="elite-shipping-summary-line">
                    <span>Total Items</span>
                    <strong>{totalItems}</strong>
                  </div>

                  <div className="elite-shipping-summary-line">
                    <span>Cart Total</span>
                    <strong>
                      ₹{Number(totalPrice || 0).toLocaleString("en-IN")}
                    </strong>
                  </div>

                  <div className="elite-shipping-summary-line">
                    <span>Delivery Mode</span>
                    <strong>
                      {formData.deliveryMode === "express"
                        ? "Express"
                        : "Standard"}
                    </strong>
                  </div>

                  <div className="elite-shipping-summary-line">
                    <span>Estimated Delivery</span>
                    <strong>{estimatedDelivery}</strong>
                  </div>

                  <Alert variant="success" className="elite-shipping-alert">
                    <FaCheckCircle className="me-2" />
                    Your address is saved only after clicking Continue.
                  </Alert>
                </Card.Body>
              </Card>

              <Card className="elite-shipping-preview-card">
                <Card.Body>
                  <h4>
                    <FaMapMarkedAlt className="me-2" />
                    Address Preview
                  </h4>

                  {formData.fullName ||
                  formData.phone ||
                  formData.address ||
                  formData.city ? (
                    <div className="elite-shipping-address-preview">
                      <strong>{formData.fullName || "Full Name"}</strong>

                      <span>{formData.phone || "Phone number"}</span>

                      <p>
                        {[
                          formData.address,
                          formData.landmark,
                          formData.city,
                          formData.state,
                          formData.postalCode,
                          formData.country,
                        ]
                          .filter(Boolean)
                          .join(", ") || "Address preview will appear here."}
                      </p>

                      <Badge bg="primary">
                        {formData.addressType}
                      </Badge>
                    </div>
                  ) : (
                    <p className="elite-shipping-muted">
                      Start filling the form to preview your address.
                    </p>
                  )}
                </Card.Body>
              </Card>

              <Card className="elite-shipping-trust-card">
                <Card.Body>
                  <div>
                    <FaTruck />
                    <span>Fast Delivery</span>
                  </div>

                  <div>
                    <FaShieldAlt />
                    <span>Protected Order</span>
                  </div>

                  <div>
                    <FaLock />
                    <span>Secure Checkout</span>
                  </div>
                </Card.Body>
              </Card>
            </motion.div>
          </Col>
        </Row>
      </Container>
    </main>
  );
};

export default ShippingPage;