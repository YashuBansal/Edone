  import { useState, useEffect } from "react";
  import { motion } from "framer-motion";
  import { ArrowLeft, Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
  import { Link, useNavigate } from "react-router-dom";
  import { Navbar } from "@/components/layout/Navbar";
  import { Footer } from "@/components/layout/Footer";
  import { Button } from "@/components/ui/button";
  import { Card, CardContent } from "@/components/ui/card";
  import { Separator } from "@/components/ui/separator";
  import { getCart, updateQuantity, removeFromCart } from "@/lib/cart";

  export default function CartPage() {
    const [cartItems, setCartItems] = useState<any[]>([]);
    const [product, setProduct] = useState<any>(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [selectedColor, setSelectedColor] = useState<string>("");
    const [selectedSize, setSelectedSize] = useState<string>("");
    const [userId, setUserId] = useState<string | null>(null);
    const navigate = useNavigate();

    // ✅ Load cart whenever login/userId changes
    useEffect(() => {
      const loggedIn = localStorage.getItem("isLoggedIn") === "true";
      const uid = localStorage.getItem("userId");

      setIsLoggedIn(loggedIn);
      setUserId(uid);

      if (loggedIn && uid) {
        getCart(uid)
          .then((cart) => setCartItems(cart.items || []))
          .catch(() => setCartItems([]));
      } else {
        setCartItems([]); // ✅ clear on logout
      }
    }, [localStorage.getItem("isLoggedIn"), localStorage.getItem("userId")]);

    useEffect(() => {
      if (product?.colors?.length) {
        setSelectedColor(product.colors[0]);
      }
      if (product?.sizes?.length) {
        setSelectedSize(product.sizes[0]);
      }
    }, [product]);

    const handleUpdateQuantity = async (
      productId: string,
      selectedColor: string,
      selectedSize: string,
      change: number
    ) => {
      if (!userId) return;
      const product = cartItems.find(
        (p) => p.productId === productId && p.selectedColor === selectedColor && p.selectedSize === selectedSize
      );
      if (!product) return;

      const newQty = Math.max(
        1,
        Math.min(product.quantity + change, product.stock || Infinity)
      );

      const updatedCart = await updateQuantity(
        userId,
        productId,
        selectedColor,
        selectedSize,
        newQty
      );
      setCartItems(updatedCart.items || []);

      localStorage.setItem("cartUpdated", Date.now().toString());
    };

    const handleRemoveItem = async (productId: string, selectedColor: string, selectedSize: string) => {
      if (!userId) return;
      const updatedCart = await removeFromCart(userId, productId, selectedColor, selectedSize);
      setCartItems(updatedCart.items || []);

      localStorage.setItem("cartUpdated", Date.now().toString());
    };

    const subtotal = cartItems.reduce(
      (sum, product) =>
        sum +
        product.price * (1 - product.discount / 100) * (product.quantity ?? 1),
      0
    );
    const shipping = subtotal > 100 ? 0 : 15;
    const tax = subtotal * 0.08;
    const total = subtotal + shipping + tax;

    // 🚫 Not logged in
    if (!isLoggedIn) {
      return (
        <div className="min-h-screen bg-background">
          <Navbar />
          <main className="py-16 text-center">
            <div className="container mx-auto px-4 text-center">
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md mx-auto space-y-6"
              >
                <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto">
                  <ShoppingBag className="h-12 w-12 text-muted-foreground" />
                </div>
                <h1 className="text-3xl font-bold">Please Login</h1>
                <p className="text-muted-foreground">
                  You need to login or signup to view your cart.
                </p>
                <div className="flex justify-center gap-4">
                  <Button
                    size="lg"
                    className="bg-primary hover:bg-primary-glow rounded-3xl px-8"
                    onClick={() => navigate("/login")}
                  >
                    Login
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="rounded-3xl px-8"
                    onClick={() => navigate("/signup")}
                  >
                    Signup
                  </Button>
                </div>
              </motion.div>
            </div>
          </main>
          <Footer />
        </div>
      );
    }

    // 🛒 Empty cart
    if (cartItems.length === 0) {
      return (
        <div className="min-h-screen bg-background">
          <Navbar />
          <main className="py-16 text-center">
            <div className="container mx-auto px-4 text-center">
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md mx-auto space-y-6"
              >
                <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto">
                  <ShoppingBag className="h-12 w-12 text-muted-foreground" />
                </div>
                <h1 className="text-3xl font-bold">Your cart is empty</h1>
                <p className="text-muted-foreground pb-8">
                  Looks like you haven't added any items to your cart yet.
                </p>
                <Link to="/shop">
                  <Button
                    size="lg"
                    className="bg-primary hover:bg-primary-glow rounded-3xl px-8"
                  >
                    Continue Shopping
                  </Button>
                </Link>
              </motion.div>
            </div>
          </main>
          <Footer />
        </div>
      );
    }

    // 🛍️ Logged in + cart has items → show normal cart
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="py-8">
          <div className="container mx-auto px-4">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col md:flex-row md:items-center md:justify-between mb-8"
            >
              <div className="space-x-4">
                <Link to="/shop">
                  <Button variant="ghost" className="hover:bg-muted">
                    <ArrowLeft className="h-4 w-4 mr-2" /> Continue Shopping
                  </Button>
                </Link>
              </div>

              <div className="flex items-center justify-between space-x-4">
                <h1 className="text-3xl font-bold">Shopping Cart</h1>
                <p className="text-muted-foreground">
                  {cartItems.length}{" "}
                  {cartItems.length === 1 ? "product" : "items"}
                </p>
              </div>
            </motion.div>

            {/* Cart Items */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                {cartItems.map((product, index) => (
                  <motion.div
                    key={`${product.productId}-${product.selectedColor || index}-${product.selectedSize || index}`}
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    layout
                  >
                    <Card className="bg-gradient-card shadow-card border-border/50">
                      <CardContent className="p-4 flex flex-col space-y-3">
                        <div className="flex space-x-6">
                          <div className="w-28 h-28 rounded-2xl overflow-hidden bg-muted flex-shrink-0">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 space-y-1">
                            <Link to={`/product/${product.productId}`}>
                              <h3 className="font-semibold text-md sm:text-lg hover:text-primary">
                                {product.name}
                              </h3>
                            </Link>
                            <p className="text-lg sm:text-xl font-bold text-price">
                              ₹
                              {(
                                product.price *
                                (1 - product.discount / 100)
                              ).toFixed(2)}
                            </p>
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">Color:</span>
                              <div
                                className="w-5 h-5 rounded-full border-2"
                                style={{
                                  backgroundColor:
                                    product.selectedColor?.toLowerCase(),
                                }}
                              />
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">Size:</span>
                              <div
                                className="text-xs px-1 md:px-2 rounded-full border-2"
                              >
                              {product.selectedSize || "N/A"}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2">
                          <div className="flex space-x-2">
                            <div className="flex items-center border border-border rounded-2xl">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  handleUpdateQuantity(
                                    product.productId,
                                    product.selectedColor,
                                    product.selectedSize,
                                    -1
                                  )
                                }
                                disabled={product.quantity <= 1}
                                className="rounded-l-2xl"
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              <span className="px-3 py-2 min-w-[2rem] text-center">
                                {product.quantity}
                              </span>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  handleUpdateQuantity(
                                    product.productId,
                                    product.selectedColor,
                                    product.selectedSize,
                                    1
                                  )
                                }
                                disabled={product.quantity >= product.stock}
                                className="rounded-r-2xl"
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveItem(product.productId, product.selectedColor, product.selectedSize)}
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="sm:text-right min-w-[100px] text-lg font-bold">
                            ₹
                            {(
                              product.price *
                              (1 - product.discount / 100) *
                              product.quantity
                            ).toFixed(2)}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* Order Summary */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-6"
              >
                <Card className="bg-gradient-card shadow-card border-border/50 sticky top-8">
                  <CardContent className="p-6 space-y-6">
                    <h2 className="text-xl font-bold">Order Summary</h2>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>₹{subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Shipping</span>
                        <span className={shipping === 0 ? "text-success" : ""}>
                          {shipping === 0 ? "FREE" : `₹${shipping.toFixed(2)}`}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tax</span>
                        <span>₹{tax.toFixed(2)}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-bold text-lg">
                        <span>Total</span>
                        <span>₹{total.toFixed(2)}</span>
                      </div>
                    </div>
                    {shipping === 0 && (
                      <div className="p-4 bg-success/10 border border-success/20 rounded-2xl">
                        <p className="text-sm text-success font-medium">
                          🎉 Congratulations! You qualify for free shipping.
                        </p>
                      </div>
                    )}
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Link to="/checkout">
                        <Button
                          size="lg"
                          className="w-full bg-primary hover:bg-primary-glow text-primary-foreground rounded-3xl py-6 text-lg font-semibold shadow-primary"
                        >
                          Proceed to Checkout
                        </Button>
                      </Link>
                    </motion.div>
                    <div className="text-center text-sm text-muted-foreground">
                      <p>Secure checkout powered by SSL encryption</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
