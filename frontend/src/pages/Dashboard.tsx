import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { customerAPI, productAPI, challanAPI } from "../api";
import { useAuth } from "../context/AuthContext";

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalProducts: 0,
    lowStockProducts: 0,
    totalChallans: 0,
    recentChallans: [] as any[],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [customersRes, productsRes, lowStockRes, challansRes] =
          await Promise.all([
            customerAPI.getAll({ limit: 1 }),
            productAPI.getAll({ limit: 1 }),
            productAPI.getLowStock(),
            challanAPI.getAll({ limit: 5 }),
          ]);

        setStats({
          totalCustomers: customersRes.data.pagination?.total || 0,
          totalProducts: productsRes.data.pagination?.total || 0,
          lowStockProducts: Array.isArray(lowStockRes.data.data)
            ? lowStockRes.data.data.length
            : 0,
          totalChallans: challansRes.data.pagination?.total || 0,
          recentChallans: challansRes.data.data || [],
        });
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return <div className="page-loading">Loading dashboard...</div>;
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">
            Welcome back, {user?.name} ({user?.role})
          </p>
        </div>
      </div>

      <div className="stats-grid">
        <Link to="/customers" className="stat-card stat-card-blue">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <span className="stat-number">{stats.totalCustomers}</span>
            <span className="stat-label">Total Customers</span>
          </div>
        </Link>

        <Link to="/products" className="stat-card stat-card-green">
          <div className="stat-icon">📦</div>
          <div className="stat-info">
            <span className="stat-number">{stats.totalProducts}</span>
            <span className="stat-label">Total Products</span>
          </div>
        </Link>

        <Link to="/products" className="stat-card stat-card-orange">
          <div className="stat-icon">⚠️</div>
          <div className="stat-info">
            <span className="stat-number">{stats.lowStockProducts}</span>
            <span className="stat-label">Low Stock Alerts</span>
          </div>
        </Link>

        <Link to="/challans" className="stat-card stat-card-purple">
          <div className="stat-icon">📋</div>
          <div className="stat-info">
            <span className="stat-number">{stats.totalChallans}</span>
            <span className="stat-label">Total Challans</span>
          </div>
        </Link>
      </div>

      {stats.recentChallans.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Recent Challans</h2>
            <Link to="/challans" className="btn btn-sm btn-outline">
              View All
            </Link>
          </div>
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Challan #</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentChallans.map((challan: any) => (
                  <tr key={challan.id}>
                    <td>
                      <Link to={`/challans/${challan.id}`} className="link">
                        {challan.challanNumber}
                      </Link>
                    </td>
                    <td>{challan.customer?.name}</td>
                    <td>{challan.totalQuantity}</td>
                    <td>
                      <span
                        className={`badge badge-${challan.status.toLowerCase()}`}
                      >
                        {challan.status}
                      </span>
                    </td>
                    <td>
                      {new Date(challan.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
