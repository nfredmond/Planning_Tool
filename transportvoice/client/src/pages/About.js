import React from 'react';
import './About.css';

const About = () => {
  return (
    <div className="about-page">
      <section className="about-header">
        <h1>About TransportVoice</h1>
        <p>Learn more about our mission and values</p>
      </section>
      
      <section className="about-mission">
        <h2>Our Mission</h2>
        <p>
          At TransportVoice, we believe that transportation should be accessible, 
          efficient, and enjoyable for everyone. Our mission is to provide a platform 
          where users can share their experiences, find solutions to transportation 
          challenges, and collaborate to improve mobility for all.
        </p>
      </section>
      
      <section className="about-team">
        <h2>Our Team</h2>
        <div className="team-grid">
          <div className="team-member">
            <div className="member-image placeholder"></div>
            <h3>Jane Doe</h3>
            <p>CEO & Founder</p>
          </div>
          <div className="team-member">
            <div className="member-image placeholder"></div>
            <h3>John Smith</h3>
            <p>CTO</p>
          </div>
          <div className="team-member">
            <div className="member-image placeholder"></div>
            <h3>Sarah Johnson</h3>
            <p>Head of Product</p>
          </div>
        </div>
      </section>
      
      <section className="about-values">
        <h2>Our Values</h2>
        <ul className="values-list">
          <li>
            <h3>Accessibility</h3>
            <p>We believe transportation should be accessible to everyone regardless of ability or location.</p>
          </li>
          <li>
            <h3>Innovation</h3>
            <p>We constantly seek new solutions to improve transportation experiences.</p>
          </li>
          <li>
            <h3>Community</h3>
            <p>We foster a collaborative environment where users can share insights and support each other.</p>
          </li>
          <li>
            <h3>Sustainability</h3>
            <p>We promote environmentally friendly transportation options for a better future.</p>
          </li>
        </ul>
      </section>
    </div>
  );
};

export default About; 