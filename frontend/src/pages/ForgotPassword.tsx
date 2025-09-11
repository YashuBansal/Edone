import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff, Lock, Mail, User, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Background } from '@/components/layout/Background';
const API_URL = import.meta.env.VITE_API_URL;
const API = `${API_URL}/authcustom`; 

const LoginPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "" });
  const [showPassword, setShowPassword] = useState(false);
  
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.email) {
      alert("Enter Your Email");
      return;
    }

    try {
      const res = await fetch(`${API}/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email }),
      });

      const data = await res.json();

      if (res.ok) {
         alert("Reset link sent! Check your email.");
        setForm({ email: "" });
        } else {
          alert(data.message || "Error sending email");
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
              Forgot Password?
            </CardTitle>
            <CardDescription className="text-lg">
                Let's get your account back to you.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4 animate-fade-in">

                  {/* Email Field */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
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

                  {/* Reset Button */}
                  <input
                    type="submit"
                    value="submit"
                    className="w-full bg-gradient-hover hover:opacity-90 transition-all duration-300 transform hover:scale-[1.02] shadow-primary text-white font-semibold py-2 rounded-lg cursor-pointer"
                  />
                </div>
            </form>

            {/* Additional Links */}
              <div className="mt-6 space-y-4 text-center animate-fade-in">
                <div className="flex flex-col space-y-2">
                  <Link to="/login">
                    <Button variant="link" className="text-sm">
                      Back to Login
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