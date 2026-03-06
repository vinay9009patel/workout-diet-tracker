import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import api from "../api/axios.js";
import "../styles/register.css";

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  const handleChange = (event) => {
    setForm((previous) => ({
      ...previous,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    try {
      await api.post("/auth/signup", form);
      navigate("/");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Registration failed");
    }
  };

  return (
    <main className="register-container">
      <section className="register-card">
        <h2 className="register-title">Register</h2>
        <form className="register-form" onSubmit={handleSubmit}>
          <input name="name" type="text" placeholder="Name" value={form.name} onChange={handleChange} required />
          <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required />
          <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required />
          {error ? <p className="error-text">{error}</p> : null}
          <button className="register-btn" type="submit">
            Register
          </button>
        </form>
        <p className="login-link">
          Already have an account? <Link to="/">Login</Link>
        </p>
      </section>
    </main>
  );
}

export default Register;
