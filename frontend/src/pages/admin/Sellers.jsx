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
  Image,
  InputGroup,
  Form,
  Modal,
  Alert,
  Spinner,
  ListGroup,
  Dropdown,
  ProgressBar,
} from "react-bootstrap";

import {
  FaSearch,
  FaStore,
  FaCheck,
  FaTimes,
  FaEye,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaTrash,
  FaSyncAlt,
  FaShieldAlt,
  FaWarehouse,
  FaCrown,
  FaUserCheck,
  FaUserClock,
  FaBan,
  FaFilter,
  FaIdCard,
  FaUniversity,
  FaShoppingBag,
  FaBoxOpen,
  FaBolt,
  FaChartLine,
  FaCalendarAlt,
  FaClipboardCheck,
  FaTruck,
  FaMoneyBillWave,
  FaStar,
} from "react-icons/fa";

import { motion } from "framer-motion";

import { toast } from "react-toastify";

import Loader from "../../components/Loader";
import Message from "../../components/Message";

import axios from "../../utils/axios";

import "../../styles/AdminSellers.css";

const approvalStatuses = [
  "all",
  "approved",
  "pending",
];

const sortOptions = [
  {
    label: "Newest First",
    value: "newest",
  },
  {
    label: "Oldest First",
    value: "oldest",
  },
  {
    label: "Name A-Z",
    value: "name",
  },
  {
    label: "Shop A-Z",
    value: "shop",
  },
];

const formatDate = (date) => {
  if (!date) return "N/A";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const AdminSellersPage = () => {
  const [sellers, setSellers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [approvalFilter, setApprovalFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const [selectedSeller, setSelectedSeller] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [actionLoadingId, setActionLoadingId] = useState("");
  const [deleteLoadingId, setDeleteLoadingId] = useState("");

  const fetchSellers = async (silent = false) => {
    try {
      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const { data } = await axios.get("/users/sellers");

      setSellers(Array.isArray(data) ? data : []);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch sellers"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSellers();
  }, []);

  const stats = useMemo(() => {
    const totalSellers = sellers.length;

    const approvedSellers = sellers.filter(
      (seller) => seller.sellerInfo?.isApproved
    ).length;

    const pendingSellers = sellers.filter(
      (seller) => !seller.sellerInfo?.isApproved
    ).length;

    const withShopDetails = sellers.filter(
      (seller) =>
        seller.sellerInfo?.shopName ||
        seller.sellerInfo?.shopAddress ||
        seller.sellerInfo?.gstNumber
    ).length;

    const withBankDetails = sellers.filter(
      (seller) => seller.sellerInfo?.bankAccount
    ).length;

    const approvalRate =
      totalSellers > 0
        ? Math.round((approvedSellers / totalSellers) * 100)
        : 0;

    const profileCompletionRate =
      totalSellers > 0
        ? Math.round((withShopDetails / totalSellers) * 100)
        : 0;

    return {
      totalSellers,
      approvedSellers,
      pendingSellers,
      withShopDetails,
      withBankDetails,
      approvalRate,
      profileCompletionRate,
    };
  }, [sellers]);

  const filteredSellers = useMemo(() => {
    const search = searchTerm.toLowerCase();

    let result = sellers.filter((seller) => {
      const isApproved = Boolean(seller.sellerInfo?.isApproved);

      const matchesSearch =
        seller.name?.toLowerCase().includes(search) ||
        seller.email?.toLowerCase().includes(search) ||
        seller.phone?.toLowerCase().includes(search) ||
        seller.address?.toLowerCase().includes(search) ||
        seller.sellerInfo?.shopName?.toLowerCase().includes(search) ||
        seller.sellerInfo?.shopAddress?.toLowerCase().includes(search) ||
        seller.sellerInfo?.gstNumber?.toLowerCase().includes(search) ||
        seller.sellerInfo?.productCategory?.toLowerCase().includes(search) ||
        seller.sellerInfo?.businessEmail?.toLowerCase().includes(search) ||
        seller.sellerInfo?.businessPhone?.toLowerCase().includes(search);

      const matchesApproval =
        approvalFilter === "all" ||
        (approvalFilter === "approved" && isApproved) ||
        (approvalFilter === "pending" && !isApproved);

      return matchesSearch && matchesApproval;
    });

    result.sort((a, b) => {
      if (sortBy === "oldest") {
        return new Date(a.createdAt) - new Date(b.createdAt);
      }

      if (sortBy === "name") {
        return (a.name || "").localeCompare(b.name || "");
      }

      if (sortBy === "shop") {
        return (a.sellerInfo?.shopName || "").localeCompare(
          b.sellerInfo?.shopName || ""
        );
      }

      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });

    return result;
  }, [
    sellers,
    searchTerm,
    approvalFilter,
    sortBy,
  ]);

  const approveSellerHandler = async (id) => {
    try {
      setActionLoadingId(id);

      await axios.put(`/users/sellers/${id}/approve`);

      toast.success("Seller approved successfully");

      await fetchSellers(true);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to approve seller"
      );
    } finally {
      setActionLoadingId("");
    }
  };

  const rejectSellerHandler = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to remove this seller approval?"
      )
    ) {
      return;
    }

    try {
      setActionLoadingId(id);

      await axios.put(`/users/sellers/${id}/reject`, {
        reason: "Approval removed by admin",
      });

      toast.success("Seller approval removed");

      await fetchSellers(true);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to remove seller approval"
      );
    } finally {
      setActionLoadingId("");
    }
  };

  const deleteSellerHandler = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this seller account? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      setDeleteLoadingId(id);

      await axios.delete(`/users/${id}`);

      toast.success("Seller deleted successfully");

      setSellers((prev) =>
        prev.filter((seller) => seller._id !== id)
      );
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to delete seller"
      );
    } finally {
      setDeleteLoadingId("");
    }
  };

  const viewSellerHandler = (seller) => {
    setSelectedSeller(seller);
    setShowModal(true);
  };

  const hasBasicBusinessDetails = (seller) => {
    return Boolean(
      seller.sellerInfo?.shopName ||
        seller.sellerInfo?.shopAddress ||
        seller.sellerInfo?.gstNumber ||
        seller.sellerInfo?.businessEmail ||
        seller.sellerInfo?.businessPhone
    );
  };

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return (
      <main className="elite-admin-sellers-page">
        <Message variant="danger">
          {error}
        </Message>

        <Button
          variant="dark"
          className="rounded-pill fw-bold mt-3"
          onClick={() => fetchSellers()}
        >
          Retry
        </Button>
      </main>
    );
  }

  return (
    <main className="elite-admin-sellers-page">
      <motion.section
        className="elite-admin-sellers-hero"
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
            className="elite-admin-sellers-hero-badge"
          >
            <FaShieldAlt className="me-2" />
            EliteShop Seller Command
          </Badge>

          <h1>Manage Sellers</h1>

          <p>
            Approve sellers, verify business details, monitor shop
            profiles, protect marketplace quality and control who can
            sell products on EliteShop.
          </p>
        </div>

        <div className="elite-admin-sellers-hero-actions">
          <Button
            variant="light"
            disabled={refreshing}
            onClick={() => fetchSellers(true)}
          >
            {refreshing ? (
              <>
                <Spinner
                  animation="border"
                  size="sm"
                  className="me-2"
                />
                Refreshing
              </>
            ) : (
              <>
                <FaSyncAlt className="me-2" />
                Refresh
              </>
            )}
          </Button>
        </div>

        <motion.div
          className="elite-admin-sellers-floating-badge"
          animate={{
            y: [0, -10, 0],
          }}
          transition={{
            duration: 3.5,
            repeat: Infinity,
          }}
        >
          <FaWarehouse />
          Marketplace Control
        </motion.div>
      </motion.section>

      <Row className="g-4 mb-4">
        <Col md={6} xl={3}>
          <Card className="elite-admin-seller-stat total">
            <Card.Body>
              <FaStore />
              <span>Total Sellers</span>
              <h2>{stats.totalSellers}</h2>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} xl={3}>
          <Card className="elite-admin-seller-stat approved">
            <Card.Body>
              <FaUserCheck />
              <span>Approved</span>
              <h2>{stats.approvedSellers}</h2>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} xl={3}>
          <Card className="elite-admin-seller-stat pending">
            <Card.Body>
              <FaUserClock />
              <span>Pending Approval</span>
              <h2>{stats.pendingSellers}</h2>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} xl={3}>
          <Card className="elite-admin-seller-stat details">
            <Card.Body>
              <FaClipboardCheck />
              <span>With Shop Details</span>
              <h2>{stats.withShopDetails}</h2>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-4 mb-4">
        <Col lg={8}>
          <Card className="elite-admin-sellers-showcase-card">
            <Card.Body>
              <div className="elite-admin-sellers-section-heading">
                <div>
                  <h4>Marketplace Seller Health</h4>

                  <p>
                    Track approval progress, profile completion and
                    business verification quality.
                  </p>
                </div>

                <Badge bg="dark">
                  {stats.approvalRate}% approved
                </Badge>
              </div>

              <Row className="g-3">
                <Col md={4}>
                  <div className="elite-admin-sellers-mini-card blue">
                    <FaChartLine />
                    <span>Approval Rate</span>
                    <strong>{stats.approvalRate}%</strong>
                  </div>
                </Col>

                <Col md={4}>
                  <div className="elite-admin-sellers-mini-card green">
                    <FaIdCard />
                    <span>Profile Complete</span>
                    <strong>{stats.profileCompletionRate}%</strong>
                  </div>
                </Col>

                <Col md={4}>
                  <div className="elite-admin-sellers-mini-card orange">
                    <FaUniversity />
                    <span>Bank Details</span>
                    <strong>{stats.withBankDetails}</strong>
                  </div>
                </Col>
              </Row>

              <div className="elite-admin-sellers-progress-wrap">
                <div>
                  <span>Seller Approval Completion</span>
                  <strong>{stats.approvalRate}%</strong>
                </div>

                <ProgressBar
                  now={stats.approvalRate}
                  className="elite-admin-sellers-progress"
                />
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className="elite-admin-sellers-tip-card">
            <Card.Body>
              <FaBolt />

              <h4>Real Marketplace Rule</h4>

              <p>
                A seller should only sell after admin approval. Verify
                shop name, pickup address, GST/bank details and contact
                before approval.
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="elite-admin-sellers-filter-card">
        <Card.Body>
          <Row className="g-3 align-items-center">
            <Col lg={5}>
              <InputGroup className="elite-admin-sellers-search">
                <InputGroup.Text>
                  <FaSearch />
                </InputGroup.Text>

                <Form.Control
                  type="text"
                  placeholder="Search seller, email, phone, shop, GST, category..."
                  value={searchTerm}
                  onChange={(e) =>
                    setSearchTerm(e.target.value)
                  }
                />
              </InputGroup>
            </Col>

            <Col md={4} lg={2}>
              <Form.Select
                value={approvalFilter}
                onChange={(e) =>
                  setApprovalFilter(e.target.value)
                }
              >
                {approvalStatuses.map((status) => (
                  <option
                    key={status}
                    value={status}
                  >
                    {status === "all"
                      ? "All Sellers"
                      : status.charAt(0).toUpperCase() +
                        status.slice(1)}
                  </option>
                ))}
              </Form.Select>
            </Col>

            <Col md={4} lg={2}>
              <Form.Select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(e.target.value)
                }
              >
                {sortOptions.map((option) => (
                  <option
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </option>
                ))}
              </Form.Select>
            </Col>

            <Col md={4} lg={3}>
              <Button
                className="elite-admin-sellers-refresh-btn"
                disabled={refreshing}
                onClick={() => fetchSellers(true)}
              >
                <FaFilter className="me-2" />
                Apply / Refresh
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <div className="elite-admin-sellers-active-filter">
        <span>
          <FaFilter />
          Showing:
        </span>

        <Badge bg="primary">
          {filteredSellers.length} seller(s)
        </Badge>

        <Badge bg="success">
          {stats.approvedSellers} approved
        </Badge>

        <Badge bg="warning" text="dark">
          {stats.pendingSellers} pending
        </Badge>

        <Badge bg="dark">
          {stats.withShopDetails} with details
        </Badge>
      </div>

      <Card className="elite-admin-sellers-table-card">
        <Card.Body>
          <div className="elite-admin-sellers-section-heading">
            <div>
              <h4>Sellers List</h4>

              <p>
                Approve, reject, inspect and manage marketplace seller
                accounts.
              </p>
            </div>
          </div>

          {filteredSellers.length === 0 ? (
            <div className="elite-admin-sellers-empty">
              <FaStore />

              <h4>No sellers found</h4>

              <p>
                Try changing search text, approval filter or sorting.
              </p>
            </div>
          ) : (
            <Table
              responsive
              hover
              className="elite-admin-sellers-table"
            >
              <thead>
                <tr>
                  <th>Seller</th>
                  <th>Shop</th>
                  <th>Contact</th>
                  <th>Business</th>
                  <th>Approval</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredSellers.map((seller) => (
                  <tr key={seller._id}>
                    <td>
                      <div className="elite-admin-seller-cell">
                        <Image
                          src={
                            seller.avatar ||
                            "/images/default-avatar.png"
                          }
                          roundedCircle
                        />

                        <div>
                          <strong>{seller.name}</strong>

                          <small>
                            ID: {seller._id?.substring(0, 8)}...
                          </small>

                          {seller.sellerInfo?.isApproved ? (
                            <span className="approved">
                              <FaCheck />
                              Approved Seller
                            </span>
                          ) : (
                            <span className="pending">
                              <FaUserClock />
                              Pending Approval
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td>
                      <div className="elite-admin-seller-shop">
                        <strong>
                          <FaStore />
                          {seller.sellerInfo?.shopName ||
                            `${seller.name} Store`}
                        </strong>

                        <span>
                          {seller.sellerInfo?.shopAddress ||
                            "No shop address"}
                        </span>
                      </div>
                    </td>

                    <td>
                      <div className="elite-admin-seller-contact">
                        <span>
                          <FaEnvelope />
                          {seller.email}
                        </span>

                        <span>
                          <FaPhone />
                          {seller.sellerInfo?.businessPhone ||
                            seller.phone ||
                            "No phone"}
                        </span>
                      </div>
                    </td>

                    <td>
                      <div className="elite-admin-seller-business">
                        <span>
                          <FaShoppingBag />
                          {seller.sellerInfo?.productCategory ||
                            "General"}
                        </span>

                        <span>
                          <FaIdCard />
                          {seller.sellerInfo?.gstNumber ||
                            "GST not added"}
                        </span>

                        {hasBasicBusinessDetails(seller) ? (
                          <Badge
                            bg="success"
                            className="elite-admin-sellers-badge mt-1"
                          >
                            Details Added
                          </Badge>
                        ) : (
                          <Badge
                            bg="danger"
                            className="elite-admin-sellers-badge mt-1"
                          >
                            Incomplete
                          </Badge>
                        )}
                      </div>
                    </td>

                    <td>
                      {seller.sellerInfo?.isApproved ? (
                        <Badge
                          bg="success"
                          className="elite-admin-sellers-badge"
                        >
                          Approved
                        </Badge>
                      ) : (
                        <Badge
                          bg="warning"
                          text="dark"
                          className="elite-admin-sellers-badge"
                        >
                          Pending
                        </Badge>
                      )}
                    </td>

                    <td>
                      <strong>{formatDate(seller.createdAt)}</strong>
                    </td>

                    <td>
                      <div className="elite-admin-seller-actions">
                        <Button
                          size="sm"
                          variant="outline-dark"
                          onClick={() => viewSellerHandler(seller)}
                        >
                          <FaEye />
                        </Button>

                        {seller.sellerInfo?.isApproved ? (
                          <Button
                            size="sm"
                            variant="warning"
                            disabled={actionLoadingId === seller._id}
                            onClick={() =>
                              rejectSellerHandler(seller._id)
                            }
                          >
                            {actionLoadingId === seller._id ? (
                              <Spinner
                                animation="border"
                                size="sm"
                              />
                            ) : (
                              <FaTimes />
                            )}
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="success"
                            disabled={actionLoadingId === seller._id}
                            onClick={() =>
                              approveSellerHandler(seller._id)
                            }
                          >
                            {actionLoadingId === seller._id ? (
                              <Spinner
                                animation="border"
                                size="sm"
                              />
                            ) : (
                              <FaCheck />
                            )}
                          </Button>
                        )}

                        <Dropdown>
                          <Dropdown.Toggle
                            size="sm"
                            variant="outline-primary"
                          >
                            More
                          </Dropdown.Toggle>

                          <Dropdown.Menu>
                            <Dropdown.Item
                              onClick={() => viewSellerHandler(seller)}
                            >
                              <FaEye className="me-2" />
                              View Details
                            </Dropdown.Item>

                            {seller.sellerInfo?.isApproved ? (
                              <Dropdown.Item
                                disabled={actionLoadingId === seller._id}
                                onClick={() =>
                                  rejectSellerHandler(seller._id)
                                }
                              >
                                <FaBan className="me-2" />
                                Remove Approval
                              </Dropdown.Item>
                            ) : (
                              <Dropdown.Item
                                disabled={actionLoadingId === seller._id}
                                onClick={() =>
                                  approveSellerHandler(seller._id)
                                }
                              >
                                <FaUserCheck className="me-2" />
                                Approve Seller
                              </Dropdown.Item>
                            )}

                            <Dropdown.Item
                              className="text-danger"
                              disabled={deleteLoadingId === seller._id}
                              onClick={() =>
                                deleteSellerHandler(seller._id)
                              }
                            >
                              <FaTrash className="me-2" />
                              Delete Seller
                            </Dropdown.Item>
                          </Dropdown.Menu>
                        </Dropdown>
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
        show={showModal}
        onHide={() => setShowModal(false)}
        centered
        size="lg"
        className="elite-admin-sellers-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <FaStore className="me-2" />
            Seller Details
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {selectedSeller && (
            <>
              <div className="elite-admin-seller-profile-head">
                <Image
                  src={
                    selectedSeller.avatar ||
                    "/images/default-avatar.png"
                  }
                  roundedCircle
                />

                <div>
                  <h3>{selectedSeller.name}</h3>

                  <p>{selectedSeller.email}</p>

                  {selectedSeller.sellerInfo?.isApproved ? (
                    <Badge bg="success">
                      Approved Seller
                    </Badge>
                  ) : (
                    <Badge
                      bg="warning"
                      text="dark"
                    >
                      Pending Approval
                    </Badge>
                  )}

                  <Badge
                    bg="dark"
                    className="ms-2"
                  >
                    {selectedSeller.sellerInfo?.productCategory ||
                      "General"}
                  </Badge>
                </div>
              </div>

              <Row className="g-3 mt-3">
                <Col md={6}>
                  <Card className="elite-admin-seller-detail-card">
                    <Card.Body>
                      <h5>
                        <FaUser className="me-2" />
                        Personal Info
                      </h5>

                      <ListGroup variant="flush">
                        <ListGroup.Item>
                          <span>Name</span>
                          <strong>{selectedSeller.name}</strong>
                        </ListGroup.Item>

                        <ListGroup.Item>
                          <span>Email</span>
                          <strong>{selectedSeller.email}</strong>
                        </ListGroup.Item>

                        <ListGroup.Item>
                          <span>Phone</span>
                          <strong>
                            {selectedSeller.phone || "Not added"}
                          </strong>
                        </ListGroup.Item>

                        <ListGroup.Item>
                          <span>Address</span>
                          <strong>
                            {selectedSeller.address || "Not added"}
                          </strong>
                        </ListGroup.Item>

                        <ListGroup.Item>
                          <span>Joined</span>
                          <strong>
                            {formatDate(selectedSeller.createdAt)}
                          </strong>
                        </ListGroup.Item>
                      </ListGroup>
                    </Card.Body>
                  </Card>
                </Col>

                <Col md={6}>
                  <Card className="elite-admin-seller-detail-card">
                    <Card.Body>
                      <h5>
                        <FaStore className="me-2" />
                        Shop Info
                      </h5>

                      <ListGroup variant="flush">
                        <ListGroup.Item>
                          <span>Shop Name</span>
                          <strong>
                            {selectedSeller.sellerInfo?.shopName ||
                              `${selectedSeller.name} Store`}
                          </strong>
                        </ListGroup.Item>

                        <ListGroup.Item>
                          <span>Category</span>
                          <strong>
                            {selectedSeller.sellerInfo?.productCategory ||
                              "General"}
                          </strong>
                        </ListGroup.Item>

                        <ListGroup.Item>
                          <span>Shop Address</span>
                          <strong>
                            {selectedSeller.sellerInfo?.shopAddress ||
                              "Not added"}
                          </strong>
                        </ListGroup.Item>

                        <ListGroup.Item>
                          <span>Pickup Address</span>
                          <strong>
                            {selectedSeller.sellerInfo?.pickupAddress ||
                              "Not added"}
                          </strong>
                        </ListGroup.Item>

                        <ListGroup.Item>
                          <span>Approval</span>
                          <strong>
                            {selectedSeller.sellerInfo?.isApproved
                              ? "Approved"
                              : "Pending"}
                          </strong>
                        </ListGroup.Item>
                      </ListGroup>
                    </Card.Body>
                  </Card>
                </Col>

                <Col md={6}>
                  <Card className="elite-admin-seller-detail-card">
                    <Card.Body>
                      <h5>
                        <FaIdCard className="me-2" />
                        Verification
                      </h5>

                      <ListGroup variant="flush">
                        <ListGroup.Item>
                          <span>GST Number</span>
                          <strong>
                            {selectedSeller.sellerInfo?.gstNumber ||
                              "Not added"}
                          </strong>
                        </ListGroup.Item>

                        <ListGroup.Item>
                          <span>Business Phone</span>
                          <strong>
                            {selectedSeller.sellerInfo?.businessPhone ||
                              selectedSeller.phone ||
                              "Not added"}
                          </strong>
                        </ListGroup.Item>

                        <ListGroup.Item>
                          <span>Business Email</span>
                          <strong>
                            {selectedSeller.sellerInfo?.businessEmail ||
                              selectedSeller.email}
                          </strong>
                        </ListGroup.Item>
                      </ListGroup>
                    </Card.Body>
                  </Card>
                </Col>

                <Col md={6}>
                  <Card className="elite-admin-seller-detail-card">
                    <Card.Body>
                      <h5>
                        <FaUniversity className="me-2" />
                        Settlement Info
                      </h5>

                      <ListGroup variant="flush">
                        <ListGroup.Item>
                          <span>Bank Account</span>
                          <strong>
                            {selectedSeller.sellerInfo?.bankAccount ||
                              "Not added"}
                          </strong>
                        </ListGroup.Item>

                        <ListGroup.Item>
                          <span>Seller ID</span>
                          <strong>{selectedSeller._id}</strong>
                        </ListGroup.Item>
                      </ListGroup>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              {selectedSeller.sellerInfo?.businessDescription && (
                <Card className="elite-admin-seller-detail-card mt-3">
                  <Card.Body>
                    <h5>
                      <FaBoxOpen className="me-2" />
                      Business Description
                    </h5>

                    <p className="mb-0 text-muted fw-semibold">
                      {selectedSeller.sellerInfo.businessDescription}
                    </p>
                  </Card.Body>
                </Card>
              )}

              {!selectedSeller.sellerInfo?.isApproved && (
                <Alert
                  variant="warning"
                  className="elite-admin-sellers-alert mt-3 mb-0"
                >
                  <FaUserClock className="me-2" />
                  This seller is waiting for approval. Approve only
                  after verifying shop, contact, pickup address and
                  business details.
                </Alert>
              )}
            </>
          )}
        </Modal.Body>

        <Modal.Footer>
          {selectedSeller &&
            (selectedSeller.sellerInfo?.isApproved ? (
              <Button
                variant="warning"
                disabled={actionLoadingId === selectedSeller._id}
                onClick={() => {
                  setShowModal(false);
                  rejectSellerHandler(selectedSeller._id);
                }}
              >
                <FaTimes className="me-2" />
                Remove Approval
              </Button>
            ) : (
              <Button
                variant="success"
                disabled={actionLoadingId === selectedSeller._id}
                onClick={() => {
                  setShowModal(false);
                  approveSellerHandler(selectedSeller._id);
                }}
              >
                <FaCheck className="me-2" />
                Approve Seller
              </Button>
            ))}

          <Button
            variant="secondary"
            onClick={() => setShowModal(false)}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </main>
  );
};

export default AdminSellersPage;