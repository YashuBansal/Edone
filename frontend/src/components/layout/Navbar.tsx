import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, ShoppingCart, Menu, X, User, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import logoPng from "@/assets/logoblack.png";
import { getCart } from "@/lib/cart";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [cartItems, setCartItems] = useState<any[]>([]);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const isLoggedIn = !!token;

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchTerm)}`);
      setSearchTerm("");
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      setCartCount(cartItems.length);
      const handleStorage = () => setCartCount(cartItems.length);
      window.addEventListener("storage", handleStorage);
      return () => window.removeEventListener("storage", handleStorage);
    } else {
      setCartCount(0);
    }
  }, [isLoggedIn]);
  const API_URL = import.meta.env.VITE_API_URL;
  const API = `${API_URL}/categories`;

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(API, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        console.log("Categories API Response:", data);
        setCategories(Array.isArray(data) ? data : data.categories || []);
      } catch (err) {
        console.error("Fetch failed", err);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const userId = localStorage.getItem("userId");
        if (isLoggedIn && userId) {
          const cart = await getCart(userId);
          setCartItems(cart.items || []);
          setCartCount(cart.items?.length || 0);
        } else {
          setCartItems([]);
          setCartCount(0);
        }
      } catch (err) {
        console.error("❌ Failed to fetch cart:", err);
      }
    };

    fetchCart();

    const handleStorage = () => fetchCart();
    window.addEventListener("storage", handleStorage);

    return () => window.removeEventListener("storage", handleStorage);
  }, [isLoggedIn]);

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border shadow-card">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent"
            >
              <img src={logoPng} alt="Logo" className="h-6 w-auto" />
            </motion.div>
          </Link>

          {/* Desktop Search Bar */}
          <form
            onSubmit={handleSearch}
            className="hidden md:flex flex-1 max-w-md mx-8"
          >
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 rounded-3xl border-border focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </form>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="relative group">
              <Button onClick={() => navigate("/")} variant="ghost" className="hover:bg-primary">
                Home
              </Button>
              </div>
            {/* Categories Dropdown */}
            <div className="relative group">
              <Button variant="ghost" className="hover:bg-primary">
                Categories
              </Button>
              <div className="absolute top-full left-0 mt-2 w-48 bg-popover border border-border rounded-2xl shadow-card-hover opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                <div className="py-2">
                  {categories.length > 0 ? (
                    categories.map((cat) => (
                      <Link
                        key={cat._id}
                        to={`/categories/${cat._id}`}
                        className="block px-4 py-2 text-sm hover:bg-muted transition-colors"
                      >
                        {cat.title}
                      </Link>
                    ))
                  ) : (
                    <span className="block px-4 py-2 text-sm text-muted-foreground">
                      No Categories
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Wishlist */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link to="/wishlist">
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative hover:bg-primary"
                >
                  <Heart className="h-5 w-5" />
                </Button>
              </Link>
            </motion.div>

            {/* Profile */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link to={isLoggedIn ? "/profile" : "/login"}>
                <Button variant="ghost" size="icon" className="hover:bg-primary">
                  <User className="h-5 w-5" />
                </Button>
              </Link>
            </motion.div>

            {/* Cart */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link to="/cart">
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative hover:bg-primary"
                >
                  <ShoppingCart className="h-5 w-5" />
                  {isLoggedIn && cartCount > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center text-xs bg-primary text-primary-foreground">
                      {cartCount}
                    </Badge>
                  )}
                </Button>
              </Link>
            </motion.div>
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        <motion.div
          initial={false}
          animate={
            isOpen ? { height: "auto", opacity: 1 } : { height: 0, opacity: 0 }
          }
          className="md:hidden overflow-hidden"
        >
          <div className="py-4 space-y-4">
            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 rounded-3xl"
              />
            </form>

            {/* Mobile Categories */}
            <div className="space-y-2">
              <p className="font-semibold text-sm text-muted-foreground">
                Categories
              </p>
              {categories.length > 0 ? (
                categories.map((cat) => (
                  <Link
                    key={cat._id}
                    to={`/categories/${cat.title.toLowerCase()}`}
                    className="block py-2 text-sm hover:text-primary transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    {cat.title}
                  </Link>
                ))
              ) : (
                <span className="block py-2 text-sm text-muted-foreground">
                  No Categories
                </span>
              )}
            </div>

            {/* Mobile Actions */}
            <div className="flex items-center space-x-4 pt-4 border-t border-border">
              <Link to="/wishlist" className="flex items-center space-x-2">
                <Heart className="h-5 w-5" />
                <span className="text-sm">Wishlist</span>
              </Link>
              <Link
                to={isLoggedIn ? "/profile" : "/login"}
                className="flex items-center space-x-2"
              >
                <User className="h-5 w-5" />
                <span className="text-sm">
                  {isLoggedIn ? "Profile" : "Login"}
                </span>
              </Link>
              <Link to="/cart" className="flex items-center space-x-2">
                <ShoppingCart className="h-5 w-5" />
                <span className="text-sm">
                  Cart {isLoggedIn && `(${cartCount})`}
                </span>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </nav>
  );
}
