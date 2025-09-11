import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Heart, Eye, ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { addToCart } from "@/lib/cart";

interface Product {
  _id: string;
  title: string;
  price: number;
  originalPrice?: number;
  images: string[];
  discount?: number;
  stock: number;
  sizes: string[];
  colors: string[];
  rating?: number;
  reviews?: number;
  isNew?: boolean;
  isFeatured?: boolean;
}

interface ProductCardProps {
  product: Product;
  className?: string;
}
const API_URL = import.meta.env.VITE_API_URL;
const API = `${API_URL}/wishlist`;

export function ProductCard({ product, className = "" }: ProductCardProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [isWishlisted, setIsWishlisted] = useState(false);
  const userId = localStorage.getItem("userId");

  // Check if product is in wishlist
  useEffect(() => {
    if (!userId) return;
    fetch(`${API}/${userId}`)
      .then((res) => res.json())
      .then((data) => {
        const exists = data.products.some(
          (p: any) => p.productId._id === product._id
        );
        setIsWishlisted(exists);
      })
      .catch((err) => console.error(err));
  }, [userId, product._id]);

  useEffect(() => {
    if (product.colors?.length > 0 && !selectedColor) {
      setSelectedColor(product.colors[0]);
    }
    if (product.sizes?.length > 0 && !selectedSize) {
      setSelectedSize(product.sizes[0]);
    }
  }, [product, selectedColor, selectedSize]);

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
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`group relative ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="h-full overflow-hidden bg-gradient-card shadow-card hover:shadow-card-hover border-border/50 transition-all duration-300">
        <div className="relative overflow-hidden">
          {/* Product Image */}
          <div className="aspect-square overflow-hidden bg-gradient-to-br from-muted to-muted/50">
            <Link
              to={`/product/${product._id}`}
              className="pointer-events-auto "
            >
              <motion.img
                src={product.images?.[0] || "/placeholder.svg"}
                alt={product.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                whileHover={{ scale: 1.1 }}
              />
            </Link>
          </div>

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2 ">
            {product.isNew && (
              <Badge className="bg-success text-success-foreground text-xs">
                New
              </Badge>
            )}
            {product.discount && (
              <Badge className="bg-discount text-destructive-foreground flex justify-center text-xs">
                -{product.discount}%
              </Badge>
            )}
            {!product.stock && (
              <Badge
                variant="secondary"
                className="hidden lg:block bg-out-of-stock text-destructive-foreground text-xs"
              >
                Out of Stock
              </Badge>
            )}
          </div>

          {/* Action Buttons */}
          <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all duration-300 transform translate-x-0 lg:translate-x-2 lg:group-hover:translate-x-0">
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button
                size="icon"
                variant={isWishlisted ? "destructive" : "secondary"}
                className="h-6 w-6 sm:h-10 sm:w-10 rounded-full bg-background/80 bg-background/80 hover:bg-background shadow-card backdrop-blur-sm"
                onClick={toggleWishlist}
              >
                <Heart
                  className={`h-4 w-4 ${
                    isWishlisted ? "fill-red-500 text-red-500" : ""
                  }`}
                />
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Link to={`/product/${product._id}`}>
                <Button
                  size="icon"
                  variant="secondary"
                  className="h-10 w-10 rounded-full bg-background/80 hover:bg-background shadow-card backdrop-blur-sm hidden lg:flex"
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </Link>
            </motion.div>
          </div>

          {/* Quick Add to Cart */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all duration-300 transform translate-y-0 lg:translate-y-4 lg:group-hover:translate-y-0 hidden lg:block">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                className="w-full bg-primary hover:bg-primary-glow text-primary-foreground rounded-2xl shadow-primary"
                disabled={!product.stock}
                onClick={handleAddToCart}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                {product.stock ? "Add to Cart" : "Out of Stock"}
              </Button>
            </motion.div>
          </div>
        </div>

        <CardContent className="p-2 sm:p-4 space-y-1 sm:space-y-3">
          <Link to={`/product/${product._id}`}>
            <h3 className="text-sm sm:text-lg font-semibold text-foreground hover:text-primary transition-colors line-clamp-2 leading-tight">
              {product.title}
            </h3>
          </Link>
          <div className="flex items-center ">
            <span className="font-medium mr-1 md:mr-3 ">Colors:</span>
            {product.colors.map((color: string, index: number) => (
              <button
                key={index}
                onClick={() => setSelectedColor(color)}
                style={{ backgroundColor: color.toLowerCase() }}
                className={`w-4 md:w-5 h-4 md:h-5 rounded-full border-2 border-[#90D5FF] transition-transform transform mr-2 ${
                  selectedColor === color ? "border-black" : "border-gray-300"
                }`}
                title={color}
              ></button>
            ))}
          </div>

          <div className="flex items-center ">
            <span className="font-medium mr-1 md:mr-3 ">Sizes:</span>
            {product.sizes.map((size: string, index: number) => (
              <button
                key={index}
                onClick={() => setSelectedSize(size)}
                style={{ backgroundColor: size.toLowerCase() }}
                className={`text-xs px-1 md:px-2 rounded-full border-2 border-[#90D5FF] transition-transform transform mr-2 ${
                  selectedSize === size ? "border-black" : "border-gray-300"
                }`}
                title={size}
              >{size}</button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2">
              <span className="text-sm sm:text-lg lg:text-xl font-bold text-price">
                ₹
                {(product.price * (1 - (product.discount || 0) / 100)).toFixed(
                  2
                )}
              </span>
              {product.discount && (
                <span className="text-xs sm:text-sm text-muted-foreground line-through items-start">
                  ₹{product.price.toFixed(2)}
                </span>
              )}
            </div>
            <Badge
              variant="outline"
              className={`text-xs self-start sm:self-center mt-3 sm:mt-0 ${
                product.stock > 0
                  ? "border-success/50 text-success"
                  : "border-destructive/50 text-destructive"
              }`}
            >
              {product.stock > 0 ? "In Stock" : "No Stock"}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
