import React, { useState, useEffect } from 'react';
import { getEstablishments, createInspection } from '../../services/api';
import { notificationManager, NOTIFICATION_TYPES } from '../NotificationManager';

const CreateInspectionWizard = ({ onClose, onSuccess }) => {
  const [step, setStep] = useState(1);
  const [establishments, setEstablishments] = useState([]);
  const [selectedEstablishments, setSelectedEstablishments] = useState([]);
  const [selectedLaw, setSelectedLaw] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [inspectionNotes, setInspectionNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const laws = [
    { code: 'PD-1586', name: 'Presidential Decree No. 1586 - Environmental Impact Assessment' },
    { code: 'RA-6969', name: 'Republic Act No. 6969 - Toxic Substances and Hazardous Waste' },
    { code: 'RA-8749', name: 'Republic Act No. 8749 - Clean Air Act' },
    { code: 'RA-9275', name: 'Republic Act No. 9275 - Clean Water Act' },
    { code: 'RA-9003', name: 'Republic Act No. 9003 - Ecological Solid Waste Management' },
  ];

  useEffect(() => {
    fetchEstablishments();
  }, []);

  const fetchEstablishments = async () => {
    try {
      const establishmentsData = await getEstablishments();
      setEstablishments(establishmentsData.results || establishmentsData);
    } catch (err) {
      setError('Failed to fetch establishments');
      notificationManager.add({
        type: NOTIFICATION_TYPES.ERROR,
        title: 'Error',
        message: 'Failed to fetch establishments'
      });
    }
  };

  const toggleEstablishment = (id) => {
    setSelectedEstablishments((prev) =>
      prev.includes(id) ? prev.filter((estId) => estId !== id) : [...prev, id]
    );
  };

  const handleNext = () => {
    if (step === 1 && selectedEstablishments.length === 0) {
      setError('Please select at least one establishment');
      return;
    }
    if (step === 2 && !selectedLaw) {
      setError('Please select a law');
      return;
    }
    setError('');
    setStep(step + 1);
  };

  const handleBack = () => {
    setError('');
    setStep(step - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      const payload = {
        establishments: selectedEstablishments,
        law: selectedLaw,
        scheduled_at: scheduledAt || null,
        inspection_notes: inspectionNotes,
      };

      const createdInspection = await createInspection(payload);
      notificationManager.add({
        type: NOTIFICATION_TYPES.SUCCESS,
        title: 'Success',
        message: 'Inspection created successfully'
      });
      onSuccess(createdInspection);
      onClose();
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.response?.data?.message || 'Failed to create inspection';
      setError(errorMessage);
      notificationManager.add({
        type: NOTIFICATION_TYPES.ERROR,
        title: 'Error',
        message: errorMessage
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
      <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">
            Create Inspection - Step {step} of 3
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 pt-4">
          <div className="flex items-center">
            <div className={`flex-1 h-2 rounded ${step >= 1 ? 'bg-blue-600' : 'bg-gray-200'}`} />
            <div className={`flex-1 h-2 rounded mx-2 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`} />
            <div className={`flex-1 h-2 rounded ${step >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`} />
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {/* Step 1: Select Establishments */}
          {step === 1 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Select Establishments</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {establishments.map((est) => (
                  <label
                    key={est.id}
                    className="flex items-start p-3 border rounded hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedEstablishments.includes(est.id)}
                      onChange={() => toggleEstablishment(est.id)}
                      className="mt-1 mr-3"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{est.name}</div>
                      <div className="text-sm text-gray-600">{est.nature_of_business}</div>
                      <div className="text-xs text-gray-500">
                        {est.city}, {est.province}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
              <div className="mt-4 text-sm text-gray-600">
                Selected: {selectedEstablishments.length} establishment(s)
              </div>
            </div>
          )}

          {/* Step 2: Select Law */}
          {step === 2 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Select Law</h3>
              <div className="space-y-2">
                {laws.map((law) => (
                  <label
                    key={law.code}
                    className="flex items-start p-4 border rounded hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="law"
                      value={law.code}
                      checked={selectedLaw === law.code}
                      onChange={(e) => setSelectedLaw(e.target.value)}
                      className="mt-1 mr-3"
                    />
                    <div>
                      <div className="font-medium text-gray-900">{law.code}</div>
                      <div className="text-sm text-gray-600">{law.name}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Review and Confirm */}
          {step === 3 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Review and Confirm</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Selected Establishments ({selectedEstablishments.length})
                  </label>
                  <div className="bg-gray-50 p-3 rounded border">
                    {establishments
                      .filter((est) => selectedEstablishments.includes(est.id))
                      .map((est) => (
                        <div key={est.id} className="mb-2 last:mb-0">
                          <div className="font-medium">{est.name}</div>
                          <div className="text-sm text-gray-600">
                            {est.city}, {est.province}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Selected Law
                  </label>
                  <div className="bg-gray-50 p-3 rounded border">
                    <div className="font-medium">{selectedLaw}</div>
                    <div className="text-sm text-gray-600">
                      {laws.find((l) => l.code === selectedLaw)?.name}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Scheduled Date (Optional)
                  </label>
                  <input
                    type="datetime-local"
                    value={scheduledAt}
                    onChange={(e) => setScheduledAt(e.target.value)}
                    className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Inspection Notes (Optional)
                  </label>
                  <textarea
                    value={inspectionNotes}
                    onChange={(e) => setInspectionNotes(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                    placeholder="Add any notes or instructions..."
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-6 border-t">
          <button
            onClick={step === 1 ? onClose : handleBack}
            className="px-4 py-2 text-gray-700 border rounded hover:bg-gray-50"
            disabled={loading}
          >
            {step === 1 ? 'Cancel' : 'Back'}
          </button>
          <button
            onClick={step === 3 ? handleSubmit : handleNext}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
            disabled={loading}
          >
            {loading ? 'Creating...' : step === 3 ? 'Create Inspection' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateInspectionWizard;

