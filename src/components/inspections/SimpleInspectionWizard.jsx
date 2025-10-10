import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronLeft,
  ChevronRight,
  Save,
  X,
  Building,
  FileText,
  CheckCircle,
  Search,
  MapPin,
  AlertTriangle
} from 'lucide-react';
import Header from '../Header';
import Footer from '../Footer';
import LayoutWithSidebar from '../LayoutWithSidebar';
import ConfirmationDialog from '../common/ConfirmationDialog';
import { useNotifications } from '../NotificationManager';

// Debounce hook
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const steps = [
  { id: 1, title: 'Select Establishment', icon: Building },
  { id: 2, title: 'Select Law', icon: FileText },
  { id: 3, title: 'Preview & Confirm', icon: CheckCircle }
];

export default function SimpleInspectionWizard({
  onClose, 
  onSave,
  userProfile,
  establishments = [],
  establishmentsLoading = false,
  laws = [],
  userLevel = 'Division Chief',
  onRefreshEstablishments,
  onSearchEstablishments
}) {
  const notifications = useNotifications();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    establishment_ids: [],
    establishment_search: '',
    law_code: '',
    inspection_type: 'ROUTINE',
    priority: 'MEDIUM',
    scheduled_date: '',
    description: ''
  });
  const [errors, setErrors] = useState({});
  const [filteredEstablishments, setFilteredEstablishments] = useState(establishments);
  const [showConfirmation, setShowConfirmation] = useState(false);
  
  // Debounced search query
  const debouncedSearchQuery = useDebounce(formData.establishment_search, 500);
  const previousSearchQuery = useRef('');

  // Trigger API search when debounced query changes
  useEffect(() => {
    if (onSearchEstablishments && debouncedSearchQuery !== previousSearchQuery.current) {
      previousSearchQuery.current = debouncedSearchQuery;
      onSearchEstablishments(debouncedSearchQuery);
    }
  }, [debouncedSearchQuery]); // Remove onSearchEstablishments from dependencies to prevent re-calls

  // Update filtered establishments when establishments change
  useEffect(() => {
    setFilteredEstablishments(establishments);
  }, [establishments]);

  const validateStep = (step) => {
    const newErrors = {};
    
    switch (step) {
      case 1:
        if (!formData.establishment_ids || formData.establishment_ids.length === 0) {
          newErrors.establishment_ids = 'Please select at least one establishment';
        }
        break;
      case 2:
        if (!formData.law_code) {
          newErrors.law_code = 'Please select a law';
        }
        break;
      case 3:
        // No validation needed for step 3 since we removed the form fields
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = () => {
    if (validateStep(3)) {
      setShowConfirmation(true);
    }
  };

  const confirmSubmit = async () => {
    const selectedEstablishments = establishments.filter(est => 
      formData.establishment_ids.includes(est.id.toString())
    );
    const selectedLaw = laws.find(law => law.code === formData.law_code);
    
    const inspectionData = {
      establishment_ids: formData.establishment_ids,
      establishments: selectedEstablishments,
      law_code: formData.law_code,
      law_name: selectedLaw?.name,
      inspection_type: formData.inspection_type,
      priority: formData.priority,
      created_by: userProfile?.id || 1,
      userlevel: userProfile?.userlevel || 'Division Chief'
    };
    
    setShowConfirmation(false);
    
    try {
      await onSave(inspectionData);
      // Show success notification after inspection is created
      notifications.success(`Inspection created successfully for ${selectedEstablishments.length} establishment(s) with ${selectedLaw?.code}`, {
        title: 'Inspection Created',
        duration: 6000
      });
    } catch (error) {
      // Show error notification if creation fails
      notifications.error(`Failed to create inspection: ${error.message}`, {
        title: 'Creation Failed',
        duration: 8000
      });
    }
  };

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const selectedEstablishments = establishments.filter(est => 
    formData.establishment_ids.includes(est.id.toString())
  );
  const selectedLaw = laws.find(law => law.code === formData.law_code);

  return (
    <>
      <Header />
      <LayoutWithSidebar userLevel="admin">
        <div className="bg-white rounded-lg shadow-sm w-full">
         {/* Progress Steps */}
         <div className="px-6 py-4 border-b border-gray-200">
           <div className="flex items-center w-full">
             {steps.map((step, index) => {
               const Icon = step.icon;
               const isActive = currentStep === step.id;
               const isCompleted = currentStep > step.id;
               
               return (
                 <React.Fragment key={step.id}>
                   <div className="flex flex-col items-center">
                     <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                       isActive 
                         ? 'border-sky-500 bg-sky-500 text-white' 
                         : isCompleted 
                           ? 'border-green-500 bg-green-500 text-white'
                           : 'border-gray-300 bg-white text-gray-400'
                     }`}>
                       <Icon className="h-5 w-5" />
                     </div>
                     <p className={`text-sm font-medium mt-2 ${
                       isActive ? 'text-sky-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                     }`}>
                       {step.title}
                     </p>
                   </div>
                   
                   {index < steps.length - 1 && (
                     <div className="flex-1 mx-4 relative">
                       <div className="absolute top-1/2 left-0 right-0 h-0.5 transform -translate-y-1/2">
                         <div className={`h-full w-full ${
                           isCompleted ? 'bg-green-500' : 'bg-gray-300'
                         }`} />
                       </div>
                     </div>
                   )}
                 </React.Fragment>
               );
             })}
           </div>
         </div>

         {/* Header with Navigation Buttons */}
         <div className="flex items-center justify-between p-6 border-b border-gray-200">
           <button
             onClick={handlePrevious}
             disabled={currentStep === 1}
             className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
           >
             <ChevronLeft className="h-4 w-4 mr-1" />
             Previous
           </button>

           <div className="flex items-center space-x-3">
             <button
               onClick={onClose}
               className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
             >
               Cancel
             </button>
             
             {currentStep === steps.length ? (
               <button
                 onClick={handleSubmit}
                 className="flex items-center px-4 py-2 text-sm font-medium text-white bg-sky-600 border border-transparent rounded-md hover:bg-sky-700"
               >
                 <Save className="h-4 w-4 mr-1" />
                 Create Inspection
               </button>
             ) : (
               <button
                 onClick={handleNext}
                 className="flex items-center px-4 py-2 text-sm font-medium text-white bg-sky-600 border border-transparent rounded-md hover:bg-sky-700"
               >
                 Next
                 <ChevronRight className="h-4 w-4 ml-1" />
               </button>
             )}
           </div>
         </div>

        {/* Content */}
        <div className="p-6">
          {/* Step 1: Establishment Selection */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Establishment</h3>
                
                 {/* Search and Actions */}
                 <div className="mb-4 space-y-3">
                   <div className="flex gap-2">
                     <div className="relative flex-1">
                       <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                       <input
                         type="text"
                         placeholder="Search establishments by name, address, coordinates, nature of business, or year..."
                         value={formData.establishment_search}
                         onChange={(e) => updateFormData('establishment_search', e.target.value)}
                         className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                       />
                     </div>
                     {onRefreshEstablishments && (
                       <button
                         onClick={onRefreshEstablishments}
                         disabled={establishmentsLoading}
                         className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                       >
                         {establishmentsLoading ? (
                           <>
                             <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                             Loading...
                           </>
                         ) : (
                           <>
                             <Search className="h-4 w-4" />
                             Refresh
                           </>
                         )}
                       </button>
                     )}
                   </div>
                   
                   {/* Selection Info */}
                   {formData.establishment_ids.length > 0 && (
                     <div className="flex items-center gap-2">
                       <span className="text-sm text-gray-600">
                         {formData.establishment_ids.length} establishment(s) selected
                       </span>
                     </div>
                   )}
                 </div>

                {/* Establishments Table */}
                <table className="w-full border border-gray-300 rounded-lg">
                  <thead>
                    <tr className="text-sm text-left text-white bg-sky-700">
                      <th className="w-6 p-1 text-center border-b border-gray-300">
                        <input
                          type="checkbox"
                          checked={filteredEstablishments.length > 0 && formData.establishment_ids.length === filteredEstablishments.length}
                          onChange={() => {
                            if (formData.establishment_ids.length === filteredEstablishments.length) {
                              // Clear all
                              updateFormData('establishment_ids', []);
                            } else {
                              // Select all
                              const allIds = filteredEstablishments.map(est => est.id.toString());
                              updateFormData('establishment_ids', allIds);
                            }
                          }}
                        />
                      </th>
                       <th className="p-1 border-b border-gray-300">Name</th>
                       <th className="p-1 border-b border-gray-300">Address</th>
                       <th className="p-1 border-b border-gray-300">Coordinates</th>
                       <th className="p-1 border-b border-gray-300">Nature of Business</th>
                       <th className="p-1 border-b border-gray-300">Year Established</th>
                    </tr>
                  </thead>
                   <tbody>
                     {establishmentsLoading ? (
                       <tr>
                         <td colSpan="6" className="px-2 py-8 text-center text-sm text-gray-500 border-b border-gray-300">
                           <div className="flex flex-col items-center justify-center">
                             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600 mb-2"></div>
                             <p>Loading establishments...</p>
                           </div>
                         </td>
                       </tr>
                     ) : filteredEstablishments.length === 0 ? (
                       <tr>
                         <td colSpan="6" className="px-2 py-4 text-center text-sm text-gray-500 border-b border-gray-300">
                           No establishments found matching your search.
                         </td>
                       </tr>
                     ) : (
                       filteredEstablishments.map((establishment) => (
                      <tr 
                        key={establishment.id}
                        className={`p-1 text-xs border-b border-gray-300 hover:bg-gray-50 cursor-pointer ${
                          formData.establishment_ids.includes(establishment.id.toString()) ? 'bg-sky-50' : ''
                        }`}
                        onClick={() => {
                          const isSelected = formData.establishment_ids.includes(establishment.id.toString());
                          if (isSelected) {
                            // Remove from selection
                            const updatedIds = formData.establishment_ids.filter(id => id !== establishment.id.toString());
                            updateFormData('establishment_ids', updatedIds);
                          } else {
                            // Add to selection
                            const updatedIds = [...formData.establishment_ids, establishment.id.toString()];
                            updateFormData('establishment_ids', updatedIds);
                          }
                        }}
                      >
                        <td className="text-center border-b border-gray-300">
                          <input
                            type="checkbox"
                            checked={formData.establishment_ids.includes(establishment.id.toString())}
                            onChange={(e) => {
                              e.stopPropagation();
                              const isSelected = formData.establishment_ids.includes(establishment.id.toString());
                              if (isSelected) {
                                // Remove from selection
                                const updatedIds = formData.establishment_ids.filter(id => id !== establishment.id.toString());
                                updateFormData('establishment_ids', updatedIds);
                              } else {
                                // Add to selection
                                const updatedIds = [...formData.establishment_ids, establishment.id.toString()];
                                updateFormData('establishment_ids', updatedIds);
                              }
                            }}
                            className="h-4 w-4 text-sky-600 focus:ring-sky-500 border-gray-300 rounded"
                          />
                        </td>
                        <td className="px-2 border-b border-gray-300">
                          <div className="flex items-center">
                            <Building className="h-4 w-4 text-gray-400 mr-2" />
                            <div>
                              <div className="font-medium">{establishment.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-2 border-b border-gray-300">
                          <div className="text-sm text-gray-900">
                            {establishment.address}
                          </div>
                        </td>
                        <td className="px-2 border-b border-gray-300">
                          <div className="text-sm text-gray-900">
                            {establishment.coordinates}
                          </div>
                        </td>
                        <td className="px-2 border-b border-gray-300">
                          <div className="text-sm text-gray-900">
                            {establishment.nature_of_business}
                          </div>
                        </td>
                        <td className="px-2 text-center border-b border-gray-300">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                            {establishment.year_established}
                          </span>
                        </td>
                       </tr>
                     ))
                     )}
                   </tbody>
                </table>

                {errors.establishment_ids && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-1" />
                    {errors.establishment_ids}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Law Selection */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Law/Section</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                  {laws.map((law) => (
                    <div
                      key={law.code}
                      className={`p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                        formData.law_code === law.code
                          ? 'border-sky-500 bg-sky-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                      onClick={() => updateFormData('law_code', law.code)}
                    >
                      <div className="flex items-start">
                        <input
                          type="radio"
                          name="law"
                          value={law.code}
                          checked={formData.law_code === law.code}
                          onChange={() => updateFormData('law_code', law.code)}
                          className="h-4 w-4 text-sky-600 focus:ring-sky-500 border-gray-300 mt-0.5"
                        />
                        <div className="ml-3 flex-1">
                          <div className="text-sm font-medium text-gray-900 mb-1">
                            {law.code}
                          </div>
                          <div className="text-xs text-gray-600 leading-tight">
                            {law.name}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {errors.law_code && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-1" />
                    {errors.law_code}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Preview & Confirmation */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Preview & Confirmation</h3>
                
                 {/* Summary Information */}
                 <div className="bg-sky-50 rounded-lg p-6 mb-6">
                   <h4 className="text-lg font-semibold text-gray-900 mb-4">Inspection Summary</h4>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className="bg-white rounded-lg p-4 border border-sky-200">
                       <div className="flex items-center">
                         <Building className="h-8 w-8 text-sky-600 mr-3" />
                         <div>
                           <p className="text-sm font-medium text-gray-500">Total Establishments</p>
                           <p className="text-2xl font-bold text-sky-600">{selectedEstablishments.length}</p>
                         </div>
                       </div>
                     </div>
                     <div className="bg-white rounded-lg p-4 border border-sky-200">
                       <div className="flex items-center">
                         <FileText className="h-8 w-8 text-green-600 mr-3" />
                         <div>
                           <p className="text-sm font-medium text-gray-500">Selected Law</p>
                           <p className="text-lg font-semibold text-green-600">{selectedLaw?.code || 'None'}</p>
                           <p className="text-sm text-gray-600">{selectedLaw?.name || ''}</p>
                         </div>
                       </div>
                     </div>
                   </div>
                 </div>
                

                {/* Selected Establishments Table */}
                {selectedEstablishments.length > 0 && (
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
                      <Building className="h-5 w-5 mr-2 text-blue-600" />
                      Selected Establishments ({selectedEstablishments.length})
                    </h4>
                    
                    <table className="w-full border border-gray-300 rounded-lg">
                      <thead>
                        <tr className="text-sm text-left text-white bg-sky-700">
                          <th className="p-1 border-b border-gray-300">#</th>
                          <th className="p-1 border-b border-gray-300">Name</th>
                          <th className="p-1 border-b border-gray-300">Address</th>
                          <th className="p-1 border-b border-gray-300">Coordinates</th>
                          <th className="p-1 border-b border-gray-300">Nature of Business</th>
                          <th className="p-1 border-b border-gray-300">Year Established</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedEstablishments.map((establishment, index) => (
                          <tr key={establishment.id} className="p-1 text-xs border-b border-gray-300 hover:bg-gray-50">
                            <td className="px-2 font-semibold border-b border-gray-300">
                              {index + 1}
                            </td>
                            <td className="px-2 border-b border-gray-300">
                              <div className="flex items-center">
                                <Building className="h-4 w-4 text-gray-400 mr-2" />
                                <div>
                                  <div className="font-medium">{establishment.name}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-2 border-b border-gray-300">
                              <div className="text-sm text-gray-900">
                                {establishment.address}
                              </div>
                            </td>
                            <td className="px-2 border-b border-gray-300">
                              <div className="text-sm text-gray-900">
                                {establishment.coordinates}
                              </div>
                            </td>
                            <td className="px-2 border-b border-gray-300">
                              <div className="text-sm text-gray-900">
                                {establishment.nature_of_business}
                              </div>
                            </td>
                            <td className="px-2 text-center border-b border-gray-300">
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                {establishment.year_established}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Selected Law */}
                {selectedLaw && (
                  <div className="bg-green-50 rounded-lg p-4">
                    <h4 className="text-md font-semibold text-gray-900 mb-2 flex items-center">
                      <FileText className="h-5 w-5 mr-2 text-green-600" />
                      Selected Law/Section
                    </h4>
                    <div className="text-sm text-gray-700">
                      <p><strong>Code:</strong> {selectedLaw.code}</p>
                      <p><strong>Name:</strong> {selectedLaw.name}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        </div>
      </LayoutWithSidebar>
      <Footer />

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        open={showConfirmation}
        title="Confirm Inspection Creation"
        message={`Are you sure you want to create this inspection with ${selectedEstablishments.length} establishment(s) and ${selectedLaw?.code}?`}
        confirmText="Create Inspection"
        cancelText="Cancel"
        confirmColor="sky"
        size="md"
        onCancel={() => setShowConfirmation(false)}
        onConfirm={confirmSubmit}
      />
    </>
  );
}
