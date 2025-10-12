import Header from "./Header";
import Footer from "./Footer";

export default function LayoutForm({ children, inspectionHeader, rightSidebar }) {
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

      {/* Main content area with grid layout for sidebar support */}
      <main 
        id="inspection-form-container"
        className="flex flex-1 w-full min-h-0 pb-20 overflow-hidden"
        style={{ 
          paddingTop: inspectionHeader ? 'calc(6rem + 120px)' : '6rem'
        }}
      >
        {/* Grid container for main content and sidebar */}
        <div className="flex w-full">
          {/* Main content area */}
          <div className="flex-1 overflow-y-auto scroll-smooth" style={{ scrollSnapType: 'y proximity', scrollBehavior: 'smooth' }}>
            <div className="flex justify-center w-full max-w-7xl mx-auto px-4">
              <div className="w-full">
                {children}
              </div>
            </div>
          </div>

          {/* Right sidebar */}
          {rightSidebar && (
            <div className="hidden lg:block w-[40vw] border-l border-gray-300 bg-white overflow-y-auto">
              <div className="p-4">
                {rightSidebar}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Fixed Footer */}
      <div className="fixed bottom-0 left-0 z-50 w-full">
        <Footer />
      </div>
    </div>
  );
}
