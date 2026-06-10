import React, { useEffect, useState } from 'react';
import UserData from '../plugin/UserData';
import apiInstance from '../utils/axios';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import { addToWishlist } from '../plugin/addToWishlist';

function Wishlist() {
  const [wishlist, setWishlist] = useState([]);
  const axios = apiInstance;
  const userData = UserData();

  // Fonction pour récupérer la wishlist
  const fetchWishlist = async () => {
    try {
      const response = await axios.get(`customer/wishlist/${userData?.user_id}/`);
      setWishlist(response.data);
    } catch (error) {
    
    }
  };

  useEffect(() => {
    if (userData?.user_id) {
      fetchWishlist();
    }
  }, [userData?.user_id]);

  

  // Fonction pour ajouter/supprimer un produit de la wishlist
  const handleAddToWishlist = async (product_id) => {
    try {
      await addToWishlist(product_id, userData?.user_id);

      // Mise à jour immédiate du state
      setWishlist((prevWishlist) =>
        prevWishlist.filter((w) => w.product.id !== product_id)
      );
    } catch (error) {
      
    }
  };

  return (
    <main style={{ marginTop: '50px' }}>
      <div className="container">
        <section>
          <div className="row">
            <div className="col-lg-9 mt-1">
              <section>
                <main className="mb-5">
                  <div className="container">
                    <section>
                      <div className="row">
                        <h3 style={{color:"black"}} className="mb-3">
                          <i className="fas fa-heart text-danger" /> Wishlist
                        </h3>

                        {wishlist.length > 0 ? (
                          wishlist.map((w) => (
                            <div key={w.product.id} className="col-lg-4 col-md-12 mb-4">
                              <div className="card">
                                <div className="bg-image hover-zoom ripple" data-mdb-ripple-color="light">
                                  <Link to={`/detail/${w.product.slug}`}>
                                    <img
                                  
                                       src={w?.product?.image?.replace("backend.lipsempirebyarielle.store", "lipsempirebyarielle.store")}
                                      className="w-100"
                                      style={{ width: '100%', height: '250px', objectFit: 'cover' }}
                                      alt={w.product.title}
                                    />
                                  </Link>
                                </div>
                                <div className="card-body">
                                  <Link to={`/detail/${w.product.slug}`}>
                                    <h5 style={{color:"black"}} className="card-title mb-3">{w.product.title}</h5>
                                  </Link>
                                  <p style={{color:"black"}} className="text-reset">{w.product.category?.title}</p>
                                  <div className="d-flex">
                                    <h6 style={{color:"black"}} className="mb-3">{w?.product?.price}{"  "}CAD</h6>
                                    {/* <h6 className="mb-3 text-muted">
                                      <strike>{w.product.old_price}</strike>
                                    </h6> */}
                                  </div>
                                  <div className="btn-group">
                                    <button
                                      type="button"
                                      className="btn btn-danger px-3 me-1 ms-2"
                                      onClick={() => handleAddToWishlist(w.product.id)}
                                    >
                                      <i className="fas fa-heart" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <h6 className="container">Your wishlist is Empty</h6>
                        )}
                      </div>
                    </section>
                  </div>
                </main>
              </section>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export default Wishlist;
