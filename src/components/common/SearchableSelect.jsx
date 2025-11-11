import { useState, useRef, useEffect } from 'react';

export default function SearchableSelect({
  options = [],
  value,
  onChange,
  name = "",
  placeholder = "Select an option...",
  isDisabled = false,
  className = "",
  isSearchable = true,
  allowCustomOption = false,
  customOptionLabel = (term) => `Use custom value: ${term}`,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [draftValue, setDraftValue] = useState(value || "");
  const wrapperRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setDraftValue(value || "");
  }, [value]);

  const filteredOptions = options.filter((option) =>
    (option || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (selectedValue) => {
    setDraftValue(selectedValue);
    onChange({ target: { name, value: selectedValue } });
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleToggle = () => {
    if (!isDisabled) {
      setIsOpen(!isOpen);
    }
  };

  const handleInputChange = (event) => {
    const nextValue = event.target.value;
    setDraftValue(nextValue);
    if (allowCustomOption) {
      onChange({ target: { name, value: nextValue } });
    }
    setSearchTerm(nextValue);
    if (!isOpen) setIsOpen(true);
  };

  const handleInputFocus = () => {
    if (!isDisabled) {
      setIsOpen(true);
      setSearchTerm("");
    }
  };

  const displayValue = allowCustomOption ? draftValue : value || "";

  return (
    <div className={`relative ${className}`} ref={wrapperRef}>
      {/* Selected Value Display */}
      <div
        className={`w-full border rounded-lg bg-white flex items-center justify-between ${
          isDisabled ? 'bg-gray-100 cursor-not-allowed' : 'cursor-pointer hover:border-gray-400'
        } ${className.includes('border-red-500') ? 'border-red-500' : 'border-gray-300'}`}
        onClick={!allowCustomOption ? handleToggle : undefined}
      >
        {allowCustomOption ? (
          <input
            type="text"
            name={name}
            value={displayValue}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            placeholder={placeholder}
            className="flex-1 px-3 py-2 text-gray-900 bg-transparent focus:outline-none"
            disabled={isDisabled}
          />
        ) : (
          <span
            className="flex-1 px-3 py-2"
            onClick={handleToggle}
            style={{ color: displayValue ? '#111827' : '#6B7280' }}
          >
            {displayValue || placeholder}
          </span>
        )}
        <div
          className="px-2 h-full flex items-center justify-center"
          onClick={handleToggle}
        >
          <svg
            className={`w-5 h-5 text-gray-400 transform transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Dropdown Menu */}
      {isOpen && !isDisabled && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-hidden">
          {/* Search Input */}
          {isSearchable && (
            <div className="p-2 border-b border-gray-200 sticky top-0 bg-white">
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
            </div>
          )}

          {/* Options List */}
          <div className="max-h-48 overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, index) => (
                <div
                  key={index}
                  onClick={() => handleSelect(option)}
                  className={`px-4 py-2 cursor-pointer hover:bg-blue-50 transition-colors ${
                    option === value ? 'bg-blue-100 font-semibold' : ''
                  }`}
                >
                  <span>{option}</span>
                </div>
              ))
            ) : (
              <div className="px-4 py-2 text-gray-500 text-center">
                No options found
              </div>
            )}
            {allowCustomOption && searchTerm.trim() !== "" && (
              <div
                onClick={() => handleSelect(searchTerm)}
                className="px-4 py-2 cursor-pointer text-blue-600 hover:bg-blue-50 transition-colors border-t border-gray-200"
              >
                {typeof customOptionLabel === "function"
                  ? customOptionLabel(searchTerm)
                  : customOptionLabel}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
