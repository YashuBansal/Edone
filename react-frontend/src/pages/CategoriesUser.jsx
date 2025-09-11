import React, { useState, useEffect } from "react";

const CategoriesUser = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const API_URL = import.meta.env.VITE_API_URL;
  const API = `${API_URL}/categories`;
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const res = await fetch(API, {
        headers: { Authorization: `Bearer ${token}` },
      });
        const data = await res.json();
        setCategories(Array.isArray(data) ? data : data.categories || []);
      } catch (err) {
        console.error("Fetch failed", err);
      }
      finally {
      setLoading(false);
    }
    };
    fetchCategories();
  }, []);

  return (
    <div className="container">
      <h2 className="mb-4">All Categories</h2>
      <table className="table table-bordered mt-3">
        <thead>
          <tr>
            <th>Image</th>
            <th>Title</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={11} className="text-center p-1">
                <div
                  className="spinner-border text-primary"
                  role="status"
                ></div>
                <div>Loading Categories...</div>
              </td>
            </tr>
          ) : categories.length > 0 ? (
          categories.map((cat) => (
            <tr key={cat._id}>
              <td>
                <img src={cat.image} alt="cat" width={60} />
              </td>
              <td>{cat.title}</td>
              <td>{cat.description}</td>
            </tr>
          ))
          ) : (
            <tr>
              <td colSpan={11} className="text-center">
                No Sub Categories found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default CategoriesUser;
