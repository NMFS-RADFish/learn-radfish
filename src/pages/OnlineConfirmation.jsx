import "../index.css";
import React from "react";
import Footer from "../components/Footer";

function OnlineConfirmation() {
  return (
    <>
      <div className="page-content">
        <div className="content-container">
          <h1>Success!</h1>
          <p>Your trip has been successfully submitted!</p>
        </div>
      </div>
      <Footer nextPath="/" nextLabel="Home" showBackButton={false} />
    </>
  );
}

export default OnlineConfirmation;
