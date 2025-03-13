import "../index.css";
import React from "react";
import { Button, StepIndicator, StepIndicatorStep } from "@trussworks/react-uswds";
import { useNavigate } from "react-router-dom";

function StartTrip() {
  const navigate = useNavigate();

  return (
    <>
      <div className="page-content">
        <div className="step-indicator-container">
          <StepIndicator headingLevel="h4" ofText="of" stepText="Step">
            <StepIndicatorStep label="Start Trip" status="current" />
            <StepIndicatorStep label="Catch Log" />
            <StepIndicatorStep label="End Trip" />
            <StepIndicatorStep label="Review and Submit" />
          </StepIndicator>
        </div>
        
        <h1>Start Trip</h1>
        <p>Enter your trip details here.</p>
      </div>
      
      <footer className="sticky-footer">
        <div className="footer-content single-button">
          <Button type="button" onClick={() => navigate('/catch')}>
            Next
          </Button>
        </div>
      </footer>
    </>
  );
}

export default StartTrip;