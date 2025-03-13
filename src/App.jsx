import "./index.css";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { useState } from "react";
import { Application } from "@nmfs-radfish/react-radfish";
import {
  GridContainer,
  Title,
  NavMenuButton,
  PrimaryNav,
  Header,
} from "@trussworks/react-uswds";

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
            <Header
              basic
              showMobileOverlay={isExpanded}
              className="header-container"
            >
              <div className="usa-nav-container">
                <div className="usa-navbar">
                  <Title className="header-title">RADFish Application</Title>
                  <NavMenuButton
                    onClick={() => setExpanded((prvExpanded) => !prvExpanded)}
                    label="Menu"
                  />
                </div>
                <PrimaryNav
                  items={[
                    <Link
                      to="/"
                      style={{ color: `${isExpanded ? "black" : "white"}` }}
                    >
                      Home
                    </Link>,
                  ]}
                  mobileExpanded={isExpanded}
                  onToggleMobileNav={() =>
                    setExpanded((prvExpanded) => !prvExpanded)
                  }
                ></PrimaryNav>
              </div>
            </Header>
          </header>
          <main id="main-content" className="main-content">
            <GridContainer>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/start" element={<StartTrip />} />
                <Route path="/catch" element={<CatchLog />} />
                <Route path="/end" element={<EndTrip />} />
                <Route path="/review" element={<ReviewSubmit />} />
                <Route path="/confirm" element={<Confirmation />} />
              </Routes>
            </GridContainer>
          </main>
        </div>
      </BrowserRouter>
    </Application>
  );
}

export default App;
