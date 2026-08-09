import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const ROLES = [
  {
    id: "SALES",
    title: "Sales Representative",
    badge: "CRM & Leads",
    desc: "Manage customer relationships, leads, follow-ups, and sales challans.",
    icon: "💼",
  },
  {
    id: "ADMIN",
    title: "Administrator",
    badge: "Full Control",
    desc: "Full administrative access across all system modules and operations.",
    icon: "👑",
  },
  {
    id: "WAREHOUSE",
    title: "Warehouse Manager",
    badge: "Inventory",
    desc: "Manage product stock movements, inward/outward logs, and stock levels.",
    icon: "📦",
  },
  {
    id: "ACCOUNTS",
    title: "Accounts Manager",
    badge: "Billing & Audit",
    desc: "Oversee sales challans, invoice verification, and financial status.",
    icon: "📊",
  },
];

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("SALES");
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Please enter your full name");
      return;
    }
    if (!email.trim()) {
      toast.error("Please enter your email address");
      return;
    }
    if (!password || password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }
    if (!role) {
      toast.error("Please select a user role");
      return;
    }

    setLoading(true);
    try {
      await register({ name, email, password, role });
      toast.success("Account created successfully!");
      navigate("/");
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="register-container">
        <div className="login-header">
          <h1 className="login-logo">FundRooms</h1>
          <p className="login-subtitle">Create your Account & Select Role</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              id="name"
              type="text"
              placeholder="e.g. Ankit Sharma"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              required
            />
          </div>

          <div className="form-group">
            <label>Select User Role</label>
            <div className="role-selection-grid">
              {ROLES.map((r) => {
                const isSelected = role === r.id;
                return (
                  <div
                    key={r.id}
                    className={`role-card ${isSelected ? "selected" : ""}`}
                    onClick={() => setRole(r.id)}
                  >
                    <div className="role-card-header">
                      <span className="role-icon">{r.icon}</span>
                      <span className="role-title">{r.title}</span>
                      <span className="role-badge">{r.badge}</span>
                    </div>
                    <p className="role-desc">{r.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={loading}
            style={{ marginTop: "0.5rem" }}
          >
            {loading ? "Creating Account..." : "Create Account & Sign In"}
          </button>
        </form>

        <div className="auth-footer-link">
          <span>Already have an account? </span>
          <Link to="/login" className="auth-link">
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
