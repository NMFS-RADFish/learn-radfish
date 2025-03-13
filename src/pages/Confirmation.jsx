import "../index.css";
import React from "react";
import { Button } from "@trussworks/react-uswds";
import { useNavigate } from "react-router-dom";

function Confirmation() {
  const navigate = useNavigate();

  return (
    <>
      <div className="page-content">
        <h1>Confirmation</h1>
        <p>Your trip has been successfully submitted!</p>
      </div>
      
      <footer className="sticky-footer">
        <div className="footer-content single-button">
          <Button type="button" onClick={() => navigate('/')}>
            Home
          </Button>
        </div>
      </footer>
    </>
  );
}

export default Confirmation;