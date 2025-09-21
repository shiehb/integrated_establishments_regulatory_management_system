import { useState } from "react";
import { Upload, X } from "lucide-react";

export default function ImageUpload({ images, setImages, inspectionId }) {
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    handleFiles(files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFiles = (files) => {
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));

    const newImages = imageFiles.map((file) => ({
      id: URL.createObjectURL(file), // temporary ID
      file,
      url: URL.createObjectURL(file),
      name: file.name,
      uploaded: false,
    }));

    setImages([...images, ...newImages]);
  };

  const removeImage = (id) => {
    setImages(images.filter((img) => img.id !== id));
  };

  const uploadImages = async () => {
    // Implement your image upload logic here
    console.log("Uploading images for inspection:", inspectionId);

    // After successful upload, mark images as uploaded
    const updatedImages = images.map((img) => ({ ...img, uploaded: true }));
    setImages(updatedImages);
  };

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer 
          ${isDragging ? "border-sky-500 bg-sky-50" : "border-gray-300"}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => document.getElementById("file-input").click()}
      >
        <Upload className="mx-auto text-gray-400" size={24} />
        <p className="mt-2 text-sm text-gray-600">
          Drag & drop images here or click to browse
        </p>
        <input
          id="file-input"
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {/* Image previews */}
      {images.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium">Selected Images</h4>
            <button
              onClick={uploadImages}
              className="px-3 py-1 text-xs text-white rounded bg-sky-600 hover:bg-sky-700"
            >
              Upload All
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {images.map((image) => (
              <div key={image.id} className="relative group">
                <img
                  src={image.url}
                  alt={image.name}
                  className="object-cover w-full h-20 rounded"
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeImage(image.id);
                  }}
                  className="absolute p-1 text-white transition-opacity bg-red-500 rounded-full opacity-0 top-1 right-1 group-hover:opacity-100"
                >
                  <X size={12} />
                </button>
                {image.uploaded && (
                  <div className="absolute px-1 text-xs text-white bg-green-500 rounded bottom-1 left-1">
                    Uploaded
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
