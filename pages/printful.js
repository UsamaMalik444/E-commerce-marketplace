import React, { useEffect } from "react";

const Printful = () => {
  useEffect(() => {
    // redirect to printful/dashboard
    window.location.href = "https://www.ikonshop.io/printful/dashboard";
  }, []);
  return (
    <div>
      <h1>Redirecting to Printful Dashboard...</h1>
    </div>
  );
};

export default Printful;
