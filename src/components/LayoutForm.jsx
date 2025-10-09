import Header from "./Header";
import Footer from "./Footer";

export default function LayoutForm({ children }) {
  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 z-50 w-full">
        <Header />
      </div>

      {/* Main content area with proper spacing */}
      <main className="flex flex-1 w-full min-h-0 pt-24 pb-20 overflow-y-auto">
        <div className="flex justify-center w-full max-w-7xl mx-auto px-4">
          {children}
        </div>
      </main>

      {/* Fixed Footer */}
      <div className="fixed bottom-0 left-0 z-50 w-full">
        <Footer />
      </div>
    </div>
  );
}
