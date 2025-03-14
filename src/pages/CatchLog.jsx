import "../index.css";
import React from "react";
import Footer from "../components/Footer";
import StepIndicator from "../components/StepIndicator";

function CatchLog() {
  return (
    <>
      <div className="page-content">
        <StepIndicator />
        
        <h1>Catch Log</h1>
        <p>Record your catches here.</p>
      </div>
      
      <Footer backPath="/start" nextPath="/end" />
    </>
  );
}

export default CatchLog;
