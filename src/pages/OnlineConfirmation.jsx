import "../index.css";
import React from "react";
import { Button, GridContainer, Grid } from "@trussworks/react-uswds";
import { useNavigate } from "react-router-dom";

function OnlineConfirmation() {
  const navigate = useNavigate();
  return (
    <>
      <GridContainer className="padding-y-4 padding-x-0 width-full maxw-mobile-lg">
        <Grid row>
          <Grid col="fill">
            <div className="text-center">
              <h1>Success!</h1>
              <p>Your trip has been successfully submitted!</p>
            </div>
          </Grid>
        </Grid>
      </GridContainer>

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
