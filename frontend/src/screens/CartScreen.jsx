import { React, useEffect, useState, useContext } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2'

// Icons

import { addToCart } from '../plugin/addToCart';
import apiInstance from '../utils/axios';
import GetCurrentAddress from '../plugin/UserCountry';
import UserData from '../plugin/UserData';
import CartID from '../plugin/CartID';
import { CartContext } from '../plugin/Context';


function CartScreen() {
    const [cart, setCart] = useState([])
    const [cartTotal, setCartTotal] = useState([])
    const [productQuantities, setProductQuantities] = useState({});
  

    const [fullName, setFullName] = useState("")
    const [email, setEmail] = useState("")
    const [mobile, setMobile] = useState("")
    const [address, setAddress] = useState("")
    const [city, setCity] = useState("")
    const [state, setState] = useState("")
    const [country, setCountry] = useState("CA")
    const [postalCode, setPostalCode] = useState("")
    const [cartCount, setCartCount] = useContext(CartContext)



    const axios = apiInstance
    const userData = UserData()
    let cart_id = CartID()
    const currentAddress = GetCurrentAddress()
    let navigate = useNavigate();

    // Get cart Items
    const fetchCartData = async (cartId, userId) => {
      try {
          const url = userId ? `cart-list/${cartId}/${userId}/` : `cart-list/${cartId}/`;
          const res = await axios.get(url);
          setCart(res.data);  // ✅ Met à jour le state après la requête
          setCartCount(res.data.length); //
      } catch (error) {
          console.error("Error fetching cart:", error);
      }
  };
  
  console.log(userData)
  // 🔥 Vérifie la mise à jour du state
  useEffect(() => {
      console.log("Cart updated:", cart);
  }, [cart]);

    // Get Cart Totals
    const fetchCartTotal = async (cartId, userId) => {
        const url = userId ? `cart-detail/${cartId}/${userId}/` : `cart-detail/${cartId}/`
        axios.get(url).then((res) => {
            setCartTotal(res.data);
        });
        // console.log(cartTotal);
    }

    useEffect(() => {
        console.log(cartTotal);
    }, [cartTotal]);

    if (cart_id !== null || cart_id !== undefined) {
        if (userData !== undefined) {
            useEffect(() => {
                fetchCartData(cart_id, userData.user_id);
                fetchCartTotal(cart_id, userData.user_id);
            }, []);
        } else {
            useEffect(() => {
                fetchCartData(cart_id, null);
                fetchCartTotal(cart_id, null);
            }, []);
        }
    } else {
        window.location.href("/");
    }
    useEffect(() => {
      if (cart_id) {
          fetchCartData(cart_id, userData?.user_id ?? null);
      }
  }, [cart_id]); // ✅ Ne se déclenche que si cart_id change

    useEffect(() => {
        const initialQuantities = {};
        cart.forEach((c) => {
            initialQuantities[c.product?.id] = c.qty
        });
        setProductQuantities(initialQuantities);
    }, [cart]);

    const handleQtyChange = (event, product_id) => {
        const quantity = event.target.value;
        setProductQuantities((prevQuantities) => ({
            ...prevQuantities,
            [product_id]: quantity,
        }));
    };



    const UpdateCart = async (cart_id, item_id, product_id, price, shipping_amount) => {
        const qtyValue = productQuantities[product_id];

        // console.log("cart_id:", cart_id);
        // console.log("item_id:", item_id);
        // console.log("qtyValue:", qtyValue);
        // console.log("product_id:", product_id);

        try {
            // Await the addToCart function
            await addToCart(product_id, userData?.user_id, qtyValue, price, shipping_amount, currentAddress.country, cart_id);

            // Fetch the latest cart data after addToCart is completed
            fetchCartData(cart_id, userData?.user_id)
            fetchCartTotal(cart_id, userData?.user_id)

        } catch (error) {
            // Handle error, e.g., display an error message
            console.log(error);
        }
    };

    // Remove Item From Cart
    const handleDeleteClick = async (cartId, itemId) => {
        const url = userData?.user_id
            ? `cart-delete/${cartId}/${itemId}/${userData.user_id}/`
            : `cart-delete/${cartId}/${itemId}/`;

        try {
            await axios.delete(url);
            setCart((prevCart) => prevCart.filter((item) => item.id !== itemId));

            // Add any additional logic or state updates after successful deletion
            fetchCartData(cart_id, userData?.user_id)
            fetchCartTotal(cart_id, userData?.user_id)

            const cart_url = userData?.user_id ? `cart-list/${cart_id}/${userData?.user_id}/` : `cart-list/${cart_id}/`;
            const response = await axios.get(cart_url);

            setCartCount(response.data.length);


        } catch (error) {
            console.error('Error deleting item:', error);
            // Handle errors or update state accordingly
        }
    };



    // Shipping Details
    const handleChange = (e) => {
        const { name, value } = e.target;
        // Use computed property names to dynamically set the state based on input name
        switch (name) {
            case 'fullName':
                setFullName(value);
                break;
            case 'email':
                setEmail(value);
                break;
            case 'mobile':
                setMobile(value);
                break;
            case 'address':
                setAddress(value);
                break;
            case 'city':
                setCity(value);
                break;
            case 'state':
                setState(value);
                break;
            case 'country':
                setCountry(value);
                break;
            case 'postalCode':
                setPostalCode(value);
                break;    
            default:
                break;
        }
    };

    const createCartOrder = async () => {
        if (!fullName || !email || !mobile || !address || !city || !state || !country) {
            Swal.fire({
                icon: 'warning',
                title: 'Missing Fields',
                text: 'Please fill in all fields before proceeding with the order.'
            });            
            return;
        }
    
        try {
            const formData = new FormData();
            formData.append('full_name', fullName);
            formData.append('email', email);
            formData.append('mobile', mobile);
            formData.append('address', address);
            formData.append('city', city);
            formData.append('state', state);
            formData.append('country', country);
            formData.append('cart_id', cart_id);
            formData.append('user_id', userData ? userData.user_id : 0);
            formData.append('postal_code', postalCode);
    
            const response = await axios.post('create-order/', formData);
    
            if (response.status === 201) {
                // Swal.fire({
                //     icon: 'success',
                //     title: 'Order Successful',
                //     text: 'Your order has been successfully placed!'
                // });
                
    
                navigate(`/checkout/${response.data.order_oid}`);
            } else {
                // gestion d'une réponse inattendue
                Swal.fire({
                    icon: 'error',
                    title: 'Order Failure',
                    text: 'Please review your order details carefully and try again.'
                });                
            }
        } catch (error) {
            const backendError = error?.response?.data?.error || error?.response?.data?.Message;
    
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: "The provided information does not match. Please review and try again."
            });
            
    
            console.error("Order Error:", error);
        }
    };
    // text: response.data?.error || response.data?.Message || "Une erreur est survenue.",
    const getSafeImageURL = (url) => {
        if (!url) return "";
        return url.replace("backend.lipsempirebyarielle.store", "lipsempirebyarielle.store");
      };
      
      const hasInsufficientStock = cart.some(item => item.qty > item.product.stock_qty);

      useEffect(() => {
        if (userData) {
            if (userData?.full_name) {
                setFullName(userData.full_name);
            }
            setEmail(userData.email || "");
            setMobile(userData.phone || ""); // ou 'userData.mobile' selon le nom du champ
        }
    }, [userData]);
    

    return (
        <div style={{marginTop:'100px'}}>
            <main className="mt-5">
                <div className="container">
                    {/*Main layout*/}
                    <main className="mb-6">
                        <div className="container">
                            {/* Section: Cart */}
                            <section className="">
                                <div className="row gx-lg-5 mb-5">
                                    <div className="col-lg-8 mb-4 mb-md-0">
                                        {/* Section: Product list */}
                                        <section className="mb-5">

                                            {cart.map((c, index) => (
                                                <div className="row border-bottom mb-4">
                                                    <div className="col-md-2 mb-4 mb-md-0">
                                                        <div
                                                            className="bg-image ripple rounded-5 mb-4 overflow-hidden d-block"
                                                            data-ripple-color="light"
                                                        >
                                                            <Link to={`/detail/${c?.product?.slug}`}>
                                                                <img
                                                                    src={getSafeImageURL(c?.product?.image)}
                                                                    className="w-100 product-image"
                                                                    alt=""
                                                                    style={{ objectFit: "cover", borderRadius: "10px" }}
                                                                />
                                                            </Link>
                                                            <a href="#!">
                                                                <div className="hover-overlay">
                                                                    <div
                                                                        className="mask"
                                                                        style={{
                                                                            backgroundColor: "hsla(0, 0%, 98.4%, 0.2)"
                                                                        }}
                                                                    />
                                                                </div>
                                                            </a>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-8 mb-4 mb-md-0">
                                                        <Link to={`/detail/${c.product.slug}`} className="fw-bold text-dark mb-4">{c?.product?.title.slice(0, 20)}...</Link>
                                                      
                                                     
                                                        <p className='mb-0'>
                                                            <span className="text-muted me-2">Price:</span>
                                                            <span>{c.product.price} CAD</span>
                                                        </p>
                                                        {/* <p className='mb-0'>
                                                            <span className="text-muted me-2">Stock Qty:</span>
                                                            <span>{c.product.stock_qty}</span>
                                                        </p>
                                                      */}
                                                        <p className="mt-3">
                                                            <button onClick={() => handleDeleteClick(cart_id, c.id)} className="btn btn-danger ">
                                                                <small><i className="fas fa-trash me-2" />Remove</small>
                                                            </button>
                                                        </p>
                                                    </div>
                                                    <div className="col-md-2 mb-4 mb-md-0">
                                                        <div className="d-flex justify-content-center align-items-center">
                                                            <div className="form-outline d-flex mb-4">
                                                                <input
                                                                    type="number"
                                                                    id={`qtyInput-${c.product.id}`}
                                                                    className="form-control"
                                                                    onChange={(e) => handleQtyChange(e, c.product.id)}
                                                                    value={productQuantities[c.product.id] || c.qty}
                                                                    min={1}

                                                                />
                                                            </div>
                                                            <button onClick={() => UpdateCart(cart_id, c.id, c.product.id, c.product.price, c.product.shipping_amount)} style={{ backgroundColor:'#fedbd1'}} className='ms-2 btn '><i className='fas fa-rotate-right'></i></button>
                                                        </div>
                                                        <h5 style={{color:"black"}} className="mb-2 mt-3 text-center"><span className="align-middle">{c.sub_total} CAD</span></h5>
                                                    </div>
                                                </div>
                                            ))}

                                            {cart.length < 1 &&
                                                <>
                                                    <h5>Your Cart Is Empty</h5>
                                                    <Link to='/'> <i className='fas fa-shopping-cart'></i> Continue Shopping</Link>
                                                </>
                                            }

                                        </section>
                                        <div>
                                            <h5 style={{color:"black"}} className="mb-4 mt-4">Personal Information</h5>
                                            {/* 2 column grid layout with text inputs for the first and last names */}
                                            <div className="row mb-4">
                                                <div className="col">
                                                    <div className="form-outline">
                                                        <label className="form-label" htmlFor="full_name"> <i className='fas fa-user'></i> Full Name</label>
                                                        <input
                                                            type="text"
                                                            id=""
                                                            name='fullName'
                                                            className="form-control"
                                                            onChange={handleChange}
                                                            value={fullName}
                                                        />
                                                    </div>
                                                </div>

                                            </div>

                                            <div className="row mb-4">
                                                <div className="col">
                                                    <div className="form-outline">
                                                        <label className="form-label" htmlFor="form6Example1"><i className='fas fa-envelope'></i> Email</label>
                                                        <input
                                                            type="text"
                                                            id="form6Example1"
                                                            className="form-control"
                                                            name='email'
                                                            onChange={handleChange}
                                                            value={email}

                                                        />
                                                    </div>
                                                </div>
                                                <div className="col">
                                                    <div className="form-outline">
                                                        <label className="form-label" htmlFor="form6Example1"><i className='fas fa-phone'></i> Mobile</label>
                                                        <input
                                                            type="text"
                                                            id="form6Example1"
                                                            className="form-control"
                                                            name='mobile'
                                                            onChange={handleChange}
                                                            value={mobile}
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <h5 style={{color:"black"}} className="mb-1 mt-4">Shipping address</h5>

                                            <div className="row mb-4">
                                                <div className="col-lg-6 mt-3">
                                                    <div className="form-outline">
                                                        <label className="form-label" htmlFor="form6Example1"> Address</label>
                                                        <input
                                                            type="text"
                                                            id="form6Example1"
                                                            className="form-control"
                                                            name='address'
                                                            onChange={handleChange}
                                                            value={address}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="col-lg-6 mt-3">
                                                    <div className="form-outline">
                                                        <label className="form-label" htmlFor="form6Example1"> City</label>
                                                        <input
                                                            type="text"
                                                            id="form6Example1"
                                                            className="form-control"
                                                            name='city'
                                                            onChange={handleChange}
                                                            value={city}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="col-lg-6 mt-3">
                                                    <div className="form-outline">
                                                        <label className="form-label" htmlFor="form6Example1"> Province Code</label>
                                                        <input
                                                            type="text"
                                                            id="form6Example1"
                                                            className="form-control"
                                                            name='state'
                                                            onChange={handleChange}
                                                            value={state}
                                                            maxLength={2}
                                                            pattern="[A-Za-z]{2}"
                                                            placeholder="EX : ON, QC"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="col-lg-6 mt-3">
    <div className="form-outline">
        <label className="form-label" htmlFor="form6Example1">Country Code</label>
        <input
            type="text"
            id="form6Example1"
            className="form-control"
            name="country"
            value={country}
            disabled
        />
       <small className="text-primary fst-italic">Nous livrons uniquement au Canada pour le moment.</small>
    </div>
</div>

                                                <div className="col-lg-6 mt-3">
                                                    <div className="form-outline">
                                                        <label className="form-label" htmlFor="form6Example1"> Postal Code</label>
                                                        <input
                                                            type="text"
                                                            id="form6Example1"
                                                            className="form-control"
                                                            name='postalCode'
                                                            onChange={handleChange}
                                                            value={postalCode}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-lg-4 mb-4 mb-md-0">
                                        {/* Section: Summary */}
                                        <section className="shadow-4 p-4 rounded-5 mb-4">
                                            <h5 style={{color:"black"}} className="mb-3">Cart Summary</h5>
                                            <div className="d-flex justify-content-between mb-3">
                                                <span>Subtotal </span>
                                                <span>{cartTotal.sub_total?.toFixed(2)}CAD</span>
                                            </div>
                                            {/* <div className="d-flex justify-content-between">
                                                <span>Shipping </span>
                                                <span>${cartTotal.shipping?.toFixed(2)}</span>
                                            </div>
                                            <div className="d-flex justify-content-between">
                                                <span>Tax </span>
                                                <span>${cartTotal.tax?.toFixed(2)}</span>
                                            </div>
                                            <div className="d-flex justify-content-between">
                                                <span>Servive Fee </span>
                                                <span>${cartTotal.service_fee?.toFixed(2)}</span>
                                            </div> */}
                                            <hr className="my-4" />
                                            <div className="d-flex justify-content-between fw-bold mb-5">
                                                <span>Total </span>
                                                <span>{cartTotal.total?.toFixed(2)}CAD</span>
                                            </div>
                                            {cart.length > 0 && (
                                            <>
                                                <button
                                                onClick={createCartOrder}
                                                style={{ backgroundColor:'#fedbd1'}}
                                                className="btn btn-rounded w-100"
                                                disabled={hasInsufficientStock}
                                                >
                                                Go to checkout
                                                </button>
                                                {hasInsufficientStock && (
                                                <p className="text-danger text-center mt-2">
                                                    Vérifiez que tous vos produits choisis sont disponibles en stock.
                                                </p>
                                                )}
                                            </>
                                            )}

                                        </section>
                                    </div>
                                </div>
                            </section>
                        </div>
                    </main>
                </div>
            </main>
        </div>
    )
}

export default CartScreen;