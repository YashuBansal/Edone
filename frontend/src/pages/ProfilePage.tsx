import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Package, Heart, Settings, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const ProfilePage = () => {
  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [wishlist, setWishlist] = useState<any[]>([]);
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      navigate("/login");
    } else {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);

      // Fetch Orders
      fetch(`${API_URL}/orders/${parsedUser.id}`)
        .then((res) => res.json())
        .then((data) => {
          console.log("📦 Orders fetched from backend:", data);
          setOrders(data);
        })
        .catch((err) => console.error("Failed to fetch orders:", err));

      // Fetch Wishlist (transform like WishlistPage)
      fetch(`${API_URL}/wishlist/${parsedUser.id}`)
        .then((res) => res.json())
        .then((data) => {
          console.log("💖 Wishlist fetched from backend:", data);
          if (data.products) {
            const products = data.products.map((p: any) => ({
              _id: p.productId._id,
              title: p.productId.title,
              price: p.productId.price,
              images: p.productId.images,
            }));
            setWishlist(products);
          } else {
            setWishlist([]);
          }
        })
        .catch((err) => console.error("Failed to fetch wishlist:", err));
    }
  }, [navigate]);

  const handleCancelOrder = async (orderId: string) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;

    try {
      const res = await fetch(`${API_URL}/orders/${orderId}`, {
        method: "PUT",
      });
      const data = await res.json();
      alert(data.message);

      // ✅ Update only the cancelled order
      setOrders((prev) =>
        prev.map((order) =>
          order._id === orderId ? { ...order, status: "Cancelled" } : order
        )
      );
    } catch (err) {
      console.error("Cancel order failed:", err);
      alert("Failed to cancel order ❌");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.setItem("isLoggedIn", "false");
    navigate("/");
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          {/* Profile Header */}
          <div className="flex items-center space-x-4 mb-8">
            <div className="w-20 h-20 rounded-full bg-gradient-to-r from-primary to-primary-glow flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{user.userName}</h1>
              <p className="text-muted-foreground">{user.email}</p>
            </div>
          </div>

          {/* Tabs Section */}
          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="orders">Orders</TabsTrigger>
              <TabsTrigger value="wishlist">Wishlist</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            {/* Profile Info */}
            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Username</label>
                      <Input defaultValue={user.userName} />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Email</label>
                      <Input defaultValue={user.email} disabled />
                    </div>
                  </div>
                  <Button>Update Profile</Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Orders */}
            <TabsContent value="orders">
              <Card>
                <CardHeader>
                  <CardTitle>Order History</CardTitle>
                </CardHeader>
                <CardContent>
                  {orders.length > 0 ? (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <div key={order._id} className="p-4 border rounded-lg">
                          <p className="font-semibold">Order ID: {order._id}</p>
                          <p className="text-sm text-muted-foreground">
                            Placed on{" "}
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                          <ul className="mt-2 space-y-1">
                            {order.items.map((item: any, idx: number) => (
                              <li key={idx} className="flex justify-between">
                                <span>
                                  {item.title || item.name} × {item.quantity}
                                </span>
                                <span>₹{item.price}</span>
                              </li>
                            ))}
                          </ul>
                          <p className="mt-2 font-medium">
                            Total: ₹{order.total.toFixed(2)}
                          </p>
                          <p className="text-sm">Status: {order.status}</p>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="mt-2"
                            onClick={() => handleCancelOrder(order._id)}
                            disabled={
                              order.status === "Cancelled" ||
                              order.status === "Delivered"
                            }
                          >
                            {order.status === "Cancelled"
                              ? "Order Cancelled"
                              : order.status === "Delivered"
                              ? "Delivered"
                              : "Cancel Order"}
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">
                      You have no orders yet.
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Wishlist */}
            <TabsContent value="wishlist">
              <Card>
                <CardHeader>
                  <CardTitle>My Wishlist</CardTitle>
                </CardHeader>
                <CardContent>
                  {wishlist.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {wishlist.map((product: any) => (
                        <div
                          key={product._id}
                          className="p-4 border rounded-lg shadow-sm flex flex-col"
                        >
                          <h3 className="font-semibold">{product.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            ₹{product.price}
                          </p>
                          <Button
                            className="mt-2"
                            onClick={() => navigate(`/product/${product._id}`)}
                          >
                            View Product
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">
                      Your wishlist is empty. Start adding products you love!
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings */}
            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="outline" className="w-full justify-start">
                    <Settings className="w-4 h-4 mr-2" />
                    Preferences
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Package className="w-4 h-4 mr-2" />
                    Shipping Addresses
                  </Button>
                  <Button
                    variant="destructive"
                    className="w-full justify-start"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default ProfilePage;
