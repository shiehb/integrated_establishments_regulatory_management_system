import Header from "./Header";
import Footer from "./Footer";

export default function LayoutForm({ children }) {
  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 z-50 w-full">
        <Header />
      </div>

      {/* Main content area (between header & footer) */}
      <main className="flex flex-1 w-full min-h-0 pt-20 pb-16 overflow-y-auto">
        {children}
      </main>

      {/* Fixed Footer */}
      <div className="fixed bottom-0 left-0 z-50 w-full">
        <Footer />
      </div>
    </div>
  );
}
