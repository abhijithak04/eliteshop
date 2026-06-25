import { Card } from "react-bootstrap"

const ProductSkeleton = () => {
  return (
    <Card className="p-3">
      <div className="skeleton-img"></div>
      <div className="skeleton-text"></div>
      <div className="skeleton-text small"></div>
    </Card>
  )
}

export default ProductSkeleton