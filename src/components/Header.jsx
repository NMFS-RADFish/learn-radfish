import React from "react";
import { Link } from "react-router-dom";
import {
  Title,
  NavMenuButton,
  PrimaryNav,
  Header as USWDSHeader,
} from "@trussworks/react-uswds";

function Header({ isExpanded, setExpanded }) {
  const handleNavLinkClick = () => {
    // Close the menu when a nav link is clicked
    if (isExpanded) {
      setExpanded(false);
    }
  };

  return (
    <USWDSHeader
      basic
      showMobileOverlay={isExpanded}
      className="header-container"
    >
      <div className="usa-nav-container">
        <div className="usa-navbar">
          <Title className="header-title">
            <Link to="/" onClick={handleNavLinkClick} style={{ display: 'flex', alignItems: 'center', gap: '1rem', textDecoration: 'none' }}>
              <img src="/icons/pelagix.svg" alt="Pelagix Logo" height="40" />
              <span style={{ color: 'white', fontWeight: 'bold', fontSize: '1.25rem' }}>Pelagix</span>
            </Link>
          </Title>
          <NavMenuButton
            onClick={() => setExpanded((prevExpanded) => !prevExpanded)}
            label="Menu"
          />
        </div>
        <PrimaryNav
          items={[
            <Link
              key="home"
              to="/"
              style={{ color: `${isExpanded ? "black" : "white"}` }}
              onClick={handleNavLinkClick}
            >
              Home
            </Link>,
          ]}
          mobileExpanded={isExpanded}
          onToggleMobileNav={() =>
            setExpanded((prevExpanded) => !prevExpanded)
          }
        />
      </div>
    </USWDSHeader>
  );
}

export default Header;
