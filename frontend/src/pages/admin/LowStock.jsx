"use client";

import {
  useEffect,
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
} from "react-bootstrap";

import {
  FaSearch,
  FaExclamationTriangle,
  FaBoxOpen,
  FaEdit,
  FaEye,
  FaSyncAlt,
  FaPlus,
  FaMinus,
} from "react-icons/fa";

import { Link } from "react-router-dom";

import { motion } from "framer-motion";

import { toast } from "react-toastify";

import Loader from "../../components/Loader";
import Message from "../../components/Message";

import axios from "../../utils/axios";

const LowStockPage = () => {
  const [products, setProducts] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [searchTerm, setSearchTerm] =
    useState("");

  const [showStockModal, setShowStockModal] =
    useState(false);

  const [selectedProduct, setSelectedProduct] =
    useState(null);

  const [newStock, setNewStock] =
    useState("");

  const [updating, setUpdating] =
    useState(false);

  // ======================================
  // FETCH LOW STOCK PRODUCTS
  // GET /api/products/lowstock
  // ======================================

  const fetchLowStockProducts = async () => {
    try {
      setLoading(true);

      const { data } =
        await axios.get(
          "/products/lowstock"
        );

      setProducts(data || []);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          error.message
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLowStockProducts();
  }, []);

  // ======================================
  // OPEN STOCK MODAL
  // ======================================

  const openStockModal = (product) => {
    setSelectedProduct(product);

    setNewStock(
      product.countInStock || 0
    );

    setShowStockModal(true);
  };

  // ======================================
  // QUICK STOCK CHANGE
  // ======================================

  const increaseStock = () => {
    setNewStock((prev) =>
      Number(prev || 0) + 1
    );
  };

  const decreaseStock = () => {
    setNewStock((prev) =>
      Math.max(
        Number(prev || 0) - 1,
        0
      )
    );
  };

  // ======================================
  // UPDATE PRODUCT STOCK
  // PUT /api/products/:id
  // ======================================

  const updateStockHandler = async (e) => {
    e.preventDefault();

    if (!selectedProduct) {
      return;
    }

    if (Number(newStock) < 0) {
      toast.error(
        "Stock cannot be negative"
      );

      return;
    }

    try {
      setUpdating(true);

      const payload = {
        name: selectedProduct.name,
        image: selectedProduct.image,
        images:
          selectedProduct.images || [],
        brand: selectedProduct.brand,
        category:
          selectedProduct.category,
        description:
          selectedProduct.description,
        price: Number(
          selectedProduct.price
        ),
        originalPrice:
          Number(
            selectedProduct.originalPrice
          ) ||
          Number(selectedProduct.price),
        countInStock:
          Number(newStock),
        freeShipping:
          selectedProduct.freeShipping ||
          false,
        shippingPrice:
          Number(
            selectedProduct.shippingPrice
          ) || 0,
        tags:
          selectedProduct.tags || [],
        isFeatured:
          selectedProduct.isFeatured ||
          false,
      };

      await axios.put(
        `/products/${selectedProduct._id}`,
        payload
      );

      toast.success(
        "Stock updated successfully"
      );

      setShowStockModal(false);

      fetchLowStockProducts();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message
      );
    } finally {
      setUpdating(false);
    }
  };

  // ======================================
  // FILTER PRODUCTS
  // ======================================

  const filteredProducts =
    products.filter((product) => {
      const search =
        searchTerm.toLowerCase();

      return (
        product.name
          ?.toLowerCase()
          .includes(search) ||
        product.brand
          ?.toLowerCase()
          .includes(search) ||
        product.category
          ?.toLowerCase()
          .includes(search) ||
        product.seller?.name
          ?.toLowerCase()
          .includes(search)
      );
    });

  // ======================================
  // STATS
  // ======================================

  const totalLowStock =
    products.length;

  const outOfStock =
    products.filter(
      (product) =>
        product.countInStock === 0
    ).length;

  const criticalStock =
    products.filter(
      (product) =>
        product.countInStock > 0 &&
        product.countInStock <= 2
    ).length;

  const warningStock =
    products.filter(
      (product) =>
        product.countInStock > 2 &&
        product.countInStock <= 5
    ).length;

  const getStockBadge = (stock) => {
    if (stock === 0) {
      return "danger";
    }

    if (stock <= 2) {
      return "warning";
    }

    return "info";
  };

  const getStockText = (stock) => {
    if (stock === 0) {
      return "Out Of Stock";
    }

    if (stock <= 2) {
      return "Critical";
    }

    return "Low Stock";
  };

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return (
      <Message variant="danger">
        {error}
      </Message>
    );
  }

  return (
    <motion.div
      initial={{
        opacity: 0,
      }}
      animate={{
        opacity: 1,
      }}
      transition={{
        duration: 0.4,
      }}
      className="py-4"
    >
      {/* HEADER */}

      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1">
            Low Stock Products
          </h2>

          <p className="text-muted mb-0">
            Monitor products that need restocking before they go out of stock
          </p>
        </div>

        <Button
          variant="dark"
          onClick={
            fetchLowStockProducts
          }
        >
          <FaSyncAlt className="me-2" />
          Refresh
        </Button>
      </div>

      {/* STATS */}

      <Row className="g-4 mb-4">
        <Col md={3}>
          <Card className="shadow-sm border-0 rounded-4 p-3">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h6 className="text-muted">
                  Low Stock Items
                </h6>

                <h3 className="fw-bold mb-0">
                  {totalLowStock}
                </h3>
              </div>

              <FaBoxOpen
                size={34}
                className="text-primary"
              />
            </div>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="shadow-sm border-0 rounded-4 p-3">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h6 className="text-muted">
                  Out Of Stock
                </h6>

                <h3 className="fw-bold mb-0 text-danger">
                  {outOfStock}
                </h3>
              </div>

              <FaExclamationTriangle
                size={34}
                className="text-danger"
              />
            </div>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="shadow-sm border-0 rounded-4 p-3">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h6 className="text-muted">
                  Critical Stock
                </h6>

                <h3 className="fw-bold mb-0 text-warning">
                  {criticalStock}
                </h3>
              </div>

              <FaExclamationTriangle
                size={34}
                className="text-warning"
              />
            </div>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="shadow-sm border-0 rounded-4 p-3">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h6 className="text-muted">
                  Warning Stock
                </h6>

                <h3 className="fw-bold mb-0 text-info">
                  {warningStock}
                </h3>
              </div>

              <FaBoxOpen
                size={34}
                className="text-info"
              />
            </div>
          </Card>
        </Col>
      </Row>

      {/* TABLE */}

      <Card className="shadow-lg border-0 rounded-4">
        <Card.Body className="p-4">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
            <h4 className="fw-bold mb-0">
              Restock List
            </h4>

            <InputGroup
              style={{
                maxWidth: "360px",
              }}
            >
              <InputGroup.Text>
                <FaSearch />
              </InputGroup.Text>

              <Form.Control
                type="text"
                placeholder="Search low stock products..."
                value={searchTerm}
                onChange={(e) =>
                  setSearchTerm(
                    e.target.value
                  )
                }
              />
            </InputGroup>
          </div>

          {filteredProducts.length === 0 ? (
            <Message variant="success">
              No low stock products found.
            </Message>
          ) : (
            <Table
              responsive
              hover
              className="align-middle"
            >
              <thead>
                <tr>
                  <th>PRODUCT</th>
                  <th>CATEGORY</th>
                  <th>SELLER</th>
                  <th>PRICE</th>
                  <th>STOCK</th>
                  <th>STATUS</th>
                  <th>UPDATED</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>

              <tbody>
                {filteredProducts.map(
                  (product) => (
                    <tr key={product._id}>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <Image
                            src={
                              product.image ||
                              "/placeholder.svg"
                            }
                            rounded
                            style={{
                              width: "58px",
                              height: "58px",
                              objectFit:
                                "cover",
                            }}
                          />

                          <div>
                            <strong>
                              {product.name}
                            </strong>

                            <div className="small text-muted">
                              {product.brand}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td>
                        <Badge bg="secondary">
                          {product.category}
                        </Badge>
                      </td>

                      <td>
                        {product.seller?.name ||
                          "Admin"}
                      </td>

                      <td>
                        <strong>
                          ₹{product.price}
                        </strong>
                      </td>

                      <td>
                        <strong
                          className={
                            product.countInStock ===
                            0
                              ? "text-danger"
                              : product.countInStock <=
                                2
                              ? "text-warning"
                              : "text-info"
                          }
                        >
                          {
                            product.countInStock
                          }
                        </strong>
                      </td>

                      <td>
                        <Badge
                          bg={getStockBadge(
                            product.countInStock
                          )}
                          text={
                            product.countInStock <=
                              2 &&
                            product.countInStock >
                              0
                              ? "dark"
                              : undefined
                          }
                          className="p-2"
                        >
                          {getStockText(
                            product.countInStock
                          )}
                        </Badge>
                      </td>

                      <td>
                        {product.updatedAt
                          ? new Date(
                              product.updatedAt
                            ).toLocaleDateString()
                          : "N/A"}
                      </td>

                      <td>
                        <div className="d-flex flex-wrap gap-2">
                          <Button
                            as={Link}
                            to={`/product/${product.slug}`}
                            size="sm"
                            variant="outline-dark"
                          >
                            <FaEye />
                          </Button>

                          <Button
                            size="sm"
                            variant="dark"
                            onClick={() =>
                              openStockModal(
                                product
                              )
                            }
                          >
                            <FaEdit className="me-1" />
                            Stock
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* UPDATE STOCK MODAL */}

      <Modal
        show={showStockModal}
        onHide={() =>
          setShowStockModal(false)
        }
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            Update Stock
          </Modal.Title>
        </Modal.Header>

        <Form
          onSubmit={
            updateStockHandler
          }
        >
          <Modal.Body>
            {selectedProduct && (
              <>
                <div className="d-flex align-items-center gap-3 mb-4">
                  <Image
                    src={
                      selectedProduct.image ||
                      "/placeholder.svg"
                    }
                    rounded
                    style={{
                      width: "80px",
                      height: "80px",
                      objectFit: "cover",
                    }}
                  />

                  <div>
                    <h5 className="mb-1">
                      {
                        selectedProduct.name
                      }
                    </h5>

                    <p className="text-muted mb-0">
                      Current Stock:{" "}
                      {
                        selectedProduct.countInStock
                      }
                    </p>
                  </div>
                </div>

                <Form.Group className="mb-3">
                  <Form.Label>
                    New Stock Quantity
                  </Form.Label>

                  <InputGroup>
                    <Button
                      variant="outline-secondary"
                      type="button"
                      onClick={
                        decreaseStock
                      }
                    >
                      <FaMinus />
                    </Button>

                    <Form.Control
                      type="number"
                      min="0"
                      value={newStock}
                      onChange={(e) =>
                        setNewStock(
                          e.target.value
                        )
                      }
                      required
                    />

                    <Button
                      variant="outline-secondary"
                      type="button"
                      onClick={
                        increaseStock
                      }
                    >
                      <FaPlus />
                    </Button>
                  </InputGroup>
                </Form.Group>

                <div className="small text-muted">
                  Tip: Keep stock above 5 to remove it from the low stock list.
                </div>
              </>
            )}
          </Modal.Body>

          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() =>
                setShowStockModal(false)
              }
            >
              Cancel
            </Button>

            <Button
              type="submit"
              variant="dark"
              disabled={updating}
            >
              {updating
                ? "Updating..."
                : "Update Stock"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </motion.div>
  );
};

export default LowStockPage;