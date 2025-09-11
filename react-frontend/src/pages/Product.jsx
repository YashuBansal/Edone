import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const Product = () => {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");
  const API_URL = import.meta.env.VITE_API_URL;
  const API = `${API_URL}/product`;

  // fetch products from API
  const fetchProducts = async () => {
    setLoading(true); // start loading
    try {
      const res = await fetch(API, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts([]);
    } finally {
      setLoading(false); // stop loading
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // delete a product
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    await fetch(`${API}/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchProducts();
  };

  const handleToggleApproval = async (product) => {
  try {
    const res = await fetch(`${API}/approve/${product._id}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      const err = await res.json();
      return alert(err.message || "Not authorized to approve");
    }
    fetchProducts();
  } catch (error) {
    console.error("Approval error:", error);
    alert("Error approving product");
  }
};

  // filter by userId
  const filteredProducts = products.filter((product) => {
    const userName = product.userId?.userName || "";
    return userName.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div>
      <h3>All Products</h3>

      {/* Search bar */}
      <motion.div
        className="d-flex flex-wrap justify-content-between mb-3 gap-2 p-3 rounded shadow-sm bg-light"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <input
          type="text"
          className="form-control w-50 shadow-sm"
          placeholder="🔍 Search by User Name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </motion.div>

      <div className="table-responsive overflow-hidden mt-3">
        <table className="table table-bordered table-hover align-middle shadow-sm rounded">
          <thead className="table-dark text-center">
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
              <th>User Name</th>
              <th>Approved</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {loading ? (
                <tr>
                  <td colSpan={11} className="text-center p-1">
                    <div
                      className="spinner-border text-primary"
                      role="status"
                    ></div>
                    <div>Loading products...</div>
                  </td>
                </tr>
              ) : filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <motion.tr
                    key={product._id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.6 }}
                    whileHover={{ scale: 1.02, backgroundColor: "#f8f9fa" }}
                    className="text-center"
                  >
                    <td className="fw-bold text-info">{product.title}</td>
                    <td>
                      <img
                        src={product.images?.[0]}
                        width={50}
                        alt=""
                      />
                    </td>
                    <td>{product.stock}</td>
                    <td>{product.sizes?.join(", ") || "-"}</td>
                    <td>{product.colors?.join(", ") || "-"}</td>
                    <td className="fw-bold text-danger">₹{product.price}</td>
                    <td className="fw-bold text-warning">
                      {product.discount}%
                    </td>
                    <td className="fw-bold text-success">
                      ₹
                      {product.discount
                        ? (
                            product.price -
                            (product.price * product.discount) / 100
                          ).toFixed(2)
                        : product.price}
                    </td>
                    <td>{product.subcategoryId?.title || "-"}</td>
                    <td>{product.userId?.userName || "-"}</td>
                    <td>
                      <input
                        type="checkbox"
                        checked={product.isApproved || false}
                        onChange={() => handleToggleApproval(product)}
                      />
                    </td>
                    <td>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(product._id)}
                      >
                        DEL
                      </button>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan={12} className="text-center">
                    No products found
                  </td>
                </tr>
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Product;
