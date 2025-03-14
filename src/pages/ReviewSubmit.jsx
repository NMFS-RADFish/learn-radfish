import "../index.css";
import React from "react";
import Footer from "../components/Footer";
import StepIndicator from "../components/StepIndicator";

function ReviewSubmit() {
  return (
    <>
      <div className="page-content">
        <StepIndicator />
        
        <h1>Review and Submit</h1>
        <p>Review your trip details before submission.</p>
      </div>
      
      <Footer backPath="/end" nextPath="/confirm" nextLabel="Submit" />
    </>
  );
}

export default ReviewSubmit;
