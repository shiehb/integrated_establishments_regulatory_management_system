import { useState, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import LayoutWithSidebar from "../components/LayoutWithSidebar";
import { getProfile } from "../services/api";

import AdminDashboard from "../components/dashboard/AdminDashboard";
import LegalUnitDashboard from "../components/dashboard/LegalUnitDashboard";
import DivisionChiefDashboard from "../components/dashboard/DivisionChiefDashboard";
import SectionChiefDashboard from "../components/dashboard/SectionChiefDashboard";
import UnitHeadDashboard from "../components/dashboard/UnitHeadDashboard";
import MonitoringPersonnelDashboard from "../components/dashboard/MonitoringPersonnelDashboard";

export default function Dashboard() {
  const [userLevel, setUserLevel] = useState("public");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const accessToken = localStorage.getItem("access");
        if (!accessToken) {
          setUserLevel("public");
          setLoading(false);
          return;
        }

        const profile = await getProfile();
        const level = profile.userlevel || "public";

        setUserLevel(level);
        localStorage.setItem("userLevel", level);
      } catch (err) {
        console.error("Error fetching user profile:", err);
        const fallbackLevel = localStorage.getItem("userLevel") || "public";
        setUserLevel(fallbackLevel);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const renderDashboard = () => {
    switch (userLevel) {
      case "Admin":
        return <AdminDashboard />;
      case "Legal Unit":
        return <LegalUnitDashboard />;
      case "Division Chief":
        return <DivisionChiefDashboard />;
      case "Section Chief":
        return <SectionChiefDashboard />;
      case "Unit Head":
        return <UnitHeadDashboard />;
      case "Monitoring Personnel":
        return <MonitoringPersonnelDashboard />;
      default:
        return <DefaultDashboard />;
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <LayoutWithSidebar userLevel={userLevel}>
          <div
            className="flex flex-col items-center justify-center min-h-[200px] p-4"
            role="status"
            aria-live="polite"
          >
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-2"></div>
            <p className="text-sm text-gray-600">Loading dashboard...</p>
          </div>
        </LayoutWithSidebar>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <LayoutWithSidebar userLevel={userLevel}>
        <div>{renderDashboard()}</div>
      </LayoutWithSidebar>
      <Footer />
    </>
  );
}

function DefaultDashboard() {
  return (
    <div className="flex items-center justify-center bg-gray-100 h-[calc(100vh-500px)]">
      <div className="text-center">
        <div className="inline-block p-8 bg-white border border-gray-200 rounded-lg shadow-sm">
          <h2 className="mb-2 text-xl font-semibold text-gray-800">
            Dashboard Not Available
          </h2>
          <p className="mb-4 text-gray-600">
            Please contact administrator for access.
          </p>
        </div>
      </div>
    </div>
  );
}
