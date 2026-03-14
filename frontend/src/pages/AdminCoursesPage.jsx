import { useEffect, useState } from "react";
import { listCourses, addCourse } from "../api/courses";

const AdminCoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    code: "",
    title: "",
    unit: 3,
    semester: "FIRST",
    level: "100",
    is_active: true,
  });

  const loadCourses = async () => {
    const data = await listCourses();
    setCourses(data.results || data);
  };

  useEffect(() => {
    loadCourses().catch(() => setMessage("Failed to load courses"));
  }, []);

  const handleAddCourse = async (event) => {
    event.preventDefault();
    setMessage("");
    try {
      await addCourse({ ...form, unit: Number(form.unit) });
      setMessage("Course added.");
      setForm({ code: "", title: "", unit: 3, semester: "FIRST", level: "100", is_active: true });
      await loadCourses();
    } catch (error) {
      setMessage(JSON.stringify(error.response?.data) || "Failed to add course");
    }
  };

  return (
    <div className="dashboard-grid">
      <section className="card">
        <h3>Add Course</h3>
        <form onSubmit={handleAddCourse} className="form-grid">
          <input placeholder="Code" value={form.code} onChange={(event) => setForm({ ...form, code: event.target.value })} required />
          <input placeholder="Title" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} required />
          <input type="number" placeholder="Unit" value={form.unit} onChange={(event) => setForm({ ...form, unit: event.target.value })} required />
          <select value={form.semester} onChange={(event) => setForm({ ...form, semester: event.target.value })}>
            <option value="FIRST">First</option>
            <option value="SECOND">Second</option>
          </select>
          <input placeholder="Level" value={form.level} onChange={(event) => setForm({ ...form, level: event.target.value })} required />
          <button type="submit">Add Course</button>
        </form>
        {message && <p className="info">{message}</p>}
      </section>

      <section className="card">
        <h3>All Courses</h3>
        <table>
          <thead>
            <tr>
              <th>Code</th>
              <th>Title</th>
              <th>Unit</th>
              <th>Semester</th>
              <th>Level</th>
              <th>Active</th>
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
                <td>{course.is_active ? "Yes" : "No"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default AdminCoursesPage;
