import "../index.css";
import React from "react";
import Footer from "../components/Footer";

function HomePage() {
  return (
    <>
      <div className="page-content">
        <img src="/icons/radfish.png" alt="RADFish logo" height="200" />
        <h1>Welcome to RADFish</h1>
        <p>Track your fishing trips and catches with this application.</p>
      </div>

      <Footer nextPath="/start" nextLabel="Start New Trip" />
    </>
  );
}

export default HomePage;
