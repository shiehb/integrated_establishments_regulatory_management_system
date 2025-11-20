import { useState } from 'react';
import { FileText } from 'lucide-react';
import PaginationControls from '../PaginationControls';

export default function ReportResultsTable({ columns, rows, metadata, loading = false, hasActiveFilters = false }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Calculate pagination
  const totalCount = rows?.length || 0;
  const totalPages = Math.ceil(totalCount / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedRows = rows?.slice(startIndex, endIndex) || [];

  return (
    <>
      {/* Table Container */}
      <div className="rounded border border-gray-200 bg-white">
        <div className="overflow-x-auto">
          <div className="custom-scrollbar max-h-[calc(100vh-360px)] overflow-y-auto">
            <table className="min-w-full">
              <thead>
                <tr className="sticky top-0 z-10 bg-gradient-to-r from-sky-600 to-sky-700 text-left text-xs font-semibold uppercase tracking-wide text-white">
                  {columns?.map((column) => (
                    <th key={column.key} className="px-4 py-3">
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white">
                {loading ? (
                  <tr>
                    <td colSpan={columns?.length || 1} className="px-4 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-sky-600" />
                        <span className="text-sm text-gray-600">Loading report data...</span>
                      </div>
                    </td>
                  </tr>
                ) : !rows || rows.length === 0 ? (
                  <tr>
                    <td colSpan={columns?.length || 1} className="px-4 py-10 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center">
                        <FileText className="w-12 h-12 text-gray-300 mb-3" />
                        <p className="text-sm text-gray-600">
                          {hasActiveFilters
                            ? 'No records found. Try adjusting your filters or generate a different report.'
                            : 'No data available. Please generate a report to view results.'}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedRows.map((row, rowIndex) => (
                    <tr
                      key={rowIndex}
                      className="cursor-pointer border-b border-gray-200 text-sm transition-colors hover:bg-sky-50"
                    >
                      {columns.map((column) => (
                        <td key={column.key} className="px-4 py-3 text-sm text-gray-700">
                          {row[column.key] !== null && row[column.key] !== undefined
                            ? row[column.key]
                            : 'N/A'}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Pagination */}
      {!loading && totalCount > 0 && (
        <div>
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            totalCount={totalCount}
            onPageChange={setCurrentPage}
            onPageSizeChange={(newSize) => {
              setPageSize(newSize);
              setCurrentPage(1);
            }}
            startItem={totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1}
            endItem={totalCount === 0 ? 0 : Math.min(currentPage * pageSize, totalCount)}
            hasActiveFilters={hasActiveFilters}
          />
        </div>
      )}
    </>
  );
}
