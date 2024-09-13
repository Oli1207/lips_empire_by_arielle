import React, {useState, useEffect} from 'react';
import { login } from '../utils/auth';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/auth';

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
            alert(error);
        } else {
            navigate("/");
            resetForm();
        }
    }

    return (
        <div style={{ 
            marginTop: '100px', 
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
            <h2 style={{ color: '#FF6F91', marginBottom: '20px' }}>Welcome Back</h2>
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
                        backgroundColor: '#FFE6E9'
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
                        backgroundColor: '#FFE6E9'
                    }}
                />
                <button 
                    type='submit' 
                    style={{
                        width: '100%',
                        padding: '10px',
                        backgroundColor: '#FF6F91',
                        border: 'none',
                        borderRadius: '5px',
                        color: 'white',
                        fontSize: '16px',
                        cursor: 'pointer'
                    }}
                >
                    {isLoading ? 'Loading...' : 'Login'}
                </button>
            </form>
        </div>
    );
}

export default Login;
