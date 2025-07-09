import React, { useState } from 'react';
import './ContactUs.css';

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const contactInfo = [
    {
      icon: "📍",
      title: "Address",
      details: "AICTE Jaipur Innovation Center<br/>Malviya National Institute of Technology<br/>Jaipur, Rajasthan 302017, India"
    },
    {
      icon: "📞",
      title: "Phone",
      details: "+91 141 252 9022<br/>+91 141 252 9023<br/>Emergency: +91 98765 43210"
    },
    {
      icon: "✉️",
      title: "Email",
      details: "info@aictejaipur.org<br/>support@aictejaipur.org<br/>innovation@aictejaipur.org"
    },
    {
      icon: "🕒",
      title: "Working Hours",
      details: "Monday - Friday: 9:00 AM - 6:00 PM<br/>Saturday: 10:00 AM - 4:00 PM<br/>Sunday: Closed"
    }
  ];

  const departments = [
    {
      name: "General Inquiries",
      email: "info@aictejaipur.org",
      phone: "+91 141 252 9022"
    },
    {
      name: "Technical Support",
      email: "support@aictejaipur.org",
      phone: "+91 141 252 9023"
    },
    {
      name: "Innovation Projects",
      email: "innovation@aictejaipur.org",
      phone: "+91 141 252 9024"
    },
    {
      name: "Event Management",
      email: "events@aictejaipur.org",
      phone: "+91 141 252 9025"
    }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      alert('Thank you for your message! We will get back to you soon.');
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
      setIsSubmitting(false);
    }, 2000);
  };

  return (
    <div className="contact-us">
      <div className="contact-hero">
        <h1>Contact Us</h1>
        <p>Get in touch with us. We'd love to hear from you and answer any questions you might have.</p>
      </div>

      <div className="contact-content">
        <div className="contact-info-section">
          <h2>Get In Touch</h2>
          <div className="contact-info-grid">
            {contactInfo.map((info, index) => (
              <div key={index} className="contact-info-card">
                <div className="contact-icon">{info.icon}</div>
                <h3>{info.title}</h3>
                <div 
                  className="contact-details"
                  dangerouslySetInnerHTML={{ __html: info.details }}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="contact-form-section">
          <div className="form-container">
            <h2>Send us a Message</h2>
            <form onSubmit={handleSubmit} className="contact-form">
              <div className="form-group">
                <label htmlFor="name">Full Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your full name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your email address"
                />
              </div>

              <div className="form-group">
                <label htmlFor="subject">Subject *</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter subject"
                />
              </div>

              <div className="form-group">
                <label htmlFor="message">Message *</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your message"
                  rows="5"
                />
              </div>

              <button 
                type="submit" 
                className="submit-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>

        <div className="departments-section">
          <h2>Contact by Department</h2>
          <div className="departments-grid">
            {departments.map((dept, index) => (
              <div key={index} className="department-card">
                <h3>{dept.name}</h3>
                <div className="department-contact">
                  <p><strong>Email:</strong> {dept.email}</p>
                  <p><strong>Phone:</strong> {dept.phone}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="location-section">
          <h2>Find Us</h2>
          <div className="location-card">
            <div className="map-placeholder">
              <div className="map-content">
                <h3>📍 Our Location</h3>
                <p>AICTE Jaipur Innovation Center</p>
                <p>Malviya National Institute of Technology</p>
                <p>Jaipur, Rajasthan 302017, India</p>
                <button className="directions-btn">Get Directions</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs; 
