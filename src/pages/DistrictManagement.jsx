import { useState, useEffect, useCallback } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import LayoutWithSidebar from "../components/LayoutWithSidebar";
import { useNotifications } from "../components/NotificationManager";
import ConfirmationDialog from "../components/common/ConfirmationDialog";
import PaginationControls, { useLocalStoragePagination } from "../components/PaginationControls";
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
  Trash2,
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
const allSections = [
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
  
  // Available sections based on user's section
  const [availableSections, setAvailableSections] = useState(allSections);
  
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
  
  // Pagination with localStorage
  const savedPagination = useLocalStoragePagination("district_management");
  const [currentPage, setCurrentPage] = useState(savedPagination.page);
  const [pageSize, setPageSize] = useState(savedPagination.pageSize);
  
  // UI state
  const [showFilters, setShowFilters] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assigningDistrict, setAssigningDistrict] = useState("");
  const [processing, setProcessing] = useState(false);
  
  // Confirmation dialog states
  const [showAssignConfirm, setShowAssignConfirm] = useState(false);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  
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
        
        // Determine available sections based on user's section
        if (profile?.section) {
          // Check if user has a combined section
          if (profile.section.includes(',')) {
            // Combined section - extract individual laws
            const combinedLaws = profile.section.split(',').map(law => law.trim());
            const availableLaws = allSections.filter(section => 
              combinedLaws.includes(section.value)
            );
            setAvailableSections(availableLaws);
            // Set the first law as default selection
            if (availableLaws.length > 0) {
              setSelectedSection(availableLaws[0].value);
              setShowAllLaws(false);
            }
          } else {
            // Single section - show only that section
            const userSection = allSections.find(s => s.value === profile.section);
            if (userSection) {
              setAvailableSections([userSection]);
              setSelectedSection(profile.section);
              setShowAllLaws(false);
            }
          }
        } else {
          // If user has no section (Admin), show all sections
          setAvailableSections(allSections);
        }
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
        ...(selectedDistrict && { district: selectedDistrict })
      };
      
      const response = await getDistrictUsers(filters);
      setUsers(response.results || []);
      // Don't set filteredUsers here - let the useEffect handle filtering
    } catch (error) {
      notifications.error(
        error.message || "Failed to fetch users",
        { title: "Error", duration: 5000 }
      );
    } finally {
      setLoading(false);
    }
  }, [selectedDistrict]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Apply search filter
  useEffect(() => {
    let filtered = users;
    
    // Apply law-based filtering first
    if (!showAllLaws && selectedSection) {
      filtered = filtered.filter(user => user.section === selectedSection);
    }
    
    // Then apply search filter
    if (debouncedSearchQuery) {
      filtered = filtered.filter(user => {
        const fullName = `${user.first_name || ''} ${user.middle_name || ''} ${user.last_name || ''}`.toLowerCase();
        const email = (user.email || '').toLowerCase();
        const district = (user.district || '').toLowerCase();
        const section = (user.section || '').toLowerCase();
        const sectionLabel = (user.section || '').toLowerCase();
        const query = debouncedSearchQuery.toLowerCase();
        
        return fullName.includes(query) || email.includes(query) || district.includes(query) || section.includes(query) || sectionLabel.includes(query);
      });
    }
    
    setFilteredUsers(filtered);
  }, [users, debouncedSearchQuery, showAllLaws, selectedSection]);

  const handleAssignDistrict = (user) => {
    setSelectedUser(user);
    setAssigningDistrict(user.district || "");
    setShowAssignModal(true);
  };

  const handleRemoveDistrict = (user) => {
    setSelectedUser(user);
    setShowRemoveConfirm(true);
  };

  const handleConfirmAssign = async () => {
    if (!selectedUser) return;
    
    setProcessing(true);
    try {
      await assignDistrict(selectedUser.id, assigningDistrict);
      
      const actionText = selectedUser.district ? 'reassigned' : 'assigned';
      notifications.success(
        `District ${actionText} successfully!`,
        { title: "Success", duration: 4000 }
      );
      
      setShowAssignModal(false);
      setShowAssignConfirm(false);
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

  const handleConfirmRemove = async () => {
    if (!selectedUser) return;
    
    setProcessing(true);
    try {
      await assignDistrict(selectedUser.id, ""); // Empty string removes district
      
      notifications.success(
        "District removed successfully!",
        { title: "Success", duration: 4000 }
      );
      
      setShowRemoveConfirm(false);
      setSelectedUser(null);
      
      // Refresh users
      fetchUsers();
    } catch (error) {
      notifications.error(
        error.message || "Failed to remove district",
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
    const section = allSections.find(s => s.value === sectionValue);
    return section ? section.fullLabel : sectionValue;
  };

  // Get user's section display name (handles combined sections)
  const getUserSectionDisplayName = () => {
    if (!userProfile?.section) return "All Sections";
    
    if (userProfile.section.includes(',')) {
      // Combined section - show the combined name
      const combinedLaws = userProfile.section.split(',').map(law => law.trim());
      const lawNames = combinedLaws.map(law => {
        const section = allSections.find(s => s.value === law);
        return section ? section.label : law;
      });
      return `${lawNames.join(', ')} (Combined)`;
    } else {
      // Single section
      const section = allSections.find(s => s.value === userProfile.section);
      return section ? section.label : userProfile.section;
    }
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
  
  const goToPage = useCallback((page) => {
    setCurrentPage(page);
  }, []);

  const handlePageSizeChange = useCallback((newSize) => {
    setPageSize(newSize);
    setCurrentPage(1);
  }, []);
  
  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedSection, selectedProvince, selectedDistrict, debouncedSearchQuery, showAllLaws]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown-container')) {
        setShowFilters(false);
        setShowSortDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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

  // Check if user has access to District Management (Admin, Section Chief, or Unit Head)
  const userLevel = userProfile?.userlevel?.trim();
  const hasAccess = userLevel === "Admin" || userLevel === "Section Chief" || userLevel === "Unit Head";

  if (!hasAccess) {
    return (
      <>
        <Header />
        <LayoutWithSidebar userLevel={userProfile?.userlevel}>
          <div className="flex items-center justify-center h-[calc(100vh-160px)]">
            <div className="text-center">
              <div className="inline-block p-8 bg-white border border-gray-200 rounded-lg shadow-sm">
                <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                  <X size={32} className="text-red-600" />
                </div>
                <h2 className="mb-2 text-xl font-semibold text-gray-800">
                  Access Denied
                </h2>
                <p className="mb-4 text-gray-600">
                  District Management is only available to Admins, Section Chiefs, and Unit Heads.
                </p>
                <p className="text-sm text-gray-500">
                  Your current role: <span className="font-medium text-gray-700">{userLevel || "Unknown"}</span>
                </p>
              </div>
            </div>
          </div>
        </LayoutWithSidebar>
        <Footer />
      </>
    );
  }

  const currentSection = availableSections.find(s => s.value === selectedSection);

  return (
    <>
      <Header />
      <LayoutWithSidebar userLevel={userProfile?.userlevel}>
        <div className="p-4 bg-white h-[calc(100vh-160px)]">
          {/* Top controls */}
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div>
              <h1 className="text-2xl font-bold text-sky-600">District Management</h1>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              {/* 🔍 Local Search Bar */}
              <div className="relative">
                <Search className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 left-3 top-1/2" />
                <input
                  type="text"
                  placeholder="Search monitoring personnel..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full py-0.5 pl-10 pr-8 transition bg-gray-100 border border-gray-300 rounded-lg min-w-sm hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
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

              {/* 🔽 Sort Dropdown */}
              <div className="relative dropdown-container">
                <button
                  onClick={() => setShowSortDropdown(!showSortDropdown)}
                  className="flex items-center px-3 py-1 text-sm font-medium rounded text-gray-700 bg-gray-200 hover:bg-gray-300"
                >
                  <ArrowUpDown size={14} />
                  Sort by
                  <ChevronDown size={14} />
                </button>

                {showSortDropdown && (
                  <div className="absolute right-0 z-20 w-48 mt-1 bg-white border border-gray-200 rounded shadow">
                    <div className="p-2">
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
                          ...(showAllLaws && availableSections.length > 1 ? [{ key: "section", label: "Law" }] : []),
                          { key: "district", label: "District" },
                          { key: "is_active", label: "Status" },
                        ].map((field) => (
                          <button
                            key={field.key}
                            onClick={() => {
                              handleSort(field.key);
                              setShowSortDropdown(false);
                            }}
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
              <div className="relative dropdown-container">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center px-3 py-1 text-sm font-medium rounded text-gray-700 bg-gray-200 hover:bg-gray-300"
                >
                  <Filter size={14} />
                  Filters
                  <ChevronDown size={14} />
                  {hasActiveFilters && ` (1)`}
                </button>

                {showFilters && (
                  <div className="absolute right-0 z-20 w-64 mt-1 bg-white border border-gray-200 rounded shadow">
                    <div className="p-2">
                      <div className="flex items-center justify-between px-3 py-2 mb-2">
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                          Filter Options
                        </div>
                        {hasActiveFilters && (
                          <button
                            onClick={() => {
                              clearFilters();
                              setShowFilters(false);
                            }}
                            className="px-2 py-1 text-xs text-gray-600 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
                          >
                            Clear All
                          </button>
                        )}
                      </div>
                      
                      {/* Province Section */}
                      <div className="mb-3">
                        <div className="px-3 py-1 text-xs font-medium text-gray-600 uppercase tracking-wide">
                          Province
                        </div>
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
                      <div className="mb-2">
                        <div className="px-3 py-1 text-xs font-medium text-gray-600 uppercase tracking-wide">
                          District
                        </div>
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

          {/* Section Tabs */}
          <div className="mb-4">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8">
                {/* All Laws Tab - only show if user has access to multiple sections */}
                {availableSections.length > 1 && (
                  <button
                    onClick={() => {
                      setShowAllLaws(true);
                      setSelectedSection("");
                    }}
                    className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                      showAllLaws
                        ? 'border-sky-500 text-sky-600 bg-sky-50'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {userProfile?.section?.includes(',') ? 'All My Laws' : 'All Laws'}
                  </button>
                )}
                
                {/* Individual Law Tabs */}
                {availableSections.map((section) => (
                  <button
                    key={section.value}
                    onClick={() => {
                      setSelectedSection(section.value);
                      setShowAllLaws(false);
                    }}
                    className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                      selectedSection === section.value && !showAllLaws
                        ? 'border-sky-500 text-sky-600 bg-sky-50'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {section.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* 📊 Search results info */}
          {(hasActiveFilters || filteredUsers.length !== users.length || (!showAllLaws && selectedSection)) && (
            <div className="flex items-center justify-between mb-2 text-sm text-gray-600">
              <div>
                {!showAllLaws && selectedSection ? (
                  <span>
                    Showing {filteredUsers.length} monitoring personnel for <span className="font-medium text-sky-600">{currentSection?.label}</span>
                    {userProfile?.section?.includes(',') && ` (from ${getUserSectionDisplayName()})`}
                    {debouncedSearchQuery && ` (filtered by search)`}
                  </span>
                ) : filteredUsers.length === users.length ? (
                  `Showing all ${users.length} monitoring personnel`
                ) : (
                  `Showing ${filteredUsers.length} of ${users.length} monitoring personnel`
                )}
              </div>
              <div className="flex gap-2">
                {!showAllLaws && selectedSection && availableSections.length > 1 && (
                  <button
                    onClick={() => setShowAllLaws(true)}
                    className="underline text-sky-600 hover:text-sky-700"
                  >
                    Show All Laws
                  </button>
                )}
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="underline text-sky-600 hover:text-sky-700"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Table */}
          <div className="overflow-y-auto h-[calc(100vh-325px)] border border-gray-300 rounded-lg scroll-smooth">
            <table className="w-full">
            <thead>
                <tr className="text-xs text-left text-white bg-sky-700 sticky top-0 z-10">
                <th className="p-1 border-b border-gray-300">
                  <button
                    onClick={() => handleSort('name')}
                    className="flex items-center gap-1 hover:text-gray-200 transition-colors font-medium"
                  >
                    Full Name {getSortIcon('name')}
                  </button>
                </th>
                <th className="p-1 border-b border-gray-300 font-medium">Email</th>
                {showAllLaws && availableSections.length > 1 && (
                  <th className="p-1 border-b border-gray-300">
                    <button
                      onClick={() => handleSort('section')}
                      className="flex items-center gap-1 hover:text-gray-200 transition-colors font-medium"
                    >
                      Law {getSortIcon('section')}
                    </button>
                  </th>
                )}
                <th className="p-1 border-b border-gray-300">
                  <button
                    onClick={() => handleSort('district')}
                    className="flex items-center gap-1 hover:text-gray-200 transition-colors font-medium"
                  >
                    District {getSortIcon('district')}
                  </button>
                </th>
                <th className="p-1 border-b border-gray-300">
                  <button
                    onClick={() => handleSort('is_active')}
                    className="flex items-center gap-1 hover:text-gray-200 transition-colors font-medium"
                  >
                    Status {getSortIcon('is_active')}
                  </button>
                </th>
                <th className="p-1 text-center border-b border-gray-300 w-35 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={showAllLaws && availableSections.length > 1 ? "6" : "5"}
                    className="px-2 py-8 text-center border-b border-gray-300"
                  >
                    <div
                      className="flex flex-col items-center justify-center p-4"
                      role="status"
                      aria-live="polite"
                    >
                      <div className="w-8 h-8 mb-2 border-b-2 border-gray-900 rounded-full animate-spin"></div>
                      <p className="text-sm text-gray-600">Loading monitoring personnel...</p>
                    </div>
                  </td>
                </tr>
              ) : paginatedUsers.length === 0 ? (
                <tr>
                  <td
                    colSpan={showAllLaws && availableSections.length > 1 ? "6" : "5"}
                    className="px-2 py-4 text-center text-gray-500 border-b border-gray-300"
                  >
                    {hasActiveFilters ? (
                      <div>
                        No monitoring personnel found matching your criteria.
                        <br />
                        <button
                          onClick={clearFilters}
                          className="mt-2 underline text-sky-600 hover:text-sky-700"
                        >
                          Clear all filters
                        </button>
                      </div>
                    ) : (
                      "No monitoring personnel found."
                    )}
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="p-1 text-xs border-b border-gray-300 hover:bg-gray-50"
                  >
                    <td className="px-2 font-semibold border-b border-gray-300">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 text-gray-400 mr-2" />
                        {getFullName(user)}
                      </div>
                    </td>
                    <td className="px-2 border-b border-gray-300">
                      <div className="text-sm text-gray-600">{user.email}</div>
                    </td>
                    {showAllLaws && availableSections.length > 1 && (
                      <td className="px-2 border-b border-gray-300">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-900">{user.section}</span>
                          <span className="text-xs text-gray-500">{getSectionDisplayName(user.section)}</span>
                        </div>
                      </td>
                    )}
                    <td className="px-2 border-b border-gray-300">
                      {user.district ? (
                        <span className="inline-flex items-center gap-2 px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          <MapPin size={12} />
                          {user.district}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-2 px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                          <X size={12} />
                          Not Assigned
                        </span>
                      )}
                    </td>
                    <td className="px-2 text-center border-b border-gray-300">
                      {user.is_active ? (
                        <span className="inline-flex items-center gap-2 px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-2 px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="p-1 text-center border-b border-gray-300">
                      <div className="flex justify-center gap-1">
                        <button
                          onClick={() => handleAssignDistrict(user)}
                          className="flex items-center gap-1 px-2 py-1 text-xs text-white transition-colors rounded bg-sky-600 hover:bg-sky-700"
                          title={user.district ? "Reassign District" : "Assign District"}
                        >
                          <MapPin size={12} />
                          {user.district ? "Reassign" : "Assign"}
                        </button>
                        {user.district && (
                          <button
                            onClick={() => handleRemoveDistrict(user)}
                            className="flex items-center gap-1 px-2 py-1 text-xs text-white transition-colors rounded bg-red-600 hover:bg-red-700"
                            title="Remove District"
                          >
                            <Trash2 size={12} />
                            Remove
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          </div>

          {/* Pagination Controls */}
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={totalUsers}
            filteredItems={filteredUsers.length}
            hasActiveFilters={hasActiveFilters}
            onPageChange={goToPage}
            onPageSizeChange={handlePageSizeChange}
            startItem={startIndex + 1}
            endItem={Math.min(endIndex, totalUsers)}
            storageKey="district_management"
          />
        </div>
        
        {/* Assign District Modal */}
        {showAssignModal && selectedUser && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/30 backdrop-blur-sm">
            <div className="w-full max-w-lg mx-4 bg-white rounded-lg shadow-lg">
              <div className="p-6">
                <div className="mb-4">
                  <h2 className="text-xl font-bold text-gray-900 mb-2">
                    Assign District
                  </h2>
                  <p className="text-sm text-gray-600">
                    Assign a district to <span className="font-semibold text-gray-900">{getFullName(selectedUser)}</span>
                  </p>
                </div>
              
                <div className="space-y-4">
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
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
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      District
                    </label>
                    <select
                      value={assigningDistrict}
                      onChange={(e) => setAssigningDistrict(e.target.value)}
                      disabled={!assigningDistrict.split(' - ')[0]}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors ${
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
                  
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium text-gray-900">Current Section:</span> {selectedUser.section || "N/A"}
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setShowAssignModal(false)}
                    disabled={processing}
                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      setShowAssignModal(false);
                      setShowAssignConfirm(true);
                    }}
                    disabled={processing || !assigningDistrict}
                    className="flex-1 px-4 py-2 text-white bg-sky-600 rounded-lg hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    {selectedUser?.district ? "Reassign District" : "Assign District"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Assign/Reassign Confirmation Dialog */}
        <ConfirmationDialog
          open={showAssignConfirm}
          title={selectedUser?.district ? "Reassign District" : "Assign District"}
          message={
            <div>
              <p className="mb-2">
                Are you sure you want to {selectedUser?.district ? 'reassign' : 'assign'} the district for{" "}
                <span className="font-semibold text-gray-900">{selectedUser ? getFullName(selectedUser) : ''}</span>?
              </p>
              {selectedUser?.district && (
                <p className="text-sm text-gray-500">
                  Current district: <span className="font-medium">{selectedUser.district}</span>
                </p>
              )}
              {assigningDistrict && (
                <p className="text-sm text-gray-500">
                  New district: <span className="font-medium">{assigningDistrict}</span>
                </p>
              )}
            </div>
          }
          confirmText={selectedUser?.district ? "Reassign" : "Assign"}
          cancelText="Cancel"
          confirmColor="sky"
          loading={processing}
          onConfirm={handleConfirmAssign}
          onCancel={() => {
            setShowAssignConfirm(false);
            setSelectedUser(null);
            setAssigningDistrict("");
          }}
        />

        {/* Remove District Confirmation Dialog */}
        <ConfirmationDialog
          open={showRemoveConfirm}
          title="Remove District Assignment"
          message={
            <div>
              <p className="mb-2">
                Are you sure you want to remove the district assignment for{" "}
                <span className="font-semibold text-gray-900">{selectedUser ? getFullName(selectedUser) : ''}</span>?
              </p>
              {selectedUser?.district && (
                <p className="text-sm text-gray-500">
                  Current district: <span className="font-medium">{selectedUser.district}</span>
                </p>
              )}
            </div>
          }
          confirmText="Remove"
          cancelText="Cancel"
          confirmColor="red"
          loading={processing}
          onConfirm={handleConfirmRemove}
          onCancel={() => {
            setShowRemoveConfirm(false);
            setSelectedUser(null);
          }}
        />
      </LayoutWithSidebar>
      <Footer />
    </>
  );
}