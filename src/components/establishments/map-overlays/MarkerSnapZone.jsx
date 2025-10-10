import { Circle } from "react-leaflet";

export default function MarkerSnapZone({ 
  center, 
  radius = 20, 
  isActive = false 
}) {
  if (!center || !isActive) {
    return null;
  }

  return (
    <Circle
      center={[center.lat, center.lng]}
      radius={radius}
      pathOptions={{
        color: '#3b82f6',
        weight: 2,
        opacity: 0.6,
        fillColor: '#3b82f6',
        fillOpacity: 0.1,
        dashArray: '5 5',
        className: 'marker-snap-zone'
      }}
      eventHandlers={{
        mouseover: (e) => {
          e.target.setStyle({
            opacity: 0.8,
            fillOpacity: 0.15
          });
        },
        mouseout: (e) => {
          e.target.setStyle({
            opacity: 0.6,
            fillOpacity: 0.1
          });
        }
      }}
    />
  );
}
