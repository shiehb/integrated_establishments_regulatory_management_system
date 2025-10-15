import React, { useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Download, ZoomIn, ZoomOut } from 'lucide-react';
import { useState } from 'react';

/**
 * ImageLightbox Component
 * Full-screen image viewer with zoom, navigation, and download
 */
export default function ImageLightbox({ 
  images = [], 
  currentIndex = 0, 
  onClose,
  onNavigate 
}) {
  const [zoomLevel, setZoomLevel] = useState(1);
  const currentImage = images[currentIndex];

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && currentIndex > 0) onNavigate(currentIndex - 1);
      if (e.key === 'ArrowRight' && currentIndex < images.length - 1) onNavigate(currentIndex + 1);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, images.length, onClose, onNavigate]);

  // Reset zoom when changing images
  useEffect(() => {
    setZoomLevel(1);
  }, [currentIndex]);

  // Handle zoom
  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.5, 3));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.5, 0.5));

  // Handle download
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = currentImage.url;
    link.download = currentImage.name || 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!currentImage) return null;

  const isPDF = currentImage.type === 'application/pdf';

  return (
    <div 
      className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors z-10"
        title="Close (ESC)"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Navigation - Previous */}
      {currentIndex > 0 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNavigate(currentIndex - 1);
          }}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors z-10"
          title="Previous (←)"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}

      {/* Navigation - Next */}
      {currentIndex < images.length - 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNavigate(currentIndex + 1);
          }}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors z-10"
          title="Next (→)"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}

      {/* Top Controls */}
      <div className="absolute top-4 left-4 flex items-center gap-3 z-10">
        {/* Image Counter */}
        <div className="px-3 py-1.5 bg-white/10 text-white text-sm rounded-md backdrop-blur-sm">
          {currentIndex + 1} / {images.length}
        </div>

        {/* Zoom Controls */}
        {!isPDF && (
          <div className="flex items-center gap-2 bg-white/10 rounded-md backdrop-blur-sm">
            <button
              onClick={handleZoomOut}
              disabled={zoomLevel <= 0.5}
              className="p-2 text-white hover:bg-white/20 rounded-l-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-xs text-white px-2">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              disabled={zoomLevel >= 3}
              className="p-2 text-white hover:bg-white/20 rounded-r-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Download Button */}
        <button
          onClick={handleDownload}
          className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-md transition-colors"
          title="Download"
        >
          <Download className="w-4 h-4" />
        </button>
      </div>

      {/* Main Image Container */}
      <div className="relative max-w-7xl max-h-full flex items-center justify-center">
        {isPDF ? (
          // PDF Preview - Open in new tab
          <div className="bg-white rounded-lg p-8 text-center">
            <FileText className="w-16 h-16 text-red-600 mx-auto mb-4" />
            <p className="text-gray-900 font-semibold mb-2">{currentImage.name}</p>
            <p className="text-sm text-gray-600 mb-4">PDF files cannot be previewed in lightbox</p>
            <button
              onClick={() => window.open(currentImage.url, '_blank')}
              className="px-4 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700 transition-colors"
            >
              Open PDF in New Tab
            </button>
          </div>
        ) : (
          <img
            src={currentImage.url}
            alt={currentImage.caption || currentImage.name}
            className="max-w-full max-h-[80vh] object-contain transition-transform duration-200 cursor-zoom-in"
            style={{ transform: `scale(${zoomLevel})` }}
            onClick={(e) => e.stopPropagation()}
          />
        )}
      </div>

      {/* Bottom Info Bar */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-sm text-white rounded-lg px-4 py-2 max-w-2xl">
        <p className="text-sm font-medium text-center truncate">
          {currentImage.caption || currentImage.name}
        </p>
        {currentImage.caption && (
          <p className="text-xs text-gray-300 text-center mt-0.5">
            {currentImage.name} • {formatFileSize(currentImage.size)}
          </p>
        )}
      </div>
    </div>
  );
}

// Helper function
function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1024 / 1024).toFixed(1) + ' MB';
}

