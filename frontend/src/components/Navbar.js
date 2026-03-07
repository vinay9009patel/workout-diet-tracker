import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.js";
import defaultAvatar from "../assets/default-avatar.png";
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
      <div className="navbar-search">
        <input type="text" placeholder="Search workouts, meals, analytics..." />
      </div>

      <div className="navbar-user">
        <button className="notify-btn" type="button" aria-label="Notifications">
          0
        </button>
        <img
          className="navbar-avatar"
          src={user?.avatar ? `http://localhost:5000${user.avatar}` : defaultAvatar}
          alt="User avatar"
        />
        <span className="welcome">{user?.name || "User"}</span>
        <button
          className="logout-btn"
          onClick={handleLogout}
          type="button"
        >
          Logout
        </button>
      </div>
    </header>
  );
}

export default Navbar;
