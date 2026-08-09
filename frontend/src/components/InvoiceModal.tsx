import React from "react";
import "./InvoicePdf.css";

interface InvoiceModalProps {
  challan: any;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ challan, onClose }) => {
  if (!challan) return null;

  const totalAmount = challan.items?.reduce(
    (sum: number, item: any) => sum + Number(item.total),
    0
  ) || 0;

  const subtotal = totalAmount;
  const gstRate = 0.18;
  const gstAmount = subtotal * gstRate;
  const grandTotal = subtotal + gstAmount;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="invoice-modal-overlay no-print">
      <div className="invoice-modal-content">
        <div className="invoice-modal-header no-print">
          <div className="invoice-modal-header-title">
            <span>Invoice</span>
            <span>— {challan.challanNumber}</span>
          </div>
          <div className="invoice-modal-actions">
            <button className="btn-print" onClick={handlePrint}>
              Print / Save as PDF
            </button>
            <button className="btn-close-modal" onClick={onClose}>
              Close
            </button>
          </div>
        </div>

        <div className="invoice-modal-body">
          <div id="invoice-print-area" className="invoice-container">
            <div className="invoice-header">
              <div className="invoice-company-brand">
                <h1>FundRooms ERP</h1>
                <p>Wholesale & Distribution Management</p>
                <p style={{ marginTop: "0.25rem", fontSize: "0.8rem", color: "#64748b" }}>
                  GSTIN: 27AAAAA0000A1Z5 | Reg: FR-987214
                </p>
              </div>
              <div className="invoice-meta">
                <div className="invoice-title">TAX INVOICE</div>
                <div className="invoice-meta-item">
                  <strong>Invoice No:</strong> {challan.challanNumber}
                </div>
                <div className="invoice-meta-item">
                  <strong>Date:</strong> {new Date(challan.createdAt).toLocaleDateString()}
                </div>
                <div className="invoice-meta-item">
                  <strong>Status:</strong>{" "}
                  <span
                    style={{
                      textTransform: "uppercase",
                      fontWeight: 700,
                      color: challan.status === "CONFIRMED" ? "#16a34a" : "#ca8a04"
                    }}
                  >
                    {challan.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="invoice-addresses">
              <div className="address-box">
                <h3>Billed & Delivered To:</h3>
                <div className="company-name">{challan.customer?.name}</div>
                <p><strong>Business:</strong> {challan.customer?.businessName}</p>
                <p><strong>Mobile:</strong> {challan.customer?.mobile}</p>
                {challan.customer?.email && <p><strong>Email:</strong> {challan.customer?.email}</p>}
                {challan.customer?.address && <p><strong>Address:</strong> {challan.customer?.address}</p>}
                {challan.customer?.gstNumber && <p><strong>GSTIN:</strong> {challan.customer?.gstNumber}</p>}
              </div>

              <div className="address-box">
                <h3>Dispatch Details:</h3>
                <p><strong>Issued By:</strong> {challan.createdBy?.name || "System Admin"}</p>
                <p><strong>Customer Type:</strong> {challan.customer?.customerType || "STANDARD"}</p>
                <p><strong>Payment Terms:</strong> Net 30 Days</p>
                <p><strong>Place of Supply:</strong> Main Warehouse</p>
              </div>
            </div>

            <table className="invoice-table">
              <thead>
                <tr>
                  <th style={{ width: "5%" }}>#</th>
                  <th>Item & Description</th>
                  <th style={{ width: "15%" }}>SKU</th>
                  <th style={{ textAlign: "right", width: "15%" }}>Unit Price</th>
                  <th style={{ textAlign: "center", width: "10%" }}>Qty</th>
                  <th style={{ textAlign: "right", width: "18%" }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {challan.items?.map((item: any, idx: number) => (
                  <tr key={item.id || idx}>
                    <td>{idx + 1}</td>
                    <td>
                      <strong>{item.productName}</strong>
                    </td>
                    <td><code>{item.sku}</code></td>
                    <td style={{ textAlign: "right" }}>₹{Number(item.unitPrice).toFixed(2)}</td>
                    <td style={{ textAlign: "center" }}>{item.quantity}</td>
                    <td style={{ textAlign: "right" }}>₹{Number(item.total).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="invoice-summary">
              <div className="invoice-terms">
                <h4>Terms & Conditions:</h4>
                <ol style={{ paddingLeft: "1.2rem", margin: "0.25rem 0 0 0" }}>
                  <li>Goods once sold will not be taken back without authorization.</li>
                  <li>Subject to local jurisdiction.</li>
                  <li>Interest @ 18% p.a. will be charged on delayed payments.</li>
                </ol>
              </div>

              <div className="invoice-totals">
                <div className="totals-row">
                  <span>Subtotal:</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="totals-row">
                  <span>Estimated GST (18%):</span>
                  <span>₹{gstAmount.toFixed(2)}</span>
                </div>
                <div className="totals-row grand-total">
                  <span>Grand Total:</span>
                  <span>₹{grandTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="invoice-footer">
              <div>
                <p style={{ margin: 0 }}>Thank you for your business!</p>
                <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.75rem" }}>Computer generated invoice. No physical signature required.</p>
              </div>
              <div className="signature-block">
                <div className="signature-line">Authorised Signatory</div>
                <p style={{ margin: "0.2rem 0 0 0", fontSize: "0.75rem" }}>FundRooms Operations</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
