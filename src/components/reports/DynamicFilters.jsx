export default function DynamicFilters({ reportType, extraFilters, onExtraFiltersChange, filterOptions }) {
  const handleFilterChange = (key, value) => {
    onExtraFiltersChange({
      ...extraFilters,
      [key]: value
    });
  };

  // Determine which filters to show based on report type
  const renderFilters = () => {
    switch (reportType) {
      case 'establishment':
        return (
          <>
            <div className="space-y-2">
              <label htmlFor="province" className="block text-sm font-medium text-gray-700">
                Province
              </label>
              <select
                id="province"
                value={extraFilters.province || 'ALL'}
                onChange={(e) => handleFilterChange('province', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="ALL">All Provinces</option>
                {(filterOptions.provinces || []).map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* <div className="space-y-2">
              <label htmlFor="status-est" className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                id="status-est"
                value={extraFilters.status || 'ALL'}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {(filterOptions.status_options || []).map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div> */}
          </>
        );

      case 'user':
        return (
          <>
            <div className="space-y-2">
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                Role
              </label>
              <select
                id="role"
                value={extraFilters.role || 'ALL'}
                onChange={(e) => handleFilterChange('role', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="ALL">All Roles</option>
                {(filterOptions.roles || []).map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="section" className="block text-sm font-medium text-gray-700">
                Section
              </label>
              <select
                id="section"
                value={extraFilters.section || 'ALL'}
                onChange={(e) => handleFilterChange('section', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="ALL">All Sections</option>
                {(filterOptions.sections || []).map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="status-user" className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                id="status-user"
                value={extraFilters.status || 'ALL'}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {(filterOptions.status_options || []).map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </>
        );

      case 'inspection':
      case 'compliance':
      case 'non_compliant':
      case 'section_accomplishment':
      case 'unit_accomplishment':
      case 'monitoring_accomplishment':
        return (
          <>
            <div className="space-y-2">
              <label htmlFor="law" className="block text-sm font-medium text-gray-700">
                Law
              </label>
              <select
                id="law"
                value={extraFilters.law || 'ALL'}
                onChange={(e) => handleFilterChange('law', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="ALL">All Laws</option>
                {(filterOptions.laws || []).map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {reportType === 'inspection' && (
              <div className="space-y-2">
                <label htmlFor="inspector" className="block text-sm font-medium text-gray-700">
                  Inspector
                </label>
                <select
                  id="inspector"
                  value={extraFilters.inspector_id?.toString() || ''}
                  onChange={(e) => handleFilterChange('inspector_id', e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Inspectors</option>
                  {(filterOptions.inspectors || []).map((option) => (
                    <option key={option.value} value={option.value.toString()}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {(reportType === 'section_accomplishment' || reportType === 'unit_accomplishment' || reportType === 'monitoring_accomplishment') && (
              <div className="space-y-2">
                <label htmlFor="compliance" className="block text-sm font-medium text-gray-700">
                  Compliance Status
                </label>
                <select
                  id="compliance"
                  value={extraFilters.compliance || 'ALL'}
                  onChange={(e) => handleFilterChange('compliance', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {(filterOptions.compliance_options || []).map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </>
        );

      case 'billing':
        return (
          <>
            <div className="space-y-2">
              <label htmlFor="status-billing" className="block text-sm font-medium text-gray-700">
                Payment Status
              </label>
              <select
                id="status-billing"
                value={extraFilters.status || 'ALL'}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {(filterOptions.status_options || []).map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="billing-code" className="block text-sm font-medium text-gray-700">
                Billing Code
              </label>
              <input
                id="billing-code"
                type="text"
                placeholder="Search by billing code"
                value={extraFilters.billing_code || ''}
                onChange={(e) => handleFilterChange('billing_code', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="min-amount" className="block text-sm font-medium text-gray-700">
                  Min Amount
                </label>
                <input
                  id="min-amount"
                  type="number"
                  placeholder="0.00"
                  value={extraFilters.min_amount || ''}
                  onChange={(e) => handleFilterChange('min_amount', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="max-amount" className="block text-sm font-medium text-gray-700">
                  Max Amount
                </label>
                <input
                  id="max-amount"
                  type="number"
                  placeholder="999999.00"
                  value={extraFilters.max_amount || ''}
                  onChange={(e) => handleFilterChange('max_amount', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div> */}
          </>
        );

      case 'quota':
        return (
          <div className="space-y-2">
            <label htmlFor="law-quota" className="block text-sm font-medium text-gray-700">
              Law
            </label>
            <select
              id="law-quota"
              value={extraFilters.law || 'ALL'}
              onChange={(e) => handleFilterChange('law', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="ALL">All Laws</option>
              {(filterOptions.laws || []).map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        );

      case 'law':
        return (
          <div className="space-y-2">
            <label htmlFor="status-law" className="block text-sm font-medium text-gray-700">
              Status
            </label>
            <select
              id="status-law"
              value={extraFilters.status || 'ALL'}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {(filterOptions.status_options || []).map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        );

      case 'nov':
        return (
          <>
            <div className="space-y-2">
              <label htmlFor="law-nov" className="block text-sm font-medium text-gray-700">
                Law
              </label>
              <select
                id="law-nov"
                value={extraFilters.law || 'ALL'}
                onChange={(e) => handleFilterChange('law', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="ALL">All Laws</option>
                {(filterOptions.laws || []).map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* <div className="space-y-2">
              <label htmlFor="sent-by-nov" className="block text-sm font-medium text-gray-700">
                Sent By
              </label>
              <select
                id="sent-by-nov"
                value={extraFilters.sent_by_id?.toString() || ''}
                onChange={(e) => handleFilterChange('sent_by_id', e.target.value ? parseInt(e.target.value) : null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Senders</option>
                {(filterOptions.senders || []).map((option) => (
                  <option key={option.value} value={option.value.toString()}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div> */}

            <div className="space-y-2">
              <label htmlFor="establishment-nov" className="block text-sm font-medium text-gray-700">
                Establishment
              </label>
              <select
                id="establishment-nov"
                value={extraFilters.establishment_id?.toString() || ''}
                onChange={(e) => handleFilterChange('establishment_id', e.target.value ? parseInt(e.target.value) : null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Establishments</option>
                {(filterOptions.establishments || []).map((option) => (
                  <option key={option.value} value={option.value.toString()}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="status-nov" className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                id="status-nov"
                value={extraFilters.status || 'ALL'}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {(filterOptions.status_options || []).map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </>
        );

      case 'noo':
        return (
          <>
            <div className="space-y-2">
              <label htmlFor="law-noo" className="block text-sm font-medium text-gray-700">
                Law
              </label>
              <select
                id="law-noo"
                value={extraFilters.law || 'ALL'}
                onChange={(e) => handleFilterChange('law', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="ALL">All Laws</option>
                {(filterOptions.laws || []).map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* <div className="space-y-2">
              <label htmlFor="sent-by-noo" className="block text-sm font-medium text-gray-700">
                Sent By
              </label>
              <select
                id="sent-by-noo"
                value={extraFilters.sent_by_id?.toString() || ''}
                onChange={(e) => handleFilterChange('sent_by_id', e.target.value ? parseInt(e.target.value) : null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Senders</option>
                {(filterOptions.senders || []).map((option) => (
                  <option key={option.value} value={option.value.toString()}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div> */}

            <div className="space-y-2">
              <label htmlFor="establishment-noo" className="block text-sm font-medium text-gray-700">
                Establishment
              </label>
              <select
                id="establishment-noo"
                value={extraFilters.establishment_id?.toString() || ''}
                onChange={(e) => handleFilterChange('establishment_id', e.target.value ? parseInt(e.target.value) : null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Establishments</option>
                {(filterOptions.establishments || []).map((option) => (
                  <option key={option.value} value={option.value.toString()}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="status-noo" className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                id="status-noo"
                value={extraFilters.status || 'ALL'}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {(filterOptions.status_options || []).map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="min-penalty-noo" className="block text-sm font-medium text-gray-700">
                  Min Penalty
                </label>
                <input
                  id="min-penalty-noo"
                  type="number"
                  placeholder="0.00"
                  min="0"
                  value={extraFilters.min_penalty || ''}
                  onChange={(e) => handleFilterChange('min_penalty', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="max-penalty-noo" className="block text-sm font-medium text-gray-700">
                  Max Penalty
                </label>
                <input
                  id="max-penalty-noo"
                  type="number"
                  placeholder="999999.00"
                  min="0"
                  value={extraFilters.max_penalty || ''}
                  onChange={(e) => handleFilterChange('max_penalty', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div> */}
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {renderFilters()}
      </div>
    </div>
  );
}
