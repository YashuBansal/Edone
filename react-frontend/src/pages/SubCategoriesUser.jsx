import React, { useState, useEffect } from "react";

const SubCategoriesUser = () => {
  const [subcategories, setSubcategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");
  const API_URL = import.meta.env.VITE_API_URL;
  const API = `${API_URL}/subcategories`;
  const CATEGORY_API = `${API_URL}/categories`;

  useEffect(() => {
  const fetchSubCategories = async (uid) => {
    setLoading(true);
    try {
      const res = await fetch(`${API}?userId=${uid}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setSubcategories(data);
    } catch (err) {
      console.error("Failed to fetch subcategories", err);
    }
    finally {
      setLoading(false);
    }
  };

  const fetchCategories = async (uid) => {
    try {
      const res = await fetch(`${CATEGORY_API}?userId=${uid}`);
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      console.error("Failed to fetch categories", err);
    }
  };

    fetchSubCategories();
    fetchCategories();
  }, []);

  return (
    <div className="container">
      <h2 className="mb-4">All SubCategories</h2>
      <table className="table table-bordered mt-3">
        <thead>
          <tr>
            <th>Category</th>
            <th>Title</th>
            <th>Description</th>
            <th>Type</th>
            <th>Image</th>
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
                <div>Loading Sub Categories...</div>
              </td>
            </tr>
          ) : subcategories.length > 0 ? (
          subcategories.map((s) => (
            <tr key={s._id}>
              <td>{s.category?.title}</td>
              <td>{s.title}</td>
              <td>{s.description}</td>
              <td>{s.type}</td>
              <td>
                <img src={s.image} alt="" style={{ width: "60px" }} />
              </td>
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

export default SubCategoriesUser;
