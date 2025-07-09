import React from 'react';
import './FacilityAccess.css';

const FacilityAccess = () => {
  const facilities = [
    {
      name: "Conference Hall",
      description: "State-of-the-art conference facility with modern audio-visual equipment",
      capacity: "200+ people",
      features: ["Projector", "Sound System", "WiFi", "Air Conditioning"],
      image: "🏢"
    },
    {
      name: "Innovation Lab",
      description: "Dedicated space for innovation and research activities",
      capacity: "50 people",
      features: ["3D Printers", "Prototyping Tools", "Computing Resources", "Workshop Area"],
      image: "🔬"
    },
    {
      name: "Meeting Rooms",
      description: "Multiple meeting rooms for collaborative work",
      capacity: "10-30 people",
      features: ["Video Conferencing", "Whiteboards", "Coffee Service", "Flexible Seating"],
      image: "💼"
    },
    {
      name: "Training Center",
      description: "Specialized training facility for workshops and skill development",
      capacity: "100 people",
      features: ["Interactive Displays", "Training Equipment", "Breakout Areas", "Catering"],
      image: "🎓"
    },
    {
      name: "Exhibition Space",
      description: "Large exhibition area for showcasing projects and innovations",
      capacity: "500+ people",
      features: ["Modular Setup", "Lighting System", "Security", "Storage"],
      image: "🎪"
    },
    {
      name: "Research Library",
      description: "Comprehensive library with digital and physical resources",
      capacity: "100 people",
      features: ["Digital Archives", "Study Spaces", "Research Tools", "Quiet Zones"],
      image: "📚"
    }
  ];

  return (
    <div className="facility-access">
      <div className="facility-hero">
        <h1>Facility Access</h1>
        <p>Explore our world-class facilities designed to foster innovation and collaboration</p>
      </div>
      
      <div className="facility-grid">
        {facilities.map((facility, index) => (
          <div key={index} className="facility-card">
            <div className="facility-icon">{facility.image}</div>
            <h3>{facility.name}</h3>
            <p className="facility-description">{facility.description}</p>
            <div className="facility-capacity">
              <strong>Capacity:</strong> {facility.capacity}
            </div>
            <div className="facility-features">
              <h4>Key Features:</h4>
              <ul>
                {facility.features.map((feature, featureIndex) => (
                  <li key={featureIndex}>{feature}</li>
                ))}
              </ul>
            </div>
            <button className="facility-book-btn">Request Access</button>
          </div>
        ))}
      </div>

      <div className="facility-info">
        <div className="info-section">
          <h2>Booking Information</h2>
          <div className="info-grid">
            <div className="info-item">
              <h3>📅 Booking Process</h3>
              <p>Submit your request at least 48 hours in advance for approval</p>
            </div>
            <div className="info-item">
              <h3>⏰ Operating Hours</h3>
              <p>Monday - Friday: 9:00 AM - 6:00 PM<br/>
              Saturday: 10:00 AM - 4:00 PM</p>
            </div>
            <div className="info-item">
              <h3>📞 Contact</h3>
              <p>For immediate assistance, contact our facility management team</p>
            </div>
            <div className="info-item">
              <h3>💰 Pricing</h3>
              <p>Special rates available for educational institutions and startups</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacilityAccess; 
