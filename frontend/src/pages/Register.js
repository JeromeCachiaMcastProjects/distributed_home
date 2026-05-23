import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api';

export default function Register() {
  const [form, setForm] = useState({ firstName: '', surname: '', email: '', password: '' });
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    try {
      await API.post('/auth/register', form);
      setSuccess('Registered! Redirecting to login...');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="card" style={{ width: '100%', maxWidth: '400px' }}>
        <h2 style={{ marginBottom: '24px', textAlign: 'center' }}>🚕 CabBook</h2>
        <h3 style={{ marginBottom: '20px' }}>Create account</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>First name</label>
            <input value={form.firstName}
              onChange={e => setForm({ ...form, firstName: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Surname</label>
            <input value={form.surname}
              onChange={e => setForm({ ...form, surname: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })} required />
          </div>
          {error   && <p className="error">{error}</p>}
          {success && <p className="success">{success}</p>}
          <button className="btn btn-primary" type="submit" style={{ width: '100%', marginTop: '8px' }}>
            Register
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '14px' }}>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}