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
    confirmPassword: "",
    gender: "",
  });
  const [avatarPreview, setAvatarPreview] = useState("");
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

    if (form.password !== form.confirmPassword) {
      setError("Password and confirm password must match");
      return;
    }

    if (!form.gender) {
      setError("Please select gender");
      return;
    }

    try {
      await api.post("/auth/signup", {
        name: form.name,
        email: form.email,
        password: form.password,
        gender: form.gender,
      });
      navigate("/");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Registration failed");
    }
  };

  return (
    <main className="register-container">
      <section className="register-card">
        <p className="auth-logo">FITOPS</p>
        <h2 className="register-title">Create Account</h2>
        <p className="auth-subtitle">Start tracking workouts, diet and progress.</p>
        <form className="register-form" onSubmit={handleSubmit}>
          <div className="form-field">
            <input name="name" type="text" placeholder=" " value={form.name} onChange={handleChange} required />
            <label>Name</label>
          </div>
          <div className="form-field">
            <input name="email" type="email" placeholder=" " value={form.email} onChange={handleChange} required />
            <label>Email</label>
          </div>
          <div className="form-field">
            <input name="password" type="password" placeholder=" " value={form.password} onChange={handleChange} required />
            <label>Password</label>
          </div>
          <div className="form-field">
            <input
              name="confirmPassword"
              type="password"
              placeholder=" "
              value={form.confirmPassword}
              onChange={handleChange}
              required
            />
            <label>Confirm Password</label>
          </div>
          <label>
            Gender
            <select name="gender" value={form.gender} onChange={handleChange} required>
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </label>
          <label>
            Profile Image (optional)
            <input
              type="file"
              accept="image/*"
              onChange={(event) => {
                const file = event.target.files?.[0];
                setAvatarPreview(file ? URL.createObjectURL(file) : "");
              }}
            />
          </label>
          {avatarPreview ? <img className="register-avatar-preview" src={avatarPreview} alt="Profile preview" /> : null}
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
