import "../index.css";
import React from "react";
import { Button, GridContainer } from "@trussworks/react-uswds";
import { Link, useNavigate } from "react-router-dom";

function HomePage() {
  const navigate = useNavigate();

  return (
    <>
      <div className="page-content">
        <img src="/icons/radfish.png" alt="RADFish logo" height="200" />
        <h1>Welcome to RADFish</h1>
        <p>Track your fishing trips and catches with this application.</p>
      </div>
      
      <footer className="sticky-footer">
        <div className="footer-content single-button">
          <Button type="button" onClick={() => navigate('/start')}>
            Start New Trip
          </Button>
        </div>
      </footer>
    </>
  );
}

export default HomePage;
