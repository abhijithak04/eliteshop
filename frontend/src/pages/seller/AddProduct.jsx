import {
  useMemo,
  useState,
} from "react";

import {
  Form,
  Button,
  Card,
  Row,
  Col,
  Spinner,
  Image,
  Badge,
  Alert,
  ProgressBar,
} from "react-bootstrap";

import {
  useNavigate,
  Link,
} from "react-router-dom";

import { toast } from "react-toastify";
import { motion } from "framer-motion";

import {
  FaBoxOpen,
  FaCloudUploadAlt,
  FaImage,
  FaTimes,
  FaTruck,
  FaTags,
  FaRupeeSign,
  FaWarehouse,
  FaArrowLeft,
  FaCheckCircle,
  FaStore,
  FaStar,
  FaInfoCircle,
  FaShieldAlt,
  FaFire,
  FaEye,
  FaPercent,
  FaClipboardCheck,
  FaBolt,
} from "react-icons/fa";

import api from "../../utils/axios";

import "../../styles/SellerAddProduct.css";

const categories = [
  "Mobiles",
  "Electronics",
  "Fashion",
  "Shoes",
  "Watches",
  "Beauty",
  "Home",
  "Home & Kitchen",
  "Appliances",
  "Furniture",
  "Grocery",
  "Sports",
  "Gaming",
  "Books",
];

const initialFormData = {
  name: "",
  image: "",
  images: [],
  brand: "",
  category: "",
  description: "",
  price: "",
  originalPrice: "",
  countInStock: "",
  freeShipping: true,
  shippingPrice: "0",
  tags: "",
  isFeatured: false,
  lowStockThreshold: "5",
};

const AddProduct = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState({});
  const [uploadProgress, setUploadProgress] = useState(0);

  const discountPercentage = useMemo(() => {
    const price = Number(formData.price);
    const originalPrice = Number(formData.originalPrice);

    if (originalPrice > 0 && price > 0 && originalPrice > price) {
      return Math.round(((originalPrice - price) / originalPrice) * 100);
    }

    return 0;
  }, [formData.price, formData.originalPrice]);

  const stockValue = useMemo(() => {
    return Number(formData.price || 0) * Number(formData.countInStock || 0);
  }, [formData.price, formData.countInStock]);

  const completionScore = useMemo(() => {
    let score = 0;

    if (formData.name.trim()) score += 10;
    if (formData.brand.trim()) score += 10;
    if (formData.category) score += 10;
    if (formData.description.trim().length >= 20) score += 15;
    if (formData.price && Number(formData.price) > 0) score += 15;
    if (formData.countInStock !== "" && Number(formData.countInStock) >= 0) score += 10;
    if (formData.image) score += 20;
    if (formData.tags.trim()) score += 5;
    if (formData.lowStockThreshold !== "") score += 5;

    return Math.min(score, 100);
  }, [formData]);

  const previewImages = useMemo(() => {
    return [
      formData.image,
      ...(formData.images || []),
    ].filter(Boolean);
  }, [formData.image, formData.images]);

  const parsedTags = useMemo(() => {
    return formData.tags
      ? formData.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean)
      : [];
  }, [formData.tags]);

  const changeHandler = (e) => {
    const {
      name,
      value,
      type,
      checked,
    } = e.target;

    setFormData((prev) => {
      const updated = {
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      };

      if (name === "freeShipping" && checked) {
        updated.shippingPrice = "0";
      }

      return updated;
    });

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Product name is required";
    } else if (formData.name.trim().length < 3) {
      newErrors.name = "Product name must be at least 3 characters";
    }

    if (!formData.brand.trim()) {
      newErrors.brand = "Brand is required";
    }

    if (!formData.category) {
      newErrors.category = "Category is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    } else if (formData.description.trim().length < 20) {
      newErrors.description = "Description must be at least 20 characters";
    }

    if (!formData.price || Number(formData.price) <= 0) {
      newErrors.price = "Valid selling price is required";
    }

    if (
      formData.originalPrice &&
      Number(formData.originalPrice) < Number(formData.price)
    ) {
      newErrors.originalPrice =
        "Original price should be greater than or equal to selling price";
    }

    if (
      formData.countInStock === "" ||
      Number(formData.countInStock) < 0
    ) {
      newErrors.countInStock = "Valid stock quantity is required";
    }

    if (
      !formData.freeShipping &&
      (formData.shippingPrice === "" ||
        Number(formData.shippingPrice) < 0)
    ) {
      newErrors.shippingPrice = "Valid shipping price is required";
    }

    if (!formData.image) {
      newErrors.image = "Main product image is required";
    }

    if (
      formData.lowStockThreshold === "" ||
      Number(formData.lowStockThreshold) < 0
    ) {
      newErrors.lowStockThreshold = "Low stock threshold is required";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const uploadSingleImage = async (file) => {
    const imageData = new FormData();
    imageData.append("image", file);

    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
      },

      onUploadProgress: (progressEvent) => {
        if (!progressEvent.total) return;

        const percent = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );

        setUploadProgress(percent);
      },
    };

    const { data } = await api.post(
      "/upload",
      imageData,
      config
    );

    return data.image || data.url;
  };

  const uploadFileHandler = async (e) => {
    const selectedFiles = Array.from(e.target.files || []);

    if (selectedFiles.length === 0) {
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
    ];

    const invalidFile = selectedFiles.find(
      (file) => !allowedTypes.includes(file.type)
    );

    if (invalidFile) {
      toast.error("Only JPG, JPEG, PNG and WEBP images are allowed");
      return;
    }

    const largeFile = selectedFiles.find(
      (file) => file.size > 5 * 1024 * 1024
    );

    if (largeFile) {
      toast.error("Each image must be less than 5MB");
      return;
    }

    const currentTotal = previewImages.length + selectedFiles.length;

    if (currentTotal > 8) {
      toast.error("Maximum 8 product images are allowed");
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);

      const uploadedUrls = [];

      for (const file of selectedFiles) {
        const uploadedUrl = await uploadSingleImage(file);
        uploadedUrls.push(uploadedUrl);
      }

      setFormData((prev) => {
        const existingImages = prev.images || [];

        const allImages = Array.from(
          new Set([
            ...existingImages,
            ...uploadedUrls,
          ])
        );

        return {
          ...prev,
          image: prev.image || uploadedUrls[0],
          images: allImages,
        };
      });

      setErrors((prev) => ({
        ...prev,
        image: "",
      }));

      toast.success(
        selectedFiles.length > 1
          ? "Images uploaded successfully"
          : "Image uploaded successfully"
      );
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Image upload failed"
      );
    } finally {
      setUploading(false);
      setUploadProgress(0);
      e.target.value = "";
    }
  };

  const removeImageHandler = (imageUrl) => {
    setFormData((prev) => {
      const filteredImages = (prev.images || []).filter(
        (img) => img !== imageUrl
      );

      const isMainImage = prev.image === imageUrl;

      return {
        ...prev,
        images: filteredImages,
        image: isMainImage
          ? filteredImages[0] || ""
          : prev.image,
      };
    });
  };

  const setMainImageHandler = (imageUrl) => {
    setFormData((prev) => ({
      ...prev,
      image: imageUrl,
    }));

    toast.success("Main image selected");
  };

  const resetHandler = () => {
    const confirmReset = window.confirm(
      "Clear all product form data?"
    );

    if (!confirmReset) return;

    setFormData(initialFormData);
    setErrors({});
    toast.info("Form cleared");
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the form errors");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        name: formData.name.trim(),
        image: formData.image,
        images: formData.images,
        brand: formData.brand.trim(),
        category: formData.category,
        description: formData.description.trim(),
        price: Number(formData.price),
        originalPrice: formData.originalPrice
          ? Number(formData.originalPrice)
          : Number(formData.price),
        countInStock: Number(formData.countInStock),
        freeShipping: Boolean(formData.freeShipping),
        shippingPrice: formData.freeShipping
          ? 0
          : Number(formData.shippingPrice || 0),
        tags: parsedTags,
        isFeatured: Boolean(formData.isFeatured),
        lowStockThreshold: Number(formData.lowStockThreshold || 5),
        isActive: true,
      };

      await api.post("/products", payload);

      toast.success("Product added successfully");
      navigate("/seller/dashboard");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Product creation failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.main
      className="elite-seller-add-product-page"
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
      <section className="elite-seller-add-header">
        <div>
          <Button
            as={Link}
            to="/seller/dashboard"
            variant="light"
            className="elite-back-btn"
          >
            <FaArrowLeft className="me-2" />
            Seller Dashboard
          </Button>

          <Badge
            bg="warning"
            text="dark"
            className="elite-seller-add-badge"
          >
            <FaShieldAlt className="me-2" />
            Seller Listing Builder
          </Badge>

          <h1>
            <FaStore className="me-2" />
            Add New Product
          </h1>

          <p>
            Create a real sellable product with images, pricing, stock,
            shipping, tags, discount and marketplace-ready details.
          </p>
        </div>

        <motion.div
          className="elite-seller-header-badge"
          animate={{
            y: [0, -10, 0],
          }}
          transition={{
            duration: 3.5,
            repeat: Infinity,
          }}
        >
          <FaCheckCircle />
          Product Setup
        </motion.div>
      </section>

      <Row className="g-4 mb-4">
        <Col md={6} xl={3}>
          <Card className="elite-add-stat-card price">
            <Card.Body>
              <div>
                <span>Selling Price</span>
                <h2>₹{formData.price || 0}</h2>
                <p>Customer price</p>
              </div>

              <FaRupeeSign />
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} xl={3}>
          <Card className="elite-add-stat-card stock">
            <Card.Body>
              <div>
                <span>Stock</span>
                <h2>{formData.countInStock || 0}</h2>
                <p>Available units</p>
              </div>

              <FaWarehouse />
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} xl={3}>
          <Card className="elite-add-stat-card discount">
            <Card.Body>
              <div>
                <span>Discount</span>
                <h2>{discountPercentage}%</h2>
                <p>Auto calculated</p>
              </div>

              <FaPercent />
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} xl={3}>
          <Card className="elite-add-stat-card value">
            <Card.Body>
              <div>
                <span>Stock Value</span>
                <h2>₹{stockValue.toLocaleString("en-IN")}</h2>
                <p>Price × stock</p>
              </div>

              <FaClipboardCheck />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-4">
        <Col lg={8}>
          <Card className="elite-add-product-card">
            <Card.Body>
              <div className="elite-add-card-heading">
                <div>
                  <h3>Product Information</h3>
                  <p>
                    Complete all required fields before publishing.
                  </p>
                </div>

                <div className="elite-add-completion">
                  <strong>{completionScore}%</strong>
                  <span>Complete</span>
                </div>
              </div>

              <ProgressBar
                now={completionScore}
                className="elite-add-progress mb-4"
              />

              <Form onSubmit={submitHandler}>
                <div className="elite-form-section-title">
                  <FaBoxOpen />
                  <span>Basic Product Details</span>
                </div>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Product Name *</Form.Label>

                      <Form.Control
                        type="text"
                        name="name"
                        placeholder="Example: Premium Wireless Headphones"
                        value={formData.name}
                        onChange={changeHandler}
                        isInvalid={!!errors.name}
                      />

                      <Form.Control.Feedback type="invalid">
                        {errors.name}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Brand *</Form.Label>

                      <Form.Control
                        type="text"
                        name="brand"
                        placeholder="Example: EliteAudio"
                        value={formData.brand}
                        onChange={changeHandler}
                        isInvalid={!!errors.brand}
                      />

                      <Form.Control.Feedback type="invalid">
                        {errors.brand}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Category *</Form.Label>

                      <Form.Select
                        name="category"
                        value={formData.category}
                        onChange={changeHandler}
                        isInvalid={!!errors.category}
                      >
                        <option value="">Select Category</option>

                        {categories.map((item) => (
                          <option key={item} value={item}>
                            {item}
                          </option>
                        ))}
                      </Form.Select>

                      <Form.Control.Feedback type="invalid">
                        {errors.category}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Tags</Form.Label>

                      <Form.Control
                        type="text"
                        name="tags"
                        placeholder="wireless, bluetooth, premium"
                        value={formData.tags}
                        onChange={changeHandler}
                      />

                      <small className="text-muted">
                        Separate tags using comma.
                      </small>
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-4">
                  <Form.Label>Description *</Form.Label>

                  <Form.Control
                    as="textarea"
                    rows={5}
                    name="description"
                    placeholder="Write product features, quality, warranty, package details and benefits..."
                    value={formData.description}
                    onChange={changeHandler}
                    isInvalid={!!errors.description}
                  />

                  <Form.Control.Feedback type="invalid">
                    {errors.description}
                  </Form.Control.Feedback>
                </Form.Group>

                <div className="elite-form-section-title">
                  <FaImage />
                  <span>Product Images</span>
                </div>

                <Form.Group className="mb-3">
                  <Form.Label>Upload Images *</Form.Label>

                  <div className="elite-upload-box">
                    <FaCloudUploadAlt />

                    <h5>Upload product images</h5>

                    <p>
                      Upload JPG, PNG or WEBP images. First uploaded
                      image becomes the main product image. Maximum 8 images.
                    </p>

                    <Form.Control
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      multiple
                      onChange={uploadFileHandler}
                      disabled={uploading}
                      isInvalid={!!errors.image}
                    />
                  </div>

                  {errors.image && (
                    <div className="invalid-feedback d-block">
                      {errors.image}
                    </div>
                  )}
                </Form.Group>

                {uploading && (
                  <div className="elite-upload-progress mb-3">
                    <div>
                      <Spinner animation="border" size="sm" />
                      <strong>Uploading images...</strong>
                    </div>

                    <ProgressBar
                      now={uploadProgress}
                      label={`${uploadProgress}%`}
                      animated
                    />
                  </div>
                )}

                {previewImages.length > 0 && (
                  <div className="elite-image-preview-grid mb-4">
                    {previewImages.map((img, index) => (
                      <div
                        key={`${img}-${index}`}
                        className={
                          formData.image === img
                            ? "elite-preview-image active"
                            : "elite-preview-image"
                        }
                      >
                        <Image
                          src={img}
                          alt={`Product ${index + 1}`}
                          rounded
                        />

                        {formData.image === img && (
                          <Badge bg="success">
                            Main
                          </Badge>
                        )}

                        <div className="elite-preview-actions">
                          <button
                            type="button"
                            onClick={() => setMainImageHandler(img)}
                          >
                            Main
                          </button>

                          <button
                            type="button"
                            className="danger"
                            onClick={() => removeImageHandler(img)}
                          >
                            <FaTimes />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="elite-form-section-title">
                  <FaRupeeSign />
                  <span>Price, Stock & Delivery</span>
                </div>

                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Selling Price *</Form.Label>

                      <Form.Control
                        type="number"
                        min="0"
                        name="price"
                        placeholder="2299"
                        value={formData.price}
                        onChange={changeHandler}
                        isInvalid={!!errors.price}
                      />

                      <Form.Control.Feedback type="invalid">
                        {errors.price}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>

                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Original Price</Form.Label>

                      <Form.Control
                        type="number"
                        min="0"
                        name="originalPrice"
                        placeholder="2999"
                        value={formData.originalPrice}
                        onChange={changeHandler}
                        isInvalid={!!errors.originalPrice}
                      />

                      <Form.Control.Feedback type="invalid">
                        {errors.originalPrice}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>

                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Discount</Form.Label>

                      <div className="elite-discount-preview">
                        {discountPercentage > 0
                          ? `${discountPercentage}% OFF`
                          : "No Discount"}
                      </div>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Stock Quantity *</Form.Label>

                      <Form.Control
                        type="number"
                        min="0"
                        name="countInStock"
                        placeholder="20"
                        value={formData.countInStock}
                        onChange={changeHandler}
                        isInvalid={!!errors.countInStock}
                      />

                      <Form.Control.Feedback type="invalid">
                        {errors.countInStock}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>

                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Low Stock Alert</Form.Label>

                      <Form.Control
                        type="number"
                        min="0"
                        name="lowStockThreshold"
                        value={formData.lowStockThreshold}
                        onChange={changeHandler}
                        isInvalid={!!errors.lowStockThreshold}
                      />

                      <Form.Control.Feedback type="invalid">
                        {errors.lowStockThreshold}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>

                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Shipping Price</Form.Label>

                      <Form.Control
                        type="number"
                        min="0"
                        name="shippingPrice"
                        value={formData.shippingPrice}
                        placeholder="0"
                        onChange={changeHandler}
                        disabled={formData.freeShipping}
                        isInvalid={!!errors.shippingPrice}
                      />

                      <Form.Control.Feedback type="invalid">
                        {errors.shippingPrice}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                <div className="elite-product-checks">
                  <Form.Check
                    type="switch"
                    label="Free Shipping"
                    name="freeShipping"
                    checked={formData.freeShipping}
                    onChange={changeHandler}
                  />

                  <Form.Check
                    type="switch"
                    label="Featured Product"
                    name="isFeatured"
                    checked={formData.isFeatured}
                    onChange={changeHandler}
                  />
                </div>

                <Alert
                  variant="info"
                  className="elite-info-alert mt-4"
                >
                  <FaInfoCircle className="me-2" />
                  Product will be visible to customers after saving if seller
                  account is approved and product is active.
                </Alert>

                <div className="elite-submit-actions">
                  <Button
                    type="button"
                    variant="outline-secondary"
                    onClick={resetHandler}
                    disabled={loading || uploading}
                  >
                    Clear Form
                  </Button>

                  <Button
                    type="button"
                    variant="outline-dark"
                    onClick={() => navigate("/seller/dashboard")}
                    disabled={loading || uploading}
                  >
                    Cancel
                  </Button>

                  <Button
                    type="submit"
                    className="elite-submit-product-btn"
                    disabled={loading || uploading}
                  >
                    {loading ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Adding Product...
                      </>
                    ) : (
                      <>
                        <FaCheckCircle className="me-2" />
                        Add Product
                      </>
                    )}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <div className="elite-product-live-preview">
            <Card className="elite-preview-card">
              <Card.Body>
                <h4>
                  <FaStar className="me-2" />
                  Live Preview
                </h4>

                <div className="elite-preview-product-box">
                  {formData.image ? (
                    <img
                      src={formData.image}
                      alt="Preview"
                    />
                  ) : (
                    <div className="elite-preview-placeholder">
                      <FaImage />
                      <span>No image uploaded</span>
                    </div>
                  )}

                  <div className="elite-preview-product-body">
                    <h5>{formData.name || "Product Name"}</h5>

                    <p>
                      {formData.brand || "Brand"} •{" "}
                      {formData.category || "Category"}
                    </p>

                    <div className="elite-preview-price">
                      <strong>₹{formData.price || "0"}</strong>

                      {formData.originalPrice &&
                        Number(formData.originalPrice) >
                          Number(formData.price) && (
                          <del>₹{formData.originalPrice}</del>
                        )}
                    </div>

                    <div className="elite-preview-badges">
                      {discountPercentage > 0 && (
                        <Badge bg="success">
                          {discountPercentage}% OFF
                        </Badge>
                      )}

                      {formData.freeShipping && (
                        <Badge bg="primary">
                          <FaTruck className="me-1" />
                          Free Delivery
                        </Badge>
                      )}

                      {formData.isFeatured && (
                        <Badge bg="danger">
                          Featured
                        </Badge>
                      )}
                    </div>

                    <div className="elite-preview-lines">
                      <div>
                        <span>
                          <FaWarehouse />
                          Stock
                        </span>
                        <strong>{formData.countInStock || 0}</strong>
                      </div>

                      <div>
                        <span>
                          <FaEye />
                          Preview Status
                        </span>
                        <strong>Draft</strong>
                      </div>

                      <div>
                        <span>
                          <FaFire />
                          Tags
                        </span>
                        <strong>{parsedTags.length}</strong>
                      </div>
                    </div>
                  </div>
                </div>
              </Card.Body>
            </Card>

            <Card className="elite-seller-tips-card">
              <Card.Body>
                <h5>
                  <FaTags className="me-2" />
                  Seller Tips
                </h5>

                <ul>
                  <li>Use clear product images.</li>
                  <li>Add useful tags for search.</li>
                  <li>Keep stock quantity accurate.</li>
                  <li>Use original price to show discounts.</li>
                  <li>Write a detailed product description.</li>
                </ul>
              </Card.Body>
            </Card>

            <Card className="elite-stock-info-card">
              <Card.Body>
                <FaBolt />

                <div>
                  <h5>Listing Quality</h5>

                  <p>
                    Your product setup is{" "}
                    <strong>{completionScore}%</strong> complete.
                    Better completion means better customer trust.
                  </p>
                </div>
              </Card.Body>
            </Card>
          </div>
        </Col>
      </Row>
    </motion.main>
  );
};

export default AddProduct;