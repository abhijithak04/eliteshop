import { useState } from "react";

import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Badge,
} from "react-bootstrap";

import { Link } from "react-router-dom";

import { motion } from "framer-motion";

import { toast } from "react-toastify";

import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedinIn,
  FaYoutube,
  FaShoppingBag,
  FaTruck,
  FaShieldAlt,
  FaHeadset,
  FaStore,
  FaEnvelope,
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaHeart,
  FaArrowRight,
  FaRocket,
  FaCreditCard,
  FaUndoAlt,
  FaBoxOpen,
  FaUserShield,
  FaBell,
  FaGift,
  FaCrown,
} from "react-icons/fa";

import "../styles/Footer.css";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const [email, setEmail] = useState("");

  const submitNewsletter = (e) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("Please enter your email");
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      toast.error("Please enter a valid email");
      return;
    }

    toast.success("Subscribed successfully");
    setEmail("");
  };

  return (
    <footer className="elite-footer">
      <section className="elite-footer-service-strip">
        <Container fluid="xl">
          <Row className="g-3">
            <Col lg={3} sm={6}>
              <ServiceCard
                icon={<FaTruck />}
                title="Fast Delivery"
                text="Quick shipping on selected products"
              />
            </Col>

            <Col lg={3} sm={6}>
              <ServiceCard
                icon={<FaShieldAlt />}
                title="Secure Checkout"
                text="Protected payments and account safety"
              />
            </Col>

            <Col lg={3} sm={6}>
              <ServiceCard
                icon={<FaUndoAlt />}
                title="Easy Returns"
                text="Smooth return and replacement support"
              />
            </Col>

            <Col lg={3} sm={6}>
              <ServiceCard
                icon={<FaHeadset />}
                title="Customer Support"
                text="Help when you need it"
              />
            </Col>
          </Row>
        </Container>
      </section>

      <section className="elite-footer-main">
        <Container fluid="xl">
          <Row className="g-4">
            <Col lg={4} md={6}>
              <motion.div
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                }}
                viewport={{
                  once: true,
                }}
                transition={{
                  duration: 0.45,
                }}
                className="elite-footer-brand-box"
              >
                <Link
                  to="/"
                  className="elite-footer-logo"
                >
                  <span>
                    <FaCrown />
                  </span>
                  ELITE<span>SHOP</span>
                </Link>

                <p>
                  EliteShop is a modern ecommerce platform for quality products,
                  secure checkout, seller growth, fast delivery and a smooth
                  shopping experience.
                </p>

                <div className="elite-footer-badges">
                  <Badge bg="warning" text="dark">
                    <FaGift className="me-1" />
                    Offers
                  </Badge>

                  <Badge bg="success">
                    <FaShieldAlt className="me-1" />
                    Secure
                  </Badge>

                  <Badge bg="primary">
                    <FaTruck className="me-1" />
                    Fast
                  </Badge>
                </div>

                <div className="elite-footer-socials">
                  <a href="#" aria-label="Facebook">
                    <FaFacebookF />
                  </a>

                  <a href="#" aria-label="Twitter">
                    <FaTwitter />
                  </a>

                  <a href="#" aria-label="Instagram">
                    <FaInstagram />
                  </a>

                  <a href="#" aria-label="LinkedIn">
                    <FaLinkedinIn />
                  </a>

                  <a href="#" aria-label="YouTube">
                    <FaYoutube />
                  </a>
                </div>
              </motion.div>
            </Col>

            <Col lg={2} md={6}>
              <FooterLinks
                delay={0.1}
                title="Shop"
                links={[
                  {
                    label: "All Products",
                    to: "/products",
                    icon: <FaBoxOpen />,
                  },
                  {
                    label: "New Arrivals",
                    to: "/products?sort=latest",
                    icon: <FaRocket />,
                  },
                  {
                    label: "Top Offers",
                    to: "/products?featured=true",
                    icon: <FaGift />,
                  },
                  {
                    label: "Wishlist",
                    to: "/wishlist",
                    icon: <FaHeart />,
                  },
                  {
                    label: "Cart",
                    to: "/cart",
                    icon: <FaShoppingBag />,
                  },
                ]}
              />
            </Col>

            <Col lg={2} md={6}>
              <FooterLinks
                delay={0.2}
                title="Account"
                links={[
                  {
                    label: "Login",
                    to: "/login",
                    icon: <FaUserShield />,
                  },
                  {
                    label: "Register",
                    to: "/register",
                    icon: <FaRocket />,
                  },
                  {
                    label: "My Orders",
                    to: "/orders",
                    icon: <FaTruck />,
                  },
                  {
                    label: "Notifications",
                    to: "/notifications",
                    icon: <FaBell />,
                  },
                  {
                    label: "Profile",
                    to: "/profile",
                    icon: <FaUserShield />,
                  },
                ]}
              />
            </Col>

            <Col lg={2} md={6}>
              <FooterLinks
                delay={0.3}
                title="Seller"
                links={[
                  {
                    label: "Seller Login",
                    to: "/seller/login",
                    icon: <FaStore />,
                  },
                  {
                    label: "Start Selling",
                    to: "/seller/register",
                    icon: <FaRocket />,
                  },
                  {
                    label: "Seller Dashboard",
                    to: "/seller/dashboard",
                    icon: <FaShoppingBag />,
                  },
                  {
                    label: "Seller Analytics",
                    to: "/seller/analytics",
                    icon: <FaUserShield />,
                  },
                  {
                    label: "Support",
                    to: "/support",
                    icon: <FaHeadset />,
                  },
                ]}
              />
            </Col>

            <Col lg={2} md={6}>
              <motion.div
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                }}
                viewport={{
                  once: true,
                }}
                transition={{
                  duration: 0.45,
                  delay: 0.4,
                }}
                className="elite-footer-contact"
              >
                <h5>Contact</h5>

                <p>
                  <FaMapMarkerAlt />
                  Kerala, India
                </p>

                <p>
                  <FaPhoneAlt />
                  +91 98765 43210
                </p>

                <p>
                  <FaEnvelope />
                  support@eliteshop.com
                </p>

                <Link
                  to="/support"
                  className="elite-footer-support-btn"
                >
                  Get Support
                  <FaArrowRight />
                </Link>
              </motion.div>
            </Col>
          </Row>

          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={{
              once: true,
            }}
            transition={{
              duration: 0.45,
              delay: 0.2,
            }}
            className="elite-footer-newsletter"
          >
            <div>
              <Badge bg="warning" text="dark">
                Newsletter
              </Badge>

              <h4>Get new offers before everyone else.</h4>

              <p>
                Subscribe for product drops, coupons, seller updates and
                EliteShop announcements.
              </p>
            </div>

            <Form
              onSubmit={submitNewsletter}
              className="elite-footer-newsletter-form"
            >
              <div>
                <FaEnvelope />

                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                />
              </div>

              <Button type="submit">
                Subscribe
                <FaArrowRight />
              </Button>
            </Form>
          </motion.div>

          <div className="elite-footer-payments">
            <span>
              <FaCreditCard />
              Payments: UPI • Cards • NetBanking • COD
            </span>

            <span>
              <FaShieldAlt />
              Buyer protection enabled
            </span>

            <span>
              <FaStore />
              Verified seller ecosystem
            </span>
          </div>

          <div className="elite-footer-bottom">
            <p>
              &copy; {currentYear} EliteShop. All rights reserved.
            </p>

            <p>
              Built with <FaHeart /> using React, Vite, Node.js and MongoDB.
            </p>
          </div>
        </Container>
      </section>
    </footer>
  );
};

const ServiceCard = ({
  icon,
  title,
  text,
}) => (
  <motion.div
    initial={{
      opacity: 0,
      y: 15,
    }}
    whileInView={{
      opacity: 1,
      y: 0,
    }}
    viewport={{
      once: true,
    }}
    transition={{
      duration: 0.35,
    }}
    className="elite-footer-service-card"
  >
    <div>{icon}</div>

    <span>
      <strong>{title}</strong>
      <small>{text}</small>
    </span>
  </motion.div>
);

const FooterLinks = ({
  title,
  links,
  delay = 0,
}) => (
  <motion.div
    initial={{
      opacity: 0,
      y: 20,
    }}
    whileInView={{
      opacity: 1,
      y: 0,
    }}
    viewport={{
      once: true,
    }}
    transition={{
      duration: 0.45,
      delay,
    }}
    className="elite-footer-links"
  >
    <h5>{title}</h5>

    <ul>
      {links.map((link) => (
        <li key={link.label}>
          <Link to={link.to}>
            {link.icon}
            {link.label}
          </Link>
        </li>
      ))}
    </ul>
  </motion.div>
);

export default Footer;