"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  Row,
  Col,
  Card,
  Form,
  Button,
  Image,
  Spinner,
  Badge,
  Alert,
  InputGroup,
} from "react-bootstrap";

import {
  FaSave,
  FaUpload,
  FaTrash,
  FaArrowLeft,
  FaEye,
  FaBoxOpen,
  FaRupeeSign,
  FaTags,
  FaTruck,
  FaStar,
  FaFire,
} from "react-icons/fa";

import {
  useNavigate,
  useParams,
  Link,
} from "react-router-dom";

import { motion } from "framer-motion";

import { toast } from "react-toastify";

import Loader from "../../components/Loader";
import Message from "../../components/Message";

import api from "../../utils/axios";

const EditProduct = () => {
  const { id } = useParams();

  const navigate = useNavigate();

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [uploading, setUploading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [product, setProduct] =
    useState(null);

  const [formData, setFormData] =
    useState({
      name: "",
      image: "",
      images: [],
      brand: "",
      category: "",
      description: "",
      price: "",
      originalPrice: "",
      countInStock: "",
      freeShipping: false,
      shippingPrice: "",
      tags: "",
      isFeatured: false,
      isActive: true,
      lowStockThreshold: 5,
    });

  // ======================================
  // FETCH PRODUCT
  // GET /api/products/:id
  // ======================================

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);

        const { data } =
          await api.get(
            `/products/${id}`
          );

        setProduct(data);

        setFormData({
          name: data.name || "",
          image: data.image || "",
          images: data.images || [],
          brand: data.brand || "",
          category: data.category || "",
          description:
            data.description || "",
          price: data.price || "",
          originalPrice:
            data.originalPrice ||
            data.price ||
            "",
          countInStock:
            data.countInStock ?? "",
          freeShipping:
            data.freeShipping || false,
          shippingPrice:
            data.shippingPrice || "",
          tags:
            data.tags?.length > 0
              ? data.tags.join(", ")
              : "",
          isFeatured:
            data.isFeatured || false,
          isActive:
            data.isActive !== false,
          lowStockThreshold:
            data.lowStockThreshold || 5,
        });
      } catch (error) {
        setError(
          error.response?.data?.message ||
            error.message
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // ======================================
  // HANDLE INPUT CHANGE
  // ======================================

  const changeHandler = (e) => {
    const {
      name,
      value,
      type,
      checked,
    } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  // ======================================
  // UPLOAD SINGLE IMAGE
  // POST /api/upload
  // field name: image
  // ======================================

  const uploadMainImageHandler =
    async (e) => {
      const file = e.target.files[0];

      if (!file) return;

      const uploadData =
        new FormData();

      uploadData.append(
        "image",
        file
      );

      try {
        setUploading(true);

        const { data } =
          await api.post(
            "/upload",
            uploadData,
            {
              headers: {
                "Content-Type":
                  "multipart/form-data",
              },
            }
          );

        setFormData((prev) => ({
          ...prev,
          image: data.image,
          images: [
            data.image,
            ...prev.images.filter(
              (img) =>
                img !== data.image
            ),
          ],
        }));

        toast.success(
          "Main image uploaded"
        );
      } catch (error) {
        toast.error(
          error.response?.data?.message ||
            error.message
        );
      } finally {
        setUploading(false);
      }
    };

  // ======================================
  // UPLOAD MULTIPLE IMAGES
  // POST /api/upload/multiple
  // field name: images
  // ======================================

  const uploadGalleryImagesHandler =
    async (e) => {
      const files =
        Array.from(e.target.files);

      if (files.length === 0) return;

      const uploadData =
        new FormData();

      files.forEach((file) => {
        uploadData.append(
          "images",
          file
        );
      });

      try {
        setUploading(true);

        const { data } =
          await api.post(
            "/upload/multiple",
            uploadData,
            {
              headers: {
                "Content-Type":
                  "multipart/form-data",
              },
            }
          );

        const uploadedImages =
          data.images?.map(
            (item) => item.image
          ) || [];

        setFormData((prev) => ({
          ...prev,
          images: [
            ...prev.images,
            ...uploadedImages,
          ],
          image:
            prev.image ||
            uploadedImages[0] ||
            "",
        }));

        toast.success(
          "Gallery images uploaded"
        );
      } catch (error) {
        toast.error(
          error.response?.data?.message ||
            error.message
        );
      } finally {
        setUploading(false);
      }
    };

  // ======================================
  // REMOVE GALLERY IMAGE
  // ======================================

  const removeImageHandler = (img) => {
    setFormData((prev) => {
      const updatedImages =
        prev.images.filter(
          (item) => item !== img
        );

      return {
        ...prev,
        images: updatedImages,
        image:
          prev.image === img
            ? updatedImages[0] || ""
            : prev.image,
      };
    });
  };

  // ======================================
  // SET MAIN IMAGE
  // ======================================

  const setMainImageHandler = (img) => {
    setFormData((prev) => ({
      ...prev,
      image: img,
    }));

    toast.success(
      "Main image selected"
    );
  };

  // ======================================
  // VALIDATION
  // ======================================

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error(
        "Product name is required"
      );
      return false;
    }

    if (!formData.brand.trim()) {
      toast.error("Brand is required");
      return false;
    }

    if (!formData.category.trim()) {
      toast.error(
        "Category is required"
      );
      return false;
    }

    if (
      !formData.description.trim()
    ) {
      toast.error(
        "Description is required"
      );
      return false;
    }

    if (!formData.image) {
      toast.error(
        "Product image is required"
      );
      return false;
    }

    if (Number(formData.price) <= 0) {
      toast.error(
        "Price must be greater than 0"
      );
      return false;
    }

    if (
      Number(formData.countInStock) < 0
    ) {
      toast.error(
        "Stock cannot be negative"
      );
      return false;
    }

    return true;
  };

  // ======================================
  // UPDATE PRODUCT
  // PUT /api/products/:id
  // ======================================

  const submitHandler = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setSaving(true);

      const price =
        Number(formData.price);

      const originalPrice =
        Number(
          formData.originalPrice
        ) || price;

      const payload = {
        name: formData.name.trim(),
        image: formData.image,
        images:
          formData.images.length > 0
            ? formData.images
            : [formData.image],
        brand: formData.brand.trim(),
        category:
          formData.category.trim(),
        description:
          formData.description.trim(),
        price,
        originalPrice,
        countInStock: Number(
          formData.countInStock
        ),
        freeShipping:
          formData.freeShipping,
        shippingPrice:
          formData.freeShipping
            ? 0
            : Number(
                formData.shippingPrice
              ) || 0,
        tags:
          formData.tags.trim().length >
          0
            ? formData.tags
                .split(",")
                .map((tag) =>
                  tag.trim()
                )
                .filter(Boolean)
            : [],
        isFeatured:
          formData.isFeatured,
        isActive:
          formData.isActive,
        lowStockThreshold:
          Number(
            formData.lowStockThreshold
          ) || 5,
      };

      await api.put(
        `/products/${id}`,
        payload
      );

      toast.success(
        "Product updated successfully"
      );

      navigate(
        "/seller/dashboard"
      );
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message
      );
    } finally {
      setSaving(false);
    }
  };

  // ======================================
  // UI HELPERS
  // ======================================

  const discountPercentage =
    Number(formData.originalPrice) >
      Number(formData.price) &&
    Number(formData.originalPrice) > 0
      ? Math.round(
          ((Number(
            formData.originalPrice
          ) -
            Number(formData.price)) /
            Number(
              formData.originalPrice
            )) *
            100
        )
      : 0;

  const inventoryValue =
    Number(formData.price || 0) *
    Number(formData.countInStock || 0);

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
            Edit Product
          </h2>

          <p className="text-muted mb-0">
            Update product information, pricing, stock, images and visibility
          </p>
        </div>

        <div className="d-flex gap-2 flex-wrap">
          <Button
            variant="outline-dark"
            onClick={() =>
              navigate(
                "/seller/dashboard"
              )
            }
          >
            <FaArrowLeft className="me-2" />
            Back
          </Button>

          {product?.slug && (
            <Button
              as={Link}
              to={`/product/${product.slug}`}
              variant="dark"
            >
              <FaEye className="me-2" />
              View Product
            </Button>
          )}
        </div>
      </div>

      {/* STATS */}

      <Row className="g-4 mb-4">
        <Col md={3}>
          <Card className="shadow-sm border-0 rounded-4 p-3 h-100">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h6 className="text-muted">
                  Price
                </h6>

                <h4 className="fw-bold mb-0">
                  ₹
                  {Number(
                    formData.price || 0
                  ).toLocaleString()}
                </h4>
              </div>

              <FaRupeeSign className="text-success" size={32} />
            </div>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="shadow-sm border-0 rounded-4 p-3 h-100">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h6 className="text-muted">
                  Stock
                </h6>

                <h4
                  className={`fw-bold mb-0 ${
                    Number(
                      formData.countInStock
                    ) <=
                    Number(
                      formData.lowStockThreshold
                    )
                      ? "text-danger"
                      : "text-success"
                  }`}
                >
                  {formData.countInStock || 0}
                </h4>
              </div>

              <FaBoxOpen className="text-warning" size={32} />
            </div>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="shadow-sm border-0 rounded-4 p-3 h-100">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h6 className="text-muted">
                  Discount
                </h6>

                <h4 className="fw-bold mb-0 text-danger">
                  {discountPercentage}%
                </h4>
              </div>

              <FaTags className="text-danger" size={32} />
            </div>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="shadow-sm border-0 rounded-4 p-3 h-100">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h6 className="text-muted">
                  Inventory Value
                </h6>

                <h4 className="fw-bold mb-0">
                  ₹
                  {inventoryValue.toLocaleString()}
                </h4>
              </div>

              <FaChartIcon />
            </div>
          </Card>
        </Col>
      </Row>

      <Form onSubmit={submitHandler}>
        <Row className="g-4">
          {/* LEFT FORM */}

          <Col lg={8}>
            <Card className="shadow-lg border-0 rounded-4 mb-4">
              <Card.Body className="p-4">
                <h4 className="fw-bold mb-4">
                  Product Details
                </h4>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        Product Name
                      </Form.Label>

                      <Form.Control
                        type="text"
                        name="name"
                        value={
                          formData.name
                        }
                        onChange={
                          changeHandler
                        }
                        placeholder="Enter product name"
                        required
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        Brand
                      </Form.Label>

                      <Form.Control
                        type="text"
                        name="brand"
                        value={
                          formData.brand
                        }
                        onChange={
                          changeHandler
                        }
                        placeholder="Apple, Samsung, Nike..."
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        Category
                      </Form.Label>

                      <Form.Control
                        type="text"
                        name="category"
                        value={
                          formData.category
                        }
                        onChange={
                          changeHandler
                        }
                        placeholder="Mobiles, Fashion, Gaming..."
                        required
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        Tags
                      </Form.Label>

                      <Form.Control
                        type="text"
                        name="tags"
                        value={
                          formData.tags
                        }
                        onChange={
                          changeHandler
                        }
                        placeholder="premium, trending, gaming"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>
                    Description
                  </Form.Label>

                  <Form.Control
                    as="textarea"
                    rows={5}
                    name="description"
                    value={
                      formData.description
                    }
                    onChange={
                      changeHandler
                    }
                    placeholder="Write clear product description..."
                    required
                  />
                </Form.Group>
              </Card.Body>
            </Card>

            {/* PRICE / STOCK */}

            <Card className="shadow-lg border-0 rounded-4 mb-4">
              <Card.Body className="p-4">
                <h4 className="fw-bold mb-4">
                  Price, Stock & Shipping
                </h4>

                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        Selling Price
                      </Form.Label>

                      <InputGroup>
                        <InputGroup.Text>
                          ₹
                        </InputGroup.Text>

                        <Form.Control
                          type="number"
                          name="price"
                          value={
                            formData.price
                          }
                          onChange={
                            changeHandler
                          }
                          min="1"
                          required
                        />
                      </InputGroup>
                    </Form.Group>
                  </Col>

                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        Original Price
                      </Form.Label>

                      <InputGroup>
                        <InputGroup.Text>
                          ₹
                        </InputGroup.Text>

                        <Form.Control
                          type="number"
                          name="originalPrice"
                          value={
                            formData.originalPrice
                          }
                          onChange={
                            changeHandler
                          }
                          min="0"
                        />
                      </InputGroup>
                    </Form.Group>
                  </Col>

                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        Stock Quantity
                      </Form.Label>

                      <Form.Control
                        type="number"
                        name="countInStock"
                        value={
                          formData.countInStock
                        }
                        onChange={
                          changeHandler
                        }
                        min="0"
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        Low Stock Alert
                      </Form.Label>

                      <Form.Control
                        type="number"
                        name="lowStockThreshold"
                        value={
                          formData.lowStockThreshold
                        }
                        onChange={
                          changeHandler
                        }
                        min="1"
                      />
                    </Form.Group>
                  </Col>

                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        Shipping Price
                      </Form.Label>

                      <InputGroup>
                        <InputGroup.Text>
                          ₹
                        </InputGroup.Text>

                        <Form.Control
                          type="number"
                          name="shippingPrice"
                          value={
                            formData.freeShipping
                              ? 0
                              : formData.shippingPrice
                          }
                          onChange={
                            changeHandler
                          }
                          min="0"
                          disabled={
                            formData.freeShipping
                          }
                        />
                      </InputGroup>
                    </Form.Group>
                  </Col>

                  <Col md={4}>
                    <Form.Group className="mb-3 mt-md-4 pt-md-2">
                      <Form.Check
                        type="checkbox"
                        label="Free Shipping"
                        name="freeShipping"
                        checked={
                          formData.freeShipping
                        }
                        onChange={
                          changeHandler
                        }
                      />

                      <Form.Check
                        type="checkbox"
                        label="Featured Product"
                        name="isFeatured"
                        checked={
                          formData.isFeatured
                        }
                        onChange={
                          changeHandler
                        }
                        className="mt-2"
                      />

                      <Form.Check
                        type="checkbox"
                        label="Active Product"
                        name="isActive"
                        checked={
                          formData.isActive
                        }
                        onChange={
                          changeHandler
                        }
                        className="mt-2"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {Number(
                  formData.countInStock
                ) <=
                  Number(
                    formData.lowStockThreshold
                  ) && (
                  <Alert
                    variant="warning"
                    className="mb-0"
                  >
                    <FaFire className="me-2" />
                    This product is currently in low stock range.
                  </Alert>
                )}
              </Card.Body>
            </Card>

            {/* IMAGES */}

            <Card className="shadow-lg border-0 rounded-4">
              <Card.Body className="p-4">
                <h4 className="fw-bold mb-4">
                  Product Images
                </h4>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        Upload Main Image
                      </Form.Label>

                      <Form.Control
                        type="file"
                        accept="image/*"
                        onChange={
                          uploadMainImageHandler
                        }
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        Upload Gallery Images
                      </Form.Label>

                      <Form.Control
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={
                          uploadGalleryImagesHandler
                        }
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {uploading && (
                  <div className="my-3">
                    <Spinner animation="border" />{" "}
                    Uploading image...
                  </div>
                )}

                {formData.image && (
                  <div className="mb-4">
                    <h6 className="fw-bold">
                      Main Image
                    </h6>

                    <Image
                      src={
                        formData.image
                      }
                      rounded
                      fluid
                      style={{
                        maxHeight:
                          "260px",
                        objectFit:
                          "cover",
                      }}
                    />
                  </div>
                )}

                {formData.images.length >
                  0 && (
                  <div>
                    <h6 className="fw-bold">
                      Gallery
                    </h6>

                    <div className="d-flex gap-3 flex-wrap">
                      {formData.images.map(
                        (img, index) => (
                          <div
                            key={`${img}-${index}`}
                            className="position-relative"
                          >
                            <Image
                              src={img}
                              rounded
                              style={{
                                width: "110px",
                                height: "110px",
                                objectFit:
                                  "cover",
                                border:
                                  formData.image ===
                                  img
                                    ? "3px solid #198754"
                                    : "1px solid #ddd",
                                cursor:
                                  "pointer",
                              }}
                              onClick={() =>
                                setMainImageHandler(
                                  img
                                )
                              }
                            />

                            {formData.image ===
                              img && (
                              <Badge
                                bg="success"
                                className="position-absolute top-0 start-0 m-1"
                              >
                                Main
                              </Badge>
                            )}

                            <Button
                              size="sm"
                              variant="danger"
                              className="position-absolute top-0 end-0 m-1"
                              onClick={() =>
                                removeImageHandler(
                                  img
                                )
                              }
                            >
                              <FaTrash />
                            </Button>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>

          {/* RIGHT PREVIEW */}

          <Col lg={4}>
            <div
              style={{
                position: "sticky",
                top: "100px",
              }}
            >
              <Card className="shadow-lg border-0 rounded-4 overflow-hidden mb-4">
                {formData.image && (
                  <Image
                    src={formData.image}
                    alt={formData.name}
                    style={{
                      width: "100%",
                      height: "300px",
                      objectFit: "cover",
                    }}
                  />
                )}

                <Card.Body>
                  <div className="d-flex justify-content-between align-items-start gap-2 mb-2">
                    <h4 className="fw-bold mb-0">
                      {formData.name ||
                        "Product Name"}
                    </h4>

                    {formData.isFeatured && (
                      <Badge bg="danger">
                        Featured
                      </Badge>
                    )}
                  </div>

                  <p className="text-muted mb-2">
                    {formData.brand ||
                      "Brand"}{" "}
                    •{" "}
                    {formData.category ||
                      "Category"}
                  </p>

                  <div className="d-flex align-items-center gap-2 mb-3">
                    <h3 className="text-primary fw-bold mb-0">
                      ₹
                      {formData.price ||
                        0}
                    </h3>

                    {discountPercentage >
                      0 && (
                      <>
                        <del className="text-muted">
                          ₹
                          {
                            formData.originalPrice
                          }
                        </del>

                        <Badge bg="success">
                          {
                            discountPercentage
                          }
                          % OFF
                        </Badge>
                      </>
                    )}
                  </div>

                  <p
                    style={{
                      whiteSpace:
                        "pre-line",
                    }}
                  >
                    {formData.description ||
                      "Product description preview will appear here."}
                  </p>

                  <div className="d-flex gap-2 flex-wrap mb-3">
                    {formData.tags
                      .split(",")
                      .map((tag) =>
                        tag.trim()
                      )
                      .filter(Boolean)
                      .map((tag) => (
                        <Badge
                          bg="secondary"
                          key={tag}
                        >
                          {tag}
                        </Badge>
                      ))}
                  </div>

                  <div className="d-flex justify-content-between mb-2">
                    <span>
                      <FaBoxOpen className="me-2" />
                      Stock
                    </span>

                    <strong>
                      {
                        formData.countInStock
                      }
                    </strong>
                  </div>

                  <div className="d-flex justify-content-between mb-2">
                    <span>
                      <FaTruck className="me-2" />
                      Shipping
                    </span>

                    <strong>
                      {formData.freeShipping
                        ? "Free"
                        : `₹${
                            formData.shippingPrice ||
                            0
                          }`}
                    </strong>
                  </div>

                  <div className="d-flex justify-content-between mb-2">
                    <span>
                      <FaStar className="me-2 text-warning" />
                      Rating
                    </span>

                    <strong>
                      {product?.rating || 0}
                    </strong>
                  </div>

                  <div className="d-flex justify-content-between">
                    <span>
                      <FaEye className="me-2 text-primary" />
                      Views
                    </span>

                    <strong>
                      {product?.views || 0}
                    </strong>
                  </div>
                </Card.Body>
              </Card>

              <Card className="shadow-sm border-0 rounded-4">
                <Card.Body>
                  <Button
                    type="submit"
                    variant="dark"
                    className="w-100 py-3 fw-bold"
                    disabled={
                      saving ||
                      uploading
                    }
                  >
                    {saving ? (
                      <>
                        <Spinner
                          animation="border"
                          size="sm"
                          className="me-2"
                        />
                        Saving...
                      </>
                    ) : (
                      <>
                        <FaSave className="me-2" />
                        Save Product
                      </>
                    )}
                  </Button>

                  <Button
                    variant="outline-secondary"
                    className="w-100 mt-3"
                    onClick={() =>
                      navigate(
                        "/seller/dashboard"
                      )
                    }
                  >
                    Cancel
                  </Button>
                </Card.Body>
              </Card>
            </div>
          </Col>
        </Row>
      </Form>
    </motion.div>
  );
};

const FaChartIcon = () => {
  return (
    <FaRupeeSign
      size={32}
      className="text-primary"
    />
  );
};

export default EditProduct;