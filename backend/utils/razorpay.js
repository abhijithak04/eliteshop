import Razorpay from "razorpay";
import crypto from "crypto";

// Debug check (remove later)
console.log(
  "RAZORPAY_KEY_ID:",
  process.env.RAZORPAY_KEY_ID
);

// =============================
// Lazy Razorpay Initialization
// =============================

let razorpayInstance = null;

if (
  process.env.RAZORPAY_KEY_ID &&
  process.env.RAZORPAY_KEY_SECRET
) {

  razorpayInstance = new Razorpay({

    key_id:
      process.env.RAZORPAY_KEY_ID,

    key_secret:
      process.env.RAZORPAY_KEY_SECRET,

  });

}


// =============================
// Create Razorpay Order
// =============================

export const createRazorpayOrder =
  async (
    amount,
    currency = "INR"
  ) => {

    if (!razorpayInstance) {

      throw new Error(
        "Razorpay not initialized. Check .env file."
      );

    }

    try {

      const options = {

        amount:
          Math.round(Number(amount) * 100),

        currency,

        receipt:
          `receipt_${Date.now()}`,

      };

      const order =
        await razorpayInstance.orders.create(
          options
        );

      return order;

    } catch (error) {

      console.error(
        "Razorpay Order Error:",
        error
      );

      throw new Error(
        "Razorpay Order Creation Failed"
      );

    }

  };


// =============================
// Verify Razorpay Payment
// =============================

export const verifyRazorpayPayment =
  (
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature
  ) => {

    const generated_signature =
      crypto
        .createHmac(
          "sha256",
          process.env.RAZORPAY_KEY_SECRET
        )
        .update(
          razorpay_order_id +
          "|" +
          razorpay_payment_id
        )
        .digest("hex");

    return (
      generated_signature ===
      razorpay_signature
    );

  };