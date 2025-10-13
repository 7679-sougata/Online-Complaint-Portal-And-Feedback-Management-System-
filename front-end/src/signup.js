import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import './Signup.css';

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("http://localhost:5000/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        alert(data.message);
        navigate("/login");
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Something went wrong");
    }
  };

  return (
    <div className="signup-container">
      <form className="signup-form" onSubmit={handleSignup}>
        <h2 className="signup-bar">Signup</h2>

        {error && <p style={{ color: "red" }}>{error}</p>}

        <label>Name</label>
        <input type="text" placeholder="Enter your name" value={name} onChange={(e) => setName(e.target.value)} />

        <label>Email</label>
        <input type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} />

        <label>Password</label>
        <input type="password" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} />

        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default Signup;