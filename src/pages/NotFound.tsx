
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow flex items-center justify-center bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-xl mx-auto text-center">
            <div className="inline-block p-4 rounded-full bg-gray-100 mb-6 animate-zoom-in">
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 8V12M12 16H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" 
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            
            <h1 className="text-6xl font-bold text-gray-900 mb-4 animate-fade-in">404</h1>
            <p className="text-xl text-gray-600 mb-8 animate-fade-in" style={{animationDelay: '0.1s'}}>
              Oops! We couldn't find the page you're looking for.
            </p>
            
            <Link to="/" className="inline-flex items-center px-6 py-3 bg-usm-gold text-black rounded-lg font-medium hover:bg-usm-gold-dark transition-colors animate-fade-in" style={{animationDelay: '0.2s'}}>
              <ArrowLeft className="mr-2 h-5 w-5" />
              Return to Homepage
            </Link>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default NotFound;
