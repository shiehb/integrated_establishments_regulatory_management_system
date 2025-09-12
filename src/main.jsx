// main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import "leaflet-editable";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import ForceChangePassword from "./pages/ForceChangePassword";
import ChangePassword from "./pages/ChangePassword";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Establishments from "./pages/Establishments";
import Inspections from "./pages/Inspections";
import Map from "./pages/Map";
import Layout from "./Layout"; // Import the Layout component

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Public routes without notifications */}
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route
          path="/force-change-password"
          element={<ForceChangePassword />}
        />
        <Route path="/change-password" element={<ChangePassword />} />

        {/* Protected routes with notifications */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="/users" element={<Users />} />
          <Route path="/map" element={<Map />} />
          <Route path="/establishments" element={<Establishments />} />
          <Route path="/inspections" element={<Inspections />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
