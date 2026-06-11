import React, { useState, useContext, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import SEO from '../components/SEO';
import apiInstance from '../utils/axios';
import { trackEvent } from '../utils/tracking';
import GetCurrentAddress from '../plugin/UserCountry';
import UserData from '../plugin/UserData';
import { Row, Col, Image, ListGroup, Card, Button } from "react-bootstrap";
import CartID from '../plugin/CartID';
import Swal from 'sweetalert2';
import './productdetailscreen.css';
import dayjs from 'dayjs'
import { CartContext } from '../plugin/Context';


const Toast = Swal.mixin({
  toast: true,
  position: "top",
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
});

function useSocialProof(productId) {
    const [signal, setSignal] = useState(null)
    const intervalRef = useRef(null)

    useEffect(() => {
        if (!productId) return

        // Seed basé sur l'id produit pour des chiffres cohérents par produit
        const seed = productId * 9301 + 49297
        const rand = (min, max, offset = 0) => {
            const n = ((seed + offset) % 233) / 233
            return Math.floor(n * (max - min + 1)) + min
        }

        const MESSAGES = [
            () => ({ icon: null, text: `${rand(2, 6)} personnes regardent ce produit en ce moment` }),
            () => ({ icon: null, text: `${rand(1, 4, 17)} personnes ont ce produit dans leur panier` }),
            () => ({ icon: null, text: `Dernière commande il y a ${rand(8, 45, 31)} minutes` }),
            () => ({ icon: null, text: `${rand(3, 9, 53)} personnes l'ont acheté cette semaine` }),
        ]

        // Choisir un message initial basé sur le seed (pas aléatoire à chaque render)
        const startIndex = seed % MESSAGES.length
        const pick = (i) => MESSAGES[(startIndex + i) % MESSAGES.length]()

        let i = 0
        setSignal(pick(i))

        intervalRef.current = setInterval(() => {
            i++
            setSignal(pick(i))
        }, 7000)

        return () => clearInterval(intervalRef.current)
    }, [productId])

    return signal
}

function ProductDetailScreen() {
    const [product, setProduct] = useState({});
    const [specifications, setSpecifications] = useState([]);
    const [gallery, setGallery] = useState([]);
    const [qtyValue, setQtyValue] = useState(1);
    const [showSpecifications, setShowSpecifications] = useState({});
    const [expandedDescriptions, setExpandedDescriptions] = useState({});
    const [currentImage, setCurrentImage] = useState("");
    const [zoomed, setZoomed] = useState(false);
    const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
    const [related, setRelated] = useState([]);
    const param = useParams();
    const currentAddress = GetCurrentAddress();
    const userData = UserData();
    const cart_id = CartID();
    const navigate = useNavigate()
    const [reviews, setReviews] = useState([])
    const [createReview, setCreateReview] = useState({
        user_id:0, product_id: product?.id, review: "", rating:0
    })
    const socialProof = useSocialProof(product?.id)
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
                setCurrentImage(res.data.image);
                if (res.data.category?.id) {
                    apiInstance.get(`products/?category=${res.data.category.id}`)
                        .then(r => setRelated(
                            (r.data.results || r.data)
                                .filter(p => p.slug !== res.data.slug)
                                .slice(0, 4)
                        ))
                        .catch(() => {});
                }
            });
    }, [param.slug]);

    const handleZoomMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setZoomPos({ x, y });
    };

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
            [event.target.name]: event.target.value
        })
    }

    const [reviewName, setReviewName] = useState(userData?.username || '')
    const [reviewEmail, setReviewEmail] = useState('')
    const [reviewPhotos, setReviewPhotos] = useState([])
    const [reviewSubmitted, setReviewSubmitted] = useState(false)
    const [reviewLoading, setReviewLoading] = useState(false)

    const handleReviewSubmit = async (e) => {
        e.preventDefault()
        if (!createReview.rating) { Swal.fire({ icon: 'warning', title: 'Note requise', text: 'Choisissez une note entre 1 et 5 etoiles.', confirmButtonColor: '#1a1a1a' }); return }
        if (!createReview.review.trim()) { Swal.fire({ icon: 'warning', title: 'Avis requis', text: 'Ecrivez quelques mots sur ce produit.', confirmButtonColor: '#1a1a1a' }); return }
        const name = userData?.username || reviewName
        const email = reviewEmail
        if (!name.trim()) { Swal.fire({ icon: 'warning', title: 'Prenom requis', confirmButtonColor: '#1a1a1a' }); return }
        setReviewLoading(true)
        const fd = new FormData()
        fd.append('reviewer_name', name)
        fd.append('reviewer_email', email)
        fd.append('product_id', product?.id)
        fd.append('rating', createReview.rating)
        fd.append('review', createReview.review)
        fd.append('is_global', 'false')
        if (userData?.user_id) fd.append('user_id', userData.user_id)
        reviewPhotos.forEach(p => fd.append('photos', p))
        try {
            await apiInstance.post('reviews/submit/', fd)
            setReviewSubmitted(true)
        } catch {
            Swal.fire({ icon: 'error', title: 'Erreur', text: "Une erreur s'est produite. Reessayez.", confirmButtonColor: '#1a1a1a' })
        }
        setReviewLoading(false)
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
  
  const getSafeImageURL = (url) => {
    if (!url) return "";
    return url.replace("backend.lipsempirebyarielle.store", "lipsempirebyarielle.store");
  };
  

   
    return (
        <>
        <main style={{marginTop: "22px", marginBottom: "50px"}}>
            <SEO
                title={product.title}
                description={product.description}
                image={product.image}
                url={`/detail/${param.slug}/`}
                type="product"
                product={{
                    title: product.title,
                    description: product.description,
                    image: product.image,
                    price: product.price,
                    stock_qty: product.stock_qty,
                    rating: product.average_rating,
                    reviews: reviews.length,
                }}
            />
            <div className="container">
                <section className="mb-9">
                    <div className="row gx-lg-5">
                        <div className="col-md-6 mb-4 mb-md-0">
                            <div className="">
                                <div className="row gx-2 gx-lg-3">
                                    <div className="col-12 col-lg-12">
                                        <div
                                            className="lightbox"
                                            style={{ position: 'relative', overflow: 'hidden', cursor: zoomed ? 'zoom-out' : 'zoom-in', borderRadius: 16 }}
                                            onMouseMove={handleZoomMove}
                                            onMouseEnter={() => setZoomed(true)}
                                            onMouseLeave={() => setZoomed(false)}
                                        >
                                            <img
                                                src={getSafeImageURL(currentImage)}
                                                alt="Gallery image 1"
                                                className="ecommerce-gallery-main-img active custom-img rounded-4"
                                                style={{
                                                    transition: 'transform 0.15s ease',
                                                    transform: zoomed ? `scale(2)` : 'scale(1)',
                                                    transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                                                    display: 'block', width: '100%',
                                                }}
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

                                {socialProof && (
                                    <div style={{
                                        display: 'inline-flex', alignItems: 'center', gap: 7,
                                        background: '#fff8f6', border: '1px solid #fedbd1',
                                        borderRadius: 30, padding: '6px 14px',
                                        fontSize: 13, color: '#b5485a', fontWeight: 500,
                                        marginBottom: 8,
                                        animation: 'fadeInSignal 0.4s ease',
                                    }}>
                                        <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#e8637a', flexShrink: 0, display: 'inline-block' }} />
                                        {socialProof.text}
                                    </div>
                                )}
                                <style>{`
                                  @keyframes fadeInSignal {
                                    from { opacity: 0; transform: translateY(4px); }
                                    to   { opacity: 1; transform: translateY(0); }
                                  }
                                `}</style>

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
                
                <div className="container mt-5" style={{ maxWidth: 860 }}>
                    <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 40 }}>

                        {/* Avis existants */}
                        {reviews.filter(r => r.status === 'approved').length > 0 && (
                            <div style={{ marginBottom: 40 }}>
                                <h3 style={{ fontWeight: 700, fontSize: 18, color: '#1a1a1a', marginBottom: 20 }}>
                                    Avis clients ({reviews.filter(r => r.status === 'approved').length})
                                </h3>
                                {reviews.filter(r => r.status === 'approved').map((r, i) => (
                                    <div key={i} style={{
                                        background: '#fff', border: '1px solid #f0f0f0',
                                        borderRadius: 12, padding: '16px 20px', marginBottom: 12,
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                                            <div style={{
                                                width: 34, height: 34, borderRadius: '50%',
                                                background: '#fedbd1', display: 'flex', alignItems: 'center',
                                                justifyContent: 'center', fontWeight: 700, fontSize: 13, color: '#c44569', flexShrink: 0,
                                            }}>
                                                {(r.reviewer_name || r.profile?.full_name || 'C')[0].toUpperCase()}
                                            </div>
                                            <div>
                                                <p style={{ margin: 0, fontWeight: 700, fontSize: 13, color: '#1a1a1a' }}>
                                                    {r.reviewer_name || r.profile?.full_name || 'Cliente'}
                                                </p>
                                                <p style={{ margin: 0, fontSize: 11, color: '#bbb' }}>
                                                    {dayjs(r.date).format('D MMM YYYY')}
                                                </p>
                                            </div>
                                            <span style={{ marginLeft: 'auto', color: '#f59e0b', fontSize: 15, letterSpacing: 1 }}>
                                                {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                                            </span>
                                        </div>
                                        <p style={{ margin: 0, fontSize: 14, color: '#444', lineHeight: 1.6 }}>{r.review}</p>
                                        {r.photos?.length > 0 && (
                                            <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
                                                {r.photos.map((ph, pi) => (
                                                    <img key={pi} src={ph.image} alt="" style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 7, border: '1px solid #f0f0f0' }} />
                                                ))}
                                            </div>
                                        )}
                                        {r.is_verified_purchase && (
                                            <span style={{ display: 'inline-block', marginTop: 8, background: '#f0fdf4', color: '#065f46', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, border: '1px solid #bbf7d0' }}>
                                                Achat verifie
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Formulaire */}
                        <h3 style={{ fontWeight: 700, fontSize: 18, color: '#1a1a1a', marginBottom: 6 }}>
                            Donnez votre avis
                        </h3>
                        {/* <p style={{ fontSize: 13, color: '#aaa', marginBottom: 20 }}>
                            Votre avis sera visible apres validation par notre equipe.
                        </p> */}

                        {reviewSubmitted ? (
                            <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 12, padding: '20px 24px' }}>
                                <p style={{ margin: 0, color: '#065f46', fontWeight: 600, fontSize: 15 }}>
                                    Merci ! Votre avis a été envoyé et sera publié sous peu.
                                </p>
                            </div>
                        ) : (
                            <form onSubmit={handleReviewSubmit} style={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: 14, padding: '24px 26px' }}>

                                {/* Nom + email si pas connecte */}
                                {!userData?.user_id && (
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                                        <div>
                                            <label style={{ fontSize: 12, color: '#555', fontWeight: 600, display: 'block', marginBottom: 4 }}>Prenom *</label>
                                            <input
                                                value={reviewName}
                                                onChange={e => setReviewName(e.target.value)}
                                                placeholder="Marie"
                                                style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: 8, padding: '9px 12px', fontSize: 14, boxSizing: 'border-box' }}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: 12, color: '#555', fontWeight: 600, display: 'block', marginBottom: 4 }}>Email</label>
                                            <input
                                                value={reviewEmail}
                                                onChange={e => setReviewEmail(e.target.value)}
                                                placeholder="marie@email.com"
                                                type="email"
                                                style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: 8, padding: '9px 12px', fontSize: 14, boxSizing: 'border-box' }}
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Etoiles */}
                                <label style={{ fontSize: 12, color: '#555', fontWeight: 600, display: 'block', marginBottom: 6 }}>Note *</label>
                                <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
                                    {[1,2,3,4,5].map(s => (
                                        <button
                                            key={s}
                                            type="button"
                                            onClick={() => setCreateReview(r => ({ ...r, rating: s }))}
                                            style={{
                                                background: 'none', border: 'none', cursor: 'pointer',
                                                fontSize: 30, color: s <= (createReview.rating || 0) ? '#f59e0b' : '#e5e7eb',
                                                padding: 0, lineHeight: 1,
                                            }}
                                        >★</button>
                                    ))}
                                </div>

                                {/* Texte */}
                                <label style={{ fontSize: 12, color: '#555', fontWeight: 600, display: 'block', marginBottom: 4 }}>Votre avis *</label>
                                <textarea
                                    rows={4}
                                    name="review"
                                    value={createReview.review}
                                    onChange={handleReviewChange}
                                    placeholder="Partagez votre experience avec ce produit..."
                                    style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: 8, padding: '10px 12px', fontSize: 14, resize: 'vertical', boxSizing: 'border-box', marginBottom: 16 }}
                                />

                                {/* Photos */}
                                <label style={{ fontSize: 12, color: '#555', fontWeight: 600, display: 'block', marginBottom: 6 }}>Photos (optionnel, jusqu'a 5)</label>
                                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
                                    {reviewPhotos.map((f, i) => (
                                        <div key={i} style={{ position: 'relative', width: 64, height: 64 }}>
                                            <img src={URL.createObjectURL(f)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8, border: '1px solid #f0f0f0' }} />
                                            <button type="button" onClick={() => setReviewPhotos(p => p.filter((_, idx) => idx !== i))}
                                                style={{ position: 'absolute', top: -6, right: -6, background: '#1a1a1a', color: '#fff', border: 'none', borderRadius: '50%', width: 18, height: 18, fontSize: 11, cursor: 'pointer', lineHeight: '18px', padding: 0, textAlign: 'center' }}>
                                                x
                                            </button>
                                        </div>
                                    ))}
                                    {reviewPhotos.length < 5 && (
                                        <label style={{ width: 64, height: 64, borderRadius: 8, border: '2px dashed #fedbd1', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#ccc', fontSize: 22 }}>
                                            +
                                            <input type="file" accept="image/*" multiple style={{ display: 'none' }}
                                                onChange={e => {
                                                    const files = Array.from(e.target.files)
                                                    setReviewPhotos(p => [...p, ...files].slice(0, 5))
                                                }} />
                                        </label>
                                    )}
                                </div>

                                <button type="submit" disabled={reviewLoading} style={{
                                    background: '#1a1a1a', color: '#fedbd1',
                                    border: 'none', borderRadius: 10, padding: '13px 32px',
                                    fontWeight: 700, fontSize: 14, cursor: 'pointer', width: '100%',
                                }}>
                                    {reviewLoading ? 'Envoi en cours...' : 'Publier mon avis'}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>

            {/* Cross-sell — Vous aimerez aussi */}
            {related.length > 0 && (
                <div className="container" style={{ marginTop: 48, marginBottom: 32 }}>
                    <h4 style={{ fontWeight: 700, color: '#1a1a1a', marginBottom: 20 }}>Vous aimerez aussi</h4>
                    <div style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 8 }}>
                        {related.map(p => (
                            <a
                                key={p.id}
                                href={`/detail/${p.slug}`}
                                style={{ textDecoration: 'none', flexShrink: 0, width: 160 }}
                            >
                                <div style={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: 12, overflow: 'hidden' }}>
                                    <div style={{ position: 'relative' }}>
                                        <img
                                            src={getSafeImageURL(p.image)}
                                            alt={p.title}
                                            loading="lazy"
                                            decoding="async"
                                            style={{ width: '100%', height: 160, objectFit: 'cover' }}
                                        />
                                        {p.stock_qty > 0 && p.stock_qty <= 3 && (
                                            <span style={{
                                                position: 'absolute', top: 6, left: 6,
                                                background: '#1a1a1a', color: '#fedbd1',
                                                fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 99,
                                            }}>! Plus que {p.stock_qty}</span>
                                        )}
                                    </div>
                                    <div style={{ padding: '10px 12px' }}>
                                        <p style={{ margin: '0 0 4px', fontSize: 13, fontWeight: 600, color: '#1a1a1a', lineHeight: 1.3 }}>{p.title}</p>
                                        <p style={{ margin: 0, fontSize: 13, color: '#c97b63', fontWeight: 700 }}>{p.price} CAD</p>
                                    </div>
                                </div>
                            </a>
                        ))}
                    </div>
                </div>
            )}
        </main>

        {/* Sticky CTA mobile */}
        <div style={{
            display: 'none',
            position: 'fixed', bottom: 0, left: 0, right: 0,
            background: '#fff', borderTop: '1px solid #f0f0f0',
            padding: '12px 16px', zIndex: 1000,
            boxShadow: '0 -4px 16px rgba(0,0,0,0.08)',
        }} className="sticky-mobile-cta">
            <style>{`
                @media (max-width: 768px) {
                    .sticky-mobile-cta { display: flex !important; align-items: center; gap: 12px; }
                }
            `}</style>
            <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontSize: 12, color: '#888' }}>{product.title}</p>
                <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#1a1a1a' }}>{product.price} CAD</p>
            </div>
            {product.stock_qty > 0 && product.stock_qty <= 3 && (
                <span style={{ fontSize: 11, color: '#c97b63', fontWeight: 600, whiteSpace: 'nowrap' }}>
                    ! Plus que {product.stock_qty}
                </span>
            )}
            <button
                onClick={handleAddToCart}
                disabled={product.stock_qty === 0}
                style={{
                    background: product.stock_qty === 0 ? '#ccc' : '#1a1a1a',
                    color: '#fedbd1', border: 'none', borderRadius: 10,
                    padding: '12px 20px', fontWeight: 700, fontSize: 14,
                    cursor: product.stock_qty === 0 ? 'not-allowed' : 'pointer',
                    flexShrink: 0,
                }}
            >
                {product.stock_qty === 0 ? 'Épuisé' : 'Ajouter au panier'}
            </button>
        </div>
        </>
    );
}

export default ProductDetailScreen;
