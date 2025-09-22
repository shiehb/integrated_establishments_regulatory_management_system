import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import HelpSection from "../components/help/HelpSection";
import HelpSearch from "../components/help/HelpSearch";
import HelpSidebar from "../components/help/HelpSidebar";
import { helpTopics } from "../data/helpData";
import { helpCategories } from "../data/helpCategories";

export default function Help() {
  const location = useLocation();
  const [filteredTopics, setFilteredTopics] = useState(helpTopics);
  const [searchValue, setSearchValue] = useState("");
  const [activeId, setActiveId] = useState(null);

  // Handle query param (?query=...)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get("query");
    if (q) {
      setSearchValue(q);
      handleSearch(q, true);
    } else {
      setFilteredTopics(helpTopics);
      setActiveId(null);
    }
  }, [location.search]);

  const handleSearch = (query, autoExpand = false) => {
    if (!query) {
      setFilteredTopics(helpTopics);
      setActiveId(null);
      return;
    }

    const filtered = helpTopics.filter(
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
  };

  // Build categories from helpCategories.js + helpTopics
  const categories = helpCategories.map((cat) => ({
    name: cat.name,
    key: cat.key,
    items: helpTopics.filter((t) => t.category === cat.key),
  }));

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
            setFilteredTopics(helpTopics);
            setActiveId(null);
            setSearchValue("");
          }}
          activeId={activeId}
        />

        {/* Main help content */}
        <div className="flex-1 flex flex-col max-h-full">
          {/* Sticky header with search */}
          <div className="sticky top-0 bg-gray-50 z-40 py-2 border-b-gray-300 shadow-lg">
            <h1 className="text-3xl font-bold text-sky-700 text-center">
              Help & User Manual
            </h1>

            <div className="max-w-lg mx-auto mt-4">
              <HelpSearch
                topics={helpTopics}
                onSearch={handleSearch}
                value={searchValue}
                setValue={setSearchValue}
              />
            </div>
          </div>

          {/* Scrollable section */}
          <div className="flex-1 overflow-y-auto pr-2">
            <HelpSection
              topics={filteredTopics}
              activeId={activeId}
              setActiveId={setActiveId}
            />
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
