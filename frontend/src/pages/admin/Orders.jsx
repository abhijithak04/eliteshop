import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Table,
  Button,
  Card,
  Badge,
  Row,
  Col,
  Modal,
  Form,
  ListGroup,
  Image,
  InputGroup,
  Spinner,
  Alert,
} from "react-bootstrap";

import {
  FaSearch,
  FaEye,
  FaTruck,
  FaCheckCircle,
  FaTimesCircle,
  FaBoxOpen,
  FaRupeeSign,
  FaClipboardList,
  FaSyncAlt,
  FaReceipt,
  FaUser,
  FaEnvelope,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaCreditCard,
  FaMoneyBillWave,
  FaFilter,
  FaShippingFast,
  FaShieldAlt,
  FaRoute,
  FaCalendarAlt,
  FaStore,
  FaUndo,
} from "react-icons/fa";

import { Link } from "react-router-dom";

import { motion } from "framer-motion";

import { toast } from "react-toastify";

import Loader from "../../components/Loader";
import Message from "../../components/Message";

import axios from "../../utils/axios";

import "../../styles/AdminOrders.css";

const statusOptions = [
  "Pending",
  "Confirmed",
  "Processing",
  "Packed",
  "Shipped",
  "Out For Delivery",
  "Delivered",
  "Cancelled",
  "Returned",
];

const formatPrice = (value) => {
  return Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const formatDate = (date) => {
  if (!date) return "N/A";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const getStatusBadge = (status) => {
  switch (status) {
    case "Delivered":
      return "success";

    case "Cancelled":
    case "Returned":
      return "danger";

    case "Shipped":
    case "Out For Delivery":
      return "primary";

    case "Packed":
    case "Processing":
      return "warning";

    case "Confirmed":
      return "success";

    case "Pending":
    default:
      return "secondary";
  }
};

const getStatusProgress = (status) => {
  const map = {
    Pending: 10,
    Confirmed: 25,
    Processing: 40,
    Packed: 55,
    Shipped: 72,
    "Out For Delivery": 88,
    Delivered: 100,
    Cancelled: 100,
    Returned: 100,
  };

  return map[status] || 10;
};

const isClosedOrder = (order) => {
  return ["Cancelled", "Delivered", "Returned"].includes(
    order?.orderStatus
  );
};

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const [selectedOrder, setSelectedOrder] = useState(null);

  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);

  const [updating, setUpdating] = useState(false);

  const [statusForm, setStatusForm] = useState({
    status: "Pending",
    trackingNumber: "",
    courierService: "",
  });

  const fetchOrders = async (silent = false) => {
    try {
      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const { data } = await axios.get("/orders");

      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch orders"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const stats = useMemo(() => {
    const totalOrders = orders.length;

    const paidOrders = orders.filter((order) => order.isPaid);

    const totalRevenue = paidOrders.reduce(
      (acc, order) => acc + Number(order.totalPrice || 0),
      0
    );

    const pendingOrders = orders.filter((order) =>
      ["Pending", "Confirmed", "Processing", "Packed"].includes(
        order.orderStatus
      )
    ).length;

    const shippedOrders = orders.filter((order) =>
      ["Shipped", "Out For Delivery"].includes(order.orderStatus)
    ).length;

    const deliveredOrders = orders.filter(
      (order) =>
        order.isDelivered ||
        order.orderStatus === "Delivered"
    ).length;

    const cancelledOrders = orders.filter(
      (order) => order.orderStatus === "Cancelled"
    ).length;

    return {
      totalOrders,
      totalRevenue,
      paidOrders: paidOrders.length,
      pendingOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
    };
  }, [orders]);

  const filteredOrders = useMemo(() => {
    const search = searchTerm.toLowerCase();

    let result = orders.filter((order) => {
      const matchesSearch =
        order._id?.toLowerCase().includes(search) ||
        order.user?.name?.toLowerCase().includes(search) ||
        order.user?.email?.toLowerCase().includes(search) ||
        order.orderStatus?.toLowerCase().includes(search) ||
        order.paymentMethod?.toLowerCase().includes(search) ||
        order.trackingNumber?.toLowerCase().includes(search) ||
        order.courierService?.toLowerCase().includes(search);

      const matchesStatus =
        statusFilter === "all" ||
        order.orderStatus === statusFilter;

      const matchesPayment =
        paymentFilter === "all" ||
        (paymentFilter === "paid" && order.isPaid) ||
        (paymentFilter === "unpaid" && !order.isPaid) ||
        order.paymentMethod === paymentFilter;

      return matchesSearch && matchesStatus && matchesPayment;
    });

    result.sort((a, b) => {
      if (sortBy === "oldest") {
        return new Date(a.createdAt) - new Date(b.createdAt);
      }

      if (sortBy === "highest") {
        return Number(b.totalPrice || 0) - Number(a.totalPrice || 0);
      }

      if (sortBy === "lowest") {
        return Number(a.totalPrice || 0) - Number(b.totalPrice || 0);
      }

      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    return result;
  }, [
    orders,
    searchTerm,
    statusFilter,
    paymentFilter,
    sortBy,
  ]);

  const viewOrderHandler = (order) => {
    setSelectedOrder(order);
    setShowDetailsModal(true);
  };

  const openStatusModal = (order) => {
    setSelectedOrder(order);

    setStatusForm({
      status: order.orderStatus || "Pending",
      trackingNumber: order.trackingNumber || "",
      courierService: order.courierService || "",
    });

    setShowStatusModal(true);
  };

  const changeStatusHandler = (e) => {
    const { name, value } = e.target;

    setStatusForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const updateStatusHandler = async (e) => {
    e.preventDefault();

    if (!selectedOrder) return;

    try {
      setUpdating(true);

      await axios.put(`/orders/${selectedOrder._id}/status`, {
        status: statusForm.status,
        trackingNumber: statusForm.trackingNumber,
        courierService: statusForm.courierService,
      });

      toast.success("Order status updated successfully");

      setShowStatusModal(false);

      fetchOrders(true);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to update order status"
      );
    } finally {
      setUpdating(false);
    }
  };

  const markDeliveredHandler = async (order) => {
    if (order.orderStatus === "Cancelled") {
      toast.error("Cancelled order cannot be delivered");
      return;
    }

    if (!window.confirm("Mark this order as delivered?")) {
      return;
    }

    try {
      setUpdating(true);

      await axios.put(`/orders/${order._id}/deliver`);

      toast.success("Order marked as delivered");

      fetchOrders(true);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to mark delivered"
      );
    } finally {
      setUpdating(false);
    }
  };

  const cancelOrderHandler = async (order) => {
    if (order.isDelivered || order.orderStatus === "Delivered") {
      toast.error("Delivered order cannot be cancelled");
      return;
    }

    if (order.orderStatus === "Cancelled") {
      toast.error("Order already cancelled");
      return;
    }

    if (
      !window.confirm(
        "Cancel this order? Stock will be restored."
      )
    ) {
      return;
    }

    try {
      setUpdating(true);

      await axios.put(`/orders/${order._id}/cancel`, {
        reason: "Cancelled by admin",
      });

      toast.success("Order cancelled successfully");

      fetchOrders(true);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to cancel order"
      );
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return (
      <main className="elite-admin-orders-page">
        <Message variant="danger">{error}</Message>

        <Button
          variant="dark"
          className="rounded-pill fw-bold mt-3"
          onClick={() => fetchOrders()}
        >
          Retry
        </Button>
      </main>
    );
  }

  return (
    <main className="elite-admin-orders-page">
      <motion.section
        className="elite-admin-orders-hero"
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
        <div>
          <Badge
            bg="warning"
            text="dark"
            className="elite-admin-orders-hero-badge"
          >
            <FaReceipt className="me-2" />
            EliteShop Order Command
          </Badge>

          <h1>Manage Orders</h1>

          <p>
            Track payments, Razorpay/COD orders, delivery progress,
            courier service, tracking number, customer details and
            cancellation status from one admin panel.
          </p>
        </div>

        <div className="elite-admin-orders-hero-actions">
          <Button
            variant="light"
            as={Link}
            to="/admin/dashboard"
          >
            Admin Dashboard
          </Button>

          <Button
            variant="outline-light"
            disabled={refreshing}
            onClick={() => fetchOrders(true)}
          >
            <FaSyncAlt className="me-2" />
            {refreshing ? "Refreshing..." : "Refresh"}
          </Button>
        </div>

        <motion.div
          className="elite-admin-orders-floating-badge"
          animate={{
            y: [0, -10, 0],
          }}
          transition={{
            duration: 3.5,
            repeat: Infinity,
          }}
        >
          <FaTruck />
          Live Order Control
        </motion.div>
      </motion.section>

      <Row className="g-4 mb-4">
        <Col md={6} xl={3}>
          <Card className="elite-admin-order-stat total">
            <Card.Body>
              <FaClipboardList />
              <span>Total Orders</span>
              <h2>{stats.totalOrders}</h2>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} xl={3}>
          <Card className="elite-admin-order-stat revenue">
            <Card.Body>
              <FaRupeeSign />
              <span>Paid Revenue</span>
              <h2>₹{formatPrice(stats.totalRevenue)}</h2>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} xl={3}>
          <Card className="elite-admin-order-stat active">
            <Card.Body>
              <FaBoxOpen />
              <span>Active Orders</span>
              <h2>{stats.pendingOrders}</h2>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} xl={3}>
          <Card className="elite-admin-order-stat delivered">
            <Card.Body>
              <FaTruck />
              <span>Delivered</span>
              <h2>{stats.deliveredOrders}</h2>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="elite-admin-orders-filter-card">
        <Card.Body>
          <Row className="g-3 align-items-center">
            <Col lg={4}>
              <InputGroup className="elite-admin-orders-search">
                <InputGroup.Text>
                  <FaSearch />
                </InputGroup.Text>

                <Form.Control
                  type="text"
                  placeholder="Search order, customer, email, tracking..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Col>

            <Col md={4} lg={2}>
              <Form.Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>

                {statusOptions.map((status) => (
                  <option
                    key={status}
                    value={status}
                  >
                    {status}
                  </option>
                ))}
              </Form.Select>
            </Col>

            <Col md={4} lg={2}>
              <Form.Select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
              >
                <option value="all">All Payments</option>
                <option value="paid">Paid</option>
                <option value="unpaid">Unpaid</option>
                <option value="Razorpay">Razorpay</option>
                <option value="COD">COD</option>
              </Form.Select>
            </Col>

            <Col md={4} lg={2}>
              <Form.Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="highest">Highest Amount</option>
                <option value="lowest">Lowest Amount</option>
              </Form.Select>
            </Col>

            <Col lg={2}>
              <Button
                className="elite-admin-orders-refresh-btn"
                disabled={refreshing}
                onClick={() => fetchOrders(true)}
              >
                <FaFilter className="me-2" />
                Apply
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <div className="elite-admin-orders-active-filter">
        <span>
          <FaFilter />
          Showing:
        </span>

        <Badge bg="primary">{filteredOrders.length} order(s)</Badge>
        <Badge bg="success">{stats.paidOrders} paid</Badge>
        <Badge bg="warning" text="dark">{stats.shippedOrders} shipping</Badge>
        <Badge bg="danger">{stats.cancelledOrders} cancelled</Badge>
      </div>

      <Card className="elite-admin-orders-table-card">
        <Card.Body>
          <div className="elite-admin-orders-section-heading">
            <div>
              <h4>Orders List</h4>
              <p>
                Manage payment, delivery, tracking and customer order
                status.
              </p>
            </div>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="elite-admin-orders-empty">
              <FaReceipt />
              <h4>No orders found</h4>
              <p>Try changing your filters or search keyword.</p>
            </div>
          ) : (
            <Table
              responsive
              hover
              className="elite-admin-orders-table"
            >
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Delivery</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order._id}>
                    <td>
                      <div className="elite-admin-order-id">
                        <FaReceipt />
                        <div>
                          <strong>
                            #{order._id?.slice(-10)}
                          </strong>

                          <small>
                            {order.trackingNumber
                              ? `Track: ${order.trackingNumber}`
                              : "No tracking"}
                          </small>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div className="elite-admin-order-user">
                        <strong>
                          {order.user?.name || "Deleted User"}
                        </strong>

                        <small>
                          {order.user?.email || "No email"}
                        </small>
                      </div>
                    </td>

                    <td>
                      <strong>{formatDate(order.createdAt)}</strong>
                    </td>

                    <td>
                      <strong className="elite-admin-order-price">
                        ₹{formatPrice(order.totalPrice)}
                      </strong>
                    </td>

                    <td>
                      <Badge
                        bg={
                          order.paymentMethod === "COD"
                            ? "secondary"
                            : "primary"
                        }
                        className="elite-admin-orders-badge mb-1"
                      >
                        {order.paymentMethod === "COD" ? (
                          <FaMoneyBillWave className="me-1" />
                        ) : (
                          <FaCreditCard className="me-1" />
                        )}
                        {order.paymentMethod}
                      </Badge>

                      <div
                        className={
                          order.isPaid
                            ? "elite-admin-paid"
                            : "elite-admin-unpaid"
                        }
                      >
                        {order.isPaid ? (
                          <>
                            <FaCheckCircle className="me-1" />
                            Paid
                          </>
                        ) : (
                          <>
                            <FaTimesCircle className="me-1" />
                            Not Paid
                          </>
                        )}
                      </div>
                    </td>

                    <td>
                      <div
                        className={
                          order.isDelivered
                            ? "elite-admin-paid"
                            : "elite-admin-unpaid"
                        }
                      >
                        {order.isDelivered ? (
                          <>
                            <FaCheckCircle className="me-1" />
                            Delivered
                          </>
                        ) : (
                          <>
                            <FaTimesCircle className="me-1" />
                            Pending
                          </>
                        )}
                      </div>

                      {order.courierService && (
                        <small className="text-muted">
                          {order.courierService}
                        </small>
                      )}
                    </td>

                    <td>
                      <Badge
                        bg={getStatusBadge(order.orderStatus)}
                        className="elite-admin-orders-badge"
                      >
                        {order.orderStatus}
                      </Badge>
                    </td>

                    <td>
                      <div className="elite-admin-orders-actions">
                        <Button
                          size="sm"
                          variant="outline-dark"
                          onClick={() => viewOrderHandler(order)}
                        >
                          <FaEye />
                        </Button>

                        <Button
                          size="sm"
                          variant="dark"
                          onClick={() => openStatusModal(order)}
                        >
                          Update
                        </Button>

                        {!order.isDelivered &&
                          order.orderStatus !== "Cancelled" && (
                            <Button
                              size="sm"
                              variant="success"
                              disabled={updating}
                              onClick={() =>
                                markDeliveredHandler(order)
                              }
                            >
                              Deliver
                            </Button>
                          )}

                        {!isClosedOrder(order) && (
                          <Button
                            size="sm"
                            variant="danger"
                            disabled={updating}
                            onClick={() =>
                              cancelOrderHandler(order)
                            }
                          >
                            Cancel
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      <Modal
        show={showDetailsModal}
        onHide={() => setShowDetailsModal(false)}
        centered
        size="lg"
        className="elite-admin-orders-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <FaReceipt className="me-2" />
            Order Details
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {selectedOrder && (
            <>
              <Row className="g-3 mb-4">
                <Col md={6}>
                  <Card className="elite-admin-orders-info-card">
                    <Card.Body>
                      <h5>
                        <FaUser className="me-2" />
                        Customer
                      </h5>

                      <p>
                        <strong>Name:</strong>{" "}
                        {selectedOrder.user?.name || "Deleted User"}
                      </p>

                      <p>
                        <FaEnvelope className="me-2" />
                        {selectedOrder.user?.email || "No email"}
                      </p>

                      <p className="mb-0">
                        <FaPhoneAlt className="me-2" />
                        {selectedOrder.shippingAddress?.phone ||
                          "No phone"}
                      </p>
                    </Card.Body>
                  </Card>
                </Col>

                <Col md={6}>
                  <Card className="elite-admin-orders-info-card">
                    <Card.Body>
                      <h5>
                        <FaMapMarkerAlt className="me-2" />
                        Shipping Address
                      </h5>

                      <p className="mb-0">
                        {[
                          selectedOrder.shippingAddress?.address,
                          selectedOrder.shippingAddress?.landmark,
                          selectedOrder.shippingAddress?.city,
                          selectedOrder.shippingAddress?.state,
                          selectedOrder.shippingAddress?.postalCode,
                          selectedOrder.shippingAddress?.country,
                        ]
                          .filter(Boolean)
                          .join(", ")}
                      </p>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              <Card className="elite-admin-orders-info-card mb-4">
                <Card.Body>
                  <h5>
                    <FaRoute className="me-2" />
                    Order Status & Tracking
                  </h5>

                  <Row className="g-3">
                    <Col md={3}>
                      <div className="elite-admin-orders-mini-box">
                        <span>Status</span>
                        <Badge bg={getStatusBadge(selectedOrder.orderStatus)}>
                          {selectedOrder.orderStatus}
                        </Badge>
                      </div>
                    </Col>

                    <Col md={3}>
                      <div className="elite-admin-orders-mini-box">
                        <span>Progress</span>
                        <strong>
                          {getStatusProgress(selectedOrder.orderStatus)}%
                        </strong>
                      </div>
                    </Col>

                    <Col md={3}>
                      <div className="elite-admin-orders-mini-box">
                        <span>Courier</span>
                        <strong>
                          {selectedOrder.courierService || "Not added"}
                        </strong>
                      </div>
                    </Col>

                    <Col md={3}>
                      <div className="elite-admin-orders-mini-box">
                        <span>Tracking</span>
                        <strong>
                          {selectedOrder.trackingNumber || "Not added"}
                        </strong>
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              <Card className="elite-admin-orders-info-card mb-4">
                <Card.Body>
                  <h5 className="mb-3">
                    <FaBoxOpen className="me-2" />
                    Order Items
                  </h5>

                  {selectedOrder.orderItems?.map((item, index) => (
                    <div
                      key={index}
                      className="elite-admin-order-item-line"
                    >
                      <Image
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                      />

                      <div>
                        <strong>{item.name}</strong>

                        <span>
                          Product ID:{" "}
                          {typeof item.product === "object"
                            ? item.product?._id
                            : item.product}
                        </span>

                        <span>
                          Qty {item.qty} × ₹{formatPrice(item.price)}
                        </span>
                      </div>

                      <strong>
                        ₹
                        {formatPrice(
                          Number(item.qty || 0) *
                            Number(item.price || 0)
                        )}
                      </strong>
                    </div>
                  ))}
                </Card.Body>
              </Card>

              <Row className="g-3">
                <Col md={6}>
                  <Card className="elite-admin-orders-info-card">
                    <Card.Body>
                      <h5>
                        <FaCreditCard className="me-2" />
                        Payment
                      </h5>

                      <ListGroup variant="flush">
                        <ListGroup.Item>
                          <span>Method</span>
                          <strong>{selectedOrder.paymentMethod}</strong>
                        </ListGroup.Item>

                        <ListGroup.Item>
                          <span>Paid</span>
                          <strong>
                            {selectedOrder.isPaid ? "Yes" : "No"}
                          </strong>
                        </ListGroup.Item>

                        <ListGroup.Item>
                          <span>Paid At</span>
                          <strong>
                            {formatDate(selectedOrder.paidAt)}
                          </strong>
                        </ListGroup.Item>
                      </ListGroup>
                    </Card.Body>
                  </Card>
                </Col>

                <Col md={6}>
                  <Card className="elite-admin-orders-info-card">
                    <Card.Body>
                      <h5>
                        <FaRupeeSign className="me-2" />
                        Price Summary
                      </h5>

                      <ListGroup variant="flush">
                        <ListGroup.Item>
                          <span>Items</span>
                          <strong>
                            ₹{formatPrice(selectedOrder.itemsPrice)}
                          </strong>
                        </ListGroup.Item>

                        <ListGroup.Item>
                          <span>Shipping</span>
                          <strong>
                            ₹{formatPrice(selectedOrder.shippingPrice)}
                          </strong>
                        </ListGroup.Item>

                        <ListGroup.Item>
                          <span>Tax</span>
                          <strong>
                            ₹{formatPrice(selectedOrder.taxPrice)}
                          </strong>
                        </ListGroup.Item>

                        <ListGroup.Item>
                          <span>Total</span>
                          <strong>
                            ₹{formatPrice(selectedOrder.totalPrice)}
                          </strong>
                        </ListGroup.Item>
                      </ListGroup>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </>
          )}
        </Modal.Body>

        <Modal.Footer>
          {selectedOrder && (
            <Button
              as={Link}
              to={`/orders/${selectedOrder._id}`}
              variant="dark"
              onClick={() => setShowDetailsModal(false)}
            >
              Open Order Page
            </Button>
          )}

          <Button
            variant="secondary"
            onClick={() => setShowDetailsModal(false)}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={showStatusModal}
        onHide={() => setShowStatusModal(false)}
        centered
        className="elite-admin-orders-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <FaShippingFast className="me-2" />
            Update Order Status
          </Modal.Title>
        </Modal.Header>

        <Form onSubmit={updateStatusHandler}>
          <Modal.Body>
            {selectedOrder && (
              <Alert variant="info" className="elite-admin-orders-alert">
                Updating order{" "}
                <strong>#{selectedOrder._id?.slice(-10)}</strong>
              </Alert>
            )}

            <Form.Group className="mb-3">
              <Form.Label>Order Status</Form.Label>

              <Form.Select
                name="status"
                value={statusForm.status}
                onChange={changeStatusHandler}
              >
                {statusOptions.map((status) => (
                  <option
                    key={status}
                    value={status}
                  >
                    {status}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Courier Service</Form.Label>

              <Form.Control
                type="text"
                name="courierService"
                placeholder="BlueDart, Delhivery, DTDC..."
                value={statusForm.courierService}
                onChange={changeStatusHandler}
              />
            </Form.Group>

            <Form.Group>
              <Form.Label>Tracking Number</Form.Label>

              <Form.Control
                type="text"
                name="trackingNumber"
                placeholder="Enter AWB / tracking number"
                value={statusForm.trackingNumber}
                onChange={changeStatusHandler}
              />
            </Form.Group>
          </Modal.Body>

          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => setShowStatusModal(false)}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              variant="dark"
              disabled={updating}
            >
              {updating ? (
                <>
                  <Spinner
                    animation="border"
                    size="sm"
                    className="me-2"
                  />
                  Updating...
                </>
              ) : (
                "Update Status"
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </main>
  );
};

export default AdminOrdersPage;