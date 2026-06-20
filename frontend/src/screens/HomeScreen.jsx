import React, { useEffect, useState, useContext } from 'react'
import { trackProductHoverStart, trackProductHoverEnd } from '../utils/tracking'
import SEO from '../components/SEO'
import GlossCarousel from '../components/GlossCarousel'
import apiInstance from '../utils/axios';
import GetCurrentAddress from '../plugin/UserCountry';
import UserData from '../plugin/UserData';
import CartID from '../plugin/CartID';
import Swal from 'sweetalert2'
import { Link, useNavigate } from 'react-router-dom';
import './homescreen.css'
import ContactForm from '../components/ContactForm';
import ReviewCarousel from '../components/ReviewCarousel';
import { CartContext } from '../plugin/Context';

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
  const [quantities, setQuantities] = useState({});
  const [showSpecifications, setShowSpecifications] = useState({});
  const [search, setSearch] = useState("")
  const [expandedDescriptions, setExpandedDescriptions] = useState({});
  const [imgLoaded, setImgLoaded] = useState({});
  const [isSearching, setIsSearching] = useState(false);
  const currentAddress = GetCurrentAddress();
  const userData = UserData();

  const navigate = useNavigate()
  const cart_id = CartID();
  const axios = apiInstance
  const [cartCount, setCartCount] = useContext(CartContext)

  const toggleDescriptionExpand = (productId) => {

    setExpandedDescriptions((prev) => ({
      ...prev,
      [productId]: !prev[productId], // Toggle the state for the specific product
    }));
  };


  const getQty = (product_id) => quantities[product_id] ?? 1;

  const changeQty = (product_id, delta) => {
    setQuantities((prev) => ({
      ...prev,
      [product_id]: Math.max(1, (prev[product_id] ?? 1) + delta),
    }));
  };

  useEffect(() => {
    axios.get("products/")
      .then((response) => {
        setProducts(response.data);
      
      });
  }, []);

  useEffect(() => {
    axios.get("category/")
      .then((response) => {
        setCategory(response.data);
        
      });
  }, []);

  const handleAddToCart = async (product_id, price, shipping_amount) => {
    const formData = new FormData();

    formData.append("product_id", product_id);
    formData.append("user_id", userData?.user_id);
    formData.append("qty", getQty(product_id));
    formData.append("price", price);
    formData.append("shipping_amount", shipping_amount);
    formData.append("country", currentAddress.country);
    formData.append("cart_id", cart_id);

    const response = await axios.post(`cart-view/`, formData);
    Toast.fire({
      icon: 'success',
      title: response.data.message
    });

    const url = userData ? `cart-list/${cart_id}/${userData?.user_id}/` : `cart-list/${cart_id}/`;
    apiInstance.get(url).then((res) => {
      setCartCount(res.data.length)
    })
  }

  const addToWishList = async (productId, userId) => {
    if (!userData?.user_id) {
      // Si l'utilisateur n'est pas connecté
      Swal.fire({
        icon: 'warning',
        title: 'Connectez-vous',
        text: 'Veuillez vous connecter pour ajouter cet article à votre wishlist !',
        showCancelButton: true,
        confirmButtonText: 'Se connecter',
        cancelButtonText: 'Annuler',
        customClass: {
          confirmButton: 'custom-confirm-button', // Classe personnalisée pour le bouton de confirmation
          cancelButton: 'custom-cancel-button',  // Classe personnalisée pour le bouton d'annulation
        
        },
        buttonsStyling: false,
      }).then((result) => {
        if (result.isConfirmed) {
          navigate('/login'); // Redirige l'utilisateur vers la page de connexion
        }
      });
      return; // Quitte la fonction si l'utilisateur n'est pas connecté
    }

    try {
      const formData = new FormData();
      formData.append('product_id', productId);
      formData.append('user_id', userId);

      const response = await apiInstance.post(`customer/wishlist/${userId}/`, formData);
      

      Swal.fire({
        icon: 'success',
        title: response.data.message,
      });
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: "Une erreur s'est produite lors de l'ajout à la wishlist.",
      });
    }
  }

 const toggleSpecifications = (productId) => {
  setShowSpecifications((prev) => ({
    ...prev,
    [productId]: !prev[productId],
  }));
};
const handleSearchChange = (event) => {
  setSearch(event.target.value)
}
const handleSearchSubmit = () => {
  if (search.trim()) navigate(`/search?query=${search.trim()}`)
}
const handleSearchKey = (e) => {
  if (e.key === 'Enter') handleSearchSubmit()
}


  return (
    <div>
      <SEO
        title="Gloss & Cosmétiques livrés au Canada"
        description="Découvrez Lips Empire by Arielle : gloss hydratants, brillants à lèvres vegans et cosmétiques tendance. Livraison rapide partout au Canada et à l'international."
        url="/"
      />

      <GlossCarousel />

      {/* Section produits */}
      <section id="produits" className="container mt-4">
        <div style={{marginTop:"40px"}} className="row">
          <div className="col-12">
          <input
              className="form-control me-2"
              type="text"
              placeholder="Rechercher un gloss..."
              onChange={handleSearchChange}
              onKeyDown={handleSearchKey}
              style={{ maxWidth: '600px', width: '100%' }}
            />
        <button
    type="button"
    onClick={handleSearchSubmit}
    className="btn me-2 custom-btn"
  >
    {isSearching ? (
      <span className="spinner-border spinner-border-sm"></span>
    ) : (
      'Rechercher'
    )}
  </button>
            <div className="product-scroll-container">
              {products?.map((p, index) => (
                <div
                  className={`product-card ${showSpecifications[p.id] || expandedDescriptions[p.id] ? 'expanded' : ''}`}
                  key={index}
                  onMouseEnter={() => trackProductHoverStart(p.id)}
                  onMouseLeave={() => trackProductHoverEnd(p.id)}
                >
                  <div className="card shadow-sm border-light rounded">
                    <Link to={`/detail/${p.slug}`} style={{ position: 'relative', display: 'block' }}>
                      <div style={{ position: 'relative' }}>
                        {!imgLoaded[p.id] && (
                          <div style={{
                            position: 'absolute', inset: 0,
                            background: 'linear-gradient(90deg, #fce4dc 25%, #fedbd1 50%, #fce4dc 75%)',
                            backgroundSize: '200% 100%',
                            animation: 'shimmer 1.4s infinite',
                            borderRadius: '8px 8px 0 0',
                            zIndex: 1,
                          }} />
                        )}
                        <img
                          src={p?.image?.replace("backend.lipsempirebyarielle.store", "lipsempirebyarielle.store")}
                          className="card-img-top product-image"
                          alt={p.title}
                          loading="lazy"
                          decoding="async"
                          onLoad={() => setImgLoaded(prev => ({ ...prev, [p.id]: true }))}
                          style={{ display: 'block', opacity: imgLoaded[p.id] ? 1 : 0, transition: 'opacity 0.3s' }}
                        />
                      </div>
                      {p.stock_qty > 0 && p.stock_qty <= 3 && (
                        <span style={{
                          position: 'absolute', top: 8, left: 8,
                          background: '#1a1a1a', color: '#fedbd1',
                          fontSize: 11, fontWeight: 700,
                          padding: '4px 10px', borderRadius: 99,
                          letterSpacing: '0.03em',
                        }}>
                          ! Plus que {p.stock_qty}
                        </span>
                      )}
                      {p.stock_qty === 0 && (
                        <span style={{
                          position: 'absolute', top: 8, left: 8,
                          background: '#6b7280', color: '#fff',
                          fontSize: 11, fontWeight: 700,
                          padding: '4px 10px', borderRadius: 99,
                        }}>
                          Épuisé
                        </span>
                      )}
                    </Link>
                    <div className="card-body">
                      <h5 className="card-title">
                        <Link to={`/detail/${p.slug}`} className="text-decoration-none text-dark">
                          {p.title}
                        </Link>
                      </h5>
                       
                      
{/*                       
                      <div className="toggle-container">

   Section INGREDIENTS 

  <div style={{ borderBottom:  "1px solid black"}}>
  <button
    className="toggle-btn"
    onClick={() => toggleSpecifications(p.id)}
  >
    <span>
      <b>INGRÉDIENTS</b>
      {showSpecifications[p.id] ? " −" : " +"}
    </span>
  </button>
  {showSpecifications[p.id] && (
    <div className="toggle-content">
      {p.specification?.map((spec, index) => (
        <div key={index} className="d-flex">
         {spec.content}
        </div>
      ))}
    </div>
  )}
</div>
   Section POURQUOI CE GLOSS 
  <button
    className="toggle-btn"
    onClick={() => toggleDescriptionExpand(p.id)}
  >
    <span>
      <b>POURQUOI CE GLOSS ?</b>
      {expandedDescriptions[p.id] ? " −" : " +"}
    </span>
  </button>
  {expandedDescriptions[p.id] && (
    <div className="toggle-content">
      <p>
        Découvrez notre lip gloss hydratant, l’allié idéal pour
        des lèvres glamour et en pleine santé. Formulé pour les
        lèvres gercées, il offre une hydratation intense et une
        réparation durable. Sa texture légère et non collante
        glisse facilement, laissant une brillance éclatante et
        une sensation de douceur. Enrichi en ingrédients
        nourrissants, il protège et revitalise vos lèvres.
        Dites adieu aux lèvres sèches et affichez un sourire
        irrésistible. Adoptez ce must-have pour un look chic et
        sophistiqué, tout en chouchoutant vos lèvres comme
        jamais auparavant.
      </p>
    </div>
  )}


*/}

                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <h6 style={{color:'black'}} className="mb-0">{p.price}{"  "}CAD</h6>
                        {/* <h6 className="mb-0 text-muted"><strike>{p.old_price}</strike></h6> */}
                        
                      </div>
                      {/* Sélecteur de quantité */}
                      <div className="d-flex align-items-center justify-content-center mb-2" style={{gap: '8px'}}>
                        <button
                          type="button"
                          className="btn btn-sm"
                          style={{backgroundColor:'#fedbd1', color:'black', width:'32px', padding:'0'}}
                          onClick={() => changeQty(p.id, -1)}
                          disabled={p.stock_qty === 0}
                        >−</button>
                        <span style={{minWidth:'24px', textAlign:'center', fontWeight:'600'}}>
                          {getQty(p.id)}
                        </span>
                        <button
                          type="button"
                          className="btn btn-sm"
                          style={{backgroundColor:'#fedbd1', color:'black', width:'32px', padding:'0'}}
                          onClick={() => changeQty(p.id, 1)}
                          disabled={p.stock_qty === 0 || getQty(p.id) >= p.stock_qty}
                        >+</button>
                      </div>

                      {/* Boutons action */}
                      <div className="d-flex flex-column" style={{gap:'8px'}}>
                        <button
                          type="button"
                          style={{color: 'black', backgroundColor:'#fedbd1'}}
                          className="btn w-100"
                          onClick={() => handleAddToCart(p.id, p.price, p.shipping_amount)}
                          disabled={p.stock_qty === 0}
                        >
                          <i className="fas fa-shopping-cart me-2" />
                          {p.stock_qty === 0 ? "Rupture de stock" : "Ajouter au panier"}
                        </button>
                        <button
                          type="button"
                          className="btn w-100"
                          style={{color:'black', backgroundColor:'#fedbd1'}}
                          onClick={() => addToWishList(p.id, userData?.user_id)}
                        >
                          <i className="fas fa-heart me-2" />
                          Favoris
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <ReviewCarousel />

      <section className="container mt-4">
     {/*   <div style={{marginTop:"80px"}} className="row align-items-center">
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
        </div>*/}
        <ContactForm />
       
      </section>
    </div>
  )
}

export default HomeScreen;
