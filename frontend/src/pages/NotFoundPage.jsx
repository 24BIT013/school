import { Link } from "react-router-dom";

const NotFoundPage = () => {
  return (
    <section className="card">
      <h3>Page Not Found</h3>
      <p>The page you requested does not exist.</p>
      <Link className="action-link" to="/">Back to Home</Link>
    </section>
  );
};

export default NotFoundPage;
