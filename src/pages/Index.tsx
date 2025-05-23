
import React from "react";
import { useNavigate } from "react-router-dom";
import LandingPage from "./public/LandingPage";

const Index: React.FC = () => {
  const navigate = useNavigate();
  
  // Simply render the LandingPage
  React.useEffect(() => {
    navigate("/", { replace: true });
  }, [navigate]);
  
  return <LandingPage />;
};

export default Index;
