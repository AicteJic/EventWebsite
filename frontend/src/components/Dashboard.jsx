import { useEffect, useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import aicteLogo from '../assets/aicte_logo.png';
import './Dashboard.css';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ConfirmationBox from './ConfirmationBox';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api';

const Dashboard = () => {
  const { user } = useUser();
  const [userType, setUserType] = useState('');
  const [requests, setRequests] = useState([]);
  const [users, setUsers] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [sessionStats, setSessionStats] = useState({
    totalSessions: 0,
    publishedSessions: 0,
    completedSessions: 0,
    draftSessions: 0
  });
  const [view, setView] = useState('users');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editDetails, setEditDetails] = useState({
    name: user?.name || '',
    email: user?.email || '',
    mobileNumber: user?.mobileNumber || '',
    address: user?.address || '',
    gender: user?.gender || '',
    organization: user?.organization || '',
    role: user?.role || '',
    locationOfWork: user?.locationOfWork || '',
    dateOfBirth: user?.dateOfBirth || '',
    linkedinProfile: user?.linkedinProfile || '',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [expertBookings, setExpertBookings] = useState([]);
  const [logs, setLogs] = useState([]); // For admin logs view
  const [confirmBox, setConfirmBox] = useState({ isOpen: false, title: '', message: '', onConfirm: null, danger: false });
  const navigate = useNavigate();
  const location = useLocation();
  const [editingMessageIdx, setEditingMessageIdx] = useState(null);
  const [editedMessage, setEditedMessage] = useState('');
  const [savingMessage, setSavingMessage] = useState(false);
  const [expertRequests, setExpertRequests] = useState([]);
  const [isExpertRequestModalOpen, setIsExpertRequestModalOpen] = useState(false);
  const [editingExpertRequest, setEditingExpertRequest] = useState(null);
  const [availableExperts, setAvailableExperts] = useState([]);
  const [selectedExperts, setSelectedExperts] = useState([]);
  const [expertSearchTerm, setExpertSearchTerm] = useState('');
  // Add a state to cache expert details by ID
  const [expertDetailsCache, setExpertDetailsCache] = useState({});
  const [messages, setMessages] = useState([]);
  const [replyModal, setReplyModal] = useState({ open: false, messageId: null, reply: '' });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    setUserType(user.userType);
  }, [user, navigate]);

  // Check URL parameters for view
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const viewParam = urlParams.get('view');
    if (viewParam && ['users', 'experts', 'requests', 'logs', 'requestsforexperts', 'messages'].includes(viewParam)) {
      setView(viewParam);
    }
  }, [location.search]);

  // Fetch users for admin
  const fetchUsers = async (userType) => {
    try {
      const response = await fetch(`${BACKEND_URL}api/auth/users?userType=${userType}`);
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  // Fetch requests for admin or user
  const fetchRequests = async () => {
    try {
      if (userType === 'admin' || userType === 'super_admin') {
        const response = await fetch(`${BACKEND_URL}api/requests/all-requests`);
        const data = await response.json();
        setRequests(data);
      } else {
        const id = localStorage.getItem('userId');
        const response = await fetch(`${BACKEND_URL}api/requests/${id}`);
        const data = await response.json();
        setRequests(data);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
    }
  };

  // Fetch logs for admin
  const fetchLogs = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const response = await fetch(`${BACKEND_URL}api/logs`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setLogs(data);
      } else {
        setLogs([]);
      }
    } catch (error) {
      setLogs([]);
    }
  };

  const fetchExpertRequests = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}api/requestforexperts`);
      const data = await response.json();
      setExpertRequests(data);
    } catch (error) {
      setExpertRequests([]);
    }
  };

  const fetchAvailableExperts = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}api/auth/users?userType=domain_expert`);
      const data = await response.json();
      setAvailableExperts(data);
      
      // Set predefined domains
      // setAllDomains(['ip_consultancy', 'company_registration', 'mentoring', 'expert_guidance']); // Removed
    } catch (error) {
      console.error('Error fetching experts:', error);
      setAvailableExperts([]);
      // setAllDomains(['ip_consultancy', 'company_registration', 'mentoring', 'expert_guidance']); // Removed
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}api/messages`);
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      setMessages([]);
    }
  };

  useEffect(() => {
    if (userType === 'admin' || userType === 'super_admin') {
      if (view === 'users') {
        fetchUsers('normal');
      } else if (view === 'experts') {
        fetchUsers('domain_expert');
      } else if (view === 'requests') {
        fetchRequests();
      } else if (view === 'logs') {
        fetchLogs();
      } else if (view === 'requestsforexperts') {
        fetchExpertRequests();
      } else if (view === 'messages') {
        fetchMessages();
      }
    } else {
      fetchRequests();
    }

    // Fetch user details for all user types
    const fetchUserDetails = async () => {
      try {
        const id = localStorage.getItem('userId');
        const response = await fetch(`${BACKEND_URL}api/auth/user-details/${id}`);
        const data = await response.json();
        console.log('User Details:', data);
      } catch (error) {
        console.error('Error fetching user details:', error);
      }
    };

    fetchUserDetails();
  }, [userType, view]);

  useEffect(() => {
    if (userType === 'domain_expert') {
      fetchExpertBookings();
    }
  }, [userType]);

  const fetchExpertBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const response = await fetch(`${BACKEND_URL}api/slots/bookings-for-expert`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setExpertBookings(data);
      } else {
        setExpertBookings([]);
      }
    } catch (error) {
      setExpertBookings([]);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const applyForServiceProvider = async () => {
    try {
      const newRequest = {
        userEmail: user.email,
        requested_user_type: 'service_provider',
      };
      const response = await fetch(`${BACKEND_URL}api/requests/${user.id}` , {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRequest),
      });
      if (response.ok) {
        toast.success('Request submitted successfully!');
        fetchRequests();
      } else {
        console.error('Error submitting request:', await response.text());
      }
    } catch (error) {
      console.error('Error submitting request:', error);
    }
  };

  const deleteRequest = async (id) => {
    try {
      const response = await fetch(`${BACKEND_URL}api/requests/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      if (response.ok) {
        toast.success('Request deleted successfully!');
        fetchRequests();
      } else {
        console.error('Error deleting request:', await response.text());
      }
    } catch (error) {
      console.error('Error deleting request:', error);
    }
  };

  const handleAccept = async (requestId, userId) => {
    try {
      const response = await fetch(`${BACKEND_URL}api/requests/${requestId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'approved' })
      });
      
      if (response.ok) {
        toast.success('Request approved and user type updated successfully!');
        fetchRequests();
      } else {
        toast.error('Failed to approve request');
      }
    } catch (error) {
      console.error('Error approving request:', error);
      toast.error('Error approving request');
    }
  };

  const handleReject = async (requestId) => {
    try {
      const response = await fetch(`${BACKEND_URL}api/requests/${requestId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'rejected' })
      });
      
      if (response.ok) {
        toast.success('Request rejected successfully!');
        fetchRequests();
      } else {
        toast.error('Failed to reject request');
      }
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast.error('Error rejecting request');
    }
  };

  const handleExpertRequestAction = async (requestId, action) => {
    try {
      if (action === 'edit') {
        const request = expertRequests.find(req => req._id === requestId);
        if (request) {
          setEditingExpertRequest({
            ...request,
            date: new Date(request.date).toISOString().split('T')[0]
          });
          await fetchAvailableExperts();
          // Set selectedExperts to assignedExperts (as IDs)
          setSelectedExperts(
            Array.isArray(request.assignedExperts)
              ? request.assignedExperts.map(expert =>
                  typeof expert === 'object' && expert !== null ? expert._id : expert
                )
              : []
          );
          setIsExpertRequestModalOpen(true);
        }
      }
    } catch (error) {
      console.error('Error handling expert request action:', error);
      toast.error('An error occurred while processing the request');
    }
  };

  const handleEdit = async (updatedDetails) => {
    try {
      const response = await fetch(`${BACKEND_URL}api/auth/user-details/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedDetails),
      });
      if (response.ok) {
        toast.success('User details updated successfully!');
        // Optionally, refetch user details to update the UI
        const updatedUser = await response.json();
        console.log('Updated User:', updatedUser);
      } else {
        console.error('Error updating user details:', await response.text());
      }
    } catch (error) {
      console.error('Error updating user details:', error);
    }
  };

  const formatUserType = (type) => {
    if (!type) return '';
    return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const openEditModal = () => {
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditDetails((prevDetails) => ({ ...prevDetails, [name]: value }));
  };

  const saveChanges = () => {
    handleEdit(editDetails);
    closeEditModal();
  };

  const navigateToDomainExpertForm = () => {
    navigate('/apply-for-domain-expert');
  };

  const handleExpertRequestInputChange = (e) => {
    const { name, value } = e.target;
    setEditingExpertRequest(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleExpertRequestSave = async () => {
    try {
      const token = localStorage.getItem('token');
      const updatedData = {
        ...editingExpertRequest,
        assignedExperts: selectedExperts // Store multiple selected experts
      };
      
      const response = await fetch(`${BACKEND_URL}api/requestforexperts/${editingExpertRequest._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedData)
      });

      if (response.ok) {
        toast.success('Expert request updated successfully');
        setIsExpertRequestModalOpen(false);
        setEditingExpertRequest(null);
        setSelectedExperts([]);
        fetchExpertRequests();
      } else {
        toast.error('Failed to update expert request');
      }
    } catch (error) {
      console.error('Error updating expert request:', error);
      toast.error('An error occurred while updating the request');
    }
  };

  const closeExpertRequestModal = () => {
    setIsExpertRequestModalOpen(false);
    setEditingExpertRequest(null);
    setSelectedExperts([]);
  };

  const handleExpertSelection = (expertId) => {
    setSelectedExperts(prev => {
      if (prev.includes(expertId)) {
        return prev.filter(id => id !== expertId);
      } else {
        return [...prev, expertId];
      }
    });
  };

  const getFilteredExperts = () => {
    if (!expertSearchTerm.trim()) return availableExperts;
    const term = expertSearchTerm.trim().toLowerCase();
    return availableExperts.filter(expert =>
      (expert.name && expert.name.toLowerCase().includes(term)) ||
      (expert.email && expert.email.toLowerCase().includes(term)) ||
      (expert.Domain && expert.Domain.toLowerCase().includes(term))
    );
  };

  const getDomainDisplayName = (domain) => {
    const domainNames = {
      'ip_consultancy': 'IP Consultancy',
      'company_registration': 'Company Registration',
      'mentoring': 'Mentoring',
      'expert_guidance': 'Expert Guidance'
    };
    return domainNames[domain] || domain;
  };

  // Filtered data based on search term
  const filteredUsers = users.filter(
    (user) =>
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.mobileNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const filteredRequests = requests.filter(
    (request) =>
      request.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.requested_user_type?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const filteredLogs = logs.filter((log) => {
    const search = searchTerm.toLowerCase();
    return (
      (log.userId?.name && log.userId.name.toLowerCase().includes(search)) ||
      (log.userId?.email && log.userId.email.toLowerCase().includes(search)) ||
      (log.action && log.action.toLowerCase().includes(search)) ||
      (typeof log.details === 'object' && log.details !== null &&
        Object.values(log.details).some(v => String(v).toLowerCase().includes(search)))
    );
  });

  // Helper to fetch expert details by ID if not already cached (updated to include domain)
  const fetchExpertDetailsById = async (id) => {
    if (!id || expertDetailsCache[id]) return;
    try {
      const response = await fetch(`${BACKEND_URL}api/auth/user-details/${id}`);
      if (response.ok) {
        const data = await response.json();
        setExpertDetailsCache(prev => ({ ...prev, [id]: data }));
      }
    } catch (error) {
      // ignore
    }
  };

  const [isExpertEditModalOpen, setIsExpertEditModalOpen] = useState(false);
  const [isAddExpertModalOpen, setIsAddExpertModalOpen] = useState(false);
  const [editingExpert, setEditingExpert] = useState(null);
  const [addingExpert, setAddingExpert] = useState(false);
  const [isSubmittingExpert, setIsSubmittingExpert] = useState(false);

  const openExpertEditModal = (expertId) => {
    setEditingExpert(expertId);
    setIsExpertEditModalOpen(true);
  };

  const closeExpertEditModal = () => {
    setIsExpertEditModalOpen(false);
    setEditingExpert(null);
  };

  const openAddExpertModal = () => {
    setAddingExpert(true);
    setIsAddExpertModalOpen(true);
  };

  const closeAddExpertModal = () => {
    setIsAddExpertModalOpen(false);
    setAddingExpert(false);
  };

  const handleExpertEditSave = async () => {
    if (!editingExpert) return;
    setIsSubmittingExpert(true);
    try {
      const response = await fetch(`${BACKEND_URL}api/auth/user-details/${editingExpert._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingExpert),
      });
      const data = await response.json();
      if (response.ok) {
        toast.success('Expert updated successfully');
        setIsEditExpertModalOpen(false);
        fetchUsers('domain_expert');
      } else {
        toast.error(data.error || 'Failed to update expert details');
      }
    } catch (err) {
      toast.error('Failed to update expert details');
    }
    setIsSubmittingExpert(false);
  };

  const handleAddExpertSave = async () => {
    if (!addingExpert) return;
    setIsSubmittingExpert(true);
    try {
      const response = await fetch(`${BACKEND_URL}api/auth/user-details`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addingExpert),
      });
      const data = await response.json();
      if (response.ok) {
        toast.success('Expert added successfully');
        setIsAddExpertModalOpen(false);
        fetchUsers('domain_expert');
      } else {
        toast.error(data.error || 'Failed to add expert');
      }
    } catch (err) {
      toast.error('Failed to add expert');
    }
    setIsSubmittingExpert(false);
  };

  const handleOpenReplyModal = (msg) => {
    setReplyModal({ open: true, messageId: msg._id, reply: msg.reply || '' });
  };
  const handleCloseReplyModal = () => {
    setReplyModal({ open: false, messageId: null, reply: '' });
  };
  const handleReplyChange = (e) => {
    setReplyModal((prev) => ({ ...prev, reply: e.target.value }));
  };
  const handleReplySubmit = async () => {
    if (!replyModal.reply.trim()) {
      toast.error('Reply cannot be empty!');
      return;
    }
    try {
      const response = await fetch(`${BACKEND_URL}api/messages/${replyModal.messageId}/reply`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reply: replyModal.reply })
      });
      if (response.ok) {
        toast.success('Reply sent!');
        fetchMessages();
        handleCloseReplyModal();
      } else {
        toast.error('Failed to send reply.');
      }
    } catch (err) {
      toast.error('Failed to send reply.');
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        <div className="user-info-card">
        <h2>Dashboard</h2>
        <div className="user-type-badge">
            {/* <span className="badge-label">User Type:</span> */}
            <span className={`badge ${userType}`}>{formatUserType(userType) + ' Controls' }</span>
          </div>
          {/* 
          
          <div className="user-details">
            <h3>Details:</h3>
            <p><strong>Name:</strong> {user?.name}</p>
            <p><strong>Email:</strong> {user?.email}</p>
            <p><strong>Mobile:</strong> {user?.mobileNumber}</p>
            <p><strong>Address:</strong> {user?.address}</p>
            <p><strong>Gender:</strong> {user?.gender}</p>
            <p><strong>Organization:</strong> {user?.organization}</p>
            <p><strong>Role:</strong> {user?.role}</p>
            <p><strong>Location of Work:</strong> {user?.locationOfWork}</p>
            <p><strong>Date of Birth:</strong> {user?.dateOfBirth}</p>
            <p><strong>LinkedIn Profile:</strong> <a href={user?.linkedinProfile} target="_blank" rel="noopener noreferrer">{user?.linkedinProfile}</a></p>
            <button className="edit-button" onClick={openEditModal}>Edit</button>
           </div> */}

          {(userType === 'admin' || userType === 'super_admin') && (
            <div className="view-toggle">
              <label className={view === 'users' ? 'selected' : ''}>
                <input type="radio" name="view" value="users" checked={view === 'users'} onChange={() => setView('users')} /> Users
              </label>
              <label className={view === 'experts' ? 'selected' : ''}>
                <input type="radio" name="view" value="experts" checked={view === 'experts'} onChange={() => setView('experts')} /> Experts
              </label>
              <label className={view === 'requests' ? 'selected' : ''}>
                <input type="radio" name="view" value="requests" checked={view === 'requests'} onChange={() => setView('requests')} /> Requests
              </label>
              <label className={view === 'logs' ? 'selected' : ''}>
                <input type="radio" name="view" value="logs" checked={view === 'logs'} onChange={() => setView('logs')} /> Logs
              </label>
              <label className={view === 'requestsforexperts' ? 'selected' : ''}>
                <input type="radio" name="view" value="requestsforexperts" checked={view === 'requestsforexperts'} onChange={() => setView('requestsforexperts')} /> Requests for Expert
              </label>
              <label className={view === 'messages' ? 'selected' : ''}>
                <input type="radio" name="view" value="messages" checked={view === 'messages'} onChange={() => setView('messages')} /> Messages
              </label>
            </div>
          )}
          {/* Search bar for tables */}
          {(userType === 'admin' || userType === 'super_admin') && (
            <div style={{ margin: '16px 0', display: 'flex', justifyContent: 'center' }}>
              <input
                type="text"
                placeholder={`Search ${view}`}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="dashboard-search-bar"
              />
            </div>
          )}
          {userType === 'normal' && (
            <div className="dashboard-actions">
              <button onClick={fetchRequests} className="nav-button">View Requests</button>
            </div>
          )}
          {userType === 'domain_expert' && (
            <div className="my-bookings-section">
              <div className="sessions-header">
                <h3>My Bookings</h3>
                <button className="create-session-btn" onClick={() => navigate('/create-session')}>
                  <span className="btn-icon">+</span>
                  Create New Session
                </button>
              </div>
              {expertBookings.length === 0 ? (
                <p>No bookings yet.</p>
              ) : (
                <div className="my-bookings-table-responsive">
                  <table className="my-bookings-table">
                    <thead>
                      <tr>
                        <th>User Name</th>
                        <th>User Email</th>
                        <th>Date</th>
                        <th>Time Slot</th>
                        <th>Status</th>
                        <th>Action</th>
                        <th>Meeting Link</th>
                      </tr>
                    </thead>
                    <tbody>
                      {expertBookings.map((booking, idx) => (
                        <tr key={idx}>
                          <td data-label="User Name">{booking.user?.name || 'N/A'}</td>
                          <td data-label="User Email">{booking.user?.email || 'N/A'}</td>
                          <td data-label="Date">{booking.date}</td>
                          <td data-label="Time Slot">{booking.startTime} - {booking.endTime}</td>
                          <td data-label="Status">
                            <span style={{
                              color: booking.isAccepted ? 'green' : booking.isRejected ? 'red' : 'orange',
                              fontWeight: 600
                            }}>
                              {booking.isAccepted
                                ? 'Accepted'
                                : booking.isRejected
                                ? 'Rejected'
                                : 'Pending'}
                            </span>
                          </td>
                          <td data-label="Action">
                            {!booking.isAccepted && !booking.isRejected && (
                              <>
                                <button
                                  style={{
                                    marginRight: 8,
                                    background: '#27ae60',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: 4,
                                    padding: '6px 14px',
                                    cursor: 'pointer',
                                    fontWeight: 600,
                                    transition: 'background 0.2s',
                                  }}
                                  onMouseOver={e => (e.currentTarget.style.background = '#219150')}
                                  onMouseOut={e => (e.currentTarget.style.background = '#27ae60')}
                                  onClick={() => {
                                    setConfirmBox({
                                      isOpen: true,
                                      title: 'Accept Booking',
                                      message: 'Are you sure you want to accept this booking?',
                                      onConfirm: async () => {
                                        const token = localStorage.getItem('token');
                                        await fetch(`${BACKEND_URL}api/slots/booking-status`, {
                                          method: 'POST',
                                          headers: {
                                            'Content-Type': 'application/json',
                                            'Authorization': `Bearer ${token}`
                                          },
                                          body: JSON.stringify({
                                            date: booking.date,
                                            startTime: booking.startTime,
                                            endTime: booking.endTime,
                                            userId: booking.userId,
                                            isAccepted: true,
                                            isRejected: false
                                          })
                                        });
                                        fetchExpertBookings();
                                        setConfirmBox(prev => ({ ...prev, isOpen: false }));
                                      },
                                      danger: false
                                    });
                                  }}
                                >
                                  Accept
                                </button>
                                <button
                                  style={{
                                    background: '#e74c3c',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: 4,
                                    padding: '6px 14px',
                                    cursor: 'pointer',
                                    fontWeight: 600,
                                    transition: 'background 0.2s',
                                  }}
                                  onMouseOver={e => (e.currentTarget.style.background = '#c0392b')}
                                  onMouseOut={e => (e.currentTarget.style.background = '#e74c3c')}
                                  onClick={() => {
                                    setConfirmBox({
                                      isOpen: true,
                                      title: 'Reject Booking',
                                      message: 'Are you sure you want to reject this booking?',
                                      onConfirm: async () => {
                                        const token = localStorage.getItem('token');
                                        await fetch(`${BACKEND_URL}api/slots/booking-status`, {
                                          method: 'POST',
                                          headers: {
                                            'Content-Type': 'application/json',
                                            'Authorization': `Bearer ${token}`
                                          },
                                          body: JSON.stringify({
                                            date: booking.date,
                                            startTime: booking.startTime,
                                            endTime: booking.endTime,
                                            userId: booking.userId,
                                            isAccepted: false,
                                            isRejected: true
                                          })
                                        });
                                        fetchExpertBookings();
                                        setConfirmBox(prev => ({ ...prev, isOpen: false }));
                                      },
                                      danger: true
                                    });
                                  }}
                                >
                                  Reject
                                </button>
                              </>
                            )}
                          </td>
                          <td data-label="Message">
                            {editingMessageIdx === idx ? (
                              <div className="message-edit-row" style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                                <input
                                  type="text"
                                  value={editedMessage}
                                  onChange={e => setEditedMessage(e.target.value)}
                                  style={{ minWidth: 120, flex: '1 1 120px', maxWidth: '100%' }}
                                  disabled={savingMessage}
                                />
                                <button
                                className='action-btn approve-btn'
                                  onClick={async () => {
                                    setSavingMessage(true);
                                    try {
                                      const token = localStorage.getItem('token');
                                      const res = await fetch(`${BACKEND_URL}api/slots/edit-message`, {
                                        method: 'PUT',
                                        headers: {
                                          'Content-Type': 'application/json',
                                          'Authorization': `Bearer ${token}`
                                        },
                                        body: JSON.stringify({
                                          date: booking.date,
                                          startTime: booking.startTime,
                                          endTime: booking.endTime,
                                          message: editedMessage
                                        })
                                      });
                                      if (res.ok) {
                                        toast.success('Meeting link updated!');
                                        setEditingMessageIdx(null);
                                        setEditedMessage('');
                                        fetchExpertBookings();
                                      } else {
                                        const data = await res.json();
                                        toast.error(data.error || 'Failed to update meeting link');
                                      }
                                    } catch (err) {
                                      toast.error('Failed to update meeting link');
                                    }
                                    setSavingMessage(false);
                                  }}
                                  disabled={savingMessage}
                                  // style={{ marginLeft: 4, marginTop: 4, flex: '0 0 auto' }}
                                >
                                  Save
                                </button>
                                <button
                                className="action-btn reject-btn"
                                  onClick={() => {
                                    setEditingMessageIdx(null);
                                    setEditedMessage('');
                                  }}
                                  disabled={savingMessage}
                                  style={{ marginLeft: 4, marginTop: 4, flex: '0 0 auto' }}
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                                <span>{booking.message || <span style={{ color: '#aaa' }}>Add link</span>}</span>
                                <button
                                className="message-edit-btn"
                                  onClick={() => {
                                    setEditingMessageIdx(idx);
                                    setEditedMessage(booking.message || '');
                                  }}
                                  // style={{ marginLeft: 4, fontSize: 12, padding: '2px 8px', marginTop: 4, flex: '0 0 auto' }}
                                >
                                  Edit
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
          {userType === 'super_admin' && (
            <div className="dashboard-actions">
              <h3>Super Admin View</h3>
              <p>Feature coming soon...</p>
            </div>
          )}
          {(userType === 'admin' || userType === 'super_admin') && (
            <div className="dashboard-content">
              {view === 'users' && (
                <div>
                  <table className="users-table">
                    <thead>
                      <tr><th>Name</th><th>Mobile Number</th><th>Email</th></tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((user) => (
                        <tr key={user._id}>
                          <td>{user.name}</td>
                          <td>{user.mobileNumber}</td>
                          <td>{user.email}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {view === 'experts' && (
                <div>
                  <table className="experts-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Mobile Number</th>
                        <th>Email</th>
                        <th>Domain</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((user) => {
                        // Fetch domain if not present
                        const userId = user._id;
                        if (!user.Domain) fetchExpertDetailsById(userId);
                        const details = expertDetailsCache[userId] || user;
                        return (
                          <tr key={userId}>
                            <td>{user.name}</td>
                            <td>{user.mobileNumber}</td>
                            <td>{user.email}</td>
                            <td>{details.Domain || 'No domain'}</td>
                            <td>
                              <button className="action-btn edit-btn" onClick={() => openExpertEditModal(userId)}>Edit</button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  <button className="add-expert-btn" onClick={openAddExpertModal}>Add Expert</button>
                </div>
              )}
              {view === 'requests' && (
                <div>
                  <table className="requests-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Mobile</th>
                        <th>Organization</th>
                        <th>Role</th>
                        <th>Requested Type</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRequests.map((request) => (
                        <tr key={request._id}>
                          <td>{request.name}</td>
                          <td>{request.userEmail}</td>
                          <td>{request.mobileNumber}</td>
                          <td>{request.organization}</td>
                          <td>{request.role}</td>
                          <td>{request.requested_user_type}</td>
                          <td>
                            <span className={`status-badge ${request.status}`}>
                              {request.status}
                            </span>
                          </td>
                          <td>
                            {request.status === 'pending' && (
                              <div className="action-buttons">
                                <button 
                                  onClick={() => handleAccept(request._id, request.userId)} 
                                  className="action-btn approve-btn"
                                >
                                  Approve
                                </button>
                                <button 
                                  onClick={() => handleReject(request._id)} 
                                  className="action-btn reject-btn"
                                >
                                  Reject
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {view === 'logs' && (
                <div>
                  <h3>System Logs</h3>
                  <table className="logs-table">
                    <thead>
                      <tr>
                        <th>Timestamp</th>
                        <th>User</th>
                        <th>Action</th>
                        <th>Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredLogs.length === 0 ? (
                        <tr><td colSpan="4">No logs found.</td></tr>
                      ) : (
                        filteredLogs.map((log) => (
                          <tr key={log._id}>
                            <td>{new Date(log.timestamp).toLocaleString()}</td>
                            <td>{
                              log.userId && typeof log.userId === 'object'
                                ? `${log.userId.name || log.userId.email || log.userId._id || 'N/A'} (${log.userId._id || 'N/A'})`
                                : log.userId || 'N/A'
                            }</td>
                            <td>{log.action}</td>
                            <td>{
                              typeof log.details === 'object' && log.details !== null
                                ? Object.entries(log.details).map(([k, v]) => `${k}: ${v}`).join(', ')
                                : String(log.details)
                            }</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
              {view === 'requestsforexperts' && (
                <div className="expert-requests-table-container">
                  <h3>Requests for Expert</h3>
                  <table className="expert-requests-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Mobile</th>
                        <th>Organization</th>
                        <th>Domains</th>
                        <th>Experts Selected</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {expertRequests.length === 0 ? (
                        <tr><td colSpan="7">No requests found.</td></tr>
                      ) : (
                        expertRequests.map((req, idx) => (
                          <tr key={req._id || idx}>
                            <td>{req.name}</td>
                            <td>{req.email}</td>
                            <td>{req.mobile}</td>
                            <td>{req.institute}</td>
                            <td>{Array.isArray(req.domains) ? req.domains.join(', ') : req.domains}</td>
                            <td>
                              {Array.isArray(req.assignedExperts) && req.assignedExperts.length > 0
                                ? req.assignedExperts.map(expert => {
                                    if (typeof expert === 'object' && expert !== null) {
                                      return `${expert.name || expert.email || expert._id} (${expert.Domain || 'No domain'})`;
                                    } else if (typeof expert === 'string') {
                                      // If only ID is present, fetch details and show loading
                                      fetchExpertDetailsById(expert);
                                      const details = expertDetailsCache[expert];
                                      return details
                                        ? `${details.name || details.email || expert} (${details.Domain || 'No domain'})`
                                        : 'Loading...';
                                    } else {
                                      return '';
                                    }
                                  }).join(', ')
                                : 'None'}
                            </td>
                            <td>
                              <button 
                                onClick={() => handleExpertRequestAction(req._id, 'edit')} 
                                className="action-btn edit-btn"
                                title="Edit Request"
                              >
                                ✏️
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
              {view === 'messages' && (
                <div className="messages-table-container">
                  <h3>Contact Messages</h3>
                  <table className="messages-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Subject</th>
                        <th>Message</th>
                        <th>Date</th>
                        <th>Reply</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {messages.length === 0 ? (
                        <tr><td colSpan="7">No messages found.</td></tr>
                      ) : (
                        messages.map((msg) => (
                          <tr key={msg._id}>
                            <td>{msg.name}</td>
                            <td>{msg.email}</td>
                            <td>{msg.subject}</td>
                            <td>{msg.message}</td>
                            <td>{new Date(msg.createdAt).toLocaleString()}</td>
                            <td>{msg.reply || <span style={{ color: '#aaa' }}>No reply</span>}</td>
                            <td>
                              <button className="action-btn edit-btn" onClick={() => handleOpenReplyModal(msg)}>
                                {msg.reply ? 'Edit/Send Reply' : 'Reply'}
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                  {replyModal.open && (
                    <div className="modal">
                      <div className="modal-content">
                        <h3>Reply to Message</h3>
                        <textarea
                          value={replyModal.reply}
                          onChange={handleReplyChange}
                          rows={5}
                          style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ccc', marginBottom: 16 }}
                          placeholder="Type your reply here..."
                        />
                        <div className="modal-actions">
                          <button className="save-btn" onClick={handleReplySubmit}>Send Reply</button>
                          <button className="cancel-btn" onClick={handleCloseReplyModal}>Cancel</button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      {userType === 'normal' && (
        <div className="requests-section">
          <h3>My Requests</h3>
          {requests.length === 0 ? (
            <p className="no-requests">No requests found.</p>
          ) : (
            <div className="requests-table-container">
              <table className="requests-table">
                <thead>
                  <tr>
                    <th>Request Type</th>
                    <th>Status</th>
                    <th>Applied Date</th>
                    {/* <th>Actions</th> */}
                  </tr>
                </thead>
                <tbody>
                  {requests.map((request) => (
                    <tr key={request._id}>
                      <td>
                        <span className="request-type">
                          {request.requested_user_type === 'domain_expert' ? 'Domain Expert' : 
                           request.requested_user_type === 'service_provider' ? 'Service Provider' : 
                           request.requested_user_type}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${request.status}`}>
                          {request.status}
                        </span>
                      </td>
                      <td>
                        {new Date(request.createdAt).toLocaleDateString()}
                      </td>
                      {/* <td>
                        <button 
                          onClick={() => deleteRequest(request._id)} 
                          className="delete-btn"
                        >
                          Delete
                        </button>
                      </td> */}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
      {isEditModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h3>Edit User Details</h3>
            <label>
              Name:
              <input
                type="text"
                name="name"
                value={editDetails.name || ''}
                onChange={handleInputChange}
              />
            </label>
            <label>
              Email:
              <input
                type="email"
                name="email"
                value={editDetails.email || ''}
                onChange={handleInputChange}
              />
            </label>
            <label>
              Mobile Number:
              <input
                type="text"
                name="mobileNumber"
                value={editDetails.mobileNumber || ''}
                onChange={handleInputChange}
              />
            </label>
            <label>
              Address:
              <input
                type="text"
                name="address"
                value={editDetails.address || ''}
                onChange={handleInputChange}
              />
            </label>
            <label>
              Gender:
              <input
                type="text"
                name="gender"
                value={editDetails.gender || ''}
                onChange={handleInputChange}
              />
            </label>
            <label>
              Organization:
              <input
                type="text"
                name="organization"
                value={editDetails.organization || ''}
                onChange={handleInputChange}
              />
            </label>
            <label>
              Role:
              <input
                type="text"
                name="role"
                value={editDetails.role || ''}
                onChange={handleInputChange}
              />
            </label>
            <label>
              Location of Work:
              <input
                type="text"
                name="locationOfWork"
                value={editDetails.locationOfWork || ''}
                onChange={handleInputChange}
              />
            </label>
            <label>
              Date of Birth:
              <input
                type="date"
                name="dateOfBirth"
                value={editDetails.dateOfBirth ? new Date(editDetails.dateOfBirth).toISOString().split('T')[0] : ''}
                onChange={handleInputChange}
              />
            </label>
            <label>
              LinkedIn Profile:
              <input
                type="url"
                name="linkedinProfile"
                value={editDetails.linkedinProfile || ''}
                onChange={handleInputChange}
              />
            </label>
            <button onClick={saveChanges}>Save</button>
            <button onClick={closeEditModal}>Cancel</button>
          </div>
        </div>
      )}
      {isExpertRequestModalOpen && editingExpertRequest && (
        <div className="modal">
          <div className="modal-content expert-request-modal">
            <h3>Edit Expert Request</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Name:</label>
                <input
                  type="text"
                  name="name"
                  value={editingExpertRequest.name || ''}
                  onChange={handleExpertRequestInputChange}
                />
              </div>
              <div className="form-group">
                <label>Email:</label>
                <input
                  type="email"
                  name="email"
                  value={editingExpertRequest.email || ''}
                  onChange={handleExpertRequestInputChange}
                />
              </div>
              <div className="form-group">
                <label>Mobile:</label>
                <input
                  type="text"
                  name="mobile"
                  value={editingExpertRequest.mobile || ''}
                  onChange={handleExpertRequestInputChange}
                />
              </div>
              <div className="form-group">
                <label>Institute/Organization:</label>
                <input
                  type="text"
                  name="institute"
                  value={editingExpertRequest.institute || ''}
                  onChange={handleExpertRequestInputChange}
                />
              </div>
              <div className="form-group">
                <label>Date:</label>
                <input
                  type="date"
                  name="date"
                  value={editingExpertRequest.date || ''}
                  readOnly
                  disabled
                />
              </div>
              <div className="form-group">
                <label>Time:</label>
                <input
                  type="time"
                  name="time"
                  value={editingExpertRequest.time || ''}
                  readOnly
                  disabled
                />
              </div>
              <div className="form-group full-width">
                <label>Domains (comma-separated):</label>
                <input
                  type="text"
                  name="domains"
                  value={Array.isArray(editingExpertRequest.domains) ? editingExpertRequest.domains.join(', ') : editingExpertRequest.domains || ''}
                  onChange={(e) => {
                    const domains = e.target.value.split(',').map(d => d.trim()).filter(d => d);
                    setEditingExpertRequest(prev => ({
                      ...prev,
                      domains: domains
                    }));
                  }}
                />
              </div>
              <div className="form-group full-width">
                <label>Description:</label>
                <textarea
                  name="description"
                  value={editingExpertRequest.description || ''}
                  onChange={handleExpertRequestInputChange}
                  rows="3"
                />
              </div>
              <div className="form-group full-width">
                <label>Search Experts:</label>
                <input
                  type="text"
                  placeholder="Search by name, email, or domain"
                  value={expertSearchTerm}
                  onChange={e => setExpertSearchTerm(e.target.value)}
                  className="dashboard-search-bar"
                />
              </div>
              <div className="form-group full-width">
                <label>Assign Experts:</label>
                <div className="expert-checkboxes">
                  {getFilteredExperts().length === 0 ? (
                    <p className="no-experts">No experts found for your search</p>
                  ) : (
                    getFilteredExperts().map((expert) => {
                      // If expert is an ID, fetch details
                      const expertId = expert._id || expert;
                      if (!expert.name) fetchExpertDetailsById(expertId);
                      const details = expertDetailsCache[expertId] || expert;
                      return (
                        <label key={expertId} className="expert-checkbox">
                          <input
                            type="checkbox"
                            checked={selectedExperts.includes(expertId)}
                            onChange={() => handleExpertSelection(expertId)}
                          />
                          <div className="expert-info">
                            <span className="expert-name">{details.name || details.email || expertId}</span>
                            <span className="expert-domains">{details.Domain || 'No domain'}</span>
                          </div>
                        </label>
                      );
                    })
                  )}
                </div>
                {selectedExperts.length > 0 && (
                  <div className="selected-experts">
                    <strong>Selected Experts: {selectedExperts.length}</strong>
                    <ul>
                      {selectedExperts.map(expertId => {
                        const details = expertDetailsCache[expertId];
                        return (
                          <li key={expertId}>
                            {details
                              ? `${details.name || details.email || expertId} (${details.Domain || 'No domain'})`
                              : 'Loading...'}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-actions">
              <button onClick={handleExpertRequestSave} className="save-btn">Save Changes</button>
              <button onClick={closeExpertRequestModal} className="cancel-btn">Cancel</button>
            </div>
          </div>
        </div>
      )}
      {isExpertEditModalOpen && editingExpert && (
        <div className="modal">
          <div className="modal-content expert-edit-modal">
            <h3>{editingExpert ? 'Edit Expert Details' : 'Add New Expert'}</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Name:</label>
                <input
                  type="text"
                  name="name"
                  value={editingExpert ? editingExpert.name : ''}
                  onChange={(e) => setEditingExpert(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label>Email:</label>
                <input
                  type="email"
                  name="email"
                  value={editingExpert ? editingExpert.email : ''}
                  onChange={(e) => setEditingExpert(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label>Mobile Number:</label>
                <input
                  type="text"
                  name="mobileNumber"
                  value={editingExpert ? editingExpert.mobileNumber : ''}
                  onChange={(e) => setEditingExpert(prev => ({ ...prev, mobileNumber: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label>Domain:</label>
                <input
                  type="text"
                  name="Domain"
                  value={editingExpert ? editingExpert.Domain : ''}
                  onChange={(e) => setEditingExpert(prev => ({ ...prev, Domain: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label>Organization:</label>
                <input
                  type="text"
                  name="organization"
                  value={editingExpert ? editingExpert.organization : ''}
                  onChange={(e) => setEditingExpert(prev => ({ ...prev, organization: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label>Role:</label>
                <input
                  type="text"
                  name="role"
                  value={editingExpert ? editingExpert.role : ''}
                  onChange={(e) => setEditingExpert(prev => ({ ...prev, role: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label>Location of Work:</label>
                <input
                  type="text"
                  name="locationOfWork"
                  value={editingExpert ? editingExpert.locationOfWork : ''}
                  onChange={(e) => setEditingExpert(prev => ({ ...prev, locationOfWork: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label>Date of Birth:</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={editingExpert ? editingExpert.dateOfBirth ? new Date(editingExpert.dateOfBirth).toISOString().split('T')[0] : '' : ''}
                  onChange={(e) => setEditingExpert(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label>LinkedIn Profile:</label>
                <input
                  type="url"
                  name="linkedinProfile"
                  value={editingExpert ? editingExpert.linkedinProfile : ''}
                  onChange={(e) => setEditingExpert(prev => ({ ...prev, linkedinProfile: e.target.value }))}
                />
              </div>
            </div>
            <div className="modal-actions">
              <button onClick={handleExpertEditSave} className="save-btn" disabled={isSubmittingExpert}>{editingExpert ? 'Update Expert' : 'Add Expert'}</button>
              <button onClick={closeExpertEditModal} className="cancel-btn">Cancel</button>
            </div>
          </div>
        </div>
      )}
      {isAddExpertModalOpen && (
        <div className="modal">
          <div className="modal-content expert-edit-modal">
            <h3>Add New Expert</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Name:</label>
                <input
                  type="text"
                  name="name"
                  value={''}
                  onChange={(e) => setAddingExpert(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label>Email:</label>
                <input
                  type="email"
                  name="email"
                  value={''}
                  onChange={(e) => setAddingExpert(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label>Mobile Number:</label>
                <input
                  type="text"
                  name="mobileNumber"
                  value={''}
                  onChange={(e) => setAddingExpert(prev => ({ ...prev, mobileNumber: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label>Domain:</label>
                <input
                  type="text"
                  name="Domain"
                  value={''}
                  onChange={(e) => setAddingExpert(prev => ({ ...prev, Domain: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label>Organization:</label>
                <input
                  type="text"
                  name="organization"
                  value={''}
                  onChange={(e) => setAddingExpert(prev => ({ ...prev, organization: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label>Role:</label>
                <input
                  type="text"
                  name="role"
                  value={''}
                  onChange={(e) => setAddingExpert(prev => ({ ...prev, role: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label>Location of Work:</label>
                <input
                  type="text"
                  name="locationOfWork"
                  value={''}
                  onChange={(e) => setAddingExpert(prev => ({ ...prev, locationOfWork: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label>Date of Birth:</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={''}
                  onChange={(e) => setAddingExpert(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label>LinkedIn Profile:</label>
                <input
                  type="url"
                  name="linkedinProfile"
                  value={''}
                  onChange={(e) => setAddingExpert(prev => ({ ...prev, linkedinProfile: e.target.value }))}
                />
              </div>
            </div>
            <div className="modal-actions">
              <button onClick={handleAddExpertSave} className="save-btn" disabled={isSubmittingExpert}>Add Expert</button>
              <button onClick={closeAddExpertModal} className="cancel-btn">Cancel</button>
            </div>
          </div>
        </div>
      )}
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
        onCancel={() => setConfirmBox(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};

export default Dashboard;
