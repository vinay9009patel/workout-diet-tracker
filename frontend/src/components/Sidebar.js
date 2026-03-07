import { NavLink } from "react-router-dom";
import "../styles/sidebar.css";

const ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: "D" },
  { to: "/diet", label: "Diet", icon: "N" },
  { to: "/calories", label: "Calories", icon: "C" },
  { to: "/dashboard#weekly-planner", label: "Planner", icon: "P" },
  { to: "/profile", label: "Profile", icon: "U" },
];

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="sidebar-brand-dot" />
        <h1>FitOps</h1>
      </div>
      <nav className="sidebar-nav">
        {ITEMS.map((item) => (
          <NavLink key={item.label} to={item.to}>
            <span className="sidebar-icon">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;
