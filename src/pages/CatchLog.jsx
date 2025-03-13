import "../index.css";
import React from "react";
import { StepIndicator, StepIndicatorStep } from "@trussworks/react-uswds";
import Footer from "../components/Footer";

function CatchLog() {
  return (
    <>
      <div className="page-content">
        <div className="step-indicator-container">
          <StepIndicator headingLevel="h4" ofText="of" stepText="Step">
            <StepIndicatorStep label="Start Trip" status="complete" />
            <StepIndicatorStep label="Catch Log" status="current" />
            <StepIndicatorStep label="End Trip" />
            <StepIndicatorStep label="Review and Submit" />
          </StepIndicator>
        </div>
        
        <h1>Catch Log</h1>
        <p>Record your catches here.</p>
      </div>
      
      <Footer backPath="/start" nextPath="/end" />
    </>
  );
}

export default CatchLog;
