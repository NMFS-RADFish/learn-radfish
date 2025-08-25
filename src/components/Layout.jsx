import React from "react";
import {
  Grid,
  GridContainer,
  StepIndicator,
  StepIndicatorStep,
} from "@trussworks/react-uswds";

/**
 * Layout component - Provides consistent page layout with grid container and step indicator
 * Used by all pages except Home (lesson-1) to teach GridContainer basics there
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Page content to render inside the layout
 * @param {string} props.currentStep - Current step name for the step indicator
 */
function Layout({ children, currentStep }) {
  // Step configuration with status based on current step
  const getStepStatus = (stepName) => {
    const steps = ["Start Trip", "Log Catch", "End Trip", "Review and Submit"];
    const currentIndex = steps.indexOf(currentStep);
    const stepIndex = steps.indexOf(stepName);
    
    if (stepIndex < currentIndex) return "complete";
    if (stepIndex === currentIndex) return "current";
    return undefined; // pending
  };

  return (
    <GridContainer className="padding-y-4 padding-x-0 width-full maxw-mobile-lg">
      <Grid row>
        <Grid col="fill">
          <div className="text-left">
            {/* --- Step Indicator --- */}
            <div className="margin-top-4 border-bottom border-base-light padding-bottom-2">
              <StepIndicator
                headingLevel="h4"
                ofText="of"
                stepText="Step"
                className="usa-step-indicator margin-bottom-0"
                showLabels={false}
              >
                <StepIndicatorStep label="Start Trip" status={getStepStatus("Start Trip")} />
                <StepIndicatorStep label="Log Catch" status={getStepStatus("Log Catch")} />
                <StepIndicatorStep label="End Trip" status={getStepStatus("End Trip")} />
                <StepIndicatorStep label="Review and Submit" status={getStepStatus("Review and Submit")} />
              </StepIndicator>
            </div>

            {/* Page Content */}
            {children}
          </div>
        </Grid>
      </Grid>
    </GridContainer>
  );
}

export default Layout;