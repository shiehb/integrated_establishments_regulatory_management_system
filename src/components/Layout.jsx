import Header from "./Header";
import Footer from "./Footer";

export default function Layout({ children }) {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 z-50 w-full">
        <Header />
      </div>

      {/* Main content with proper spacing */}
      <main className="flex flex-col items-center justify-center flex-grow px-4 pt-24 pb-20 min-h-screen">
        <div className="flex justify-center w-full max-w-7xl mx-auto">
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
