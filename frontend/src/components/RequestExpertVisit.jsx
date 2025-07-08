import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const DOMAIN_OPTIONS = [
  'IP Consultancy',
  'Technical Support',
  'Training Session',
  'Project Review',
  'Custom Services',
];

const RequestExpertVisit = () => {
  const [date, setDate] = useState(null);
  const [time, setTime] = useState('');
  const [form, setForm] = useState({
    name: '',
    mobile: '',
    email: '',
    institute: '',
    domains: [],
    description: '',
  });
  const [attachment, setAttachment] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setForm((prev) => ({
        ...prev,
        domains: checked
          ? [...prev.domains, value]
          : prev.domains.filter((d) => d !== value),
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e) => {
    setAttachment(e.target.files[0] || null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!date || !time) {
      toast.error('Please select date and time.');
      return;
    }
    if (form.domains.length === 0) {
      toast.error('Please select at least one domain.');
      return;
    }
    setSubmitting(true);
    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('mobile', form.mobile);
    formData.append('email', form.email);
    formData.append('institute', form.institute);
    formData.append('date', date.toISOString());
    formData.append('time', time);
    form.domains.forEach((d) => formData.append('domains', d));
    if (attachment) formData.append('attachment', attachment);
    formData.append('description', form.description);
    try {
      const res = await fetch('/api/requestforexperts', {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        toast.success('Request submitted successfully!');
        setForm({ name: '', mobile: '', email: '', institute: '', domains: [], description: '' });
        setDate(null);
        setTime('');
        setAttachment(null);
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to submit request.');
      }
    } catch (error) {
      toast.error('Failed to submit request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="request-expert-visit-container" style={{ maxWidth: 500, margin: '0 auto', padding: 24 }}>
      <h2>Request for Expert Visit</h2>
      <form onSubmit={handleSubmit}>
        <label>Date:<br />
          <DatePicker selected={date} onChange={setDate} dateFormat="yyyy-MM-dd" minDate={new Date()} required placeholderText="Select date" />
        </label>
        <br />
        <label>Time:<br />
          <input type="time" name="time" value={time} onChange={e => setTime(e.target.value)} required />
        </label>
        <br />
        <label>Name:<br />
          <input type="text" name="name" value={form.name} onChange={handleChange} required />
        </label>
        <br />
        <label>Mobile Number:<br />
          <input type="text" name="mobile" value={form.mobile} onChange={handleChange} required />
        </label>
        <br />
        <label>Email:<br />
          <input type="email" name="email" value={form.email} onChange={handleChange} required />
        </label>
        <br />
        <label>Institute Name:<br />
          <input type="text" name="institute" value={form.institute} onChange={handleChange} required />
        </label>
        <br />
        <label>Domain:<br />
          {DOMAIN_OPTIONS.map((domain) => (
            <span key={domain} style={{ display: 'block' }}>
              <input
                type="checkbox"
                name="domains"
                value={domain}
                checked={form.domains.includes(domain)}
                onChange={handleChange}
              /> {domain}
            </span>
          ))}
        </label>
        <br />
        <label>Attachment (optional):<br />
          <input type="file" name="attachment" onChange={handleFileChange} />
        </label>
        <br />
        <label>Description (optional):<br />
          <textarea name="description" value={form.description} onChange={handleChange} />
        </label>
        <br />
        <button type="submit" disabled={submitting}>{submitting ? 'Submitting...' : 'Submit Request'}</button>
      </form>
    </div>
  );
};

export default RequestExpertVisit; 
