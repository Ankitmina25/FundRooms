import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { customerAPI, productAPI, challanAPI } from "../../api";
import toast from "react-hot-toast";

interface ChallanItem {
  productId: string;
  productName: string;
  sku: string;
  unitPrice: number;
  quantity: string;
}

const ChallanForm = () => {
  const navigate = useNavigate();

  const [customers, setCustomers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [customerId, setCustomerId] = useState("");
  const [items, setItems] = useState<ChallanItem[]>([]);
  const [status, setStatus] = useState("DRAFT");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // Search states
  const [customerSearch, setCustomerSearch] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [custRes, prodRes] = await Promise.all([
          customerAPI.getAll({ limit: 100 }),
          productAPI.getAll({ limit: 100 }),
        ]);
        setCustomers(custRes.data.data);
        setProducts(prodRes.data.data);
      } catch {
        toast.error("Failed to load data");
      } finally {
        setFetching(false);
      }
    };
    fetchData();
  }, []);

  const addItem = () => {
    setItems([
      ...items,
      { productId: "", productName: "", sku: "", unitPrice: 0, quantity: "1" },
    ]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: string, value: string) => {
    const newItems = [...items];
    if (field === "productId") {
      const product = products.find((p) => p.id.toString() === value);
      if (product) {
        newItems[index] = {
          ...newItems[index],
          productId: value,
          productName: product.name,
          sku: product.sku,
          unitPrice: Number(product.unitPrice),
        };
      }
    } else {
      (newItems[index] as any)[field] = value;
    }
    setItems(newItems);
  };

  const getTotalQuantity = () =>
    items.reduce((sum, item) => sum + (parseInt(item.quantity) || 0), 0);

  const getTotalAmount = () =>
    items.reduce(
      (sum, item) => sum + item.unitPrice * (parseInt(item.quantity) || 0),
      0
    );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerId) {
      toast.error("Please select a customer");
      return;
    }

    if (items.length === 0) {
      toast.error("Please add at least one product");
      return;
    }

    for (const item of items) {
      if (!item.productId || !item.quantity || parseInt(item.quantity) <= 0) {
        toast.error("Please select a product and enter valid quantity for all items");
        return;
      }
    }

    setLoading(true);
    try {
      await challanAPI.create({
        customerId: parseInt(customerId),
        status,
        items: items.map((item) => ({
          productId: parseInt(item.productId),
          quantity: parseInt(item.quantity),
        })),
      });
      toast.success(
        status === "CONFIRMED"
          ? "Challan created and confirmed!"
          : "Challan saved as draft"
      );
      navigate("/challans");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create challan");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <div className="page-loading">Loading...</div>;
  }

  const filteredCustomers = customerSearch
    ? customers.filter(
        (c) =>
          c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
          c.businessName.toLowerCase().includes(customerSearch.toLowerCase())
      )
    : customers;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">New Sales Challan</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="card">
          <h2 className="card-title">Customer</h2>
          <div className="form-group">
            <input
              type="text"
              placeholder="Search customer..."
              value={customerSearch}
              onChange={(e) => setCustomerSearch(e.target.value)}
              className="filter-input"
              style={{ marginBottom: "0.5rem" }}
            />
            <select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              required
            >
              <option value="">Select a customer</option>
              {filteredCustomers.map((c: any) => (
                <option key={c.id} value={c.id}>
                  {c.name} — {c.businessName}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="card" style={{ marginTop: "1.5rem" }}>
          <div className="card-header">
            <h2 className="card-title">Products</h2>
            <button
              type="button"
              className="btn btn-outline"
              onClick={addItem}
            >
              + Add Product
            </button>
          </div>

          {items.length === 0 ? (
            <div className="empty-state">
              No products added. Click "Add Product" to start.
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>SKU</th>
                    <th>Unit Price</th>
                    <th>Stock</th>
                    <th>Quantity</th>
                    <th>Total</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => {
                    const selectedProduct = products.find(
                      (p) => p.id.toString() === item.productId
                    );
                    return (
                      <tr key={index}>
                        <td>
                          <select
                            value={item.productId}
                            onChange={(e) =>
                              updateItem(index, "productId", e.target.value)
                            }
                            required
                          >
                            <option value="">Select product</option>
                            {products.map((p: any) => (
                              <option key={p.id} value={p.id}>
                                {p.name}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td><code>{item.sku || "—"}</code></td>
                        <td>₹{item.unitPrice.toFixed(2)}</td>
                        <td>
                          {selectedProduct ? (
                            <span
                              className={
                                selectedProduct.currentStock <
                                parseInt(item.quantity || "0")
                                  ? "text-danger"
                                  : "text-success"
                              }
                            >
                              {selectedProduct.currentStock}
                            </span>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) =>
                              updateItem(index, "quantity", e.target.value)
                            }
                            style={{ width: "80px" }}
                            required
                          />
                        </td>
                        <td>
                          ₹
                          {(
                            item.unitPrice * (parseInt(item.quantity) || 0)
                          ).toFixed(2)}
                        </td>
                        <td>
                          <button
                            type="button"
                            className="btn btn-sm btn-danger"
                            onClick={() => removeItem(index)}
                          >
                            ✕
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={4} style={{ textAlign: "right", fontWeight: 600 }}>
                      Total:
                    </td>
                    <td style={{ fontWeight: 600 }}>{getTotalQuantity()}</td>
                    <td style={{ fontWeight: 600 }}>
                      ₹{getTotalAmount().toFixed(2)}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>

        <div className="card" style={{ marginTop: "1.5rem" }}>
          <div className="form-actions">
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => navigate("/challans")}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-outline"
              onClick={() => setStatus("DRAFT")}
              disabled={loading}
            >
              {loading && status === "DRAFT" ? "Saving..." : "Save as Draft"}
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              onClick={() => setStatus("CONFIRMED")}
              disabled={loading}
            >
              {loading && status === "CONFIRMED"
                ? "Confirming..."
                : "Confirm Challan"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ChallanForm;
