import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { customerAPI } from "../../api";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

const CustomerList = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [customers, setCustomers] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "");
  const [typeFilter, setTypeFilter] = useState(searchParams.get("customerType") || "");
  const [loading, setLoading] = useState(true);

  const canEdit = ["ADMIN", "SALES", "ACCOUNTS"].includes(user?.role || "");

  const fetchCustomers = async (page = 1) => {
    setLoading(true);
    try {
      const params: any = { page, limit: 10 };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (typeFilter) params.customerType = typeFilter;

      const res = await customerAPI.getAll(params);
      setCustomers(res.data.data);
      setPagination(res.data.pagination);
    } catch (error) {
      toast.error("Failed to load customers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers(parseInt(searchParams.get("page") || "1"));
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params: any = {};
    if (search) params.search = search;
    if (statusFilter) params.status = statusFilter;
    if (typeFilter) params.customerType = typeFilter;
    setSearchParams(params);
  };

  const handlePageChange = (newPage: number) => {
    const params: any = { page: newPage.toString() };
    if (search) params.search = search;
    if (statusFilter) params.status = statusFilter;
    if (typeFilter) params.customerType = typeFilter;
    setSearchParams(params);
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Customers</h1>
          <p className="page-subtitle">{pagination.total} total customers</p>
        </div>
        {canEdit && (
          <Link to="/customers/new" className="btn btn-primary">
            + Add Customer
          </Link>
        )}
      </div>

      <div className="card">
        <form className="filters" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search by name, mobile, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="filter-input"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="">All Status</option>
            <option value="LEAD">Lead</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="filter-select"
          >
            <option value="">All Types</option>
            <option value="RETAIL">Retail</option>
            <option value="WHOLESALE">Wholesale</option>
            <option value="DISTRIBUTOR">Distributor</option>
          </select>
          <button type="submit" className="btn btn-outline">
            Search
          </button>
        </form>

        {loading ? (
          <div className="page-loading">Loading...</div>
        ) : customers.length === 0 ? (
          <div className="empty-state">No customers found</div>
        ) : (
          <>
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Business</th>
                    <th>Mobile</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Follow-up</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((c: any) => (
                    <tr key={c.id}>
                      <td>
                        <Link to={`/customers/${c.id}`} className="link">
                          {c.name}
                        </Link>
                      </td>
                      <td>{c.businessName}</td>
                      <td>{c.mobile}</td>
                      <td>
                        <span className="badge badge-type">{c.customerType}</span>
                      </td>
                      <td>
                        <span className={`badge badge-${c.status.toLowerCase()}`}>
                          {c.status}
                        </span>
                      </td>
                      <td>
                        {c.followUpDate
                          ? new Date(c.followUpDate).toLocaleDateString()
                          : "—"}
                      </td>
                      <td>
                        <div className="action-buttons">
                          <Link
                            to={`/customers/${c.id}`}
                            className="btn btn-sm btn-outline"
                          >
                            View
                          </Link>
                          {canEdit && (
                            <Link
                              to={`/customers/${c.id}/edit`}
                              className="btn btn-sm btn-outline"
                            >
                              Edit
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {pagination.totalPages > 1 && (
              <div className="pagination">
                <button
                  className="btn btn-sm btn-outline"
                  disabled={pagination.page <= 1}
                  onClick={() => handlePageChange(pagination.page - 1)}
                >
                  Previous
                </button>
                <span className="pagination-info">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <button
                  className="btn btn-sm btn-outline"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => handlePageChange(pagination.page + 1)}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CustomerList;
