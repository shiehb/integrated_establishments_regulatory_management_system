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
import InspectionView from "./pages/InspectionView";
import InspectionReviewPage from "./pages/InspectionReviewPage";
import Billing from "./pages/Billing";
import Map from "./pages/Map";
import Layout from "./Layout";
import Help from "./pages/Help";
import SystemConfiguration from "./pages/SystemConfiguration";
import DatabaseBackup from "./pages/DatabaseBackup"; // ✅ import new page
import AccomplishmentReports from "./pages/AccomplishmentReports";
import DebugActions from "./components/inspections/DebugActions";
import InspectionForm from "./components/inspection-form/InspectionForm";
import NotFound from "./pages/NotFound";
import PublicRoute from "./components/PublicRoute";
import PrivateRoute from "./components/PrivateRoute";
import RoleRoute from "./components/RoleRoute";
import { SearchProvider } from "./contexts/SearchContext";
import { AuthProvider } from "./contexts/AuthContext";
import NotificationContainer from "./components/NotificationManager";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <SearchProvider>
          <NotificationContainer />
        <Routes>
          {/* Public routes without notifications */}
          <Route
            path="/login"
            element={
              <PublicRoute restricted={true}>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <PublicRoute>
                <ForgotPassword />
              </PublicRoute>
            }
          />
          <Route
            path="/reset-password"
            element={
              <PublicRoute>
                <ResetPassword />
              </PublicRoute>
            }
          />
          <Route
            path="/force-change-password"
            element={
              <PublicRoute>
                <ForceChangePassword />
              </PublicRoute>
            }
          />
          <Route
            path="/change-password"
            element={
              <PrivateRoute>
                <ChangePassword />
              </PrivateRoute>
            }
          />

          {/* Protected routes with notifications */}
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Layout />
              </PrivateRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="/users" element={<Users />} />
            <Route path="/map" element={<Map />} />
            <Route path="/establishments" element={<Establishments />} />
            <Route path="/inspections" element={<Inspections />} />
            <Route path="/inspections/:id/view" element={<InspectionView />} />
            <Route path="/inspections/:id/form" element={<InspectionForm />} />
            <Route path="/inspections/:id/review" element={<InspectionReviewPage />} />
            <Route path="/debug-actions" element={<DebugActions />} />

            <Route
              path="/billing"
              element={
                <RoleRoute allowed={["Legal Unit"]}>
                  <Billing />
                </RoleRoute>
              }
            />
            <Route path="/help" element={<Help />} />
            <Route
              path="/system-config"
              element={
                <RoleRoute allowed={["Admin"]}>
                  <SystemConfiguration />
                </RoleRoute>
              }
            />
            <Route
              path="/database-backup"
              element={
                <RoleRoute allowed={["Admin"]}>
                  <DatabaseBackup />
                </RoleRoute>
              }
            />
            <Route
              path="/reports"
              element={
                <RoleRoute allowed={["Section Chief", "Unit Head", "Monitoring Personnel"]}>
                  <AccomplishmentReports />
                </RoleRoute>
              }
            />
          </Route>

          {/* 404 Not Found - Catch all undefined routes */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        </SearchProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
