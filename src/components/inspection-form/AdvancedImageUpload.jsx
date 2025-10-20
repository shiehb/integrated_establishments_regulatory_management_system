import React, { useState, useRef } from 'react';
import { Upload, X, FileText, Image as ImageIcon, AlertCircle, CheckCircle, Loader, Plus } from 'lucide-react';
import ImageLightbox from './ImageLightbox';

/**
 * AdvancedImageUpload Component
 * Features: File validation, drag & drop, preview, captions, delete, progress indicators
 */
export default function AdvancedImageUpload({
  images = [],
  setImages,
  onUpload,
  onDelete,
  maxFileSize = 5 * 1024 * 1024, // 5MB default
  allowedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'],
  maxFiles = 10,
  showCaptions = true,
  isReadOnly = false,
  label = "Upload Evidence Documents",
  systemId = null, // For associating with specific finding system
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadErrors, setUploadErrors] = useState([]);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const fileInputRef = useRef(null);

  // Validate file
  const validateFile = (file) => {
    const errors = [];

    // Check file size
    if (file.size > maxFileSize) {
      errors.push(`${file.name}: File exceeds ${(maxFileSize / 1024 / 1024).toFixed(1)}MB limit`);
    }

    // Check file format
    if (!allowedFormats.includes(file.type)) {
      const allowedExts = allowedFormats.map(format => {
        if (format.startsWith('image/')) return format.replace('image/', '').toUpperCase();
        if (format === 'application/pdf') return 'PDF';
        return format;
      }).join(', ');
      errors.push(`${file.name}: Invalid format. Allowed: ${allowedExts}`);
    }

    return errors;
  };

  // Handle file selection
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    handleFiles(files);
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle drag over
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  // Handle drag leave
  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  // Handle drop
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  // Process files
  const handleFiles = (files) => {
    const errors = [];
    const validFiles = [];

    // Check max files limit
    if (images.length + files.length > maxFiles) {
      errors.push(`Maximum ${maxFiles} files allowed. You have ${images.length} files and tried to add ${files.length} more.`);
      setUploadErrors(errors);
      return;
    }

    // Validate each file
    files.forEach((file) => {
      const fileErrors = validateFile(file);
      if (fileErrors.length > 0) {
        errors.push(...fileErrors);
      } else {
        validFiles.push(file);
      }
    });

    // Add valid files to images array
    if (validFiles.length > 0) {
      const newImages = validFiles.map((file) => ({
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        file,
        url: URL.createObjectURL(file),
        name: file.name,
        type: file.type,
        size: file.size,
        caption: '',
        uploaded: false,
        uploadProgress: 0,
        error: null,
        systemId: systemId || 'general'
      }));

      setImages([...images, ...newImages]);

      // Auto-upload each new image
      newImages.forEach(image => {
        autoUploadImage(image);
      });
    }

    // Set errors if any
    setUploadErrors(errors);
    
    // Clear errors after 5 seconds
    if (errors.length > 0) {
      setTimeout(() => setUploadErrors([]), 5000);
    }
  };

  // Remove image
  const removeImage = async (id) => {
    const imageToRemove = images.find(img => img.id === id);
    
    try {
      // If image has a backendId, delete from backend first
      if (imageToRemove?.backendId && onDelete) {
        await onDelete(id, imageToRemove.backendId);
      }
      
      // Clean up blob URL if it's a local file
      if (imageToRemove && imageToRemove.url && imageToRemove.url.startsWith('blob:')) {
        URL.revokeObjectURL(imageToRemove.url);
      }
      
      // Remove from frontend state
      setImages(images.filter((img) => img.id !== id));
      
    } catch (error) {
      console.error('Failed to delete image:', error);
      // Don't remove from frontend if backend deletion failed
    }
  };

  // Update caption
  const updateCaption = (id, caption) => {
    setImages(images.map(img => 
      img.id === id ? { ...img, caption } : img
    ));
  };

  // Open lightbox
  const openLightbox = (index) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  // Auto-upload individual image
  const autoUploadImage = async (image) => {
    if (!onUpload || image.uploaded) {
      return;
    }

    try {
      // Update progress to show uploading
      setImages(prev => prev.map(i => 
        i.id === image.id ? { ...i, uploadProgress: 30 } : i
      ));

      // Upload single image
      await onUpload([image]);

      // Mark as uploaded
      setImages(prev => prev.map(i => 
        i.id === image.id ? { ...i, uploadProgress: 100, uploaded: true } : i
      ));
    } catch (error) {
      // Mark as error
      setImages(prev => prev.map(i => 
        i.id === image.id ? { ...i, error: error.message || 'Upload failed' } : i
      ));
    }
  };

  // Get file icon
  const getFileIcon = (type) => {
    if (type === 'application/pdf') {
      return <FileText className="w-8 h-8 text-red-600" />;
    }
    return <ImageIcon className="w-8 h-8 text-gray-400" />;
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1024 / 1024).toFixed(1) + ' MB';
  };

  return (
    <div className="space-y-3">
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}

      {/* Upload Errors */}
      {uploadErrors.length > 0 && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-800 mb-1">Upload Errors:</p>
              <ul className="space-y-1">
                {uploadErrors.map((error, idx) => (
                  <li key={idx} className="text-xs text-red-700">• {error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Dynamic Drop Zone */}
      {!isReadOnly && (
        <>
          {images.length === 0 ? (
            // Full-width drop zone when no images
            <div
              className={`
                border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200
                ${isDragging 
                  ? 'border-sky-500 bg-sky-50 scale-105' 
                  : 'border-gray-300 bg-white hover:border-sky-400 hover:bg-sky-50/50'
                }
                ${images.length >= maxFiles ? 'opacity-50 cursor-not-allowed' : ''}
              `}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => images.length < maxFiles && fileInputRef.current?.click()}
            >
              <Upload className={`mx-auto ${isDragging ? 'text-sky-600' : 'text-gray-400'} transition-colors`} size={32} />
              <p className="mt-3 text-base font-medium text-gray-700">
                {isDragging ? 'Drop files here' : 'Drag & drop files here or click to browse'}
              </p>
              <p className="mt-2 text-sm text-gray-500">
                JPG, PNG, WEBP, PDF • Max {(maxFileSize / 1024 / 1024).toFixed(0)}MB • Max {maxFiles} files
              </p>
              <p className="text-sm text-gray-400 mt-1">
                {images.length}/{maxFiles} files selected
              </p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept={allowedFormats.join(',')}
                className="hidden"
                onChange={handleFileChange}
                disabled={images.length >= maxFiles}
              />
            </div>
          ) : (
            // Compact drop zone in grid when images exist
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {/* Compact drop zone as first grid item */}
              <div
                className={`
                  h-24 border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer transition-all duration-200
                  ${isDragging 
                    ? 'border-sky-500 bg-sky-50 scale-105' 
                    : 'border-gray-300 bg-white hover:border-sky-400 hover:bg-sky-50/50'
                  }
                  ${images.length >= maxFiles ? 'opacity-50 cursor-not-allowed' : ''}
                `}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => images.length < maxFiles && fileInputRef.current?.click()}
              >
                <Plus className={`${isDragging ? 'text-sky-600' : 'text-gray-400'} transition-colors`} size={24} />
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept={allowedFormats.join(',')}
                  className="hidden"
                  onChange={handleFileChange}
                  disabled={images.length >= maxFiles}
                />
              </div>
              
              {/* Image thumbnails */}
              {images.map((image, index) => (
                <div 
                  key={image.id} 
                  className="relative group bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-all duration-200"
                >
                  {/* Image/File Preview */}
                  <div 
                    className="relative h-24 bg-gray-100 flex items-center justify-center cursor-pointer hover:scale-105 transition-transform"
                    onClick={() => openLightbox(index)}
                  >
                    {image.type === 'application/pdf' ? (
                      <div className="flex flex-col items-center">
                        {getFileIcon(image.type)}
                        <span className="text-xs text-gray-600 mt-1">PDF Document</span>
                      </div>
                    ) : (
                      <img
                        src={image.url}
                        alt={image.caption || image.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                    
                    {/* Delete Button */}
                    {!isReadOnly && (
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          await removeImage(image.id);
                        }}
                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600"
                      >
                        <X size={14} />
                      </button>
                    )}

                    {/* Upload Status Badge */}
                    {image.uploaded && (
                      <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-green-500 text-white text-xs rounded-full flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Uploaded
                      </div>
                    )}
                    
                    {/* Upload Progress */}
                    {!image.uploaded && image.uploadProgress > 0 && (
                      <div className="absolute bottom-2 left-2 right-2">
                        <div className="bg-white/90 rounded-full overflow-hidden">
                          <div 
                            className="h-1.5 bg-sky-600 transition-all duration-300"
                            style={{ width: `${image.uploadProgress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Error Badge */}
                    {image.error && (
                      <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Error
                      </div>
                    )}
                  </div>

                  {/* File Info & Caption */}
                  <div className="p-2 space-y-1.5">
                    <div className="text-xs text-gray-600 truncate" title={image.name}>
                      {image.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatFileSize(image.size)}
                    </div>
                    
                    {/* Caption Input */}
                    {showCaptions && (
                      <input
                        type="text"
                        placeholder="Add caption..."
                        value={image.caption}
                        onChange={(e) => updateCaption(image.id, e.target.value)}
                        disabled={isReadOnly}
                        className="w-full px-1.5 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-sky-500 focus:border-sky-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                      />
                    )}

                    {/* Error Message */}
                    {image.error && (
                      <p className="text-xs text-red-600">{image.error}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Summary Info - only show when images exist and not in grid mode */}
      {images.length > 0 && (
        <div className="flex items-center justify-between text-xs text-gray-600 pt-2 border-t border-gray-200">
          <span>
            {images.filter(img => img.uploaded).length} of {images.length} uploaded
          </span>
          <span>
            Total size: {formatFileSize(images.reduce((sum, img) => sum + img.size, 0))}
          </span>
        </div>
      )}

      {/* Empty State */}
      {images.length === 0 && isReadOnly && (
        <div className="p-4 text-center text-sm text-gray-500 bg-gray-50 border border-gray-200 rounded-md">
          No documents uploaded
        </div>
      )}

      {/* Image Lightbox */}
      {lightboxOpen && (
        <ImageLightbox
          images={images}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxOpen(false)}
          onNavigate={setLightboxIndex}
        />
      )}
    </div>
  );
}

