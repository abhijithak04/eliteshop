const CheckoutSteps = ({ step1, step2, step3, step4 }) => {
  return (
    <div className="step-indicator mb-4">
      <div className={`step ${step1 ? "active" : ""}`}>
        <div className="step-number">1</div>
        <span>Sign In</span>
      </div>

      <div className={`step ${step2 ? "active" : ""}`}>
        <div className="step-number">2</div>
        <span>Shipping</span>
      </div>

      <div className={`step ${step3 ? "active" : ""}`}>
        <div className="step-number">3</div>
        <span>Payment</span>
      </div>

      <div className={`step ${step4 ? "active" : ""}`}>
        <div className="step-number">4</div>
        <span>Place Order</span>
      </div>
    </div>
  )
}

export default CheckoutSteps
