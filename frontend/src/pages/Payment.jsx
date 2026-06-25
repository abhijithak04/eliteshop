import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Form,
  Button,
  Card,
  Badge,
  Row,
  Col,
  Container,
  Alert,
} from "react-bootstrap";

import { useNavigate } from "react-router-dom";

import { motion } from "framer-motion";

import {
  FaArrowLeft,
  FaArrowRight,
  FaCheckCircle,
  FaCreditCard,
  FaLock,
  FaMoneyBillWave,
  FaQrcode,
  FaShieldAlt,
  FaTruck,
  FaUniversity,
  FaWallet,
  FaGift,
  FaBolt,
  FaRupeeSign,
  FaMapMarkerAlt,
  FaExclamationTriangle,
  FaShoppingCart,
  FaReceipt,
  FaMobileAlt,
} from "react-icons/fa";

import { toast } from "react-toastify";

import CheckoutSteps from "../components/CheckoutSteps";

import { useCart } from "../context/CartContext";

import "../styles/Payment.css";

const paymentOptions = [
  {
    id: "Razorpay",
    title: "Razorpay",
    badge: "Recommended",
    badgeVariant: "success",
    icon: <FaBolt />,
    iconClass: "razorpay",
    description:
      "Pay securely using UPI, Credit Card, Debit Card, Wallets or Net Banking.",
    tags: [
      {
        icon: <FaQrcode />,
        label: "UPI",
      },
      {
        icon: <FaCreditCard />,
        label: "Cards",
      },
      {
        icon: <FaWallet />,
        label: "Wallet",
      },
      {
        icon: <FaUniversity />,
        label: "Net Banking",
      },
    ],
  },
  {
    id: "COD",
    title: "Cash On Delivery",
    badge: "Pay Later",
    badgeVariant: "warning",
    icon: <FaMoneyBillWave />,
    iconClass: "cod",
    description:
      "Pay when the product arrives at your doorstep. Availability depends on seller and delivery area.",
    tags: [
      {
        icon: <FaTruck />,
        label: "Doorstep Pay",
      },
      {
        icon: <FaShieldAlt />,
        label: "Buyer Friendly",
      },
    ],
  },
];

const formatPrice = (value) => {
  return Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const PaymentPage = () => {
  const navigate = useNavigate();

  const {
    shippingAddress,
    paymentMethod: savedPaymentMethod,
    savePaymentMethod,
    cartItems = [],
    itemsPrice = 0,
    shippingPrice = 0,
    taxPrice = 0,
    totalPrice = 0,
  } = useCart();

  const [paymentMethod, setPaymentMethod] = useState(
    savedPaymentMethod || "Razorpay"
  );

  const selectedPayment = useMemo(() => {
    return (
      paymentOptions.find((option) => option.id === paymentMethod) ||
      paymentOptions[0]
    );
  }, [paymentMethod]);

  const totalItems = useMemo(() => {
    return cartItems.reduce(
      (acc, item) => acc + Number(item.qty || 0),
      0
    );
  }, [cartItems]);

  const hasShippingAddress = Boolean(
    shippingAddress?.address &&
      shippingAddress?.city &&
      shippingAddress?.postalCode
  );

  useEffect(() => {
    if (!cartItems.length) {
      toast.info("Your cart is empty");
      navigate("/cart", {
        replace: true,
      });
      return;
    }

    if (!hasShippingAddress) {
      toast.info("Please add shipping address first");
      navigate("/shipping", {
        replace: true,
      });
    }
  }, [
    cartItems.length,
    hasShippingAddress,
    navigate,
  ]);

  const submitHandler = (e) => {
    e.preventDefault();

    if (!cartItems.length) {
      toast.error("Your cart is empty");
      navigate("/cart");
      return;
    }

    if (!hasShippingAddress) {
      toast.error("Please add shipping address first");
      navigate("/shipping");
      return;
    }

    if (!paymentMethod) {
      toast.error("Please choose a payment method");
      return;
    }

    savePaymentMethod(paymentMethod);

    toast.success(`${paymentMethod} selected`);
    navigate("/placeorder");
  };

  return (
    <main className="elite-payment-page">
      <Container fluid="xl">
        <motion.section
          className="elite-payment-hero"
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
              className="elite-payment-hero-badge"
            >
              <FaLock className="me-2" />
              Secure Payment
            </Badge>

            <h1>Choose Payment</h1>

            <p>
              Select your preferred payment method. You will review your order
              before final confirmation.
            </p>
          </div>

          <div className="elite-payment-hero-actions">
            <Button
              variant="light"
              onClick={() => navigate("/shipping")}
            >
              <FaArrowLeft className="me-2" />
              Back To Shipping
            </Button>

            <Button
              variant="outline-light"
              onClick={() => navigate("/cart")}
            >
              <FaShoppingCart className="me-2" />
              View Cart
            </Button>
          </div>

          <motion.div
            className="elite-payment-floating-badge"
            animate={{
              y: [0, -10, 0],
            }}
            transition={{
              duration: 3.5,
              repeat: Infinity,
            }}
          >
            <FaShieldAlt />
            Protected
          </motion.div>
        </motion.section>

        <div className="elite-payment-steps">
          <CheckoutSteps step1 step2 step3 />
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
              <Card className="elite-payment-card">
                <Card.Body>
                  <div className="elite-payment-card-heading">
                    <div>
                      <h2>
                        <FaCreditCard className="me-2" />
                        Payment Method
                      </h2>

                      <p>
                        Pick one payment option. Razorpay supports UPI, cards,
                        wallets and net banking.
                      </p>
                    </div>

                    <Badge bg="success">
                      <FaCheckCircle className="me-1" />
                      Safe Checkout
                    </Badge>
                  </div>

                  {!hasShippingAddress && (
                    <Alert variant="warning" className="elite-payment-alert">
                      <FaExclamationTriangle className="me-2" />
                      Shipping address is missing. Please go back and add your
                      delivery address.
                    </Alert>
                  )}

                  <Form onSubmit={submitHandler}>
                    <div className="elite-payment-options">
                      {paymentOptions.map((option) => (
                        <label
                          key={option.id}
                          className={
                            paymentMethod === option.id
                              ? `elite-payment-option active ${option.iconClass}`
                              : `elite-payment-option ${option.iconClass}`
                          }
                        >
                          <input
                            type="radio"
                            name="paymentMethod"
                            value={option.id}
                            checked={paymentMethod === option.id}
                            onChange={(e) =>
                              setPaymentMethod(e.target.value)
                            }
                          />

                          <div
                            className={`elite-payment-option-icon ${option.iconClass}`}
                          >
                            {option.icon}
                          </div>

                          <div className="elite-payment-option-content">
                            <div>
                              <h4>{option.title}</h4>

                              <Badge
                                bg={option.badgeVariant}
                                text={
                                  option.badgeVariant === "warning"
                                    ? "dark"
                                    : undefined
                                }
                              >
                                {option.badge}
                              </Badge>
                            </div>

                            <p>{option.description}</p>

                            <div className="elite-payment-tags">
                              {option.tags.map((tag) => (
                                <span key={tag.label}>
                                  {tag.icon}
                                  {tag.label}
                                </span>
                              ))}
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>

                    <div className="elite-payment-selected-box">
                      <div>
                        <span>Selected Method</span>
                        <strong>{selectedPayment.title}</strong>
                      </div>

                      <Badge
                        bg={
                          selectedPayment.id === "COD"
                            ? "warning"
                            : "success"
                        }
                        text={
                          selectedPayment.id === "COD"
                            ? "dark"
                            : undefined
                        }
                      >
                        {selectedPayment.id === "COD"
                          ? "Pay on delivery"
                          : "Online secure payment"}
                      </Badge>
                    </div>

                    {paymentMethod === "Razorpay" ? (
                      <Alert variant="info" className="elite-payment-alert">
                        <FaShieldAlt className="me-2" />
                        Razorpay order should be created securely from backend
                        during final order placement.
                      </Alert>
                    ) : (
                      <Alert variant="warning" className="elite-payment-alert">
                        <FaMoneyBillWave className="me-2" />
                        Cash on Delivery will create the order directly and mark
                        payment as pending.
                      </Alert>
                    )}

                    <div className="elite-payment-actions">
                      <Button
                        type="button"
                        variant="outline-dark"
                        onClick={() => navigate("/shipping")}
                      >
                        <FaArrowLeft className="me-2" />
                        Back
                      </Button>

                      <Button
                        type="submit"
                        className="elite-payment-submit-btn"
                      >
                        Continue To Review Order
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
              className="elite-payment-side-stack"
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
              <Card className="elite-payment-summary-card">
                <Card.Header>
                  <FaGift className="me-2" />
                  Order Summary
                </Card.Header>

                <Card.Body>
                  <div className="elite-payment-summary-line">
                    <span>Items</span>
                    <strong>{totalItems}</strong>
                  </div>

                  <div className="elite-payment-summary-line">
                    <span>Items Price</span>
                    <strong>₹{formatPrice(itemsPrice)}</strong>
                  </div>

                  <div className="elite-payment-summary-line">
                    <span>Shipping</span>
                    <strong>
                      {Number(shippingPrice || 0) === 0
                        ? "Free"
                        : `₹${formatPrice(shippingPrice)}`}
                    </strong>
                  </div>

                  <div className="elite-payment-summary-line">
                    <span>Tax</span>
                    <strong>₹{formatPrice(taxPrice)}</strong>
                  </div>

                  <div className="elite-payment-total-line">
                    <span>Total</span>
                    <strong>
                      <FaRupeeSign />
                      {formatPrice(totalPrice)}
                    </strong>
                  </div>
                </Card.Body>
              </Card>

              <Card className="elite-payment-address-card">
                <Card.Body>
                  <h4>
                    <FaMapMarkerAlt className="me-2" />
                    Deliver To
                  </h4>

                  {hasShippingAddress ? (
                    <>
                      <strong>{shippingAddress?.fullName}</strong>

                      <span>{shippingAddress?.phone}</span>

                      <p>
                        {[
                          shippingAddress?.address,
                          shippingAddress?.landmark,
                          shippingAddress?.city,
                          shippingAddress?.state,
                          shippingAddress?.postalCode,
                          shippingAddress?.country,
                        ]
                          .filter(Boolean)
                          .join(", ")}
                      </p>

                      <Button
                        variant="outline-dark"
                        size="sm"
                        onClick={() => navigate("/shipping")}
                      >
                        Change Address
                      </Button>
                    </>
                  ) : (
                    <>
                      <p>No shipping address found.</p>

                      <Button
                        variant="dark"
                        size="sm"
                        onClick={() => navigate("/shipping")}
                      >
                        Add Address
                      </Button>
                    </>
                  )}
                </Card.Body>
              </Card>

              <Card className="elite-payment-method-preview-card">
                <Card.Body>
                  <div className="elite-payment-preview-icon">
                    {selectedPayment.id === "COD" ? (
                      <FaMoneyBillWave />
                    ) : (
                      <FaMobileAlt />
                    )}
                  </div>

                  <div>
                    <span>Payment Ready</span>
                    <strong>{selectedPayment.title}</strong>
                    <small>
                      {selectedPayment.id === "COD"
                        ? "Pay after delivery confirmation"
                        : "UPI, cards, wallet and net banking"}
                    </small>
                  </div>
                </Card.Body>
              </Card>

              <Card className="elite-payment-trust-card">
                <Card.Body>
                  <div>
                    <FaLock />
                    <span>Encrypted Checkout</span>
                  </div>

                  <div>
                    <FaShieldAlt />
                    <span>Protected Payment</span>
                  </div>

                  <div>
                    <FaTruck />
                    <span>Delivery Tracking</span>
                  </div>

                  <div>
                    <FaReceipt />
                    <span>Order Invoice Ready</span>
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

export default PaymentPage;