import "../index.css";
import React from "react";
import Footer from "../components/Footer";

function HomePage() {
  return (
    <>
      <div className="page-content">
        <h1>Welcome Captain Jake Lawson</h1>
        <div style={{ backgroundColor: '#d3d3d3', padding: '20px', marginTop: '20px', maxWidth: '30rem', width: '100%' }}>
          <p>{'{previous trips & statuses}'}</p>
        </div>
      </div>

      <Footer nextPath="/start" nextLabel="Start New Trip" showBackButton={false} />
    </>
  );
}

export default HomePage;
