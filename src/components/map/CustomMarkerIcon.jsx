import L from 'leaflet';
import { renderToString } from 'react-dom/server';
import React from 'react';

export const createCustomMarkerIcon = (IconComponent, color = '#3b82f6', size = 36) => {
  const iconHtml = renderToString(
    React.createElement('div', {
      style: {
        backgroundColor: color,
        borderRadius: '50%',
        width: `${size}px`,
        height: `${size}px`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '3px solid white',
        boxShadow: '0 3px 12px rgba(0,0,0,0.3)',
        color: 'white'
      }
    }, React.createElement(IconComponent, { size: size * 0.5, strokeWidth: 2.5 }))
  );

  return L.divIcon({
    html: iconHtml,
    className: 'custom-marker-icon',
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size]
  });
};
