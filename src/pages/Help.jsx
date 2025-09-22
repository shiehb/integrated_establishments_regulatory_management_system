import { useState, useEffect, useCallback, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
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

  // Fetch user profile to get user level
  useEffect(() => {
    getProfile()
      .then(setProfile)
      .catch(() => setProfile(null));
  }, []);

  // Filter topics based on user level - memoized to prevent infinite loops
  const accessibleTopics = useMemo(() => {
    const normalizedLevel = normalizeUserLevel(profile?.userlevel || "public");
    console.log("Debug - Profile userlevel:", profile?.userlevel);
    console.log("Debug - Normalized level:", normalizedLevel);
    const filtered = filterTopicsByUserLevel(helpTopics, normalizedLevel);
    console.log("Debug - Filtered topics count:", filtered.length);
    console.log(
      "Debug - Filtered topics:",
      filtered.map((t) => t.title)
    );
    return filtered;
  }, [profile?.userlevel]);

  const [filteredTopics, setFilteredTopics] = useState([]);

  // Define handleSearch before useEffect
  const handleSearch = useCallback(
    (query, autoExpand = false) => {
      if (!query) {
        setFilteredTopics(accessibleTopics);
        setActiveId(null);
        return;
      }

      const filtered = accessibleTopics.filter(
        (topic) =>
          topic.title.toLowerCase().includes(query.toLowerCase()) ||
          topic.description.toLowerCase().includes(query.toLowerCase()) ||
          topic.tags.some((tag) =>
            tag.toLowerCase().includes(query.toLowerCase())
          )
      );

      if (filtered.length > 0) {
        setFilteredTopics(filtered);
        if (autoExpand) setActiveId(filtered[0].id);
      } else {
        setFilteredTopics([]);
        setActiveId(null);
      }
    },
    [accessibleTopics]
  );

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

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="fixed top-0 left-0 z-50 w-full">
        <Header />
      </div>

      {/* Body: Sidebar + Content */}
      <div className="flex flex-1 pt-20 pb-8 w-full max-w-7xl mx-auto px-6 gap-6 h-[calc(100vh-5rem)]">
        {/* Sidebar */}
        <HelpSidebar
          categories={categories}
          onSelect={handleSidebarSelect}
          onShowAll={() => {
            setFilteredTopics(accessibleTopics);
            setActiveId(null);
            setSearchValue("");
          }}
          activeId={activeId}
        />

        {/* Main help content */}
        <div className="flex-1 flex flex-col max-h-full">
          {/* Sticky header with search */}
          <div className="sticky top-0 bg-sky-700 z-40 py-2 border-b-gray-300 shadow-lg">
            {/* Back Button */}
            <div className=" items-center justify-between absolute top-4 left-4 right-6 flex">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-sky-700 bg-white border  rounded-lg hover:text-gray-600 hover:bg-gray-200 transition-colors"
                title="Go back"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              <div className="flex-1"></div>
            </div>

            <h1 className="text-3xl font-bold text-white text-center">
              Help Center
            </h1>

            <div className="max-w-lg mx-auto mt-4">
              <HelpSearch
                topics={accessibleTopics}
                onSearch={handleSearch}
                value={searchValue}
                setValue={setSearchValue}
              />
            </div>
          </div>

          {/* Scrollable section */}
          <div className="flex-1 overflow-y-auto pr-2">
            {!profile ? (
              <div className="text-center py-8">
                <p className="text-gray-600">Loading help topics...</p>
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
