import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProfile } from "../services/api";
import HelpEditor from "../components/help/HelpEditor";
import Header from "../components/Header";
import Footer from "../components/Footer";
import LayoutWithSidebar from "../components/LayoutWithSidebar";

export default function HelpEditorPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is admin
    getProfile()
      .then((profile) => {
        setUser(profile);
        if (profile.userlevel !== "Admin" && !profile.is_staff && !profile.is_superuser) {
          // Redirect to help page if not admin
          navigate("/help");
        }
      })
      .catch(() => {
        navigate("/help");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600"></div>
      </div>
    );
  }

  if (user && user.userlevel !== "Admin" && !user.is_staff && !user.is_superuser) {
    return null; // Will redirect
  }

  return (
    <>
      <Header />
      <LayoutWithSidebar userLevel="Admin">
        <HelpEditor />
      </LayoutWithSidebar>
      <Footer />
    </>
  );
}

