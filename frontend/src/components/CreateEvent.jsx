import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './CreateEvent.css';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/';

const CreateEvent = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    endTime: '',
    location: '',
    category: [],
    image: null,
    availableSeats: '',
    organizer: '',
    booked_experts: [],
    urls: [''], // Add urls as an array of strings
    eventType: '', // <-- add eventType
  });
  const [users, setUsers] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);
  const [domainExperts, setDomainExperts] = useState([]);
  const [filteredExperts, setFilteredExperts] = useState([]);
  const [loadingExperts, setLoadingExperts] = useState(false);
  const [selectedExpert, setSelectedExpert] = useState(null);
  const [containsExperts, setContainsExperts] = useState(false);
  const [expertSearch, setExpertSearch] = useState("");
  const [registrationFormConfig, setRegistrationFormConfig] = useState([
    { name: 'name', label: 'Name', required: true },
    { name: 'email', label: 'Email', required: true },
    { name: 'mobile', label: 'Mobile', required: true },
    { name: 'organization', label: 'Organization', required: true },
  ]);
  const [showRegFormEditor, setShowRegFormEditor] = useState(false);
  const [otherCategory, setOtherCategory] = useState('');
  const [customCategory, setCustomCategory] = useState('');

  // Available categories
  const availableCategories = [
    { value: 'ip_consultancy', label: 'IP Consultancy' },
    { value: 'company_registration', label: 'Company Registration' },
    { value: 'mentoring', label: 'Mentoring' },
    { value: 'expert_guidance', label: 'Expert Guidance' }
  ];

  useEffect(() => {
    // Fetch users from the backend
    const fetchUsers = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/auth/users?userType=admin`);
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    // Fetch all domain experts
    const fetchDomainExperts = async () => {
      setLoadingExperts(true);
      try {
        const response = await fetch(`${BACKEND_URL}/api/user/domain-experts`);
        const experts = await response.json();
        setDomainExperts(experts);
      } catch (error) {
        setDomainExperts([]);
      } finally {
        setLoadingExperts(false);
      }
    };
    fetchDomainExperts();
  }, []);

  // Show only domain experts whose Domain matches any selected category
  useEffect(() => {
    // Debug: log current categories and expert domains
    console.log('Selected categories:', formData.category);
    console.log('Domain experts:', domainExperts.map(e => e.Domain));
    if (!formData.category || formData.category.length === 0) {
      setFilteredExperts(domainExperts);
    } else {
      setFilteredExperts(
        domainExperts.filter(expert =>
          expert.Domain && formData.category.some(cat => cat.toLowerCase() === expert.Domain.toLowerCase())
        )
      );
    }
  }, [domainExperts, formData.category, customCategory]);

  // Filtered experts with search
  const displayedExperts = filteredExperts.filter(expert =>
    expert.name.toLowerCase().includes(expertSearch.toLowerCase()) ||
    expert.email.toLowerCase().includes(expertSearch.toLowerCase())
  );

  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (categoryValue) => {
    setFormData((prev) => {
      const currentCategories = prev.category || [];
      const updatedCategories = currentCategories.includes(categoryValue)
        ? currentCategories.filter(cat => cat !== categoryValue)
        : [...currentCategories, categoryValue];
      
      return { ...prev, category: updatedCategories };
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData((prev) => ({ ...prev, image: file }));
    setImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setFormData((prev) => ({ ...prev, image: null }));
    setImagePreview(null);
  };

  const handleLocationLink = () => {
    if (formData.location) {
      const query = encodeURIComponent(formData.location);
      return `https://www.google.com/maps/search/?api=1&query=${query}`;
    }
    return null;
  };

  // Handler for changing a specific URL
  const handleUrlChange = (index, value) => {
    setFormData((prev) => {
      const newUrls = [...(prev.urls || [])];
      newUrls[index] = value;
      return { ...prev, urls: newUrls };
    });
  };

  // Handler to add a new URL input
  const handleAddUrl = () => {
    setFormData((prev) => ({ ...prev, urls: [...(prev.urls || []), ''] }));
  };

  // Handler to remove a URL input
  const handleRemoveUrl = (index) => {
    setFormData((prev) => {
      const newUrls = [...(prev.urls || [])];
      newUrls.splice(index, 1);
      return { ...prev, urls: newUrls };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate that at least one category is selected
    if (!formData.category || formData.category.length === 0) {
      alert('Please select at least one category');
      return;
    }

    const formDataToSend = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (key === 'booked_experts' && Array.isArray(value)) {
        value.forEach(id => formDataToSend.append('booked_experts', id));
      } else if (key === 'category' && Array.isArray(value)) {
        value.forEach(cat => formDataToSend.append('category', cat));
      } else if (key === 'urls' && Array.isArray(value)) {
        value.filter(Boolean).forEach(url => formDataToSend.append('urls', url));
      } else if (value) {
        formDataToSend.append(key, value);
      }
    });

    // Add registration form config
    formDataToSend.append('registrationFormConfig', JSON.stringify(registrationFormConfig));

    // Debugging: Log all appended values
    for (let pair of formDataToSend.entries()) {
      console.log(`${pair[0]}: ${pair[1]}`);
    }

    if (formData.eventType) {
      formDataToSend.append('eventType', formData.eventType);
    }

    try {
      const response = await fetch(`${BACKEND_URL}/api/events`, {
        method: 'POST',
        body: formDataToSend,
      });

      if (response.ok) {
        alert('Event created successfully!');
        navigate('/manage-events');
      } else {
        const errorText = await response.text();
        console.error('Error creating event:', errorText);
        alert(`Error: ${errorText}`);
      }
    } catch (error) {
      console.error('Error creating event:', error);
    }
  };

  return (
    <div className="create-event-container">
      <h2>Create Event</h2>
      <form onSubmit={handleSubmit} className="create-event-form">
        <div className="event-type-radio-group">
          <label style={{ fontWeight: 600, marginBottom: 8 }}>Event Type:</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <label>
              <input
                type="radio"
                name="eventType"
                value="Initiatives and programs by JIC"
                checked={formData.eventType === 'Initiatives and programs by JIC'}
                onChange={e => setFormData(prev => ({ ...prev, eventType: e.target.value }))}
                required
              />
              Initiatives and programs by JIC
            </label>
            <label>
              <input
                type="radio"
                name="eventType"
                value="Cluster program"
                checked={formData.eventType === 'Cluster program'}
                onChange={e => setFormData(prev => ({ ...prev, eventType: e.target.value }))}
                required
              />
              Cluster program
            </label>
            <label>
              <input
                type="radio"
                name="eventType"
                value="Initiatives by MIC and JIC"
                checked={formData.eventType === 'Initiatives by MIC and JIC'}
                onChange={e => setFormData(prev => ({ ...prev, eventType: e.target.value }))}
                required
              />
              Initiatives by MIC and JIC
            </label>
          </div>
        </div>
        <label>
          Title:
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            required
          />
        </label>
        <label>
          Description:
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            required
          />
        </label>
        <label>
          Date:
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleInputChange}
            required
          />
        </label>
        <label>
          Time:
          <input
            type="time"
            name="time"
            value={formData.time}
            onChange={handleInputChange}
            required
          />
        </label>
        <label>
          End Time:
          <input
            type="time"
            name="endTime"
            value={formData.endTime}
            onChange={handleInputChange}
            required
          />
        </label>
        <label>
          Location:
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleInputChange}
            required
          />
        </label>
        {formData.location && (
          <a
            href={handleLocationLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="location-link"
          >
            View on Google Maps
          </a>
        )}
        <label>
          Image:
          <input
            type="file"
            name="image"
            onChange={handleFileChange}
          />
        </label>
        {imagePreview && (
          <div className="image-preview-container">
            <img src={imagePreview} alt="Selected" className="image-preview" />
            <button type="button" className="remove-image-button" onClick={removeImage}>
              ✖
            </button>
          </div>
        )}
        <label>
          Available Seats:
          <input
            type="number"
            name="availableSeats"
            value={formData.availableSeats}
            onChange={handleInputChange}
            required
          />
        </label>
        <label>
          Organizer:
          <input
            type="text"
            name="organizer"
            value={formData.organizer}
            onChange={handleInputChange}
            required
          />
        </label>
        <div className="contains-experts-checkbox">
          <input
            type="checkbox"
            id="containsExperts"
            checked={containsExperts}
            onChange={(e) => setContainsExperts(e.target.checked)}
          />
          <label htmlFor="containsExperts">Does this event contain experts?</label>
        </div>
        <div>
          <label>
              Categories (Select all that apply):
              <div className="category-checkboxes">
                {availableCategories.map(category => (
                  <div key={category.value} className="category-checkbox">
                    <input
                      type="checkbox"
                      id={category.value}
                      checked={formData.category.includes(category.value)}
                      onChange={() => handleCategoryChange(category.value)}
                    />
                    <label htmlFor={category.value}>{category.label}</label>
                  </div>
                ))}
                <div className="category-checkbox">
                  <input
                    type="checkbox"
                    id="other-category"
                    checked={!!otherCategory || !!customCategory}
                    onChange={e => {
                      if (!e.target.checked) {
                        setOtherCategory('');
                        setCustomCategory('');
                        setFormData(prev => ({ ...prev, category: prev.category.filter(cat => cat !== otherCategory && cat !== customCategory) }));
                      } else {
                        setOtherCategory(' '); // trigger input to show
                      }
                    }}
                  />
                  <label htmlFor="other-category">Others</label>
                  {(!!otherCategory || !!customCategory) && (
                    <input
                      type="text"
                      placeholder="Enter custom category"
                      value={customCategory}
                      onChange={e => {
                        const value = e.target.value;
                        setCustomCategory(value);
                        setOtherCategory(value); // keep otherCategory in sync
                        setFormData(prev => {
                          let newCategories = prev.category.filter(cat => !availableCategories.some(c => c.value === cat));
                          if (value && !newCategories.includes(value)) {
                            newCategories = [...prev.category.filter(cat => availableCategories.some(c => c.value === cat)), value];
                          } else if (!value) {
                            newCategories = prev.category.filter(cat => availableCategories.some(c => c.value === cat));
                          }
                          return { ...prev, category: newCategories };
                        });
                      }}
                      style={{ marginLeft: 8 }}
                    />
                  )}
                </div>
              </div>
            </label>
        </div>

        {containsExperts && (
          <>
            
            <label>
              Select Domain Experts:
              <input
                type="text"
                placeholder="Search experts by name or email..."
                value={expertSearch}
                onChange={e => setExpertSearch(e.target.value)}
                style={{ margin: '10px 0', padding: '8px', width: '100%', borderRadius: '6px', border: '1px solid #ccc' }}
              />
              {loadingExperts ? (
                <span>Loading experts...</span>
              ) : (
                <div className="experts-checkboxes">
                  {displayedExperts.length === 0 ? (
                    <span className="no-experts">No available experts for this category/time</span>
                  ) : (
                    displayedExperts.map(expert => (
                      <div key={expert._id} className="expert-checkbox">
                        <input
                          type="checkbox"
                          id={`expert-${expert._id}`}
                          checked={formData.booked_experts.includes(expert._id)}
                          onChange={() => {
                            const updatedExperts = formData.booked_experts.includes(expert._id)
                              ? formData.booked_experts.filter(id => id !== expert._id)
                              : [...formData.booked_experts, expert._id];
                            setFormData(prev => ({ ...prev, booked_experts: updatedExperts }));
                          }}
                        />
                        <label htmlFor={`expert-${expert._id}`}>
                          <div className="expert-info">
                            <span className="expert-name">{expert.name}</span>
                            <span className="expert-email">({expert.email})</span>
                          </div>
                        </label>
                      </div>
                    ))
                  )}
                </div>
              )}
            </label>
          </>
        )}
        <label>
          Resource URLs (optional):
          {formData.urls && formData.urls.map((url, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', marginBottom: 6 }}>
              <input
                type="url"
                name={`url-${idx}`}
                value={url}
                onChange={e => handleUrlChange(idx, e.target.value)}
                placeholder="https://example.com/resource.pdf"
                style={{ flex: 1, marginRight: 8 }}
              />
              {formData.urls.length > 1 && (
                <button type="button" onClick={() => handleRemoveUrl(idx)} style={{ color: 'red', fontWeight: 'bold', border: 'none', background: 'none', cursor: 'pointer' }}>✖</button>
              )}
            </div>
          ))}
          <button type="button" onClick={handleAddUrl} style={{ marginTop: 4, background: '#eee', border: '1px solid #ccc', borderRadius: 4, padding: '4px 10px', cursor: 'pointer' }}>Add URL</button>
        </label>
        <button type="button" onClick={() => setShowRegFormEditor(true)} style={{ marginBottom: 16 }}>
          Edit Registration Form
        </button>
        <button type="submit">Create Event</button>
      </form>
      {/* Registration Form Editor Modal */}
      {showRegFormEditor && (
        <div className="modal">
          <div className="modal-content">
            <h3>Edit Registration Form</h3>
            {registrationFormConfig.map((field, idx) => (
              <div key={field.name + idx} style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                <label>Field Name:
                  <input
                    type="text"
                    value={field.name}
                    onChange={e => {
                      const newConfig = [...registrationFormConfig];
                      newConfig[idx].name = e.target.value;
                      setRegistrationFormConfig(newConfig);
                    }}
                    style={{ width: 100 }}
                    required
                  />
                </label>
                <label>Field Label:
                  <input
                    type="text"
                    value={field.label}
                    onChange={e => {
                      const newConfig = [...registrationFormConfig];
                      newConfig[idx].label = e.target.value;
                      setRegistrationFormConfig(newConfig);
                    }}
                    style={{ width: 120 }}
                    required
                  />
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={field.required}
                    onChange={e => {
                      const newConfig = [...registrationFormConfig];
                      newConfig[idx].required = e.target.checked;
                      setRegistrationFormConfig(newConfig);
                    }}
                  /> Required
                </label>
                {registrationFormConfig.length > 1 && (
                  <button type="button" onClick={() => {
                    setRegistrationFormConfig(registrationFormConfig.filter((_, i) => i !== idx));
                  }} style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer' }}>✕</button>
                )}
              </div>
            ))}
            <button type="button" onClick={() => setRegistrationFormConfig([...registrationFormConfig, { name: '', label: '', required: false }])} style={{ marginBottom: 16 }}>
              + Add Field
            </button>
            <br />
            <button onClick={() => setShowRegFormEditor(false)}>Done</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateEvent;
