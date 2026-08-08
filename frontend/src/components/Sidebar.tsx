import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Sidebar = () => {
  const { user, logout } = useAuth();

  const navItems = [
    { path: "/", label: "Dashboard", icon: "📊" },
    { path: "/customers", label: "Customers", icon: "👥" },
    { path: "/products", label: "Products", icon: "📦" },
    { path: "/challans", label: "Challans", icon: "📋" },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2 className="sidebar-logo">FundRooms</h2>
        <span className="sidebar-subtitle">ERP + CRM</span>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/"}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
          >
            <span className="sidebar-icon">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-user-avatar">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="sidebar-user-info">
            <span className="sidebar-user-name">{user?.name}</span>
            <span className="sidebar-user-role">{user?.role}</span>
          </div>
        </div>
        <button className="sidebar-logout" onClick={logout}>
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
