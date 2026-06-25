"use client"

import { useState } from "react"
import { Container, Row, Col, Form, Button, Alert } from "react-bootstrap"
import { motion } from "framer-motion"
import { FaEnvelope } from "react-icons/fa"

const Newsletter = () => {
  const [email, setEmail] = useState("")
  const [subscribed, setSubscribed] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    // Here you would typically send the email to your backend
    setSubscribed(true)
    setEmail("")
    setTimeout(() => setSubscribed(false), 5000)
  }

  return (
    <section className="py-5 bg-light">
      <Container>
        <Row className="justify-content-center">
          <Col lg={8}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <FaEnvelope className="text-primary mb-3" size={48} />
              <h3 className="fw-bold mb-3">Stay Updated</h3>
              <p className="lead mb-4">
                Subscribe to our newsletter and be the first to know about new products, exclusive deals, and special
                offers.
              </p>

              {subscribed && (
                <Alert variant="success" className="mb-4">
                  Thank you for subscribing! Check your email for confirmation.
                </Alert>
              )}

              <Form onSubmit={handleSubmit} className="d-flex gap-2 justify-content-center">
                <Form.Control
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{ maxWidth: "300px" }}
                />
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button type="submit" className="btn-gradient">
                    Subscribe
                  </Button>
                </motion.div>
              </Form>
            </motion.div>
          </Col>
        </Row>
      </Container>
    </section>
  )
}

export default Newsletter
