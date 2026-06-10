import { React, useEffect, useState, useContext } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import PolicyScreen from "./PolicyScreen";
("./PolicyScreen");
// Icons

import { addToCart } from "../plugin/addToCart";
import apiInstance from "../utils/axios";
import GetCurrentAddress from "../plugin/UserCountry";
import UserData from "../plugin/UserData";
import CartID from "../plugin/CartID";
import { CartContext } from "../plugin/Context";

function CartScreen() {
  const [cart, setCart] = useState([]);
  const [cartTotal, setCartTotal] = useState([]);
  const [productQuantities, setProductQuantities] = useState({});

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [cartCount, setCartCount] = useContext(CartContext);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [openPolicy, setOpenPolicy] = useState(false);
  const [createAccount, setCreateAccount] = useState(false);

  const axios = apiInstance;
  const userData = UserData();
  let cart_id = CartID();
  const currentAddress = GetCurrentAddress();
  let navigate = useNavigate();

  // Get cart Items
  const fetchCartData = async (cartId, userId) => {
    try {
      const url = userId
        ? `cart-list/${cartId}/${userId}/`
        : `cart-list/${cartId}/`;
      const res = await axios.get(url);
      setCart(res.data); // ✅ Met à jour le state après la requête
      setCartCount(res.data.length); //
    } catch (error) {
      console.error("Error fetching cart:", error);
    }
  };

  
  
  // Get Cart Totals
  const fetchCartTotal = async (cartId, userId) => {
    const url = userId
      ? `cart-detail/${cartId}/${userId}/`
      : `cart-detail/${cartId}/`;
    axios.get(url).then((res) => {
      setCartTotal(res.data);
    });
    // console.log(cartTotal);
  };

  
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
      initialQuantities[c.product?.id] = c.qty;
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

  const UpdateCart = async (
    cart_id,
    item_id,
    product_id,
    price,
    shipping_amount
  ) => {
    const qtyValue = productQuantities[product_id];

    // console.log("cart_id:", cart_id);
    // console.log("item_id:", item_id);
    // console.log("qtyValue:", qtyValue);
    // console.log("product_id:", product_id);

    try {
      // Await the addToCart function
      await addToCart(
        product_id,
        userData?.user_id,
        qtyValue,
        price,
        shipping_amount,
        currentAddress.country,
        cart_id
      );

      // Fetch the latest cart data after addToCart is completed
      fetchCartData(cart_id, userData?.user_id);
      fetchCartTotal(cart_id, userData?.user_id);
    } catch (error) {
      // Handle error, e.g., display an error message
  
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
      fetchCartData(cart_id, userData?.user_id);
      fetchCartTotal(cart_id, userData?.user_id);

      const cart_url = userData?.user_id
        ? `cart-list/${cart_id}/${userData?.user_id}/`
        : `cart-list/${cart_id}/`;
      const response = await axios.get(cart_url);

      setCartCount(response.data.length);
    } catch (error) {
      console.error("Error deleting item:", error);
      // Handle errors or update state accordingly
    }
  };

  // Shipping Details
  const handleChange = (e) => {
    const { name, value } = e.target;
    // Use computed property names to dynamically set the state based on input name
    switch (name) {
      case "fullName":
        setFullName(value);
        break;
      case "email":
        setEmail(value);
        break;
      case "mobile":
        setMobile(value);
        break;
      case "address":
        setAddress(value);
        break;
      case "city":
        setCity(value);
        break;
      case "state":
        setState(value);
        break;
      case "country":
        setCountry(value);
        break;
      case "postalCode":
        setPostalCode(value);
        break;
      default:
        break;
    }
  };

  const createCartOrder = async () => {
    if (!agreeTerms) {
      Swal.fire({
        icon: "warning",
        title: "Conditions requises",
        text: "Veuillez cocher « J’ai lu et j’accepte les conditions générales de vente ».",
      });
      return;
    }
    const needsProvince = country === "CA" || country === "US";
    if (
      !fullName ||
      !email ||
      !mobile ||
      !address ||
      !city ||
      !country ||
      (needsProvince && !state)
    ) {
      Swal.fire({
        icon: "warning",
        title: "Champs manquants",
        text: needsProvince && !state
          ? "Veuillez sélectionner votre province / état."
          : "Veuillez remplir tous les champs obligatoires.",
      });
      return;
    }

    try {
      const formData = new FormData();
      formData.append("full_name", fullName);
      formData.append("email", email);
      formData.append("mobile", mobile);
      formData.append("address", address);
      formData.append("city", city);
      formData.append("state", state);
      formData.append("country", country);
      formData.append("cart_id", cart_id);
      formData.append("user_id", userData ? userData.user_id : 0);
      formData.append("postal_code", postalCode);
      formData.append("terms_accepted", agreeTerms ? "true" : "false");
      formData.append("create_account", createAccount ? "true" : "false");

      const response = await axios.post("create-order/", formData);

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
          icon: "error",
          title: "Order Failure",
          text: "Please review your order details carefully and try again.",
        });
      }
    } catch (error) {
      const errorCode = error?.response?.data?.error;
      const errorMsg = error?.response?.data?.message;

      if (errorCode === "delivery_not_available") {
        Swal.fire({
          icon: "info",
          title: "Zone non couverte",
          text: errorMsg || "On ne livre pas encore dans votre zone, c'est pour bientôt !",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Erreur",
          text: errorMsg || "Une erreur est survenue. Vérifiez vos informations et réessayez.",
        });
      }

      console.error("Order Error:", error);
    }
  };
  // text: response.data?.error || response.data?.Message || "Une erreur est survenue.",
  const getSafeImageURL = (url) => {
    if (!url) return "";
    return url.replace(
      "backend.lipsempirebyarielle.store",
      "lipsempirebyarielle.store"
    );
  };

  const hasInsufficientStock = cart.some(
    (item) => item.qty > item.product.stock_qty
  );

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
    <div style={{ marginTop: "100px" }}>
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
                                  style={{
                                    objectFit: "cover",
                                    borderRadius: "10px",
                                  }}
                                />
                              </Link>
                              <a href="#!">
                                <div className="hover-overlay">
                                  <div
                                    className="mask"
                                    style={{
                                      backgroundColor:
                                        "hsla(0, 0%, 98.4%, 0.2)",
                                    }}
                                  />
                                </div>
                              </a>
                            </div>
                          </div>
                          <div className="col-md-8 mb-4 mb-md-0">
                            <Link
                              to={`/detail/${c.product.slug}`}
                              className="fw-bold text-dark mb-4"
                            >
                              {c?.product?.title.slice(0, 20)}...
                            </Link>

                            <p className="mb-0">
                              <span className="text-muted me-2">Price:</span>
                              <span>{c.product.price} CAD</span>
                            </p>
                            {/* <p className='mb-0'>
                                                            <span className="text-muted me-2">Stock Qty:</span>
                                                            <span>{c.product.stock_qty}</span>
                                                        </p>
                                                      */}
                            <p className="mt-3">
                              <button
                                onClick={() => handleDeleteClick(cart_id, c.id)}
                                className="btn btn-danger "
                              >
                                <small>
                                  <i className="fas fa-trash me-2" />
                                  Remove
                                </small>
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
                                  onChange={(e) =>
                                    handleQtyChange(e, c.product.id)
                                  }
                                  value={
                                    productQuantities[c.product.id] || c.qty
                                  }
                                  min={1}
                                />
                              </div>
                              <button
                                onClick={() =>
                                  UpdateCart(
                                    cart_id,
                                    c.id,
                                    c.product.id,
                                    c.product.price,
                                    c.product.shipping_amount
                                  )
                                }
                                style={{ backgroundColor: "#fedbd1" }}
                                className="ms-2 btn "
                              >
                                <i className="fas fa-rotate-right"></i>
                              </button>
                            </div>
                            <h5
                              style={{ color: "black" }}
                              className="mb-2 mt-3 text-center"
                            >
                              <span className="align-middle">
                                {c.sub_total} CAD
                              </span>
                            </h5>
                          </div>
                        </div>
                      ))}

                      {cart.length < 1 && (
                        <>
                          <h5 style={{ color: "black" }}>
                            Votre panier est vide
                          </h5>

                          <Link style={{ color: "black" }} to="/">
                            {" "}
                            <i className="fas fa-shopping-cart"> </i>
                            {"   "}Ajoutez des gloss à votre panier
                          </Link>
                        </>
                      )}
                    </section>
                    <div>
                      <h5 style={{ color: "black" }} className="mb-4 mt-4">
                        Informations Personnelles
                      </h5>
                      {/* 2 column grid layout with text inputs for the first and last names */}
                      <div className="row mb-4">
                        <div className="col">
                          <div className="form-outline">
                            <label className="form-label" htmlFor="full_name">
                              {" "}
                              <i className="fas fa-user"></i>Nom & Prénoms
                            </label>
                            <input
                              type="text"
                              id=""
                              name="fullName"
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
                            <label
                              className="form-label"
                              htmlFor="form6Example1"
                            >
                              <i className="fas fa-envelope"></i> Email
                            </label>
                            <input
                              type="text"
                              id="form6Example1"
                              className="form-control"
                              name="email"
                              onChange={handleChange}
                              value={email}
                            />
                          </div>
                        </div>
                        <div className="col">
                          <div className="form-outline">
                            <label
                              className="form-label"
                              htmlFor="form6Example1"
                            >
                              <i className="fas fa-phone"></i> Mobile
                            </label>
                            <input
                              type="text"
                              id="form6Example1"
                              className="form-control"
                              name="mobile"
                              onChange={handleChange}
                              value={mobile}
                            />
                          </div>
                        </div>
                      </div>

                      <h5 style={{ color: "black" }} className="mb-1 mt-4">
                        Adresse de livraison
                      </h5>

                      <div className="row mb-4">
                        <div className="col-lg-6 mt-3">
                          <div className="form-outline">
                            <label
                              className="form-label"
                              htmlFor="form6Example1"
                            >
                              Adresse
                            </label>
                            <input
                              type="text"
                              id="form6Example1"
                              className="form-control"
                              name="address"
                              onChange={handleChange}
                              value={address}
                            />
                          </div>
                        </div>
                        <div className="col-lg-6 mt-3">
                          <div className="form-outline">
                            <label
                              className="form-label"
                              htmlFor="form6Example1"
                            >
                              Ville
                            </label>
                            <input
                              type="text"
                              id="form6Example1"
                              className="form-control"
                              name="city"
                              onChange={handleChange}
                              value={city}
                            />
                          </div>
                        </div>

                        <div className="col-lg-6 mt-3">
                          <div className="form-outline">
                            <label className="form-label">Pays</label>
                            <select
                              className="form-select"
                              name="country"
                              value={country}
                              onChange={handleChange}
                            >
                              <option value="">-- Sélectionnez votre pays --</option>
                              <optgroup label="Amérique du Nord">
                                <option value="CA">🇨🇦 Canada</option>
                                <option value="US">🇺🇸 États-Unis</option>
                              </optgroup>
                              <optgroup label="Europe">
                                <option value="FR">🇫🇷 France</option>
                                <option value="BE">🇧🇪 Belgique</option>
                                <option value="CH">🇨🇭 Suisse</option>
                                <option value="GB">🇬🇧 Royaume-Uni</option>
                                <option value="DE">🇩🇪 Allemagne</option>
                                <option value="ES">🇪🇸 Espagne</option>
                                <option value="IT">🇮🇹 Italie</option>
                                <option value="NL">🇳🇱 Pays-Bas</option>
                                <option value="PT">🇵🇹 Portugal</option>
                              </optgroup>
                              <optgroup label="Autres">
                                <option value="AU">🇦🇺 Australie</option>
                                <option value="NZ">🇳🇿 Nouvelle-Zélande</option>
                                <option value="JP">🇯🇵 Japon</option>
                              </optgroup>
                            </select>
                          </div>
                        </div>

                        {(country === "CA" || country === "US") && (
                          <div className="col-lg-6 mt-3">
                            <div className="form-outline">
                              <label className="form-label">
                                {country === "CA" ? "Province" : "État"}{" "}
                                <span className="text-danger">*</span>
                              </label>
                              <select
                                className="form-select"
                                name="state"
                                value={state}
                                onChange={handleChange}
                              >
                                <option value="">-- Sélectionner --</option>
                                {country === "CA" && <>
                                  <option value="AB">Alberta</option>
                                  <option value="BC">Colombie-Britannique</option>
                                  <option value="MB">Manitoba</option>
                                  <option value="NB">Nouveau-Brunswick</option>
                                  <option value="NL">Terre-Neuve</option>
                                  <option value="NS">Nouvelle-Écosse</option>
                                  <option value="ON">Ontario</option>
                                  <option value="PE">Île-du-Prince-Édouard</option>
                                  <option value="QC">Québec</option>
                                  <option value="SK">Saskatchewan</option>
                                  <option value="NT">Territoires du Nord-Ouest</option>
                                  <option value="NU">Nunavut</option>
                                  <option value="YT">Yukon</option>
                                </>}
                                {country === "US" && <>
                                  <option value="AL">Alabama</option>
                                  <option value="AK">Alaska</option>
                                  <option value="AZ">Arizona</option>
                                  <option value="CA">California</option>
                                  <option value="CO">Colorado</option>
                                  <option value="CT">Connecticut</option>
                                  <option value="FL">Florida</option>
                                  <option value="GA">Georgia</option>
                                  <option value="HI">Hawaii</option>
                                  <option value="IL">Illinois</option>
                                  <option value="MA">Massachusetts</option>
                                  <option value="MI">Michigan</option>
                                  <option value="MN">Minnesota</option>
                                  <option value="NJ">New Jersey</option>
                                  <option value="NY">New York</option>
                                  <option value="NC">North Carolina</option>
                                  <option value="OH">Ohio</option>
                                  <option value="PA">Pennsylvania</option>
                                  <option value="TX">Texas</option>
                                  <option value="VA">Virginia</option>
                                  <option value="WA">Washington</option>
                                </>}
                              </select>
                            </div>
                          </div>
                        )}

                        <div className="col-lg-6 mt-3">
                          <div className="form-outline">
                            <label
                              className="form-label"
                              htmlFor="form6Example1"
                            >
                              Code postal
                            </label>
                            <input
                              type="text"
                              id="form6Example1"
                              className="form-control"
                              name="postalCode"
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
                      <h5 style={{ color: "black" }} className="mb-3">
                        Résumé de la commande
                      </h5>
                      <div className="d-flex justify-content-between mb-3">
                        <span>Sous-total</span>
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
                          {/* ✅ Encadré CGV juste au-dessus du bouton */}
                          <div
                            className="border rounded-4 p-3 mb-3"
                            style={{ background: "#fff" }}
                          >
                            <p className="mb-2">
                              {/* CHANGE: bouton au lieu du <Link> pour ouvrir la modal */}
                              <button
                                type="button"
                                className="btn btn-link p-0 text-decoration-underline"
                                onClick={() => setOpenPolicy(true)}
                                style={{ color: "#DC3545" }}
                              >
                                Voir les Conditions générales de vente
                              </button>
                            </p>

                            <div className="form-check mt-2">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                id="agreeTerms"
                                checked={agreeTerms}
                                onChange={(e) =>
                                  setAgreeTerms(e.target.checked)
                                }
                              />
                              <label
                                className="form-check-label"
                                htmlFor="agreeTerms"
                              >
                                J’ai lu et j’accepte les conditions générales de
                                vente
                              </label>
                            </div>
                          </div>

                          {/* CHANGE: la modal MUI avec les CGV */}
                          <Dialog
                            open={openPolicy}
                            onClose={() => setOpenPolicy(false)}
                            fullWidth
                            maxWidth="md"
                          >
                            <DialogTitle style={{ color: "#FEDBD1" }}>
                              Conditions générales de vente
                            </DialogTitle>

                            <DialogContent
                              dividers
                              style={{ maxHeight: "70vh", overflowY: "auto" }}
                            >
                              {/* On réutilise ton composant en mode "embedded" */}
                              <PolicyScreen embedded />
                            </DialogContent>

                            <DialogActions>
                              <Button
                                variant="contained"
                                onClick={() => setOpenPolicy(false)}
                              >
                                Fermer
                              </Button>
                            </DialogActions>
                          </Dialog>

                          {/* ── Création de compte (invité uniquement) ── */}
                          {!userData && (
                            <div
                              className="border rounded-4 p-3 mb-3"
                              style={{ background: "#fff8f9" }}
                            >
                              <div className="form-check">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  id="createAccount"
                                  checked={createAccount}
                                  onChange={(e) => setCreateAccount(e.target.checked)}
                                />
                                <label
                                  className="form-check-label"
                                  htmlFor="createAccount"
                                  style={{ fontSize: "13px", color: "#333" }}
                                >
                                  Créer un compte pour suivre mes commandes
                                </label>
                              </div>
                              {createAccount && (
                                <p
                                  className="mt-2 mb-0"
                                  style={{
                                    fontSize: "11.5px",
                                    color: "#888",
                                    lineHeight: "1.5",
                                  }}
                                >
                                  Un compte sera créé avec l'adresse e-mail renseignée ci-dessus. Vos identifiants de connexion vous seront communiqués par e-mail.
                                </p>
                              )}
                            </div>
                          )}

                          <button
                            onClick={createCartOrder}
                            style={{ backgroundColor: "#fedbd1" }}
                            className="btn btn-rounded w-100"
                            disabled={hasInsufficientStock || !agreeTerms}
                          >
                            Passer au paiement
                          </button>
                          {hasInsufficientStock && (
                            <p className="text-danger text-center mt-2">
                              Vérifiez que tous vos produits choisis sont
                              disponibles en stock.
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
  );
}

export default CartScreen;
