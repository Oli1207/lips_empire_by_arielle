import React, { useEffect, useState } from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTruckFast, faHeart, faCartShopping, faHome, faEye, faInfoCircle, faGift } from '@fortawesome/free-solid-svg-icons';
import logo from './logo_arielle.png'; // Assure-toi que le chemin est correct
import './header.css'; // Assure-toi d'importer le fichier CSS

const Header = () => {
  const [showLogo, setShowLogo] = useState(true);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // Set a timeout to start the fade-out animation after 5 seconds
    const logoTimer = setTimeout(() => {
      setShowLogo(false); // Hide the logo
      setShowContent(true); // Show the content
    }, 1000); // 5 seconds before starting animation

    // Clean up timer
    return () => clearTimeout(logoTimer);
  }, []);

  return (
    <>
      {showLogo && (
        <div className={`logo-transition ${!showLogo ? 'fade-out' : ''}`}>
          <img src={logo} alt="Brand Logo" style={{ height: '100%', width: '100%', objectFit: 'contain' }} />
        </div>
      )}
      <div className={`content ${showContent ? 'show' : ''}`}>
        <Navbar expand="lg" variant="dark" style={styles.navbar}>
          <Container className="d-flex flex-column">
            {/* Logo Container */}
            <Navbar.Brand className="mx-auto">
              <img src={logo} alt="Brand Logo" style={{ height: '200px' }} />
            </Navbar.Brand>

            {/* Navbar Toggle Button (hidden on larger screens) */}
            <Navbar.Toggle aria-controls="basic-navbar-nav" className="d-lg-none" />
            
            {/* Navbar Collapse (visible on larger screens) */}
            <Navbar.Collapse id="basic-navbar-nav" className="d-flex flex-column flex-lg-row align-items-lg-center justify-content-lg-center">
              {/* Navbar Content (icons and links as buttons) */}
              <Nav className="ml-auto d-flex align-items-center">
                <Nav.Link href="/" className="nav-link">
                  <FontAwesomeIcon icon={faHome} /> 
                  <span className="ms-2">Accueil</span>
                </Nav.Link>
                <Nav.Link href="/view" className="nav-link">
                  <FontAwesomeIcon icon={faEye} /> 
                  <span className="ms-2">TOUT VOIR</span>
                </Nav.Link>
                <Nav.Link href="/about" className="nav-link">
                  <FontAwesomeIcon icon={faInfoCircle} /> 
                  <span className="ms-2">À PROPOS</span>
                </Nav.Link>
                <Nav.Link href="/promotions" className="nav-link">
                  <FontAwesomeIcon icon={faGift} /> 
                  <span className="ms-2">PROMOS ET OFFRES</span>
                </Nav.Link>
                <Nav.Link href="/livraison" className="nav-link">
                  <FontAwesomeIcon icon={faTruckFast} /> 
                  <span className="ms-2">Livraison</span>
                </Nav.Link>
                <Nav.Link href="/cart" className="nav-link">
                  <FontAwesomeIcon icon={faCartShopping} /> 
                  <span className="ms-2">PANIER</span>
                </Nav.Link>
              </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar>
      </div>
    </>
  );
};

const styles = {
  navbar: {
    position: 'absolute',
    top: 0,
    width: '100%',
    background: 'transparent',
    zIndex: 1000, // Assure que la Navbar est au-dessus du carousel
  },
};

export default Header;
