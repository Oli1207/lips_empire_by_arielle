import apiInstance from '../utils/axios';
import { useState } from 'react';
import Swal from 'sweetalert2';

const Toast = Swal.mixin({
    toast: true,
    position: 'top',
    showConfirmButton: false,
    timer: 1500,
    timerProgressBar: true,
});


// Function to add a product to the cart
export const addToCart = async (product_id, user_id, qty, price, shipping_amount, current_address, cart_id) => {

    const axios = apiInstance;
    // Set the loading state to "Processing..." while the request is in progress
    

    try {
        // Create a new FormData object to send product information to the server
        const formData = new FormData();
        formData.append('product_id', product_id);
        formData.append('user_id', user_id);
        formData.append('qty', qty);
        formData.append('price', price);
        formData.append('shipping_amount', shipping_amount);
        formData.append('country', current_address);
        formData.append('cart_id', cart_id);

        

        // Send a POST request to the server's 'cart-view/' endpoint with the product information
        const response = await axios.post('cart-view/', formData);

        // Log the response data from the server
        console.log(response.data);

        Toast.fire({
            icon: 'success',
            title: 'Added To Cart'
        });

        // Set the loading state to "Added To Cart" upon a successful response
        
    } catch (error) {
        // Log any errors that occur during the request
        console.log(error);

        // Set the loading state to "An Error Occurred" in case of an error
        
    }
};
