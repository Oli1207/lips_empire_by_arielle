import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import apiInstance from '../utils/axios';
import GetCurrentAddress from '../plugin/UserCountry';
import UserData from '../plugin/UserData';
import { Row, Col, Image, ListGroup, Card, Button } from "react-bootstrap";
import CardID from '../plugin/CardID';
import Swal from 'sweetalert2';
import './productdetailscreen.css';

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
    const [color, setColor] = useState([]);
    const [colorValue, setColorValue] = useState("No Color");
    const [qtyValue, setQtyValue] = useState(1);

    const param = useParams();
    const currentAddress = GetCurrentAddress();
    const userData = UserData();
    const cart_id = CardID();

    useEffect(() => {
        apiInstance.get(`product/${param.slug}/`)
            .then((res) => {
                setProduct(res.data);
                setSpecifications(res.data.specification);
                setGallery(res.data.gallery);
                setColor(res.data.color);
                console.log(res.data);
            });
    }, [param.slug]);

    const handleColorButtonClick = (event) => {
        const colorNameInput = event.target.closest('.color_button').parentNode.querySelector(".color_name");
        setColorValue(colorNameInput.value);
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
        formData.append("color", colorValue);
        formData.append("cart_id", cart_id);

        try {
            const response = await apiInstance.post(`cart-view/`, formData);
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

    return (
        <main style={{marginTop: "200px"}}>
            <div className="container">
                <section className="mb-9">
                    <div className="row gx-lg-5">
                        <div className="col-md-6 mb-4 mb-md-0">
                            <div className="">
                                <div className="row gx-2 gx-lg-3">
                                    <div className="col-12 col-lg-12">
                                        <div className="lightbox">
                                            <img
                                                src={product.image}
                                                style={{
                                                    width: "100%",
                                                    height: 500,
                                                    objectFit: "cover",
                                                    borderRadius: 10,
                                                }}
                                                alt="Gallery image 1"
                                                className="ecommerce-gallery-main-img active w-100 rounded-4"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-3 d-flex">
                                    {gallery.map((g, index) => (
                                        <div className="p-3" key={index}>
                                            <img
                                                src={g.image}
                                                style={{
                                                    width: 100,
                                                    height: 100,
                                                    objectFit: "cover",
                                                    borderRadius: 10,
                                                }}
                                                alt="Gallery image"
                                                className="ecommerce-gallery-main-img active w-100 rounded-4"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="col-md-6 mb-4 mb-md-0">
                            <div>
                                <h1 className="fw-bold mb-3">{product.title}</h1>
                                <h5 className="mb-3">
                                    <s className="text-muted me-2 small align-middle">{product.old_price}</s>
                                    <span className="align-middle">{product.price}</span>
                                </h5>
                                <p className="text-muted">
                                    {product.description}
                                </p>
                                <div className="table-responsive">
                                    <table className="table table-sm table-borderless mb-0">
                                        <tbody>
                                            <tr>
                                                <th className="ps-0 w-25" scope="row">
                                                    <strong>Category</strong>
                                                </th>
                                                <td>{product.category?.title}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                                <hr className="my-5" />
                                <div>
                                    <div className="col-md-6 mb-4">
                                        <div className="form-outline">
                                            <label className="form-label" htmlFor="typeNumber"><b>Quantity</b></label>
                                            <input
                                                type="number"
                                                id="typeNumber"
                                                className="form-control"
                                                min={1}
                                                value={qtyValue}
                                                onChange={handleQuantityChange}
                                            />
                                        </div>
                                    </div>
                                    {color.length > 0 &&
                                        <>
                                            <h6>Color:<span>{colorValue}</span></h6>
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
                                    }
                                    <hr />
                                    <button 
                                        type="button" 
                                        className="btn btn-primary btn-rounded me-2"
                                        onClick={handleAddToCart}
                                    >
                                        <i className="fas fa-cart-plus me-2" /> Add to cart
                                    </button>
                                    <button href="#!" type="button" className="btn btn-danger btn-floating" data-mdb-toggle="tooltip" title="Add to wishlist">
                                        <i className="fas fa-heart" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                <hr />
                {/* Specification section positioned to the left */}
                <Row className="product-specification">
                    <Col md={12}>
                        <h3>Specifications</h3>
                        <ul>
                            {specifications.map((s, index) => (
                                <li key={index}>
                                    {s.title}: {s.content}
                                </li>
                            ))}
                        </ul>
                    </Col>
                </Row>
            </div>
        </main>
    );
}

export default ProductDetailScreen;
