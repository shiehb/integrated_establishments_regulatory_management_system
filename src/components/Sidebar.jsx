import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Building,
  BarChart3,
  FileText,
  Calendar,
  Search,
  Phone,
  Home,
  User,
  MapPin,
  InspectIcon,
} from "lucide-react";

// Sidebar data for different user levels
const sidebarData = {
  admin: [
    { name: "Dashboard", path: "/", icon: LayoutDashboard },
    { name: "Users", path: "/users", icon: Users },
    { name: "Map", path: "/map", icon: MapPin },
    { name: "Establishments", path: "/establishments", icon: Building },
    { name: "Inspections", path: "/inspections", icon: InspectIcon },
    { name: "Compliance", path: "/compliance", icon: BarChart3 },
  ],
  inspector: [
    { name: "Dashboard", path: "/inspector/dashboard", icon: LayoutDashboard },
    { name: "Inspections", path: "/inspector/inspections", icon: Search },
    { name: "Schedule", path: "/inspector/schedule", icon: Calendar },
    { name: "Reports", path: "/inspector/reports", icon: BarChart3 },
    { name: "Profile", path: "/inspector/profile", icon: User },
  ],
  establishment: [
    {
      name: "Dashboard",
      path: "/establishment/dashboard",
      icon: LayoutDashboard,
    },
    { name: "Compliance", path: "/establishment/compliance", icon: FileText },
    { name: "Documents", path: "/establishment/documents", icon: FileText },
    { name: "Inspections", path: "/establishment/inspections", icon: Search },
    { name: "Profile", path: "/establishment/profile", icon: User },
  ],
  public: [
    { name: "Home", path: "/", icon: Home },
    { name: "Search", path: "/search", icon: Search },
    { name: "Compliance Info", path: "/compliance", icon: FileText },
    { name: "Contact", path: "/contact", icon: Phone },
  ],
};

export default function Sidebar({ userLevel = "public" }) {
  const location = useLocation();
  const menuItems = sidebarData[userLevel] || sidebarData.public;

  return (
    <div className="sticky top-0 flex flex-col w-56 h-[calc(100vh-105px)] bg-sky-700/50">
      {/* Navigation Items */}
      <nav className="flex-1 py-1 overflow-y-auto">
        <ul className="px-2 space-y-1">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                    location.pathname === item.path
                      ? "bg-sky-700 text-white"
                      : "text-black hover:bg-sky-700 hover:text-white"
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
