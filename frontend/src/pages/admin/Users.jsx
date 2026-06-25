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
  Modal,
  Form,
  Row,
  Col,
  Image,
  InputGroup,
  Spinner,
  Alert,
  Dropdown,
  ListGroup,
} from "react-bootstrap";

import {
  FaEdit,
  FaTrash,
  FaSearch,
  FaUserShield,
  FaStore,
  FaUser,
  FaCheckCircle,
  FaTimesCircle,
  FaUsers,
  FaUserCheck,
  FaUserClock,
  FaSyncAlt,
  FaCrown,
  FaPhone,
  FaMapMarkerAlt,
  FaEnvelope,
  FaIdCard,
  FaUniversity,
  FaShieldAlt,
  FaEye,
  FaFilter,
  FaBan,
  FaLockOpen,
  FaShoppingBag,
  FaWarehouse,
  FaBolt,
  FaChartLine,
  FaUserCog,
} from "react-icons/fa";

import { motion } from "framer-motion";

import { toast } from "react-toastify";

import Loader from "../../components/Loader";
import Message from "../../components/Message";

import axios from "../../utils/axios";

import "../../styles/AdminUsers.css";

const accountStatuses = [
  "all",
  "active",
  "inactive",
  "verified",
  "unverified",
];

const productCategories = [
  "Mobiles",
  "Electronics",
  "Fashion",
  "Shoes",
  "Watches",
  "Beauty",
  "Home & Kitchen",
  "Furniture",
  "Grocery",
  "Sports",
  "Gaming",
  "Books",
  "Appliances",
];

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);

  const [selectedUser, setSelectedUser] = useState(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    avatar: "",
    role: "user",
    isVerified: false,
    isActive: true,
    shopName: "",
    shopAddress: "",
    gstNumber: "",
    bankAccount: "",
    businessPhone: "",
    businessEmail: "",
    pickupAddress: "",
    productCategory: "",
    businessDescription: "",
    isApproved: false,
  });

  const [updating, setUpdating] = useState(false);
  const [quickActionId, setQuickActionId] = useState("");
  const [deletingId, setDeletingId] = useState("");

  const fetchUsers = async (silent = false) => {
    try {
      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const { data } = await axios.get("/users");

      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch users"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const stats = useMemo(() => {
    const total = users.length;

    const admins = users.filter(
      (user) => user.role === "admin"
    ).length;

    const sellers = users.filter(
      (user) => user.role === "seller"
    ).length;

    const approvedSellers = users.filter(
      (user) =>
        user.role === "seller" &&
        user.sellerInfo?.isApproved
    ).length;

    const pendingSellers = users.filter(
      (user) =>
        user.role === "seller" &&
        !user.sellerInfo?.isApproved
    ).length;

    const customers = users.filter(
      (user) => user.role === "user"
    ).length;

    const active = users.filter(
      (user) => user.isActive !== false
    ).length;

    const inactive = users.filter(
      (user) => user.isActive === false
    ).length;

    const verified = users.filter(
      (user) => user.isVerified
    ).length;

    return {
      total,
      admins,
      sellers,
      approvedSellers,
      pendingSellers,
      customers,
      active,
      inactive,
      verified,
    };
  }, [users]);

  const filteredUsers = useMemo(() => {
    const keyword = searchTerm.toLowerCase();

    let result = users.filter((user) => {
      const matchesSearch =
        user.name?.toLowerCase().includes(keyword) ||
        user.email?.toLowerCase().includes(keyword) ||
        user.phone?.toLowerCase().includes(keyword) ||
        user.role?.toLowerCase().includes(keyword) ||
        user.address?.toLowerCase().includes(keyword) ||
        user.sellerInfo?.shopName?.toLowerCase().includes(keyword) ||
        user.sellerInfo?.shopAddress?.toLowerCase().includes(keyword) ||
        user.sellerInfo?.gstNumber?.toLowerCase().includes(keyword) ||
        user.sellerInfo?.productCategory?.toLowerCase().includes(keyword);

      const matchesRole =
        roleFilter === "all"
          ? true
          : roleFilter === "approvedSeller"
          ? user.role === "seller" && user.sellerInfo?.isApproved
          : roleFilter === "pendingSeller"
          ? user.role === "seller" && !user.sellerInfo?.isApproved
          : user.role === roleFilter;

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && user.isActive !== false) ||
        (statusFilter === "inactive" && user.isActive === false) ||
        (statusFilter === "verified" && user.isVerified) ||
        (statusFilter === "unverified" && !user.isVerified);

      return matchesSearch && matchesRole && matchesStatus;
    });

    result.sort((a, b) => {
      if (sortBy === "oldest") {
        return new Date(a.createdAt) - new Date(b.createdAt);
      }

      if (sortBy === "name") {
        return (a.name || "").localeCompare(b.name || "");
      }

      if (sortBy === "role") {
        return (a.role || "").localeCompare(b.role || "");
      }

      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });

    return result;
  }, [
    users,
    searchTerm,
    roleFilter,
    statusFilter,
    sortBy,
  ]);

  const getRoleBadge = (role) => {
    if (role === "admin") return "danger";
    if (role === "seller") return "success";
    return "primary";
  };

  const getRoleIcon = (role) => {
    if (role === "admin") return <FaUserShield />;
    if (role === "seller") return <FaStore />;
    return <FaUser />;
  };

  const getSellerStatus = (user) => {
    if (user.role !== "seller") return "Not Seller";

    return user.sellerInfo?.isApproved
      ? "Approved Seller"
      : "Pending Seller";
  };

  const openViewModal = (user) => {
    setSelectedUser(user);
    setShowViewModal(true);
  };

  const openEditModal = (user) => {
    setSelectedUser(user);

    setForm({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      address: user.address || "",
      avatar: user.avatar || "",
      role: user.role || "user",
      isVerified: Boolean(user.isVerified),
      isActive: user.isActive !== false,
      shopName: user.sellerInfo?.shopName || "",
      shopAddress: user.sellerInfo?.shopAddress || "",
      gstNumber: user.sellerInfo?.gstNumber || "",
      bankAccount: user.sellerInfo?.bankAccount || "",
      businessPhone:
        user.sellerInfo?.businessPhone || user.phone || "",
      businessEmail:
        user.sellerInfo?.businessEmail || user.email || "",
      pickupAddress:
        user.sellerInfo?.pickupAddress ||
        user.sellerInfo?.shopAddress ||
        user.address ||
        "",
      productCategory:
        user.sellerInfo?.productCategory || "",
      businessDescription:
        user.sellerInfo?.businessDescription ||
        user.sellerInfo?.description ||
        "",
      isApproved: Boolean(user.sellerInfo?.isApproved),
    });

    setShowModal(true);
  };

  const changeHandler = (e) => {
    const {
      name,
      value,
      type,
      checked,
    } = e.target;

    setForm((prev) => {
      const updated = {
        ...prev,
        [name]:
          type === "checkbox" ||
          type === "switch"
            ? checked
            : value,
      };

      if (name === "role" && value === "seller") {
        updated.shopName =
          updated.shopName ||
          `${prev.name || "Seller"} Store`;

        updated.businessPhone =
          updated.businessPhone ||
          prev.phone ||
          "";

        updated.businessEmail =
          updated.businessEmail ||
          prev.email ||
          "";

        updated.pickupAddress =
          updated.pickupAddress ||
          prev.address ||
          "";

        updated.productCategory =
          updated.productCategory || "General";

        updated.isApproved = false;
      }

      if (name === "role" && value !== "seller") {
        updated.isApproved = false;
      }

      return updated;
    });
  };

  const buildPayload = () => {
    const payload = {
      name: form.name,
      email: form.email,
      phone: form.phone,
      address: form.address,
      avatar: form.avatar,
      role: form.role,
      isVerified: form.isVerified,
      isActive: form.isActive,
    };

    if (form.role === "seller") {
      payload.shopName =
        form.shopName || `${form.name} Store`;

      payload.shopAddress =
        form.shopAddress || form.address || "";

      payload.gstNumber = form.gstNumber || "";
      payload.bankAccount = form.bankAccount || "";

      payload.businessPhone =
        form.businessPhone || form.phone || "";

      payload.businessEmail =
        form.businessEmail || form.email || "";

      payload.pickupAddress =
        form.pickupAddress ||
        form.shopAddress ||
        form.address ||
        "";

      payload.productCategory =
        form.productCategory || "General";

      payload.businessDescription =
        form.businessDescription || "";

      payload.isApproved = Boolean(form.isApproved);
    }

    return payload;
  };

  const updateUserHandler = async (e) => {
    e.preventDefault();

    if (!selectedUser) return;

    try {
      setUpdating(true);

      const { data } = await axios.put(
        `/users/${selectedUser._id}`,
        buildPayload()
      );

      toast.success("User updated successfully");

      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user._id === selectedUser._id
            ? {
                ...user,
                ...data,
              }
            : user
        )
      );

      setShowModal(false);

      await fetchUsers(true);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to update user"
      );
    } finally {
      setUpdating(false);
    }
  };

  const makeSellerHandler = async (user) => {
    if (
      !window.confirm(
        `Make ${user.name} a seller? Seller will be pending until approved.`
      )
    ) {
      return;
    }

    try {
      setQuickActionId(user._id);

      await axios.put(`/users/${user._id}`, {
        name: user.name,
        email: user.email,
        phone: user.phone || "",
        address: user.address || "",
        avatar: user.avatar || "",
        role: "seller",
        isVerified: user.isVerified,
        isActive: user.isActive !== false,
        shopName:
          user.sellerInfo?.shopName ||
          `${user.name} Store`,
        shopAddress:
          user.sellerInfo?.shopAddress ||
          user.address ||
          "",
        gstNumber:
          user.sellerInfo?.gstNumber || "",
        bankAccount:
          user.sellerInfo?.bankAccount || "",
        businessPhone:
          user.sellerInfo?.businessPhone ||
          user.phone ||
          "",
        businessEmail:
          user.sellerInfo?.businessEmail ||
          user.email ||
          "",
        pickupAddress:
          user.sellerInfo?.pickupAddress ||
          user.sellerInfo?.shopAddress ||
          user.address ||
          "",
        productCategory:
          user.sellerInfo?.productCategory ||
          "General",
        businessDescription:
          user.sellerInfo?.businessDescription ||
          user.sellerInfo?.description ||
          "",
        isApproved: false,
      });

      toast.success(
        "User converted to seller. Approve seller before product selling."
      );

      await fetchUsers(true);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to make seller"
      );
    } finally {
      setQuickActionId("");
    }
  };

  const approveSellerHandler = async (user) => {
    try {
      setQuickActionId(user._id);

      await axios.put(`/users/sellers/${user._id}/approve`);

      toast.success("Seller approved successfully");

      await fetchUsers(true);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to approve seller"
      );
    } finally {
      setQuickActionId("");
    }
  };

  const removeSellerApprovalHandler = async (user) => {
    if (
      !window.confirm(
        "Remove seller approval? Seller will remain seller but cannot sell."
      )
    ) {
      return;
    }

    try {
      setQuickActionId(user._id);

      await axios.put(`/users/sellers/${user._id}/reject`, {
        reason: "Approval removed by admin",
      });

      toast.success("Seller approval removed");

      await fetchUsers(true);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to remove seller approval"
      );
    } finally {
      setQuickActionId("");
    }
  };

  const makeUserHandler = async (user) => {
    if (
      !window.confirm(
        `Change ${user.name} back to normal user?`
      )
    ) {
      return;
    }

    try {
      setQuickActionId(user._id);

      await axios.put(`/users/${user._id}`, {
        name: user.name,
        email: user.email,
        phone: user.phone || "",
        address: user.address || "",
        avatar: user.avatar || "",
        role: "user",
        isVerified: user.isVerified,
        isActive: user.isActive !== false,
      });

      toast.success("Changed to normal user");

      await fetchUsers(true);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to change role"
      );
    } finally {
      setQuickActionId("");
    }
  };

  const toggleActiveHandler = async (user) => {
    if (user.role === "admin") {
      toast.error("Admin account cannot be blocked from here.");
      return;
    }

    const nextActive = user.isActive === false;

    if (
      !window.confirm(
        nextActive
          ? `Unblock ${user.name}?`
          : `Block ${user.name}?`
      )
    ) {
      return;
    }

    try {
      setQuickActionId(user._id);

      await axios.put(`/users/${user._id}`, {
        name: user.name,
        email: user.email,
        phone: user.phone || "",
        address: user.address || "",
        avatar: user.avatar || "",
        role: user.role,
        isVerified: user.isVerified,
        isActive: nextActive,
        ...(user.role === "seller"
          ? {
              shopName:
                user.sellerInfo?.shopName ||
                `${user.name} Store`,
              shopAddress:
                user.sellerInfo?.shopAddress ||
                user.address ||
                "",
              gstNumber:
                user.sellerInfo?.gstNumber || "",
              bankAccount:
                user.sellerInfo?.bankAccount || "",
              businessPhone:
                user.sellerInfo?.businessPhone ||
                user.phone ||
                "",
              businessEmail:
                user.sellerInfo?.businessEmail ||
                user.email ||
                "",
              pickupAddress:
                user.sellerInfo?.pickupAddress ||
                user.sellerInfo?.shopAddress ||
                user.address ||
                "",
              productCategory:
                user.sellerInfo?.productCategory ||
                "General",
              businessDescription:
                user.sellerInfo?.businessDescription ||
                "",
              isApproved:
                user.sellerInfo?.isApproved || false,
            }
          : {}),
      });

      toast.success(
        nextActive
          ? "User unblocked successfully"
          : "User blocked successfully"
      );

      await fetchUsers(true);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to update account status"
      );
    } finally {
      setQuickActionId("");
    }
  };

  const deleteUserHandler = async (user) => {
    if (user.role === "admin") {
      toast.error("Admin account cannot be deleted from here.");
      return;
    }

    if (
      !window.confirm(
        `Are you sure you want to delete ${user.name}? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      setDeletingId(user._id);

      await axios.delete(`/users/${user._id}`);

      toast.success("User deleted successfully");

      setUsers((prev) =>
        prev.filter((item) => item._id !== user._id)
      );
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to delete user"
      );
    } finally {
      setDeletingId("");
    }
  };

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return (
      <main className="elite-admin-users-page">
        <Message variant="danger">{error}</Message>

        <Button
          variant="dark"
          className="rounded-pill fw-bold mt-3"
          onClick={() => fetchUsers()}
        >
          Retry
        </Button>
      </main>
    );
  }

  return (
    <main className="elite-admin-users-page">
      <motion.section
        className="elite-admin-users-hero"
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
            className="elite-admin-users-hero-badge"
          >
            <FaShieldAlt className="me-2" />
            EliteShop User Command
          </Badge>

          <h1>Manage Users</h1>

          <p>
            Control customers, sellers, admins, seller approvals,
            blocked accounts, verified accounts, marketplace access and
            business profiles from one powerful ecommerce admin panel.
          </p>
        </div>

        <div className="elite-admin-users-hero-actions">
          <Button
            variant="light"
            disabled={refreshing}
            onClick={() => fetchUsers(true)}
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
          className="elite-admin-users-floating-badge"
          animate={{
            y: [0, -10, 0],
          }}
          transition={{
            duration: 3.5,
            repeat: Infinity,
          }}
        >
          <FaUserCog />
          Account Control
        </motion.div>
      </motion.section>

      <Row className="g-4 mb-4">
        <Col md={4} xl={2}>
          <Card className="elite-admin-user-stat total">
            <Card.Body>
              <FaUsers />
              <span>Total</span>
              <h2>{stats.total}</h2>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4} xl={2}>
          <Card className="elite-admin-user-stat customers">
            <Card.Body>
              <FaUser />
              <span>Customers</span>
              <h2>{stats.customers}</h2>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4} xl={2}>
          <Card className="elite-admin-user-stat sellers">
            <Card.Body>
              <FaStore />
              <span>Sellers</span>
              <h2>{stats.sellers}</h2>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4} xl={2}>
          <Card className="elite-admin-user-stat approved">
            <Card.Body>
              <FaUserCheck />
              <span>Approved</span>
              <h2>{stats.approvedSellers}</h2>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4} xl={2}>
          <Card className="elite-admin-user-stat pending">
            <Card.Body>
              <FaUserClock />
              <span>Pending</span>
              <h2>{stats.pendingSellers}</h2>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4} xl={2}>
          <Card className="elite-admin-user-stat admins">
            <Card.Body>
              <FaCrown />
              <span>Admins</span>
              <h2>{stats.admins}</h2>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-4 mb-4">
        <Col lg={8}>
          <Card className="elite-admin-users-showcase-card">
            <Card.Body>
              <div className="elite-admin-users-section-heading">
                <div>
                  <h4>Marketplace Account Health</h4>
                  <p>
                    Monitor users, sellers, verification, blocked
                    accounts and seller approval pipeline.
                  </p>
                </div>

                <Badge bg="dark">
                  {stats.active} active
                </Badge>
              </div>

              <Row className="g-3">
                <Col md={4}>
                  <div className="elite-admin-users-mini-card blue">
                    <FaCheckCircle />
                    <span>Verified</span>
                    <strong>{stats.verified}</strong>
                  </div>
                </Col>

                <Col md={4}>
                  <div className="elite-admin-users-mini-card red">
                    <FaBan />
                    <span>Blocked</span>
                    <strong>{stats.inactive}</strong>
                  </div>
                </Col>

                <Col md={4}>
                  <div className="elite-admin-users-mini-card green">
                    <FaWarehouse />
                    <span>Seller Pipeline</span>
                    <strong>{stats.pendingSellers}</strong>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className="elite-admin-users-tip-card">
            <Card.Body>
              <FaBolt />
              <h4>Real Ecommerce Flow</h4>
              <p>
                Customers can buy products. Sellers need approval before
                selling. Admin controls user access, seller status and
                marketplace safety.
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="elite-admin-users-filter-card">
        <Card.Body>
          <Row className="g-3 align-items-center">
            <Col lg={4}>
              <InputGroup className="elite-admin-users-search">
                <InputGroup.Text>
                  <FaSearch />
                </InputGroup.Text>

                <Form.Control
                  type="text"
                  placeholder="Search name, email, phone, role, shop, GST..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Col>

            <Col md={4} lg={2}>
              <Form.Select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="all">All Accounts</option>
                <option value="user">Customers</option>
                <option value="seller">All Sellers</option>
                <option value="approvedSeller">Approved Sellers</option>
                <option value="pendingSeller">Pending Sellers</option>
                <option value="admin">Admins</option>
              </Form.Select>
            </Col>

            <Col md={4} lg={2}>
              <Form.Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                {accountStatuses.map((status) => (
                  <option
                    key={status}
                    value={status}
                  >
                    {status === "all"
                      ? "All Status"
                      : status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </Form.Select>
            </Col>

            <Col md={4} lg={2}>
              <Form.Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="name">Name A-Z</option>
                <option value="role">Role</option>
              </Form.Select>
            </Col>

            <Col lg={2}>
              <Button
                className="elite-admin-users-refresh-btn"
                disabled={refreshing}
                onClick={() => fetchUsers(true)}
              >
                <FaFilter className="me-2" />
                Apply
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <div className="elite-admin-users-active-filter">
        <span>
          <FaFilter />
          Showing:
        </span>

        <Badge bg="primary">
          {filteredUsers.length} account(s)
        </Badge>

        <Badge bg="success">
          {stats.active} active
        </Badge>

        <Badge bg="danger">
          {stats.inactive} blocked
        </Badge>

        <Badge bg="warning" text="dark">
          {stats.pendingSellers} seller pending
        </Badge>
      </div>

      <Card className="elite-admin-users-table-card">
        <Card.Body>
          <div className="elite-admin-users-section-heading">
            <div>
              <h4>Users List</h4>
              <p>
                Manage account roles, seller approval, active status and
                business details.
              </p>
            </div>
          </div>

          {filteredUsers.length === 0 ? (
            <div className="elite-admin-users-empty">
              <FaUsers />

              <h4>No users found</h4>

              <p>
                Try changing search text, role filter or account status.
              </p>
            </div>
          ) : (
            <Table
              responsive
              hover
              className="elite-admin-users-table"
            >
              <thead>
                <tr>
                  <th>User</th>
                  <th>Contact</th>
                  <th>Role</th>
                  <th>Seller Status</th>
                  <th>Account</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user._id}>
                    <td>
                      <div className="elite-admin-user-cell">
                        <Image
                          src={
                            user.avatar ||
                            "/images/default-avatar.png"
                          }
                          roundedCircle
                        />

                        <div>
                          <strong>{user.name}</strong>

                          <small>
                            ID: {user._id?.substring(0, 8)}...
                          </small>

                          {user.role === "seller" &&
                            user.sellerInfo?.shopName && (
                              <span>
                                <FaStore />
                                {user.sellerInfo.shopName}
                              </span>
                            )}
                        </div>
                      </div>
                    </td>

                    <td>
                      <div className="elite-admin-user-contact">
                        <span>
                          <FaEnvelope />
                          {user.email}
                        </span>

                        <span>
                          <FaPhone />
                          {user.phone || "Not added"}
                        </span>
                      </div>
                    </td>

                    <td>
                      <Badge
                        bg={getRoleBadge(user.role)}
                        className="elite-admin-role-badge"
                      >
                        {getRoleIcon(user.role)}
                        {user.role}
                      </Badge>
                    </td>

                    <td>
                      {user.role === "seller" ? (
                        user.sellerInfo?.isApproved ? (
                          <Badge
                            bg="success"
                            className="elite-admin-users-badge"
                          >
                            Approved
                          </Badge>
                        ) : (
                          <Badge
                            bg="warning"
                            text="dark"
                            className="elite-admin-users-badge"
                          >
                            Pending
                          </Badge>
                        )
                      ) : (
                        <Badge
                          bg="secondary"
                          className="elite-admin-users-badge"
                        >
                          Not Seller
                        </Badge>
                      )}

                      {user.role === "seller" &&
                        user.sellerInfo?.productCategory && (
                          <small className="d-block text-muted mt-1">
                            {user.sellerInfo.productCategory}
                          </small>
                        )}
                    </td>

                    <td>
                      <div className="elite-admin-user-status">
                        {user.isVerified ? (
                          <span className="verified">
                            <FaCheckCircle />
                            Verified
                          </span>
                        ) : (
                          <span className="unverified">
                            <FaTimesCircle />
                            Unverified
                          </span>
                        )}

                        {user.isActive === false ? (
                          <span className="blocked">
                            <FaBan />
                            Blocked
                          </span>
                        ) : (
                          <span className="active">
                            <FaLockOpen />
                            Active
                          </span>
                        )}
                      </div>
                    </td>

                    <td>
                      <strong>
                        {user.createdAt
                          ? new Date(user.createdAt).toLocaleDateString(
                              "en-IN"
                            )
                          : "N/A"}
                      </strong>
                    </td>

                    <td>
                      <div className="elite-admin-user-actions">
                        <Button
                          size="sm"
                          variant="outline-dark"
                          onClick={() => openViewModal(user)}
                        >
                          <FaEye />
                        </Button>

                        <Button
                          size="sm"
                          variant="dark"
                          onClick={() => openEditModal(user)}
                        >
                          <FaEdit />
                        </Button>

                        <Dropdown>
                          <Dropdown.Toggle
                            size="sm"
                            variant="outline-primary"
                          >
                            Actions
                          </Dropdown.Toggle>

                          <Dropdown.Menu>
                            {user.role === "user" && (
                              <Dropdown.Item
                                disabled={quickActionId === user._id}
                                onClick={() => makeSellerHandler(user)}
                              >
                                <FaStore className="me-2" />
                                Make Seller
                              </Dropdown.Item>
                            )}

                            {user.role === "seller" &&
                              !user.sellerInfo?.isApproved && (
                                <Dropdown.Item
                                  disabled={quickActionId === user._id}
                                  onClick={() =>
                                    approveSellerHandler(user)
                                  }
                                >
                                  <FaCheckCircle className="me-2" />
                                  Approve Seller
                                </Dropdown.Item>
                              )}

                            {user.role === "seller" &&
                              user.sellerInfo?.isApproved && (
                                <Dropdown.Item
                                  disabled={quickActionId === user._id}
                                  onClick={() =>
                                    removeSellerApprovalHandler(user)
                                  }
                                >
                                  <FaTimesCircle className="me-2" />
                                  Remove Approval
                                </Dropdown.Item>
                              )}

                            {user.role === "seller" && (
                              <Dropdown.Item
                                disabled={quickActionId === user._id}
                                onClick={() => makeUserHandler(user)}
                              >
                                <FaUser className="me-2" />
                                Make Normal User
                              </Dropdown.Item>
                            )}

                            {user.role !== "admin" && (
                              <Dropdown.Item
                                disabled={quickActionId === user._id}
                                onClick={() => toggleActiveHandler(user)}
                              >
                                {user.isActive === false ? (
                                  <>
                                    <FaLockOpen className="me-2" />
                                    Unblock Account
                                  </>
                                ) : (
                                  <>
                                    <FaBan className="me-2" />
                                    Block Account
                                  </>
                                )}
                              </Dropdown.Item>
                            )}
                          </Dropdown.Menu>
                        </Dropdown>

                        <Button
                          size="sm"
                          variant="danger"
                          disabled={
                            deletingId === user._id ||
                            user.role === "admin"
                          }
                          onClick={() => deleteUserHandler(user)}
                        >
                          {deletingId === user._id ? (
                            <Spinner
                              animation="border"
                              size="sm"
                            />
                          ) : (
                            <FaTrash />
                          )}
                        </Button>
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
        show={showViewModal}
        onHide={() => setShowViewModal(false)}
        centered
        size="lg"
        className="elite-admin-users-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <FaEye className="me-2" />
            User Details
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {selectedUser && (
            <>
              <div className="elite-admin-user-profile-head">
                <Image
                  src={
                    selectedUser.avatar ||
                    "/images/default-avatar.png"
                  }
                  roundedCircle
                />

                <div>
                  <h3>{selectedUser.name}</h3>

                  <Badge bg={getRoleBadge(selectedUser.role)}>
                    {selectedUser.role}
                  </Badge>

                  <Badge
                    bg={
                      selectedUser.isActive === false
                        ? "danger"
                        : "success"
                    }
                    className="ms-2"
                  >
                    {selectedUser.isActive === false
                      ? "Blocked"
                      : "Active"}
                  </Badge>
                </div>
              </div>

              <Row className="g-3 mt-3">
                <Col md={6}>
                  <Card className="elite-admin-user-detail-card">
                    <Card.Body>
                      <h5>
                        <FaUser className="me-2" />
                        Basic Details
                      </h5>

                      <ListGroup variant="flush">
                        <ListGroup.Item>
                          <span>Email</span>
                          <strong>{selectedUser.email}</strong>
                        </ListGroup.Item>

                        <ListGroup.Item>
                          <span>Phone</span>
                          <strong>
                            {selectedUser.phone || "Not added"}
                          </strong>
                        </ListGroup.Item>

                        <ListGroup.Item>
                          <span>Address</span>
                          <strong>
                            {selectedUser.address || "Not added"}
                          </strong>
                        </ListGroup.Item>

                        <ListGroup.Item>
                          <span>Verified</span>
                          <strong>
                            {selectedUser.isVerified ? "Yes" : "No"}
                          </strong>
                        </ListGroup.Item>
                      </ListGroup>
                    </Card.Body>
                  </Card>
                </Col>

                <Col md={6}>
                  <Card className="elite-admin-user-detail-card">
                    <Card.Body>
                      <h5>
                        <FaShoppingBag className="me-2" />
                        Marketplace Access
                      </h5>

                      <ListGroup variant="flush">
                        <ListGroup.Item>
                          <span>Role</span>
                          <strong>{selectedUser.role}</strong>
                        </ListGroup.Item>

                        <ListGroup.Item>
                          <span>Seller Status</span>
                          <strong>
                            {getSellerStatus(selectedUser)}
                          </strong>
                        </ListGroup.Item>

                        <ListGroup.Item>
                          <span>Joined</span>
                          <strong>
                            {selectedUser.createdAt
                              ? new Date(
                                  selectedUser.createdAt
                                ).toLocaleDateString("en-IN")
                              : "N/A"}
                          </strong>
                        </ListGroup.Item>

                        <ListGroup.Item>
                          <span>User ID</span>
                          <strong>{selectedUser._id}</strong>
                        </ListGroup.Item>
                      </ListGroup>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              {selectedUser.role === "seller" && (
                <Card className="elite-admin-user-detail-card mt-3">
                  <Card.Body>
                    <h5>
                      <FaStore className="me-2" />
                      Seller Business Details
                    </h5>

                    <Row className="g-3">
                      <Col md={6}>
                        <div className="elite-admin-user-business-box">
                          <span>Shop Name</span>
                          <strong>
                            {selectedUser.sellerInfo?.shopName ||
                              "Not added"}
                          </strong>
                        </div>
                      </Col>

                      <Col md={6}>
                        <div className="elite-admin-user-business-box">
                          <span>Business Email</span>
                          <strong>
                            {selectedUser.sellerInfo?.businessEmail ||
                              selectedUser.email}
                          </strong>
                        </div>
                      </Col>

                      <Col md={6}>
                        <div className="elite-admin-user-business-box">
                          <span>GST Number</span>
                          <strong>
                            {selectedUser.sellerInfo?.gstNumber ||
                              "Not added"}
                          </strong>
                        </div>
                      </Col>

                      <Col md={6}>
                        <div className="elite-admin-user-business-box">
                          <span>Product Category</span>
                          <strong>
                            {selectedUser.sellerInfo?.productCategory ||
                              "General"}
                          </strong>
                        </div>
                      </Col>

                      <Col md={12}>
                        <div className="elite-admin-user-business-box">
                          <span>Shop Address</span>
                          <strong>
                            {selectedUser.sellerInfo?.shopAddress ||
                              "Not added"}
                          </strong>
                        </div>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              )}
            </>
          )}
        </Modal.Body>

        <Modal.Footer>
          {selectedUser && (
            <Button
              variant="dark"
              onClick={() => {
                setShowViewModal(false);
                openEditModal(selectedUser);
              }}
            >
              Edit User
            </Button>
          )}

          <Button
            variant="secondary"
            onClick={() => setShowViewModal(false)}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        centered
        size="lg"
        className="elite-admin-users-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <FaEdit className="me-2" />
            Edit User Account
          </Modal.Title>
        </Modal.Header>

        <Form onSubmit={updateUserHandler}>
          <Modal.Body>
            <Row className="g-4">
              <Col md={4}>
                <div className="elite-admin-user-modal-avatar">
                  <Image
                    src={
                      form.avatar ||
                      "/images/default-avatar.png"
                    }
                    roundedCircle
                  />

                  <Badge bg={getRoleBadge(form.role)}>
                    {form.role}
                  </Badge>
                </div>

                <Alert
                  variant="info"
                  className="elite-admin-users-alert"
                >
                  Admin can convert customer to seller, approve seller
                  and block unsafe accounts.
                </Alert>
              </Col>

              <Col md={8}>
                <Row className="g-3">
                  <Col md={12}>
                    <Form.Group>
                      <Form.Label>Avatar URL</Form.Label>

                      <Form.Control
                        name="avatar"
                        type="text"
                        value={form.avatar}
                        onChange={changeHandler}
                        placeholder="Image URL"
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Role</Form.Label>

                      <Form.Select
                        name="role"
                        value={form.role}
                        onChange={changeHandler}
                      >
                        <option value="user">User</option>
                        <option value="seller">Seller</option>
                        <option value="admin">Admin</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Name</Form.Label>

                      <Form.Control
                        name="name"
                        type="text"
                        value={form.name}
                        onChange={changeHandler}
                        required
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Email</Form.Label>

                      <Form.Control
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={changeHandler}
                        required
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Phone</Form.Label>

                      <Form.Control
                        name="phone"
                        type="text"
                        value={form.phone}
                        onChange={changeHandler}
                      />
                    </Form.Group>
                  </Col>

                  <Col md={12}>
                    <Form.Group>
                      <Form.Label>Address</Form.Label>

                      <Form.Control
                        name="address"
                        type="text"
                        value={form.address}
                        onChange={changeHandler}
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Check
                      type="switch"
                      name="isVerified"
                      label="Verified Account"
                      checked={form.isVerified}
                      onChange={changeHandler}
                      className="elite-admin-users-switch"
                    />
                  </Col>

                  <Col md={6}>
                    <Form.Check
                      type="switch"
                      name="isActive"
                      label="Active Account"
                      checked={form.isActive}
                      onChange={changeHandler}
                      className="elite-admin-users-switch"
                    />
                  </Col>
                </Row>
              </Col>
            </Row>

            {form.role === "seller" && (
              <div className="elite-admin-seller-edit-box">
                <h5>
                  <FaStore className="me-2" />
                  Seller Business Details
                </h5>

                <Alert
                  variant="info"
                  className="elite-admin-users-alert"
                >
                  Seller can add and manage products only after admin
                  approval. Use this section to verify shop and business
                  details.
                </Alert>

                <Row className="g-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Shop Name</Form.Label>

                      <Form.Control
                        name="shopName"
                        type="text"
                        value={form.shopName}
                        onChange={changeHandler}
                        placeholder="Seller Shop Name"
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Product Category</Form.Label>

                      <Form.Select
                        name="productCategory"
                        value={form.productCategory}
                        onChange={changeHandler}
                      >
                        <option value="">Select Category</option>

                        {productCategories.map((category) => (
                          <option
                            key={category}
                            value={category}
                          >
                            {category}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Business Phone</Form.Label>

                      <Form.Control
                        name="businessPhone"
                        type="text"
                        value={form.businessPhone}
                        onChange={changeHandler}
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Business Email</Form.Label>

                      <Form.Control
                        name="businessEmail"
                        type="email"
                        value={form.businessEmail}
                        onChange={changeHandler}
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>GST Number</Form.Label>

                      <Form.Control
                        name="gstNumber"
                        type="text"
                        value={form.gstNumber}
                        onChange={changeHandler}
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Bank Account</Form.Label>

                      <Form.Control
                        name="bankAccount"
                        type="text"
                        value={form.bankAccount}
                        onChange={changeHandler}
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Shop Address</Form.Label>

                      <Form.Control
                        name="shopAddress"
                        type="text"
                        value={form.shopAddress}
                        onChange={changeHandler}
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Pickup Address</Form.Label>

                      <Form.Control
                        name="pickupAddress"
                        type="text"
                        value={form.pickupAddress}
                        onChange={changeHandler}
                      />
                    </Form.Group>
                  </Col>

                  <Col md={12}>
                    <Form.Group>
                      <Form.Label>Business Description</Form.Label>

                      <Form.Control
                        as="textarea"
                        rows={3}
                        name="businessDescription"
                        value={form.businessDescription}
                        onChange={changeHandler}
                      />
                    </Form.Group>
                  </Col>

                  <Col md={12}>
                    <Form.Check
                      type="switch"
                      name="isApproved"
                      label="Approve Seller Now"
                      checked={form.isApproved}
                      onChange={changeHandler}
                      className="elite-admin-users-switch"
                    />
                  </Col>
                </Row>
              </div>
            )}
          </Modal.Body>

          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => setShowModal(false)}
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
                "Update User"
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </main>
  );
};

export default AdminUsersPage;