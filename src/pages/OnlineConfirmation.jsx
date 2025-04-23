import "../index.css";
import React from "react";
import { Button } from "@trussworks/react-uswds";
import { useNavigate } from "react-router-dom";

function OnlineConfirmation() {
  const navigate = useNavigate();
  return (
    <>
      <div className="display-flex flex-column flex-align-center padding-y-4 padding-x-2 text-center">
        <div className="width-full maxw-mobile-lg">
          <h1>Success!</h1>
          <p>Your trip has been successfully submitted!</p>
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

export default OnlineConfirmation;
