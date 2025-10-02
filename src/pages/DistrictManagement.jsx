import { useState, useEffect, useCallback } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import LayoutWithSidebar from "../components/LayoutWithSidebar";
import { useNotifications } from "../components/NotificationManager";
import { 
  MapPin, 
  Users, 
  Search, 
  Filter,
  X,
  ChevronDown,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { getDistrictUsers, assignDistrict, getProfile } from "../services/api";

// Debounce hook
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Section options - moved outside component to avoid dependency issues
const sections = [
  { value: "PD-1586", label: "PD-1586", fullLabel: "Environmental Impact Assessment" },
  { value: "RA-6969", label: "RA-6969", fullLabel: "Toxic Chemicals & Hazardous Wastes" },
  { value: "RA-8749", label: "RA-8749", fullLabel: "Clean Air Act" },
  { value: "RA-9275", label: "RA-9275", fullLabel: "Clean Water Act" },
  { value: "RA-9003", label: "RA-9003", fullLabel: "Ecological Solid Waste Management" }
];

const provinces = [
  { value: "La Union", label: "La Union", districts: ["1st District", "2nd District", "3rd District"] },
  { value: "Ilocos Norte", label: "Ilocos Norte", districts: ["1st District", "2nd District"] },
  { value: "Ilocos Sur", label: "Ilocos Sur", districts: ["1st District", "2nd District"] },
  { value: "Pangasinan", label: "Pangasinan", districts: ["1st District", "2nd District", "3rd District", "4th District", "5th District", "6th District"] }
];

export default function DistrictManagement() {
  const notifications = useNotifications();
  
  // User profile
  const [userProfile, setUserProfile] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  
  // Data
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Filters
  const [selectedSection, setSelectedSection] = useState("PD-1586");
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  
  // All laws view state
  const [showAllLaws, setShowAllLaws] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  // UI state
  const [showFilters, setShowFilters] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assigningDistrict, setAssigningDistrict] = useState("");
  const [processing, setProcessing] = useState(false);
  
  // Sorting
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });

  const districts = selectedProvince 
    ? provinces.find(p => p.value === selectedProvince)?.districts || []
    : [];
  
  
  // Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await getProfile();
        setUserProfile(profile);
      } catch (error) {
        notifications.error(
          error.message || "Failed to fetch user profile",
          { title: "Error", duration: 5000 }
        );
      } finally {
        setLoadingUser(false);
      }
    };

    fetchProfile();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch users
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const filters = {
        userlevel: "Monitoring Personnel",
        ...(showAllLaws ? {} : { section: selectedSection }),
        ...(selectedDistrict && { district: selectedDistrict })
      };
      
      const response = await getDistrictUsers(filters);
      setUsers(response.results || []);
      setFilteredUsers(response.results || []);
    } catch (error) {
      notifications.error(
        error.message || "Failed to fetch users",
        { title: "Error", duration: 5000 }
      );
    } finally {
      setLoading(false);
    }
  }, [selectedSection, selectedDistrict, showAllLaws]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Apply search filter
  useEffect(() => {
    if (!debouncedSearchQuery) {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(user => {
        const fullName = `${user.first_name || ''} ${user.middle_name || ''} ${user.last_name || ''}`.toLowerCase();
        const email = (user.email || '').toLowerCase();
        const district = (user.district || '').toLowerCase();
        const section = (user.section || '').toLowerCase();
        const sectionLabel = sections.find(s => s.value === user.section)?.fullLabel?.toLowerCase() || '';
        const query = debouncedSearchQuery.toLowerCase();
        
        return fullName.includes(query) || email.includes(query) || district.includes(query) || section.includes(query) || sectionLabel.includes(query);
      });
      setFilteredUsers(filtered);
    }
  }, [users, debouncedSearchQuery]);

  const handleAssignDistrict = (user) => {
    setSelectedUser(user);
    setAssigningDistrict(user.district || "");
    setShowAssignModal(true);
  };

  const handleConfirmAssign = async () => {
    if (!selectedUser) return;
    
    setProcessing(true);
    try {
      await assignDistrict(selectedUser.id, assigningDistrict);
      
      notifications.success(
        `District ${assigningDistrict ? 'assigned' : 'removed'} successfully!`,
        { title: "Success", duration: 4000 }
      );
      
      setShowAssignModal(false);
      setSelectedUser(null);
      setAssigningDistrict("");
      
      // Refresh users
      fetchUsers();
    } catch (error) {
      notifications.error(
        error.message || "Failed to assign district",
        { title: "Error", duration: 5000 }
      );
    } finally {
      setProcessing(false);
    }
  };

  const getFullName = (user) => {
    return `${user.first_name || ''} ${user.middle_name || ''} ${user.last_name || ''}`.trim();
  };

  const clearFilters = () => {
    setSelectedProvince("");
    setSelectedDistrict("");
    setSearchQuery("");
  };
  
  const hasActiveFilters = selectedProvince || selectedDistrict || searchQuery;
  
  // Get section display name for a user
  const getSectionDisplayName = (sectionValue) => {
    const section = sections.find(s => s.value === sectionValue);
    return section ? section.fullLabel : sectionValue;
  };
  
  // Sorting functionality
  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        if (prev.direction === "asc") return { key, direction: "desc" };
        if (prev.direction === "desc") return { key: null, direction: null };
      }
      return { key, direction: "asc" };
    });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <ArrowUpDown size={14} />;
    return sortConfig.direction === "asc" ? <ArrowUp size={14} /> : <ArrowDown size={14} />;
  };

  // Apply sorting
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    if (!sortConfig.key) return 0;
    
    let aVal = a[sortConfig.key];
    let bVal = b[sortConfig.key];
    
    if (sortConfig.key === 'name') {
      aVal = getFullName(a);
      bVal = getFullName(b);
    } else if (sortConfig.key === 'section') {
      aVal = getSectionDisplayName(a.section);
      bVal = getSectionDisplayName(b.section);
    }
    
    if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
    if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });
  
  // Pagination logic
  const totalUsers = sortedUsers.length;
  const totalPages = Math.ceil(totalUsers / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedUsers = sortedUsers.slice(startIndex, endIndex);
  
  const goToPage = (page) => {
    setCurrentPage(page);
  };
  
  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedSection, selectedProvince, selectedDistrict, debouncedSearchQuery, showAllLaws]);

  if (loadingUser) {
    return (
      <>
        <Header />
        <LayoutWithSidebar userLevel={userProfile?.userlevel}>
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-t-2 border-b-2 rounded-full border-sky-600 animate-spin"></div>
          </div>
        </LayoutWithSidebar>
        <Footer />
      </>
    );
  }

  const currentSection = sections.find(s => s.value === selectedSection);

  return (
    <>
      <Header />
      <LayoutWithSidebar userLevel={userProfile?.userlevel}>
        <div className="p-6 bg-gray-50 min-h-[calc(100vh-160px)]">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">District Management</h1>
                <p className="text-gray-600 mt-1">Manage monitoring personnel district assignments across environmental laws</p>
              </div>
            </div>
          </div>

          {/* Top controls */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                {/* 🔍 Local Search Bar */}
                <div className="relative">
                  <Search className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 left-3 top-1/2" />
                  <input
                    type="text"
                    placeholder="Search monitoring personnel..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-80 py-2 pl-10 pr-8 transition bg-white border border-gray-300 rounded-lg hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute -translate-y-1/2 right-3 top-1/2"
                    >
                      <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                    </button>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* 🔽 Sort Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    <ArrowUpDown size={16} />
                    Sort by
                    <ChevronDown size={14} />
                  </button>

                  {showFilters && (
                    <div className="absolute right-0 z-20 w-56 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg">
                      <div className="p-3">
                        <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                          Sort Options
                        </div>
                        
                        {/* Sort by Field Section */}
                        <div className="mb-2">
                          <div className="px-3 py-1 text-xs font-medium text-gray-600 uppercase tracking-wide">
                            Sort by Field
                          </div>
                          {[
                            { key: "name", label: "Full Name" },
                            { key: "email", label: "Email" },
                            ...(showAllLaws ? [{ key: "section", label: "Law" }] : []),
                            { key: "district", label: "District" },
                            { key: "is_active", label: "Status" },
                          ].map((field) => (
                            <button
                              key={field.key}
                              onClick={() => handleSort(field.key)}
                              className={`w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-100 transition-colors ${
                                sortConfig.key === field.key ? "bg-sky-50 font-medium" : ""
                              }`}
                            >
                              <div className="flex-1 text-left">
                                <div className="font-medium">{field.label}</div>
                              </div>
                              {sortConfig.key === field.key && (
                                <div className="w-2 h-2 bg-sky-600 rounded-full"></div>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 🎚 Filters dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    <Filter size={16} />
                    Filters
                    <ChevronDown size={14} />
                    {hasActiveFilters && (
                      <span className="ml-1 px-2 py-0.5 text-xs font-medium text-white bg-sky-600 rounded-full">
                        1
                      </span>
                    )}
                  </button>

                  {showFilters && (
                    <div className="absolute right-0 z-20 w-72 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg">
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div className="text-sm font-semibold text-gray-900">
                            Filter Options
                          </div>
                          {hasActiveFilters && (
                            <button
                              onClick={clearFilters}
                              className="px-3 py-1 text-xs text-sky-600 bg-sky-50 rounded-md hover:bg-sky-100 transition-colors"
                            >
                              Clear All
                            </button>
                          )}
                        </div>
                        
                        {/* Province Section */}
                        <div className="mb-4">
                          <label className="block mb-2 text-sm font-medium text-gray-700">
                            Province
                          </label>
                          <select
                            value={selectedProvince}
                            onChange={(e) => {
                              setSelectedProvince(e.target.value);
                              setSelectedDistrict(""); // Reset district when province changes
                            }}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                          >
                            <option value="">All Provinces</option>
                            {provinces.map((province) => (
                              <option key={province.value} value={province.value}>
                                {province.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* District Section */}
                        <div>
                          <label className="block mb-2 text-sm font-medium text-gray-700">
                            District
                          </label>
                          <select
                            value={selectedDistrict}
                            onChange={(e) => setSelectedDistrict(e.target.value)}
                            disabled={!selectedProvince}
                            className={`w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 ${
                              !selectedProvince ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''
                            }`}
                          >
                            <option value="">All Districts</option>
                            {districts.map((district) => (
                              <option key={district} value={`${selectedProvince} - ${district}`}>
                                {district}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Section Tabs */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Environmental Laws</h3>
              <p className="text-sm text-gray-600">Select a law to view its monitoring personnel</p>
            </div>
            
            <div className="flex flex-wrap gap-3">
              {/* All Laws Tab */}
              <button
                onClick={() => {
                  setShowAllLaws(true);
                  setSelectedSection("");
                }}
                className={`px-6 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                  showAllLaws
                    ? "bg-sky-600 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-sm"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Users size={16} />
                  All Laws
                </div>
              </button>
              
              {/* Individual Law Tabs */}
              {sections.map((section) => (
                <button
                  key={section.value}
                  onClick={() => {
                    setSelectedSection(section.value);
                    setShowAllLaws(false);
                  }}
                  className={`px-6 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                    selectedSection === section.value && !showAllLaws
                      ? "bg-sky-600 text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-sm"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <MapPin size={16} />
                    {section.label}
                  </div>
                </button>
              ))}
            </div>

            {/* Current Section Info */}
            {showAllLaws ? (
              <div className="mt-4 p-4 bg-sky-50 border border-sky-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 bg-sky-600 rounded-lg">
                    <Users size={20} className="text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sky-900">All Environmental Laws</h4>
                    <p className="text-sm text-sky-700">Viewing all monitoring personnel across all environmental laws</p>
                  </div>
                </div>
              </div>
            ) : currentSection && (
              <div className="mt-4 p-4 bg-sky-50 border border-sky-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 bg-sky-600 rounded-lg">
                    <MapPin size={20} className="text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sky-900">{currentSection.label}</h4>
                    <p className="text-sm text-sky-700">{currentSection.fullLabel}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 📊 Search results info */}
          {(hasActiveFilters || filteredUsers.length !== users.length) && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-sky-600 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-900">
                      {filteredUsers.length === users.length
                        ? `Showing all ${users.length} monitoring personnel`
                        : `Showing ${filteredUsers.length} of ${users.length} monitoring personnel`}
                    </span>
                  </div>
                  {hasActiveFilters && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">Active filters:</span>
                      {selectedProvince && (
                        <span className="px-2 py-1 text-xs font-medium text-sky-600 bg-sky-50 rounded-full">
                          {selectedProvince}
                        </span>
                      )}
                      {selectedDistrict && (
                        <span className="px-2 py-1 text-xs font-medium text-sky-600 bg-sky-50 rounded-full">
                          {selectedDistrict.split(' - ')[1]}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-2 px-3 py-1 text-sm text-sky-600 bg-sky-50 rounded-md hover:bg-sky-100 transition-colors"
                  >
                    <X size={14} />
                    Clear all filters
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-sm text-left text-white bg-gradient-to-r from-sky-600 to-sky-700">
                    <th className="px-6 py-4">
                      <button
                        onClick={() => handleSort('name')}
                        className="flex items-center gap-2 hover:text-gray-200 transition-colors font-medium"
                      >
                        Full Name
                        {getSortIcon('name')}
                      </button>
                    </th>
                    <th className="px-6 py-4 font-medium">Email</th>
                    {showAllLaws && (
                      <th className="px-6 py-4">
                        <button
                          onClick={() => handleSort('section')}
                          className="flex items-center gap-2 hover:text-gray-200 transition-colors font-medium"
                        >
                          Law
                          {getSortIcon('section')}
                        </button>
                      </th>
                    )}
                    <th className="px-6 py-4">
                      <button
                        onClick={() => handleSort('district')}
                        className="flex items-center gap-2 hover:text-gray-200 transition-colors font-medium"
                      >
                        District
                        {getSortIcon('district')}
                      </button>
                    </th>
                    <th className="px-6 py-4">
                      <button
                        onClick={() => handleSort('is_active')}
                        className="flex items-center gap-2 hover:text-gray-200 transition-colors font-medium"
                      >
                        Status
                        {getSortIcon('is_active')}
                      </button>
                    </th>
                    <th className="px-6 py-4 text-center font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td
                        colSpan={showAllLaws ? "6" : "5"}
                        className="px-6 py-12 text-center"
                      >
                        <div
                          className="flex flex-col items-center justify-center"
                          role="status"
                          aria-live="polite"
                        >
                          <div className="w-8 h-8 mb-3 border-4 border-sky-200 border-t-sky-600 rounded-full animate-spin"></div>
                          <p className="text-sm text-gray-600">Loading monitoring personnel...</p>
                        </div>
                      </td>
                    </tr>
                  ) : paginatedUsers.length === 0 ? (
                    <tr>
                      <td
                        colSpan={showAllLaws ? "6" : "5"}
                        className="px-6 py-12 text-center"
                      >
                        <div className="flex flex-col items-center">
                          <div className="w-16 h-16 mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                            <Users size={24} className="text-gray-400" />
                          </div>
                          <h3 className="text-lg font-medium text-gray-900 mb-2">No monitoring personnel found</h3>
                          <p className="text-gray-500 mb-4">
                            {hasActiveFilters 
                              ? "No personnel match your current filters"
                              : showAllLaws 
                                ? "No monitoring personnel are registered"
                                : `No personnel found for ${currentSection?.label}`
                            }
                          </p>
                          {hasActiveFilters && (
                            <button
                              onClick={clearFilters}
                              className="px-4 py-2 text-sm text-white bg-sky-600 rounded-lg hover:bg-sky-700 transition-colors"
                            >
                              Clear all filters
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedUsers.map((user) => (
                      <tr
                        key={user.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {getFullName(user)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-600">{user.email}</div>
                        </td>
                        {showAllLaws && (
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-gray-900">{user.section}</span>
                              <span className="text-xs text-gray-500">{getSectionDisplayName(user.section)}</span>
                            </div>
                          </td>
                        )}
                        <td className="px-6 py-4">
                          {user.district ? (
                            <div className="flex flex-col">
                              <span className="inline-flex items-center gap-2 px-3 py-1 text-xs font-medium text-green-700 bg-green-50 rounded-full">
                                <MapPin size={12} />
                                {user.district}
                              </span>
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-2 px-3 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-full">
                              <X size={12} />
                              Not Assigned
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {user.is_active ? (
                            <span className="inline-flex items-center gap-2 px-3 py-1 text-xs font-medium text-green-700 bg-green-50 rounded-full">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-2 px-3 py-1 text-xs font-medium text-red-700 bg-red-50 rounded-full">
                              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                              Inactive
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => handleAssignDistrict(user)}
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-sky-600 rounded-lg hover:bg-sky-700 transition-colors"
                            title="Assign District"
                          >
                            <MapPin size={14} />
                            Assign
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-700">
                    Showing <span className="font-medium">{startIndex + 1}</span> to <span className="font-medium">{Math.min(endIndex, totalUsers)}</span> of <span className="font-medium">{totalUsers}</span> results
                  </span>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  >
                    <option value={5}>5 per page</option>
                    <option value={10}>10 per page</option>
                    <option value={25}>25 per page</option>
                    <option value={50}>50 per page</option>
                  </select>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft size={16} />
                    Previous
                  </button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                      // Show first page, last page, current page, and pages around current page
                      if (
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      ) {
                        return (
                          <button
                            key={page}
                            onClick={() => goToPage(page)}
                            className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                              page === currentPage
                                ? "bg-sky-600 text-white shadow-sm"
                                : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 hover:border-gray-400"
                            }`}
                          >
                            {page}
                          </button>
                        );
                      } else if (
                        page === currentPage - 2 ||
                        page === currentPage + 2
                      ) {
                        return <span key={page} className="px-2 text-gray-500">...</span>;
                      }
                      return null;
                    })}
                  </div>
                  
                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Assign District Modal */}
        {showAssignModal && selectedUser && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-lg mx-4 bg-white rounded-2xl shadow-2xl">
              <div className="p-8">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Assign District
                  </h2>
                  <p className="text-gray-600">
                    Assign a district to <span className="font-semibold text-gray-900">{getFullName(selectedUser)}</span>
                  </p>
                </div>
              
                <div className="space-y-6">
                  <div>
                    <label className="block mb-3 text-sm font-medium text-gray-700">
                      Province
                    </label>
                    <select
                      value={assigningDistrict.split(' - ')[0] || ''}
                      onChange={(e) => {
                        const province = e.target.value;
                        if (province) {
                          // Set to first district of selected province
                          const prov = provinces.find(p => p.value === province);
                          setAssigningDistrict(province + ' - ' + (prov?.districts[0] || ''));
                        } else {
                          setAssigningDistrict('');
                        }
                      }}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
                    >
                      <option value="">No Province</option>
                      {provinces.map((province) => (
                        <option key={province.value} value={province.value}>
                          {province.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block mb-3 text-sm font-medium text-gray-700">
                      District
                    </label>
                    <select
                      value={assigningDistrict}
                      onChange={(e) => setAssigningDistrict(e.target.value)}
                      disabled={!assigningDistrict.split(' - ')[0]}
                      className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors ${
                        !assigningDistrict.split(' - ')[0] ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''
                      }`}
                    >
                      <option value="">Select District</option>
                      {assigningDistrict.split(' - ')[0] && provinces.find(p => p.value === assigningDistrict.split(' - ')[0])?.districts.map((district) => (
                        <option key={district} value={assigningDistrict.split(' - ')[0] + ' - ' + district}>
                          {district}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium text-gray-900">Current Section:</span> {selectedUser.section || "N/A"}
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-4 mt-8">
                  <button
                    onClick={() => setShowAssignModal(false)}
                    disabled={processing}
                    className="flex-1 px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmAssign}
                    disabled={processing}
                    className="flex-1 px-6 py-3 text-white bg-sky-600 rounded-lg hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    {processing ? "Processing..." : "Assign District"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </LayoutWithSidebar>
      <Footer />
    </>
  );
}