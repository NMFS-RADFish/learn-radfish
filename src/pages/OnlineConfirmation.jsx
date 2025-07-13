// --- Imports ---
import "../index.css";
import React from "react";
import { Button, GridContainer, Grid } from "@trussworks/react-uswds";
import { useNavigate } from "react-router-dom";

// --- Component Definition ---
/**
 * OnlineConfirmation - Success page shown when trip is submitted online
 * This component demonstrates:
 * - Handling successful online submission workflows
 * - Providing clear success feedback to users
 * - Simple navigation back to home
 */
function OnlineConfirmation() {
  // --- Navigation ---
  const navigate = useNavigate();
  
  // --- Render ---
  return (
    <>
      <GridContainer className="padding-y-4 padding-x-0 width-full maxw-mobile-lg">
        <Grid row>
          <Grid col="fill">
            <div className="text-center">
              {/* Success message for completed submission */}
              <h1>Success!</h1>
              <p>Your trip has been successfully submitted!</p>
            </div>
          </Grid>
        </Grid>
      </GridContainer>

      {/* --- Navigation Footer --- */}
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
