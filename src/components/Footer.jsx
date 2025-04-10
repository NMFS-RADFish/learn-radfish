import React from "react";
import { Button } from "@trussworks/react-uswds";
import { useNavigate } from "react-router-dom";

/**
 * Footer component with dynamic buttons
 * @param {Object} props
 * @param {string} [props.backPath="/"] - Path to navigate to when back button is clicked
 * @param {string} props.nextPath - Path to navigate to when next/submit button is clicked
 * @param {string} [props.nextLabel="Next"] - Label for the next/submit button
 * @param {string} [props.backButtonLabel="Back"] - Label for the back button
 * @param {Function} [props.onNextClick] - Callback function when next button is clicked
 * @param {boolean} [props.showBackButton=true] - Whether to show the back button
 * @param {boolean} [props.showNextButton=true] - Whether to show the next button
 * @param {Object} [props.nextButtonProps={}] - Additional props for the next button
 * @param {Object} [props.backButtonProps={}] - Additional props for the back button
 */
function Footer({ 
  backPath = "/", 
  nextPath, 
  nextLabel = "Next", 
  backButtonLabel = "Back",
  onNextClick, 
  showBackButton = true,
  showNextButton = true,
  nextButtonProps = {},
  backButtonProps = {}
}) {
  const navigate = useNavigate();

  const handleNextClick = (e) => {
    if (onNextClick) {
      onNextClick(e);
    } else if (nextPath) {
      navigate(nextPath);
    }
  };

  const handleBackClick = () => {
    navigate(backPath);
  };

  return (
    <footer className="sticky-footer">
      <div className="footer-content">
        {showBackButton && (
          <Button
            outline 
            type="button" 
            className="back-button" 
            onClick={backButtonProps.onClick || handleBackClick}
            {...backButtonProps}
          >
            {backButtonLabel}
          </Button>
        )}
        {showNextButton && (
          <Button 
            type={onNextClick ? "submit" : "button"} 
            className={`${showBackButton ? "next-button" : ""} ${nextButtonProps.className || ""}`}
            onClick={handleNextClick}
            {...nextButtonProps}
          >
            {nextLabel}
          </Button>
        )}
      </div>
    </footer>
  );
}

export default Footer;
