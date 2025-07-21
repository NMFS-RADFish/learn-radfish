// --- Imports ---
import "../index.css";
import React from "react";
import { Button } from "@trussworks/react-uswds";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";

// --- Component Definition ---
/**
 * OfflineConfirmation - Confirmation page shown when trip is saved offline
 * This component demonstrates:
 * - Handling offline submission workflows
 * - Providing clear user feedback about data persistence
 * - Guiding users on next steps when offline
 */
function OfflineConfirmation() {
  // --- Navigation ---
  const navigate = useNavigate();
  
  // --- Render ---
  return (
    <>
      <Layout currentStep="Review and Submit">
        <div className="text-center">
          <h1>Saved Offline</h1>
          <p>Your trip has been saved locally.</p>

          {/* Information card explaining offline workflow */}
          <div className="bg-base-lightest border border-base-lighter radius-md padding-105 margin-top-2 padding-x-2 text-left">
            <h3 className="text-center">What happens next?</h3>
            <p>
              When your device reconnects to the internet, please return to
              the Home page.
            </p>
            <p>You can select this trip from the list to submit it.</p>
          </div>
        </div>
      </Layout>

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

export default OfflineConfirmation;