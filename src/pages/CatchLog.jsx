import "../index.css";
import React from "react";
import { Button, StepIndicator, StepIndicatorStep } from "@trussworks/react-uswds";
import { useNavigate } from "react-router-dom";

function CatchLog() {
  const navigate = useNavigate();

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
      
      <footer className="sticky-footer">
        <div className="footer-content">
          <Button type="button" className="back-button" onClick={() => navigate('/start')}>
            Back
          </Button>
          <Button type="button" className="next-button" onClick={() => navigate('/end')}>
            Next
          </Button>
        </div>
      </footer>
    </>
  );
}

export default CatchLog;
