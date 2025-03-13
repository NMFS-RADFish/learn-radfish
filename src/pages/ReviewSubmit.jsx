import "../index.css";
import React from "react";
import { Button, StepIndicator, StepIndicatorStep } from "@trussworks/react-uswds";
import { useNavigate } from "react-router-dom";

function ReviewSubmit() {
  const navigate = useNavigate();

  return (
    <>
      <div className="page-content">
        <div className="step-indicator-container">
          <StepIndicator headingLevel="h4" ofText="of" stepText="Step">
            <StepIndicatorStep label="Start Trip" status="complete" />
            <StepIndicatorStep label="Catch Log" status="complete" />
            <StepIndicatorStep label="End Trip" status="complete" />
            <StepIndicatorStep label="Review and Submit" status="current" />
          </StepIndicator>
        </div>
        
        <h1>Review and Submit</h1>
        <p>Review your trip details before submission.</p>
      </div>
      
      <footer className="sticky-footer">
        <div className="footer-content">
          <Button type="button" className="back-button" onClick={() => navigate('/end')}>
            Back
          </Button>
          <Button type="button" className="next-button" onClick={() => navigate('/confirm')}>
            Submit
          </Button>
        </div>
      </footer>
    </>
  );
}

export default ReviewSubmit;
