import React, { useState, useEffect } from "react";

const SubCategories = () => {
  const [subcategories, setSubcategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    category: "",
    title: "",
    description: "",
    type: "",
    sizeGroup: "",
  });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [editId, setEditId] = useState(null);
  const API_URL = import.meta.env.VITE_API_URL;
  const API = `${API_URL}/subcategories`;
  const CATEGORY_API = `${API_URL}/categories`;
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.id || user?._id;

  useEffect(() => {
    if (!userId) return;
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchSubCategories(), fetchCategories()]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubCategories = async () => {
    try {
      const res = await fetch(API, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setSubcategories(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${CATEGORY_API}?userId=${userId}`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.category || !form.title || !form.description || !form.type || !form.sizeGroup || (!file && !editId)) {
      return alert("All fields required");
    }

    const formData = new FormData();
    formData.append("category", form.category);
    formData.append("title", form.title);
    formData.append("description", form.description);
    formData.append("type", form.type);
    formData.append("sizeGroup", form.sizeGroup);
    if (file) formData.append("image", file);

    const options = {
      method: editId ? "PUT" : "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    };

    const url = editId ? `${API}/${editId}` : API;
    await fetch(url, options);

    setForm({ category: "", title: "", description: "", type: "", sizeGroup: "" });
    setFile(null);
    setPreview("");
    setEditId(null);
    fetchSubCategories();
  };

  const handleEdit = (s) => {
    setForm({
      category: s.category?._id,
      title: s.title,
      description: s.description,
      type: s.type,
      sizeGroup: s.sizeGroup || "",
    });
    setPreview(s.image);
    setEditId(s._id);
    setFile(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    await fetch(`${API}/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
    fetchSubCategories();
  };

  return (
    <div className="container">
      <h2 className="mb-4">{editId ? "Update SubCategory" : "Add SubCategory"}</h2>

      <form onSubmit={handleSubmit} className="mb-4">
        <div className="mb-2">
          <label className="form-label">Select Category</label>
          <select name="category" className="form-select" value={form.category} onChange={handleChange}>
            <option value="">-- Select --</option>
            {categories.map((cat) => <option key={cat._id} value={cat._id}>{cat.title}</option>)}
          </select>
        </div>

        <div className="mb-2">
          <label className="form-label">SubCategory Title</label>
          <input type="text" name="title" className="form-control" value={form.title} onChange={handleChange} />
        </div>

        <div className="mb-2">
          <label className="form-label">SubCategory Description</label>
          <textarea name="description" className="form-control" value={form.description} onChange={handleChange} />
        </div>

        <div className="mb-2">
          <label className="form-label">Select Type</label>
          <select name="type" className="form-select" value={form.type} onChange={handleChange}>
            <option value="">-- Select Type --</option>
            <option value="Clothing">Clothing</option>
            <option value="Footwear">Footwear</option>
          </select>
        </div>

        <div className="mb-2">
          <label className="form-label">Select Size Group</label>
          <select name="sizeGroup" className="form-select" value={form.sizeGroup} onChange={handleChange} disabled={!form.type}>
            <option value="">-- Select Size Group --</option>
            {["Adults","Kids"].map(sg => <option key={sg} value={sg}>{sg}</option>)}
          </select>
        </div>

        <div className="mb-2">
          <label className="form-label">Image</label>
          <input type="file" accept=".jpg,.jpeg,.png" className="form-control" onChange={handleFileChange} />
          {preview && <img src={preview} alt="Preview" style={{ width: "120px", marginTop: "10px", display: "block" }} />}
        </div>

        <button type="submit" className="btn btn-primary">{editId ? "Update" : "Add"}</button>
      </form>

      <h3>All SubCategories</h3>
      <table className="table table-bordered mt-3">
        <thead>
          <tr>
            <th>Category</th>
            <th>Title</th>
            <th>Description</th>
            <th>Type</th>
            <th>Image</th>
            <th style={{ width: "120px" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={6} className="text-center"><div className="spinner-border text-primary" role="status"></div>Loading Sub Categories...</td></tr>
          ) : subcategories.length ? (
            subcategories.map((s) => (
              <tr key={s._id}>
                <td>{s.category?.title}</td>
                <td>{s.title}</td>
                <td>{s.description}</td>
                <td>{s.type}</td>
                <td><img src={s.image} alt="" style={{ width: "60px" }} /></td>
                <td>
                  <button className="btn btn-sm btn-warning me-1" onClick={() => handleEdit(s)}>Edit</button>
                  <button className="btn btn-sm btn-danger" onClick={() => handleDelete(s._id)}>Del</button>
                </td>
              </tr>
            ))
          ) : (
            <tr><td colSpan={6} className="text-center">No Sub Categories found</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default SubCategories;
