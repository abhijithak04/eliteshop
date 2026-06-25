import { Spinner } from "react-bootstrap"

const Loader = () => {
  return (
    <div className="loading-spinner">
      <Spinner
        animation="border"
        role="status"
        style={{
          width: "100px",
          height: "100px",
          margin: "auto",
          display: "block",
        }}
      >
        <span className="visually-hidden">Loading...</span>
      </Spinner>
    </div>
  )
}

export default Loader
