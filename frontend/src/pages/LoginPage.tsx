import { useState } from "react"
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import axios from "axios";
import "./AuthForms.css"

export default function LoginPage(){
    const navigate = useNavigate();
    const [ error, setError ] = useState('');
    const { user, setUser } = useAuth();
    const [currUsername, setCurrUsername] = useState('');
    const [currPassword, setCurrPassword] = useState('');

    function handleLogin() {
        axios.post("http://localhost:3001/login", {
            username: currUsername,
            password: currPassword,})
            .then((response) => {
                setUser(response.data)
                navigate("/");
            })
            .catch((error) => {
                setError(error.response?.data?.error ?? "Login failed")
            });
    }
    
    return(
    <div className="auth-page">
        <div className="auth-form" data-testid="login_form">
            <p>username:</p>
            <input className="username" onChange={(e) => setCurrUsername(e.target.value)} value={currUsername} data-testid='login_form_username'></input>
            <p>password:</p>
            <input className="password" type="password" onChange={(e) => setCurrPassword(e.target.value)} value={currPassword} data-testid='login_form_password'></input>
            <button className="sumbit" data-testid='login_form_login' onClick={handleLogin}>Login</button>
        </div>
        <p>{error}</p>
    </div>
    );
}

