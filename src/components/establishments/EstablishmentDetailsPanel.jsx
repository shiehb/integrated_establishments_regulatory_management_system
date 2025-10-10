import { 
  MapPin, 
  Building2, 
  Calendar, 
  FileText, 
  MapIcon
} from "lucide-react";

// Helper component for consistent detail row styling
const DetailRow = ({ icon: Icon, label, value, className = "" }) => (
  <div className={`flex items-start gap-3 p-2 rounded ${className}`}>
    <Icon size={16} className="mt-0.5 text-sky-600 flex-shrink-0" />
    <div className="flex-1 min-w-0">
      <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">
        {label}
      </div>
      <div className="text-sm text-gray-800 break-words">
        {value || "Not specified"}
      </div>
    </div>
  </div>
);

export default function EstablishmentDetailsPanel({ establishment }) {
  if (!establishment) {
    return (
      <div className="p-4 bg-white border rounded-lg shadow-sm">
        <div className="text-center text-gray-500">
          <Building2 size={48} className="mx-auto mb-2 text-gray-300" />
          <p>No establishment selected</p>
        </div>
      </div>
    );
  }


  // Format coordinates
  const coordinates = `${parseFloat(establishment.latitude || 0).toFixed(6)}, ${parseFloat(establishment.longitude || 0).toFixed(6)}`;

  return (
    <div className="p-4 bg-white border rounded-lg shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Building2 size={20} className="text-sky-600" />
        <h2 className="text-lg font-bold text-sky-600">
          Establishment Details
        </h2>
      </div>

      {/* Basic Information */}
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">
          Basic Information
        </h3>
        <div className="space-y-1">
          <DetailRow 
            icon={Building2} 
            label="Name" 
            value={establishment.name}
            className="bg-blue-50"
          />
          <DetailRow 
            icon={FileText} 
            label="Business Type" 
            value={establishment.nature_of_business}
          />
          <DetailRow 
            icon={Calendar} 
            label="Year Established" 
            value={establishment.year_established}
          />
        </div>
      </div>

      {/* Address Information */}
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">
          Address
        </h3>
        <div className="space-y-1">
          <DetailRow 
            icon={MapPin} 
            label="Street/Building" 
            value={establishment.street_building}
          />
          <DetailRow 
            icon={MapPin} 
            label="Barangay" 
            value={establishment.barangay}
          />
          <DetailRow 
            icon={MapPin} 
            label="City" 
            value={establishment.city}
          />
          <DetailRow 
            icon={MapPin} 
            label="Province" 
            value={establishment.province}
          />
          <DetailRow 
            icon={MapPin} 
            label="Postal Code" 
            value={establishment.postal_code}
          />
        </div>
      </div>

      {/* Coordinates */}
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">
          Location
        </h3>
        <DetailRow 
          icon={MapIcon} 
          label="Coordinates" 
          value={coordinates}
          className="bg-gray-50 font-mono text-xs"
        />
      </div>

    </div>
  );
}
