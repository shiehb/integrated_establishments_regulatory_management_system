import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, User, Search, LogOut, Key, HelpCircle, X } from "lucide-react";
import api, { getUnreadNotificationsCount } from "../services/api";
import Notifications from "./Notifications";
import { useSearch } from "../contexts/SearchContext";
import { helpTopics } from "../data/helpData";
import { filterTopicsByUserLevel, normalizeUserLevel } from "../utils/helpUtils";

export default function InternalHeader({
  userLevel = "public",
  userName = "John Doe",
}) {
  const navigate = useNavigate();
  const { searchQuery, updateSearchQuery } = useSearch();
  const [unreadCount, setUnreadCount] = useState(0);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

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

  // Logout
  const handleLogout = async () => {
    try {
      const refresh = localStorage.getItem("refresh");
      if (refresh) await api.post("auth/logout/", { refresh });
      if (window.showNotification)
        window.showNotification("success", "Logged out successfully!");
    } catch (err) {
      console.error("Logout error:", err);
      if (window.showNotification)
        window.showNotification("error", "Logout failed!");
    } finally {
      localStorage.clear();
      sessionStorage.clear();
      navigate("/login");
    }
  };

  // Global search handler
  const handleGlobalSearch = (e) => {
    updateSearchQuery(e.target.value);
  };

  // Help Modal Search
  const [helpSearchQuery, setHelpSearchQuery] = useState("");
  const handleHelpSearch = (e) => {
    setHelpSearchQuery(e.target.value);
  };

  // Filter topics by user level first, then by search query
  const accessibleTopics = filterTopicsByUserLevel(helpTopics, normalizeUserLevel(userLevel));
  const filteredSuggestions = accessibleTopics.filter(
    (topic) =>
      topic.title.toLowerCase().includes(helpSearchQuery.toLowerCase()) ||
      topic.description.toLowerCase().includes(helpSearchQuery.toLowerCase())
  );

  const handleSuggestionClick = (topicTitle) => {
    setShowHelpModal(false);
    navigate(`/help?query=${encodeURIComponent(topicTitle)}`);
  };

  return (
    <>
      <header className="p-2 bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="flex items-center justify-between mx-4">
          {/* Search Bar */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search establishments, users, inspections..."
                value={searchQuery}
                onChange={handleGlobalSearch}
                className="w-full py-1 pl-10 pr-4 bg-gray-100 border border-gray-300 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition"
              />
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-3">
            {/* Notifications */}
            <div title="Notifications" className="relative">
              <Notifications unreadCount={unreadCount} />
            </div>

            {/* Help Icon */}
            <button
              onClick={() => setShowHelpModal(true)}
              className="relative p-2 rounded-lg hover:bg-gray-200"
              title="Help"
            >
              <HelpCircle className="w-5 h-5 text-gray-700" />
            </button>

            {/* User Dropdown */}
            <div className="relative group">
              <button className="flex items-center px-2 space-x-2 text-gray-700 transition-colors bg-transparent rounded-lg hover:bg-gray-200">
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

              {/* Dropdown menu */}
              <div className="absolute right-0 invisible mt-4 transition-all duration-200 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 z-50 w-44 top-full group-hover:opacity-100 group-hover:visible">
                <div className="py-2">
                  <button
                    onClick={() => navigate("/change-password")}
                    className="flex items-center w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                  >
                    <Key className="w-4 h-4 mr-2" />
                    Change Password
                  </button>
                  <div className="my-1 border-t border-gray-200"></div>
                  <button
                    onClick={() => setShowLogoutConfirm(true)}
                    className="flex items-center w-full px-4 py-2 text-sm text-left text-red-600 hover:bg-gray-100"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* --- Help Modal (bottom-right widget) --- */}
      {showHelpModal && (
        <div className="fixed bottom-10 right-4 z-50">
          <div className="w-80 max-h-[70vh] flex flex-col p-4 bg-white rounded border border-gray-500 relative">
            {/* Close Button */}
            <button
              onClick={() => setShowHelpModal(false)}
              className="absolute top-3 right-3 p-1 rounded-full hover:bg-gray-200"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>

            {/* Modal Header */}
            <h2 className="text-lg font-semibold text-sky-700 mb-2 flex items-center justify-between">
              Help
            </h2>

            {/* Search bar */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search help topics..."
                value={helpSearchQuery}
                onChange={handleHelpSearch}
                className="w-full py-2 pl-10 pr-4 border border-gray-00 rounded focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
            {/* Suggestions */}
            <div className="flex-1 overflow-y-auto border rounded max-h-60">
              <ul>
                {filteredSuggestions.length > 0 ? (
                  filteredSuggestions.map((topic) => (
                    <li
                      key={topic.id}
                      onClick={() => handleSuggestionClick(topic.title)}
                      className="px-4 py-2 text-sm text-gray-700 hover:bg-sky-50 cursor-pointer"
                    >
                      {topic.title}
                    </li>
                  ))
                ) : (
                  <li className="px-4 py-2 text-sm text-gray-500 italic">
                    No suggestions found
                  </li>
                )}
              </ul>
            </div>

            <button
              onClick={() => {
                setShowHelpModal(false);
                navigate("/help");
              }}
              className="flex items-center text-xs text-sky-600 hover:underline justify-center mt-2"
            >
              <HelpCircle className="w-4 h-4 mr-1" />
              Open Help Page
            </button>
          </div>
        </div>
      )}

      {/* Logout Confirmation */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="w-full max-w-sm p-6 bg-white rounded-lg shadow-lg">
            <h3 className="mb-2 text-lg font-semibold text-gray-800">
              Confirm Logout
            </h3>
            <p className="mb-4 text-gray-600">
              Are you sure you want to logout?
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-white bg-red-600 rounded hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
