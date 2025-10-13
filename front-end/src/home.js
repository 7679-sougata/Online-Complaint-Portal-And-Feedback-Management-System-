import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  return (
    <div className="home-container">
      <h2 className="home-title">Welcome to the Online Complaint Portal and Feedback Management System</h2>
      
      <p className="home-text">If you don’t have an account, click below!</p>
      <Link to="/signup">
        <button className="home-button">Go to Signup Page</button>
      </Link>

      <p className="home-text">If you already have an account, click below!</p>
      <Link to="/login">
        <button className="home-button">Go to Login Page</button>
      </Link>
    </div>
  );
};

export default Home;
