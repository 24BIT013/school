import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { createResult } from "../api/results";
import { listCourses } from "../api/courses";

const AdminCreateResultPage = () => {
  const [searchParams] = useSearchParams();
  const prefetchedStudentId = searchParams.get("student_id") || "";
  const [form, setForm] = useState({ student_id: "", course: "", score: "" });
  const [courses, setCourses] = useState([]);
  const [created, setCreated] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    listCourses()
      .then((data) => setCourses(data.results || data))
      .catch(() => setMessage("Failed to load courses"));
  }, []);

  useEffect(() => {
    if (prefetchedStudentId) {
      setForm((prev) => ({ ...prev, student_id: prefetchedStudentId }));
    }
  }, [prefetchedStudentId]);

  const handleCreateResult = async (event) => {
    event.preventDefault();
    setMessage("");
    setCreated(null);
    try {
      const createdResult = await createResult({
        student_login_id: form.student_id.trim(),
        course: Number(form.course),
        score: Number(form.score),
      });
      setCreated(createdResult);
      setMessage("Result created successfully.");
      setForm({ student_id: "", course: "", score: "" });
    } catch (error) {
      const apiErr = error.response?.data;
      if (typeof apiErr === "string") {
        setMessage(apiErr);
      } else if (Array.isArray(apiErr?.non_field_errors) && apiErr.non_field_errors.length > 0) {
        setMessage(apiErr.non_field_errors[0]);
      } else if (apiErr && typeof apiErr === "object") {
        const firstError = Object.values(apiErr).find((v) => Array.isArray(v) && v.length > 0);
        setMessage(firstError?.[0] || "Failed to create result");
      } else {
        setMessage("Failed to create result");
      }
    }
  };

  return (
    <section className="card">
      <h3>Create Result</h3>
      <form onSubmit={handleCreateResult} className="form-grid">
        <input
          placeholder="Student ID"
          value={form.student_id}
          onChange={(event) => setForm({ ...form, student_id: event.target.value })}
          required
        />
        <select
          value={form.course}
          onChange={(event) => setForm({ ...form, course: event.target.value })}
          required
        >
          <option value="">Select course</option>
          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.id} - {course.code} ({course.title})
            </option>
          ))}
        </select>
        <input
          type="number"
          min="0"
          max="100"
          placeholder="Score"
          value={form.score}
          onChange={(event) => setForm({ ...form, score: event.target.value })}
          required
        />
        <button type="submit">Create Result</button>
      </form>
      {message && <p className="info">{message}</p>}
      {created && (
        <table>
          <thead>
            <tr>
              <th>Student ID</th>
              <th>Course ID</th>
              <th>Course Name</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{created.student_id || "-"}</td>
              <td>{created.course_id}</td>
              <td>{created.course_name}</td>
              <td>
                <span className={created.status === "Pass" ? "badge-pass" : "badge-fail"}>
                  {created.status}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      )}
    </section>
  );
};

export default AdminCreateResultPage;
