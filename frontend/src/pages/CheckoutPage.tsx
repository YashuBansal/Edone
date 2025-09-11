import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  MapPin,
  CreditCard,
  Truck,
  Building2,
  Smartphone,
  Shield,
  Trash2,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { getCart } from "@/lib/cart";

const steps = [
  { id: 1, title: "Address", icon: MapPin },
  { id: 2, title: "Payment", icon: CreditCard },
];

const addressSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  address: z.string().min(5, "Please enter your full address"),
  city: z.string().min(2, "Please enter your city"),
  state: z.string().min(2, "Please enter your state"),
  zipCode: z.string().min(5, "Please enter a valid ZIP code"),
  saveAddress: z.boolean().optional(),
});

export default function CheckoutPage() {
  const navigate = useNavigate();
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login", { state: { from: "/checkout" } });
    }
  }, [navigate]);

  const [currentStep, setCurrentStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [isProcessing, setIsProcessing] = useState(false);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const API_URL = import.meta.env.VITE_API_URL;
  const API = `${API_URL}/address`;
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchCart = async () => {
      try {
        if (userId) {
          const cart = await getCart(userId);
          setCartItems(cart.items || []);
        }
      } catch (err) {
        console.error("Failed to fetch cart", err);
      }
    };
    fetchCart();
  }, []);

  useEffect(() => {
    const fetchSavedAddresses = async () => {
      if (!userId) return;
      const res = await fetch(`${API}/${userId}`);
      const data = await res.json();
      setSavedAddresses(data.addresses || []);
    };

    fetchSavedAddresses();
  }, []);

  const form = useForm({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      saveAddress: false,
    },
  });

  const subtotal = cartItems.reduce(
    (sum, product) =>
      sum +
      product.price * (1 - product.discount / 100) * (product.quantity ?? 1),
    0
  );
  const shipping = subtotal > 100 ? 0 : 15;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  const handleAddressSubmit = async (data: any) => {
    console.log("Address data:", data);

    if (data.saveAddress) {
      const alreadySaved = savedAddresses.some(
        (addr) =>
          addr.firstName === data.firstName &&
          addr.lastName === data.lastName &&
          addr.email === data.email &&
          addr.phone === data.phone &&
          addr.address === data.address &&
          addr.city === data.city &&
          addr.state === data.state &&
          addr.zipCode === data.zipCode
      );

      if (!alreadySaved) {
        await fetch(`${API}/add`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, address: data }),
        });

        // Refresh saved addresses
        const res = await fetch(`${API}/${userId}`);
        const updated = await res.json();
        setSavedAddresses(updated.addresses);
      }
    }

    setCurrentStep(2);
  };

  const paymentMethods = [
    {
      id: "cod",
      title: "Cash on Delivery",
      description: "Pay when you receive your order",
      icon: Truck,
      fee: 0,
    },
    {
      id: "others",
      title: "Credit/Debit Card, Net Banking, UPI",
      description: "Pay securely with your Card, Bank Account or UPI apps",
      icon: Building2,
      fee: 0,
    },
  ];

  const handleRazorpay = async () => {
    setIsProcessing(true);
    try {
      const order = await fetch(`${API_URL}/payment/order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: total, currency: "INR" }),
      }).then((res) => res.json());

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "Paglu",
        order_id: order.id,
        handler: async function (response) {
          // 3. Verify payment on backend
          const verifyResponse = await fetch(
            `${API_URL}/payment/verify`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(response),
            }
          );

          const result = await verifyResponse.json();

          console.log("thje hjfse", result);
          if (result.success) {
            await fetch(`${API_URL}/orders`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                userId,
                items: cartItems,
                total,
                paymentId: response.razorpay_payment_id,
                address: form.getValues(), // get the address details from form
              }),
            });

            alert("Payment Successful ✅");
            setIsProcessing(false);
            navigate("/profile");
          } else {
            alert("Payment Verification Failed ❌");
          }
        },

        prefill: {
          name: "John Doe",
          email: "john@example.com",
          contact: "+91 98765 43210",
        },
        theme: { color: "#F37254" },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err) {
      setIsProcessing(false);
      console.error("something went wrong ", err);
    }
  };

  const handleCOD = async () => {
    setIsProcessing(true);
    try {
      await fetch(`${API_URL}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          items: cartItems,
          total,
          paymentId: "COD", // mark COD instead of payment gateway ID
          address: form.getValues(),
        }),
      });

      alert("Order placed successfully (Cash on Delivery) ✅");
      setIsProcessing(false);
      navigate("/profile");
    } catch (err) {
      console.error("COD order error:", err);
      setIsProcessing(false);
      alert("Failed to place COD order ❌");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="py-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-8"
          >
            <div className="flex items-center space-x-4">
              <Link to="/cart">
                <Button variant="ghost" className="hover:bg-muted">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Cart
                </Button>
              </Link>
              <h1 className="text-3xl font-bold">Checkout</h1>
            </div>
          </motion.div>

          {/* Progress Steps */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <div className="flex items-center justify-center space-x-0">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isActive = currentStep === step.id;
                const isCompleted = currentStep > step.id;

                return (
                  <div key={step.id} className="flex items-center">
                    <div className="flex flex-col items-center space-y-2">
                      <div
                        className={`
                        w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300
                        ${
                          isCompleted
                            ? "bg-success border-success text-success-foreground"
                            : isActive
                            ? "bg-primary border-primary text-primary-foreground"
                            : "bg-background border-border text-muted-foreground"
                        }
                      `}
                      >
                        {isCompleted ? (
                          <Check className="h-5 w-5" />
                        ) : (
                          <Icon className="h-5 w-5" />
                        )}
                      </div>
                      <span
                        className={`text-sm font-medium ${
                          isActive || isCompleted
                            ? "text-foreground"
                            : "text-muted-foreground"
                        }`}
                      >
                        {step.title}
                      </span>
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        className={`w-16 h-0.5 mx-6 ${
                          isCompleted ? "bg-success" : "bg-border"
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <AnimatePresence mode="wait">
                {currentStep === 1 && (
                  <motion.div
                    key="address"
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                  >
                    <Card className="bg-gradient-card shadow-card border-border/50">
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <MapPin className="h-5 w-5" />
                          <span>Delivery Address</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Form {...form}>
                          <form
                            onSubmit={form.handleSubmit(handleAddressSubmit)}
                            className="space-y-6"
                          >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <FormField
                                control={form.control}
                                name="firstName"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>First Name</FormLabel>
                                    <FormControl>
                                      <Input
                                        placeholder="Enter first name"
                                        {...field}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name="lastName"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Last Name</FormLabel>
                                    <FormControl>
                                      <Input
                                        placeholder="Enter last name"
                                        {...field}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Email Address</FormLabel>
                                    <FormControl>
                                      <Input
                                        type="email"
                                        placeholder="Enter email address"
                                        {...field}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name="phone"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Phone Number</FormLabel>
                                    <FormControl>
                                      <Input
                                        placeholder="Enter phone number"
                                        {...field}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>

                            <FormField
                              control={form.control}
                              name="address"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Street Address</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="Enter your full address"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <FormField
                                control={form.control}
                                name="city"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>City</FormLabel>
                                    <FormControl>
                                      <Input
                                        placeholder="Enter city"
                                        {...field}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name="state"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>State</FormLabel>
                                    <FormControl>
                                      <Input
                                        placeholder="Enter state"
                                        {...field}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name="zipCode"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>ZIP Code</FormLabel>
                                    <FormControl>
                                      <Input
                                        placeholder="Enter ZIP code"
                                        {...field}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>

                            <FormField
                              control={form.control}
                              name="saveAddress"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                    />
                                  </FormControl>
                                  <div className="space-y-1 leading-none">
                                    <FormLabel>
                                      Save this address for future orders
                                    </FormLabel>
                                  </div>
                                </FormItem>
                              )}
                            />

                            <Button
                              type="submit"
                              size="lg"
                              className="w-full bg-primary hover:bg-primary-glow rounded-3xl"
                            >
                              Continue to Payment
                              <ArrowRight className="h-4 w-4 ml-2" />
                            </Button>
                          </form>
                        </Form>
                      </CardContent>
                    </Card>
                    <div className="my-6">
                      <h2 className="text-lg font-bold mb-2">
                        Saved Addresses
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {savedAddresses.map((addr, idx) => (
                          <div
                            key={idx}
                            className="flex items-start justify-between relative p-4 border border-border rounded-xl cursor-pointer hover:bg-muted transition-colors"
                            onClick={() => {
                              // Fill form with this address
                              form.reset({
                                firstName: addr.firstName,
                                lastName: addr.lastName,
                                email: addr.email,
                                phone: addr.phone,
                                address: addr.address,
                                city: addr.city,
                                state: addr.state,
                                zipCode: addr.zipCode,
                                saveAddress: true,
                              });
                            }}
                          >
                            <div className="flex-1">
                              <p className="font-medium">
                                {addr.firstName} {addr.lastName}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {addr.address}, {addr.city}
                              </p>
                            </div>
                            <button
                              onClick={async (e) => {
                                e.stopPropagation(); // Prevent filling the form
                                const userId = localStorage.getItem("userId");
                                const addressId = addr._id; // Make sure backend returns _id for each address
                                if (!userId || !addressId) return;

                                try {
                                  const res = await fetch(
                                    `${API}/${userId}/${addressId}`,
                                    {
                                      method: "DELETE",
                                    }
                                  );
                                  const data = await res.json();
                                  setSavedAddresses(data.addresses || []);
                                } catch (err) {
                                  console.error(
                                    "Failed to delete address",
                                    err
                                  );
                                }
                              }}
                              className="text-red-500 hover:text-red-700 pt-2"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {currentStep === 2 && (
                  <motion.div
                    key="payment"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 50 }}
                    className="space-y-6"
                  >
                    {/* Payment Methods */}
                    <Card className="bg-gradient-card shadow-card border-border/50">
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <CreditCard className="h-5 w-5" />
                          <span>Payment Method</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <RadioGroup
                          value={paymentMethod}
                          onValueChange={setPaymentMethod}
                          className="space-y-4"
                        >
                          {paymentMethods.map((method) => {
                            const Icon = method.icon;
                            return (
                              <div
                                key={method.id}
                                className="flex items-center space-x-3 p-4 border border-border rounded-2xl hover:bg-muted/50 transition-colors"
                              >
                                <RadioGroupItem
                                  value={method.id}
                                  id={method.id}
                                />
                                <Icon className="h-5 w-5 text-muted-foreground" />
                                <div className="flex-1">
                                  <Label
                                    htmlFor={method.id}
                                    className="font-medium cursor-pointer"
                                  >
                                    {method.title}
                                  </Label>
                                  <p className="text-sm text-muted-foreground">
                                    {method.description}
                                  </p>
                                </div>
                                {method.fee > 0 && (
                                  <Badge variant="secondary">
                                    +${method.fee}
                                  </Badge>
                                )}
                              </div>
                            );
                          })}
                        </RadioGroup>
                      </CardContent>
                    </Card>

                    {/* Bank Offers */}
                    {/* <Card className="bg-gradient-card shadow-card border-border/50">
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <Building2 className="h-5 w-5" />
                          <span>Bank Offers</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {bankOffers.map((offer, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-4 bg-success/10 border border-success/20 rounded-2xl"
                            >
                              <div>
                                <p className="font-medium">{offer.bank}</p>
                                <p className="text-sm text-muted-foreground">
                                  {offer.discount}
                                </p>
                              </div>
                              <Badge
                                variant="outline"
                                className="border-success text-success"
                              >
                                {offer.code}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card> */}

                    {/* Security Info */}
                    <Card className="bg-gradient-card shadow-card border-border/50">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                          <Shield className="h-4 w-4" />
                          <span>
                            Your payment information is secure and encrypted
                          </span>
                        </div>
                      </CardContent>
                    </Card>

                    <div className="flex space-x-4">
                      <Button
                        variant="outline"
                        onClick={() => setCurrentStep(1)}
                        className="rounded-3xl mt-1"
                      >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Address
                      </Button>
                      <motion.div
                        className="flex-1"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button
                          size="lg"
                          onClick={() =>
                            paymentMethod === "cod"
                              ? handleCOD()
                              : handleRazorpay()
                          }
                          disabled={isProcessing}
                          className="w-full bg-primary hover:bg-primary-glow text-primary-foreground rounded-3xl py-6 text-lg font-semibold shadow-primary"
                        >
                          {isProcessing
                            ? "Processing..."
                            : paymentMethod === "cod"
                            ? "Place COD Order"
                            : "Proceed To Payment"}
                        </Button>
                      </motion.div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Order Summary */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-6"
            >
              <Card className="bg-gradient-card shadow-card border-border/50 sticky top-8">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Cart Items */}
                  <div className="space-y-3">
                    {cartItems.map((product) => (
                      <div
                        key={product._id}
                        className="flex items-center space-x-3"
                      >
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {product.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Qty: {product.quantity}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Color: {product.selectedColor}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Size: {product.selectedSize}
                          </p>
                        </div>
                        <p className="text-sm font-medium">
                          ₹
                          {(
                            product.price *
                            (1 - product.discount / 100) *
                            product.quantity
                          ).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  {/* Price Breakdown */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal</span>
                      <span>₹{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Shipping</span>
                      <span className={shipping === 0 ? "text-success" : ""}>
                        {shipping === 0 ? "FREE" : `₹${shipping.toFixed(2)}`}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Tax</span>
                      <span>₹{tax.toFixed(2)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span>₹{total.toFixed(2)}</span>
                    </div>
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
