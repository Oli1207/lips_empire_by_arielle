import React, {useState, useEffect} from 'react';
import { login } from '../utils/auth';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/auth';
import Swal from 'sweetalert2';
import apiInstance from '../utils/axios';
import CartID from '../plugin/CartID';

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const isLoggedIn = useAuthStore((state) => state.isLoggedIn);

    useEffect(() => {
        if(isLoggedIn()){
            navigate('/');
        }
    });

    const resetForm = () => {
      setEmail(""); 
      setPassword("");
    }

    const handleLogin = async(e) => {
        e.preventDefault();
        setIsLoading(true);
    
        const { error } = await login(email, password);
    
        if (error) {
            // Vérifier si l'erreur est liée au mot de passe
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Please review your credentials'
            });
            setIsLoading(false);
        } else {
            // Merge le panier anonyme avec le compte connecté
            const cart_id = CartID()
            if (cart_id) {
                apiInstance.post('cart/merge/', { cart_id }).catch(() => {})
            }

            Swal.fire({
                icon: 'success',
                title: 'Login Successful',
                text: 'You have successfully logged in!'
            });

            navigate("/");
            resetForm();
            setIsLoading(false);
        }
    }
    

    return (
        <div style={{  
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            minHeight: '80vh',
            backgroundColor: 'linear-gradient(180deg, #F2D8DB 0%, #F2D8DB 66%)',
            padding: '20px',
            borderRadius: '10px',
            boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)'
        }}>
            <h2 style={{ color: '#FEDBD1', marginBottom: '20px' }}>Bienvenue chez Lip's Empire By Arielle</h2>
            <form onSubmit={handleLogin} style={{ width: '100%', maxWidth: '400px' }}>
                <input 
                    type='text'
                    name='email'
                    id='email'
                    placeholder='Email'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '10px',
                        marginBottom: '15px',
                        border: '1px solid #FF6F91',
                        borderRadius: '5px',
                        backgroundColor: '#FEDBD1'
                    }}
                />
                <input 
                    type='password'
                    name='password'
                    id='password'
                    placeholder='Password'
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '10px',
                        marginBottom: '20px',
                        border: '1px solid #FF6F91',
                        borderRadius: '5px',
                        backgroundColor: '#FEDBD1'
                    }}
                />
                <button 
                    type='submit' 
                    style={{
                        width: '100%',
                        padding: '10px',
                        backgroundColor: '#FEDBD1',
                        border: 'none',
                        borderRadius: '5px',
                        color: 'black',
                        fontSize: '16px',
                        cursor: 'pointer'
                    }}
                    disabled={isLoading}
                >
                    {isLoading ? 'Chargement...' : 'Se Connecter'}
                </button>
            </form>
        </div>
    );
}

export default Login;
