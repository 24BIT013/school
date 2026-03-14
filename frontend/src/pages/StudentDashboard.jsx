import { Link } from "react-router-dom";

const StudentDashboard = () => {
  return (
    <div className="student-shell">
      <aside className="card student-sidebar">
        <h3>Student Menu</h3>
        <a className="student-link" href="#student-overview">Overview</a>
        <a className="student-link" href="#student-courses">Courses</a>
        <a className="student-link" href="#student-registrations">Registrations</a>
        <a className="student-link" href="#student-results">Results</a>
        <a className="student-link" href="#student-gpa">GPA</a>
      </aside>

      <main className="dashboard-grid student-dashboard">
        <section className="card student-hero" id="student-overview">
          <h3>Student Dashboard</h3>
          <p className="muted">Track your courses, registrations, results, and GPA from one place.</p>
          <div className="quick-actions">
            <Link className="action-link" to="/student/courses">Go to Courses</Link>
            <Link className="action-link" to="/student/registrations">Go to Registrations</Link>
            <Link className="action-link" to="/student/results">Go to Results</Link>
            <Link className="action-link" to="/student/gpa">Go to GPA</Link>
          </div>
        </section>

        <section className="card" id="student-courses">
          <h3>Course Registration</h3>
          <p>View available courses and submit your registrations.</p>
          <Link className="action-link" to="/student/courses">Open Courses</Link>
        </section>

        <section className="card" id="student-registrations">
          <h3>My Registrations</h3>
          <p>Track pending and approved registrations and drop pending requests.</p>
          <Link className="action-link" to="/student/registrations">Open Registrations</Link>
        </section>

        <section className="card" id="student-results">
          <h3>Results</h3>
          <p>Check published results and download your CSV transcript.</p>
          <Link className="action-link" to="/student/results">Open Results</Link>
        </section>

        <section className="card" id="student-gpa">
          <h3>GPA</h3>
          <p>View your total courses, total units, and current GPA.</p>
          <Link className="action-link" to="/student/gpa">Open GPA</Link>
        </section>
      </main>
    </div>
  );
};

export default StudentDashboard;
