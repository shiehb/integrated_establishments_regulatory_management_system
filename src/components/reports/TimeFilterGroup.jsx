export default function TimeFilterGroup({
  timeFilter,
  onTimeFilterChange,
  timeFilterValues,
  onTimeFilterValuesChange,
  filterOptions
}) {
  const handleValueChange = (key, value) => {
    onTimeFilterValuesChange({
      ...timeFilterValues,
      [key]: value
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Time Period</label>
        <div className="flex gap-4">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input  
              type="radio"
              checked={timeFilter === 'select'}
              onChange={(e) => onTimeFilterChange(e.target.value)}
              className="text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Select Period</span>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="radio"
              value="quarterly"
              checked={timeFilter === 'quarterly'}
              onChange={(e) => onTimeFilterChange(e.target.value)}
              className="text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Quarterly</span>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="radio"
              value="monthly"
              checked={timeFilter === 'monthly'}
              onChange={(e) => onTimeFilterChange(e.target.value)}
              className="text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Monthly</span>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="radio"
              value="custom"
              checked={timeFilter === 'custom'}
              onChange={(e) => onTimeFilterChange(e.target.value)}
              className="text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Custom Range</span>
          </label>
        </div>
      </div>

      {/* Quarterly Selection */}
      {timeFilter === 'quarterly' && (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="quarter" className="block text-sm font-medium text-gray-700">
              Quarter
            </label>
            <select
              id="quarter"
              value={timeFilterValues.quarter?.toString()}
              onChange={(e) => handleValueChange('quarter', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {(filterOptions.quarters || []).map((q) => (
                <option key={q.value} value={q.value.toString()}>
                  {q.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="year-q" className="block text-sm font-medium text-gray-700">
              Year
            </label>
            <select
              id="year-q"
              value={timeFilterValues.year?.toString()}
              onChange={(e) => handleValueChange('year', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {(filterOptions.years || []).map((year) => (
                <option key={year} value={year.toString()}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Monthly Selection */}
      {timeFilter === 'monthly' && (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="month" className="block text-sm font-medium text-gray-700">
              Month
            </label>
            <select
              id="month"
              value={timeFilterValues.month?.toString()}
              onChange={(e) => handleValueChange('month', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {(filterOptions.months || []).map((m) => (
                <option key={m.value} value={m.value.toString()}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="year-m" className="block text-sm font-medium text-gray-700">
              Year
            </label>
            <select
              id="year-m"
              value={timeFilterValues.year?.toString()}
              onChange={(e) => handleValueChange('year', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {(filterOptions.years || []).map((year) => (
                <option key={year} value={year.toString()}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Custom Date Range */}
      {timeFilter === 'custom' && (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="date-from" className="block text-sm font-medium text-gray-700">
              Date From
            </label>
            <input
              id="date-from"
              type="date"
              value={timeFilterValues.date_from}
              onChange={(e) => handleValueChange('date_from', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="date-to" className="block text-sm font-medium text-gray-700">
              Date To
            </label>
            <input
              id="date-to"
              type="date"
              value={timeFilterValues.date_to}
              onChange={(e) => handleValueChange('date_to', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      )}
    </div>
  );
}
