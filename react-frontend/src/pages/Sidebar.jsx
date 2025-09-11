import React from "react";
import { NavLink } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  FaTachometerAlt,
  FaUsers,
  FaFolder,
  FaFolderOpen,
  FaBoxOpen,
  FaShoppingBag,
} from "react-icons/fa";

const Sidebar = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const role = user?.role || "user";

  // Sidebar menu items
  const menuItems = [
    {
      label: role === "admin" ? "Admin Dashboard" : "Dashboard",
      icon: <FaTachometerAlt />,
      path: role === "admin" ? "/admin/dashboard" : "/dashboard",
      roles: ["admin", "user"],
    },
    {
      label: "Users",
      icon: <FaUsers />,
      path: "/admin/adminusers",
      roles: ["admin"],
    },
    {
      label: "Categories",
      icon: <FaFolder />,
      path: role === "admin" ? "/admin/categories" : "/categories",
      roles: ["admin", "user"],
    },
    {
      label: "Subcategories",
      icon: <FaFolderOpen />,
      path: role === "admin" ? "/admin/subcategories" : "/subcategories",
      roles: ["admin", "user"],
    },
    {
      label: "Products",
      icon: <FaBoxOpen />,
      path: role === "admin" ? "/admin/products" : "/products",
      roles: ["admin", "user"],
    },
    {
      label: "Orders",
      icon: <FaShoppingBag />,
      path: "/orders",
      roles: ["admin", "user"],
    },
  ];

  return (
    <div
      className="bg-dark text-white d-flex flex-column p-3"
      style={{ minHeight: "100vh", width: "20vw" }}
    >
      <h4 className="mx-3 my-4">{role === "admin" ? "Admin Panel" : "User Panel"}</h4>
      <ul className="nav nav-pills flex-column gap-1">
        {menuItems.map((item, idx) => {
          if (!item.roles.includes(role)) return null;
          return (
            <li className="nav-item" key={idx}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `nav-link text-white d-flex align-items-center px-3 rounded ${
                    isActive ? "bg-primary" : "hover-bg-secondary"
                  }`
                }
              >
                <span className="me-2 fs-5">{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            </li>
          );
        })}
      </ul>

      <style>{`
        .hover-bg-secondary:hover {
          background-color: rgba(255, 255, 255, 0.1);
        }
      `}</style>
    </div>
  );
};

export default Sidebar;
