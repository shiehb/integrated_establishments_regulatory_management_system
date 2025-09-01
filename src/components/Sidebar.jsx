import { Link, useLocation } from "react-router-dom";
import logo from "../assets/logo1.svg";

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
  PanelLeftOpen,
  PanelLeftClose,
  User,
  MapPin,
  InspectIcon,
} from "lucide-react";
import { useState, useEffect } from "react";

// Sidebar data for different user levels
const sidebarData = {
  admin: [
    { name: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Users", path: "/users", icon: Users },
    { name: "Map", path: "/admin/map", icon: MapPin },
    { name: "Establishments", path: "/admin/establishments", icon: Building },
    { name: "Inspections", path: "/admin/inspections", icon: InspectIcon },
    { name: "Reports", path: "/admin/reports", icon: BarChart3 },
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

export default function Sidebar({
  userLevel = "public",
  isOpen: externalIsOpen,
  onToggle: externalOnToggle,
}) {
  const location = useLocation();
  const menuItems = sidebarData[userLevel] || sidebarData.public;

  // Use internal state if no external control is provided
  const [internalIsOpen, setInternalIsOpen] = useState(() => {
    const savedState = localStorage.getItem("sidebarOpen");
    return savedState !== null ? JSON.parse(savedState) : true;
  });

  const isControlled = externalIsOpen !== undefined;
  const isOpen = isControlled ? externalIsOpen : internalIsOpen;

  const handleToggle = () => {
    if (isControlled && externalOnToggle) {
      externalOnToggle();
    } else {
      setInternalIsOpen(!isOpen);
    }
  };

  // Save to localStorage whenever isOpen changes
  useEffect(() => {
    localStorage.setItem("sidebarOpen", JSON.stringify(isOpen));
  }, [isOpen]);

  return (
    <div
      className={`flex flex-col bg-sky-800 text-white transition-all duration-300 ${
        !isOpen ? "w-16" : "w-53"
      } h-screen sticky top-0`}
    >
      {/* Sidebar Header */}
      <div className="relative flex items-center justify-between p-4 border-b border-sky-700 group">
        {/* Logo / Toggle */}
        <button
          onClick={handleToggle}
          className="flex items-center justify-center w-8 h-8 transition-colors bg-transparent rounded-full hover:bg-sky-700"
        >
          {isOpen ? (
            <img
              src={logo}
              alt="Logo"
              className="object-contain w-8 h-8 rounded-full"
            />
          ) : (
            <>
              {/* Default logo - always rounded and fixed size */}
              <div className="flex items-center justify-center group-hover:hidden">
                <img
                  src={logo}
                  alt="Logo"
                  className="object-contain w-8 h-8 rounded-full"
                />
              </div>
              {/* Swap to open icon on hover */}
              <div className="items-center justify-center hidden p-4 group-hover:flex">
                <PanelLeftOpen size={22} />
              </div>
            </>
          )}
        </button>

        {/* Text + Close button (only when open) */}
        {isOpen && (
          <div className="flex items-center justify-between flex-1 ml-3">
            <span className="text-lg font-bold tracking-wide">IERMS</span>
            <button
              onClick={handleToggle}
              className="flex items-center justify-center w-8 h-8 transition bg-transparent rounded-full hover:bg-sky-700"
            >
              <PanelLeftClose size={22} />
            </button>
          </div>
        )}
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 py-4 overflow-y-auto">
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
                      : "text-sky-100 hover:bg-sky-700 hover:text-white"
                  }`}
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
