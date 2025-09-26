import { useState, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import LayoutWithSidebar from "../components/LayoutWithSidebar";
import InspectionsCore from "../components/inspections/InspectionsCore";
import { getProfile } from "../services/api";

export default function Inspections() {
  const [loading, setLoading] = useState(true);
  const [userLevel, setUserLevel] = useState("public");

  useEffect(() => {
    fetchUserLevel();
  }, []);

  const fetchUserLevel = async () => {
    try {
      const me = await getProfile();
      setUserLevel(me.userlevel || "public");
    } catch (e) {
      setUserLevel(localStorage.getItem("userLevel") || "public");
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <>
        <Header />
        <LayoutWithSidebar userLevel="admin">
          <div className="p-4">Loading establishments...</div>
        </LayoutWithSidebar>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header userLevel={userLevel} />
      <LayoutWithSidebar userLevel={userLevel}>
        <InspectionsCore canCreate={userLevel === "Division Chief"} userLevel={userLevel} />
      </LayoutWithSidebar>
      <Footer />
    </>
  );
}
