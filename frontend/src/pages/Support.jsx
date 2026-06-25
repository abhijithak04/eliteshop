import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Badge,
  Form,
} from "react-bootstrap";

import {
  FaHeadset,
  FaEnvelope,
  FaPhoneAlt,
  FaShoppingBag,
  FaTruck,
  FaUndo,
  FaShieldAlt,
  FaComments,
  FaArrowLeft,
} from "react-icons/fa";

import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const Support = () => {
  const navigate = useNavigate();

  const submitHandler = (e) => {
    e.preventDefault();
    toast.success("Support request submitted. Backend support ticket can be added later.");
  };

  return (
    <main className="py-5">
      <Container>
        <section
          className="p-4 p-md-5 rounded-4 shadow-lg text-white mb-4"
          style={{
            background:
              "radial-gradient(circle at top right, rgba(250,204,21,.22), transparent 28%), linear-gradient(135deg, #020617, #172554 45%, #2563eb)",
          }}
        >
          <Badge
            bg="warning"
            text="dark"
            className="rounded-pill px-3 py-2 fw-bold mb-3"
          >
            <FaHeadset className="me-2" />
            EliteShop Support
          </Badge>

          <h1 className="fw-bold display-5 mb-3">
            24/7 Customer Support
          </h1>

          <p
            className="mb-4"
            style={{
              color: "rgba(255,255,255,.82)",
              maxWidth: "760px",
              fontWeight: 600,
            }}
          >
            Need help with orders, delivery, payment, returns or seller issues?
            EliteShop support is ready to help you.
          </p>

          <div className="d-flex gap-2 flex-wrap">
            <Button
              variant="light"
              className="rounded-pill fw-bold px-4"
              onClick={() => navigate(-1)}
            >
              <FaArrowLeft className="me-2" />
              Go Back
            </Button>

            <Button
              variant="outline-light"
              className="rounded-pill fw-bold px-4"
              onClick={() => navigate("/orders")}
            >
              <FaShoppingBag className="me-2" />
              My Orders
            </Button>
          </div>
        </section>

        <Row className="g-4">
          <Col lg={8}>
            <Card className="border-0 rounded-4 shadow-sm">
              <Card.Body className="p-4">
                <h3 className="fw-bold mb-2">
                  Contact Support
                </h3>

                <p className="text-muted fw-semibold">
                  Submit your issue. Later you can connect this form to backend support tickets.
                </p>

                <Form onSubmit={submitHandler}>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-bold">
                          Name
                        </Form.Label>

                        <Form.Control
                          type="text"
                          placeholder="Enter your name"
                          required
                        />
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-bold">
                          Email
                        </Form.Label>

                        <Form.Control
                          type="email"
                          placeholder="Enter your email"
                          required
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">
                      Issue Type
                    </Form.Label>

                    <Form.Select required>
                      <option value="">Select issue type</option>
                      <option>Order Issue</option>
                      <option>Payment Issue</option>
                      <option>Delivery Issue</option>
                      <option>Return / Refund</option>
                      <option>Seller Support</option>
                      <option>Account Support</option>
                    </Form.Select>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">
                      Message
                    </Form.Label>

                    <Form.Control
                      as="textarea"
                      rows={4}
                      placeholder="Explain your issue..."
                      required
                    />
                  </Form.Group>

                  <Button
                    type="submit"
                    variant="dark"
                    className="rounded-pill fw-bold px-4"
                  >
                    <FaComments className="me-2" />
                    Submit Request
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={4}>
            <div className="d-grid gap-3">
              <SupportCard
                icon={<FaEnvelope />}
                title="Email Support"
                text="support@eliteshop.com"
                color="text-primary"
              />

              <SupportCard
                icon={<FaPhoneAlt />}
                title="Phone Support"
                text="+91 98765 43210"
                color="text-success"
              />

              <SupportCard
                icon={<FaTruck />}
                title="Delivery Help"
                text="Track delayed or missing deliveries."
                color="text-warning"
              />

              <SupportCard
                icon={<FaUndo />}
                title="Returns"
                text="Request returns and refund assistance."
                color="text-danger"
              />

              <SupportCard
                icon={<FaShieldAlt />}
                title="Buyer Protection"
                text="Secure shopping and payment support."
                color="text-info"
              />
            </div>
          </Col>
        </Row>
      </Container>
    </main>
  );
};

const SupportCard = ({
  icon,
  title,
  text,
  color,
}) => {
  return (
    <Card className="border-0 rounded-4 shadow-sm">
      <Card.Body className="p-4">
        <div className={`fs-3 mb-2 ${color}`}>
          {icon}
        </div>

        <h5 className="fw-bold">
          {title}
        </h5>

        <p className="text-muted mb-0">
          {text}
        </p>
      </Card.Body>
    </Card>
  );
};

export default Support;