import React from 'react';
import './SocialMedia.css';

const SocialMedia = () => {
  const socialPlatforms = [
    {
      name: "LinkedIn",
      icon: "💼",
      url: "https://linkedin.com/company/aicte-jaipur-innovation-center",
      description: "Follow us for professional updates, industry insights, and networking opportunities",
      followers: "5K+",
      color: "#0077B5"
    },
    {
      name: "Twitter",
      icon: "🐦",
      url: "https://twitter.com/aicte_jaipur",
      description: "Stay updated with real-time news, events, and announcements",
      followers: "3K+",
      color: "#1DA1F2"
    },
    {
      name: "Facebook",
      icon: "📘",
      url: "https://facebook.com/aictejaipurinnovation",
      description: "Connect with our community and share your experiences",
      followers: "8K+",
      color: "#4267B2"
    },
    {
      name: "Instagram",
      icon: "📷",
      url: "https://instagram.com/aicte_jaipur_innovation",
      description: "Visual stories of innovation, events, and behind-the-scenes moments",
      followers: "4K+",
      color: "#E4405F"
    },
    {
      name: "YouTube",
      icon: "📺",
      url: "https://youtube.com/@aictejaipurinnovation",
      description: "Watch videos of our events, workshops, and expert talks",
      followers: "2K+",
      color: "#FF0000"
    },
    {
      name: "WhatsApp",
      icon: "💬",
      url: "https://wa.me/911234567890",
      description: "Join our WhatsApp community for instant updates and discussions",
      followers: "1K+",
      color: "#25D366"
    }
  ];

  const latestPosts = [
    {
      platform: "LinkedIn",
      content: "Exciting news! Our Innovation Lab is now open for student projects. Apply now for the upcoming semester.",
      date: "2 hours ago",
      likes: 45,
      comments: 12
    },
    {
      platform: "Twitter",
      content: "Join us this weekend for the Tech Innovation Summit featuring industry experts and startup founders.",
      date: "1 day ago",
      likes: 23,
      comments: 8
    },
    {
      platform: "Instagram",
      content: "Behind the scenes: Students working on their AI projects in our state-of-the-art facilities.",
      date: "2 days ago",
      likes: 67,
      comments: 15
    },
    {
      platform: "Facebook",
      content: "Congratulations to our winners of the Annual Innovation Challenge! Your ideas are inspiring.",
      date: "3 days ago",
      likes: 89,
      comments: 22
    }
  ];

  const handleSocialClick = (url) => {
    window.open(url, '_blank');
  };

  return (
    <div className="social-media">
      <div className="social-hero">
        <h1>Social Media</h1>
        <p>Connect with us across all platforms and stay updated with the latest innovations</p>
      </div>

      <div className="social-content">
        <div className="platforms-section">
          <h2>Follow Us</h2>
          <div className="platforms-grid">
            {socialPlatforms.map((platform, index) => (
              <div 
                key={index} 
                className="platform-card"
                onClick={() => handleSocialClick(platform.url)}
                style={{ '--platform-color': platform.color }}
              >
                <div className="platform-icon">{platform.icon}</div>
                <h3>{platform.name}</h3>
                <p className="platform-description">{platform.description}</p>
                <div className="platform-stats">
                  <span className="followers">{platform.followers} followers</span>
                </div>
                <button className="follow-btn">Follow</button>
              </div>
            ))}
          </div>
        </div>

        <div className="latest-updates">
          <h2>Latest Updates</h2>
          <div className="posts-grid">
            {latestPosts.map((post, index) => (
              <div key={index} className="post-card">
                <div className="post-header">
                  <span className="platform-badge">{post.platform}</span>
                  <span className="post-date">{post.date}</span>
                </div>
                <p className="post-content">{post.content}</p>
                <div className="post-stats">
                  <span className="likes">❤️ {post.likes}</span>
                  <span className="comments">💬 {post.comments}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="newsletter-section">
          <div className="newsletter-card">
            <h3>📧 Stay Connected</h3>
            <p>Subscribe to our newsletter for exclusive updates and insights</p>
            <div className="newsletter-form">
              <input 
                type="email" 
                placeholder="Enter your email address"
                className="newsletter-input"
              />
              <button className="newsletter-btn">Subscribe</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocialMedia; 
