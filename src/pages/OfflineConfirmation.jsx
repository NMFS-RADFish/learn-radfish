import "../index.css";
import React from "react";
import { Button } from "@trussworks/react-uswds";
import { useNavigate } from "react-router-dom";

function OfflineConfirmation() {
  const navigate = useNavigate();
  return (
    <>
      <div className="page-content">
        <div className="content-container">
          <h1>Saved Offline</h1>
          <p>Your trip has been saved locally.</p>

          <div
            style={{
              backgroundColor: "#f9f9f9",
              border: "1px solid #dfe1e2",
              borderRadius: "4px",
              padding: "15px",
              marginTop: "20px",
            }}
          >
            <h3>What happens next?</h3>
            <p>
              When your device reconnects to the internet, please return to the
              Home page.
            </p>
            <p>You can select this trip from the list to submit it.</p>
          </div>
        </div>
      </div>
      
      {/* Inline Footer */}
      <footer className="position-fixed bottom-0 width-full bg-gray-5 padding-y-4 z-top">
        <div className="display-flex flex-justify maxw-mobile-lg margin-x-auto">
          <Button
            type="button"
            className="width-full"
            onClick={() => navigate("/")}
          >
            Home
          </Button>
        </div>
      </footer>
    </>
  );
}

export default OfflineConfirmation;
