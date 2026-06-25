"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  Row,
  Col,
  Card,
  Button,
  Form,
  Image,
  Badge,
  Spinner,
  Alert,
  ListGroup,
  InputGroup,
} from "react-bootstrap";

import {
  FaUpload,
  FaImages,
  FaTrash,
  FaCopy,
  FaCheck,
  FaBoxOpen,
  FaSave,
  FaArrowLeft,
  FaEye,
} from "react-icons/fa";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import { motion } from "framer-motion";

import { toast } from "react-toastify";

import Loader from "../../components/Loader";
import Message from "../../components/Message";

import api from "../../utils/axios";

const UploadImages = () => {
  const navigate = useNavigate();

  const [products, setProducts] =
    useState([]);

  const [selectedProductId, setSelectedProductId] =
    useState("");

  const [selectedProduct, setSelectedProduct] =
    useState(null);

  const [mainImage, setMainImage] =
    useState("");

  const [galleryImages, setGalleryImages] =
    useState([]);

  const [uploadedImages, setUploadedImages] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [uploading, setUploading] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [copiedUrl, setCopiedUrl] =
    useState("");

  // ======================================
  // FETCH SELLER PRODUCTS
  // GET /api/products/seller/products
  // ======================================

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const { data } =
        await api.get(
          "/products/seller/products"
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
    fetchProducts();
  }, []);

  // ======================================
  // SELECT PRODUCT
  // ======================================

  const productSelectHandler = (e) => {
    const productId =
      e.target.value;

    setSelectedProductId(productId);

    const foundProduct =
      products.find(
        (product) =>
          product._id === productId
      );

    setSelectedProduct(
      foundProduct || null
    );

    if (foundProduct) {
      setMainImage(
        foundProduct.image || ""
      );

      setGalleryImages(
        foundProduct.images || []
      );
    } else {
      setMainImage("");
      setGalleryImages([]);
    }
  };

  // ======================================
  // UPLOAD MAIN IMAGE
  // POST /api/upload
  // field name: image
  // ======================================

  const uploadMainImageHandler =
    async (e) => {
      const file = e.target.files[0];

      if (!file) return;

      const formData =
        new FormData();

      formData.append(
        "image",
        file
      );

      try {
        setUploading(true);

        const { data } =
          await api.post(
            "/upload",
            formData,
            {
              headers: {
                "Content-Type":
                  "multipart/form-data",
              },
            }
          );

        setMainImage(data.image);

        setUploadedImages((prev) => [
          {
            image: data.image,
            url: data.image,
            public_id: data.public_id,
            type: "main",
          },
          ...prev,
        ]);

        toast.success(
          "Main image uploaded successfully"
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
  // UPLOAD MULTIPLE GALLERY IMAGES
  // POST /api/upload/multiple
  // field name: images
  // ======================================

  const uploadGalleryImagesHandler =
    async (e) => {
      const files =
        Array.from(e.target.files);

      if (files.length === 0) return;

      if (files.length > 5) {
        toast.error(
          "You can upload maximum 5 images at a time"
        );

        return;
      }

      const formData =
        new FormData();

      files.forEach((file) => {
        formData.append(
          "images",
          file
        );
      });

      try {
        setUploading(true);

        const { data } =
          await api.post(
            "/upload/multiple",
            formData,
            {
              headers: {
                "Content-Type":
                  "multipart/form-data",
              },
            }
          );

        const images =
          data.images?.map(
            (item) => item.image
          ) || [];

        setGalleryImages((prev) => [
          ...prev,
          ...images,
        ]);

        setUploadedImages((prev) => [
          ...data.images.map((item) => ({
            ...item,
            type: "gallery",
          })),
          ...prev,
        ]);

        if (!mainImage && images[0]) {
          setMainImage(images[0]);
        }

        toast.success(
          "Gallery images uploaded successfully"
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
  // REMOVE IMAGE FROM PREVIEW
  // ======================================

  const removeGalleryImage = (img) => {
    setGalleryImages((prev) =>
      prev.filter(
        (item) => item !== img
      )
    );

    if (mainImage === img) {
      const remaining =
        galleryImages.filter(
          (item) => item !== img
        );

      setMainImage(
        remaining[0] || ""
      );
    }
  };

  const clearUploadedList = () => {
    setUploadedImages([]);
    toast.success(
      "Upload history cleared"
    );
  };

  // ======================================
  // COPY IMAGE URL
  // ======================================

  const copyUrlHandler = async (url) => {
    try {
      await navigator.clipboard.writeText(
        url
      );

      setCopiedUrl(url);

      toast.success(
        "Image URL copied"
      );

      setTimeout(() => {
        setCopiedUrl("");
      }, 1500);
    } catch (error) {
      toast.error(
        "Could not copy image URL"
      );
    }
  };

  // ======================================
  // APPLY IMAGES TO SELECTED PRODUCT
  // PUT /api/products/:id
  // ======================================

  const saveImagesToProduct =
    async () => {
      if (!selectedProduct) {
        toast.error(
          "Please select a product first"
        );

        return;
      }

      if (!mainImage) {
        toast.error(
          "Please upload or select a main image"
        );

        return;
      }

      try {
        setSaving(true);

        const cleanGallery = [
          mainImage,
          ...galleryImages,
        ].filter(
          (img, index, arr) =>
            img &&
            arr.indexOf(img) === index
        );

        const payload = {
          name: selectedProduct.name,
          image: mainImage,
          images: cleanGallery,
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
          countInStock: Number(
            selectedProduct.countInStock
          ),
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

        await api.put(
          `/products/${selectedProduct._id}`,
          payload
        );

        toast.success(
          "Product images updated successfully"
        );

        await fetchProducts();
      } catch (error) {
        toast.error(
          error.response?.data?.message ||
            error.message
        );
      } finally {
        setSaving(false);
      }
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
            Upload Product Images
          </h2>

          <p className="text-muted mb-0">
            Upload main image, gallery images, copy image URLs, and attach images to your seller products.
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

          <Button
            as={Link}
            to="/seller/add-product"
            variant="dark"
          >
            <FaBoxOpen className="me-2" />
            Add Product
          </Button>
        </div>
      </div>

      <Row className="g-4">
        {/* LEFT SIDE */}

        <Col lg={8}>
          {/* PRODUCT SELECT */}

          <Card className="shadow-lg border-0 rounded-4 mb-4">
            <Card.Body className="p-4">
              <h4 className="fw-bold mb-3">
                Select Product
              </h4>

              <Form.Group className="mb-3">
                <Form.Label>
                  Choose product to update images
                </Form.Label>

                <Form.Select
                  value={selectedProductId}
                  onChange={
                    productSelectHandler
                  }
                >
                  <option value="">
                    Select Product
                  </option>

                  {products.map((product) => (
                    <option
                      key={product._id}
                      value={product._id}
                    >
                      {product.name} — ₹
                      {product.price}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              {selectedProduct && (
                <Alert
                  variant="info"
                  className="mb-0"
                >
                  Selected:{" "}
                  <strong>
                    {
                      selectedProduct.name
                    }
                  </strong>
                </Alert>
              )}
            </Card.Body>
          </Card>

          {/* UPLOAD SECTION */}

          <Card className="shadow-lg border-0 rounded-4 mb-4">
            <Card.Body className="p-4">
              <h4 className="fw-bold mb-4">
                Upload Images
              </h4>

              <Row className="g-4">
                <Col md={6}>
                  <Card className="border-0 shadow-sm rounded-4 h-100">
                    <Card.Body>
                      <div className="d-flex align-items-center gap-2 mb-3">
                        <FaUpload className="text-primary" />
                        <h5 className="fw-bold mb-0">
                          Main Image
                        </h5>
                      </div>

                      <p className="text-muted small">
                        This image appears first on product cards and product details page.
                      </p>

                      <Form.Control
                        type="file"
                        accept="image/*"
                        onChange={
                          uploadMainImageHandler
                        }
                        disabled={uploading}
                      />
                    </Card.Body>
                  </Card>
                </Col>

                <Col md={6}>
                  <Card className="border-0 shadow-sm rounded-4 h-100">
                    <Card.Body>
                      <div className="d-flex align-items-center gap-2 mb-3">
                        <FaImages className="text-success" />
                        <h5 className="fw-bold mb-0">
                          Gallery Images
                        </h5>
                      </div>

                      <p className="text-muted small">
                        Upload up to 5 gallery images at a time.
                      </p>

                      <Form.Control
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={
                          uploadGalleryImagesHandler
                        }
                        disabled={uploading}
                      />
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              {uploading && (
                <div className="mt-4 d-flex align-items-center gap-2">
                  <Spinner animation="border" />
                  <span>
                    Uploading images...
                  </span>
                </div>
              )}
            </Card.Body>
          </Card>

          {/* GALLERY MANAGER */}

          <Card className="shadow-lg border-0 rounded-4">
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
                <h4 className="fw-bold mb-0">
                  Gallery Manager
                </h4>

                <Badge bg="dark">
                  {galleryImages.length} Images
                </Badge>
              </div>

              {!mainImage &&
              galleryImages.length === 0 ? (
                <Message>
                  No images uploaded yet.
                </Message>
              ) : (
                <>
                  {mainImage && (
                    <div className="mb-4">
                      <h6 className="fw-bold">
                        Main Image
                      </h6>

                      <div className="position-relative d-inline-block">
                        <Image
                          src={mainImage}
                          rounded
                          style={{
                            width: "220px",
                            height: "220px",
                            objectFit:
                              "cover",
                            border:
                              "4px solid #198754",
                          }}
                        />

                        <Badge
                          bg="success"
                          className="position-absolute top-0 start-0 m-2"
                        >
                          Main
                        </Badge>
                      </div>
                    </div>
                  )}

                  {galleryImages.length >
                    0 && (
                    <>
                      <h6 className="fw-bold">
                        Product Gallery
                      </h6>

                      <div className="d-flex gap-3 flex-wrap">
                        {galleryImages.map(
                          (img, index) => (
                            <motion.div
                              key={`${img}-${index}`}
                              whileHover={{
                                scale: 1.04,
                              }}
                              className="position-relative"
                            >
                              <Image
                                src={img}
                                rounded
                                style={{
                                  width:
                                    "130px",
                                  height:
                                    "130px",
                                  objectFit:
                                    "cover",
                                  border:
                                    mainImage ===
                                    img
                                      ? "3px solid #198754"
                                      : "1px solid #ddd",
                                  cursor:
                                    "pointer",
                                }}
                                onClick={() => {
                                  setMainImage(
                                    img
                                  );
                                  toast.success(
                                    "Main image selected"
                                  );
                                }}
                              />

                              {mainImage ===
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
                                  removeGalleryImage(
                                    img
                                  )
                                }
                              >
                                <FaTrash />
                              </Button>
                            </motion.div>
                          )
                        )}
                      </div>
                    </>
                  )}
                </>
              )}

              <div className="mt-4 d-flex gap-2 flex-wrap">
                <Button
                  variant="dark"
                  disabled={
                    saving ||
                    !selectedProduct ||
                    !mainImage
                  }
                  onClick={
                    saveImagesToProduct
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
                      Save Images To Product
                    </>
                  )}
                </Button>

                {selectedProduct?.slug && (
                  <Button
                    as={Link}
                    to={`/product/${selectedProduct.slug}`}
                    variant="outline-dark"
                  >
                    <FaEye className="me-2" />
                    View Product
                  </Button>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* RIGHT SIDE */}

        <Col lg={4}>
          <div
            style={{
              position: "sticky",
              top: "100px",
            }}
          >
            {/* PRODUCT PREVIEW */}

            <Card className="shadow-lg border-0 rounded-4 mb-4 overflow-hidden">
              {mainImage ? (
                <Image
                  src={mainImage}
                  style={{
                    width: "100%",
                    height: "280px",
                    objectFit: "cover",
                  }}
                />
              ) : (
                <div
                  className="d-flex align-items-center justify-content-center bg-light"
                  style={{
                    height: "280px",
                  }}
                >
                  <FaImages
                    size={60}
                    className="text-muted"
                  />
                </div>
              )}

              <Card.Body>
                <h4 className="fw-bold mb-2">
                  {selectedProduct?.name ||
                    "Product Preview"}
                </h4>

                <p className="text-muted mb-2">
                  {selectedProduct?.brand ||
                    "Brand"}{" "}
                  •{" "}
                  {selectedProduct?.category ||
                    "Category"}
                </p>

                <h4 className="text-primary fw-bold">
                  ₹
                  {selectedProduct?.price ||
                    0}
                </h4>

                <div className="d-flex justify-content-between mt-3">
                  <span>
                    Stock
                  </span>

                  <strong>
                    {selectedProduct?.countInStock ??
                      0}
                  </strong>
                </div>

                <div className="d-flex justify-content-between mt-2">
                  <span>
                    Gallery
                  </span>

                  <strong>
                    {galleryImages.length}
                  </strong>
                </div>
              </Card.Body>
            </Card>

            {/* UPLOADED URLS */}

            <Card className="shadow-lg border-0 rounded-4">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="fw-bold mb-0">
                    Uploaded URLs
                  </h5>

                  {uploadedImages.length >
                    0 && (
                    <Button
                      size="sm"
                      variant="outline-danger"
                      onClick={
                        clearUploadedList
                      }
                    >
                      Clear
                    </Button>
                  )}
                </div>

                {uploadedImages.length ===
                0 ? (
                  <p className="text-muted mb-0">
                    Uploaded image URLs will appear here.
                  </p>
                ) : (
                  <ListGroup variant="flush">
                    {uploadedImages.map(
                      (item, index) => (
                        <ListGroup.Item
                          key={`${item.image}-${index}`}
                          className="px-0"
                        >
                          <div className="d-flex gap-2 align-items-center">
                            <Image
                              src={item.image}
                              rounded
                              style={{
                                width: "50px",
                                height: "50px",
                                objectFit:
                                  "cover",
                              }}
                            />

                            <div className="flex-grow-1">
                              <Badge
                                bg={
                                  item.type ===
                                  "main"
                                    ? "success"
                                    : "secondary"
                                }
                                className="mb-1"
                              >
                                {item.type}
                              </Badge>

                              <InputGroup size="sm">
                                <Form.Control
                                  value={
                                    item.image
                                  }
                                  readOnly
                                />

                                <Button
                                  variant={
                                    copiedUrl ===
                                    item.image
                                      ? "success"
                                      : "outline-dark"
                                  }
                                  onClick={() =>
                                    copyUrlHandler(
                                      item.image
                                    )
                                  }
                                >
                                  {copiedUrl ===
                                  item.image ? (
                                    <FaCheck />
                                  ) : (
                                    <FaCopy />
                                  )}
                                </Button>
                              </InputGroup>
                            </div>
                          </div>
                        </ListGroup.Item>
                      )
                    )}
                  </ListGroup>
                )}
              </Card.Body>
            </Card>
          </div>
        </Col>
      </Row>
    </motion.div>
  );
};

export default UploadImages;