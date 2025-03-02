import React from 'react';
import './Home.css';

const Home = () => {
  return (
    <div className="home-page">
      <section className="hero">
        <div className="hero-content">
          <h1>Welcome to TransportVoice</h1>
          <p>Your platform for better transportation experiences</p>
          <button className="btn">Get Started</button>
        </div>
      </section>
      
      <section className="features">
        <h2>Our Features</h2>
        <div className="features-grid">
          <div className="feature-card">
            <h3>Easy Planning</h3>
            <p>Plan your transportation needs with our intuitive tools</p>
          </div>
          <div className="feature-card">
            <h3>Real-time Updates</h3>
            <p>Stay informed with real-time transportation updates</p>
          </div>
          <div className="feature-card">
            <h3>Community Insights</h3>
            <p>Get insights from the transportation community</p>
          </div>
        </div>
      </section>
      
      <section className="cta">
        <h2>Ready to get started?</h2>
        <p>Join thousands of users who are improving their transportation experience</p>
        <button className="btn">Sign Up Now</button>
      </section>
    </div>
  );
};

export default Home; 