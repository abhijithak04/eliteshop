"use client"

import { Container, Row, Col, Button } from "react-bootstrap"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { FaArrowRight } from "react-icons/fa"

const Hero = () => {
  return (
    <section className="hero-section">
      <Container>
        <Row className="align-items-center">
          <Col lg={6}>
            <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
              <h1 className="display-4 fw-bold mb-4">
                Welcome to <span className="gradient-text">ProShop</span>
              </h1>
              <p className="lead mb-4">
                Discover the latest electronics and gadgets at unbeatable prices. From smartphones to smart home
                devices, we have everything you need to stay connected and productive.
              </p>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button as={Link} to="/products" size="lg" className="btn-gradient me-3">
                  Shop Now <FaArrowRight className="ms-2" />
                </Button>
              </motion.div>
            </motion.div>
          </Col>
          <Col lg={6}>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-center"
            >
              <img
                src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
                alt="Electronics Store"
                className="img-fluid rounded shadow-lg"
                style={{ maxHeight: "400px", objectFit: "cover" }}
              />
            </motion.div>
          </Col>
        </Row>
      </Container>
    </section>
  )
}

export default Hero
