import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import UserLogin from "./pages/UserLogin";
import AdminLogin from "./pages/AdminLogin";
import UserSignUp from "./pages/UserRegister";
import ForgotPass from "./pages/ForgotPassword";
import ResetPass from "./pages/ResetPassword";
import ThankYou from "./pages/ThankYou";

import Dashboard from "./pages/Dashboard";
import DashboardUser from "./pages/DashboardUser";
import Sidebar from "./pages/Sidebar";
import ProtectedRoute from "./pages/ProtectedRoute";
import AdminUsers from "./pages/AdminUsers";
import Categories from "./pages/Categories";
import CategoriesUser from "./pages/CategoriesUser";
import SubCategories from "./pages/SubCategories";
import SubCategoriesUser from "./pages/SubCategoriesUser";
import Product from "./pages/Product";
import ProductUser from "./pages/ProductUser";
import Orders from "./pages/Order";
import OrderDetails from "./pages/OrderDetails";
import Payments from "./pages/Payment";


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<UserLogin />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/signup" element={<UserSignUp />} />
        <Route path="/thankyou" element={<ThankYou />} />
        <Route path="/forgot-password" element={<ForgotPass />} />
        <Route path="/reset-password/:token" element={<ResetPass />} />
        <Route path="/admin/dashboard"
          element={
            <ProtectedRoute role="admin">
              <div className="d-flex">
                <Sidebar />
                <div className="p-4 flex-grow-1" style={{ width: "100%" }}>
                  <Dashboard />
                </div>
              </div>
            </ProtectedRoute>
          }
        />
        <Route path="/dashboard"
          element={
            <ProtectedRoute role="user">
              <div className="d-flex">
                <Sidebar />
                <div className="p-4 flex-grow-1" style={{ width: "100%" }}>
                  <DashboardUser />
                </div>
              </div>
            </ProtectedRoute>
          }
        />
        <Route path="/admin/adminusers"
          element={
            <ProtectedRoute role="admin">
              <div className="d-flex">
                <Sidebar />
                <div className="p-4 flex-grow-1" style={{ width: "100%" }}>
                  <AdminUsers />
                </div>
              </div>
            </ProtectedRoute>
          }
        />
        <Route path="/admin/categories"
          element={
            <ProtectedRoute role="admin">
              <div className="d-flex">
                <Sidebar />
                <div className="p-4 flex-grow-1" style={{ width: "100%" }}>
                  {" "}
                  <Categories />{" "}
                </div>
              </div>
            </ProtectedRoute>
          }
        />
        <Route path="/categories"
          element={
            <ProtectedRoute>
              <div className="d-flex">
                <Sidebar />
                <div className="p-4 flex-grow-1" style={{ width: "100%" }}>
                  {" "}
                  <CategoriesUser />{" "}
                </div>
              </div>
            </ProtectedRoute>
          }
        />
        <Route path="/admin/subcategories"
          element={
            <ProtectedRoute>
              <div className="d-flex">
                <Sidebar />
                <div className="p-4 flex-grow-1" style={{ width: "100%" }}>
                  {" "}
                  <SubCategories />{" "}
                </div>
              </div>
            </ProtectedRoute>
          }
        />
        <Route path="/subcategories"
          element={
            <ProtectedRoute>
              <div className="d-flex">
                <Sidebar />
                <div className="p-4 flex-grow-1" style={{ width: "100%" }}>
                  {" "}
                  <SubCategoriesUser />{" "}
                </div>
              </div>
            </ProtectedRoute>
          }
        />
        <Route path="/admin/products"
          element={
            <ProtectedRoute>
              <div className="d-flex">
                <Sidebar />
                <div className="p-4 flex-grow-1" style={{ width: "100%" }}>
                  {" "}
                  <Product />{" "}
                </div>
              </div>
            </ProtectedRoute>
          }
        />
        <Route path="/products"
          element={
            <ProtectedRoute>
              <div className="d-flex">
                <Sidebar />
                <div className="p-4 flex-grow-1" style={{ width: "100%" }}>
                  {" "}
                  <ProductUser />{" "}
                </div>
              </div>
            </ProtectedRoute>
          }
        />
        <Route path="/orders"
          element={
            <ProtectedRoute>
              <div className="d-flex">
                <Sidebar />
                <div className="p-4 flex-grow-1" style={{ width: "100%" }}>
                  {" "}
                  <Orders />{" "}
                </div>
              </div>
            </ProtectedRoute>
          }
        />
        <Route path="/orders/:id"
          element={
            <ProtectedRoute>
              <div className="d-flex">
                <Sidebar />
                <div className="p-4 flex-grow-1" style={{ width: "100%" }}>
                  {" "}
                  <OrderDetails />{" "}
                </div>
              </div>
            </ProtectedRoute>
          }
        />
        <Route path="/payments/:id"
          element={
            <ProtectedRoute>
              <div className="d-flex">
                <Sidebar />
                <div className="p-4 flex-grow-1" style={{ width: "100%" }}>
                  {" "}
                  <Payments />{" "}
                </div>
              </div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
