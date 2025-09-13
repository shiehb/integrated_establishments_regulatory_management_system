import Header from "../components/Header";
import Footer from "../components/Footer";
import LayoutWithSidebar from "../components/LayoutWithSidebar";
import { useEffect, useState } from "react";
import { getProfile } from "../services/api"; // 🔥 API profile

export default function Dashboard() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    getProfile()
      .then(setProfile)
      .catch(() => setProfile(null));
  }, []);

  return (
    <>
      <Header />
      <LayoutWithSidebar userLevel="admin">
        <div className="p-4 bg-white rounded-lg shadow-md">
          <h1 className="mb-4 text-2xl font-bold text-sky-600">Dashboard</h1>
          {profile ? (
            <div>
              <p>Email: {profile.email}</p>
              <p>
                Name: {profile.first_name} {profile.middle_name}{" "}
                {profile.last_name}
              </p>
              <p>User Level: {profile.userlevel}</p>
              <p>Section: {profile.section}</p>
            </div>
          ) : (
            <p>Loading profile...</p>
          )}
        </div>
      </LayoutWithSidebar>
      <Footer />
    </>
  );
}
