import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter email and password");
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Login successful!");
      navigate("/");
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <h1 className="login-logo">FundRooms</h1>
          <p className="login-subtitle">ERP + CRM Operations Portal</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="auth-footer-link">
          <span>Don't have an account? </span>
          <Link to="/register" className="auth-link">
            Register now
          </Link>
        </div>

        <div className="login-credentials">
          <p className="credentials-title">Test Credentials</p>
          <div className="credentials-grid">
            <div className="credential-item">
              <span className="credential-role">Admin</span>
              <span>admin@fundrooms.com / admin123</span>
            </div>
            <div className="credential-item">
              <span className="credential-role">Sales</span>
              <span>sales@fundrooms.com / sales123</span>
            </div>
            <div className="credential-item">
              <span className="credential-role">Warehouse</span>
              <span>warehouse@fundrooms.com / warehouse123</span>
            </div>
            <div className="credential-item">
              <span className="credential-role">Accounts</span>
              <span>accounts@fundrooms.com / accounts123</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
