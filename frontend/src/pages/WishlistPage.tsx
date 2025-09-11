import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ProductCard } from "@/components/product/ProductCard";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingBag, Trash2 } from "lucide-react";
const API_URL = import.meta.env.VITE_API_URL;
const API = `${API_URL}/wishlist`;

const WishlistPage = () => {
  const [wishlistProducts, setWishlistProducts] = useState<any[]>([]);
  const userId = localStorage.getItem("userId");

  const fetchWishlist = async () => {
    if (!userId) return;
    try {
      const res = await fetch(`${API}/${userId}`);
      const data = await res.json();
      const products = data.products.map((p: any) => ({
        _id: p.productId._id,
        title: p.productId.title,
        price: p.productId.price,
        originalPrice: p.productId.price,
        images: p.productId.images,
        discount: p.productId.discount,
        stock: p.productId.stock,
        colors: p.productId.colors,
        sizes: p.productId.sizes,
        isNew: p.productId.isNew,
        isFeatured: p.productId.isFeatured,
        rating: p.productId.rating || 0,
        reviews: p.productId.reviews || 0,
      }));
      setWishlistProducts(products);
    } catch (err) {
      console.error("Failed to fetch wishlist", err);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleAddToCart = async () => {
  if (wishlistProducts.length === 0) return;
  const userId = localStorage.getItem("userId");
  if (!userId) {
    alert("Please log in to add items to your cart.");
    return;
  }

  // Separate in-stock and out-of-stock products
  const inStockProducts = wishlistProducts.filter(p => p.stock > 0);
  const outOfStockProducts = wishlistProducts.filter(p => p.stock <= 0);

  if (inStockProducts.length === 0) {
    alert("No products are in stock to add to cart.");
    return;
  }

  try {
    await Promise.all(
      inStockProducts.map(product =>
        fetch(`${API_URL}/cart/${userId}/add`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ product }), // send full product object
        })
      )
    );

    alert(`${inStockProducts.length} item(s) added to cart.${outOfStockProducts.length > 0 ? ` ${outOfStockProducts.length} item(s) is out of stock.` : ""}`);
    window.dispatchEvent(new Event("storage"));
  } catch (err) {
    console.error("Failed to add all to cart", err);
    alert("Failed to add items to cart.");
  }
};

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
          <div className="flex items-center justify-between">
            <div >
              <h1 className="text-3xl font-bold flex items-center">
                <Heart className="w-8 h-8 mr-3 text-red-500" /> My Wishlist
              </h1>
              <p className="text-muted-foreground mt-2">
                {wishlistProducts.length} items saved for later
              </p>
            </div>
            {wishlistProducts.length > 0 && (
              <Button
                onClick={handleAddToCart}
                className="gap-2">
                <ShoppingBag className="w-4 h-4" /> Add All to Cart
              </Button>
            )}
          </div>

          {wishlistProducts.length > 0 ? (
            <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {wishlistProducts.map((product) => (
                <motion.div key={product._id} className="relative">
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="text-center py-16">
              <Heart className="w-24 h-24 mx-auto text-muted-foreground/30 mb-6" />
              <h2 className="text-2xl font-semibold mb-4">Your wishlist is empty</h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Save items you love by clicking the heart icon on any product.
                Your wishlist will appear here.
              </p>
              <Link to="/shop">
              <Button size="lg" className="gap-2">
                <ShoppingBag className="w-5 h-5" /> Start Shopping
              </Button>
              </Link>
            </div>
          )}
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default WishlistPage;
