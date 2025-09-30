import { ChevronLeft, ChevronRight } from "lucide-react";

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
}) {
  if (totalItems === 0) return null;

  const displayTotal = filteredItems !== null ? filteredItems : totalItems;
  const showStartItem = startItem || (currentPage - 1) * pageSize + 1;
  const showEndItem = endItem || Math.min(currentPage * pageSize, displayTotal);

  const goToPage = (page) => {
    const newPage = Math.max(1, Math.min(page, totalPages));
    onPageChange(newPage);
  };

  const handlePageSizeChange = (newSize) => {
    onPageSizeChange(parseInt(newSize));
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
