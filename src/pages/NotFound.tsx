
import React from "react";
import { useLocation, Link } from "react-router-dom";

const NotFound: React.FC = () => {
  const location = useLocation();

  React.useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
      <div className="text-center space-y-6">
        <div className="text-6xl font-bold text-primary">404</div>
        <h1 className="text-2xl font-bold">Page Not Found</h1>
        <p className="text-muted-foreground max-w-md">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <div>
          <Link 
            to="/" 
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
          >
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
