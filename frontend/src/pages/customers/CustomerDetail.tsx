import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { customerAPI } from "../../api";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

const CustomerDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [customer, setCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [followUpNote, setFollowUpNote] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const canEdit = ["ADMIN", "SALES", "ACCOUNTS"].includes(user?.role || "");

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const res = await customerAPI.getById(parseInt(id!));
        setCustomer(res.data.data);
      } catch {
        toast.error("Failed to load customer");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchCustomer();
  }, [id]);

  const handleFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!followUpNote.trim()) {
      toast.error("Please enter a note");
      return;
    }
    setSubmitting(true);
    try {
      const res = await customerAPI.addFollowUp(parseInt(id!), {
        notes: followUpNote,
        followUpDate: followUpDate || undefined,
      });
      setCustomer(res.data.data);
      setFollowUpNote("");
      setFollowUpDate("");
      toast.success("Follow-up note added");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to add note");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="page-loading">Loading...</div>;
  if (!customer) return <div className="page-loading">Customer not found</div>;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">{customer.name}</h1>
          <p className="page-subtitle">{customer.businessName}</p>
        </div>
        <div className="action-buttons">
          <Link to="/customers" className="btn btn-outline">
            ← Back
          </Link>
          {canEdit && (
            <Link to={`/customers/${id}/edit`} className="btn btn-primary">
              Edit
            </Link>
          )}
        </div>
      </div>

      <div className="detail-grid">
        <div className="card">
          <h2 className="card-title">Customer Information</h2>
          <div className="detail-list">
            <div className="detail-item">
              <span className="detail-label">Name</span>
              <span className="detail-value">{customer.name}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Mobile</span>
              <span className="detail-value">{customer.mobile}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Email</span>
              <span className="detail-value">{customer.email || "—"}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Business Name</span>
              <span className="detail-value">{customer.businessName}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">GST Number</span>
              <span className="detail-value">{customer.gstNumber || "—"}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Type</span>
              <span className="badge badge-type">{customer.customerType}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Status</span>
              <span className={`badge badge-${customer.status.toLowerCase()}`}>
                {customer.status}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Address</span>
              <span className="detail-value">{customer.address}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Follow-up Date</span>
              <span className="detail-value">
                {customer.followUpDate
                  ? new Date(customer.followUpDate).toLocaleDateString()
                  : "—"}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Created By</span>
              <span className="detail-value">
                {customer.createdBy?.name || "—"}
              </span>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="card-title">Notes & Follow-ups</h2>

          {customer.notes ? (
            <pre className="notes-content">{customer.notes}</pre>
          ) : (
            <p className="empty-state-sm">No notes yet</p>
          )}

          {canEdit && (
            <form className="follow-up-form" onSubmit={handleFollowUp}>
              <h3 className="form-section-title">Add Follow-up Note</h3>
              <div className="form-group">
                <textarea
                  value={followUpNote}
                  onChange={(e) => setFollowUpNote(e.target.value)}
                  placeholder="Enter follow-up note..."
                  rows={3}
                />
              </div>
              <div className="form-group">
                <label>Next Follow-up Date</label>
                <input
                  type="date"
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
              >
                {submitting ? "Adding..." : "Add Note"}
              </button>
            </form>
          )}
        </div>
      </div>

      {customer.challans && customer.challans.length > 0 && (
        <div className="card" style={{ marginTop: "1.5rem" }}>
          <h2 className="card-title">Recent Challans</h2>
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Challan #</th>
                  <th>Quantity</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {customer.challans.map((ch: any) => (
                  <tr key={ch.id}>
                    <td>
                      <Link to={`/challans/${ch.id}`} className="link">
                        {ch.challanNumber}
                      </Link>
                    </td>
                    <td>{ch.totalQuantity}</td>
                    <td>
                      <span
                        className={`badge badge-${ch.status.toLowerCase()}`}
                      >
                        {ch.status}
                      </span>
                    </td>
                    <td>{new Date(ch.createdAt).toLocaleDateString()}</td>
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

export default CustomerDetail;
