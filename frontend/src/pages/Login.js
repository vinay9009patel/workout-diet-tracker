import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import api from "../api/axios.js";
import { AuthContext } from "../context/AuthContext.js";
import "../styles/login.css";

function Login() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    try {
      const response = await api.post("/auth/login", { email, password });
      login({ token: response.data.token, user: response.data.user });
      navigate("/dashboard");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Login failed");
    }
  };

  return (
    <main className="login-container">
      <section className="login-card">
        <p className="auth-logo">FITOPS</p>
        <h2 className="login-title">Welcome Back</h2>
        <p className="auth-subtitle">Sign in to continue your fitness journey.</p>
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-field">
            <input
              type="email"
              placeholder=" "
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
            <label>Email</label>
          </div>
          <div className="form-field">
            <input
              type="password"
              placeholder=" "
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
            <label>Password</label>
          </div>
          {error ? <p className="error-text">{error}</p> : null}
          <button className="login-btn" type="submit">
            Login
          </button>
        </form>
        <p className="register-link">
          New user? <Link to="/register">Create account</Link>
        </p>
      </section>
    </main>
  );
}

export default Login;
