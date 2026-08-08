import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { productAPI } from "../../api";
import toast from "react-hot-toast";

const ProductForm = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    sku: "",
    category: "",
    unitPrice: "",
    currentStock: "0",
    minimumStock: "0",
    warehouse: "",
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);

  useEffect(() => {
    if (isEdit && id) {
      const fetchProduct = async () => {
        try {
          const res = await productAPI.getById(parseInt(id));
          const p = res.data.data;
          setForm({
            name: p.name || "",
            sku: p.sku || "",
            category: p.category || "",
            unitPrice: p.unitPrice?.toString() || "",
            currentStock: p.currentStock?.toString() || "0",
            minimumStock: p.minimumStock?.toString() || "0",
            warehouse: p.warehouse || "",
          });
        } catch {
          toast.error("Failed to load product");
          navigate("/products");
        } finally {
          setFetching(false);
        }
      };
      fetchProduct();
    }
  }, [id, isEdit, navigate]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name || !form.sku || !form.category || !form.unitPrice || !form.warehouse) {
      toast.error("Please fill all required fields");
      return;
    }

    setLoading(true);
    try {
      if (isEdit && id) {
        await productAPI.update(parseInt(id), form);
        toast.success("Product updated successfully");
      } else {
        await productAPI.create(form);
        toast.success("Product created successfully");
      }
      navigate("/products");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save product");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <div className="page-loading">Loading product...</div>;
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            {isEdit ? "Edit Product" : "Add Product"}
          </h1>
        </div>
      </div>

      <div className="card">
        <form className="form" onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="name">Product Name *</label>
              <input
                id="name"
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter product name"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="sku">SKU / Code *</label>
              <input
                id="sku"
                name="sku"
                type="text"
                value={form.sku}
                onChange={handleChange}
                placeholder="Enter SKU"
                required
                disabled={isEdit}
              />
            </div>

            <div className="form-group">
              <label htmlFor="category">Category *</label>
              <input
                id="category"
                name="category"
                type="text"
                value={form.category}
                onChange={handleChange}
                placeholder="Enter category"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="unitPrice">Unit Price (₹) *</label>
              <input
                id="unitPrice"
                name="unitPrice"
                type="number"
                step="0.01"
                min="0"
                value={form.unitPrice}
                onChange={handleChange}
                placeholder="Enter price"
                required
              />
            </div>

            {!isEdit && (
              <div className="form-group">
                <label htmlFor="currentStock">Initial Stock</label>
                <input
                  id="currentStock"
                  name="currentStock"
                  type="number"
                  min="0"
                  value={form.currentStock}
                  onChange={handleChange}
                />
              </div>
            )}

            <div className="form-group">
              <label htmlFor="minimumStock">Minimum Stock Alert</label>
              <input
                id="minimumStock"
                name="minimumStock"
                type="number"
                min="0"
                value={form.minimumStock}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="warehouse">Warehouse / Location *</label>
              <input
                id="warehouse"
                name="warehouse"
                type="text"
                value={form.warehouse}
                onChange={handleChange}
                placeholder="Enter warehouse"
                required
              />
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => navigate("/products")}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? "Saving..." : isEdit ? "Update Product" : "Create Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;
