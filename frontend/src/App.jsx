import { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import StudentRegisterPage from "./pages/StudentRegisterPage";
import AdminRegisterPage from "./pages/AdminRegisterPage";
import StudentDashboard from "./pages/StudentDashboard";
import StudentCoursesPage from "./pages/StudentCoursesPage";
import StudentRegistrationsPage from "./pages/StudentRegistrationsPage";
import StudentResultsPage from "./pages/StudentResultsPage";
import StudentGPAPage from "./pages/StudentGPAPage";
import AdminDashboard from "./pages/AdminDashboard";
import AdminCoursesPage from "./pages/AdminCoursesPage";
import AdminRegistrationsPage from "./pages/AdminRegistrationsPage";
import AdminCreateResultPage from "./pages/AdminCreateResultPage";
import AdminPublishResultsPage from "./pages/AdminPublishResultsPage";
import NotFoundPage from "./pages/NotFoundPage";
import { getMe } from "./api/auth";

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("access");
    if (!token) {
      setLoading(false);
      return;
    }

    getMe()
      .then((me) => setUser(me))
      .catch(() => {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
      })
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    setUser(null);
  };

  if (loading) return <div className="page"><p>Loading...</p></div>;

  return (
    <div className="page">
      <Navbar user={user} onLogout={handleLogout} />
      <Routes>
        <Route path="/student/register" element={<StudentRegisterPage />} />
        <Route path="/admin/register" element={<AdminRegisterPage />} />
        <Route path="/login" element={<LoginPage onLogin={setUser} />} />


        <Route
          path="/student"
          element={
            <ProtectedRoute user={user} role="STUDENT">
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/courses"
          element={
            <ProtectedRoute user={user} role="STUDENT">
              <StudentCoursesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/registrations"
          element={
            <ProtectedRoute user={user} role="STUDENT">
              <StudentRegistrationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/results"
          element={
            <ProtectedRoute user={user} role="STUDENT">
              <StudentResultsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/gpa"
          element={
            <ProtectedRoute user={user} role="STUDENT">
              <StudentGPAPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute user={user} role="ADMIN">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/courses"
          element={
            <ProtectedRoute user={user} role="ADMIN">
              <AdminCoursesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/registrations"
          element={
            <ProtectedRoute user={user} role="ADMIN">
              <AdminRegistrationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/results/create"
          element={
            <ProtectedRoute user={user} role="ADMIN">
              <AdminCreateResultPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/results/publish"
          element={
            <ProtectedRoute user={user} role="ADMIN">
              <AdminPublishResultsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/"
          element={
            user ? (
              <Navigate to={user.role === "ADMIN" ? "/admin" : "/student"} replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  );
};

export default App;
