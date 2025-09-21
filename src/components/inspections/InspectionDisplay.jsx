import { useState, useEffect } from "react";
import Layout from "../Layout";
import InspectionForm from "./InspectionForm";
import PolygonMap from "../establishments/PolygonMap";
import ImageUpload from "../ImageUpload";

export default function InspectionDisplay({ inspectionData }) {
  const [establishment, setEstablishment] = useState(null);
  const [images, setImages] = useState([]);

  useEffect(() => {
    if (
      inspectionData &&
      inspectionData.establishments &&
      inspectionData.establishments.length > 0
    ) {
      setEstablishment(inspectionData.establishments[0]);
    }
  }, [inspectionData]);

  return (
    <Layout>
      <div className="flex flex-col w-full h-full mt-10 bg-gray-100">
        <div className="flex flex-col flex-1 gap-2 overflow-hidden md:flex-row">
          {/* Left Panel - Inspection Form (scrollable) */}
          <div className="flex flex-col flex-1 overflow-hidden bg-white shadow">
            <div className="flex-1 overflow-y-auto">
              <InspectionForm inspectionData={inspectionData} />
            </div>
          </div>

          {/* Right Panel - Map and Image Upload */}
          <div className="flex flex-col w-full gap-2 overflow-y-auto md:w-1/3">
            {/* Top Right - Map */}
            <div className="flex-1 overflow-hidden bg-white rounded shadow">
              <div className="p-3 border-b">
                <h3 className="font-semibold text-sky-700">
                  Establishment Location
                </h3>
              </div>
              <div className="h-80 md:h-100">
                {establishment ? (
                  <PolygonMap
                    establishment={establishment}
                    userRole="Monitoring Personnel"
                    editMode={false}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    No establishment data available
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Right - Image Upload */}
            <div className="flex-1 overflow-hidden bg-white rounded shadow">
              <div className="p-3 border-b">
                <h3 className="font-semibold text-sky-700">
                  Upload Inspection Images
                </h3>
              </div>
              <div className="p-4">
                <ImageUpload
                  images={images}
                  setImages={setImages}
                  inspectionId={inspectionData?.id}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
