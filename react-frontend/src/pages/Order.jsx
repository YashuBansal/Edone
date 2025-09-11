import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { demoOrders } from "../data/demoData";
import { motion, AnimatePresence } from "framer-motion";
import { calculateOrderTotal } from "../utils/CalculateTotal";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;
  const API = `${API_URL}/orders`;
  
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch(API);
        if (res.ok) {
          const data = await res.json();
          const allOrders = Array.isArray(data)
            ? data
            : data.orders || demoOrders;
          applyFilter(allOrders);
        } else {
          applyFilter(demoOrders);
        }
      } catch {
        applyFilter(demoOrders);
      }
    };

    const applyFilter = (data) => {
      const filtered =
        filter !== "All" ? data.filter((o) => o.status === filter) : data;
      setOrders(filtered);
    };

    fetchOrders();
  }, [filter]);

  const getStatusBadge = (status) => {
    const colors = {
      Pending: "warning text-dark",
      Processing: "info",
      Shipped: "primary",
      Delivered: "success",
      Cancelled: "danger",
    };
    return (
      <span className={`badge bg-${colors[status] || "secondary"}`}>
        {status}
      </span>
    );
  };

  const searchTerm = search.toLowerCase();
  const filteredOrders = orders.filter(
    (order) =>
      order._id.toLowerCase().includes(searchTerm) ||
      (order.userId?.name || "").toLowerCase().includes(searchTerm) ||
      String(order.phone || "").toLowerCase().includes(searchTerm) 
  );

  return (
    <div className="container mt-4">
      <motion.h2
        className="mb-3 text-center fw-bold"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        📦 Orders Management
      </motion.h2>

      {/* Filters */}
      <motion.div
        className="d-flex flex-wrap justify-content-between mb-3 gap-2 p-3 rounded shadow-sm bg-light"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <input
          type="text"
          className="form-control w-50 shadow-sm"
          placeholder="🔍 Search by Order ID or User or PhoneNo."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="form-select w-auto shadow-sm"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="All">All Orders</option>
          <option value="Pending">Pending</option>
          <option value="Processing">Processing</option>
          <option value="Shipped">Shipped</option>
          <option value="Delivered">Delivered</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </motion.div>

      {/* Table */}
      <div className="table-responsive overflow-hidden mt-3">
        <table className="table table-bordered table-hover align-middle shadow-sm rounded">
          <thead className="table-dark text-center">
            <tr>
              <th>Order ID</th>
              <th>User</th>
              <th>Total</th>
              <th>Date</th>
              <th>Status</th>
              <th>Payment</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <motion.tr
                    key={order._id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.3 }}
                    whileHover={{ scale: 1.02, backgroundColor: "#f8f9fa" }}
                    className="text-center"
                  >
                    <td>
                      <button
                        className="btn btn-outline-primary fw-semibold p-1 py-0 "
                        onClick={() => navigate(`/orders/${order._id}`)}
                      >
                        {order._id}
                      </button>
                    </td>
                    <td>{order.userId?.name || "Unknown"}</td>
                    <td className="fw-bold text-success">₹{calculateOrderTotal(order.items).grandTotal.toFixed(2)}</td>
                    <td>{new Date(order.createdAt).toLocaleString()}</td>
                    <td>{getStatusBadge(order.status)}</td>
                    <td>
                      <motion.button
                        className="btn btn-outline-primary btn-sm shadow-sm"
                        whileHover={{ scale: 1.05 }}
                        onClick={() => navigate(`/payments/${order.paymentId}`)}
                      >
                        View Payment
                      </motion.button>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <motion.tr
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center"
                >
                  <td colSpan="6">No Orders Found</td>
                </motion.tr>
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Orders;
