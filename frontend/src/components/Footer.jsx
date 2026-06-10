import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./footer.css"; // On va adapter ce fichier aussi
import logo from "./logo_arielle.png";
import apiInstance from "../utils/axios";
import Swal from "sweetalert2";
import { SiTiktok, SiInstagram } from "react-icons/si";

const Toast = Swal.mixin({
  toast: true,
  position: "top",
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
});

const Footer = () => {
  const [formData, setFormData] = useState({
    email: "",
    offersChecked: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.offersChecked) {
      Toast.fire({
        icon: "warning",
        title: "Veuillez cocher la case pour vous abonner.",
      });
      return;
    }
    try {
      await apiInstance.post("contact/", formData);
      Toast.fire({
        icon: "success",
        title: "Merci de vous être abonné à notre newsletter !",
      });

      setFormData({
        email: "",
        offersChecked: false,
      });
    } catch (error) {
      console.error("Erreur lors de l'abonnement à la newsletter :", error);
      Toast.fire({
        icon: "error",
        title: "Échec de l'abonnement. Veuillez réessayer.",
      });
    }
  };

  return (
    <footer className="footer-custom py-5">
      <div className="container">
        <div className="row">
          {/* Bloc Logo + Newsletter */}
          <div className="col-lg-4 mb-4">
            <div className="mb-3">
              <img src={logo} alt="Brand Logo" className="footer-logo" />
            </div>
            <p className="newsletter-title">
              Recevez notre <em>Newsletter</em>
            </p>
            <form onSubmit={handleSubmit}>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="form-control mb-2"
                placeholder="Email *"
              />
              <div className="form-check mb-3">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="offersCheck"
                  name="offersChecked"
                  checked={formData.offersChecked}
                  onChange={handleChange}
                />
                <label className="form-check-label" htmlFor="offersCheck">
                  Oui, je souhaite recevoir des offres exclusives *
                </label>
              </div>
              <button type="submit" className="btn btn-outline-dark w-100">
                Envoyer
              </button>
            </form>
          </div>

          {/* Bloc Menu */}
          <div className="col-lg-2 mb-4">
            <h5 style={{color:"black"}} className="footer-title">Menu</h5>
            <ul className="list-unstyled">
              <li>
                <a href="/" className="footer-link">
                  Accueil
                </a>
              </li>
              <li>
                <a href="/policy" className="footer-link">
                  Politique de l'entreprise
                </a>
              </li>
              <li>
                <a href="/cart" className="footer-link">
                  Panier
                </a>
              </li>
              {/* <li><a href="/gallery" className="footer-link">Galerie</a></li>
              <li><a href="/contact" className="footer-link">Contact</a></li> */}
            </ul>
          </div>

          {/* Bloc Liens utiles */}
       <div className="col-lg-3 mb-4">
  <h5 className="footer-title" style={{ color: "black" }}>Réseaux sociaux</h5>
  <ul className="list-unstyled" >
    
    <li className="mb-2">
      <a
        href="https://www.instagram.com/lipsempirebyarielle/"
        className="footer-link"
        target="_blank"
        rel="noopener noreferrer"
      >
         <SiInstagram size={18} className="me-2" /> Instagram
      </a>
    </li>

  
    <li>
  <a
    href="#"
    className="footer-link"
    target="_blank"
    rel="noopener noreferrer"
  >
    <SiTiktok size={18} className="me-2" /> TikTok
  </a>
</li>
  </ul>
</div>

          {/* Bloc Contact */}
          <div className="col-lg-3 mb-4">
            <h5 style={{color:"black"}} className="footer-title">Nous contacter</h5>
            <a
              href="mailto:contact@lipsempirebyarielle.store"
              className="footer-link"
            >
              contact@lipsempirebyarielle.store
            </a>
          </div>
        </div>

        {/* Bouton de chat */}
        {/*

        <div className="chat-button">
          <button className="btn btn-dark rounded-circle"><i className="fas fa-comment-dots"></i></button>
        </div>
        
         */}
      </div>
    </footer>
  );
};

export default Footer;
