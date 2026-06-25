import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useMemo,
  useCallback,
} from "react";

import { useAuth } from "./AuthContext";
import api from "../utils/axios";

const CartContext = createContext(null);

const round2 = (value) => {
  return Number((Math.round(Number(value || 0) * 100) / 100).toFixed(2));
};

const getUserId = (userInfo) => {
  return userInfo?._id || userInfo?.id || null;
};

const clearOldCartStorage = () => {
  try {
    localStorage.removeItem("cartItems");
    localStorage.removeItem("wishlistItems");
    localStorage.removeItem("cartItems_guest");
    localStorage.removeItem("wishlistItems_guest");
    localStorage.removeItem("shippingAddress_guest");
    localStorage.removeItem("paymentMethod_guest");
    localStorage.removeItem("coupon_guest");
  } catch {
    // ignore
  }
};

const getStorageKey = (key, userId) => {
  return userId ? `${key}_${userId}` : key;
};

const getLocalStorage = (key, fallback) => {
  try {
    const value = localStorage.getItem(key);

    if (!value) return fallback;

    return JSON.parse(value);
  } catch {
    localStorage.removeItem(key);
    return fallback;
  }
};

const setLocalStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
};

const normalizeQty = (qty, countInStock) => {
  const safeQty = Number(qty || 1);
  const safeStock = Number(countInStock || 0);

  if (safeStock <= 0) return 0;
  if (safeQty < 1) return 1;
  if (safeQty > safeStock) return safeStock;

  return safeQty;
};

const normalizeLocalProduct = (product, qty = 1) => {
  const countInStock = Number(product?.countInStock || 0);

  return {
    _id: product?._id,
    name: product?.name || "Product",
    slug: product?.slug || product?._id,
    image: product?.image || "/placeholder.svg",
    images: Array.isArray(product?.images) ? product.images : [],
    price: Number(product?.price || 0),
    originalPrice: Number(product?.originalPrice || product?.price || 0),
    discountPercentage: Number(product?.discountPercentage || 0),
    countInStock,
    brand: product?.brand || "EliteShop",
    category: product?.category || "General",
    seller: product?.seller || product?.user || null,
    freeShipping: Boolean(product?.freeShipping),
    shippingPrice: Number(product?.shippingPrice || 0),
    isFeatured: Boolean(product?.isFeatured),
    qty: normalizeQty(qty, countInStock),
  };
};

const normalizeCartFromServer = (cart) => {
  const items = Array.isArray(cart?.cartItems)
    ? cart.cartItems
    : [];

  return items
    .map((item) => {
      const product =
        item.product &&
        typeof item.product === "object"
          ? item.product
          : null;

      const productId =
        product?._id ||
        item.product ||
        item._id;

      if (!productId) return null;

      const countInStock = Number(
        product?.countInStock ??
          item.countInStock ??
          0
      );

      return {
        _id: productId,
        name: item.name || product?.name || "Product",
        slug:
          item.slug ||
          product?.slug ||
          productId,
        image:
          item.image ||
          product?.image ||
          "/placeholder.svg",
        images: Array.isArray(product?.images)
          ? product.images
          : [],
        price: Number(item.price ?? product?.price ?? 0),
        originalPrice: Number(
          item.originalPrice ??
            product?.originalPrice ??
            item.price ??
            product?.price ??
            0
        ),
        discountPercentage: Number(
          product?.discountPercentage || 0
        ),
        countInStock,
        brand:
          item.brand ||
          product?.brand ||
          "EliteShop",
        category:
          item.category ||
          product?.category ||
          "General",
        seller:
          product?.seller ||
          product?.user ||
          null,
        freeShipping: Boolean(product?.freeShipping),
        shippingPrice: Number(product?.shippingPrice || 0),
        isFeatured: Boolean(product?.isFeatured),
        qty: normalizeQty(item.qty, countInStock || item.qty),
      };
    })
    .filter(Boolean);
};

const normalizeWishlistFromServer = (wishlist) => {
  if (!Array.isArray(wishlist)) return [];

  return wishlist
    .map((item) => {
      const product = item.product || item;

      if (!product?._id) return null;

      return {
        _id: product._id,
        name: product.name || "Product",
        slug: product.slug || product._id,
        image: product.image || "/placeholder.svg",
        price: Number(product.price || 0),
        originalPrice: Number(product.originalPrice || product.price || 0),
        brand: product.brand || "EliteShop",
        category: product.category || "General",
        countInStock: Number(product.countInStock || 0),
      };
    })
    .filter(Boolean);
};

const initialState = {
  cartItems: [],
  wishlistItems: [],
  shippingAddress: {},
  paymentMethod: "Razorpay",
  coupon: null,
  cartLoading: false,
};

const cartReducer = (state, action) => {
  switch (action.type) {
    case "SET_CART_LOADING":
      return {
        ...state,
        cartLoading: action.payload,
      };

    case "LOAD_ACCOUNT_DATA":
      return {
        ...state,
        cartItems: action.payload.cartItems || [],
        wishlistItems: action.payload.wishlistItems || [],
        shippingAddress: action.payload.shippingAddress || {},
        paymentMethod: action.payload.paymentMethod || "Razorpay",
        coupon: action.payload.coupon || null,
        cartLoading: false,
      };

    case "LOAD_CART":
      return {
        ...state,
        cartItems: normalizeCartFromServer(action.payload),
        cartLoading: false,
      };

    case "LOAD_WISHLIST":
      return {
        ...state,
        wishlistItems: normalizeWishlistFromServer(action.payload),
      };

    case "ADD_TO_CART": {
      const item = action.payload;

      if (!item?._id || item.qty <= 0) return state;

      const exists = state.cartItems.find((x) => x._id === item._id);

      if (exists) {
        return {
          ...state,
          cartItems: state.cartItems.map((x) =>
            x._id === item._id ? item : x
          ),
        };
      }

      return {
        ...state,
        cartItems: [...state.cartItems, item],
      };
    }

    case "REMOVE_FROM_CART":
      return {
        ...state,
        cartItems: state.cartItems.filter(
          (item) => item._id !== action.payload
        ),
      };

    case "CLEAR_CART":
      return {
        ...state,
        cartItems: [],
        coupon: null,
      };

    case "ADD_TO_WISHLIST": {
      const item = action.payload;

      if (!item?._id) return state;

      const exists = state.wishlistItems.find((x) => x._id === item._id);

      if (exists) return state;

      return {
        ...state,
        wishlistItems: [...state.wishlistItems, item],
      };
    }

    case "REMOVE_FROM_WISHLIST":
      return {
        ...state,
        wishlistItems: state.wishlistItems.filter(
          (item) => item._id !== action.payload
        ),
      };

    case "CLEAR_WISHLIST":
      return {
        ...state,
        wishlistItems: [],
      };

    case "SAVE_SHIPPING_ADDRESS":
      return {
        ...state,
        shippingAddress: action.payload,
      };

    case "SAVE_PAYMENT_METHOD":
      return {
        ...state,
        paymentMethod: action.payload,
      };

    case "SAVE_COUPON":
      return {
        ...state,
        coupon: action.payload,
      };

    case "REMOVE_COUPON":
      return {
        ...state,
        coupon: null,
      };

    case "RESET_CHECKOUT":
      return {
        ...state,
        shippingAddress: {},
        paymentMethod: "Razorpay",
        coupon: null,
      };

    case "CLEAR_ALL":
      return {
        cartItems: [],
        wishlistItems: [],
        shippingAddress: {},
        paymentMethod: "Razorpay",
        coupon: null,
        cartLoading: false,
      };

    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const { userInfo } = useAuth();

  const [state, dispatch] = useReducer(cartReducer, initialState);

  const userId = getUserId(userInfo);

  const storageKeys = useMemo(() => {
    return {
      shippingAddress: getStorageKey("shippingAddress", userId),
      paymentMethod: getStorageKey("paymentMethod", userId),
      coupon: getStorageKey("coupon", userId),
    };
  }, [userId]);

  const loadAccountData = useCallback(async () => {
    clearOldCartStorage();

    if (!userId) {
      dispatch({
        type: "CLEAR_ALL",
      });

      return;
    }

    dispatch({
      type: "SET_CART_LOADING",
      payload: true,
    });

    const shippingAddress = getLocalStorage(
      storageKeys.shippingAddress,
      {}
    );

    const paymentMethod = getLocalStorage(
      storageKeys.paymentMethod,
      "Razorpay"
    );

    const coupon = getLocalStorage(
      storageKeys.coupon,
      null
    );

    try {
      const [cartRes, wishlistRes] = await Promise.all([
        api.get("/cart"),
        api.get("/users/wishlist"),
      ]);

      dispatch({
        type: "LOAD_ACCOUNT_DATA",
        payload: {
          cartItems: normalizeCartFromServer(cartRes.data),
          wishlistItems: normalizeWishlistFromServer(wishlistRes.data),
          shippingAddress,
          paymentMethod,
          coupon,
        },
      });
    } catch (error) {
      console.error(
        "Failed to load account cart/wishlist:",
        error.response?.data?.message || error.message
      );

      dispatch({
        type: "LOAD_ACCOUNT_DATA",
        payload: {
          cartItems: [],
          wishlistItems: [],
          shippingAddress,
          paymentMethod,
          coupon,
        },
      });
    }
  }, [
    userId,
    storageKeys.shippingAddress,
    storageKeys.paymentMethod,
    storageKeys.coupon,
  ]);

  useEffect(() => {
    loadAccountData();
  }, [loadAccountData]);

  useEffect(() => {
    if (!userId) return;

    setLocalStorage(
      storageKeys.shippingAddress,
      state.shippingAddress
    );
  }, [
    userId,
    storageKeys.shippingAddress,
    state.shippingAddress,
  ]);

  useEffect(() => {
    if (!userId) return;

    setLocalStorage(
      storageKeys.paymentMethod,
      state.paymentMethod
    );
  }, [
    userId,
    storageKeys.paymentMethod,
    state.paymentMethod,
  ]);

  useEffect(() => {
    if (!userId) return;

    setLocalStorage(
      storageKeys.coupon,
      state.coupon
    );
  }, [
    userId,
    storageKeys.coupon,
    state.coupon,
  ]);

  const redirectToLogin = () => {
    const currentPath =
      window.location.pathname + window.location.search;

    window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
  };

  const addToCart = async (product, qty = 1) => {
    if (!userId) {
      dispatch({
        type: "CLEAR_ALL",
      });

      redirectToLogin();
      return;
    }

    const item = normalizeLocalProduct(product, qty);

    if (!item?._id || item.qty <= 0) return;

    dispatch({
      type: "ADD_TO_CART",
      payload: item,
    });

    try {
      const { data } = await api.post("/cart", {
        productId: item._id,
        qty: item.qty,
      });

      dispatch({
        type: "LOAD_CART",
        payload: data,
      });
    } catch (error) {
      console.error(
        "Failed to save cart:",
        error.response?.data?.message || error.message
      );

      await loadAccountData();
    }
  };

  const increaseCartQty = async (id) => {
    const item = state.cartItems.find((x) => x._id === id);

    if (!item) return;

    const nextQty = normalizeQty(item.qty + 1, item.countInStock);

    dispatch({
      type: "ADD_TO_CART",
      payload: {
        ...item,
        qty: nextQty,
      },
    });

    if (!userId) return;

    try {
      const { data } = await api.put(`/cart/${id}`, {
        qty: nextQty,
      });

      dispatch({
        type: "LOAD_CART",
        payload: data,
      });
    } catch {
      await loadAccountData();
    }
  };

  const decreaseCartQty = async (id) => {
    const item = state.cartItems.find((x) => x._id === id);

    if (!item) return;

    const nextQty = Number(item.qty || 1) - 1;

    if (nextQty <= 0) {
      await removeFromCart(id);
      return;
    }

    dispatch({
      type: "ADD_TO_CART",
      payload: {
        ...item,
        qty: nextQty,
      },
    });

    if (!userId) return;

    try {
      const { data } = await api.put(`/cart/${id}`, {
        qty: nextQty,
      });

      dispatch({
        type: "LOAD_CART",
        payload: data,
      });
    } catch {
      await loadAccountData();
    }
  };

  const removeFromCart = async (id) => {
    dispatch({
      type: "REMOVE_FROM_CART",
      payload: id,
    });

    if (!userId) return;

    try {
      const { data } = await api.delete(`/cart/${id}`);

      dispatch({
        type: "LOAD_CART",
        payload: data,
      });
    } catch {
      await loadAccountData();
    }
  };

  const clearCart = async () => {
    dispatch({
      type: "CLEAR_CART",
    });

    if (!userId) return;

    try {
      const { data } = await api.delete("/cart");

      dispatch({
        type: "LOAD_CART",
        payload: data,
      });
    } catch {
      await loadAccountData();
    }
  };

  const addToWishlist = async (product) => {
    if (!userId) {
      dispatch({
        type: "CLEAR_WISHLIST",
      });

      redirectToLogin();
      return;
    }

    const item = normalizeLocalProduct(product, 1);

    dispatch({
      type: "ADD_TO_WISHLIST",
      payload: item,
    });

    try {
      const { data } = await api.post(`/users/wishlist/${item._id}`);

      dispatch({
        type: "LOAD_WISHLIST",
        payload: data,
      });
    } catch {
      await loadAccountData();
    }
  };

  const removeFromWishlist = async (id) => {
    dispatch({
      type: "REMOVE_FROM_WISHLIST",
      payload: id,
    });

    if (!userId) return;

    try {
      const { data } = await api.delete(`/users/wishlist/${id}`);

      dispatch({
        type: "LOAD_WISHLIST",
        payload: data,
      });
    } catch {
      await loadAccountData();
    }
  };

  const clearWishlist = async () => {
    dispatch({
      type: "CLEAR_WISHLIST",
    });

    if (!userId) return;

    try {
      const { data } = await api.delete("/users/wishlist");

      dispatch({
        type: "LOAD_WISHLIST",
        payload: data?.wishlist || [],
      });
    } catch {
      await loadAccountData();
    }
  };

  const saveShippingAddress = (data) => {
    dispatch({
      type: "SAVE_SHIPPING_ADDRESS",
      payload: {
        fullName: data?.fullName || "",
        phone: data?.phone || "",
        address: data?.address || "",
        landmark: data?.landmark || "",
        city: data?.city || "",
        state: data?.state || "",
        postalCode: data?.postalCode || "",
        country: data?.country || "India",
        addressType: data?.addressType || "Home",
        deliveryInstruction: data?.deliveryInstruction || "",
      },
    });
  };

  const clearShippingAddress = () => {
    dispatch({
      type: "SAVE_SHIPPING_ADDRESS",
      payload: {},
    });
  };

  const savePaymentMethod = (method) => {
    dispatch({
      type: "SAVE_PAYMENT_METHOD",
      payload: method || "Razorpay",
    });
  };

  const saveCoupon = (coupon) => {
    dispatch({
      type: "SAVE_COUPON",
      payload: coupon,
    });
  };

  const removeCoupon = () => {
    dispatch({
      type: "REMOVE_COUPON",
    });
  };

  const resetCheckout = () => {
    dispatch({
      type: "RESET_CHECKOUT",
    });
  };

  const clearAllCartState = () => {
    clearOldCartStorage();

    dispatch({
      type: "CLEAR_ALL",
    });
  };

  const isInCart = (id) => {
    return state.cartItems.some((item) => item._id === id);
  };

  const getCartItem = (id) => {
    return state.cartItems.find((item) => item._id === id);
  };

  const isInWishlist = (id) => {
    return state.wishlistItems.some((item) => item._id === id);
  };

  const syncCart = async () => {
    await loadAccountData();
  };

  const {
    itemsPrice,
    shippingPrice,
    taxPrice,
    discountPrice,
    totalPrice,
    totalItems,
    cartCount,
    wishlistCount,
    totalSavings,
    freeShippingAmountLeft,
    freeShippingProgress,
  } = useMemo(() => {
    const itemsPrice = round2(
      state.cartItems.reduce(
        (acc, item) =>
          acc + Number(item.price || 0) * Number(item.qty || 0),
        0
      )
    );

    const totalItems = state.cartItems.reduce(
      (acc, item) => acc + Number(item.qty || 0),
      0
    );

    const shippingPrice =
      itemsPrice > 1000 || itemsPrice === 0
        ? 0
        : 80;

    const taxPrice = round2(0.18 * itemsPrice);

    const couponDiscount = Number(state.coupon?.discount || 0);

    const discountPrice = round2(
      Math.min(couponDiscount, itemsPrice + shippingPrice + taxPrice)
    );

    const totalPrice = round2(
      itemsPrice + shippingPrice + taxPrice - discountPrice
    );

    const totalSavings = round2(
      state.cartItems.reduce((acc, item) => {
        const originalPrice = Number(item.originalPrice || item.price || 0);
        const price = Number(item.price || 0);

        if (originalPrice > price) {
          return acc + (originalPrice - price) * Number(item.qty || 0);
        }

        return acc;
      }, 0)
    );

    const freeShippingGoal = 1000;

    const freeShippingAmountLeft = Math.max(
      round2(freeShippingGoal - itemsPrice),
      0
    );

    const freeShippingProgress = Math.min(
      Math.round((itemsPrice / freeShippingGoal) * 100),
      100
    );

    return {
      itemsPrice,
      shippingPrice,
      taxPrice,
      discountPrice,
      totalPrice,
      totalItems,
      cartCount: totalItems,
      wishlistCount: state.wishlistItems.length,
      totalSavings,
      freeShippingAmountLeft,
      freeShippingProgress,
    };
  }, [
    state.cartItems,
    state.coupon,
    state.wishlistItems,
  ]);

  const value = {
    ...state,

    addToCart,
    increaseCartQty,
    decreaseCartQty,
    removeFromCart,
    clearCart,
    clearAllCartState,
    isInCart,
    getCartItem,
    syncCart,

    saveShippingAddress,
    clearShippingAddress,

    savePaymentMethod,

    addToWishlist,
    removeFromWishlist,
    clearWishlist,
    isInWishlist,

    saveCoupon,
    removeCoupon,

    resetCheckout,

    itemsPrice,
    shippingPrice,
    taxPrice,
    discountPrice,
    totalPrice,
    totalItems,
    cartCount,
    wishlistCount,
    totalSavings,
    freeShippingAmountLeft,
    freeShippingProgress,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }

  return context;
};