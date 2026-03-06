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
        <h2 className="login-title">Login</h2>
        <form className="login-form" onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
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
