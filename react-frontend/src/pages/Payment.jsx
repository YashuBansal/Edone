import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { demoOrders } from "../data/demoData";
import { motion, AnimatePresence } from "framer-motion";
import { calculateOrderTotal } from "../utils/CalculateTotal";

const Payments = () => {
  const { id } = useParams(); // paymentId from route
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState("");
 const API_URL = import.meta.env.VITE_API_URL;
  const API = `${API_URL}/payments/${id}`; 

  useEffect(() => {
    const loadDemoData = () => {
      const foundOrder = demoOrders.find((o) => o.paymentId === id) || demoOrders[0];
      setOrder(foundOrder);
      setPaymentStatus(foundOrder.paymentStatus);
    };

    const fetchPaymentDetails = async () => {
      try {
        setLoading(true);
        const res = await fetch(API);
        if (res.ok) {
          const data = await res.json();
          setOrder(data);
          setPaymentStatus(data.paymentStatus);
        } else {
          loadDemoData();
        }
      } catch {
        loadDemoData();
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentDetails();
  }, [API, id]);

  const handleStatusUpdate = async () => {
    try {
      const res = await fetch(`${API}/paymentStatus`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentStatus }),
      });

      if (res.ok) {
        alert("Payment status updated successfully");
        window.location.reload();
      } else {
        alert("Failed to update status (Demo Mode)");
      }
    } catch {
      alert("Demo Mode: Payment status updated locally");
      setOrder((prev) => ({ ...prev, paymentStatus }));
    }
  };

  if (loading) return <p className="text-center mt-4">Loading payment details...</p>;
  if (!order) return <p className="text-center mt-4">Payment not found</p>;

  const textVariants = {
    hover: { scale: 1.1, color: "#0d6efd" }, // blue text on hover
  };

  return (
    <motion.div
      className="container mt-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <button className="btn btn-secondary mb-3" onClick={() => navigate("/orders")}>
        ← Back to Orders
      </button>

      <h2 className="mb-4 text-center">Payment Details</h2>

      <div className="card shadow-lg p-4 mb-4">
        <AnimatePresence>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-3"
          >
            <strong>Payment ID:</strong>{" "}
            <motion.span variants={textVariants} whileHover="hover">
              {order.paymentId}
            </motion.span>
          </motion.p>

          <p>
            <strong>Order ID:</strong>{" "}
            <motion.button
              className="btn btn-outline-primary btn-sm"
              whileHover={{ scale: 1.1 }}
              onClick={() => navigate(`/orders/${order._id}`)}
            >
              {order._id}
            </motion.button>
          </p>

          <p>
            <strong>Amount:</strong>{" "}
            <motion.span variants={textVariants} whileHover="hover">
              ₹{calculateOrderTotal(order.items).grandTotal.toFixed(2)}
            </motion.span>
          </p>

          <p>
            <strong>Method:</strong>{" "}
            <motion.span variants={textVariants} whileHover="hover">
              {order.method}
            </motion.span>
          </p>

          <p>
            <strong>Date:</strong>{" "}
            <motion.span variants={textVariants} whileHover="hover">
              {new Date(order.paymentDate).toLocaleString()}
            </motion.span>
          </p>
        </AnimatePresence>
      </div>

      {/* Status Update */}
      <motion.div
        className="mb-4 d-flex align-items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <strong>Status: </strong>
        <select
          className="form-select w-auto d-inline-block"
          value={paymentStatus}
          onChange={(e) => setPaymentStatus(e.target.value)}
        >
          <option value="Success">Success</option>
          <option value="Pending">Pending</option>
          <option value="Failed">Failed</option>
        </select>
        <motion.button
          className="btn btn-primary"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleStatusUpdate}
        >
          Update
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

export default Payments;