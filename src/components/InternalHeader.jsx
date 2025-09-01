import { Bell, User, Search, LogOut, Settings, Key } from "lucide-react";

export default function InternalHeader({
  userLevel = "public",
  userName = "John Doe",
}) {
  return (
    <header className="bg-white border-b border-gray-200 px-2 py-1.5">
      <div className="flex items-center justify-between">
        {/* Search Bar */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button className="relative p-2 bg-transparent text-gray-600 hover:text-sky-600 hover:bg-gray-100 rounded-lg transition-colors">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
              3
            </span>
          </button>

          {/* User Profile Dropdown */}
          <div className="relative group">
            <button className="flex items-center space-x-2 p-2 bg-transparent text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
              <div className="w-8 h-8 bg-sky-600 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
              <div className="text-left">
                <span className="text-sm font-medium block">{userName}</span>
                <span className="text-xs text-gray-500 capitalize block">
                  {userLevel}
                </span>
              </div>
            </button>

            {/* Dropdown Menu */}
            <div className="absolute right-0 top-full mt-4 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <div className="py-2">
                <button className="w-full px-4 py-2 text-left text-sm bg-transparent text-gray-700 hover:bg-gray-100 flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </button>
                <button className="w-full px-4 py-2 text-left text-sm bg-transparent text-gray-700 hover:bg-gray-100 flex items-center">
                  <Key className="h-4 w-4 mr-2" />
                  Change Password
                </button>
                <div className="border-t border-gray-200 my-1"></div>
                <button className="w-full px-4 py-2 text-left text-sm bg-transparent text-red-600 hover:bg-gray-100 flex items-center">
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
