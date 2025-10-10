import { Zap, MapPin } from "lucide-react";

export default function SnapIndicator({ 
  distance = 0, 
  type = "edge", // "edge" or "marker"
  isActive = false 
}) {
  if (!isActive || distance === 0) {
    return null;
  }

  const getSnapInfo = () => {
    if (type === "marker") {
      return {
        icon: MapPin,
        label: "Marker Snap",
        color: "text-blue-600",
        bgColor: "bg-blue-50",
        borderColor: "border-blue-200"
      };
    }
    
    return {
      icon: Zap,
      label: "Edge Snap",
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200"
    };
  };

  const snapInfo = getSnapInfo();
  const Icon = snapInfo.icon;

  return (
    <div className={`${snapInfo.bgColor} ${snapInfo.borderColor} border rounded-lg shadow-lg p-3 max-w-xs`}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <Icon size={14} className={snapInfo.color} />
        <span className={`text-xs font-semibold ${snapInfo.color}`}>
          {snapInfo.label}
        </span>
      </div>

      {/* Distance */}
      <div className="text-xs text-gray-600">
        <span className="font-medium">Distance:</span> {distance.toFixed(1)}m
      </div>

      {/* Visual indicator */}
      <div className="mt-2">
        <div className={`w-2 h-2 rounded-full ${snapInfo.color.replace('text-', 'bg-')} animate-pulse`} />
      </div>
    </div>
  );
}
