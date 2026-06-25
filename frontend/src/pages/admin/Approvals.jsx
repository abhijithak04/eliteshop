import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Row,
  Col,
  Card,
  Table,
  Button,
  Badge,
  Modal,
  Image,
  Form,
  Alert,
  Spinner,
  ProgressBar,
} from "react-bootstrap";

import {
  FaCheckCircle,
  FaTimesCircle,
  FaSearch,
  FaStore,
  FaUserClock,
  FaUserCheck,
  FaSyncAlt,
  FaEye,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaIdCard,
  FaUniversity,
  FaShieldAlt,
  FaClipboardCheck,
  FaBolt,
  FaFilter,
  FaCrown,
  FaShoppingBag,
  FaTruck,
  FaExclamationTriangle,
  FaUser,
} from "react-icons/fa";

import { motion } from "framer-motion";

import { toast } from "react-toastify";

import Loader from "../../components/Loader";
import Message from "../../components/Message";

import axios from "../../utils/axios";

import "../../styles/AdminApprovals.css";

const AdminApprovalsPage = () => {
  const [sellers, setSellers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("pending");

  const [selectedSeller, setSelectedSeller] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [actionLoadingId, setActionLoadingId] = useState("");

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
          "Failed to load seller approvals"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSellers();
  }, []);

  const formatDate = (date) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getProfileScore = (seller) => {
    let score = 0;

    if (seller?.name) score += 10;
    if (seller?.email) score += 10;

    if (
      seller?.phone ||
      seller?.sellerInfo?.businessPhone
    ) {
      score += 15;
    }

    if (seller?.sellerInfo?.shopName) score += 15;
    if (seller?.sellerInfo?.shopAddress) score += 15;
    if (seller?.sellerInfo?.pickupAddress) score += 10;
    if (seller?.sellerInfo?.gstNumber) score += 10;
    if (seller?.sellerInfo?.bankAccount) score += 10;
    if (seller?.sellerInfo?.productCategory) score += 5;

    return Math.min(score, 100);
  };

  const stats = useMemo(() => {
    const total = sellers.length;

    const approved = sellers.filter(
      (seller) => seller.sellerInfo?.isApproved
    ).length;

    const pending = sellers.filter(
      (seller) => !seller.sellerInfo?.isApproved
    ).length;

    const completedProfiles = sellers.filter(
      (seller) => getProfileScore(seller) >= 70
    ).length;

    const approvalRate =
      total > 0
        ? Math.round((approved / total) * 100)
        : 0;

    const profileRate =
      total > 0
        ? Math.round((completedProfiles / total) * 100)
        : 0;

    return {
      total,
      approved,
      pending,
      completedProfiles,
      approvalRate,
      profileRate,
    };
  }, [sellers]);

  const filteredSellers = useMemo(() => {
    const keyword = searchTerm.toLowerCase();

    let result = sellers.filter((seller) => {
      const isApproved = Boolean(
        seller.sellerInfo?.isApproved
      );

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "approved" && isApproved) ||
        (statusFilter === "pending" && !isApproved);

      const matchesSearch =
        seller.name?.toLowerCase().includes(keyword) ||
        seller.email?.toLowerCase().includes(keyword) ||
        seller.phone?.toLowerCase().includes(keyword) ||
        seller.address?.toLowerCase().includes(keyword) ||
        seller.sellerInfo?.shopName?.toLowerCase().includes(keyword) ||
        seller.sellerInfo?.shopAddress?.toLowerCase().includes(keyword) ||
        seller.sellerInfo?.gstNumber?.toLowerCase().includes(keyword) ||
        seller.sellerInfo?.businessEmail?.toLowerCase().includes(keyword) ||
        seller.sellerInfo?.businessPhone?.toLowerCase().includes(keyword) ||
        seller.sellerInfo?.productCategory?.toLowerCase().includes(keyword);

      return matchesStatus && matchesSearch;
    });

    result.sort((a, b) => {
      if (statusFilter === "pending") {
        return (
          getProfileScore(b) -
          getProfileScore(a)
        );
      }

      return (
        new Date(b.createdAt || 0) -
        new Date(a.createdAt || 0)
      );
    });

    return result;
  }, [
    sellers,
    searchTerm,
    statusFilter,
  ]);

  const approveSellerHandler = async (sellerId) => {
    try {
      setActionLoadingId(sellerId);

      const { data } = await axios.put(
        `/users/sellers/${sellerId}/approve`
      );

      toast.success(
        data.message ||
          "Seller approved successfully"
      );

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

  const rejectSellerHandler = async (sellerId) => {
    const confirmReject = window.confirm(
      "Remove approval for this seller? Seller will stay as seller but cannot sell products."
    );

    if (!confirmReject) return;

    try {
      setActionLoadingId(sellerId);

      const { data } = await axios.put(
        `/users/sellers/${sellerId}/reject`,
        {
          reason: "Approval removed by admin",
        }
      );

      toast.success(
        data.message ||
          "Seller approval removed"
      );

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

  const openSellerModal = (seller) => {
    setSelectedSeller(seller);
    setShowModal(true);
  };

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return (
      <main className="elite-admin-approvals-page">
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
    <main className="elite-admin-approvals-page">
      <motion.section
        className="elite-approvals-hero"
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
            className="elite-approvals-hero-badge"
          >
            <FaShieldAlt className="me-2" />
            EliteShop Seller Verification
          </Badge>

          <h1>Seller Approvals</h1>

          <p>
            Review seller business profiles, verify shop details,
            approve trusted sellers, and protect your marketplace
            quality before sellers start listing products.
          </p>
        </div>

        <div>
          <Button
            variant="light"
            className="elite-refresh-hero-btn"
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
      </motion.section>

      <Row className="g-4 mb-4">
        <Col md={6} xl={3}>
          <Card className="elite-approval-stat-card pending">
            <Card.Body>
              <div>
                <span>Pending Sellers</span>
                <h2>{stats.pending}</h2>
                <p>Need verification</p>
              </div>

              <FaUserClock />
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} xl={3}>
          <Card className="elite-approval-stat-card approved">
            <Card.Body>
              <div>
                <span>Approved Sellers</span>
                <h2>{stats.approved}</h2>
                <p>Can sell products</p>
              </div>

              <FaUserCheck />
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} xl={3}>
          <Card className="elite-approval-stat-card total">
            <Card.Body>
              <div>
                <span>Total Sellers</span>
                <h2>{stats.total}</h2>
                <p>Marketplace sellers</p>
              </div>

              <FaStore />
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} xl={3}>
          <Card className="elite-approval-stat-card approved">
            <Card.Body>
              <div>
                <span>Completed Profiles</span>
                <h2>{stats.completedProfiles}</h2>
                <p>Ready to verify</p>
              </div>

              <FaClipboardCheck />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-4 mb-4">
        <Col lg={8}>
          <Card className="elite-approval-control-card">
            <Card.Body>
              <div className="elite-table-header">
                <div>
                  <h3>Verification Health</h3>

                  <p>
                    Approval rate and business profile completion
                    status.
                  </p>
                </div>

                <Badge bg="dark">
                  {stats.approvalRate}% approved
                </Badge>
              </div>

              <Row className="g-3">
                <Col md={6}>
                  <div className="elite-modal-info-box">
                    <FaCheckCircle />

                    <span>Approval Rate</span>

                    <strong>{stats.approvalRate}%</strong>

                    <ProgressBar
                      now={stats.approvalRate}
                      className="mt-3"
                    />
                  </div>
                </Col>

                <Col md={6}>
                  <div className="elite-modal-info-box">
                    <FaClipboardCheck />

                    <span>Profile Completion</span>

                    <strong>{stats.profileRate}%</strong>

                    <ProgressBar
                      now={stats.profileRate}
                      className="mt-3"
                    />
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className="elite-approval-stat-card total h-100">
            <Card.Body>
              <div>
                <span>Approval Rule</span>

                <h2>
                  <FaBolt />
                </h2>

                <p>
                  Verify shop, phone, pickup address, GST/bank
                  details before approval.
                </p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="elite-approval-control-card mb-4">
        <Card.Body>
          <Row className="g-3 align-items-center">
            <Col lg={6}>
              <div className="elite-approval-search">
                <FaSearch />

                <input
                  type="text"
                  placeholder="Search seller, shop, email, phone, GST, category..."
                  value={searchTerm}
                  onChange={(e) =>
                    setSearchTerm(e.target.value)
                  }
                />
              </div>
            </Col>

            <Col md={6} lg={3}>
              <Form.Select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value)
                }
              >
                <option value="all">All Sellers</option>
                <option value="pending">Pending Only</option>
                <option value="approved">Approved Only</option>
              </Form.Select>
            </Col>

            <Col md={6} lg={3}>
              <Button
                className="elite-reload-btn w-100"
                disabled={refreshing}
                onClick={() => fetchSellers(true)}
              >
                <FaFilter className="me-2" />
                Apply / Reload
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Card className="elite-approval-table-card">
        <Card.Body>
          <div className="elite-table-header">
            <div>
              <h3>Seller Approval Queue</h3>

              <p>
                Showing {filteredSellers.length} seller
                {filteredSellers.length !== 1 ? "s" : ""}
              </p>
            </div>

            <Badge bg="warning" text="dark">
              {stats.pending} pending
            </Badge>
          </div>

          {filteredSellers.length === 0 ? (
            <div className="elite-empty-approval">
              <FaStore />

              <h4>No sellers found</h4>

              <p>
                No sellers match your selected filter. Try changing
                the status filter or search keyword.
              </p>
            </div>
          ) : (
            <Table
              responsive
              hover
              className="elite-approval-table align-middle"
            >
              <thead>
                <tr>
                  <th>Seller</th>
                  <th>Shop</th>
                  <th>Contact</th>
                  <th>Verification</th>
                  <th>Profile</th>
                  <th>Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredSellers.map((seller) => {
                  const approved =
                    seller.sellerInfo?.isApproved;

                  const profileScore =
                    getProfileScore(seller);

                  return (
                    <tr key={seller._id}>
                      <td>
                        <div className="elite-seller-user">
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
                              Joined {formatDate(seller.createdAt)}
                            </small>
                          </div>
                        </div>
                      </td>

                      <td>
                        <div className="elite-shop-info">
                          <strong>
                            <FaStore className="me-2 text-primary" />
                            {seller.sellerInfo?.shopName ||
                              `${seller.name} Store`}
                          </strong>

                          <small>
                            {seller.sellerInfo?.shopAddress ||
                              "Shop address not added"}
                          </small>
                        </div>
                      </td>

                      <td>
                        <div className="elite-contact-lines">
                          <span>
                            <FaEnvelope />
                            {seller.sellerInfo?.businessEmail ||
                              seller.email}
                          </span>

                          <span>
                            <FaPhone />
                            {seller.sellerInfo?.businessPhone ||
                              seller.phone ||
                              "Phone not added"}
                          </span>
                        </div>
                      </td>

                      <td>
                        <div className="elite-contact-lines">
                          <span>
                            <FaIdCard />
                            {seller.sellerInfo?.gstNumber
                              ? "GST Added"
                              : "GST Missing"}
                          </span>

                          <span>
                            <FaUniversity />
                            {seller.sellerInfo?.bankAccount
                              ? "Bank Added"
                              : "Bank Missing"}
                          </span>

                          <span>
                            <FaTruck />
                            {seller.sellerInfo?.pickupAddress
                              ? "Pickup Added"
                              : "Pickup Missing"}
                          </span>
                        </div>
                      </td>

                      <td>
                        <div style={{ minWidth: "120px" }}>
                          <strong>{profileScore}%</strong>

                          <ProgressBar
                            now={profileScore}
                            className="mt-2"
                          />
                        </div>
                      </td>

                      <td>
                        {approved ? (
                          <Badge
                            bg="success"
                            className="rounded-pill px-3 py-2"
                          >
                            <FaCheckCircle className="me-1" />
                            Approved
                          </Badge>
                        ) : (
                          <Badge
                            bg="warning"
                            text="dark"
                            className="rounded-pill px-3 py-2"
                          >
                            <FaUserClock className="me-1" />
                            Pending
                          </Badge>
                        )}
                      </td>

                      <td>
                        <div className="elite-action-buttons">
                          <Button
                            size="sm"
                            variant="outline-dark"
                            onClick={() => openSellerModal(seller)}
                          >
                            <FaEye />
                            View
                          </Button>

                          {!approved && (
                            <Button
                              size="sm"
                              variant="success"
                              disabled={
                                actionLoadingId === seller._id
                              }
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
                                <>
                                  <FaCheckCircle />
                                  Approve
                                </>
                              )}
                            </Button>
                          )}

                          {approved && (
                            <Button
                              size="sm"
                              variant="warning"
                              disabled={
                                actionLoadingId === seller._id
                              }
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
                                <>
                                  <FaTimesCircle />
                                  Remove
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
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
        className="elite-seller-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <FaStore className="me-2" />
            Seller Verification Details
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {selectedSeller && (
            <>
              <div className="elite-modal-seller-top">
                <Image
                  src={
                    selectedSeller.avatar ||
                    "/images/default-avatar.png"
                  }
                  roundedCircle
                />

                <div>
                  <h4>{selectedSeller.name}</h4>

                  <p>{selectedSeller.email}</p>

                  {selectedSeller.sellerInfo?.isApproved ? (
                    <Badge bg="success">
                      Approved Seller
                    </Badge>
                  ) : (
                    <Badge bg="warning" text="dark">
                      Pending Approval
                    </Badge>
                  )}

                  <Badge bg="dark" className="ms-2">
                    {getProfileScore(selectedSeller)}% Profile
                  </Badge>
                </div>
              </div>

              <Row className="g-3 mt-3">
                <Col md={6}>
                  <div className="elite-modal-info-box">
                    <FaUser />
                    <span>Seller Name</span>
                    <strong>{selectedSeller.name}</strong>
                  </div>
                </Col>

                <Col md={6}>
                  <div className="elite-modal-info-box">
                    <FaStore />
                    <span>Shop Name</span>
                    <strong>
                      {selectedSeller.sellerInfo?.shopName ||
                        `${selectedSeller.name} Store`}
                    </strong>
                  </div>
                </Col>

                <Col md={6}>
                  <div className="elite-modal-info-box">
                    <FaShoppingBag />
                    <span>Product Category</span>
                    <strong>
                      {selectedSeller.sellerInfo?.productCategory ||
                        "General"}
                    </strong>
                  </div>
                </Col>

                <Col md={6}>
                  <div className="elite-modal-info-box">
                    <FaEnvelope />
                    <span>Business Email</span>
                    <strong>
                      {selectedSeller.sellerInfo?.businessEmail ||
                        selectedSeller.email}
                    </strong>
                  </div>
                </Col>

                <Col md={6}>
                  <div className="elite-modal-info-box">
                    <FaPhone />
                    <span>Business Phone</span>
                    <strong>
                      {selectedSeller.sellerInfo?.businessPhone ||
                        selectedSeller.phone ||
                        "Not added"}
                    </strong>
                  </div>
                </Col>

                <Col md={6}>
                  <div className="elite-modal-info-box">
                    <FaIdCard />
                    <span>GST Number</span>
                    <strong>
                      {selectedSeller.sellerInfo?.gstNumber ||
                        "Not added"}
                    </strong>
                  </div>
                </Col>

                <Col md={6}>
                  <div className="elite-modal-info-box">
                    <FaUniversity />
                    <span>Bank Account</span>
                    <strong>
                      {selectedSeller.sellerInfo?.bankAccount ||
                        "Not added"}
                    </strong>
                  </div>
                </Col>

                <Col md={6}>
                  <div className="elite-modal-info-box">
                    <FaMapMarkerAlt />
                    <span>Shop Address</span>
                    <strong>
                      {selectedSeller.sellerInfo?.shopAddress ||
                        "Not added"}
                    </strong>
                  </div>
                </Col>

                <Col md={12}>
                  <div className="elite-modal-info-box">
                    <FaTruck />
                    <span>Pickup Address</span>
                    <strong>
                      {selectedSeller.sellerInfo?.pickupAddress ||
                        "Not added"}
                    </strong>
                  </div>
                </Col>
              </Row>

              {selectedSeller.sellerInfo?.businessDescription && (
                <Alert
                  variant="info"
                  className="elite-modal-alert mt-3"
                >
                  <strong>Business Description:</strong>{" "}
                  {
                    selectedSeller.sellerInfo
                      .businessDescription
                  }
                </Alert>
              )}

              {!selectedSeller.sellerInfo?.isApproved && (
                <Alert
                  variant="warning"
                  className="elite-modal-alert mt-3"
                >
                  <FaExclamationTriangle className="me-2" />
                  Approve this seller only after verifying
                  business phone, shop address, pickup address,
                  GST details and settlement details.
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
                disabled={
                  actionLoadingId === selectedSeller._id
                }
                onClick={() => {
                  setShowModal(false);
                  rejectSellerHandler(selectedSeller._id);
                }}
              >
                <FaTimesCircle className="me-2" />
                Remove Approval
              </Button>
            ) : (
              <Button
                variant="success"
                disabled={
                  actionLoadingId === selectedSeller._id
                }
                onClick={() => {
                  setShowModal(false);
                  approveSellerHandler(selectedSeller._id);
                }}
              >
                <FaCheckCircle className="me-2" />
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

export default AdminApprovalsPage;