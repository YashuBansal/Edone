import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Footer } from "@/components/layout/Footer";
import { ProductCard } from "@/components/product/ProductCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useLocation } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Search, Grid, List, SlidersHorizontal } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const ShopNow = () => {
  const [allProducts, setAllProducts] = useState([]);

  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const queryFromNavbar = params.get("search") || "";
  const [searchQuery, setSearchQuery] = useState(queryFromNavbar);

  const [viewMode, setViewMode] = useState("grid");
  const [sortBy, setSortBy] = useState("relevance");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSubcategory, setSelectedSubcategory] = useState("all");
  const [priceRange, setPriceRange] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  const API_URL = import.meta.env.VITE_API_URL;
  const API = `${API_URL}/product/approved/public`;

  useEffect(() => {
    setSearchQuery(queryFromNavbar);
  }, [queryFromNavbar]);

  // ✅ Fetch approved products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(API);
        const data = await res.json();
        // filter only approved
        const approved = data.filter((p) => p.isApproved);
        setAllProducts(approved);
      } catch (err) {
        console.error("Error fetching products:", err);
        setAllProducts([]);
      }
    };
    fetchProducts();
  }, []);

  // Get dynamic categories & subcategories from products
  const categories = [
    ...new Set(allProducts.map((p) => p.categoryId?.title).filter(Boolean)),
  ];

  const subcategories =
    selectedCategory === "all"
      ? [
          ...new Set(
            allProducts.map((p) => p.subcategoryId?.title).filter(Boolean)
          ),
        ]
      : [
          ...new Set(
            allProducts
              .filter((p) => p.categoryId?.title === selectedCategory)
              .map((p) => p.subcategoryId?.title)
              .filter(Boolean)
          ),
        ];

  // ✅ Filtering
  const uniqueCategoryProducts = useMemo(() => {
    // Sort by createdAt (assuming you store creation date) or fallback to index
    const sortedProducts = [...allProducts].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    const categoryMap = new Map();
    for (let product of sortedProducts) {
      const category = product.categoryId?.title || "Uncategorized";
      if (!categoryMap.has(category)) {
        categoryMap.set(category, [product]);
      } else {
        categoryMap.get(category).push(product);
      }
    }
    let result = [];
    if (categoryMap.size >= 4) {
      result = Array.from(categoryMap.values())
        .map((arr) => arr[0])
        .slice(0, 4);
    } else {
      const allProductsArray = Array.from(categoryMap.values()).flat();
      result = allProductsArray.slice(0, 4);
    }
    return result;
  }, [allProducts]);

  return (
    <div className="bg-background">
      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              New Products
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Discover our New Collections of premium products
            </p>
          </div>
          <Separator />
          {/* Products Grid */}
          <motion.div
            layout
            className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {uniqueCategoryProducts.map((product, index) => {
              const safeProduct = {
                ...product,
                title: product.title || "No Title",
                images: product.images?.length
                  ? product.images
                  : ["/placeholder.svg"],
                stock: product.stock ?? 0,
                price: product.price ?? 0,
                discount: product.discount ?? 0,
              };

              return (
                <motion.div
                  key={safeProduct._id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <ProductCard product={safeProduct} />
                </motion.div>
              );
            })}
            {uniqueCategoryProducts.length === 0 && (
              <div className="col-span-full flex flex-col items-center text-center">
                <div className="text-5xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold mb-2">
                  No products available
                </h3>
              </div>
            )}
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
};

export default ShopNow;
