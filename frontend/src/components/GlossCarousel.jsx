import React from 'react';
import { Carousel } from 'react-bootstrap';
import gloss1 from './gloss1.jpg';
import gloss2 from './gloss.jpg';
import gloss3 from './gloss3.jpg';

const GlossCarousel = () => {
  return (
    <Carousel style={styles.carousel}>
      <Carousel.Item style={styles.carouselItem}>
        <img
          className="d-block w-100"
          src={gloss2}
          alt="First slide"
          style={styles.image}
        />
        <Carousel.Caption>
          <h3>Bienvenue chez Lip's Empire By Arielle</h3>
          <p>De l'envie à la réalité.</p>
        </Carousel.Caption>
      </Carousel.Item>
      <Carousel.Item style={styles.carouselItem}>
        <img
          className="d-block w-100"
          src={gloss1}
          alt="Second slide"
          style={styles.image}
        />
        <Carousel.Caption>
          <h3>Deuxième slide</h3>
          <p>Texte descriptif pour le deuxième slide.</p>
        </Carousel.Caption>
      </Carousel.Item>
      <Carousel.Item style={styles.carouselItem}>
        <img
          className="d-block w-100"
          src={gloss3}
          alt="Third slide"
          style={styles.image}
        />
        <Carousel.Caption>
          <h3>Troisième slide</h3>
          <p>Texte descriptif pour le troisième slide.</p>
        </Carousel.Caption>
      </Carousel.Item>
    </Carousel>
  );
};

const styles = {
  carousel: {
    background: 'linear-gradient(180deg, #F2D8DB 0%, #F2D8DB 66%)',
  },
  carouselItem: {
    height: '100vh',
    width: '100vw',
  },
  image: {
    height: '100%',
    width: '100%',
    objectFit: 'cover',
  },
};

export default GlossCarousel;
