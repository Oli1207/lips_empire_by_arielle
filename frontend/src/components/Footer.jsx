import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Footer.css'; // Assurez-vous d'inclure le fichier CSS pour les styles

const Footer = () => {
  return (
    <footer className="footer bg-light py-4" style={{ backgroundColor: '#FFE6E9' }}>
      <div className="container">
        <div className="row">
          <div className="col-md-4">
            <h5 className="footer-title">YourLogo</h5>
            <p className="footer-text">
              This is where your company slogan or mission statement can go. You can also include a brief description of your business.
            </p>
          </div>
          <div className="col-md-4">
            <h5 className="footer-title">Quick Links</h5>
            <ul className="list-unstyled">
              <li><a href="/" className="footer-link">Home</a></li>
              <li><a href="/about" className="footer-link">About Us</a></li>
              <li><a href="/contact" className="footer-link">Contact Us</a></li>
            </ul>
          </div>
          <div className="col-md-4">
            <h5 className="footer-title">Contact</h5>
            <p className="footer-text"><i className="fas fa-phone"></i> +123 456 789</p>
            <p className="footer-text"><i className="fas fa-envelope"></i> info@yourcompany.com</p>
            <div className="social-icons">
              <a href="#"><i className="fab fa-facebook-f footer-icon"></i></a>
              <a href="#"><i className="fab fa-twitter footer-icon"></i></a>
              <a href="#"><i className="fab fa-instagram footer-icon"></i></a>
            </div>
          </div>
        </div>
        <div className="row mt-3">
          <div className="col text-center">
            <p className="mb-0 footer-text">© 2024 YourCompany. All Rights Reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
