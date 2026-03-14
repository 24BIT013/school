import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { deleteCourse, listCourses, pendingRegistrations, updateCourse } from "../api/courses";
import { listResults } from "../api/results";
import { deleteStudent, listStudents, updateStudent } from "../api/auth";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalCourses: 0,
    pendingRegistrations: 0,
    totalResults: 0,
    publishedResults: 0,
  });
  const [recentPending, setRecentPending] = useState([]);
  const [recentResults, setRecentResults] = useState([]);
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [courseQuery, setCourseQuery] = useState("");
  const [studentQuery, setStudentQuery] = useState("");
  const [editingCourseId, setEditingCourseId] = useState(null);
  const [courseEditForm, setCourseEditForm] = useState({
    code: "",
    title: "",
    unit: "",
    semester: "FIRST",
    level: "",
    is_active: true,
  });
  const [editingStudentId, setEditingStudentId] = useState(null);
  const [studentEditForm, setStudentEditForm] = useState({
    student_id: "",
    first_name: "",
    last_name: "",
    email: "",
    is_active: true,
  });
  const [message, setMessage] = useState("");

  const loadAdminData = async () => {
    setLoading(true);
    setMessage("");
    try {
      const [coursesData, pendingData, resultsData, studentsData] = await Promise.all([
        listCourses(),
        pendingRegistrations(),
        listResults(),
        listStudents(),
      ]);
      const coursesList = coursesData.results || coursesData || [];
      const pending = pendingData.results || pendingData || [];
      const results = resultsData.results || resultsData || [];
      const studentList = studentsData.results || studentsData || [];

      setStats({
        totalCourses: coursesList.length,
        pendingRegistrations: pending.length,
        totalResults: results.length,
        publishedResults: results.filter((item) => item.published).length,
      });
      setCourses(coursesList);
      setRecentPending(pending.slice(0, 6));
      setRecentResults(results.slice(0, 6));
      setStudents(studentList);
      setLastUpdated(new Date());
    } catch {
      setMessage("Failed to load admin updates.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const filteredCourses = useMemo(() => {
    const q = courseQuery.trim().toLowerCase();
    if (!q) return courses;
    return courses.filter((course) =>
      [course.code, course.title, course.level, course.semester].join(" ").toLowerCase().includes(q)
    );
  }, [courses, courseQuery]);

  const filteredStudents = useMemo(() => {
    const q = studentQuery.trim().toLowerCase();
    if (!q) return students;
    return students.filter((student) =>
      [student.student_id, student.first_name, student.last_name, student.email].join(" ").toLowerCase().includes(q)
    );
  }, [students, studentQuery]);

  const startCourseEdit = (course) => {
    setEditingCourseId(course.id);
    setCourseEditForm({
      code: course.code,
      title: course.title,
      unit: String(course.unit),
      semester: course.semester,
      level: course.level,
      is_active: !!course.is_active,
    });
  };

  const cancelCourseEdit = () => {
    setEditingCourseId(null);
    setCourseEditForm({
      code: "",
      title: "",
      unit: "",
      semester: "FIRST",
      level: "",
      is_active: true,
    });
  };

  const saveCourseEdit = async (id) => {
    setMessage("");
    try {
      await updateCourse(id, { ...courseEditForm, unit: Number(courseEditForm.unit) });
      setMessage("Course updated.");
      cancelCourseEdit();
      await loadAdminData();
    } catch (error) {
      setMessage(error.response?.data?.detail || JSON.stringify(error.response?.data) || "Failed to update course.");
    }
  };

  const removeCourse = async (id) => {
    const proceed = window.confirm("Delete this course? This will also remove linked registrations and results.");
    if (!proceed) return;

    setMessage("");
    try {
      await deleteCourse(id);
      setMessage("Course deleted.");
      if (editingCourseId === id) {
        cancelCourseEdit();
      }
      await loadAdminData();
    } catch (error) {
      setMessage(error.response?.data?.detail || "Failed to delete course.");
    }
  };

  const startStudentEdit = (student) => {
    setEditingStudentId(student.id);
    setStudentEditForm({
      student_id: student.student_id || "",
      first_name: student.first_name || "",
      last_name: student.last_name || "",
      email: student.email || "",
      is_active: !!student.is_active,
    });
  };

  const cancelStudentEdit = () => {
    setEditingStudentId(null);
    setStudentEditForm({
      student_id: "",
      first_name: "",
      last_name: "",
      email: "",
      is_active: true,
    });
  };

  const saveStudentEdit = async (id) => {
    setMessage("");
    try {
      await updateStudent(id, studentEditForm);
      setMessage("Student updated.");
      cancelStudentEdit();
      await loadAdminData();
    } catch (error) {
      setMessage(error.response?.data?.detail || JSON.stringify(error.response?.data) || "Failed to update student.");
    }
  };

  const removeStudent = async (id) => {
    const proceed = window.confirm("Delete this student? This will also remove linked registrations and results.");
    if (!proceed) return;

    setMessage("");
    try {
      await deleteStudent(id);
      setMessage("Student deleted.");
      if (editingStudentId === id) {
        cancelStudentEdit();
      }
      await loadAdminData();
    } catch (error) {
      setMessage(error.response?.data?.detail || "Failed to delete student.");
    }
  };

  return (
    <div className="admin-shell">
      <aside className="card admin-sidebar">
        <h3>Navigation</h3>
        <a className="sidebar-link" href="#overview">Overview</a>
        <a className="sidebar-link" href="#courses">All Courses</a>
        <a className="sidebar-link" href="#pending">Pending Registrations</a>
        <a className="sidebar-link" href="#results">Recent Results</a>
        <a className="sidebar-link" href="#students">Students</a>
        <hr />
        <Link className="sidebar-link" to="/admin/courses">Courses Page</Link>
        <Link className="sidebar-link" to="/admin/registrations">Registrations Page</Link>
        <Link className="sidebar-link" to="/admin/results/create">Create Results</Link>
        <Link className="sidebar-link" to="/admin/results/publish">Publish Results</Link>
      </aside>

      <main className="dashboard-grid admin-dashboard">
      <section className="card admin-hero" id="overview">
        <div className="admin-hero-top">
          <div>
            <h3>Admin Dashboard</h3>
            <p className="muted">Control courses, registrations, results, and students from one place.</p>
            {lastUpdated && <p className="muted">Last updated: {lastUpdated.toLocaleString()}</p>}
          </div>
          <button onClick={loadAdminData} disabled={loading}>{loading ? "Refreshing..." : "Refresh Data"}</button>
        </div>
        {message && <p className="info">{message}</p>}
        <div className="admin-stats">
          <div className="stat-tile"><strong>{stats.totalCourses}</strong><span>Total Courses</span></div>
          <div className="stat-tile"><strong>{stats.pendingRegistrations}</strong><span>Pending Registrations</span></div>
          <div className="stat-tile"><strong>{stats.totalResults}</strong><span>Total Results</span></div>
          <div className="stat-tile"><strong>{stats.publishedResults}</strong><span>Published Results</span></div>
        </div>
        <div className="quick-actions">
          <Link className="action-link" to="/admin/courses">Go to Courses</Link>
          <Link className="action-link" to="/admin/registrations">Go to Registrations</Link>
          <Link className="action-link" to="/admin/results/create">Go to Create Results</Link>
          <Link className="action-link" to="/admin/results/publish">Go to Publish Results</Link>
        </div>
      </section>

      <section className="card" id="courses">
        <div className="section-head">
          <h3>All Courses (Editable)</h3>
          <Link className="action-link" to="/admin/courses">Open Course Page</Link>
        </div>
        <input
          placeholder="Search courses by code, title, semester, level"
          value={courseQuery}
          onChange={(e) => setCourseQuery(e.target.value)}
        />
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Code</th>
              <th>Title</th>
              <th>Unit</th>
              <th>Semester</th>
              <th>Level</th>
              <th>Active</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredCourses.map((course) => (
              <tr key={course.id}>
                <td>{course.id}</td>
                <td>{editingCourseId === course.id ? <input value={courseEditForm.code} onChange={(e) => setCourseEditForm({ ...courseEditForm, code: e.target.value })} /> : course.code}</td>
                <td>{editingCourseId === course.id ? <input value={courseEditForm.title} onChange={(e) => setCourseEditForm({ ...courseEditForm, title: e.target.value })} /> : course.title}</td>
                <td>{editingCourseId === course.id ? <input type="number" min="1" value={courseEditForm.unit} onChange={(e) => setCourseEditForm({ ...courseEditForm, unit: e.target.value })} /> : course.unit}</td>
                <td>
                  {editingCourseId === course.id ? (
                    <select value={courseEditForm.semester} onChange={(e) => setCourseEditForm({ ...courseEditForm, semester: e.target.value })}>
                      <option value="FIRST">First</option>
                      <option value="SECOND">Second</option>
                    </select>
                  ) : (
                    course.semester
                  )}
                </td>
                <td>{editingCourseId === course.id ? <input value={courseEditForm.level} onChange={(e) => setCourseEditForm({ ...courseEditForm, level: e.target.value })} /> : course.level}</td>
                <td>
                  {editingCourseId === course.id ? (
                    <select value={courseEditForm.is_active ? "true" : "false"} onChange={(e) => setCourseEditForm({ ...courseEditForm, is_active: e.target.value === "true" })}>
                      <option value="true">Yes</option>
                      <option value="false">No</option>
                    </select>
                  ) : (
                    course.is_active ? "Yes" : "No"
                  )}
                </td>
                <td>
                  {editingCourseId === course.id ? (
                    <div className="inline-actions">
                      <button onClick={() => saveCourseEdit(course.id)}>Save</button>
                      <button onClick={cancelCourseEdit}>Cancel</button>
                    </div>
                  ) : (
                    <div className="inline-actions">
                      <button onClick={() => startCourseEdit(course)}>Edit</button>
                      <button onClick={() => removeCourse(course.id)}>Delete</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {filteredCourses.length === 0 && (
              <tr>
                <td colSpan="8">No courses found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      <section className="card" id="pending">
        <div className="section-head">
          <h3>Recent Pending Registrations</h3>
          <Link className="action-link" to="/admin/registrations">Open Registrations</Link>
        </div>
        <table>
          <thead>
            <tr>
              <th>Student ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Course</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {recentPending.map((registration) => (
              <tr key={registration.id}>
                <td>{registration.student_id || "-"}</td>
                <td>{`${registration.student_first_name || ""} ${registration.student_last_name || ""}`.trim() || "-"}</td>
                <td>{registration.student_email}</td>
                <td>{registration.course_code}</td>
                <td><Link className="action-link" to="/admin/registrations">Approve</Link></td>
              </tr>
            ))}
            {recentPending.length === 0 && (
              <tr>
                <td colSpan="5">No pending registrations.</td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      <section className="card" id="results">
        <div className="section-head">
          <h3>Recent Results</h3>
          <Link className="action-link" to="/admin/results/publish">Open Results</Link>
        </div>
        <table>
          <thead>
            <tr>
              <th>Student ID</th>
              <th>Course ID</th>
              <th>Course Name</th>
              <th>Status</th>
              <th>Published</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {recentResults.map((result) => (
              <tr key={result.id}>
                <td>{result.student_id || "-"}</td>
                <td>{result.course_id}</td>
                <td>{result.course_name}</td>
                <td><span className={result.status === "Pass" ? "badge-pass" : "badge-fail"}>{result.status || (result.grade === "F" ? "Fail" : "Pass")}</span></td>
                <td>{result.published ? "Yes" : "No"}</td>
                <td><Link className="action-link" to="/admin/results/publish">Edit</Link></td>
              </tr>
            ))}
            {recentResults.length === 0 && (
              <tr>
                <td colSpan="6">No results yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      <section className="card" id="students">
        <div className="section-head">
          <h3>All Students Information</h3>
          <Link className="action-link" to="/admin/registrations">Open Student Registrations</Link>
        </div>
        <input
          placeholder="Search students by ID, name, or email"
          value={studentQuery}
          onChange={(e) => setStudentQuery(e.target.value)}
        />
        <table>
          <thead>
            <tr>
              <th>User ID</th>
              <th>Student ID</th>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Email</th>
              <th>Active</th>
              <th>Joined</th>
              <th>Registrations</th>
              <th>Results</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map((student) => (
              <tr key={student.id}>
                <td>{student.id}</td>
                <td>{editingStudentId === student.id ? <input value={studentEditForm.student_id} onChange={(e) => setStudentEditForm({ ...studentEditForm, student_id: e.target.value })} /> : student.student_id || "-"}</td>
                <td>{editingStudentId === student.id ? <input value={studentEditForm.first_name} onChange={(e) => setStudentEditForm({ ...studentEditForm, first_name: e.target.value })} /> : student.first_name || "-"}</td>
                <td>{editingStudentId === student.id ? <input value={studentEditForm.last_name} onChange={(e) => setStudentEditForm({ ...studentEditForm, last_name: e.target.value })} /> : student.last_name || "-"}</td>
                <td>{editingStudentId === student.id ? <input type="email" value={studentEditForm.email} onChange={(e) => setStudentEditForm({ ...studentEditForm, email: e.target.value })} /> : student.email}</td>
                <td>
                  {editingStudentId === student.id ? (
                    <select value={studentEditForm.is_active ? "true" : "false"} onChange={(e) => setStudentEditForm({ ...studentEditForm, is_active: e.target.value === "true" })}>
                      <option value="true">Yes</option>
                      <option value="false">No</option>
                    </select>
                  ) : (
                    student.is_active ? "Yes" : "No"
                  )}
                </td>
                <td>{new Date(student.date_joined).toLocaleString()}</td>
                <td>{student.registrations_count}</td>
                <td>{student.results_count}</td>
                <td>
                  {editingStudentId === student.id ? (
                    <div className="inline-actions">
                      <button onClick={() => saveStudentEdit(student.id)}>Save</button>
                      <button onClick={cancelStudentEdit}>Cancel</button>
                    </div>
                  ) : (
                    <div className="inline-actions">
                      <button onClick={() => startStudentEdit(student)}>Edit Student</button>
                      <button onClick={() => removeStudent(student.id)}>Delete Student</button>
                      <Link className="action-link" to={`/admin/results/create?student_id=${encodeURIComponent(student.student_id || "")}`}>Create Result</Link>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {filteredStudents.length === 0 && (
              <tr>
                <td colSpan="10">No students found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
      </main>
    </div>
  );
};

export default AdminDashboard;
