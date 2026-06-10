import React, { useState,useContext, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import apiInstance from '../utils/axios';
import { trackEvent } from '../utils/tracking';
import GetCurrentAddress from '../plugin/UserCountry';
import UserData from '../plugin/UserData';
import { Row, Col, Image, ListGroup, Card, Button } from "react-bootstrap";
import CartID from '../plugin/CartID';
import Swal from 'sweetalert2';
import './productdetailscreen.css';
import moment from 'moment'
import { CartContext } from '../plugin/Context';


const Toast = Swal.mixin({
  toast: true,
  position: "top",
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
});

function ProductDetailScreen() {
    const [product, setProduct] = useState({});
    const [specifications, setSpecifications] = useState([]);
    const [gallery, setGallery] = useState([]);
    // const [color, setColor] = useState([]);
    // const [colorValue, setColorValue] = useState("No Color");
    const [qtyValue, setQtyValue] = useState(1);
    const [showSpecifications, setShowSpecifications] = useState({});
    const [expandedDescriptions, setExpandedDescriptions] = useState({});
    const [currentImage, setCurrentImage] = useState(""); // Ajout de l'état pour l'image affichée
    const param = useParams();
    const currentAddress = GetCurrentAddress();
    const userData = UserData();
    const cart_id = CartID();
    const navigate = useNavigate()
    const [reviews, setReviews] = useState([])
    const [createReview, setCreateReview] = useState({
        user_id:0, product_id: product?.id, review: "", rating:0
    })
    const [cartCount, setCartCount] = useContext(CartContext)
    const toggleDescriptionExpand = (productId) => {
        setExpandedDescriptions((prev) => ({
          ...prev,
          [productId]: !prev[productId], // Toggle the state for the specific product
        }));
      };
    
      const toggleSpecifications = (productId) => {
        setShowSpecifications((prev) => ({
          ...prev,
          [productId]: !prev[productId],
        }));
      };
    useEffect(() => {
        apiInstance.get(`product/${param.slug}/`)
            .then((res) => {
                setProduct(res.data);
                setSpecifications(res.data.specification);
                setGallery(res.data.gallery);
                trackEvent('view_product', { product_id: res.data.id, value: res.data.price });
                setCurrentImage(res.data.image); // Définit l'image de base comme image initiale
                
            });
    }, [param.slug]);

    // const handleColorButtonClick = (event) => {
    //     const colorNameInput = event.target.closest('.color_button').parentNode.querySelector(".color_name");
    //     setColorValue(colorNameInput.value);
    // };

    const handleImageClick = (image) => {
        // Met à jour l'image actuellement affichée
        setCurrentImage(image);
    };

    const handleQuantityChange = (event) => {
        setQtyValue(event.target.value);
    };

    const handleAddToCart = async() => {
        const formData = new FormData();
        formData.append("product_id", product.id);
        formData.append("user_id", userData?.user_id);
        formData.append("qty", qtyValue);
        formData.append("price", product.price);
        formData.append("shipping_amount", product.shipping_amount);
        formData.append("country", currentAddress.country);
        formData.append("cart_id", cart_id);

        try {
            const response = await apiInstance.post(`cart-view/`, formData);
            const url = userData ? `cart-list/${cart_id}/${userData?.user_id}/` : `cart-list/${cart_id}/`;
    apiInstance.get(url).then((res) => {
      setCartCount(res.data.length)
    })
            trackEvent('add_to_cart', { product_id: product.id, value: product.price });
            Toast.fire({
                icon: 'success',
                title: response.data.message,
            });

        } catch (error) {
            Toast.fire({
                icon: 'error',
                title: 'Failed to add to cart',
            });
        }
    };

    
    const fetchReviewData = async() => {
        if (product?.id){
        await apiInstance.get(`reviews/${product?.id}/`).then((res) =>{
            
            setReviews(res.data)
        })
    }  }  

    useEffect(() => {
        fetchReviewData()
    
        
    }, [product])

    const handleReviewChange = () => {
        setCreateReview({
            ...createReview,
            [event.target.name]:event.target.value
        })
    
    }

    const handleReviewSubmit = (e) => {
        e.preventDefault();
      
        if (!userData?.user_id) {
          Swal.fire({
            icon: 'warning',
            title: 'Connectez-vous',
            text: 'Veuillez vous connecter pour laisser un avis !',
            showCancelButton: true,
            confirmButtonText: 'Se connecter',
            cancelButtonText: 'Annuler',
            customClass: {
              confirmButton: 'custom-confirm-button',
              cancelButton: 'custom-cancel-button',
            },
            buttonsStyling: false,
          }).then((result) => {
            if (result.isConfirmed) {
              navigate('/login');
            }
          });
          return;
        }
      
        const formdata = new FormData();
        formdata.append("user_id", userData?.user_id);
        formdata.append("product_id", product?.id);
        formdata.append("rating", createReview.rating);
        formdata.append("review", createReview.review);
      
        apiInstance.post(`reviews/${product?.id}/`, formdata)
          .then((res) => {
            Swal.fire({
              icon: 'success',
              title: 'Merci pour votre avis !',
            });
            fetchReviewData();
          })
          .catch((error) => {
            console.error(error);
            Swal.fire({
              icon: 'error',
              title: 'Erreur',
              text: "Une erreur s'est produite lors de l'envoi de votre avis.",
            });
          });
      };
      

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
  
  const getSafeImageURL = (url) => {
    if (!url) return "";
    return url.replace("backend.lipsempirebyarielle.store", "lipsempirebyarielle.store");
  };
  

   
    return (
        <main style={{marginTop: "22px", marginBottom: "50px"}}>
            <div className="container">
                <section className="mb-9">
                    <div className="row gx-lg-5">
                        <div className="col-md-6 mb-4 mb-md-0">
                            <div className="">
                                <div className="row gx-2 gx-lg-3">
                                    <div className="col-12 col-lg-12">
                                        <div className="lightbox">
                                            <img
                                                src={getSafeImageURL(currentImage)}
                                             
                                                alt="Gallery image 1"
                                                className="ecommerce-gallery-main-img active custom-img rounded-4"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-3 d-flex">
                                {/* Ajout de l'image de base comme cliquable */}
                                <div className="p-3">
                                    <img
                                        src={getSafeImageURL(product?.image)}
                                        onClick={() => handleImageClick(getSafeImageURL(product?.image))}
                                        style={{
                                            width: 100,
                                            height: 100,
                                            objectFit: "cover",
                                            borderRadius: 10,
                                            cursor: "pointer",
                                        }}
                                        alt="Main product image"
                                    />
                                </div>
                                {gallery.map((g, index) => (
                                    <div className="p-3" key={index}>
                                        <img
                                            src={getSafeImageURL(g?.image)}
                                            onClick={() => handleImageClick(getSafeImageURL(g?.image))}
                                            style={{
                                                width: 100,
                                                height: 100,
                                                objectFit: "cover",
                                                borderRadius: 10,
                                                cursor: "pointer",
                                            }}
                                            alt="Gallery image"
                                        />
                                    </div>
                                ))}
                            </div>
                            </div>
                        </div>
                        <div className="col-md-6 mb-4 mb-md-0">
                            <div>
                                <h1 style={{color:'black'}} className="fw-bold mb-3">{product.title}</h1>
                                <h5 className="mb-3">
                               
                                    <span  style={{color:'black'}}  className="align-middle">{product.price} CAD</span>
                                </h5>
                            
                                
                                <hr className="my-5" />
                                <div>
                                    <div className="col-md-6 mb-4">
                                        <div className="form-outline">
                                            <label className="form-label" htmlFor="typeNumber"><b>Quantity</b></label>
                                            <input
                                                type="number"
                                                id="typeNumber"
                                                className=""
                                                min={1}
                                                value={qtyValue}
                                                onChange={handleQuantityChange}
                                            />
                                        </div>
                                    </div>
                                    {/* {color.length > 0 &&
                                        <>
                                            <h6 style={{color:'black'}}>Color:<span>{colorValue}</span></h6>
                                            <div className='col-md-6 mb-4'>
                                                <div className='d-flex'>
                                                    {color.map((c, index) => (
                                                        <div key={index}>
                                                            <input type='hidden' className='color_name' value={c.name} />
                                                            <button className='btn p-3 m-1 color_button' type='button' onClick={handleColorButtonClick} style={{ backgroundColor: `${c.color_code}` }}></button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </>
                                    } */}
                                    
                                    <button 
                                        type="button"
                                        style={{color: 'black',  backgroundColor:'#fedbd1'}}
                                        className="btn  btn-rounded me-2"
                                       onClick={handleAddToCart}
                                        disabled={product.stock_qty === 0}
                                    >
                                        <i className="fas fa-cart-plus me-2" /> {product.stock_qty === 0 ? "Rupture de stock" : "Ajouter au panier"}
                                    </button>
                                    <button
                                      onClick={() => addToWishList(product.id, userData?.user_id)}
                                     style={{ backgroundColor:'#fedbd1'}} href="#!" type="button" className="btn" data-mdb-toggle="tooltip" title="Add to wishlist">
                                        <i  className="fas fa-heart " />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                

                <div className="toggle-container">



<div style={{ borderBottom:  "1px solid black"}}>
<button
 className="toggle-btn"
 onClick={() => toggleSpecifications(product.id)}
>
 <span>
   <b style={{color:'black'}}>INGRÉDIENTS</b>
   {showSpecifications[product.id] ? " −" : " +"}
 </span>
</button>
{showSpecifications[product.id] && (
 <div className="toggle-content">
   {product.specification?.map((spec, index) => (
     <div key={index} className="d-flex">
       <div dangerouslySetInnerHTML={{ __html: spec.content }} />
     </div>
   ))}
 </div>
)}
</div>
{/* Section POURQUOI CE GLOSS  */}
<button
 className="toggle-btn"
 onClick={() => toggleDescriptionExpand(product.id)}
>
 <span>
   <b style={{color:'black'}}>POURQUOI CE GLOSS ?</b>
   {expandedDescriptions[product.id] ? " −" : " +"}
 </span>
</button>
{expandedDescriptions[product.id] && (
 <div className="toggle-content">
  <div dangerouslySetInnerHTML={{ __html: product.description }} />
 </div>
)}
</div>

                
                {/* <br /> 
                <br /> */}
                {/* Specification section positioned to the left */}
                {/* <Row className="product-specification">
                    <Col md={12}>
                    
    
     <h3>POURQUOI CE GLOSS ?</h3> 
      <ul style={{marginBottom:"20px"}}>
        <li style={{fontFamily:'cursive', borderBottom: "2px dashed black"}}>  Découvrez notre lip gloss hydratant, l’allié idéal pour
        des lèvres glamour et en pleine santé. Formulé pour les
        lèvres gercées, il offre une hydratation intense et une
        réparation durable. Sa texture légère et non collante
        glisse facilement, laissant une brillance éclatante et
        une sensation de douceur. Enrichi en ingrédients
        nourrissants, il protège et revitalise vos lèvres.
        Dites adieu aux lèvres sèches et affichez un sourire
        irrésistible. Adoptez ce must-have pour un look chic et
        sophistiqué, tout en chouchoutant vos lèvres comme
        jamais auparavant. </li>
      </ul>
    
      
                        <h3>INGREDIENTS</h3>
                        <ul>
                            {specifications.map((s, index) => (
                                <li style={{fontFamily:'cursive'}} key={index}>
                                     {s.content}
                                </li>
                            ))}
                        </ul>
                    </Col>
                </Row> */}
                
                <div className="container mt-5">
                            <div className="row">
                                {/* Column 1: Form to create a new review */}
                                <div className="col-md-6">
                                    <h2 style={{color:"black"}}>Evaluez ce produit</h2>
                                    <form onSubmit={handleReviewSubmit}>
                                        <div className="mb-3">
                                        <label class="form-label" for="rating">Note</label>
                <div style={{backgroundColor:'white'}} class="rating">
                    <input type="radio" id="star5" name="rating" value="5" />
                    <label for="star5" title="5 étoiles">★</label>
                    <input type="radio" id="star4" name="rating" value="4"/>
                    <label for="star4" title="4 étoiles">★</label>
                    <input type="radio" id="star3" name="rating" value="3" />
                    <label for="star3" title="3 étoiles">★</label>
                    <input type="radio" id="star2" name="rating" value="2" />
                    <label for="star2" title="2 étoiles">★</label>
                    <input type="radio" id="star1" name="rating" value="1" />
                    <label for="star1" title="1 étoile">★</label>
                </div>
                                        </div>
                                        <div className="mb-3">
                                            <label style={{color:"black"}} htmlFor="reviewText" className="form-label">
                                                Avis
                                            </label>
                                            <textarea
                                                className="form-control"
                                                id="reviewText"
                                                rows={4}
                                                placeholder="Write your review"
                                                name='review'
                                                value={createReview.review}
                                                onChange={handleReviewChange}
                                            />
                                        </div>
                                        <button style={{color:'black',  backgroundColor:'#fedbd1'}} type="submit" className="btn text-muted">
                                            Soumettre
                                        </button>
                                    </form>
                                </div>
                                {/* Column 2: Display existing reviews */}
                                <div className="col-md-6">
                                    <h2 style={{color:'black'}}>Avis</h2>
                                    {reviews?.map((r, index) => (
                                         <div className="card mb-3">
                                         <div className="row border g-0">
                                             <div className="col-md-3">
                                                 <img
                                                     src={r.profile.image}
                                                     alt="User Image"
                                                     className="img-fluid"
                                                     style={{maxWidth: '100px', maxHeight:'100px'}}
                                                 />
                                             </div>
                                             <div className="col-md-9">
                                                 <div className="card-body">
                                                     <h5 className="card-title">{r.profile.full_name}</h5>
                                                     <p className="card-text">{moment(r.date).format("d MMMM, YYYY")}</p>
                                                     <p style={{backgroundColor:''}} className="card-text">
                                                         {r.review} <br/>
                                                         {r.rating === 1 &&
                                                             <i className='fas fa-star' style={{ color: '#FFE6E9'}}></i>
                                                         }
                                                           {r.rating === 2 &&
                                                           <>
                                                             <i className='fas fa-star' style={{ color: '#FFE6E9'}}></i>
                                                             <i className='fas fa-star' style={{ color: '#FFE6E9' }}></i>
                                                             </>
                                                         }
                                                          {r.rating === 3 &&
                                                           <>
                                                             <i className='fas fa-star' style={{ color: '#FFE6E9' }}></i>
                                                             <i className='fas fa-star' style={{ color: '#FFE6E9' }}></i>
                                                             <i className='fas fa-star' style={{ color: '#FFE6E9' }}></i>
                                                             </>
                                                         }
                                                          {r.rating === 4 &&
                                                           <>
                                                             <i className='fas fa-star' style={{ color: '#FFE6E9' }}></i>
                                                             <i className='fas fa-star' style={{ color: '#FFE6E9' }}></i>
                                                             <i className='fas fa-star' style={{ color: '#FFE6E9' }}></i>
                                                             <i className='fas fa-star' style={{ color: '#FFE6E9' }}></i>
                                                             </>
                                                         }
                                                          {r.rating === 5 &&
                                                           <>
                                                             <i className='fas fa-star' style={{ color: '#FFE6E9' }}></i>
                                                             <i className='fas fa-star' style={{ color: '#FFE6E9' }}></i>
                                                             <i className='fas fa-star' style={{ color: '#FFE6E9' }}></i>
                                                             <i className='fas fa-star' style={{ color: '#FFE6E9' }}></i>
                                                             <i className='fas fa-star' style={{ color: '#FFE6E9' }}></i>
                                                             </>
                                                         }
                                                     </p>
                                                 </div>
                                             </div>
                                         </div>
                                     </div>
                                    ))}
                                   
                                    
                                    
                                </div>
                            </div>
                        </div>
            </div>
        </main>
    );
}

export default ProductDetailScreen;
