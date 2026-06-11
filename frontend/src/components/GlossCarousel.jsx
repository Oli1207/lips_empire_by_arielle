import React from 'react';
import { Carousel } from 'react-bootstrap';
const gloss2 = '/lips_empire_img.jpg';

const GlossCarousel = () => {
  return (
    
    <Carousel controls={false} indicators={false} style={styles.carousel}>
      <Carousel.Item style={styles.carouselItem}>
        <img
          className="d-block w-100"
          src={gloss2}
          alt="First slide"
          style={styles.image}
        />
        {/* <Carousel.Caption>
          <h3 style={{color:'black'}}>SUBLIMEZ VOS LÈVRES
   </h3>
          <p style={{color:'black'}}>Explorez notre sélection de gloss idéale pour toutes vos occasions</p>
        </Carousel.Caption> */}
      </Carousel.Item>
      {/* <Carousel.Item style={styles.carouselItem}>
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
      </Carousel.Item> */}
    </Carousel>
  );
};

const styles = {
  carousel: {
    background: 'linear-gradient(180deg, #F2D8DB 0%, #F2D8DB 66%)',
    
  },
  carouselItem: {
    height: '70vh',
    width: '100vw',
  },
  image: {
    height: '100%',
    width: '100%',
    objectFit: 'cover',
  },
};

export default GlossCarousel;
