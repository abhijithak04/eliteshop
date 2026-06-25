import { Link } from "react-router-dom";

const NotFoundPage = () => {
  return (
    <main className="py-5 text-center">
      <div
        className="mx-auto p-4 rounded-4 shadow-lg bg-white"
        style={{
          maxWidth: "620px",
        }}
      >
        <h1 className="fw-bold display-5 mb-2">
          404
        </h1>

        <h4 className="fw-bold mb-3">
          Page not found
        </h4>

        <p className="text-muted mb-4">
          The page you are looking for does not exist or may have been moved.
        </p>

        <Link
          to="/"
          className="btn btn-dark rounded-pill fw-bold px-4"
        >
          Back to Home
        </Link>
      </div>
    </main>
  );
};

export default NotFoundPage;