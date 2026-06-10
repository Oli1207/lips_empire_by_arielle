import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import SEO from "../components/SEO";
import apiInstance from "../utils/axios";
import Swal from "sweetalert2";
import { SERVER_URL } from "../utils/constants";
import { getStoredPromo } from "../utils/promo";

const Toast = Swal.mixin({
  toast: true,
  position: "top",
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
});

function Checkout() {
  const [order, setOrder] = useState({});
  const [couponCode, setCouponCode] = useState("");
  const [paymentLoading, setPaymentLoading] = useState(false);
  const param = useParams();
  const axios = apiInstance;

  const fetchOrderData = (autoApply = false) => {
    axios.get(`checkout/${param?.order_oid}/`).then((res) => {
      setOrder(res.data);
      if (autoApply) {
        const stored = getStoredPromo()
        if (stored && res.data.saved === 0) {
          const formdata = new FormData()
          formdata.append('order_oid', res.data.oid)
          formdata.append('coupon_code', stored.code)
          axios.post('coupon/', formdata).then(() => fetchOrderData())
        }
      }
    });
  };

  useEffect(() => {
    const stored = getStoredPromo()
    if (stored) setCouponCode(stored.code)
    fetchOrderData(!!stored)
  }, []);

  const applyCoupon = async () => {
    const formdata = new FormData();
    formdata.append("order_oid", order.oid);
    formdata.append("coupon_code", couponCode);

    try {
      const response = await axios.post("coupon/", formdata);
      fetchOrderData();
      Swal.fire({
        icon: response.data.icon,
        title: response.data.message,
      });
    } catch (error) {
    
    }
  };

  const payWithStripe = (event) => {
    setPaymentLoading(true);
    event.preventDefault(); // Empêche la soumission automatique si nécessaire
    document.getElementById("stripe-form").submit(); // Soumet le formulaire directement
  };

  return (
    <main style={{ marginTop: "90px" }}>
      <SEO title="Paiement sécurisé" url="/checkout" noindex={true} />
      <div style={{
        background: '#fafafa', borderBottom: '1px solid #f0f0f0',
        padding: '10px 0', marginBottom: 8,
      }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'center', gap: 32, flexWrap: 'wrap' }}>
            {[
              { text: 'Paiement 100% securise', sub: 'via Stripe' },
              { text: 'Livraison suivie', sub: 'Canada & international' },
              { text: 'Retours acceptes', sub: 'sous 14 jours' },
            ].map(({ text, sub }) => (
              <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#c44569', flexShrink: 0, display: 'inline-block' }} />
                <div>
                  <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: '#1a1a1a' }}>{text}</p>
                  <p style={{ margin: 0, fontSize: 11, color: '#888' }}>{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="container">
        <section>
          <div className="row gx-lg-5">
            <div className="col-lg-8 mb-4 mb-md-0">
              <section>
                <div className="alert alert-warning">
                  <strong>
                    Vérifiez attentivement vos coordonnées et les détails de la
                    commande
                  </strong>
                </div>
                <form>
                  <h5 style={{ color: "black" }} className="mb-4 mt-4">
                    Adresse de livraison
                  </h5>
                  <div className="row mb-4">
                    <div className="col-lg-12">
                      <div className="form-outline">
                        <label className="form-label" htmlFor="full_name">
                          Noms & Prénoms
                        </label>
                        <input
                          type="text"
                          readOnly
                          className="form-control"
                          value={order.full_name || ""}
                        />
                      </div>
                    </div>

                    <div className="col-lg-6 mt-4">
                      <div className="form-outline">
                        <label className="form-label" htmlFor="email">
                          Email
                        </label>
                        <input
                          type="text"
                          readOnly
                          className="form-control"
                          value={order.email || ""}
                        />
                      </div>
                    </div>

                    <div className="col-lg-6 mt-4">
                      <div className="form-outline">
                        <label className="form-label" htmlFor="mobile">
                          Mobile
                        </label>
                        <input
                          type="text"
                          readOnly
                          className="form-control"
                          value={order.mobile || ""}
                        />
                      </div>
                    </div>

                    <div className="col-lg-6 mt-4">
                      <div className="form-outline">
                        <label className="form-label" htmlFor="address">
                          Adresse
                        </label>
                        <input
                          type="text"
                          readOnly
                          className="form-control"
                          value={order.address || ""}
                        />
                      </div>
                    </div>

                    <div className="col-lg-6 mt-4">
                      <div className="form-outline">
                        <label className="form-label" htmlFor="city">
                          Ville
                        </label>
                        <input
                          type="text"
                          readOnly
                          className="form-control"
                          value={order.city || ""}
                        />
                      </div>
                    </div>

                    <div className="col-lg-6 mt-4">
                      <div className="form-outline">
                        <label className="form-label" htmlFor="state">
                          Code de province
                        </label>
                        <input
                          type="text"
                          readOnly
                          className="form-control"
                          value={order.state || ""}
                        />
                      </div>
                    </div>

                    <div className="col-lg-6 mt-4">
                      <div className="form-outline">
                        <label className="form-label" htmlFor="country">
                          Pays
                        </label>
                        <input
                          type="text"
                          readOnly
                          className="form-control"
                          value={order.country || ""}
                        />
                      </div>
                      </div>
                      <div className="col-lg-6 mt-4">
                        <div className="form-outline">
                          <label className="form-label" htmlFor="country">
                            Code Postal
                          </label>
                          <input
                            type="text"
                            readOnly
                            className="form-control"
                            value={order.postal_code || ""}
                          />
                        </div>
                      </div>
                    </div>
                  

                  {/* <h5 className="mb-4 mt-4">Adresse de facturation</h5>
                  <div className="form-check mb-2">
                    <input className="form-check-input me-2" type="checkbox" id="sameAddress" defaultChecked />
                    <label className="form-check-label" htmlFor="sameAddress">
                      Identique à l'adresse de livraison
                    </label>
                  </div> */}
                </form>
              </section>
            </div>
            <div className="col-lg-4 mb-4 mb-md-0">
              <section className="shadow-4 p-4 rounded-5 mb-4">
                <h5 style={{ color: "black" }} className="mb-3">
                  Résumé de la commande
                </h5>
                <div className="d-flex justify-content-between mb-3">
                  <span>Sous-total</span>
                  <span>{order.sub_total || "0"} CAD</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span>Frais de livraison</span>
                  <span>{order.shipping_amount || "0"} CAD</span>
                </div>
                {order.service_fee && parseFloat(order.service_fee) > 0 && (
                  <div className="d-flex justify-content-between mt-2">
                    <span>Frais de paiement (Stripe)</span>
                    <span>{parseFloat(order.service_fee).toFixed(2)} CAD</span>
                  </div>
                )}
                {/* <div className="d-flex justify-content-between">
                  <span>Tax</span>
                  <span>{order.tax_fee || '0'} CAD</span>
                </div> */}
                {/* <div className="d-flex justify-content-between">
                  <span>Service Fee</span>
                  <span>{order.service_fee || '0'} CAD</span>
                </div> */}

                {order.saved !== "0.00" && (
                  <div className="d-flex text-success fw-bold justify-content-between">
                    <span>Réduction</span>
                    <span>- {order.saved || "0"} CAD</span>
                  </div>
                )}
                <hr className="my-4" />
                <div className="d-flex justify-content-between fw-bold mb-5">
                  <span>Total</span>
                  <span>{order.total || "0"} CAD</span>
                </div>

                <section className="shadow p-3 d-flex mt-4 mb-4">
                  <input
                    name="couponCode"
                    type="text"
                    className="form-control"
                    style={{ border: "dashed 1px gray" }}
                    placeholder="Entrez le code promo"
                    onChange={(e) => setCouponCode(e.target.value)}
                  />
                  <button
                    onClick={applyCoupon}
                    className="btn btn-success ms-1"
                  >
                    <i className="fas fa-check-circle"></i>
                  </button>
                </section>

                {paymentLoading ? (
                  <form
                    id="stripe-form"
                    action={`https://backend.lipsempirebyarielle.store/api/v1/stripe-checkout/${order?.oid}/`}
                    method="POST"
                  >
                    <button
                      onClick={payWithStripe}
                      disabled
                      type="submit"
                      className="btn btn-rounded w-100 mt-2"
                      style={{ backgroundColor: "#635BFF" }}
                    >
                      Traitement... <i className="fas fa-spinner fa-spin"></i>
                    </button>
                  </form>
                ) : (
                  <form
                    id="stripe-form"
                    action={`https://backend.lipsempirebyarielle.store/api/v1/stripe-checkout/${order?.oid}/`}
                    method="POST"
                  >
                    <button
                      onClick={payWithStripe}
                      type="submit"
                      className="btn btn-rounded w-100 mt-2"
                      style={{ backgroundColor: "#fedbd1" }}
                    >
                      Payer maintenant avec (Stripe){" "}
                      <i className="fas fa-credit-card"></i>
                    </button>
                  </form>
                )}
              </section>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export default Checkout;
