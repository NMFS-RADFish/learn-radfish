import "../index.css";
import React from "react";
import { Button } from "@trussworks/react-uswds";
import { useNavigate } from "react-router-dom";

function OfflineConfirmation() {
  const navigate = useNavigate();
  return (
    <>
      <div className="display-flex flex-column flex-align-center padding-y-4 padding-x-2 text-center">
        <div className="width-full maxw-mobile-lg">
          <h1>Saved Offline</h1>
          <p>Your trip has been saved locally.</p>

          <div className="bg-base-lightest border border-base-lighter radius-md padding-105 margin-top-2 padding-x-2 text-left">
            <h3 className="text-center">What happens next?</h3>
            <p>
              When your device reconnects to the internet, please return to the
              Home page.
            </p>
            <p>You can select this trip from the list to submit it.</p>
          </div>
        </div>
      </div>
      
      <footer className="position-fixed bottom-0 width-full bg-gray-5 padding-bottom-2 padding-x-2 shadow-1 z-top">
        <div className="display-flex flex-justify maxw-mobile-lg margin-x-auto padding-top-2">
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
