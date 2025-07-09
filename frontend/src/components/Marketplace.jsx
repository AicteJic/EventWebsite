import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import aicteLogo from '../assets/aicte_logo.png';
import event1Image from '../images/event1.png';
import event2Image from '../images/event2.png';
import event3Image from '../images/event3.png';
import event1 from '../images/event1.png';
import event2 from '../images/event2.png';
import event3 from '../images/event3.png';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// import event4image from '../../../backend/images/'
import './Marketplace.css';
import filterLogo from '../assets/filter_logo.jpg';
import ConfirmationBox from './ConfirmationBox';
// import event1 from '../images/event1.png';
import fallBackImage from '../images/Image-not-found.png';
import Modal from 'react-modal';
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/';

const Marketplace = () => {
  const [events, setEvents] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const navigate = useNavigate();
  const [currentEventIndex, setCurrentEventIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const eventImages = [event1, event2, event3];
  // AICTE Events data
  const sampleEvents = [
    // {
    //   id: 1,
    //   title: "AICTE Idea Lab Tech Fest 2025",
    //   description: "A cutting-edge event showcasing indovations and creative technological solutions from students, featuring workshops, seminars, and competitions led by industry experts and academic leaders.",
    //   date: "2025-03-15",
    //   time: "10:00 AM",
    //   endTime: "5:00 PM",
    //   location: "AICTE Indovation Hub, New Delhi",
    //   category: "ip_consultancy",
    //   image: event1Image,
    //   availableSeats: 200,
    //   organizer: "AICTE Indovation Cell"
    // },
    // {
    //   id: 2,
    //   title: "Smart India Hackathon (SIH) 2025",
    //   description: "A national-level coding competition where students collaborate to solve real-world problems posed by government and industry, with mentoring from top tech experts.",
    //   date: "2025-04-10",
    //   time: "09:00 AM",
    //   endTime: "6:00 PM",
    //   location: "AICTE National Center, Mumbai",
    //   category: "expert_guidance",
    //   image: event2Image,
    //   availableSeats: 500,
    //   organizer: "AICTE & Ministry of Education"
    // },
    // {
    //   id: 3,
    //   title: "JIC Indovation Summit 2025",
    //   description: "A gathering of innovators, entrepreneurs, and educators to share disruptive ideas and the latest trends in technology, featuring talks, panel discussions, and startup showcases.",
    //   date: "2025-01-25",
    //   time: "10:00 AM",
    //   endTime: "4:00 PM",
    //   location: "JIC Convention Center, Bangalore",
    //   category: "mentoring",
    //   image: event3Image,
    //   availableSeats: 300,
    //   organizer: "JIC Indovation Hub"
    // },
    
  ];

  // Auto-slide functionality
  useEffect(() => {
    let interval;
    if (isAutoPlaying) {
      interval = setInterval(() => {
        setCurrentEventIndex((prevIndex) => (prevIndex + 1) % eventImages.length);
      }, 3000); // Change every 3 seconds
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isAutoPlaying, eventImages.length]);

  useEffect(() => {
    // Check if user is logged in and is a normal user
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    // Fetch events from the backend
    const fetchEvents = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/events/`);
        if (!response.ok) {
          throw new Error('Failed to fetch events');
        }
        const data = await response.json();
                const reversedData = data.reverse();
        // Combine sample events with fetched events
        setEvents([...reversedData,...sampleEvents]);
        console.log('events',events);
      } catch (error) {
        console.error('Error fetching events:', error);
        toast.error('Error fetching events:', error);
        setEvents(sampleEvents); // Fallback to sample events on error
      }
    };

    fetchEvents();
    
    // if (!isLoggedIn) {
    //   navigate('/login');
    // }  else 
    {
      // setEvents(sampleEvents);
      // Load registrations from localStorage
      const savedRegistrations = localStorage.getItem('events');
      if (savedRegistrations) {
        try {
          const parsedRegistrations = JSON.parse(savedRegistrations);
          if (Array.isArray(parsedRegistrations) && parsedRegistrations.every(item => typeof item === 'string')) {
            setRegistrations(parsedRegistrations);
          } else {
            console.error('Invalid data format for saved registrations. Expected an array of strings.');
            toast.error('Invalid data format for saved registrations. Expected an array of strings.');
          }
        } catch (error) {
          console.error('Error parsing saved registrations:', error);
          toast.error('Error parsing saved registrations:', error);
        }
      }
    }
  }, [navigate]);

  // Save registrations to localStorage whenever registrations change
  // useEffect(() => {
  //   localStorage.setItem('events', JSON.stringify(registrations));
  // }, [registrations]);

  const toggleFilterVisibility = () => {
    setIsFilterVisible(!isFilterVisible);
  };

  const handleScreenClick = (e) => {
    if (isFilterVisible) {
      setIsFilterVisible(false);
    }
  };

  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [registrationDetails, setRegistrationDetails] = useState({ name: '', email: '', mobile: '', organization: '' });
  const [eventToRegister, setEventToRegister] = useState(null);

  const registerForEvent = async (props) => {
    const { event, details } = props;
    if (event.availableSeats <= 0) {
      toast.error('Sorry, this event is full!');
      return;
    }
    try {
      const registerEventResponse = await fetch(`${BACKEND_URL}/api/events/${event._id}/register`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(details),
      });
      if (!registerEventResponse.ok) {
        const errorData = await registerEventResponse.json().catch(() => ({}));
        if (errorData.error === 'This email is already registered for the event') {
          toast.error('Email ID already registered for this event.');
        } else {
          throw new Error(errorData.error || 'Failed to register for the event');
        }
        return;
      }
      setRegistrations((prevRegistrations) => {
        const updatedRegistrations = [...prevRegistrations, event._id];
        localStorage.setItem('events', JSON.stringify(updatedRegistrations));
        return updatedRegistrations;
      });
      toast.success(`Successfully registered for "${event.title}"!`);
    } catch (error) {
      console.error('Error registering for event:', error);
      toast.error(error.message || 'An error occurred while registering for the event. Please try again.');
    }
  };

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelEmail, setCancelEmail] = useState('');
  const [eventToCancel, setEventToCancel] = useState(null);

  const cancelRegistration = async (eventId, email) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/events/${eventId}/cancel-register`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        toast.success('Registration canceled successfully!');
        setRegistrations(registrations.filter((reg) => reg !== eventId));
        setEvents((prevEvents) =>
          prevEvents.map((e) =>
            e._id === eventId ? { ...e, availableSeats: e.availableSeats + 1 } : e
          )
        );
      } else {
        const errorData = await response.json().catch(() => ({}));
        if (errorData.error === 'No registration found for this email') {
          toast.error('You are not registered for this event.');
        } else {
          toast.error('Failed to cancel registration.');
        }
      }
    } catch (error) {
      console.error('Error canceling registration:', error);
      toast.error('An error occurred while canceling registration.');
    }
  };

  const filteredEvents = events.filter(event => {
    const matchesCategory = selectedCategory === 'all' || 
      (Array.isArray(event.category) 
        ? event.category.includes(selectedCategory)
        : event.category === selectedCategory);
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase());
    if (filter === 'registered') {
      return registrations.includes(event._id) && matchesCategory && matchesSearch;
    } else if (filter === 'not_registered') {
      return !registrations.includes(event._id) && matchesCategory && matchesSearch;
    }
    return matchesCategory && matchesSearch; // 'all' filter
  });

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'ip_consultancy', label: 'IP Consultancy' },
    { value: 'company_registration', label: 'Company Registration' },
    { value: 'mentoring', label: 'Mentoring' },
    { value: 'expert_guidance', label: 'Expert Guidance' }
  ];

  const formatCategoryName = (category) => {
    if (Array.isArray(category)) {
      return category.map(cat => {
        const categoryMap = {
          'ip_consultancy': 'IP Consultancy',
          'company_registration': 'Company Registration',
          'mentoring': 'Mentoring',
          'expert_guidance': 'Expert Guidance'
        };
        return categoryMap[cat] || cat;
      }).join(', ');
    } else {
      const categoryMap = {
        'ip_consultancy': 'IP Consultancy',
        'company_registration': 'Company Registration',
        'mentoring': 'Mentoring',
        'expert_guidance': 'Expert Guidance'
      };
      return categoryMap[category] || category;
    }
  };
  const handleNextEvent = () => {
    setCurrentEventIndex((prevIndex) => (prevIndex + 1) % eventImages.length);
  };

  const handlePreviousEvent = () => {
    setCurrentEventIndex((prevIndex) => (prevIndex - 1 + eventImages.length) % eventImages.length);
  };

  const handleDotClick = (index) => {
    setCurrentEventIndex(index);
  };

  const handleHeroMouseEnter = () => {
    setIsAutoPlaying(false);
  };

  const handleHeroMouseLeave = () => {
    setIsAutoPlaying(true);
  };

  const [confirmBox, setConfirmBox] = useState({ isOpen: false, title: '', message: '', onConfirm: null, danger: false });
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [confirmationTitle, setConfirmationTitle] = useState('');
  const [confirmationMessage, setConfirmationMessage] = useState('');
  const [onConfirmHandler, setOnConfirmHandler] = useState(() => () => {});
  const [showExpertModal, setShowExpertModal] = useState(false);
  const [selectedExpert, setSelectedExpert] = useState(null);

  return (
    <div className="marketplace-container" onClick={handleScreenClick}>
      {/* Confirmation Modal */}
      <ConfirmationBox
        isOpen={isConfirmationOpen}
        title={confirmationTitle}
        message={confirmationMessage}
        confirmText="Yes"
        cancelText="No"
        onConfirm={() => {
          onConfirmHandler();
          setIsConfirmationOpen(false);
        }}
        onCancel={() => setIsConfirmationOpen(false)}
      />
      {/* Registration Modal */}
      {showRegistrationModal && (
        <Modal
          isOpen={showRegistrationModal}
          onRequestClose={() => setShowRegistrationModal(false)}
          className="modal-content"
          overlayClassName="modal-overlay"
          ariaHideApp={false}
        >
          <div className="modal-header">
            <h3>Register for Event</h3>
          </div>
          <div className="modal-body">
            <form onSubmit={e => {
              e.preventDefault();
              setShowRegistrationModal(false);
              registerForEvent({ event: eventToRegister, details: registrationDetails });
            }}>
              <label>Name:<input type="text" value={registrationDetails.name} onChange={e => setRegistrationDetails({ ...registrationDetails, name: e.target.value })} required /></label>
              <label>Email:<input type="email" value={registrationDetails.email} onChange={e => setRegistrationDetails({ ...registrationDetails, email: e.target.value })} required /></label>
              <label>Mobile:<input type="text" value={registrationDetails.mobile} onChange={e => setRegistrationDetails({ ...registrationDetails, mobile: e.target.value })} required /></label>
              <label>Organization:<input type="text" value={registrationDetails.organization} onChange={e => setRegistrationDetails({ ...registrationDetails, organization: e.target.value })} required /></label>
              <button type="submit">Register</button>
              <button type="button" onClick={() => setShowRegistrationModal(false)}>Cancel</button>
            </form>
          </div>
        </Modal>
      )}
      {showCancelModal && (
        <Modal
          isOpen={showCancelModal}
          onRequestClose={() => setShowCancelModal(false)}
          className="modal-content"
          overlayClassName="modal-overlay"
          ariaHideApp={false}
        >
          <div className="modal-header">
            <h3>Cancel Registration</h3>
          </div>
          <div className="modal-body">
            <form onSubmit={e => {
              e.preventDefault();
              setShowCancelModal(false);
              cancelRegistration(eventToCancel._id, cancelEmail);
            }}>
              <label>Email used for registration:<input type="email" value={cancelEmail} onChange={e => setCancelEmail(e.target.value)} required /></label>
              <button type="submit">Cancel Registration</button>
              <button type="button" onClick={() => setShowCancelModal(false)}>Close</button>
            </form>
          </div>
        </Modal>
      )}
      <div 
        className="hero-section"
        onMouseEnter={handleHeroMouseEnter}
        onMouseLeave={handleHeroMouseLeave}
      >
        <button className="arrow-button prev-arrow" onClick={handlePreviousEvent}>
          <span>❮</span>
        </button>
        
        <div className="hero-slider">
          <img 
            src={eventImages[currentEventIndex]} 
            alt={`Event ${currentEventIndex + 1}`} 
            className="hero-image" 
          />
          <div className="hero-overlay">
            <div className="hero-content">
              <h2 className="hero-title">Featured Events</h2>
              <p className="hero-subtitle">Discover amazing opportunities and connect with experts</p>
            </div>
          </div>
        </div>
        
        <button className="arrow-button next-arrow" onClick={handleNextEvent}>
          <span>❯</span>
        </button>

        {/* Indicator dots */}
        <div className="slider-indicators">
          {eventImages.map((_, index) => (
            <button
              key={index}
              className={`indicator-dot ${index === currentEventIndex ? 'active' : ''}`}
              onClick={() => handleDotClick(index)}
            />
          ))}
        </div>

        {/* Auto-play indicator */}
        <div className="auto-play-indicator">
          <span className={`play-status ${isAutoPlaying ? 'playing' : 'paused'}`}>
            {isAutoPlaying ? '▶' : '⏸'}
          </span>
        </div>
      </div>
      
      {isFilterVisible && (
        <div className="filter-buttons" onClick={(e) => e.stopPropagation()}>
          <button
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button
            className={`filter-btn ${filter === 'registered' ? 'active' : ''}`}
            onClick={() => setFilter('registered')}
          >
            Registered
          </button>
          <button
            className={`filter-btn ${filter === 'not_registered' ? 'active' : ''}`}
            onClick={() => setFilter('not_registered')}
          >
            Not Registered
          </button>
        </div>
      )}
      <div className="filters-section">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <div className="filter-icon" onClick={(e) => { e.stopPropagation(); toggleFilterVisibility(); }}>
            <span>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="24" height="24" style={{ display: 'block' }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z" />
              </svg>
            </span>
          </div>
        </div>
        <div className="category-filters">
          {categories.map(category => (
            <button
              key={category.value}
              className={`category-btn ${selectedCategory === category.value ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category.value)}
            >
              {category.label}
            </button>
          ))}
        </div>
        
      </div>
      <div className="market-content">
        <div className="events-grid">
          {filteredEvents.map(event => (
            <div key={event._id} className="event-card">
              <div className="event-image">
                <img src={event.image ? `${event.image}`:`${fallBackImage}`} alt={event.title} />
                <div className="event-category">{formatCategoryName(event.category)}</div>
              </div>
              <div className="event-content">
                <h3 className="event-title">{event.title}</h3>
                <p className="event-description">{event.description}</p>
                <div className="event-details">
                  <div className="event-date">
                    <span className="icon">📅</span>
                    {new Date(event.date).toLocaleDateString()} 
                    {event.endTime ? ` | ${event.time} - ${event.endTime}` : ` at ${event.time}`}
                  </div>
                  <div className="event-location">
                    <span className="icon">📍</span>
                    {event.location}
                  </div>
                  <div className="event-organizer">
                    <span className="icon">👥</span>
                    {event.organizer}
                  </div>
                </div>
                <div className="event-footer">
                  <div className="seats-section">
                    <span className="available">
                      {event.availableSeats} seats available
                    </span>
                  </div>
                  <button 
                    className="register-button"
                    disabled={event.availableSeats === 0}
                    onClick={() => {
                      setEventToRegister(event);
                      setRegistrationDetails({ name: '', email: '', mobile: '', organization: '' });
                      setShowRegistrationModal(true);
                    }}
                  >
                    {event.availableSeats === 0 ? 'Event Full' : 'Register'}
                  </button>
                  <button 
                    onClick={() => {
                      setEventToCancel(event);
                      setCancelEmail('');
                      setShowCancelModal(true);
                    }} 
                    className="cancel-registration-btn"
                  >
                    Cancel Registration
                  </button>
                </div>
                {/* Booked Experts Section */}
                {event.booked_experts && event.booked_experts.length > 0 && (
                  <div className="booked-experts-section">
                    <span className="booked-experts-label">Experts:</span>
                    <div className="booked-experts-avatars">
                      {event.booked_experts.map(expert => (
                        <img
                          key={expert._id}
                          src={expert.photo || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(expert.name || 'Expert')}
                          alt={expert.name}
                          className="expert-avatar"
                          title={expert.name}
                          style={{ cursor: 'pointer' }}
                          onClick={e => {
                            e.stopPropagation();
                            setSelectedExpert(expert);
                            setShowExpertModal(true);
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}
                {/* Resource URLs Section */}
                {event.urls && event.urls.length > 0 && (
                  <div className="event-urls">
                    <span className="event-urls-label">Resources:</span>
                    <ul style={{ margin: '6px 0 0 0', padding: 0, listStyle: 'none', display: 'flex', gap: 8 }}>
                      {event.urls.map((url, idx) => (
                        <li key={idx} style={{ display: 'inline' }}>
                          <a href={url} target="_blank" rel="noopener noreferrer" style={{ color: '#667eea', textDecoration: 'underline', fontWeight: 500 }}>
                            Link{idx + 1}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      <ConfirmationBox
        isOpen={confirmBox.isOpen}
        title={confirmBox.title}
        message={confirmBox.message}
        confirmText="Yes"
        cancelText="No"
        danger={!!confirmBox.danger}
        onConfirm={() => {
          if (typeof confirmBox.onConfirm === 'function') confirmBox.onConfirm();
        }}
        onCancel={() => setConfirmBox({ ...confirmBox, isOpen: false })}
      />
      {/* Experts Modal */}
      <Modal
        isOpen={showExpertModal}
        onRequestClose={() => setShowExpertModal(false)}
        className="modal-content"
        overlayClassName="modal-overlay"
        ariaHideApp={false}
      >
        <div className="modal-header">
          <h3>Expert Information</h3>
        </div>
        <div className="modal-body">
          {selectedExpert && (
            <div className="expert-info">
              <img src={selectedExpert.photo || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(selectedExpert.name || 'Expert')} alt="Expert" className="expert-photo" />
              <p><strong>Name:</strong> {selectedExpert.name}</p>
              <p><strong>Email:</strong> {selectedExpert.email}</p>
              <p><strong>Organization:</strong> {selectedExpert.organization || 'N/A'}</p>
              <p><strong>Role:</strong> {selectedExpert.role || 'N/A'}</p>
              <p><strong>Phone:</strong> {selectedExpert.mobileNumber || 'N/A'}</p>
              {selectedExpert.linkedinProfile && (
                <p><strong>LinkedIn:</strong> <a href={selectedExpert.linkedinProfile} target="_blank" rel="noopener noreferrer">View Profile</a></p>
              )}
              {/* Close button at the bottom, centered */}
              <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginTop: 24 }}>
                <button onClick={() => setShowExpertModal(false)} className="">Close</button>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default Marketplace;
