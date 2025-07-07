import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import apiInstance from '../utils/axios';
import UserData from '../plugin/UserData';
import CartID from '../plugin/CartID';
import GetCurrentAddress from '../plugin/UserCountry';

const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
});

const Search = () => {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [qtyValue, setQtyValue] = useState(1);
  // const [selectedColors, setSelectedColors] = useState({});
  const userData = UserData();
  const cart_id = CartID();
  const currentAddress = GetCurrentAddress();
  
  const query = searchParams.get("query");

  // const handleColorButtonClick = (event, product_id, colorName) => {
  //   setSelectedColors((prevSelectedColors) => ({
  //     ...prevSelectedColors,
  //     [product_id]: colorName,
  //   }));
  // };

  const handleQtyChange = (event, product_id) => {
    setQtyValue(event.target.value);
  };

  const handleAddToCart = async (product_id, price, shipping_amount) => {
    const formData = new FormData();

    formData.append("product_id", product_id);
    formData.append("user_id", userData?.user_id);
    formData.append("qty", qtyValue);
    formData.append("price", price);
    formData.append("shipping_amount", shipping_amount);
    formData.append("country", currentAddress.country);
    formData.append("cart_id", cart_id);

    try {
      const response = await apiInstance.post(`cart-view/`, formData);
      Toast.fire({
        icon: 'success',
        title: response.data.message,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const addToWishList = async (productId, userId) => {
    try {
      const formdata = new FormData();
      formdata.append('product_id', productId);
      formdata.append('user_id', userId);

      const response = await apiInstance.post(`customer/wishlist/${userId}/`, formdata);
      Swal.fire({
        icon: 'success',
        title: response.data.message,
      });
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const fetchSearchResults = async () => {
      try {
        const response = await apiInstance.get(`/search?query=${query}`);
        setProducts(response.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchSearchResults();
  }, [query]);

  const getSafeImageURL = (url) => {
    if (!url) return "";
    return url.replace("backend.lipsempirebyarielle.store", "lipsempirebyarielle.store");
  };
  

  return (
    <div style={{marginTop:"220px"}} className="container">
      <h2 style={{color:"black"}} className="mb-4">Résultats de recherche pour : "{query}"</h2>
      <div className="row">
        {products.length > 0 ? (
          products.map((p, index) => (
            <div key={index} className="col-md-4 mb-4">
              <div className="card shadow-sm border-light rounded">
                <Link to={`/detail/${p.slug}`}>
                  <img
                  
                    src={getSafeImageURL(p?.image)}
                   className="card-img-top product-image"
                    // style={{ maxHeight: "300px", objectFit: "cover" }}
                    alt={p.title}
                  />
                </Link>
                <div className="card-body">
                  <h5 className="card-title">
                    <Link to={`/detail/${p.slug}`} className="text-decoration-none text-dark">
                      {p.title}
                    </Link>
                  </h5>
                  
                  <div className="mt-3 d-flex flex-column">
                    <b>Quantité</b>
                    <input
                      className="form-control mb-2"
                      value={qtyValue}
                      onChange={(e) => handleQtyChange(e, p.id)}
                      type="number"
                      min="1"
                    />
                     </div>
                    {/* {p.color?.length > 0 && (
                      <div>
                        <b>Couleurs</b>
                        <div className="d-flex flex-wrap">
                          {p.color.map((color, idx) => (
                            <button
                              key={idx}
                              className="btn btn-sm me-2"
                              style={{ backgroundColor: color.color_code }}
                              onClick={(e) => handleColorButtonClick(e, p.id, color.name)}
                            />
                          ))}
                        </div>
                      </div>
                    )} */}
                 
                  <div className="d-flex justify-content-between align-items-center mt-3">
                    <button
                    style={{color:'black', backgroundColor:'#fedbd1'}}
                      className="btn "

                      onClick={() => handleAddToCart(p.id, p.price, p.shipping_amount)}
                    >
                      Ajouter au panier
                    </button>
                    <button
                    style={{backgroundColor:"#fedbd1", color:"black"}}
                      className="btn"
                      onClick={() => addToWishList(p.id, userData?.user_id)}
                    >
                      Ajouter aux favoris
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p style={{color:"black"}}>Aucun produit trouvé.</p>
        )}
      </div>
    </div>
  );
};

export default Search;
