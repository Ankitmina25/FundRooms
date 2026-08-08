import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { customerAPI } from "../../api";
import toast from "react-hot-toast";

const CustomerForm = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    mobile: "",
    email: "",
    businessName: "",
    gstNumber: "",
    customerType: "RETAIL",
    address: "",
    status: "LEAD",
    followUpDate: "",
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);

  useEffect(() => {
    if (isEdit && id) {
      const fetchCustomer = async () => {
        try {
          const res = await customerAPI.getById(parseInt(id));
          const c = res.data.data;
          setForm({
            name: c.name || "",
            mobile: c.mobile || "",
            email: c.email || "",
            businessName: c.businessName || "",
            gstNumber: c.gstNumber || "",
            customerType: c.customerType || "RETAIL",
            address: c.address || "",
            status: c.status || "LEAD",
            followUpDate: c.followUpDate
              ? c.followUpDate.split("T")[0]
              : "",
            notes: c.notes || "",
          });
        } catch {
          toast.error("Failed to load customer");
          navigate("/customers");
        } finally {
          setFetching(false);
        }
      };
      fetchCustomer();
    }
  }, [id, isEdit, navigate]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name || !form.mobile || !form.businessName || !form.address) {
      toast.error("Please fill all required fields");
      return;
    }

    setLoading(true);
    try {
      if (isEdit && id) {
        await customerAPI.update(parseInt(id), form);
        toast.success("Customer updated successfully");
      } else {
        await customerAPI.create(form);
        toast.success("Customer created successfully");
      }
      navigate("/customers");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save customer");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <div className="page-loading">Loading customer...</div>;
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            {isEdit ? "Edit Customer" : "Add Customer"}
          </h1>
        </div>
      </div>

      <div className="card">
        <form className="form" onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="name">Customer Name *</label>
              <input
                id="name"
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter customer name"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="mobile">Mobile Number *</label>
              <input
                id="mobile"
                name="mobile"
                type="text"
                value={form.mobile}
                onChange={handleChange}
                placeholder="Enter mobile number"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Enter email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="businessName">Business Name *</label>
              <input
                id="businessName"
                name="businessName"
                type="text"
                value={form.businessName}
                onChange={handleChange}
                placeholder="Enter business name"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="gstNumber">GST Number (Optional)</label>
              <input
                id="gstNumber"
                name="gstNumber"
                type="text"
                value={form.gstNumber}
                onChange={handleChange}
                placeholder="Enter GST number"
              />
            </div>

            <div className="form-group">
              <label htmlFor="customerType">Customer Type *</label>
              <select
                id="customerType"
                name="customerType"
                value={form.customerType}
                onChange={handleChange}
              >
                <option value="RETAIL">Retail</option>
                <option value="WHOLESALE">Wholesale</option>
                <option value="DISTRIBUTOR">Distributor</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="status">Status</label>
              <select
                id="status"
                name="status"
                value={form.status}
                onChange={handleChange}
              >
                <option value="LEAD">Lead</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="followUpDate">Follow-up Date</label>
              <input
                id="followUpDate"
                name="followUpDate"
                type="date"
                value={form.followUpDate}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="address">Address *</label>
            <textarea
              id="address"
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder="Enter full address"
              rows={3}
              required
            />
          </div>

          {!isEdit && (
            <div className="form-group">
              <label htmlFor="notes">Notes</label>
              <textarea
                id="notes"
                name="notes"
                value={form.notes}
                onChange={handleChange}
                placeholder="Add notes..."
                rows={3}
              />
            </div>
          )}

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => navigate("/customers")}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? "Saving..." : isEdit ? "Update Customer" : "Create Customer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerForm;
