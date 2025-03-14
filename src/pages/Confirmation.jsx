import "../index.css";
import React from "react";
import Footer from "../components/Footer";

function Confirmation() {
  return (
    <>
      <div className="page-content">
        <h1>Confirmation</h1>
        <p>Your trip has been successfully submitted!</p>
      </div>
      
      <Footer nextPath="/" nextLabel="Home" />
    </>
  );
}

export default Confirmation;
