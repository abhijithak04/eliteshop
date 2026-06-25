import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Badge,
} from "react-bootstrap";

import {
  FaBullhorn,
  FaStore,
  FaChartLine,
  FaRocket,
  FaArrowLeft,
  FaShoppingBag,
} from "react-icons/fa";

import { useNavigate } from "react-router-dom";

const Advertise = () => {
  const navigate = useNavigate();

  return (
    <main className="py-5">
      <Container>
        <section
          className="p-4 p-md-5 rounded-4 shadow-lg text-white mb-4"
          style={{
            background:
              "radial-gradient(circle at top right, rgba(250,204,21,.22), transparent 28%), linear-gradient(135deg, #020617, #172554 45%, #7c3aed)",
          }}
        >
          <Badge
            bg="warning"
            text="dark"
            className="rounded-pill px-3 py-2 fw-bold mb-3"
          >
            <FaBullhorn className="me-2" />
            Advertise With EliteShop
          </Badge>

          <h1 className="fw-bold display-5 mb-3">
            Grow your business with EliteShop
          </h1>

          <p
            className="mb-4"
            style={{
              color: "rgba(255,255,255,.82)",
              maxWidth: "760px",
              fontWeight: 600,
            }}
          >
            Promote products, seller stores, deals and seasonal campaigns to EliteShop customers.
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
              onClick={() => navigate("/seller/register")}
            >
              <FaStore className="me-2" />
              Become Seller
            </Button>
          </div>
        </section>

        <Row className="g-4">
          <Col md={4}>
            <AdvertiseCard
              icon={<FaStore />}
              title="Seller Promotion"
              text="Highlight your store and increase buyer trust."
              color="text-primary"
            />
          </Col>

          <Col md={4}>
            <AdvertiseCard
              icon={<FaChartLine />}
              title="Product Ads"
              text="Boost product visibility across EliteShop pages."
              color="text-success"
            />
          </Col>

          <Col md={4}>
            <AdvertiseCard
              icon={<FaRocket />}
              title="Campaigns"
              text="Run seasonal deals, offers and flash campaigns."
              color="text-danger"
            />
          </Col>
        </Row>

        <Card className="border-0 rounded-4 shadow-sm mt-4">
          <Card.Body className="p-4 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
            <div>
              <h4 className="fw-bold mb-1">
                Ready to promote your products?
              </h4>

              <p className="text-muted mb-0">
                Register as a seller and start building your EliteShop business.
              </p>
            </div>

            <Button
              variant="dark"
              className="rounded-pill fw-bold px-4"
              onClick={() => navigate("/seller/register")}
            >
              <FaShoppingBag className="me-2" />
              Start Selling
            </Button>
          </Card.Body>
        </Card>
      </Container>
    </main>
  );
};

const AdvertiseCard = ({
  icon,
  title,
  text,
  color,
}) => {
  return (
    <Card className="border-0 rounded-4 shadow-sm h-100">
      <Card.Body className="p-4">
        <div className={`fs-2 mb-3 ${color}`}>
          {icon}
        </div>

        <h4 className="fw-bold">
          {title}
        </h4>

        <p className="text-muted mb-0">
          {text}
        </p>
      </Card.Body>
    </Card>
  );
};

export default Advertise;