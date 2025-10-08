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
  Bell,
} from "lucide-react";

// Common sidebar menu for all roles
const baseMenu = [
  { name: "Dashboard", path: "/", icon: LayoutDashboard },
  { name: "Users", path: "/users", icon: Users, adminOnly: true },
  { name: "Map", path: "/map", icon: MapPin },
  { name: "Establishments", path: "/establishments", icon: Building },
  { name: "Inspections", path: "/inspections", icon: InspectIcon },
  { name: "Notifications", path: "/notifications", icon: Bell, adminOnly: true },
   // ✅ Admin, Section Chief, or Unit Head
  {
    name: "District Management",
    path: "/district-management",
    icon: MapIcon,
    adminOrSectionChiefOrUnitHead: true,
  },
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

];

export default function Sidebar({ userLevel = "public", isOpen = true, onToggle }) {
  const location = useLocation();

  // Public (not logged in) fallback
  if (userLevel === "public") {
    return (
      <div className={`flex flex-col bg-white border-r border-gray-200 shadow-sm transition-all duration-300 ${
        isOpen ? "w-64" : "w-16"
      }`}>
        <nav className="flex-1 py-4 overflow-y-auto">
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
                {isOpen && <span className="ml-3 text-sm">Home</span>}
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    );
  }

  return (
    <div className={`flex flex-col bg-white border-r border-gray-200 shadow-sm transition-all duration-300 ${
      isOpen ? "w-64" : "w-16"
    }`}>
      {/* Navigation Items */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="px-2 space-y-1">
          {baseMenu.map((item) => {
            // ✅ Hide Users/System Config/Database Backup unless Admin
            if (item.adminOnly && userLevel !== "Admin") return null;
            // ✅ Hide Billing Records unless Legal Unit
            if (item.legalOnly && userLevel !== "Legal Unit") return null;
            // ✅ Hide District Management unless Admin, Section Chief, or Unit Head
            if (item.adminOrSectionChiefOrUnitHead && userLevel !== "Admin" && userLevel !== "Section Chief" && userLevel !== "Unit Head") return null;

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
                  title={!isOpen ? item.name : undefined}
                >
                  <IconComponent size={20} className="flex-shrink-0" />
                  {isOpen && <span className="ml-3 text-sm">{item.name}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
