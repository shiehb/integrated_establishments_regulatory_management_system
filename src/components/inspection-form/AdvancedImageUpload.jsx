import React, { useState, useRef } from 'react';
import { Upload, X, FileText, Image as ImageIcon, AlertCircle, CheckCircle, Loader } from 'lucide-react';

/**
 * AdvancedImageUpload Component
 * Features: File validation, drag & drop, preview, captions, delete, progress indicators
 */
export default function AdvancedImageUpload({
  images = [],
  setImages,
  onUpload,
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
    }

    // Set errors if any
    setUploadErrors(errors);
    
    // Clear errors after 5 seconds
    if (errors.length > 0) {
      setTimeout(() => setUploadErrors([]), 5000);
    }
  };

  // Remove image
  const removeImage = (id) => {
    const imageToRemove = images.find(img => img.id === id);
    if (imageToRemove && imageToRemove.url && imageToRemove.url.startsWith('blob:')) {
      URL.revokeObjectURL(imageToRemove.url);
    }
    setImages(images.filter((img) => img.id !== id));
  };

  // Update caption
  const updateCaption = (id, caption) => {
    setImages(images.map(img => 
      img.id === id ? { ...img, caption } : img
    ));
  };

  // Upload all images
  const handleUploadAll = async () => {
    const unuploadedImages = images.filter(img => !img.uploaded);
    
    if (unuploadedImages.length === 0) {
      return;
    }

    if (onUpload) {
      await onUpload(unuploadedImages);
    } else {
      // Default upload simulation
      for (const img of unuploadedImages) {
        // Simulate upload progress
        setImages(prev => prev.map(i => 
          i.id === img.id ? { ...i, uploadProgress: 50 } : i
        ));
        
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setImages(prev => prev.map(i => 
          i.id === img.id ? { ...i, uploadProgress: 100, uploaded: true } : i
        ));
      }
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

      {/* Drop Zone */}
      {!isReadOnly && (
        <div
          className={`
            border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-200
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
          <p className="mt-2 text-sm font-medium text-gray-700">
            {isDragging ? 'Drop files here' : 'Drag & drop files here or click to browse'}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Accepted: JPG, PNG, WEBP, PDF • Max {(maxFileSize / 1024 / 1024).toFixed(0)}MB per file • Max {maxFiles} files
          </p>
          <p className="text-xs text-gray-400 mt-1">
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
      )}

      {/* Image Previews */}
      {images.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-gray-700">
              Selected Files ({images.length})
            </h4>
            {!isReadOnly && images.some(img => !img.uploaded) && (
              <button
                onClick={handleUploadAll}
                className="px-3 py-1.5 text-xs font-medium text-white bg-sky-600 rounded-md hover:bg-sky-700 transition-colors flex items-center gap-1.5"
              >
                <Upload className="w-3.5 h-3.5" />
                Upload All ({images.filter(img => !img.uploaded).length})
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {images.map((image) => (
              <div 
                key={image.id} 
                className="relative group bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-all duration-200"
              >
                {/* Image/File Preview */}
                <div className="relative h-32 bg-gray-100 flex items-center justify-center">
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
                      onClick={(e) => {
                        e.stopPropagation();
                        removeImage(image.id);
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
                <div className="p-2.5 space-y-2">
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
                      className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
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

          {/* Summary Info */}
          <div className="flex items-center justify-between text-xs text-gray-600 pt-2 border-t border-gray-200">
            <span>
              {images.filter(img => img.uploaded).length} of {images.length} uploaded
            </span>
            <span>
              Total size: {formatFileSize(images.reduce((sum, img) => sum + img.size, 0))}
            </span>
          </div>
        </div>
      )}

      {/* Empty State */}
      {images.length === 0 && isReadOnly && (
        <div className="p-4 text-center text-sm text-gray-500 bg-gray-50 border border-gray-200 rounded-md">
          No documents uploaded
        </div>
      )}
    </div>
  );
}

