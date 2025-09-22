import { createContext, useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const SearchContext = createContext();

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};

export const SearchProvider = ({ children }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({
    establishments: [],
    users: [],
    inspections: [],
    map: []
  });
  const [isSearching, setIsSearching] = useState(false);
  const location = useLocation();

  // Clear search when navigating to different pages
  useEffect(() => {
    setSearchQuery('');
    setSearchResults({
      establishments: [],
      users: [],
      inspections: [],
      map: []
    });
  }, [location.pathname]);

  const updateSearchQuery = (query) => {
    setSearchQuery(query);
    setIsSearching(query.length > 0);
  };

  const updateSearchResults = (type, results) => {
    setSearchResults(prev => ({
      ...prev,
      [type]: results
    }));
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults({
      establishments: [],
      users: [],
      inspections: [],
      map: []
    });
    setIsSearching(false);
  };

  const value = {
    searchQuery,
    searchResults,
    isSearching,
    updateSearchQuery,
    updateSearchResults,
    clearSearch
  };

  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  );
};
