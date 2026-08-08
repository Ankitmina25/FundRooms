import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { productAPI } from "../../api";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

const ProductList = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [loading, setLoading] = useState(true);

  const canEdit = ["ADMIN", "WAREHOUSE"].includes(user?.role || "");

  const fetchProducts = async (page = 1) => {
    setLoading(true);
    try {
      const params: any = { page, limit: 10 };
      if (search) params.search = search;

      const res = await productAPI.getAll(params);
      setProducts(res.data.data);
      setPagination(res.data.pagination);
    } catch {
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(parseInt(searchParams.get("page") || "1"));
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params: any = {};
    if (search) params.search = search;
    setSearchParams(params);
  };

  const handlePageChange = (newPage: number) => {
    const params: any = { page: newPage.toString() };
    if (search) params.search = search;
    setSearchParams(params);
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Products</h1>
          <p className="page-subtitle">{pagination.total} total products</p>
        </div>
        {canEdit && (
          <Link to="/products/new" className="btn btn-primary">
            + Add Product
          </Link>
        )}
      </div>

      <div className="card">
        <form className="filters" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search by name, SKU, category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="filter-input"
          />
          <button type="submit" className="btn btn-outline">
            Search
          </button>
        </form>

        {loading ? (
          <div className="page-loading">Loading...</div>
        ) : products.length === 0 ? (
          <div className="empty-state">No products found</div>
        ) : (
          <>
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>SKU</th>
                    <th>Category</th>
                    <th>Unit Price</th>
                    <th>Stock</th>
                    <th>Min Stock</th>
                    <th>Warehouse</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p: any) => (
                    <tr
                      key={p.id}
                      className={
                        p.currentStock < p.minimumStock ? "row-warning" : ""
                      }
                    >
                      <td>
                        <Link to={`/products/${p.id}`} className="link">
                          {p.name}
                        </Link>
                      </td>
                      <td><code>{p.sku}</code></td>
                      <td>{p.category}</td>
                      <td>₹{Number(p.unitPrice).toFixed(2)}</td>
                      <td>
                        <span
                          className={
                            p.currentStock < p.minimumStock
                              ? "text-danger"
                              : "text-success"
                          }
                        >
                          {p.currentStock}
                        </span>
                      </td>
                      <td>{p.minimumStock}</td>
                      <td>{p.warehouse}</td>
                      <td>
                        <div className="action-buttons">
                          <Link
                            to={`/products/${p.id}`}
                            className="btn btn-sm btn-outline"
                          >
                            View
                          </Link>
                          {canEdit && (
                            <Link
                              to={`/products/${p.id}/edit`}
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

export default ProductList;
