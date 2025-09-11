import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { demoOrders } from "../data/demoData";
import html2pdf from "html2pdf.js";
import { calculateOrderTotal } from "../utils/CalculateTotal";

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const API_URL = import.meta.env.VITE_API_URL;
  const API = `${API_URL}/orders/${id}`;

  useEffect(() => {
    const loadDemoData = () => {
      const demoOrder = demoOrders.find((o) => o._id === id) || demoOrders[0];
      setOrder(demoOrder);
      setStatus(demoOrder.status);
    };

    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        const res = await fetch(API);
        if (res.ok) {
          const data = await res.json();
          setOrder(data);
          setStatus(data.status);
        } else {
          loadDemoData();
        }
      } catch {
        loadDemoData();
      } finally {
        setLoading(false);
      }
    };
    fetchOrderDetails();
  }, [API, id]);

  const handleStatusUpdate = async () => {
    try {
      const res = await fetch(`${API}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        alert("Status updated successfully");
        window.location.reload();
      } else {
        alert("Failed to update status (Demo Mode)");
      }
    } catch {
      alert("Demo Mode: Status updated locally");
      setOrder((prev) => ({ ...prev, status }));
    }
  };

  const handleDownloadPDF = () => {
    const element = document.getElementById("formContent");
    const options = {
      margin: 0.5,
      filename: `order_${order._id}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
    };

    html2pdf().set(options).from(element).save();
  };

  if (loading)
    return <p className="text-center mt-4">Loading order details...</p>;
  if (!order) return <p className="text-center mt-4">Order not found</p>;

  return (
    <motion.div
      className="container mt-4"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="d-flex align-items-center justify-content-between">
        <motion.button
          className="btn btn-secondary"
          onClick={() => navigate("/orders")}
          whileHover={{ scale: 1.05 }}
        >
          ← Back to Orders
        </motion.button>
        <div>
          <strong>Status: </strong>
          <select
            className="form-select w-auto d-inline-block ms-2"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="Pending">Pending</option>
            <option value="Processing">Processing</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
          <motion.button
            className="btn btn-primary ms-2"
            onClick={handleStatusUpdate}
            whileHover={{ scale: 1.01 }}
          >
            Update
          </motion.button>
        </div>
      </div>

      <div id="formContent">
        <h2 className="mb-3 text-center fw-bold mt-3">Order Details</h2>
        <hr />

        {/* Order Info */}
        <motion.div
          className="card p-3 shadow-sm mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <p>
            <strong>Order ID:</strong> {order._id}
          </p>
          <p>
            <strong>User:</strong> {order.userId?.name || "Unknown"}
          </p>
          <p>
            <strong>Phone:</strong> {order.phone || ""}
          </p>
          <p>
            <strong>Address:</strong> {order.address || ""}
          </p>
          <p>
            <strong>Total Amount:</strong>{" "}
            <span className="fw-bold text-success">
              ₹{calculateOrderTotal(order.items).grandTotal.toFixed(2)}
            </span>
          </p>
          <p>
            <strong>Date:</strong> {new Date(order.createdAt).toLocaleString()}
          </p>
        </motion.div>

        {/* Products Table */}
        <h4 className="fw-bold">Products in this Order</h4>
        <div className="table-responsive overflow-hidden mt-3">
          <table className="table table-bordered table-hover align-middle shadow-sm rounded">
            <thead className="table-dark text-center">
              <tr>
                <th>Product</th>
                <th>Color</th>
                <th>Size</th>
                <th>Price</th>
                <th>Discount%</th>
                <th>GST</th>
                <th>Qty</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {order.items?.map((item, index) => (
                  <motion.tr
                    key={index}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.3 }}
                    whileHover={{ scale: 1.02, backgroundColor: "#f8f9fa" }}
                    className="text-center"
                  >
                    <td>{item.productId?.title || "Product"}</td>
                    <td>{item.color || "-"}</td>
                    <td>{item.size || "-"}</td>
                    <td className="fw-bold">₹{item.price}</td>
                    <td>{item.discount}%</td>
                    <td>{item.gst}%</td>
                    <td>{item.quantity}</td>
                    <td className="fw-bold text-success">
                      ₹
                      {(
                        (item.price -
                          (item.price * item.discount) / 100 +
                          ((item.price - (item.price * item.discount) / 100) *
                            item.gst) /
                            100) *
                        item.quantity
                      ).toFixed(2)}
                    </td>
                  </motion.tr>
                ))}
                <motion.tr className="text-center">
                  <td colSpan="7" className="fw-bold text-end pe-3">
                    Subtotal:
                  </td>
                  <td className="fw-bold">₹{calculateOrderTotal(order.items).subtotal.toFixed(2)}</td>
                </motion.tr>

                <motion.tr className="text-center">
                  <td colSpan="7" className="fw-bold text-end pe-3">
                    Total Discount:
                  </td>
                  <td className="text-danger">-₹{calculateOrderTotal(order.items).totalDiscount.toFixed(2)}</td>
                </motion.tr>

                <motion.tr className="text-center">
                  <td colSpan="7" className="fw-bold text-end pe-3">
                    Total GST:
                  </td>
                  <td className="text-warning">₹{calculateOrderTotal(order.items).totalGst.toFixed(2)}</td>
                </motion.tr>

                <motion.tr className="text-center table-dark">
                  <td colSpan="7" className="fw-bold text-end pe-3">
                    Grand Total:
                  </td>
                  <td className="fw-bold text-success">
                    ₹{calculateOrderTotal(order.items).grandTotal.toFixed(2)}
                  </td>
                </motion.tr>
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>
      {/* View Payment Button */}
      <motion.button
        className="btn btn-info mt-3 shadow-sm"
        whileHover={{ scale: 1.05 }}
        onClick={handleDownloadPDF}
      >
        Download as PDF
      </motion.button>
    </motion.div>
  );
};

export default OrderDetails;
