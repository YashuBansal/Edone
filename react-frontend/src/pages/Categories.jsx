import React, { useState, useEffect } from "react";

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ title: "", description: "", image: "" });
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true); // 🔹 added loading state
  const API_URL = import.meta.env.VITE_API_URL;
  const API = `${API_URL}/categories`;
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await fetch(API, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      console.error("Fetch failed", err);
    } finally {
      setLoading(false); // 🔹 stop loading
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setForm({ ...form, image: file });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title || !form.description || !form.image) {
      return alert("All fields required");
    }

    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("description", form.description);
    formData.append("image", form.image);

    const method = editId ? "PUT" : "POST";
    const url = editId ? `${API}/${editId}` : API;

    const res = await fetch(url, {
      method,
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    if (res.ok) {
      setForm({ title: "", description: "", image: "" });
      setEditId(null);
      fetchCategories();
    } else {
      const err = await res.json().catch(() => ({ message: "Error" }));
      alert(err.message || "Error saving category");
    }
  };

  const handleEdit = (cat) => {
    setEditId(cat._id);
    setForm({
      title: cat.title,
      description: cat.description,
      image: cat.image,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this category?")) return;
    const res = await fetch(`${API}/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) fetchCategories();
  };

  return (
    <div className="container">
      <h2 className="mb-4">{editId ? "Update" : "Add"} Category</h2>

      <form onSubmit={handleSubmit} className="mb-4">
        <div className="mb-2">
          <label className="form-label">Title</label>
          <input
            className="form-control"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
        </div>

        <div className="mb-2">
          <label className="form-label">Description</label>
          <input
            className="form-control"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>

        <div className="mb-2">
          <label className="form-label">Image</label>
          <input
            type="file"
            className="form-control"
            accept=".jpg,.jpeg"
            onChange={handleImageChange}
          />
          {form.image && (
            <img
              src={form.image instanceof File ? URL.createObjectURL(form.image) : form.image}
              alt="preview"
              style={{ width: 100, marginTop: 10 }}
            />
          )}
        </div>

        <button type="submit" className="btn btn-primary">
          {editId ? "Update" : "Add"} Category
        </button>
      </form>

      <h3>All Categories</h3>
      <table className="table table-bordered mt-3">
        <thead>
          <tr>
            <th>Image</th>
            <th>Title</th>
            <th>Description</th>
            <th style={{ width: "120px" }}>Actions</th>
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
          ) : categories.length > 0 ? (
          categories.map((cat) => (
            <tr key={cat._id}>
              <td>
                <img src={cat.image} alt="cat" width={60} />
              </td>
              <td>{cat.title}</td>
              <td>{cat.description}</td>
              <td>
                <button
                  className="btn btn-warning btn-sm me-1"
                  onClick={() => handleEdit(cat)}
                >
                  Edit
                </button>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleDelete(cat._id)}
                >
                  Del
                </button>
              </td>
            </tr>
          ))
          ) : (
            <tr>
              <td colSpan={11} className="text-center">
                No Categories found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Categories;
