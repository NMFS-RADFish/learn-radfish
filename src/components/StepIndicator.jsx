import React from "react";
import { StepIndicator as USWDSStepIndicator, StepIndicatorStep } from "@trussworks/react-uswds";
import { useLocation } from "react-router-dom";

/**
 * StepIndicator component that shows the current step based on the current route
 */
function StepIndicator() {
  const location = useLocation();
  const currentPath = location.pathname;
  
  // Define the steps and their corresponding routes
  const steps = [
    { label: "Start Trip", path: "/start" },
    { label: "Catch Log", path: "/catch" },
    { label: "End Trip", path: "/end" },
    { label: "Review and Submit", path: "/review" }
  ];

  // Determine the current step index
  const currentStepIndex = steps.findIndex(step => step.path === currentPath);
  
  return (
    <div className="step-indicator-container">
      <USWDSStepIndicator headingLevel="h4" ofText="of" stepText="Step">
        {steps.map((step, index) => {
          let status;
          if (index === currentStepIndex) {
            status = "current";
          } else if (index < currentStepIndex) {
            status = "complete";
          }
          return (
            <StepIndicatorStep 
              key={step.path} 
              label={step.label} 
              status={status} 
            />
          );
        })}
      </USWDSStepIndicator>
    </div>
  );
}

export default StepIndicator;
