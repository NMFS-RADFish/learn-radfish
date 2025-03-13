import "../index.css";
import React from "react";
import { Button, StepIndicator, StepIndicatorStep } from "@trussworks/react-uswds";
import { useNavigate } from "react-router-dom";

function EndTrip() {
  const navigate = useNavigate();

  return (
    <>
      <div className="page-content">
        <div className="step-indicator-container">
          <StepIndicator headingLevel="h4" ofText="of" stepText="Step">
            <StepIndicatorStep label="Start Trip" status="complete" />
            <StepIndicatorStep label="Catch Log" status="complete" />
            <StepIndicatorStep label="End Trip" status="current" />
            <StepIndicatorStep label="Review and Submit" />
          </StepIndicator>
        </div>
        
        <h1>End Trip</h1>
        <p>Enter details to finalize your trip.</p>
      </div>
      
      <footer className="sticky-footer">
        <div className="footer-content">
          <Button type="button" className="back-button" onClick={() => navigate('/catch')}>
            Back
          </Button>
          <Button type="button" className="next-button" onClick={() => navigate('/review')}>
            Next
          </Button>
        </div>
      </footer>
    </>
  );
}

export default EndTrip;
