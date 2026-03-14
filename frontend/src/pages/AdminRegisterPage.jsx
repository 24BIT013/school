import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../api/auth";

const AdminRegisterPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    role: "ADMIN",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      await registerUser(form);
      setSuccess("Registration successful. You can now login.");
      navigate("/login");
    } catch (err) {
      if (!err.response) {
        setError("Cannot connect to backend. Start Django server at http://127.0.0.1:8000");
        return;
      }
      const apiErr = err.response?.data;
      setError(typeof apiErr === "string" ? apiErr : JSON.stringify(apiErr));
    }
  };

  return (
    <div className="auth-wrap">
      <div className="card auth-card">
        <h3>Admin Registration</h3>
        <p className="muted">Register as an admin to manage courses, registrations, and results.</p>

        <form onSubmit={handleSubmit} className="form-grid">
          <input
            placeholder="First name"
            value={form.first_name}
            onChange={(e) => setForm({ ...form, first_name: e.target.value })}
            required
          />
          <input
            placeholder="Last name"
            value={form.last_name}
            onChange={(e) => setForm({ ...form, last_name: e.target.value })}
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
          <button type="submit">Register as Admin</button>
        </form>

        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}

        <p className="muted auth-foot">
          Already have an account? <Link to="/login">Login</Link> | <Link to="/student/register">Register as Student</Link>
        </p>
      </div>
    </div>
  );
};

export default AdminRegisterPage;

