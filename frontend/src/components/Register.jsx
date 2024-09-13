import React, {useState, useEffect} from 'react';
import { register } from '../utils/auth';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/auth';

function Register() {
  const [full_name, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);

  useEffect(() => {
    if(isLoggedIn()){
      navigate("/");
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const {error} = await register(
      full_name,
      email,
      phone,
      password,
      password2,
    );
    if(error){
      alert(JSON.stringify(error));
    }else{
      navigate('/');
    }
  }

  return (
    <div style={{ 
      marginTop: '150px', 
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
      <h2 style={{ color: '#FF6F91', marginBottom: '20px' }}>Créer un compte</h2>
      <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: '400px' }}>
        <input 
          type='text'
          placeholder='Nom et prénoms' 
          value={full_name}
          onChange={(e) => setFullname(e.target.value)}
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
          type='email'
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
          type='number'
          placeholder='Numéro' 
          value={phone}
          onChange={(e) => setMobile(e.target.value)}
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
          placeholder='Mot de passe' 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
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
          placeholder='Confirmez votre mot de passe' 
          value={password2}
          onChange={(e) => setPassword2(e.target.value)}
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
          {isLoading ? 'Loading...' : 'Créer un compte'}
        </button>
      </form>
    </div>
  );
}

export default Register;
