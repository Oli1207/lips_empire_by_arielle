import React, { useState, useEffect, useContext } from "react";
import { Navbar, Nav, Container, Offcanvas } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTruckFast,
  faBookOpen,
  faBook,
  faCartShopping,
  faHome,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { useAuthStore } from '../store/auth';
import logo from "./logo_arielle.png";
import "./header.css";
import { CartContext } from "../plugin/Context";
import { Link } from "react-router-dom";

const Header = () => {
  const isLoggedIn = useAuthStore(s => s.isLoggedIn)
  const [showLogo, setShowLogo] = useState(true);
  const [showContent, setShowContent] = useState(false);
  const [showOffcanvas, setShowOffcanvas] = useState(false); // Pour l'Offcanvas
  const cartCount = useContext(CartContext);
  const [isVisible, setIsVisible] = useState(true);
  let scrollTimeout = null;

  useEffect(() => {
    const logoTimer = setTimeout(() => {
      setShowLogo(false);
      setShowContent(true);
    }, 1000);
    return () => clearTimeout(logoTimer);
  }, []);

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      // Cacher la navbar quand on descend
      if (window.scrollY > lastScrollY) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }

      lastScrollY = window.scrollY;

      // Si l'utilisateur arrête de scroller, on la fait revenir après un délai
      if (scrollTimeout) clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        setIsVisible(true);
      }, 200); // 200ms après arrêt de scroll
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (scrollTimeout) clearTimeout(scrollTimeout);
    };
  }, []);

  return (
    <>
      {showLogo && (
        <div className={`logo-transition ${!showLogo ? "fade-out" : ""}`}>
          <img
            src={logo}
            alt="Brand Logo"
            style={{ height: "100%", width: "100%", objectFit: "contain" }}
          />
        </div>
      )}
      <div className={`content ${showContent ? "show" : ""}`}>
        <Navbar expand="lg" variant="dark" className="navbar">
          <Container className="d-flex flex-column">
            {/* Logo */}
            <Navbar.Brand
              className="mx-auto"
              style={{ width: "300px", height: "150px" }}
            >
              <Link
                to="/"
                style={{ display: "block", width: "100%", height: "100%" }}
              >
                <img
                  src={logo}
                  alt="Brand Logo"
                  style={{ height: "100%", width: "100%",  objectFit: "contain" }}
                />
              </Link>
            </Navbar.Brand>

            {/* Mobile : Bouton pour ouvrir Offcanvas */}
            <div
              className="d-lg-none"
              style={{ position: "relative", display: "inline-block" }}
            >
              {/* Badge */}
              <span
                style={{
                  position: "absolute",
                  top: "-5px",
                  right: "-5px",
                  background: "#FF9B9B",
                  color: "white",
                  borderRadius: "50%",
                  fontSize: "10px",
                  padding: "2px 5px",
                  zIndex: 1050,
                }}
              >
                {cartCount}
              </span>

              {/* Le bouton toggle */}
              <Navbar.Toggle
                aria-controls="offcanvasNavbar"
                className="custom-toggle d-lg-none"
                onClick={() => setShowOffcanvas(true)}
              />
            </div>

            {/* Desktop : Navbar Collapse Normal */}
            <Navbar.Collapse
              id="basic-navbar-nav"
              className="w-100 mt-3 d-none d-lg-flex flex-column align-items-center"
            >
              <Nav>
                <Nav.Link href="/" className="nav-link">
                  <FontAwesomeIcon icon={faHome} />
                  <span style={{color:"black"}} className="ms-2">ACCUEIL</span>
                </Nav.Link>
                <Nav.Link href="/policy" className="nav-link">
                  <FontAwesomeIcon icon={faBookOpen} />
                  <span style={{color:"black"}} className="ms-2">POLITIQUE DE L'ENTREPRISE</span>
                </Nav.Link>
                {/* <Nav.Link href="/livraison" className="nav-link">
                  <FontAwesomeIcon icon={faTruckFast} />
                  <span style={{color:"black"}} className="ms-2">A PROPOS</span>
                </Nav.Link> */}
                <Nav.Link href="/cart" className="nav-link">
                  <FontAwesomeIcon icon={faCartShopping} />
                  {cartCount}
                  <span style={{color:"black"}} className="ms-2">PANIER</span>
                </Nav.Link>
                {isLoggedIn() && (
                  <Nav.Link href="/account" className="nav-link">
                    <FontAwesomeIcon icon={faUser} />
                    <span style={{color:"black"}} className="ms-2">MON COMPTE</span>
                  </Nav.Link>
                )}
                {isLoggedIn() && (
                  <Nav.Link href="/logout" className="nav-link">
                    <span style={{color:"black", fontSize: 12}}>DÉCONNEXION</span>
                  </Nav.Link>
                )}
                {!isLoggedIn() && (
                  <Nav.Link href="/login" className="nav-link">
                    <FontAwesomeIcon icon={faUser} />
                    <span style={{color:"black"}} className="ms-2">CONNEXION</span>
                  </Nav.Link>
                )}
              </Nav>
            </Navbar.Collapse>

            {/* Mobile : Offcanvas pour affichage latéral gauche */}
            <Offcanvas
              show={showOffcanvas}
              onHide={() => setShowOffcanvas(false)}
              placement="start"
              className="bg-dark d-lg-none"
            >
              <Offcanvas.Header closeButton>
                <Offcanvas.Title>Menu</Offcanvas.Title>
              </Offcanvas.Header>
              <Offcanvas.Body>
                <Nav className="d-flex flex-column">
                  <Nav.Link href="/" className="nav-link">
                    <FontAwesomeIcon icon={faHome} />
                    <span className="ms-2">ACCUEIL</span>
                  </Nav.Link>
                  <Nav.Link href="/policy" className="nav-link">
                    <FontAwesomeIcon icon={faBookOpen} />
                    <span className="ms-2">POLITIQUE DE L'ENTREPRISE</span>
                  </Nav.Link>
                  <Nav.Link href="/livraison" className="nav-link">
                    <FontAwesomeIcon icon={faTruckFast} />
                    <span className="ms-2">LIVRAISON</span>
                  </Nav.Link>
                  <Nav.Link href="/cart" className="nav-link">
                    <FontAwesomeIcon icon={faCartShopping} />
                    {cartCount}
                    <span className="ms-2">PANIER</span>
                  </Nav.Link>
                  {isLoggedIn() && (
                    <Nav.Link href="/account" className="nav-link">
                      <FontAwesomeIcon icon={faUser} />
                      <span className="ms-2">MON COMPTE</span>
                    </Nav.Link>
                  )}
                  {isLoggedIn() && (
                    <Nav.Link href="/logout" className="nav-link">
                      <span style={{ fontSize: 12 }}>DÉCONNEXION</span>
                    </Nav.Link>
                  )}
                  {!isLoggedIn() && (
                    <Nav.Link href="/login" className="nav-link">
                      <FontAwesomeIcon icon={faUser} />
                      <span className="ms-2">CONNEXION</span>
                    </Nav.Link>
                  )}
                </Nav>
              </Offcanvas.Body>
            </Offcanvas>
          </Container>
        </Navbar>
      </div>
    </>
  );
};

export default Header;
