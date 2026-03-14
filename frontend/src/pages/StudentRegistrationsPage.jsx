import { useEffect, useState } from "react";
import { myRegistrations, dropRegistration } from "../api/courses";

const StudentRegistrationsPage = () => {
  const [registrations, setRegistrations] = useState([]);
  const [message, setMessage] = useState("");

  const loadRegistrations = async () => {
    const data = await myRegistrations();
    setRegistrations(data.results || data);
  };

  useEffect(() => {
    loadRegistrations().catch(() => setMessage("Failed to load registrations"));
  }, []);

  const handleDrop = async (id) => {
    setMessage("");
    try {
      await dropRegistration(id);
      setMessage("Course dropped.");
      await loadRegistrations();
    } catch (error) {
      setMessage(error.response?.data?.detail || "Drop failed");
    }
  };

  return (
    <section className="card">
      <h3>My Registrations</h3>
      {message && <p className="info">{message}</p>}
      <table>
        <thead>
          <tr>
            <th>Course</th>
            <th>Session</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {registrations.map((registration) => (
            <tr key={registration.id}>
              <td>{registration.course_code}</td>
              <td>{registration.session}</td>
              <td>{registration.status}</td>
              <td>
                {registration.status === "PENDING" && (
                  <button onClick={() => handleDrop(registration.id)}>Drop</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
};

export default StudentRegistrationsPage;
