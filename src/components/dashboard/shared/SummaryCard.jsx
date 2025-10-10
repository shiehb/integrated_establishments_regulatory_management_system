import React from 'react';
import { ExternalLink } from 'lucide-react';
import LoadingSkeleton from './LoadingSkeleton';

/**
 * SummaryCard Component
 * 
 * A reusable summary card component for displaying key metrics and statistics.
 * Features hover effects, navigation, and optional quick action buttons.
 * 
 * @param {Object} props - Component props
 * @param {string} props.title - Card title text
 * @param {number|string} props.value - Main value to display
 * @param {React.ReactNode} props.icon - Icon component to display
 * @param {string} props.color - CSS classes for card styling
 * @param {string} props.route - Navigation route when card is clicked
 * @param {Object} props.quickAction - Optional quick action configuration
 * @param {React.ReactNode} props.quickAction.icon - Quick action icon
 * @param {string} props.quickAction.route - Quick action navigation route
 * @param {string} props.quickAction.tooltip - Quick action tooltip text
 * @param {boolean} props.isLoading - Whether to show loading state
 * @param {Function} props.onNavigate - Navigation handler function
 * @returns {JSX.Element} Summary card component
 */
const SummaryCard = ({ 
  title, 
  value, 
  icon, 
  color, 
  route, 
  quickAction, 
  isLoading = false,
  onNavigate 
}) => {
  if (isLoading) {
    return <LoadingSkeleton />;
  }

  const handleCardClick = () => {
    if (onNavigate && route) {
      onNavigate(route);
    }
  };

  const handleQuickAction = (e) => {
    e.stopPropagation();
    if (onNavigate && quickAction?.route) {
      onNavigate(quickAction.route);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCardClick();
    }
  };

  const handleQuickActionKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleQuickAction(e);
    }
  };

  return (
    <div 
      className={`bg-white border rounded p-5 transition-all duration-500 hover:shadow-xl hover:shadow-sky-100/50 hover:-translate-y-1 ${color} group cursor-pointer h-full flex flex-col backdrop-blur-sm hover:border-sky-300/60`}
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 rounded-xl bg-gradient-to-br from-sky-50 to-sky-100 shadow-sm border border-sky-200/50">
          {icon}
        </div>
        <div className="flex items-center gap-1.5">
          {quickAction && (
            <button
              onClick={handleQuickAction}
              onKeyDown={handleQuickActionKeyDown}
              className="p-2 rounded-lg bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md hover:bg-white transition-all duration-300 opacity-0 group-hover:opacity-100 transform group-hover:scale-105 border border-gray-200/50 hover:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-opacity-50"
              title={quickAction.tooltip}
              aria-label={quickAction.tooltip}
              tabIndex={0}
            >
              <div className="text-sky-600 hover:text-sky-700 transition-colors duration-200">
                {quickAction.icon}
              </div>
            </button>
          )}
          <button
            className="p-2 rounded-lg bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md hover:bg-white transition-all duration-300 opacity-0 group-hover:opacity-100 transform group-hover:scale-105 border border-gray-200/50 hover:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-opacity-50"
            onClick={handleCardClick}
            onKeyDown={handleKeyDown}
            title={`View all ${title.toLowerCase()}`}
            aria-label={`View all ${title.toLowerCase()}`}
            tabIndex={0}
          >
            <ExternalLink size={16} className="text-sky-600 hover:text-sky-700 transition-colors duration-200" />
          </button>
        </div>
      </div>
      <div className="flex-1 flex flex-col justify-end">
        <div className="text-4xl font-bold text-gray-900 mb-2 tracking-tight group-hover:text-sky-700 transition-colors duration-300">
          {value}
        </div>
        <div className="text-sm font-medium text-gray-600 group-hover:text-gray-700 transition-colors duration-300">
          {title}
        </div>
      </div>
    </div>
  );
};

export default SummaryCard;
