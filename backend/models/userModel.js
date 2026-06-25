import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const addressSchema = mongoose.Schema(
  {
    fullName: {
      type: String,
      trim: true,
    },

    phone: {
      type: String,
      trim: true,
    },

    addressLine: {
      type: String,
      trim: true,
    },

    city: {
      type: String,
      trim: true,
    },

    state: {
      type: String,
      trim: true,
    },

    postalCode: {
      type: String,
      trim: true,
    },

    country: {
      type: String,
      trim: true,
      default: "India",
    },

    addressType: {
      type: String,
      enum: ["Home", "Work", "Other"],
      default: "Home",
    },

    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const notificationPreferenceSchema = mongoose.Schema(
  {
    orderUpdates: {
      type: Boolean,
      default: true,
    },

    paymentUpdates: {
      type: Boolean,
      default: true,
    },

    deliveryUpdates: {
      type: Boolean,
      default: true,
    },

    wishlistAlerts: {
      type: Boolean,
      default: true,
    },

    offers: {
      type: Boolean,
      default: true,
    },

    securityAlerts: {
      type: Boolean,
      default: true,
    },
  },
  {
    _id: false,
  }
);

const sellerInfoSchema = mongoose.Schema(
  {
    shopName: {
      type: String,
      trim: true,
      default: "",
    },

    shopAddress: {
      type: String,
      trim: true,
      default: "",
    },

    gstNumber: {
      type: String,
      trim: true,
      uppercase: true,
      default: "",
    },

    bankAccount: {
      type: String,
      trim: true,
      default: "",
    },

    businessPhone: {
      type: String,
      trim: true,
      default: "",
    },

    businessEmail: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
    },

    pickupAddress: {
      type: String,
      trim: true,
      default: "",
    },

    productCategory: {
      type: String,
      trim: true,
      default: "",
    },

    businessDescription: {
      type: String,
      trim: true,
      default: "",
    },

    logo: {
      type: String,
      default: "",
    },

    description: {
      type: String,
      default: "",
    },

    isApproved: {
      type: Boolean,
      default: false,
    },

    approvedAt: {
      type: Date,
    },

    rejectedReason: {
      type: String,
      default: "",
    },
  },
  {
    _id: false,
  }
);

const wishlistSchema = mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    priceWhenAdded: {
      type: Number,
      default: 0,
    },

    currentPrice: {
      type: Number,
      default: 0,
    },

    notifyPriceDrop: {
      type: Boolean,
      default: true,
    },

    notifyBackInStock: {
      type: Boolean,
      default: true,
    },

    collectionName: {
      type: String,
      default: "Default",
    },
  },
  {
    timestamps: true,
  }
);

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
      select: true,
    },

    role: {
      type: String,
      enum: ["user", "seller", "admin"],
      default: "user",
      index: true,
    },

    isAdmin: {
      type: Boolean,
      default: false,
    },

    phone: {
      type: String,
      trim: true,
      default: "",
    },

    address: {
      type: String,
      trim: true,
      default: "",
    },

    avatar: {
      type: String,
      default: "/images/default-avatar.png",
    },

    gender: {
      type: String,
      enum: [
        "",
        "male",
        "female",
        "other",
        "prefer-not-to-say",
      ],
      default: "",
    },

    dateOfBirth: {
      type: Date,
    },

    bio: {
      type: String,
      trim: true,
      maxlength: 300,
      default: "",
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    lastLoginAt: {
      type: Date,
    },

    lastPasswordChangedAt: {
      type: Date,
    },

    addresses: [addressSchema],

    sellerInfo: {
      type: sellerInfoSchema,
      default: () => ({}),
    },

    wishlist: [wishlistSchema],

    walletBalance: {
      type: Number,
      default: 0,
    },

    walletTransactions: [
      {
        type: {
          type: String,
          enum: ["credit", "debit", "refund", "cashback"],
        },

        amount: {
          type: Number,
          default: 0,
        },

        description: {
          type: String,
          default: "",
        },

        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    couponsUsed: [
      {
        code: {
          type: String,
          uppercase: true,
          trim: true,
        },

        usedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    notificationPreferences: {
      type: notificationPreferenceSchema,
      default: () => ({}),
    },

    otp: {
      type: String,
    },

    otpExpire: {
      type: Date,
    },

    resetPasswordToken: {
      type: String,
    },

    resetPasswordExpire: {
      type: Date,
    },

    deleteAccountRequested: {
      type: Boolean,
      default: false,
    },

    deleteAccountRequestedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// =========================
// INDEXES
// =========================

userSchema.index({
  email: 1,
});

userSchema.index({
  role: 1,
  createdAt: -1,
});

userSchema.index({
  "sellerInfo.isApproved": 1,
});

userSchema.index({
  "wishlist.product": 1,
});

// =========================
// PASSWORD MATCH
// =========================

userSchema.methods.matchPassword = async function (
  enteredPassword
) {
  return await bcrypt.compare(
    enteredPassword,
    this.password
  );
};

// =========================
// PASSWORD HASHING
// =========================

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);

  this.password = await bcrypt.hash(
    this.password,
    salt
  );

  this.lastPasswordChangedAt = new Date();

  next();
});

// =========================
// KEEP isAdmin SYNCED WITH role
// =========================

userSchema.pre("save", function (next) {
  this.isAdmin = this.role === "admin";
  next();
});

// =========================
// REMOVE SENSITIVE DATA FROM JSON
// =========================

userSchema.methods.toJSON = function () {
  const user = this.toObject();

  delete user.password;
  delete user.otp;
  delete user.otpExpire;
  delete user.resetPasswordToken;
  delete user.resetPasswordExpire;

  return user;
};

const User =
  mongoose.models.User ||
  mongoose.model("User", userSchema);

export default User;