import { ChevronLeft, ChevronRight } from "lucide-react";

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

export default function PaginationControls({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  filteredItems = null,
  hasActiveFilters = false,
  onPageChange,
  onPageSizeChange,
  startItem,
  endItem,
  storageKey = "default_pagination", // Unique key for localStorage
}) {
  if (totalItems === 0) return null;

  const displayTotal = filteredItems !== null ? filteredItems : totalItems;
  const showStartItem = startItem || (currentPage - 1) * pageSize + 1;
  const showEndItem = endItem || Math.min(currentPage * pageSize, displayTotal);

  // Save pagination state to localStorage
  const saveToStorage = (page, size) => {
    try {
      const paginationData = {
        page: page,
        pageSize: size,
        timestamp: Date.now()
      };
      localStorage.setItem(`${storageKey}_pagination`, JSON.stringify(paginationData));
    } catch (error) {
      console.warn('Failed to save pagination to localStorage:', error);
    }
  };

  // Load pagination state from localStorage
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
    return null;
  };

  const goToPage = (page) => {
    const newPage = Math.max(1, Math.min(page, totalPages));
    onPageChange(newPage);
    saveToStorage(newPage, pageSize);
  };

  const handlePageSizeChange = (newSize) => {
    const newPageSize = parseInt(newSize);
    onPageSizeChange(newPageSize);
    // Reset to page 1 when changing page size
    onPageChange(1);
    saveToStorage(1, newPageSize);
  };

  return (
    <div className="flex flex-col items-center justify-between gap-4 mt-4 sm:flex-row">
      {/* Results Info */}
      <div className="text-sm text-gray-600">
        Showing {showStartItem} to {showEndItem} of {displayTotal} entries
        {hasActiveFilters && " (filtered)"}
        {filteredItems !== null && filteredItems !== totalItems && (
          <span className="ml-1">
            (filtered from {totalItems} total)
          </span>
        )}
      </div>

      {/* Page Navigation */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-1 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
          type="button"
        >
          <ChevronLeft size={16} />
        </button>

        {/* Page Numbers */}
        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          let pageNum;
          if (totalPages <= 5) {
            pageNum = i + 1;
          } else if (currentPage <= 3) {
            pageNum = i + 1;
          } else if (currentPage >= totalPages - 2) {
            pageNum = totalPages - 4 + i;
          } else {
            pageNum = currentPage - 2 + i;
          }

          return (
            <button
              key={pageNum}
              onClick={() => goToPage(pageNum)}
              className={`px-3 py-1 text-sm rounded ${
                currentPage === pageNum
                  ? "bg-sky-600 text-white"
                  : "hover:bg-gray-100"
              }`}
              type="button"
            >
              {pageNum}
            </button>
          );
        })}

        <button
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-1 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
          type="button"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Page Size Selector */}
      <div className="flex items-center gap-2 text-sm">
        <span>Show:</span>
        <select
          value={pageSize}
          onChange={(e) => handlePageSizeChange(e.target.value)}
          className="px-2 py-1 border rounded"
        >
          <option value="10">10</option>
          <option value="25">25</option>
          <option value="50">50</option>
          <option value="100">100</option>
        </select>
        <span>per page</span>
      </div>
    </div>
  );
}
