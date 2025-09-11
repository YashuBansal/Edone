import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Background } from '@/components/layout/Background';
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
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Eye, EyeOff, Lock, Mail, User, Shield } from "lucide-react";
const API_URL = import.meta.env.VITE_API_URL;
const API = `${API_URL}/authcustom`;

const SignupPage = () => {
  const navigate = useNavigate();
  const [otpSent, setOtpSent] = useState(false);
  const [loadingOtp, setLoadingOtp] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [loadingSign, setLoadingSign] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    userName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    let timer;
    if (otpSent && !canResend && resendTimer > 0) {
      timer = setInterval(() => {
        setResendTimer((prev) => {
          if (prev === 1) {
            clearInterval(timer);
            setCanResend(true);
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(timer);
  }, [otpSent, canResend, resendTimer]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const sendOtp = async () => {
    setMessage("");
    setLoadingOtp(true);

    if (!form.email) {
      setMessage("Email is required before sending OTP.");
      setLoadingOtp(false);
      return;
    }

    try {
      const res = await fetch(`${API}/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userName: form.userName,
          email: form.email,
          password: form.password,
        }),
      });
      const data = await res.json();
      setMessage(data.message);
      if (res.ok) setOtpSent(true);
      setCanResend(false);
      setResendTimer(30);
    } catch {
      setMessage("Server error, please try again.");
    } finally {
      setLoadingOtp(false);
    }
  };

  const finalSignup = async (e) => {
    e.preventDefault();
    setLoadingSign(true);
    setMessage("");

    if (
      !form.userName ||
      !form.password ||
      !form.confirmPassword ||
      !form.email
    ) {
      setMessage("Please fill in all fields.");
      setLoadingSign(false);
      return;
    }

    if (!otp) {
      setMessage("Verify Your Email First");
      setLoadingSign(false);
      return;
    }

    if (!form.password || form.password.length < 6) {
      setMessage("Password must be at least 6 characters long");
      setLoadingSign(false);
      return;
    }
    if (form.password !== form.confirmPassword) {
      setMessage("Passwords do not match.");
      setLoadingSign(false);
      return;
    }

    try {
      const res = await fetch(`${API}/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, otp }),
      });
      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "OTP verification failed.");
        setLoadingSign(false);
        return;
      }
      setOtpVerified(true);
      setOtpSent(false);
      setMessage(data.message);

      const res2 = await fetch(`${API}/finalize-signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, userName: form.userName, password: form.password }),
      });
      const data2 = await res2.json();

      if (!res2.ok) {
        setMessage(data2.message || "Signup failed.");
        setLoadingSign(false);
        return;
      }

      const { userId } = data2;
      const signupData = {
        userName: form.userName,
        userId,
        email: form.email,
        password: form.password,
      };
      localStorage.setItem("signupData", JSON.stringify(signupData));
      navigate("/login");
    } catch {
      setMessage("Server error, please try again.");
    } finally {
      setLoadingSign(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <Background />
      <div className="w-full max-w-md animate-fade-in">
        <Card className="border-0 shadow-card-hover bg-card/95 backdrop-blur-sm">
          <CardHeader className="text-center space-y-1">
            <div className="mx-auto w-14 h-14 bg-gradient-hover rounded-full flex items-center justify-center animate-scale-in">
              <Shield className="w-8 h-8 text-primary-foreground" />
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Hello There!
            </CardTitle>
            <CardDescription className="text-lg h-auto">
              Sign Up and make your account
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form className="space-y-6">
              <div className="space-y-4 animate-fade-in">
                {/* Username Field */}
                <div className="space-y-2">
                  <Label
                    htmlFor="username"
                    className="text-sm font-medium flex items-center gap-2"
                  >
                    <User className="w-4 h-4 text-primary" />
                    Username
                  </Label>
                  <Input
                    id="username"
                    type="text"
                    name="userName"
                    placeholder="Enter your username"
                    value={form.userName}
                    onChange={handleChange}
                    className="transition-all duration-300 focus:shadow-primary/20 focus:shadow-lg"
                    required
                  />
                </div>

                {/* Email Field */}
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-sm font-medium flex items-center gap-2"
                  >
                    <Mail className="w-4 h-4 text-primary" />
                    Email
                  </Label>
                  <div className="flex items-center gap-2">
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    value={form.email}
                    onChange={handleChange}
                    disabled={otpVerified}
                    className="transition-all duration-300 focus:shadow-primary/20 focus:shadow-lg w-3/4"
                    required
                  />
                  {!otpSent && !otpVerified && (
                    <button
                      type="button"
                      className="w-1/4 bg-gradient-hover hover:opacity-90 transition-all duration-300 transform hover:scale-[1.02] shadow-primary text-white py-1.5 rounded-sm"
                      onClick={sendOtp}
                      disabled={loadingOtp}
                    >
                      {loadingOtp ? "Sending..." : "Verify Email"}
                    </button>
                  )}
                  {otpSent && !otpVerified && (
                    <button
                      type="button"
                      className="signBtn w-50"
                      onClick={sendOtp}
                      disabled={!canResend || loadingOtp}
                    >
                      {loadingOtp
                        ? "Sending..."
                        : canResend
                        ? "Resend"
                        : `Resend in ${resendTimer}s`}
                    </button>
                  )}
                  </div>
                </div>

                <div className="space-y-2 flex flex-row items-center gap-3">
                  <Label className="text-sm font-medium">Enter OTP</Label>
                  <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                    <InputOTPGroup>
                      {[...Array(6)].map((_, i) => (
                        <InputOTPSlot key={i} index={i} />
                      ))}
                    </InputOTPGroup>
                  </InputOTP>
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
                  <div className="relative">
                    <Input
                      id="password"
                      name="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="Re-enter your password"
                      value={form.confirmPassword}
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

                {/* Verify Button */}
                <Button
                  type="submit"
                  className="w-full bg-gradient-hover hover:opacity-90 transition-all duration-300 transform hover:scale-[1.02] shadow-primary text-md"
                  
                  onClick={finalSignup}
                  disabled={loadingSign}
                >
                  {loadingSign ? "Sending..." : "Sign Up"}
                </Button>
                <div className="text-center">
                  <span style={{ color: "#fff" }}>&nbsp;</span>
                  {message && (
                    <span className="text-light small">{message}</span>
                  )}
                </div>
              </div>
            </form>

            {/* Additional Links */}
            <div className="animate-fade-in">
              <div className="flex flex-row justify-center gap-16">
                <Button variant="link" className="text-sm p-0" onClick={() => { navigate("/forgot-password"); }}>
                  Forgot your password?
                </Button>
                <div className="text-sm text-muted-foreground">
                  Have an account?{" "}
                  <Button variant="link" className="p-0 text-primary" onClick={() => { navigate("/login"); }}>
                    Login here
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SignupPage;
