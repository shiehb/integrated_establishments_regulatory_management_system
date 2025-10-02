import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  User,
  Search,
  LogOut,
  Key,
  HelpCircle,
  X,
  MapPin,
  User as UserIcon,
  FileText,
  Building,
  Loader2,
} from "lucide-react";
import api, { getUnreadNotificationsCount } from "../services/api";
import Notifications from "./Notifications";
import { useSearch } from "../contexts/SearchContext";
import { helpTopics } from "../data/helpData";
import { useNotifications } from "./NotificationManager";
import {
  filterTopicsByUserLevel,
  normalizeUserLevel,
} from "../utils/helpUtils";
import ConfirmationDialog from "./common/ConfirmationDialog";

export default function InternalHeader({
  userLevel = "public",
  userName = "John Doe",
}) {
  const navigate = useNavigate();
  const {
    searchQuery,
    updateSearchQuery,
    searchSuggestions,
    showSuggestions,
    hideSuggestions,
    selectSuggestion,
    loading,
  } = useSearch();

  const [unreadCount, setUnreadCount] = useState(0);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const notifications = useNotifications();

  const searchContainerRef = useRef(null);
  const suggestionsRef = useRef(null);

  // FIXED: Improved click outside detection
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if click is outside both search container and suggestions dropdown
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target)
      ) {
        // Additional check for suggestions dropdown
        if (
          suggestionsRef.current &&
          !suggestionsRef.current.contains(event.target)
        ) {
          hideSuggestions();
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [hideSuggestions]);

  // Fetch unread notifications
  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const data = await getUnreadNotificationsCount();
        setUnreadCount(data.count);
      } catch (err) {
        console.error("Unread notifications fetch error:", err);
      }
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    try {
      const refresh = localStorage.getItem("refresh");
      if (refresh) await api.post("auth/logout/", { refresh });
      notifications.success(
        "Logged out successfully!",
        {
          title: "Logout Successful",
          duration: 3000
        }
      );
    } catch (err) {
      console.error("Logout error:", err);
      notifications.error(
        "Logout failed!",
        {
          title: "Logout Error",
          duration: 6000
        }
      );
    } finally {
      localStorage.clear();
      sessionStorage.clear();
      navigate("/login");
    }
  };

  const handleGlobalSearch = (e) => {
    updateSearchQuery(e.target.value);
  };

  // FIXED: Improved input focus handling
  const handleInputFocus = () => {
    if (searchQuery.length >= 2 && searchSuggestions.length > 0) {
      // Suggestions will show automatically via the context
    }
  };

  // FIXED: Improved suggestion click handling
  const handleSuggestionClick = (suggestion) => {
    selectSuggestion(suggestion);
  };

  const getSuggestionIcon = (type) => {
    switch (type) {
      case "establishment":
        return <Building className="w-4 h-4" />;
      case "user":
        return <UserIcon className="w-4 h-4" />;
      case "inspection":
        return <FileText className="w-4 h-4" />;
      case "popular":
        return <MapPin className="w-4 h-4" />;
      case "suggestion":
        return <Search className="w-4 h-4" />;
      default:
        return <Search className="w-4 h-4" />;
    }
  };

  const getSuggestionColor = (type) => {
    switch (type) {
      case "establishment":
        return "text-blue-600 bg-blue-50";
      case "user":
        return "text-green-600 bg-green-50";
      case "inspection":
        return "text-purple-600 bg-purple-50";
      case "popular":
        return "text-orange-600 bg-orange-50";
      case "suggestion":
        return "text-gray-600 bg-gray-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  // Help Modal
  const [helpSearchQuery, setHelpSearchQuery] = useState("");
  const handleHelpSearch = (e) => setHelpSearchQuery(e.target.value);

  const accessibleTopics = filterTopicsByUserLevel(
    helpTopics,
    normalizeUserLevel(userLevel)
  );
  const filteredHelpSuggestions = accessibleTopics.filter(
    (topic) =>
      topic.title.toLowerCase().includes(helpSearchQuery.toLowerCase()) ||
      topic.description.toLowerCase().includes(helpSearchQuery.toLowerCase())
  );

  const handleHelpSuggestionClick = (topicTitle) => {
    setShowHelpModal(false);
    navigate(`/help?query=${encodeURIComponent(topicTitle)}`);
  };

  return (
    <>
      <header className="sticky top-0 z-50 p-2 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between mx-4">
          {/* Search Bar with Suggestions */}
          <div className="flex-1 max-w-md relative" ref={searchContainerRef}>
            <div className="relative">
              <Search className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 left-3 top-1/2" />
              <input
                type="text"
                placeholder="Search establishments, users, inspections..."
                value={searchQuery}
                onChange={handleGlobalSearch}
                onFocus={handleInputFocus}
                className="w-full py-1 pl-10 pr-4 transition bg-gray-100 border border-gray-300 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              />
              {loading && (
                <Loader2 className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 right-3 top-1/2 animate-spin" />
              )}
            </div>

            {/* Search Suggestions Dropdown */}
            {showSuggestions && (
              <div
                ref={suggestionsRef} // FIXED: Added separate ref for suggestions dropdown
                className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto"
              >
                <div className="p-2">
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 px-2">
                    Search Suggestions{" "}
                    {searchSuggestions.length > 0 &&
                      `(${searchSuggestions.length})`}
                  </div>

                  {loading ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="w-5 h-5 animate-spin text-sky-600" />
                      <span className="ml-2 text-sm text-gray-600">
                        Loading suggestions...
                      </span>
                    </div>
                  ) : searchSuggestions.length > 0 ? (
                    searchSuggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="flex items-center w-full p-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors mb-1 text-left"
                        onMouseDown={(e) => e.preventDefault()} // FIXED: Prevent immediate blur
                      >
                        <div
                          className={`flex items-center justify-center w-8 h-8 rounded-full ${getSuggestionColor(
                            suggestion.type
                          )} mr-3`}
                        >
                          {getSuggestionIcon(suggestion.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {suggestion.name || suggestion.text}
                          </div>
                          {suggestion.description && (
                            <div className="text-xs text-gray-500 mt-1 truncate">
                              {suggestion.description}
                            </div>
                          )}
                          {suggestion.category && (
                            <div className="text-xs text-gray-400 mt-1">
                              {suggestion.category}
                            </div>
                          )}
                        </div>
                      </button>
                    ))
                  ) : searchQuery.length >= 2 ? (
                    <div className="text-center py-4 text-gray-500">
                      <Search className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                      <p className="text-sm">No suggestions found</p>
                      <p className="text-xs mt-1">Try different keywords</p>
                    </div>
                  ) : null}
                </div>
              </div>
            )}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-3">
            {/* Notifications */}
            <div title="Notifications" className="relative">
              <div onClick={() => setShowNotifications(!showNotifications)}>
                <Notifications
                  unreadCount={unreadCount}
                  showDropdown={showNotifications}
                  onClose={() => setShowNotifications(false)}
                />
              </div>
            </div>

            {/* User Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center px-2 space-x-2 text-gray-700 transition-colors bg-transparent rounded-lg hover:bg-gray-200"
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-sky-600">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="text-left">
                  <span className="block text-sm font-medium">{userName}</span>
                  <span className="block text-xs text-gray-500 capitalize">
                    {userLevel}
                  </span>
                </div>
              </button>

              {showUserDropdown && (
                <div className="absolute right-0 z-50 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg">
                  <div className="py-2">
                    <button
                      onClick={() => {
                        setShowUserDropdown(false);
                        navigate("/change-password");
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                    >
                      <Key className="w-4 h-4 mr-2" />
                      Change Password
                    </button>
                    <div className="my-1 border-t border-gray-200"></div>
                    <button
                      onClick={() => {
                        setShowUserDropdown(false);
                        setShowLogoutConfirm(true);
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-left text-red-600 hover:bg-gray-100"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* --- Floating Help Bubble (bottom-right) --- */}
      <button
        onClick={() => setShowHelpModal(true)}
        className="fixed z-40 flex items-center justify-center w-8 h-8 transition-all duration-200 rounded-full shadow-lg bottom-10 right-4 bg-sky-600 hover:bg-sky-700 hover:scale-105"
        title="Help"
      >
        <HelpCircle className="text-white w-7 h-7" />
      </button>

      {/* --- Help Modal (bottom-right widget) --- */}
      {showHelpModal && (
        <div className="fixed z-50 bottom-10 right-4">
          <div className="w-100 max-h-[60vh] min-h-[50vh] flex flex-col p-2 bg-white rounded border border-gray-500 relative">
            {/* Header */}
            <div className="flex items-center justify-between p-2 border-b border-gray-200 rounded-t-lg bg-sky-50">
              <h2 className="flex items-center text-lg font-semibold text-sky-700">
                <HelpCircle className="w-5 h-5 mr-2" />
                Help Center
              </h2>
              <button
                onClick={() => setShowHelpModal(false)}
                className="p-1 transition-colors rounded-full hover:bg-gray-200"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Search bar */}
            <div className="p-2">
              <div className="relative">
                <Search className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 left-3 top-1/2" />
                <input
                  type="text"
                  placeholder="Search help topics..."
                  value={helpSearchQuery}
                  onChange={handleHelpSearch}
                  className="w-full py-1 pl-10 pr-4 transition bg-gray-100 border border-gray-300 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  autoFocus
                />
              </div>
            </div>

            {/* Suggestions */}
            <div className="flex-1 overflow-y-auto border-t border-gray-200">
              <div className="p-2">
                {filteredHelpSuggestions.length > 0 ? (
                  <ul className="space-y-1">
                    {filteredHelpSuggestions.map((topic) => (
                      <li
                        key={topic.id}
                        onClick={() => handleHelpSuggestionClick(topic.title)}
                        className="p-1 transition-colors border border-transparent rounded-lg cursor-pointer hover:bg-sky-50 hover:border-sky-200"
                      >
                        <div className="text-sm font-medium text-gray-900">
                          {topic.title}
                        </div>
                        <div className="mt-1 text-xs text-gray-600 line-clamp-2">
                          {topic.description}
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="py-8 text-center text-gray-500">
                    <HelpCircle className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">No help topics found</p>
                    {helpSearchQuery && (
                      <p className="mt-1 text-xs">Try different keywords</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="pt-2 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowHelpModal(false);
                  navigate("/help");
                }}
                className="flex items-center justify-center w-full py-2 text-sm font-medium transition-colors rounded-lg text-sky-600 hover:text-sky-700 hover:bg-sky-50"
              >
                <HelpCircle className="w-4 h-4 mr-2" />
                Open Full Help Page
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirmation Dialog */}
      <ConfirmationDialog
        open={showLogoutConfirm}
        title="Confirm Logout"
        message="Are you sure you want to logout?"
        loading={false}
        confirmText="Logout"
        cancelText="Cancel"
        onCancel={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
      />
    </>
  );
}
