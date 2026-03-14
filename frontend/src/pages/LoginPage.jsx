import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser, getMe } from "../api/auth";

const LoginPage = ({ onLogin }) => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ student_id: "", password: "" });
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const data = await loginUser(form);
      localStorage.setItem("access", data.access);
      localStorage.setItem("refresh", data.refresh);
      const user = await getMe();
      onLogin(user);
      navigate(user.role === "ADMIN" ? "/admin" : "/student");
    } catch (err) {
      if (!err.response) {
        setError("Cannot connect to backend. Start Django server at http://127.0.0.1:8000");
        return;
      }
      const apiErr = err.response?.data;
      if (typeof apiErr === "string") {
        setError(apiErr);
      } else if (apiErr?.non_field_errors?.[0]) {
        setError(apiErr.non_field_errors[0]);
      } else if (apiErr?.detail) {
        setError(apiErr.detail);
      } else if (apiErr && typeof apiErr === "object") {
        const firstError = Object.values(apiErr).find((v) => Array.isArray(v) && v.length);
        setError(firstError?.[0] || "Login failed");
      } else {
        setError("Login failed");
      }
    }
  };

  return (
    <div className="auth-wrap">
      <div className="card auth-card">
        <h3>Welcome Back</h3>
        <p className="muted">Login with your student ID to continue to your dashboard.</p>

        <form onSubmit={handleSubmit} className="form-grid">
          <input
            placeholder="Student ID"
            value={form.student_id}
            onChange={(e) => setForm({ ...form, student_id: e.target.value })}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
          <button type="submit">Login</button>
        </form>

        {error && <p className="error">{error}</p>}

        <p className="muted auth-foot">
          New here? <Link to="/student/register">Register as Student</Link> | <Link to="/admin/register">Register as Admin</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
