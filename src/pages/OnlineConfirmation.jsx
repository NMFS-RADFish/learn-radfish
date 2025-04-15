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

export default OnlineConfirmation;
