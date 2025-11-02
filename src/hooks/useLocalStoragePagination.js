// Custom hook for localStorage pagination
export const useLocalStoragePagination = (storageKey, defaultPageSize = 10) => {
  const loadFromStorage = () => {
    try {
      const stored = localStorage.getItem(`${storageKey}_pagination`);
      if (stored) {
        const paginationData = JSON.parse(stored);
        // Check if data is not too old (7 days)
        const isRecent = Date.now() - paginationData.timestamp < 7 * 24 * 60 * 60 * 1000;
        if (isRecent && paginationData.page && paginationData.pageSize) {
          return {
            page: Math.max(1, paginationData.page),
            pageSize: Math.max(10, Math.min(100, paginationData.pageSize))
          };
        }
      }
    } catch (error) {
      console.warn('Failed to load pagination from localStorage:', error);
    }
    return { page: 1, pageSize: defaultPageSize };
  };

  return loadFromStorage();
};

// Custom hook for localStorage tab persistence
export const useLocalStorageTab = (storageKey, defaultTab = null) => {
  const loadFromStorage = () => {
    try {
      const stored = localStorage.getItem(`${storageKey}_tab`);
      if (stored) {
        const tabData = JSON.parse(stored);
        // Check if data is not too old (7 days)
        const isRecent = Date.now() - tabData.timestamp < 7 * 24 * 60 * 60 * 1000;
        if (isRecent && tabData.tab) {
          return tabData.tab;
        }
      }
    } catch (error) {
      console.warn('Failed to load tab from localStorage:', error);
    }
    return defaultTab;
  };

  const saveToStorage = (tab) => {
    try {
      const tabData = {
        tab: tab,
        timestamp: Date.now()
      };
      localStorage.setItem(`${storageKey}_tab`, JSON.stringify(tabData));
    } catch (error) {
      console.warn('Failed to save tab to localStorage:', error);
    }
  };

  return { loadFromStorage, saveToStorage };
};

