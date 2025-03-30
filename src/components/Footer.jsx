import React from "react";
import { Button } from "@trussworks/react-uswds";
import { useNavigate } from "react-router-dom";

/**
 * Footer component with dynamic buttons
 * @param {Object} props
 * @param {string} [props.backPath="/"] - Path to navigate to when back button is clicked
 * @param {string} props.nextPath - Path to navigate to when next/submit button is clicked
 * @param {string} [props.nextLabel="Next"] - Label for the next/submit button
 * @param {Function} [props.onNextClick] - Callback function when next button is clicked
 * @param {boolean} [props.showBackButton=true] - Whether to show the back button
 */
function Footer({ backPath = "/", nextPath, nextLabel = "Next", onNextClick, showBackButton = true }) {
  const navigate = useNavigate();

  const handleNextClick = (e) => {
    if (onNextClick) {
      onNextClick(e);
    } else {
      navigate(nextPath);
    }
  };

  return (
    <footer className="sticky-footer">
      <div className="footer-content">
        {showBackButton && (
          <Button
            outline 
            type="button" 
            className="back-button" 
            onClick={() => navigate(backPath)}
          >
            Back
          </Button>
        )}
        <Button 
          type={onNextClick ? "submit" : "button"} 
          className={showBackButton ? "next-button" : ""} 
          onClick={handleNextClick}
        >
          {nextLabel}
        </Button>
      </div>
    </footer>
  );
}

export default Footer;
