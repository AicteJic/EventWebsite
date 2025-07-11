import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>AICTE Indovation Center,Jaipur</h3>
          <p>Empowering education through innovation and collaboration.</p>
        </div>
        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/events">Events</Link></li>
            <li><Link to="/impact">Impact</Link></li>
            <li><Link to="/service-booking">Request Expert</Link></li>
          </ul>
        </div>
        <div className="footer-section">
          <h4>Admin</h4>
          <ul>
            <li><Link to="/login">Admin Login</Link></li>
          </ul>
        </div>
        <div className="footer-section">
          <h4>Contact</h4>
          <p>Email: indovayion.jaipur@aicte-india.org</p>
          <p>       admin.jic@aicte-india.org(for facilty booking)</p>
          <p>Phone: 0141 282 3250</p>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; 2025 AICTE. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer; 
