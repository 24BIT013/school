import { useEffect, useState } from "react";
import { listResults, publishResult, updateResult } from "../api/results";
import { listCourses } from "../api/courses";

const AdminPublishResultsPage = () => {
  const [results, setResults] = useState([]);
  const [courses, setCourses] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ course: "", score: "" });
  const [message, setMessage] = useState("");

  const getPassStatus = (result) => {
    if (result.status) {
      return result.status;
    }
    if (result.grade) {
      return result.grade === "F" ? "Fail" : "Pass";
    }
    return Number(result.score) >= 40 ? "Pass" : "Fail";
  };

  const loadResults = async () => {
    const data = await listResults();
    setResults(data.results || data);
  };

  useEffect(() => {
    loadResults().catch(() => setMessage("Failed to load results"));
    listCourses()
      .then((data) => setCourses(data.results || data))
      .catch(() => setMessage("Failed to load courses"));
  }, []);

  const handlePublish = async (id) => {
    setMessage("");
    try {
      await publishResult(id);
      setMessage("Result published.");
      await loadResults();
    } catch (error) {
      setMessage(error.response?.data?.detail || "Failed to publish result");
    }
  };

  const startEdit = (result) => {
    setEditingId(result.id);
    setEditForm({ course: String(result.course_id || result.course), score: String(result.score) });
    setMessage("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ course: "", score: "" });
  };

  const saveEdit = async (id) => {
    setMessage("");
    try {
      await updateResult(id, {
        course: Number(editForm.course),
        score: Number(editForm.score),
      });
      setMessage("Result updated.");
      cancelEdit();
      await loadResults();
    } catch (error) {
      setMessage(error.response?.data?.detail || JSON.stringify(error.response?.data) || "Failed to update result");
    }
  };

  return (
    <section className="card">
      <h3>Publish Results</h3>
      {message && <p className="info">{message}</p>}
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Student ID</th>
            <th>Course ID</th>
            <th>Course Name</th>
            <th>Score</th>
            <th>Grade</th>
            <th>Status</th>
            <th>Published</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {results.map((result) => (
            <tr key={result.id}>
              <td>{result.id}</td>
              <td>{result.student_id || "-"}</td>
              <td>
                {editingId === result.id ? (
                  <select
                    value={editForm.course}
                    onChange={(event) => setEditForm({ ...editForm, course: event.target.value })}
                  >
                    <option value="">Select course</option>
                    {courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.id} - {course.code}
                      </option>
                    ))}
                  </select>
                ) : (
                  result.course_id
                )}
              </td>
              <td>{result.course_name}</td>
              <td>
                {editingId === result.id ? (
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={editForm.score}
                    onChange={(event) => setEditForm({ ...editForm, score: event.target.value })}
                  />
                ) : (
                  result.score
                )}
              </td>
              <td>{result.grade}</td>
              <td>
                <span className={getPassStatus(result) === "Pass" ? "badge-pass" : "badge-fail"}>
                  {getPassStatus(result)}
                </span>
              </td>
              <td>{result.published ? "Yes" : "No"}</td>
              <td>
                {editingId === result.id ? (
                  <>
                    <button onClick={() => saveEdit(result.id)}>Save</button>
                    <button onClick={cancelEdit}>Cancel</button>
                  </>
                ) : (
                  <button onClick={() => startEdit(result)}>Edit</button>
                )}
                {!result.published && <button onClick={() => handlePublish(result.id)}>Publish</button>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
};

export default AdminPublishResultsPage;
