import React, { useEffect, useState } from 'react'
import GlossCarousel from '../components/GlossCarousel'
import apiInstance from '../utils/axios';
import GetCurrentAddress from '../plugin/UserCountry';
import UserData from '../plugin/UserData';
import CardID from '../plugin/CardID';
import Swal from 'sweetalert2'
import { Link } from 'react-router-dom';
import './homescreen.css'
import ContactForm from '../components/ContactForm';
import show from './show.jpg';

const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
})

function HomeScreen() {
  
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState([]);
  const [colorValue, setColorValue] = useState("No Color");
  const [qtyValue, setQtyValue] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedColors, setSelectedColors] = useState({});
  
  const currentAddress = GetCurrentAddress();
  const userData = UserData();
  const cart_id = CardID();

  const handleColorButtonClick = (event, product_id, colorName) => {
    setColorValue(colorName);
    setSelectedProduct(product_id);

    setSelectedColors((prevSelectedColors) => ({
      ...prevSelectedColors,
      [product_id]: colorName
    }));
  }

  const handleQtyChange = (event, product_id) => {
    setQtyValue(event.target.value);
    setSelectedProduct(product_id);
  }

  useEffect(() => {
    apiInstance.get("products/")
      .then((response) => {
        setProducts(response.data);
        console.log(response.data);
      });
  }, []);

  useEffect(() => {
    apiInstance.get("category/")
      .then((response) => {
        setCategory(response.data);
        console.log(response.data);
      });
  }, []);

  const handleAddToCart = async (product_id, price, shipping_amount) => {
    const formData = new FormData();

    formData.append("product_id", product_id);
    formData.append("user_id", userData?.user_id);
    formData.append("qty", qtyValue);
    formData.append("price", price);
    formData.append("shipping_amount", shipping_amount);
    formData.append("country", currentAddress.country);
    formData.append("color", colorValue);
    formData.append("cart_id", cart_id);

    const response = await apiInstance.post(`cart-view/`, formData);
    Toast.fire({
      icon: 'success',
      title: response.data.message
    });
  }

  return (
    <div>
      <GlossCarousel />

      <section className="container mt-4">
        <div style={{marginTop:"80px"}} className="row">
          <div className="col-12">
            <div className="product-scroll-container">
              {products?.map((p, index) => (
                <div style={{height:"450px", width:"200px"}} className="product-card" key={index}>
                  <div className="card shadow-sm border-light rounded">
                    <Link to={`/detail/${p.slug}`}>
                      <img
                        src={p.image}
                        className="card-img-top"
                        style={{ maxHeight: "250px", objectFit: "cover" }}
                        alt={p.title}
                      />
                    </Link>
                    <div className="card-body">
                      <h5 className="card-title">
                        <Link to={`/detail/${p.slug}`} className="text-decoration-none text-dark">
                          {p.title}
                        </Link>
                      </h5>
                      <p className="card-text text-muted">{p.category?.title}</p>
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <h6 className="mb-0">{p.price}frs</h6>
                        <h6 className="mb-0 text-muted"><strike>{p.old_price}</strike></h6>
                      </div>
                      <div className="btn-group-vertical w-100">
                        <button
                          className="btn btn-primary dropdown-toggle w-100"
                          type="button"
                          id={`dropdownMenuClickable${p.id}`}
                          data-bs-toggle="dropdown"
                          aria-expanded="false"
                        >
                          Variation
                        </button>
                        <ul className="dropdown-menu" aria-labelledby={`dropdownMenuClickable${p.id}`}>
                          <div className="p-2">
                            <b>Quantité</b>:
                            <input
                              className='form-control mt-2'
                              value={qtyValue}
                              onChange={(e) => handleQtyChange(e, p.id)}
                              type='number'
                              min="1"
                            />
                          </div>
                          {p.color?.length > 0 &&
                          <div className="p-2">
                            <b>Color</b>: {selectedColors[p.id] || "Pas de Couleur"}
                            <div className="mt-2 d-flex flex-wrap">
                              {p.color?.map((color, index) => (
                                <button
                                  key={index}
                                  className="btn btn-sm me-2 mb-2"
                                  style={{ backgroundColor: color.color_code }}
                                  onClick={(e) => handleColorButtonClick(e, p.id, color.name)}
                                />
                              ))}
                            </div>
                          </div>}
                          <div className="d-flex flex-column mt-2">
                            <button
                              type="button"
                              className="btn btn-primary mb-2"
                              onClick={() => handleAddToCart(p.id, p.price, p.shipping_amount)}
                            >
                              <i className="fas fa-shopping-cart me-2" />
                              Ajouter au panier
                            </button>
                            <button type="button" className="btn btn-danger">
                              <i className="fas fa-heart me-2" />
                              Ajouter aux favoris
                            </button>
                          </div>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="container mt-4">
        <div style={{marginTop:"80px"}} className="row align-items-center">
          <div className="col-md-6">
            <img src={show} alt="Showcase" className="img-fluid" style={{height: "600px", width: "100%", objectFit: "cover"}} />
          </div>
          <div className="col-md-6">
            <h3 className="mb-3" style={{ fontSize: '2rem', color: '#FF6F61', fontWeight: 'bold' }}>
              Découvrez nos produits exclusifs !
            </h3>
            <p className="mb-4" style={{ fontSize: '1.125rem', color: '#333', lineHeight: '1.6' }}>
              Nos produits sont soigneusement sélectionnés pour vous offrir le meilleur. Que vous soyez à la recherche de nouveautés ou d’articles préférés, nous avons ce qu’il vous faut. Contactez-nous pour toute question ou pour passer une commande personnalisée.
            </p>
          </div>
        </div>
        <ContactForm />
      </section>
    </div>
  )
}

export default HomeScreen
