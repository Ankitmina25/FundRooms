import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { productAPI } from "../../api";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

const ProductDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const canEdit = ["ADMIN", "WAREHOUSE"].includes(user?.role || "");

  // Stock movement form
  const [stockForm, setStockForm] = useState({
    quantity: "",
    type: "IN",
    reason: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await productAPI.getById(parseInt(id!));
        setProduct(res.data.data);
      } catch {
        toast.error("Failed to load product");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchProduct();
  }, [id]);

  const handleStockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stockForm.quantity || !stockForm.reason) {
      toast.error("Please fill quantity and reason");
      return;
    }
    setSubmitting(true);
    try {
      const res = await productAPI.addStock(parseInt(id!), stockForm);
      setProduct(res.data.data.product);
      // Re-fetch to get updated stock movements
      const updated = await productAPI.getById(parseInt(id!));
      setProduct(updated.data.data);
      setStockForm({ quantity: "", type: "IN", reason: "" });
      toast.success("Stock movement added");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to add stock movement");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="page-loading">Loading...</div>;
  if (!product) return <div className="page-loading">Product not found</div>;

  const isLowStock = product.currentStock < product.minimumStock;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">{product.name}</h1>
          <p className="page-subtitle">SKU: {product.sku}</p>
        </div>
        <div className="action-buttons">
          <Link to="/products" className="btn btn-outline">
            ← Back
          </Link>
          {canEdit && (
            <Link to={`/products/${id}/edit`} className="btn btn-primary">
              Edit
            </Link>
          )}
        </div>
      </div>

      <div className="detail-grid">
        <div className="card">
          <h2 className="card-title">Product Information</h2>
          <div className="detail-list">
            <div className="detail-item">
              <span className="detail-label">Name</span>
              <span className="detail-value">{product.name}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">SKU</span>
              <span className="detail-value"><code>{product.sku}</code></span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Category</span>
              <span className="detail-value">{product.category}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Unit Price</span>
              <span className="detail-value">₹{Number(product.unitPrice).toFixed(2)}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Current Stock</span>
              <span className={`detail-value ${isLowStock ? "text-danger" : "text-success"}`}>
                {product.currentStock}
                {isLowStock && " ⚠️ Low Stock"}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Minimum Stock</span>
              <span className="detail-value">{product.minimumStock}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Warehouse</span>
              <span className="detail-value">{product.warehouse}</span>
            </div>
          </div>
        </div>

        {canEdit && (
          <div className="card">
            <h2 className="card-title">Add Stock Movement</h2>
            <form className="form" onSubmit={handleStockSubmit}>
              <div className="form-group">
                <label>Movement Type</label>
                <select
                  value={stockForm.type}
                  onChange={(e) =>
                    setStockForm({ ...stockForm, type: e.target.value })
                  }
                >
                  <option value="IN">IN (Add Stock)</option>
                  <option value="OUT">OUT (Remove Stock)</option>
                </select>
              </div>
              <div className="form-group">
                <label>Quantity</label>
                <input
                  type="number"
                  min="1"
                  value={stockForm.quantity}
                  onChange={(e) =>
                    setStockForm({ ...stockForm, quantity: e.target.value })
                  }
                  placeholder="Enter quantity"
                />
              </div>
              <div className="form-group">
                <label>Reason</label>
                <input
                  type="text"
                  value={stockForm.reason}
                  onChange={(e) =>
                    setStockForm({ ...stockForm, reason: e.target.value })
                  }
                  placeholder="Enter reason"
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
              >
                {submitting ? "Adding..." : "Add Movement"}
              </button>
            </form>
          </div>
        )}
      </div>

      {product.stockMovements && product.stockMovements.length > 0 && (
        <div className="card" style={{ marginTop: "1.5rem" }}>
          <h2 className="card-title">Stock Movement Log</h2>
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Quantity</th>
                  <th>Reason</th>
                  <th>By</th>
                </tr>
              </thead>
              <tbody>
                {product.stockMovements.map((m: any) => (
                  <tr key={m.id}>
                    <td>{new Date(m.createdAt).toLocaleString()}</td>
                    <td>
                      <span
                        className={`badge ${
                          m.type === "IN" ? "badge-active" : "badge-draft"
                        }`}
                      >
                        {m.type}
                      </span>
                    </td>
                    <td>{m.quantity}</td>
                    <td>{m.reason}</td>
                    <td>{m.createdBy?.name || "—"}</td>
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

export default ProductDetail;
