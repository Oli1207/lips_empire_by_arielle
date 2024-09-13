import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import apiInstance from '../utils/axios';
import Swal from 'sweetalert2';
import { SERVER_URL } from '../utils/constants';

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

  const fetchOrderData = () => {
    apiInstance.get(`checkout/${param?.order_oid}/`).then((res) => {
      setOrder(res.data);
    });
  }

  useEffect(() => {
    fetchOrderData();
  }, []);

  const applyCoupon = async () => {
    const formdata = new FormData();
    formdata.append("order_oid", order.oid);
    formdata.append("coupon_code", couponCode);

    try {
        const response = await apiInstance.post("coupon/", formdata);
        fetchOrderData();
        Swal.fire({
            icon: response.data.icon,
            title: response.data.message
        });
    } catch (error) {
        console.log(error);
    }
  }

  const payWithStripe = (event) => {
    setPaymentLoading(true);
    event.target.form.submit();
  }

  return (
    <main style={{marginTop:"200px"}}>
      <div className="container">
        <section>
          <div className="row gx-lg-5">
            <div className="col-lg-8 mb-4 mb-md-0">
              <section>
                <div className="alert alert-warning">
                  <strong>Vérifiez les détails de la livraison et de la commande</strong>
                </div>
                <form>
                  <h5 className="mb-4 mt-4">Adresse de Livraison</h5>
                  <div className="row mb-4">
                    <div className="col-lg-12">
                      <div className="form-outline">
                        <label className="form-label" htmlFor="full_name">Noms et Prénoms</label>
                        <input
                          type="text"
                          readOnly
                          className="form-control"
                          value={order.full_name || ''}
                        />
                      </div>
                    </div>

                    <div className="col-lg-6 mt-4">
                      <div className="form-outline">
                        <label className="form-label" htmlFor="email">Email</label>
                        <input
                          type="text"
                          readOnly
                          className="form-control"
                          value={order.email || ''}
                        />
                      </div>
                    </div>

                    <div className="col-lg-6 mt-4">
                      <div className="form-outline">
                        <label className="form-label" htmlFor="mobile">Numéro</label>
                        <input
                          type="text"
                          readOnly
                          className="form-control"
                          value={order.mobile || ''}
                        />
                      </div>
                    </div>

                    <div className="col-lg-6 mt-4">
                      <div className="form-outline">
                        <label className="form-label" htmlFor="address">Adresse</label>
                        <input
                          type="text"
                          readOnly
                          className="form-control"
                          value={order.address || ''}
                        />
                      </div>
                    </div>

                    <div className="col-lg-6 mt-4">
                      <div className="form-outline">
                        <label className="form-label" htmlFor="city">Ville</label>
                        <input
                          type="text"
                          readOnly
                          className="form-control"
                          value={order.city || ''}
                        />
                      </div>
                    </div>

                    <div className="col-lg-6 mt-4">
                      <div className="form-outline">
                        <label className="form-label" htmlFor="state">État</label>
                        <input
                          type="text"
                          readOnly
                          className="form-control"
                          value={order.state || ''}
                        />
                      </div>
                    </div>

                    <div className="col-lg-6 mt-4">
                      <div className="form-outline">
                        <label className="form-label" htmlFor="country">Pays</label>
                        <input
                          type="text"
                          readOnly
                          className="form-control"
                          value={order.country || ''}
                        />
                      </div>
                    </div>
                  </div>

                  <h5 className="mb-4 mt-4">Adresse de facturation</h5>
                  <div className="form-check mb-2">
                    <input className="form-check-input me-2" type="checkbox" id="sameAddress" defaultChecked />
                    <label className="form-check-label" htmlFor="sameAddress">
                      Identique à l'adresse de livraison
                    </label>
                  </div>
                </form>
              </section>
            </div>
            <div className="col-lg-4 mb-4 mb-md-0">
              <section className="shadow-4 p-4 rounded-5 mb-4">
                <h5 className="mb-3">Résumé de la commande</h5>
                <div className="d-flex justify-content-between mb-3">
                  <span>Sous-total</span>
                  <span>{order.sub_total || '0'} frs</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span>Livraison</span>
                  <span>{order.shipping_amount || '0'} frs</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span>Taxe</span>
                  <span>{order.tax_fee || '0'} frs</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span>Frais de service</span>
                  <span>{order.service_fee || '0'} frs</span>
                </div>

                {order.saved !== "0.00" &&
                  <div className="d-flex text-success fw-bold justify-content-between">
                    <span>Réduction</span>
                    <span>- {order.saved || '0'} frs</span>
                  </div>
                }
                <hr className="my-4" />
                <div className="d-flex justify-content-between fw-bold mb-5">
                  <span>Total</span>
                  <span>{order.total || '0'} frs</span>
                </div>

                <section className="shadow p-3 d-flex mt-4 mb-4">
                  <input
                    name="couponCode"
                    type="text"
                    className='form-control'
                    style={{ border: "dashed 1px gray" }}
                    placeholder='Entrez le code promo'
                    onChange={(e) => setCouponCode(e.target.value)}
                  />
                  <button onClick={applyCoupon} className='btn btn-success ms-1'>
                    <i className='fas fa-check-circle'></i>
                  </button>
                </section>

                {paymentLoading ?
                  <form action={`${SERVER_URL}/api/v1/stripe-checkout/${order?.oid}/`} method='POST'>
                    <button
                      onClick={payWithStripe}
                      disabled
                      type='submit'
                      className="btn btn-primary btn-rounded w-100 mt-2"
                      style={{ backgroundColor: "#635BFF" }}
                    >
                      Traitement... <i className='fas fa-spinner fa-spin'></i>
                    </button>
                  </form>
                  :
                  <form action={`${SERVER_URL}/api/v1/stripe-checkout/${order?.oid}/`} method='POST'>
                    <button
                      onClick={payWithStripe}
                      type='submit'
                      className="btn btn-primary btn-rounded w-100 mt-2"
                      style={{ backgroundColor: "#635BFF" }}
                    >
                      Payer maintenant avec (Stripe) <i className='fas fa-credit-card'></i>
                    </button>
                  </form>
                }
              </section>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export default Checkout;
