import "../index.css";
import React from "react";
import { Button } from "@trussworks/react-uswds";
import { useNavigate } from "react-router-dom";

function OnlineConfirmation() {
  const navigate = useNavigate();
  return (
    <>
      <div className="page-content">
        <div className="content-container">
          <h1>Success!</h1>
          <p>Your trip has been successfully submitted!</p>
        </div>
      </div>
      <footer className="sticky-footer">
        <div className="footer-content">
          <Button 
            type="button" 
            onClick={() => navigate("/")}
          >
            Home
          </Button>
        </div>
      </footer>
    </>
  );
}

export default OnlineConfirmation;
