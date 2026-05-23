import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import API from '../api';

export default function Navbar({ onLogout }) {
  const location = useLocation();
  const firstName = localStorage.getItem('firstName') || 'User';
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    API.get('/notifications')
      .then(res => setUnread(res.data.filter(n => !n.read).length))
      .catch(() => {});
  }, [location]);

  const links = [
    { to: '/',           label: 'Dashboard' },
    { to: '/bookings',   label: 'Bookings'  },
    { to: '/payments',   label: 'Payments'  },
    { to: '/locations',  label: 'Locations' },
    { to: '/inbox',      label: `Inbox${unread > 0 ? ` (${unread})` : ''}` }
  ];

  return (
    <nav style={{
      background: '#1a1a2e', padding: '0 32px',
      display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', height: '60px'
    }}>
      <span style={{ color: '#f7c948', fontWeight: 700, fontSize: '18px' }}>
        🚕 CabBook
      </span>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        {links.map(l => (
          <Link key={l.to} to={l.to} style={{
            color: location.pathname === l.to ? '#f7c948' : '#ccc',
            textDecoration: 'none', padding: '6px 12px',
            borderRadius: '6px', fontSize: '14px', fontWeight: 500
          }}>{l.label}</Link>
        ))}
        <span style={{ color: '#aaa', fontSize: '13px', marginLeft: '8px' }}>
          Hi, {firstName}
        </span>
        <button className="btn btn-primary btn-sm" onClick={onLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}