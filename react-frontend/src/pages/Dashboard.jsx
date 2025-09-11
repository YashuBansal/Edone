import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import { FaEnvelopeOpenText, FaShoppingCart } from "react-icons/fa";

const Dashboard = () => {
  const [categoryCount, setCategoryCount] = useState(null);
  const [subcategoryCount, setSubcategoryCount] = useState(null);
  const [productCount, setProductCount] = useState(null);

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const memberId = user?.memberId || user?.sponsorId || user?.mainId || "N/A";
  const email = user?.email || "N/A";
  const isAdmin = user?.role === "admin";
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (!user) {
      alert("User not logged in");
      navigate("/");
      return;
    }

    const userId = user.id || user?._id;
    if (!userId && !isAdmin) {
      alert("Invalid user data. Please log in again.");
      navigate("/");
      return;
    }

    if (isAdmin) {
      const token = localStorage.getItem("token");

      fetch(`${API_URL}/categories`)
        .then(res => res.json())
        .then(data => setCategoryCount(data.length));

      fetch(`${API_URL}/subcategories`)
        .then(res => res.json())
        .then(data => setSubcategoryCount(data.length));

      fetch(`${API_URL}/product`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => setProductCount(data.length));
    }
  }, [isAdmin, user, navigate]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  const cards = [
    { label: "Total Categories", value: categoryCount, color: "danger", icon: "📁" },
    { label: "Total Sub Categories", value: subcategoryCount, color: "warning", icon: <FaEnvelopeOpenText /> },
    { label: "Total Products", value: productCount, color: "dark", icon: <FaShoppingCart /> },
  ];

  return (
    <div className="d-flex">
      <div className="flex-grow-1 p-3 rounded-3" style={{ backgroundColor: "#331159" }}>
        {/* Top bar */}
        <div className="bg-primary text-white p-3 d-flex justify-content-between align-items-center mt-3">
          <h6 className="mb-0">{isAdmin ? "Admin Dashboard" : "User Dashboard"}</h6>
          <button className="btn btn-light btn-sm" onClick={handleLogout}>Logout</button>
        </div>

        <div className="mt-4">
          <div className="alert alert-info d-flex justify-content-center flex-column">
            <div><strong>Member ID:</strong> {memberId}</div>
            <div><strong>Email:</strong> {email}</div>
          </div>
        </div>

        <div className="mt-4 mb-3">
          <div className="row g-4">
            {cards.map((card, idx) => (
              <div className="col-md-4" key={idx}>
                <div className={`card border-0 shadow-sm bg-${card.color} text-white rounded-3`}>
                  <div
                    className="card-body d-flex justify-content-between align-items-center py-4 rounded-3"
                    style={{ boxShadow: "5px 5px 10px rgba(255, 255, 255, 0.7)" }}
                  >
                    <div>
                      <h5>{card.label}</h5>
                      <h5>
                        {card.value === null ? (
                          <div className="spinner-border spinner-border-sm text-light" role="status">
                            <span className="visually-hidden">Loading...</span>
                          </div>
                        ) : (
                          card.value
                        )}
                      </h5>
                    </div>
                    <div className="fs-3">{card.icon}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
