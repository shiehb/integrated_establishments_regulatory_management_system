import { Bell, User, Search, LogOut, Settings, Key } from "lucide-react";

export default function InternalHeader({
  userLevel = "public",
  userName = "John Doe",
}) {
  return (
    <header className="p-1 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between mx-2">
        {/* Search Bar */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button className="relative p-2 text-gray-600 transition-colors bg-transparent rounded-lg hover:text-sky-600 hover:bg-gray-100">
            <Bell className="w-5 h-5" />
            <span className="absolute flex items-center justify-center w-4 h-4 text-xs text-white bg-red-500 rounded-full -top-1 -right-1">
              3
            </span>
          </button>

          {/* User Profile Dropdown */}
          <div className="relative group">
            <button className="flex items-center px-2 space-x-2 text-gray-700 transition-colors bg-transparent rounded-lg hover:bg-gray-100">
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

            {/* Dropdown Menu */}
            <div className="absolute right-0 z-50 invisible mt-4 transition-all duration-200 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 w-43 top-full group-hover:opacity-100 group-hover:visible">
              <div className="py-2">
                <button className="flex items-center w-full px-4 py-2 text-sm text-left text-gray-700 bg-transparent hover:bg-gray-100">
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </button>
                <button className="flex items-center w-full px-4 py-2 text-sm text-left text-gray-700 bg-transparent hover:bg-gray-100">
                  <Key className="w-4 h-4 mr-2" />
                  Change Password
                </button>
                <div className="my-1 border-t border-gray-200"></div>
                <button className="flex items-center w-full px-4 py-2 text-sm text-left text-red-600 bg-transparent hover:bg-gray-100">
                  <LogOut className="w-4 h-4 mr-2" />
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
