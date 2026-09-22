import { useState } from "react"
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./AuthForms.css"

export default function RegisterPage(){
    const navigate = useNavigate();
    const [currUsername, setCurrUsername] = useState('');
    const [currPassword, setCurrPassword] = useState('');
    const [currName, setName] = useState('');
    const [currEmail, setEmail] = useState('');
    const [error, setError] = useState('');

    function handleRegister(){
        axios.post("http://localhost:3001/users", {
            username: currUsername,
            password: currPassword,
            email: currEmail,
            name: currName
        })
            .then((response) => {
                navigate("/");
            })
            .catch((error) => {
                setError(error.response?.data?.error ?? "Failed to create user")
        });
    }
    
    return(
    <div className="auth-page">
        <div className="auth-form" data-testid='create_user_form'>
            <p>name:</p>
            <input className="name" onChange={(e) => setName(e.target.value)} value={currName} data-testid='create_user_form_name'></input>
            <p>email:</p>
            <input className="email" onChange={(e) => setEmail(e.target.value)} value={currEmail} data-testid='create_user_form_email'></input>
            <p>username:</p>
            <input className="username" onChange={(e) => setCurrUsername(e.target.value)} value={currUsername} data-testid='create_user_form_username'></input>
            <p>password:</p>
            <input className="password" type="password" onChange={(e) => setCurrPassword(e.target.value)} value={currPassword} data-testid='create_user_form_password'></input>
            <button className="sumbit" data-testid='create_user_form_create_user' onClick={handleRegister}>Create User</button>
        </div>
        <p className="error-message">{error}</p>
    </div>
    );
}

