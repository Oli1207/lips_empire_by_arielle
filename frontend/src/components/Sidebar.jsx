import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faEye, faInfoCircle, faGift } from '@fortawesome/free-solid-svg-icons';
import './sidebar.css'; 

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={`sidebar ${isOpen ? 'open' : ''}`}>
      <button onClick={toggleSidebar} className="toggleButton">
        ☰
      </button>
      <nav className="nav">
        <button className="navItem">
          <FontAwesomeIcon icon={faHome} /> ACCUEIL
        </button>
        <button className="navItem">
          <FontAwesomeIcon icon={faEye} /> TOUT VOIR
        </button>
        <button className="navItem">
          <FontAwesomeIcon icon={faInfoCircle} /> À PROPOS
        </button>
        <button className="navItem">
          <FontAwesomeIcon icon={faGift} /> PROMOS ET OFFRES
        </button>
      </nav>
    </div>
  );
};

export default Sidebar;
