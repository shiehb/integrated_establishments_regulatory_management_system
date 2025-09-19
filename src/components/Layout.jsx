import Header from "./Header";
import Footer from "./Footer";

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-white">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 z-50 w-full">
        <Header />
      </div>
      {/* Fixed Footer */}
      <div className="fixed bottom-0 left-0 z-50 w-full">
        <Footer />
      </div>
      {/* Main content with padding for header/footer */}
      <main className="flex items-center justify-center flex-grow px-4 pt-20 pb-16">
        {children}
      </main>
    </div>
  );
}
