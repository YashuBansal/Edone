import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Eye, EyeOff, Lock, Mail, User, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Background } from "@/components/layout/Background";
const API_URL = import.meta.env.VITE_API_URL;
const API = `${API_URL}/authcustom`;

const LoginPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.email || !form.password) {
      alert("All fields are required");
      return;
    }

    try {
      const res = await fetch(`${API}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        // Save JWT token & user info in localStorage
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("userId", data.user.id);
        localStorage.setItem("isLoggedIn", "true");

        alert("Login successful");
        navigate("/profile");
      } else {
        if (data.message === "User not found") {
          alert("User not found. Redirecting to Sign Up...");
          navigate("/signup");
        } else {
          alert(data.message || "Login failed");
        }
      }
    } catch (err) {
      alert("Network error");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <Background />
      <div className="w-full max-w-md animate-fade-in">
        <Card className="border-0 shadow-card-hover bg-card/95 backdrop-blur-sm">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-gradient-hover rounded-full flex items-center justify-center animate-scale-in">
              <Shield className="w-8 h-8 text-primary-foreground" />
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-lg">
              Sign in to your account
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4 animate-fade-in">
                {/* Email Field */}
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-sm font-medium flex items-center gap-2"
                  >
                    <Mail className="w-4 h-4 text-primary" />
                    Email
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    value={form.email}
                    onChange={handleChange}
                    className="transition-all duration-300 focus:shadow-primary/20 focus:shadow-lg"
                    required
                  />
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <Label
                    htmlFor="password"
                    className="text-sm font-medium flex items-center gap-2"
                  >
                    <Lock className="w-4 h-4 text-primary" />
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={form.password}
                      onChange={handleChange}
                      className="pr-10 transition-all duration-300 focus:shadow-primary/20 focus:shadow-lg"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <Eye className="w-4 h-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Login Button */}
                <input
                  type="submit"
                  value="Login"
                  className="w-full bg-gradient-hover hover:opacity-90 transition-all duration-300 transform hover:scale-[1.02] shadow-primary text-white font-semibold py-2 rounded-lg cursor-pointer"
                />
              </div>
            </form>

            {/* Additional Links */}
            <div className="mt-6 space-y-4 text-center animate-fade-in">
              <div className="flex flex-col space-y-2">
                <Link to="/forgot-password">
                  <Button variant="link" className="text-sm">
                    Forgot your password?
                  </Button>
                </Link>
                <div className="text-sm text-muted-foreground">
                  Don't have an account?{" "}
                  <Link to="/signup">
                    <Button variant="link" className="p-0 h-auto text-primary">
                      Sign up here
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
