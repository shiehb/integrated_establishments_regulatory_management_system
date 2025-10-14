import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, HelpCircle } from "lucide-react";
import { filterMenuByRole, groupMenuByCategory } from "../constants/menuConfig";

export default function Sidebar({ userLevel = "public", isOpen = true, onHelpClick }) {
  const location = useLocation();
  const isHelpPage = location.pathname === '/help';

  // Get filtered menu items based on user role
  const filteredMenu = filterMenuByRole(userLevel);
  const { grouped, uncategorized } = groupMenuByCategory(filteredMenu);

  const renderMenuItem = (item) => {
    const IconComponent = item.icon;
    const isActive = location.pathname === item.path;
    
    return (
      <li key={item.id}>
        <Link
          to={item.path}
          className={`flex items-center px-4 py-3 rounded-lg transition-colors group ${
            isActive
              ? "bg-sky-700 text-white"
              : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
          }`}
          title={!isOpen ? item.name : undefined}
        >
          <IconComponent 
            size={20} 
            className={`flex-shrink-0 transition-colors ${
              isActive ? "text-white" : "text-gray-500 group-hover:text-gray-700"
            }`} 
          />
          {isOpen && (
            <span className="ml-3 text-sm font-medium truncate">
              {item.name}
            </span>
          )}
        </Link>
      </li>
    );
  };

  const renderMenuSection = (title, items) => {
    if (items.length === 0) return null;
    
    return (
      <div key={title} className="mb-4">
        {isOpen && (
          <h3 className="px-4 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            {title}
          </h3>
        )}
        <ul className="space-y-1">
          {items.map(renderMenuItem)}
        </ul>
      </div>
    );
  };

  // Public (not logged in) fallback - show only dashboard
  if (userLevel === "public") {
    return (
      <div className={`flex flex-col bg-white border-r border-gray-200 shadow-sm transition-all duration-300 ${
        isOpen ? "w-64" : "w-16"
      }`}>
        <nav className="flex-1 py-4 overflow-y-auto">
          <ul className="px-2 space-y-1">
            {renderMenuItem({
              id: "dashboard",
              name: "Dashboard",
              path: "/",
              icon: LayoutDashboard,
            })}
          </ul>
        </nav>
        
        {/* Help Button at Bottom */}
        {onHelpClick && (
          <div className="p-2 border-t border-gray-200">
            <button
              onClick={onHelpClick}
              className={`flex items-center px-4 py-3 w-full rounded-lg transition-colors group ${
                isHelpPage
                  ? "bg-sky-700 text-white"
                  : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              }`}
              title={!isOpen ? "Help Center" : undefined}
              aria-label="Open Help Center"
            >
              <HelpCircle 
                size={20} 
                className={`flex-shrink-0 transition-colors ${
                  isHelpPage ? "text-white" : "text-gray-500 group-hover:text-gray-700"
                }`} 
              />
              {isOpen && (
                <span className="ml-3 text-sm font-medium truncate">
                  Help Center
                </span>
              )}
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`flex flex-col bg-white border-r border-gray-200 shadow-sm transition-all duration-300 ${
      isOpen ? "w-64" : "w-16"
    }`}>
      {/* Navigation Items */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <div className="px-2">
          {/* Main navigation items (uncategorized) */}
          {uncategorized.length > 0 && (
            <div className="mb-4">
              <ul className="space-y-1">
                {uncategorized.map(renderMenuItem)}
              </ul>
            </div>
          )}
          
          {/* Categorized sections */}
          {Object.entries(grouped).map(([category, items]) =>
            renderMenuSection(category, items)
          )}
        </div>
      </nav>
      
      {/* Help Button at Bottom */}
      {onHelpClick && (
        <div className="p-2 border-t border-gray-200">
          <button
            onClick={onHelpClick}
            className={`flex items-center px-4 py-3 w-full rounded-lg transition-colors group ${
              isHelpPage
                ? "bg-sky-700 text-white"
                : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
            }`}
            title={!isOpen ? "Help Center" : undefined}
            aria-label="Open Help Center"
          >
            <HelpCircle 
              size={20} 
              className={`flex-shrink-0 transition-colors ${
                isHelpPage ? "text-white" : "text-gray-500 group-hover:text-gray-700"
              }`} 
            />
            {isOpen && (
              <span className="ml-3 text-sm font-medium truncate">
                Help Center
              </span>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
