import Header from "./Header";
import Footer from "./Footer";

export default function LayoutForm({ children, inspectionHeader }) {
  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Fixed Main Header */}
      <div className="fixed top-0 left-0 z-50 w-full">
        <Header />
      </div>

      {/* Fixed Inspection Header */}
      {inspectionHeader && (
        <div className="fixed top-18 left-0 z-40 w-full">
          {inspectionHeader}
        </div>
      )}

      {/* Main content area with scroll-snap for carousel effect */}
      <main 
        id="inspection-form-container"
        className="flex flex-1 w-full min-h-0 pb-20 overflow-y-auto scroll-smooth"
        style={{ 
          paddingTop: inspectionHeader ? 'calc(6rem + 120px)' : '6rem',
          scrollSnapType: 'y proximity',
          scrollBehavior: 'smooth'
        }}
      >
        <div className="flex justify-center w-full max-w-7xl mx-auto px-4">
          <div className="w-full">
            {children}
          </div>
        </div>
      </main>

      {/* Fixed Footer */}
      <div className="fixed bottom-0 left-0 z-50 w-full">
        <Footer />
      </div>
    </div>
  );
}
