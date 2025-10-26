import { useState } from 'react';
import { SELECTABLE_ICONS, ESTABLISHMENT_ICON_MAP } from '../../constants/markerIcons';

export default function IconSelector({ selectedIconKey, onIconChange, natureOfBusiness }) {
  const [isOpen, setIsOpen] = useState(false);
  
  const currentIcon = ESTABLISHMENT_ICON_MAP[selectedIconKey] || ESTABLISHMENT_ICON_MAP['DEFAULT'];
  const CurrentIconComponent = currentIcon.icon;

  return (
    <div className="absolute bottom-4 right-4 z-[1000] bg-white/95 backdrop-blur-sm rounded-lg shadow-xl">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="p-3 flex items-center gap-2 hover:bg-gray-50 rounded-lg transition-colors"
        >
          <div style={{ color: currentIcon.color }}>
            <CurrentIconComponent size={24} strokeWidth={2} />
          </div>
          <span className="text-sm font-medium text-gray-700">Change Icon</span>
        </button>
      ) : (
        <div className="p-4 w-80">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-700">Select Marker Icon</h3>
            <button 
              onClick={() => setIsOpen(false)} 
              className="text-gray-400 hover:text-gray-600 text-xl"
            >
              ×
            </button>
          </div>
          <div className="grid grid-cols-5 gap-2 max-h-64 overflow-y-auto">
            {SELECTABLE_ICONS.map(({ key, icon: Icon, color, label }) => (
              <button
                key={key}
                onClick={() => {
                  onIconChange(key);
                  setIsOpen(false);
                }}
                className={`p-2 rounded-lg hover:bg-gray-100 transition-all ${
                  selectedIconKey === key ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                }`}
                title={label}
              >
                <div style={{ color }}>
                  <Icon size={20} strokeWidth={2} />
                </div>
              </button>
            ))}
          </div>
          {natureOfBusiness && (
            <button
              onClick={() => {
                const defaultIcon = Object.keys(ESTABLISHMENT_ICON_MAP).find(k => k === natureOfBusiness);
                if (defaultIcon) onIconChange(defaultIcon);
                setIsOpen(false);
              }}
              className="mt-3 w-full text-xs text-blue-600 hover:text-blue-700"
            >
              Reset to default for {natureOfBusiness}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
