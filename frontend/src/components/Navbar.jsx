import { NavLink, useNavigate } from "react-router-dom";

const Navbar = ({ user, onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <h2>School Management</h2>
      <div className="nav-links">
        {!user && <NavLink to="/student/register">Student Register</NavLink>}
        {!user && <NavLink to="/admin/register">Admin Register</NavLink>}
        {!user && <NavLink to="/login">Login</NavLink>}

        {user?.role === "STUDENT" && <NavLink to="/student">Overview</NavLink>}
        {user?.role === "STUDENT" && <NavLink to="/student/courses">Courses</NavLink>}
        {user?.role === "STUDENT" && <NavLink to="/student/registrations">Registrations</NavLink>}
        {user?.role === "STUDENT" && <NavLink to="/student/results">Results</NavLink>}
        {user?.role === "STUDENT" && <NavLink to="/student/gpa">GPA</NavLink>}

        {user?.role === "ADMIN" && <NavLink to="/admin">Overview</NavLink>}
        {user?.role === "ADMIN" && <NavLink to="/admin/courses">Courses</NavLink>}
        {user?.role === "ADMIN" && <NavLink to="/admin/registrations">Approvals</NavLink>}
        {user?.role === "ADMIN" && <NavLink to="/admin/results/create">Create Results</NavLink>}
        {user?.role === "ADMIN" && <NavLink to="/admin/results/publish">Publish Results</NavLink>}

        {user && <button onClick={handleLogout}>Logout</button>}
      </div>
    </nav>
  );
};

export default Navbar;
