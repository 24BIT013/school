import { useEffect, useState } from "react";
import { pendingRegistrations, approveRegistration } from "../api/courses";

const AdminRegistrationsPage = () => {
  const [pending, setPending] = useState([]);
  const [message, setMessage] = useState("");

  const loadPending = async () => {
    const data = await pendingRegistrations();
    setPending(data.results || data);
  };

  useEffect(() => {
    loadPending().catch(() => setMessage("Failed to load pending registrations"));
  }, []);

  const handleApprove = async (id) => {
    setMessage("");
    try {
      await approveRegistration(id);
      setMessage("Registration approved.");
      await loadPending();
    } catch (error) {
      setMessage(error.response?.data?.detail || "Approval failed");
    }
  };

  return (
    <section className="card">
      <h3>Pending Course Registrations</h3>
      {message && <p className="info">{message}</p>}
      <table>
        <thead>
          <tr>
            <th>Student ID</th>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Email</th>
            <th>Course</th>
            <th>Session</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {pending.map((registration) => (
            <tr key={registration.id}>
              <td>{registration.student_id || "-"}</td>
              <td>{registration.student_first_name || "-"}</td>
              <td>{registration.student_last_name || "-"}</td>
              <td>{registration.student_email}</td>
              <td>{registration.course_code}</td>
              <td>{registration.session}</td>
              <td>
                <button onClick={() => handleApprove(registration.id)}>Approve</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
};

export default AdminRegistrationsPage;
