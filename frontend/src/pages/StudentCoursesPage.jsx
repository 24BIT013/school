import { useEffect, useState } from "react";
import { listCourses, registerCourse } from "../api/courses";

const StudentCoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState({ course: "", session: "2025/2026" });
  const [message, setMessage] = useState("");

  const loadCourses = async () => {
    const data = await listCourses();
    setCourses(data.results || data);
  };

  useEffect(() => {
    loadCourses().catch(() => setMessage("Failed to load courses"));
  }, []);

  const handleRegister = async (event) => {
    event.preventDefault();
    setMessage("");
    try {
      await registerCourse({ course: Number(form.course), session: form.session });
      setMessage("Course registration submitted.");
    } catch (error) {
      setMessage(error.response?.data?.detail || JSON.stringify(error.response?.data) || "Registration failed");
    }
  };

  return (
    <div className="dashboard-grid">
      <section className="card">
        <h3>Register Course</h3>
        <form onSubmit={handleRegister} className="form-grid">
          <select
            value={form.course}
            onChange={(event) => setForm({ ...form, course: event.target.value })}
            required
          >
            <option value="">Select Course</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.code} - {course.title}
              </option>
            ))}
          </select>
          <input
            placeholder="Session (e.g. 2025/2026)"
            value={form.session}
            onChange={(event) => setForm({ ...form, session: event.target.value })}
            required
          />
          <button type="submit">Register Course</button>
        </form>
        {message && <p className="info">{message}</p>}
      </section>

      <section className="card">
        <h3>Available Courses</h3>
        <table>
          <thead>
            <tr>
              <th>Code</th>
              <th>Title</th>
              <th>Unit</th>
              <th>Semester</th>
              <th>Level</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((course) => (
              <tr key={course.id}>
                <td>{course.code}</td>
                <td>{course.title}</td>
                <td>{course.unit}</td>
                <td>{course.semester}</td>
                <td>{course.level}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default StudentCoursesPage;
