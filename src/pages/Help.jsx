import { useState, useEffect, useCallback, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, HelpCircle, Filter, SortAsc } from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import HelpSection from "../components/help/HelpSection";
import HelpSearch from "../components/help/HelpSearch";
import HelpSidebar from "../components/help/HelpSidebar";
import { helpTopics } from "../data/helpData";
import { helpCategories } from "../data/helpCategories";
import {
  filterTopicsByUserLevel,
  filterCategoriesByUserLevel,
  normalizeUserLevel,
} from "../utils/helpUtils";
import { getProfile } from "../services/api";

export default function Help() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState("");
  const [activeId, setActiveId] = useState(null);
  const [profile, setProfile] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [sortBy, setSortBy] = useState('relevance'); // relevance, title, recent
  const [showFilters, setShowFilters] = useState(false);

  // Fetch user profile to get user level
  useEffect(() => {
    getProfile()
      .then(setProfile)
      .catch(() => setProfile(null));
  }, []);

  // Filter topics based on user level - memoized to prevent infinite loops
  const accessibleTopics = useMemo(() => {
    const normalizedLevel = normalizeUserLevel(profile?.userlevel || "public");
    const filtered = filterTopicsByUserLevel(helpTopics, normalizedLevel);
    return filtered;
  }, [profile?.userlevel]);

  const [filteredTopics, setFilteredTopics] = useState([]);

  // Get all unique tags from accessible topics
  const allTags = useMemo(() => {
    const tags = new Set();
    accessibleTopics.forEach(topic => {
      topic.tags?.forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [accessibleTopics]);

  // Apply filters and sorting
  const applyFiltersAndSort = useCallback((topics, query) => {
    let filtered = [...topics];

    // Apply search query
    if (query) {
      filtered = filtered.filter(
        (topic) =>
          topic.title.toLowerCase().includes(query.toLowerCase()) ||
          topic.description.toLowerCase().includes(query.toLowerCase()) ||
          topic.tags?.some((tag) =>
            tag.toLowerCase().includes(query.toLowerCase())
          )
      );
    }

    // Apply category filter
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(topic =>
        selectedCategories.includes(topic.category)
      );
    }

    // Apply tag filter
    if (selectedTags.length > 0) {
      filtered = filtered.filter(topic =>
        topic.tags?.some(tag => selectedTags.includes(tag))
      );
    }

    // Apply sorting
    switch (sortBy) {
      case 'title':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'recent':
        filtered.sort((a, b) => b.id - a.id); // Assuming higher ID = newer
        break;
      case 'relevance':
      default:
        // Keep search relevance order or default order
        break;
    }

    return filtered;
  }, [selectedCategories, selectedTags, sortBy]);

  // Define handleSearch before useEffect
  const handleSearch = useCallback(
    (query, autoExpand = false) => {
      const filtered = applyFiltersAndSort(accessibleTopics, query);

      if (filtered.length > 0) {
        setFilteredTopics(filtered);
        if (autoExpand) setActiveId(filtered[0].id);
      } else {
        setFilteredTopics([]);
        setActiveId(null);
      }
    },
    [accessibleTopics, applyFiltersAndSort]
  );

  // Re-apply filters when they change
  useEffect(() => {
    handleSearch(searchValue);
  }, [selectedCategories, selectedTags, sortBy, handleSearch, searchValue]);

  // Build categories from helpCategories.js + accessible topics - memoized
  const categories = useMemo(
    () =>
      filterCategoriesByUserLevel(
        helpCategories.map((cat) => ({
          name: cat.name,
          key: cat.key,
          items: accessibleTopics.filter((t) => t.category === cat.key),
        })),
        accessibleTopics
      ),
    [accessibleTopics]
  );

  // Initialize filteredTopics when accessibleTopics changes
  useEffect(() => {
    setFilteredTopics(accessibleTopics);
  }, [accessibleTopics]);

  // Handle query param (?query=...) changes
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get("query");
    if (q) {
      setSearchValue(q);
      handleSearch(q, true);
    } else {
      setFilteredTopics(accessibleTopics);
      setActiveId(null);
    }
  }, [location.search, handleSearch, accessibleTopics]);

  const handleSidebarSelect = (topic) => {
    setActiveId(topic.id);
    setSearchValue(""); // optional reset search
    setFilteredTopics([topic]); // show only selected topic
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedTags([]);
    setSortBy('relevance');
  };

  const hasActiveFilters = selectedCategories.length > 0 || selectedTags.length > 0 || sortBy !== 'relevance';

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="fixed top-0 left-0 z-50 w-full">
        <Header />
      </div>

      {/* Body: Sidebar + Content */}
      <div className="flex flex-1 pt-20 pb-8 w-full gap-4 h-[calc(100vh-5rem)] px-4">
        {/* Sidebar - Made Sticky */}
        <div className="sticky top-20 self-start">
        <HelpSidebar
          categories={categories}
          onSelect={handleSidebarSelect}
          onShowAll={() => {
            setFilteredTopics(accessibleTopics);
            setActiveId(null);
            setSearchValue("");
              clearFilters();
          }}
          activeId={activeId}
        />
        </div>

        {/* Main help content */}
        <div className="flex flex-col flex-1 max-h-full">
          {/* Modern header with gradient */}
          <div className="sticky top-0 z-40 bg-gradient-to-r from-sky-600 to-sky-700 rounded-t-xl shadow-lg">
            {/* Back Button and Title */}
            <div className="flex items-center justify-between px-6 py-4">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white hover:bg-white/20"
                title="Go back"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>

              <h1 className="flex items-center text-3xl font-bold text-white">
                <HelpCircle className="w-8 h-8 mr-3" />
              Help Center
            </h1>

              <div className="w-24"></div> {/* Spacer for centering */}
            </div>

            {/* Search Bar */}
            <div className="px-6 pb-4">
              <div className="max-w-2xl mx-auto">
              <HelpSearch
                topics={accessibleTopics}
                onSearch={handleSearch}
                value={searchValue}
                setValue={setSearchValue}
              />
            </div>
          </div>

            {/* Filter Controls */}
            <div className="px-6 pb-4 border-t border-white/20">
              <div className="flex items-center justify-between max-w-2xl mx-auto pt-3">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium bg-white/10 backdrop-blur-sm rounded-lg text-white hover:bg-white/20 transition-colors"
                >
                  <Filter className="w-4 h-4" />
                  Filters {hasActiveFilters && `(${selectedCategories.length + selectedTags.length})`}
                </button>

                <div className="flex items-center gap-3">
                  <span className="text-sm text-white/80">
                    {filteredTopics.length} {filteredTopics.length === 1 ? 'topic' : 'topics'}
                  </span>
                  
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-2 text-sm bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/30"
                  >
                    <option value="relevance" className="text-gray-900">Sort: Relevance</option>
                    <option value="title" className="text-gray-900">Sort: A-Z</option>
                    <option value="recent" className="text-gray-900">Sort: Recent</option>
                  </select>

                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className="text-sm text-white/80 hover:text-white underline"
                    >
                      Clear all
                    </button>
                  )}
                </div>
              </div>

              {/* Expanded Filters */}
              {showFilters && (
                <div className="max-w-2xl mx-auto mt-3 p-4 bg-white/10 backdrop-blur-sm rounded-lg">
                  <div className="grid grid-cols-2 gap-4">
                    {/* Category Filter */}
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Categories
                      </label>
                      <div className="space-y-1 max-h-40 overflow-y-auto">
                        {helpCategories.map(cat => (
                          <label key={cat.key} className="flex items-center text-sm text-white/90 hover:text-white cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectedCategories.includes(cat.key)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedCategories([...selectedCategories, cat.key]);
                                } else {
                                  setSelectedCategories(selectedCategories.filter(c => c !== cat.key));
                                }
                              }}
                              className="mr-2 rounded text-sky-600 focus:ring-sky-500"
                            />
                            {cat.name}
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Tag Filter */}
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Tags
                      </label>
                      <div className="space-y-1 max-h-40 overflow-y-auto">
                        {allTags.slice(0, 15).map(tag => (
                          <label key={tag} className="flex items-center text-sm text-white/90 hover:text-white cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectedTags.includes(tag)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedTags([...selectedTags, tag]);
                                } else {
                                  setSelectedTags(selectedTags.filter(t => t !== tag));
                                }
                              }}
                              className="mr-2 rounded text-sky-600 focus:ring-sky-500"
                            />
                            {tag}
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto px-6 py-4 bg-white rounded-b-xl">
            {!profile ? (
              <div className="py-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading help topics...</p>
              </div>
            ) : filteredTopics.length === 0 ? (
              <div className="py-12 text-center text-gray-500">
                <HelpCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">No topics found</p>
                <p className="text-sm mt-2">Try adjusting your search or filters</p>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="mt-4 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            ) : (
              <HelpSection
                topics={filteredTopics}
                activeId={activeId}
                setActiveId={setActiveId}
              />
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 z-50 w-full">
        <Footer />
      </div>
    </div>
  );
}
