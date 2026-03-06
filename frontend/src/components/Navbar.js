import { useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.js";
import "../styles/navbar.css";

function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="navbar">
      <h1 className="logo">Workout Diet Tracker</h1>
      <nav className="nav-links">
        <NavLink to="/dashboard">Dashboard</NavLink>
        <NavLink to="/profile">Profile</NavLink>
        <span className="welcome">{user?.name || "User"}</span>
        <button className="logout-btn" onClick={handleLogout} type="button">
          Logout
        </button>
      </nav>
    </header>
  );
}

export default Navbar;
