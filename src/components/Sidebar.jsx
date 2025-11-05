import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, HelpCircle } from "lucide-react";
import { filterMenuByRole, groupMenuByCategory } from "../constants/menuConfig";

export default function Sidebar({ userLevel = "public", isOpen = true, onHelpClick }) {
  const location = useLocation();

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
          className={`flex items-center px-3 py-2.5 rounded-lg transition-all duration-300 ease-in-out group relative ${
            isActive
              ? "bg-gradient-to-r from-sky-600 to-sky-700 text-white shadow-md border-l-4 border-sky-500"
              : "text-slate-700 hover:bg-slate-50 hover:text-slate-900 hover:scale-[1.02] hover:shadow-sm"
          }`}
          title={!isOpen ? item.name : undefined}
          data-tooltip={!isOpen ? item.name : undefined}
        >
          <IconComponent 
            size={22} 
            className={`flex-shrink-0 transition-all duration-300 ${
              isActive ? "text-white" : "text-slate-500 group-hover:text-sky-600"
            }`} 
          />
          {isOpen && (
            <span className={`ml-3 text-sm font-medium truncate transition-all duration-300 ${
              isActive ? "font-semibold" : ""
            }`}>
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
      <div key={title} className="mb-6">
        {isOpen && (
          <div className="px-3 mb-3">
            <h3 className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
              {title}
            </h3>
            <div className="h-px bg-gradient-to-r from-slate-200 via-slate-300 to-transparent"></div>
          </div>
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
      <div className={`flex flex-col bg-gradient-to-b from-slate-50 to-white border-r border-slate-200 shadow-lg transition-all duration-300 ${
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
          <div className="p-2 border-t border-slate-200 bg-gradient-to-r from-slate-50 to-transparent">
            <button
              onClick={onHelpClick}
              className="flex items-center px-3 py-2.5 w-full rounded-lg transition-all duration-300 ease-in-out group text-slate-700 hover:bg-slate-50 hover:text-slate-900 hover:scale-[1.02] hover:shadow-sm"
              title={!isOpen ? "Help Center" : undefined}
              data-tooltip={!isOpen ? "Help Center" : undefined}
              aria-label="Open Help Center"
            >
              <HelpCircle 
                size={22} 
                className="flex-shrink-0 transition-all duration-300 text-slate-500 group-hover:text-sky-600" 
              />
              {isOpen && (
                <span className="ml-3 text-sm font-medium truncate transition-all duration-300">
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
    <div className={`flex flex-col bg-gradient-to-b from-slate-50 to-white border-r border-slate-200 shadow-lg transition-all duration-300 ${
      isOpen ? "w-64" : "w-16"
    }`}>
      {/* Navigation Items */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <div className="px-2">
          {/* Main navigation items (uncategorized) */}
          {uncategorized.length > 0 && (
            <div className="mb-6">
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
        <div className="p-2 border-t border-slate-200 bg-gradient-to-r from-slate-50 to-transparent">
          <button
            onClick={onHelpClick}
            className="flex items-center px-3 py-2.5 w-full rounded-lg transition-all duration-300 ease-in-out group text-slate-700 hover:bg-slate-50 hover:text-slate-900 hover:scale-[1.02] hover:shadow-sm"
            title={!isOpen ? "Help Center" : undefined}
            data-tooltip={!isOpen ? "Help Center" : undefined}
            aria-label="Open Help Center"
          >
            <HelpCircle 
              size={22} 
              className="flex-shrink-0 transition-all duration-300 text-slate-500 group-hover:text-sky-600" 
            />
            {isOpen && (
              <span className="ml-3 text-sm font-medium truncate transition-all duration-300">
                Help Center
              </span>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
