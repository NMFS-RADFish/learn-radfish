import "./index.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";
import { Application } from "@nmfs-radfish/react-radfish";
import Header from "./components/Header";

import HomePage from "./pages/Home";
import StartTrip from "./pages/StartTrip";
import CatchLog from "./pages/CatchLog";
import EndTrip from "./pages/EndTrip";
import ReviewSubmit from "./pages/ReviewSubmit";
import Confirmation from "./pages/Confirmation";

function App({ application }) {
  const [isExpanded, setExpanded] = useState(false);
  return (
    <Application application={application}>
      <a className="usa-skipnav" href="#main-content">
        Skip to main content
      </a>
      <BrowserRouter>
        <div className="app-container">
          <header className="sticky-header">
            <Header isExpanded={isExpanded} setExpanded={setExpanded} />
          </header>
          <main id="main-content" className="main-content">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/start" element={<StartTrip />} />
              <Route path="/catch" element={<CatchLog />} />
              <Route path="/end" element={<EndTrip />} />
              <Route path="/review" element={<ReviewSubmit />} />
              <Route path="/confirm" element={<Confirmation />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </Application>
  );
}

export default App;
