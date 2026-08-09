import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { challanAPI } from "../../api";
import { useAuth } from "../../context/AuthContext";
import { InvoiceModal } from "../../components/InvoiceModal";
import toast from "react-hot-toast";

const ChallanDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [challan, setChallan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  const canUpdate = ["ADMIN", "SALES", "ACCOUNTS"].includes(user?.role || "");

  useEffect(() => {
    const fetchChallan = async () => {
      try {
        const res = await challanAPI.getById(parseInt(id!));
        setChallan(res.data.data);
      } catch {
        toast.error("Failed to load challan");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchChallan();
  }, [id]);

  const handleStatusUpdate = async (newStatus: string) => {
    const confirmMsg =
      newStatus === "CONFIRMED"
        ? "Confirm this challan? Stock will be reduced for all items."
        : "Cancel this challan?";

    if (!window.confirm(confirmMsg)) return;

    setUpdating(true);
    try {
      const res = await challanAPI.updateStatus(parseInt(id!), newStatus);
      setChallan(res.data.data);
      toast.success(`Challan ${newStatus.toLowerCase()} successfully`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update challan");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div className="page-loading">Loading...</div>;
  if (!challan) return <div className="page-loading">Challan not found</div>;

  const totalAmount = challan.items?.reduce(
    (sum: number, item: any) => sum + Number(item.total),
    0
  ) || 0;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">{challan.challanNumber}</h1>
          <p className="page-subtitle">
            <span className={`badge badge-${challan.status.toLowerCase()}`}>
              {challan.status}
            </span>
          </p>
        </div>
        <div className="action-buttons">
          <Link to="/challans" className="btn btn-outline">
            ← Back
          </Link>
          <button
            className="btn btn-secondary"
            onClick={() => setShowInvoiceModal(true)}
            style={{ backgroundColor: "#3b82f6", color: "#ffffff", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
          >
            📄 Export Invoice / PDF
          </button>
          {canUpdate && challan.status === "DRAFT" && (
            <>
              <button
                className="btn btn-primary"
                onClick={() => handleStatusUpdate("CONFIRMED")}
                disabled={updating}
              >
                {updating ? "Processing..." : "Confirm"}
              </button>
              <button
                className="btn btn-danger"
                onClick={() => handleStatusUpdate("CANCELLED")}
                disabled={updating}
              >
                Cancel Challan
              </button>
            </>
          )}
        </div>
      </div>

      <div className="detail-grid">
        <div className="card">
          <h2 className="card-title">Challan Details</h2>
          <div className="detail-list">
            <div className="detail-item">
              <span className="detail-label">Challan Number</span>
              <span className="detail-value">{challan.challanNumber}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Status</span>
              <span className={`badge badge-${challan.status.toLowerCase()}`}>
                {challan.status}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Created By</span>
              <span className="detail-value">{challan.createdBy?.name}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Created Date</span>
              <span className="detail-value">
                {new Date(challan.createdAt).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="card-title">Customer</h2>
          <div className="detail-list">
            <div className="detail-item">
              <span className="detail-label">Name</span>
              <span className="detail-value">
                <Link to={`/customers/${challan.customer?.id}`} className="link">
                  {challan.customer?.name}
                </Link>
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Business</span>
              <span className="detail-value">
                {challan.customer?.businessName}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Mobile</span>
              <span className="detail-value">{challan.customer?.mobile}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: "1.5rem" }}>
        <h2 className="card-title">Products</h2>
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Unit Price</th>
                <th>Quantity</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {challan.items?.map((item: any) => (
                <tr key={item.id}>
                  <td>{item.productName}</td>
                  <td><code>{item.sku}</code></td>
                  <td>₹{Number(item.unitPrice).toFixed(2)}</td>
                  <td>{item.quantity}</td>
                  <td>₹{Number(item.total).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={3} style={{ textAlign: "right", fontWeight: 600 }}>
                  Total:
                </td>
                <td style={{ fontWeight: 600 }}>{challan.totalQuantity}</td>
                <td style={{ fontWeight: 600 }}>
                  ₹{totalAmount.toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
      {showInvoiceModal && (
        <InvoiceModal
          challan={challan}
          onClose={() => setShowInvoiceModal(false)}
        />
      )}
    </div>
  );
};

export default ChallanDetail;
