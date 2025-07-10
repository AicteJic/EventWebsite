import React, { useState } from 'react';
import './ContactUs.css';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
      details: {
        text: "AICTE Indovation Centre, Jaipur VRGC+VH7, Jawahar Nagar, Jaipur, Rajasthan 302007",
        link: "https://www.google.com/maps/search/?api=1&query=AICTE+Indovation+Centre,+Jaipur+VRGC+VH7,+Jawahar+Nagar,+Jaipur,+Rajasthan+302007"
      }
    },
    {
      icon: "📞",
      title: "Phone",
      details: "+91 141 282 3250"
    },
    {
      icon: "✉️",
      title: "Email",
      details: "admin.jic@aicte-india.org"
    },
    {
      icon: "🕒",
      title: "Working Hours",
      details: "Monday - Saturday: 9:30 AM - 6:30 PM"
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

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/';

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
    try {
      const response = await fetch(`${BACKEND_URL}/api/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        toast.success('Your message has been sent to admin, we will reach out soon at provided mail id.', {
          position: toast.POSITION.TOP_CENTER,
          autoClose: 4000,
        });
        setFormData({ name: '', email: '', subject: '', message: '', phone: '' });
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to send message.', { position: toast.POSITION.TOP_CENTER });
      }
    } catch (err) {
      toast.error('Failed to send message. Please try again later.', { position: toast.POSITION.TOP_CENTER });
    }
    setIsSubmitting(false);
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
                <div className="contact-details">
                  {info.title === 'Address' ? (
                    <a href={info.details.link} target="_blank" rel="noopener noreferrer" style={{ color: '#282769', textDecoration: 'underline', fontWeight: 500 }}>
                      {info.details.text}
                    </a>
                  ) : (
                    info.details
                  )}
                </div>
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
                <label htmlFor="phone">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Enter your phone number"
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

        {/* <div className="departments-section">
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
                <p>AICTE Indovation Centre, Jaipur</p>
                <p>VRGC+VH7, Jawahar Nagar</p>
                <p>Jaipur, Rajasthan 302007</p>
                <a
                  className="directions-btn"
                  href="https://www.google.com/maps/search/?api=1&query=AICTE+Indovation+Centre,+Jaipur+VRGC+VH7,+Jawahar+Nagar,+Jaipur,+Rajasthan+302007"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: 'inline-block', textDecoration: 'none' }}
                >
                  Get Directions
                </a>
              </div>
            </div>
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default ContactUs; 
