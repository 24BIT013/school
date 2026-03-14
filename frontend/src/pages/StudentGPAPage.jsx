import { useEffect, useState } from "react";
import { myGPA } from "../api/results";

const StudentGPAPage = () => {
  const [gpa, setGpa] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    myGPA()
      .then((data) => setGpa(data))
      .catch(() => setMessage("Failed to load GPA"));
  }, []);

  return (
    <section className="card">
      <h3>GPA Summary</h3>
      {message && <p className="info">{message}</p>}
      {gpa && (
        <div className="stats-grid">
          <p>Total Courses: <strong>{gpa.total_courses}</strong></p>
          <p>Total Units: <strong>{gpa.total_units}</strong></p>
          <p>Total Grade Points: <strong>{gpa.total_grade_points}</strong></p>
          <p>GPA: <strong>{gpa.gpa}</strong></p>
        </div>
      )}
    </section>
  );
};

export default StudentGPAPage;
