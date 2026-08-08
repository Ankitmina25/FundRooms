import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { challanAPI } from "../../api";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

const ChallanList = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [challans, setChallans] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "");
  const [loading, setLoading] = useState(true);

  const canCreate = ["ADMIN", "SALES", "ACCOUNTS"].includes(user?.role || "");

  const fetchChallans = async (page = 1) => {
    setLoading(true);
    try {
      const params: any = { page, limit: 10 };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;

      const res = await challanAPI.getAll(params);
      setChallans(res.data.data);
      setPagination(res.data.pagination);
    } catch {
      toast.error("Failed to load challans");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallans(parseInt(searchParams.get("page") || "1"));
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params: any = {};
    if (search) params.search = search;
    if (statusFilter) params.status = statusFilter;
    setSearchParams(params);
  };

  const handlePageChange = (newPage: number) => {
    const params: any = { page: newPage.toString() };
    if (search) params.search = search;
    if (statusFilter) params.status = statusFilter;
    setSearchParams(params);
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Sales Challans</h1>
          <p className="page-subtitle">{pagination.total} total challans</p>
        </div>
        {canCreate && (
          <Link to="/challans/new" className="btn btn-primary">
            + New Challan
          </Link>
        )}
      </div>

      <div className="card">
        <form className="filters" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search by challan number, customer..."
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
            <option value="DRAFT">Draft</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
          <button type="submit" className="btn btn-outline">
            Search
          </button>
        </form>

        {loading ? (
          <div className="page-loading">Loading...</div>
        ) : challans.length === 0 ? (
          <div className="empty-state">No challans found</div>
        ) : (
          <>
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Challan #</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Total Qty</th>
                    <th>Status</th>
                    <th>Created By</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {challans.map((ch: any) => (
                    <tr key={ch.id}>
                      <td>
                        <Link to={`/challans/${ch.id}`} className="link">
                          {ch.challanNumber}
                        </Link>
                      </td>
                      <td>{ch.customer?.name}</td>
                      <td>{ch._count?.items || 0}</td>
                      <td>{ch.totalQuantity}</td>
                      <td>
                        <span className={`badge badge-${ch.status.toLowerCase()}`}>
                          {ch.status}
                        </span>
                      </td>
                      <td>{ch.createdBy?.name}</td>
                      <td>{new Date(ch.createdAt).toLocaleDateString()}</td>
                      <td>
                        <Link
                          to={`/challans/${ch.id}`}
                          className="btn btn-sm btn-outline"
                        >
                          View
                        </Link>
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

export default ChallanList;
