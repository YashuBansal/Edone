import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Heart,
  Share2,
  ShoppingCart,
  Star,
  Minus,
  Plus,
  Shield,
  Truck,
  RotateCcw,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { addToCart } from "@/lib/cart";

export default function ProductPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedImage, setSelectedImage] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [loading, setLoading] = useState(true);

  const userId = localStorage.getItem("userId");
  const API_URL = import.meta.env.VITE_API_URL;
  const API = `${API_URL}/api/wishlist`;

  // 🔥 Fetch product from backend
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `${API_URL}/product/approved/public/${id}`
        );
        const data = await res.json();
        setProduct(data);
      } catch (err) {
        console.error("Error fetching product:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProduct();
  }, [id]);

  // ✅ Check if product already in wishlist
  useEffect(() => {
    const checkWishlist = async () => {
      if (!userId || !product?._id) return;
      try {
        const res = await fetch(`${API}/${userId}`);
        const data = await res.json();

        if (Array.isArray(data?.wishlist)) {
          const exists = data.wishlist.some(
            (item: any) =>
              item._id === product._id || item.productId === product._id
          );
          setIsWishlisted(exists);
        }
      } catch (err) {
        console.error("Failed to fetch wishlist:", err);
      }
    };
    if (product) checkWishlist();

    if (product?.colors?.length) {
    setSelectedColor(product.colors[0]);
  }
  }, [userId, product]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading product...</p>
      </div>
    );

  if (!product)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Product not found</p>
      </div>
    );

  const handleQuantityChange = (change: number) => {
    setQuantity((prev) =>
      Math.max(1, Math.min(prev + change, product.stock || 1))
    );
  };

  // 📲 Share to WhatsApp
  const handleShare = () => {
    const url = window.location.href;
    const message = `Check out this product: ${product.title} - ₹${product.price}\n${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank");
  };

  // 🛒 Add to Cart
  const handleAddToCart = async () => {
    if (!userId) {
      alert("Please log in to add items to your cart.");
      return;
    }
    await addToCart(userId, {
    ...product,
    quantity,
    selectedColor,
    selectedSize,
  });
    alert(`${quantity} ${product.title} item(s) added to cart!`);
    window.dispatchEvent(new Event("storage"));
  };

  // ❤️ Toggle Wishlist
  const toggleWishlist = async () => {
    if (!userId) {
      alert("Please log in to manage your wishlist.");
      return;
    }

    try {
      if (!isWishlisted) {
        await fetch(`${API}/add`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, productId: product._id }),
        });
        setIsWishlisted(true);
      } else {
        await fetch(`${API}/${userId}/${product._id}`, { method: "DELETE" });
        setIsWishlisted(false);
      }
    } catch (err) {
      console.error("Failed to update wishlist", err);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="py-8">
        <div className="container mx-auto px-4">
          {/* Breadcrumb */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center space-x-2 text-sm text-muted-foreground mb-8"
          >
            <Link to="/" className="hover:text-primary transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-foreground">{product.title}</span>
          </motion.div>

          {/* Back Button */}
          <Link to="/shop">
            <Button variant="ghost" className="hover:bg-muted mb-8">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Products
            </Button>
          </Link>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Product Images */}
            <div className="space-y-4">
              <div className="aspect-square overflow-hidden rounded-3xl bg-gradient-to-br from-muted to-muted/50 shadow-card">
                <motion.img
                  key={selectedImage}
                  src={product.images?.[selectedImage] || "/placeholder.svg"}
                  alt={product.title}
                  className="w-full h-full object-cover"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                />
              </div>

              <div className="flex space-x-4">
                {product.images?.map((img: string, index: number) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square w-20 overflow-hidden rounded-2xl border-2 ${
                      selectedImage === index
                        ? "border-primary"
                        : "border-border"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${product.title} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Product Details */}
            <div className="space-y-6">
              <div className="flex items-start justify-between">
                <h1 className="text-3xl lg:text-4xl font-bold text-foreground">
                  {product.title}
                </h1>
                <div className="flex space-x-2">
                  {/* Wishlist */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleWishlist}
                    className="hover:bg-muted"
                  >
                    <Heart
                      className={`h-5 w-5 transition-colors ${
                        isWishlisted
                          ? "fill-red-500 text-red-500"
                          : "text-muted-foreground"
                      }`}
                    />
                  </Button>
                  {/* Share */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleShare}
                    className="hover:bg-muted"
                  >
                    <Share2 className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.floor(product.rating || 0)
                          ? "text-warning fill-warning"
                          : "text-muted-foreground"
                      }`}
                    />
                  ))}
                  <span className="ml-2 text-sm font-medium">
                    {product.rating || 0}
                  </span>
                </div>
                <Separator orientation="vertical" className="h-4" />
                <span className="text-sm text-muted-foreground">
                  {product.reviews || 0} reviews
                </span>
              </div>

              {/* Price */}
              <div className="space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4">
                  {product.discount && product.discount > 0 ? (
                    <>
                      <span className="text-3xl lg:text-4xl font-bold text-price">
                        ₹
                        {(product.price * (1 - product.discount / 100)).toFixed(
                          2
                        )}
                      </span>
                      <span className="text-lg lg:text-xl text-muted-foreground line-through">
                        ₹{product.price.toFixed(2)}
                      </span>
                      <Badge className="bg-discount text-destructive-foreground self-start md:self-center">
                        Save {product.discount}%
                      </Badge>
                    </>
                  ) : (
                    <span className="text-4xl font-bold text-price">
                      ₹{product.price.toFixed(2)}
                    </span>
                  )}
                </div>
                <Badge
                  variant="outline"
                  className={`${
                    product.stock > 0
                      ? "border-success/50 text-success"
                      : "border-destructive/50 text-destructive"
                  }`}
                >
                  {product.stock > 0
                    ? `${product.stock} in stock`
                    : "Out of Stock"}
                </Badge>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold">Description</h3>
                <p className="text-muted-foreground">{product.description}</p>
              </div>

              {/* Quantity & Add to Cart */}
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <span className="font-medium">Quantity:</span>
                  <div className="flex items-center border border-border rounded-2xl">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleQuantityChange(-1)}
                      disabled={quantity <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="px-4">{quantity}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleQuantityChange(1)}
                      disabled={quantity >= (product.stock || 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center ">
                  <span className="font-medium mr-8 ">Colors:</span>
                  {product.colors.map((color: string, index: number) => (
                    <button
                      key={index}
                      onClick={() => setSelectedColor(color)}
                      style={{ backgroundColor: color.toLowerCase() }}
                      className={`w-8 h-8 rounded-full border-2 transition-transform transform mr-3 ${
                        selectedColor === color
                          ? "border-black"
                          : "border-gray-300"
                      }`}
                    >
                    </button>
                  ))}
                </div>
                <div className="flex items-center ">
                  <span className="font-medium mr-8 ">Sizes:</span>
                  {product.sizes.map((size: string, index: number) => (
                    <button
                      key={index}
                      onClick={() => setSelectedSize(size)}
                      style={{ backgroundColor: size.toLowerCase() }}
                      className={`w-8 h-8 rounded-full border-2 transition-transform transform mr-3 ${
                        selectedSize === size
                          ? "border-black"
                          : "border-gray-300"
                      }`}
                    >
                    </button>
                  ))}
                </div>
                <Button
                  size="lg"
                  className="w-full bg-primary text-primary-foreground rounded-3xl py-6 text-lg font-semibold"
                  disabled={product.stock <= 0}
                  onClick={handleAddToCart}
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Add to Cart - ₹
                  {(
                    product.price *
                    (1 - product.discount / 100) *
                    quantity
                  ).toFixed(2)}
                </Button>
              </div>

              {/* Features */}
              {product.features?.length > 0 && (
                <Card className="bg-gradient-card shadow-card border-border/50">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Key Features</h3>
                    <ul className="space-y-2">
                      {product.features.map((f: string, i: number) => (
                        <li
                          key={i}
                          className="flex items-center space-x-2 text-sm"
                        >
                          <div className="w-2 h-2 bg-primary rounded-full" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col items-center p-4 bg-muted/50 rounded-2xl">
                  <Shield className="h-9 w-8 text-primary" />
                  <span className="text-xs font-medium">Secure Payment</span>
                </div>
                <div className="flex flex-col items-center p-4 bg-muted/50 rounded-2xl">
                  <Truck className="h-9 w-8 text-primary" />
                  <span className="text-xs font-medium">Fast Shipping</span>
                </div>
                <div className="flex flex-col items-center p-4 bg-muted/50 rounded-2xl">
                  <RotateCcw className="h-9 w-8 text-primary" />
                  <span className="text-xs font-medium">Easy Returns</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
