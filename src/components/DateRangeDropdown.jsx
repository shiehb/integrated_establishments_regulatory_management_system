import { useState, useRef } from "react";
import { Calendar, ChevronDown, X } from "lucide-react";

export default function DateRangeDropdown({
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
  onClear,
  className = ""
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Date validation
  const today = new Date().toISOString().split('T')[0];
  const isDateFromInvalid = dateFrom && dateFrom > today;
  const isDateToInvalid = dateTo && dateFrom && dateTo < dateFrom;

  // Close dropdown when clicking outside
  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsOpen(false);
    }
  };

  // Add event listener for outside clicks
  useState(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  });

  const hasActiveFilters = dateFrom || dateTo;
  const hasValidationErrors = isDateFromInvalid || isDateToInvalid;

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Date Range Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
           flex items-center px-3 py-1 text-sm font-medium rounded
          transition-colors duration-200
          ${hasValidationErrors
            ? 'text-white bg-red-600 hover:bg-red-700'
            : hasActiveFilters 
            ? 'text-white bg-orange-600 hover:bg-orange-700' 
            : 'text-gray-700 bg-gray-200 hover:bg-gray-300'
          }
        `}
      >
        <Calendar size={16} />
        Date Range
        <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        {hasActiveFilters && (
          <span className="ml-1 px-1.5 py-0.5 text-xs bg-white text-orange-600 rounded-full">
            {[dateFrom, dateTo].filter(Boolean).length}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
         <div className="absolute right-0 top-full z-50 w-64 mt-1 bg-white border border-gray-200 rounded shadow">
          <div className="p-2">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-sky-600">Date Range Filter</h3>
              {hasActiveFilters && (
                <button
                  onClick={() => {
                    onClear();
                    setIsOpen(false);
                  }}
                  className="flex items-center gap-1 px-2 py-1 text-xs text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded"
                >
                  <X size={12} />
                  Clear
                </button>
              )}
            </div>
            
            <div className="space-y-3">
              {/* From Date */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  From Date
                </label>
                <input
                  type="date"
                  value={dateFrom}
                  max={today}
                  onChange={(e) => onDateFromChange(e.target.value)}
                  className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                    isDateFromInvalid 
                      ? 'border-red-500 bg-red-50' 
                      : 'border-gray-300'
                  }`}
                />
                {isDateFromInvalid && (
                  <p className="mt-1 text-xs text-red-600">
                    From date cannot be in the future
                  </p>
                )}
              </div>

              {/* To Date */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  To Date
                </label>
                <input
                  type="date"
                  value={dateTo}
                  min={dateFrom || undefined}
                  max={today}
                  onChange={(e) => onDateToChange(e.target.value)}
                  className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                    isDateToInvalid 
                      ? 'border-red-500 bg-red-50' 
                      : 'border-gray-300'
                  }`}
                />
                {isDateToInvalid && (
                  <p className="mt-1 text-xs text-red-600">
                    To date cannot be before from date
                  </p>
                )}
              </div>

              {/* Active Filters Display */}
              {hasActiveFilters && (
                <div className="pt-3 border-t border-gray-200">
                  <div className="text-xs text-gray-600 mb-2">Active filters:</div>
                  <div className="flex flex-wrap gap-1">
                    {dateFrom && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded">
                        From: {new Date(dateFrom).toLocaleDateString()}
                        <button
                          onClick={() => onDateFromChange('')}
                          className="hover:text-orange-900"
                        >
                          <X size={10} />
                        </button>
                      </span>
                    )}
                    {dateTo && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded">
                        To: {new Date(dateTo).toLocaleDateString()}
                        <button
                          onClick={() => onDateToChange('')}
                          className="hover:text-orange-900"
                        >
                          <X size={10} />
                        </button>
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
