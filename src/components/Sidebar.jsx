import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Building,
  BarChart3,
  MapPin,
  InspectIcon,
  FileText,
  Settings,
  Database, // ✅ add Database icon
  Map as MapIcon,
} from "lucide-react";

// Common sidebar menu for all roles
const baseMenu = [
  { name: "Dashboard", path: "/", icon: LayoutDashboard },
  { name: "Users", path: "/users", icon: Users, adminOnly: true },
  { name: "Map", path: "/map", icon: MapPin },
  { name: "Establishments", path: "/establishments", icon: Building },
  { name: "Inspections", path: "/inspections", icon: InspectIcon },
  {
    name: "Billing Records",
    path: "/billing",
    icon: FileText,
    legalOnly: true,
  }, // ✅ Only Legal Unit
  {
    name: "System Configuration",
    path: "/system-config",
    icon: Settings,
    adminOnly: true,
  }, // ✅ Only Admin
  {
    name: "Database Backup",
    path: "/database-backup",
    icon: Database,
    adminOnly: true,
  }, // ✅ Only Admin
  {
    name: "District Management",
    path: "/district-management",
    icon: MapIcon,
    adminOrSectionChief: true,
  }, // ✅ Admin or Section Chief
];

export default function Sidebar({ userLevel = "public" }) {
  const location = useLocation();

  // Public (not logged in) fallback
  if (userLevel === "public") {
    return (
      <div className="sticky top-0 flex flex-col w-56 h-[calc(100vh-105px)] bg-white border-gray-200 shadow-md mr-2">
        <nav className="flex-1 py-1 overflow-y-auto">
          <ul className="px-2 space-y-1">
            <li>
              <Link
                to="/"
                className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                  location.pathname === "/"
                    ? "bg-sky-700 text-white"
                    : "text-black hover:bg-sky-700 hover:text-white"
                }`}
              >
                <LayoutDashboard size={20} className="flex-shrink-0" />
                <span className="ml-3 text-sm">Home</span>
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    );
  }

  return (
    <div className="sticky top-0 flex flex-col w-56 min-h-[calc(100vh-105px)] bg-white border-gray-200 shadow-md mr-2">
      {/* Navigation Items */}
      <nav className="flex-1 py-1 overflow-y-auto">
        <ul className="px-2 space-y-1">
          {baseMenu.map((item) => {
            // ✅ Hide Users/System Config/Database Backup unless Admin
            if (item.adminOnly && userLevel !== "Admin") return null;
            // ✅ Hide Billing Records unless Legal Unit
            if (item.legalOnly && userLevel !== "Legal Unit") return null;
            // ✅ Hide District Management unless Admin or Section Chief
            if (item.adminOrSectionChief && userLevel !== "Admin" && userLevel !== "Section Chief") return null;

            const IconComponent = item.icon;
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                    location.pathname === item.path
                      ? "bg-sky-700 text-white"
                      : "text-black hover:bg-gray-200"
                  }`}
                >
                  <IconComponent size={20} className="flex-shrink-0" />
                  <span className="ml-3 text-sm">{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
