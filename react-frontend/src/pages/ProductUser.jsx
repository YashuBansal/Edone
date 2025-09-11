import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X } from "lucide-react";

const ProductUser = () => {
  const [products, setProducts] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [availableSizes, setAvailableSizes] = useState([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    features: [],
    stock: "",
    price: "",
    discount: "",
    categoryId: "",
    subcategoryId: "",
    sizes: [],
    colors: [],
  });
  const [files, setFiles] = useState([]);
  const [preview, setPreview] = useState([]);
  const [editId, setEditId] = useState(null);
  const API_URL = import.meta.env.VITE_API_URL;
  const API = `${API_URL}/product`;
  const SUBCAT_API = `${API_URL}/subcategories`;
  const CATEGORY_API = `${API_URL}/categories`;
  const token = localStorage.getItem("token");

  const clothingSizes = {
    Adults: ["XS", "S", "M", "L", "XL", "XXL"],
    Kids: ["2Y", "4Y", "6Y"],
  };
  const footwearSizes = {
    Adults: ["6", "7", "8", "9", "10"],
    Kids: ["32", "34", "36"],
  };
  const availableColors = ["Red", "Blue", "Green", "Brown", "White", "Yellow"];

  // Fetch all data on mount
  useEffect(() => {
    fetchCategories();
    fetchSubCategories();
    fetchProduct();
  }, []);

  useEffect(() => {
    // Revoke object URLs when component unmounts
    return () => preview.forEach((url) => URL.revokeObjectURL(url));
  }, [preview]);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const res = await fetch(API, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch products");
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubCategories = async () => {
    try {
      const res = await fetch(SUBCAT_API, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setSubcategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch(CATEGORY_API, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredSubcategories = subcategories.filter(
    (sub) => sub.category?._id === form.categoryId
  );

  const handleSubCategoryChange = (e) => {
    const subCatId = e.target.value;
    setForm((prev) => ({ ...prev, subcategoryId: subCatId, sizes: [] }));

    const selectedSub = subcategories.find((s) => s._id === subCatId);
    if (selectedSub) {
      if (selectedSub.type === "Clothing")
        setAvailableSizes(clothingSizes[selectedSub.sizeGroup] || []);
      else if (selectedSub.type === "Footwear")
        setAvailableSizes(footwearSizes[selectedSub.sizeGroup] || []);
      else setAvailableSizes([]);
    } else setAvailableSizes([]);
  };

  const handleSizeSelect = (size) => {
    const updated = form.sizes.includes(size)
      ? form.sizes.filter((s) => s !== size)
      : [...form.sizes, size];
    setForm((prev) => ({ ...prev, sizes: updated }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "categoryId"
        ? { subcategoryId: "", sizes: [], colors: [] }
        : {}),
    }));
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length > 5) return alert("Max 5 images allowed");
    setFiles(selectedFiles);
    setPreview(selectedFiles.map((f) => URL.createObjectURL(f)));
  };

  const finalPrice = (price, discount) =>
    discount ? (price * (1 - discount / 100)).toFixed(2) : price;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !form.title.trim() ||
      !form.title ||
      !form.stock ||
      !form.price ||
      !form.subcategoryId ||
      !form.sizes.length ||
      !form.colors.length ||
      (!files.length && !editId)
    ) {
      return alert("All fields required");
    }

    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("description", form.description);
    form.features.forEach((f) => formData.append("features", f));
    formData.append("stock", form.stock);
    formData.append("price", form.price);
    formData.append("discount", form.discount || 0);
    formData.append("categoryId", form.categoryId);
    formData.append("subcategoryId", form.subcategoryId);
    formData.append("sizes", JSON.stringify(form.sizes));
    formData.append("colors", JSON.stringify(form.colors));
    files.forEach((file) => formData.append("images", file));

    try {
      const res = await fetch(editId ? `${API}/${editId}` : API, {
        method: editId ? "PUT" : "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) throw new Error("Failed to save product");
      await res.json();
      fetchProduct();
      setForm({
        title: "",
        description: "",
        features: [],
        stock: "",
        price: "",
        discount: "",
        categoryId: "",
        subcategoryId: "",
        sizes: [],
        colors: [],
      });
      setFiles([]);
      setPreview([]);
      setEditId(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (product) => {
    setForm({
      title: product.title,
      description: product.description,
      features: (product.features || []).map((f) =>
      typeof f === "string" ? f : f.text || ""),
      stock: product.stock,
      price: product.price,
      discount: product.discount,
      categoryId: product.subcategoryId?.categoryId,
      subcategoryId: product.subcategoryId?._id || product.subcategoryId,
      sizes: product.sizes || [],
      colors: product.colors || [],
    });
    setEditId(product._id);
    setPreview(product.images || []);
    setFiles([]);
    const selectedSub = subcategories.find(
      (s) => s._id === product.subcategoryId?._id || product.subcategoryId
    );
    if (selectedSub) {
      if (selectedSub.type === "Clothing")
        setAvailableSizes(clothingSizes[selectedSub.sizeGroup] || []);
      else if (selectedSub.type === "Footwear")
        setAvailableSizes(footwearSizes[selectedSub.sizeGroup] || []);
      else setAvailableSizes([]);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      const res = await fetch(`${API}/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete product");
      fetchProduct();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="container">
      <h2 className="mb-4">{editId ? "Edit Product" : "Add Product"}</h2>
      <form onSubmit={handleSubmit}>
        {/* Category & Subcategory */}
        <div className="mb-2">
          <label>Category</label>
          <select
            className="form-select"
            name="categoryId"
            value={form.categoryId}
            onChange={handleChange}
          >
            <option value="">-- Select --</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.title}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-2">
          <label>Subcategory</label>
          <select
            className="form-select"
            name="subcategoryId"
            value={form.subcategoryId}
            onChange={handleSubCategoryChange}
          >
            <option value="">-- Select --</option>
            {filteredSubcategories.map((sub) => (
              <option key={sub._id} value={sub._id}>
                {sub.title}
              </option>
            ))}
          </select>
        </div>

        {/* Title, Stock, Sizes, Colors */}
        <div className="mb-2">
          <label>Title</label>
          <input
            className="form-control"
            name="title"
            value={form.title}
            onChange={handleChange}
          />
        </div>
        <div className="mb-2">
          <label>Description</label>
          <input
            className="form-control"
            name="description"
            value={form.description}
            onChange={handleChange}
          />
        </div>
        <div className="mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Features
          </label>

          <AnimatePresence>
            {form.features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="position-relative mb-2"
              >
                <input
                  className="form-control pe-5"
                  value={feature}
                  placeholder={`Feature ${index + 1}`}
                  onChange={(e) => {
                    const newFeatures = [...form.features];
                    newFeatures[index] = e.target.value;
                    setForm({ ...form, features: newFeatures });
                  }}
                />
                <button
                  type="button"
                  className="btn btn-sm btn-outline-danger position-absolute top-50 end-0 translate-middle-y me-1"
                  onClick={() => {
                    const newFeatures = form.features.filter(
                      (_, i) => i !== index
                    );
                    setForm({ ...form, features: newFeatures });
                  }}
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>

          <motion.button
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="btn btn-primary btn-sm d-flex align-items-center gap-1"
            onClick={() =>
              setForm({ ...form, features: [...form.features, ""] })
            }
          >
            <Plus className="w-4 h-4" />
            Add Feature
          </motion.button>
        </div>
        <div className="mb-2">
          <label>Stock</label>
          <input
            type="number"
            className="form-control"
            name="stock"
            value={form.stock}
            onChange={handleChange}
          />
        </div>

        {availableSizes.length > 0 && (
          <div className="mb-2">
            <label className="form-label">Select Sizes</label>
            <div className="d-flex flex-wrap gap-2">
              {availableSizes.map((size) => {
                const selected = form.sizes.includes(size);
                return (
                  <div
                    key={size}
                    onClick={() => handleSizeSelect(size)}
                    className={`d-flex align-items-center justify-content-center bg-light rounded-1 ${
                      selected
                        ? "fw-semibold border border-3 border-dark"
                        : "fw-normal border border-3 border-light"
                    }`}
                    style={{ width: "50px", height: "40px", cursor: "pointer" }}
                  >
                    {size}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="mb-2">
          <label className="form-label">Colors</label>
          <div className="d-flex flex-wrap gap-2">
            {availableColors.map((color) => {
              const selected = form.colors.includes(color);
              return (
                <div
                  key={color}
                  onClick={() => {
                    const updated = selected
                      ? form.colors.filter((c) => c !== color)
                      : [...form.colors, color];
                    setForm((prev) => ({ ...prev, colors: updated }));
                  }}
                  className="cursor-pointer rounded-2"
                  style={{
                    width: "30px",
                    height: "30px",
                    backgroundColor: color.toLowerCase(),
                    border: selected ? "3px solid black" : "1px solid #ccc",
                  }}
                  title={color}
                ></div>
              );
            })}
          </div>
        </div>

        {/* Price, Discount, Images */}
        <div className="mb-2">
          <label>Price</label>
          <input
            type="number"
            className="form-control"
            name="price"
            value={form.price}
            onChange={handleChange}
          />
        </div>
        <div className="mb-2">
          <label>Discount %</label>
          <input
            type="number"
            className="form-control"
            name="discount"
            value={form.discount}
            onChange={handleChange}
          />
        </div>
        <div className="mb-2">
          <label>Images (max 5)</label>
          <input
            type="file"
            className="form-control"
            multiple
            accept=".jpg,.jpeg,.png"
            onChange={handleFileChange}
          />
          {preview.length > 0 && (
            <div className="d-flex gap-2 mt-2 flex-wrap">
              {preview.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  width={100}
                  height={120}
                  style={{ objectFit: "cover" }}
                  alt="preview"
                />
              ))}
            </div>
          )}
        </div>

        <button className="btn btn-success">
          {editId ? "Update" : "Add"} Product
        </button>
      </form>

      <hr />
      <h3>All Products</h3>
      <table className="table table-bordered mt-3">
        <thead>
          <tr>
            <th>Title</th>
            <th>Image</th>
            <th>Stock</th>
            <th>Sizes</th>
            <th>Colors</th>
            <th>Price</th>
            <th>Discount</th>
            <th>Final Price</th>
            <th>Subcategory</th>
            <th>Approved</th>
            <th>Actions</th>
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
                <div>Loading Products...</div>
              </td>
            </tr>
          ) : products.length > 0 ? (
            products.map((product) => (
              <tr key={product._id}>
                <td>{product.title}</td>
                <td>
                  <img
                    src={product.images?.[0] || "/placeholder.png"}
                    width={50}
                    alt=""
                  />
                </td>
                <td>{product.stock}</td>
                <td>
                  {product.sizes?.length ? product.sizes.join(", ") : "-"}
                </td>
                <td>
                  {product.colors?.length ? product.colors.join(", ") : "-"}
                </td>
                <td>{product.price}</td>
                <td>{product.discount || 0}%</td>
                <td>{finalPrice(product.price, product.discount)}</td>
                <td>{product.subcategoryId?.title || "-"}</td>
                <td className="text-center">
                  <input
                    type="checkbox"
                    checked={product.isApproved || false}
                    disabled
                  />
                </td>
                <td>
                  <button
                    className="btn btn-warning btn-sm me-1"
                    onClick={() => handleEdit(product)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(product._id)}
                  >
                    Del
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={11} className="text-center">
                No products found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ProductUser;
