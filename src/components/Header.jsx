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
            <Link to="/" onClick={handleNavLinkClick}>
              Pelagix Logo
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
