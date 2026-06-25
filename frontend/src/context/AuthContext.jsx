import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from "react";

import api from "../utils/axios";

const AuthContext = createContext(null);

const safeParse = (key) => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  } catch {
    localStorage.removeItem(key);
    return null;
  }
};

const getStoredUser = () => {
  return safeParse("userInfo");
};

const normalizeRole = (role) => {
  return role?.toLowerCase?.() || "user";
};

const normalizeUser = (data = {}) => {
  const normalized = {
    ...data,
    role: normalizeRole(data.role),
  };

  if (normalized.role === "customer") {
    normalized.role = "user";
  }

  return normalized;
};

const getErrorMessage = (error, fallback = "Something went wrong") => {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallback
  );
};

const initialState = {
  userInfo: getStoredUser(),
  loading: true,
  authLoading: false,
  profileLoading: false,
  error: null,
  initialized: false,
};

const authReducer = (state, action) => {
  switch (action.type) {
    case "INIT_START":
      return {
        ...state,
        loading: true,
        profileLoading: true,
        error: null,
      };

    case "INIT_END":
      return {
        ...state,
        loading: false,
        profileLoading: false,
        initialized: true,
      };

    case "AUTH_REQUEST":
      return {
        ...state,
        authLoading: true,
        loading: false,
        error: null,
      };

    case "PROFILE_REQUEST":
      return {
        ...state,
        profileLoading: true,
        error: null,
      };

    case "AUTH_SUCCESS":
      return {
        ...state,
        userInfo: action.payload,
        authLoading: false,
        profileLoading: false,
        loading: false,
        initialized: true,
        error: null,
      };

    case "AUTH_FAIL":
      return {
        ...state,
        authLoading: false,
        profileLoading: false,
        loading: false,
        initialized: true,
        error: action.payload,
      };

    case "UPDATE_USER":
      return {
        ...state,
        userInfo: {
          ...state.userInfo,
          ...action.payload,
        },
        error: null,
      };

    case "LOGOUT":
      return {
        ...state,
        userInfo: null,
        authLoading: false,
        profileLoading: false,
        loading: false,
        initialized: true,
        error: null,
      };

    case "CLEAR_ERROR":
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const persistUser = useCallback((data) => {
    const user = normalizeUser(data);

    localStorage.setItem("userInfo", JSON.stringify(user));

    if (user.token) {
      localStorage.setItem("token", user.token);
    }

    dispatch({
      type: "AUTH_SUCCESS",
      payload: user,
    });

    return user;
  }, []);

  const clearStoredAuth = useCallback(() => {
    localStorage.removeItem("userInfo");
    localStorage.removeItem("token");
  }, []);

  const clearError = useCallback(() => {
    dispatch({
      type: "CLEAR_ERROR",
    });
  }, []);

  const refreshProfile = useCallback(async () => {
    const storedUser = getStoredUser();
    const storedToken = localStorage.getItem("token");

    if (!storedUser && !storedToken) {
      dispatch({
        type: "INIT_END",
      });

      return {
        success: false,
        message: "No active session",
      };
    }

    try {
      dispatch({
        type: "PROFILE_REQUEST",
      });

      const { data } = await api.get("/users/profile");

      const mergedUser = normalizeUser({
        ...storedUser,
        ...data,
        token: data.token || storedUser?.token || storedToken || "",
      });

      localStorage.setItem("userInfo", JSON.stringify(mergedUser));

      if (mergedUser.token) {
        localStorage.setItem("token", mergedUser.token);
      }

      dispatch({
        type: "AUTH_SUCCESS",
        payload: mergedUser,
      });

      return {
        success: true,
        data: mergedUser,
      };
    } catch (error) {
      const message = getErrorMessage(error, "Session expired");

      clearStoredAuth();

      dispatch({
        type: "LOGOUT",
      });

      return {
        success: false,
        message,
      };
    }
  }, [clearStoredAuth]);

  useEffect(() => {
    let active = true;

    const initAuth = async () => {
      if (!active) return;

      dispatch({
        type: "INIT_START",
      });

      await refreshProfile();

      if (active) {
        dispatch({
          type: "INIT_END",
        });
      }
    };

    initAuth();

    return () => {
      active = false;
    };
  }, [refreshProfile]);

  const login = useCallback(
    async (email, password) => {
      try {
        dispatch({
          type: "AUTH_REQUEST",
        });

        const { data } = await api.post("/users/auth", {
          email,
          password,
        });

        const user = persistUser(data);

        return {
          success: true,
          data: user,
        };
      } catch (error) {
        const message = getErrorMessage(error, "Login failed");

        dispatch({
          type: "AUTH_FAIL",
          payload: message,
        });

        return {
          success: false,
          message,
        };
      }
    },
    [persistUser]
  );

  const sellerLogin = useCallback(
    async (email, password) => {
      try {
        dispatch({
          type: "AUTH_REQUEST",
        });

        const { data } = await api.post("/users/seller/auth", {
          email,
          password,
        });

        const user = persistUser({
          ...data,
          role: "seller",
        });

        const approvalStatus =
          user.sellerApprovalStatus ||
          user.approvalStatus ||
          (user.sellerInfo?.isApproved ||
          user.isSellerApproved ||
          user.sellerApproved
            ? "approved"
            : "pending");

        return {
          success: true,
          data: user,
          approvalStatus,
        };
      } catch (error) {
        const message = getErrorMessage(error, "Seller login failed");

        dispatch({
          type: "AUTH_FAIL",
          payload: message,
        });

        return {
          success: false,
          message,
        };
      }
    },
    [persistUser]
  );

  const register = useCallback(
    async (...args) => {
      try {
        dispatch({
          type: "AUTH_REQUEST",
        });

        let payload = {};

        if (typeof args[0] === "object") {
          payload = args[0];
        } else {
          const [name, email, password, phone = ""] = args;

          payload = {
            name,
            email,
            password,
            phone,
          };
        }

        const { data } = await api.post("/users", payload);

        dispatch({
          type: "CLEAR_ERROR",
        });

        return {
          success: true,
          data,
          message:
            data.message ||
            "Account created successfully. Please login.",
        };
      } catch (error) {
        const message = getErrorMessage(error, "Registration failed");

        dispatch({
          type: "AUTH_FAIL",
          payload: message,
        });

        return {
          success: false,
          message,
        };
      }
    },
    []
  );

  const sellerRegister = useCallback(async (sellerData) => {
    try {
      dispatch({
        type: "AUTH_REQUEST",
      });

      let data;

      try {
        const response = await api.post(
          "/users/seller/register",
          sellerData
        );

        data = response.data;
      } catch (error) {
        if (error?.response?.status !== 404) {
          throw error;
        }

        const fallbackResponse = await api.post("/users", {
          ...sellerData,
          role: "seller",
          sellerInfo: sellerData.sellerInfo || {
            shopName: sellerData.shopName,
            shopCategory: sellerData.shopCategory,
            businessPhone: sellerData.businessPhone,
            businessAddress: sellerData.businessAddress,
            isApproved: false,
          },
        });

        data = fallbackResponse.data;
      }

      dispatch({
        type: "CLEAR_ERROR",
      });

      return {
        success: true,
        data,
        message:
          data.message ||
          "Seller account created. Please wait for admin approval.",
      };
    } catch (error) {
      const message = getErrorMessage(error, "Seller registration failed");

      dispatch({
        type: "AUTH_FAIL",
        payload: message,
      });

      return {
        success: false,
        message,
      };
    }
  }, []);

  const updateProfile = useCallback(
    async (payload) => {
      try {
        dispatch({
          type: "AUTH_REQUEST",
        });

        const { data } = await api.put("/users/profile", payload);

        const updatedUser = normalizeUser({
          ...state.userInfo,
          ...payload,
          ...data,
          token: data.token || state.userInfo?.token || localStorage.getItem("token"),
        });

        localStorage.setItem("userInfo", JSON.stringify(updatedUser));

        dispatch({
          type: "AUTH_SUCCESS",
          payload: updatedUser,
        });

        return {
          success: true,
          data: updatedUser,
          message: "Profile updated successfully",
        };
      } catch (error) {
        const message = getErrorMessage(error, "Profile update failed");

        dispatch({
          type: "AUTH_FAIL",
          payload: message,
        });

        return {
          success: false,
          message,
        };
      }
    },
    [state.userInfo]
  );

  const changePassword = useCallback(async (password) => {
    try {
      dispatch({
        type: "AUTH_REQUEST",
      });

      await api.put("/users/profile", {
        password,
      });

      dispatch({
        type: "CLEAR_ERROR",
      });

      return {
        success: true,
        message: "Password changed successfully",
      };
    } catch (error) {
      const message = getErrorMessage(error, "Password update failed");

      dispatch({
        type: "AUTH_FAIL",
        payload: message,
      });

      return {
        success: false,
        message,
      };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post("/users/logout");
    } catch (error) {
      console.log(error);
    } finally {
      clearStoredAuth();

      dispatch({
        type: "LOGOUT",
      });

      window.location.href = "/login";
    }
  }, [clearStoredAuth]);

  const sellerLogout = useCallback(async () => {
    try {
      await api.post("/users/logout");
    } catch (error) {
      console.log(error);
    } finally {
      clearStoredAuth();

      dispatch({
        type: "LOGOUT",
      });

      window.location.href = "/seller/login";
    }
  }, [clearStoredAuth]);

  const setUserInfo = useCallback((data) => {
    const updatedUser = normalizeUser(data);

    localStorage.setItem("userInfo", JSON.stringify(updatedUser));

    if (updatedUser.token) {
      localStorage.setItem("token", updatedUser.token);
    }

    dispatch({
      type: "AUTH_SUCCESS",
      payload: updatedUser,
    });
  }, []);

  const updateLocalUser = useCallback((data) => {
    const updatedUser = normalizeUser({
      ...state.userInfo,
      ...data,
    });

    localStorage.setItem("userInfo", JSON.stringify(updatedUser));

    if (updatedUser.token) {
      localStorage.setItem("token", updatedUser.token);
    }

    dispatch({
      type: "UPDATE_USER",
      payload: data,
    });

    return updatedUser;
  }, [state.userInfo]);

  const isAuthenticated = useMemo(() => {
    return !!state.userInfo;
  }, [state.userInfo]);

  const userRole = useMemo(() => {
    return normalizeRole(state.userInfo?.role);
  }, [state.userInfo]);

  const isAdmin = useMemo(() => {
    return userRole === "admin";
  }, [userRole]);

  const isSeller = useMemo(() => {
    return userRole === "seller";
  }, [userRole]);

  const isUser = useMemo(() => {
    return userRole === "user" || userRole === "customer";
  }, [userRole]);

  const sellerApproved = useMemo(() => {
    return Boolean(
      state.userInfo?.sellerInfo?.isApproved ||
        state.userInfo?.isSellerApproved ||
        state.userInfo?.sellerApproved
    );
  }, [state.userInfo]);

  const hasRole = useCallback(
    (roles = []) => {
      if (!roles || roles.length === 0) return true;

      const normalizedRoles = roles.map((role) =>
        role.toLowerCase()
      );

      return normalizedRoles.includes(userRole);
    },
    [userRole]
  );

  const value = useMemo(
    () => ({
      ...state,

      isAuthenticated,
      userRole,
      isAdmin,
      isSeller,
      isUser,
      sellerApproved,

      login,
      sellerLogin,
      register,
      sellerRegister,
      logout,
      sellerLogout,

      refreshProfile,
      updateProfile,
      changePassword,

      setUserInfo,
      updateLocalUser,

      hasRole,
      clearError,
    }),
    [
      state,
      isAuthenticated,
      userRole,
      isAdmin,
      isSeller,
      isUser,
      sellerApproved,
      login,
      sellerLogin,
      register,
      sellerRegister,
      logout,
      sellerLogout,
      refreshProfile,
      updateProfile,
      changePassword,
      setUserInfo,
      updateLocalUser,
      hasRole,
      clearError,
    ]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
};