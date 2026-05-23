import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../api';

export default function Dashboard() {
  const [profile,       setProfile]       = useState(null);
  const [currentCount,  setCurrentCount]  = useState(0);
  const [unreadCount,   setUnreadCount]   = useState(0);
  const [hasDiscount,   setHasDiscount]   = useState(false);

  useEffect(() => {
    API.get('/users/profile').then(r => setProfile(r.data)).catch(() => {});
    API.get('/bookings/current').then(r => setCurrentCount(r.data.length)).catch(() => {});
    API.get('/notifications').then(r => {
      const notifs = r.data;
      setUnreadCount(notifs.filter(n => !n.read).length);
      setHasDiscount(notifs.some(n => n.type === 'discount'));
    }).catch(() => {});
  }, []);

  const tiles = [
    { label: 'New booking',      to: '/bookings/new', color: '#f7c948', emoji: '🚕' },
    { label: 'My bookings',      to: '/bookings',     color: '#1a1a2e', emoji: '📋', light: true },
    { label: 'Payments',         to: '/payments',     color: '#2ecc71', emoji: '💳' },
    { label: 'Saved locations',  to: '/locations',    color: '#3498db', emoji: '📍' },
    { label: `Inbox${unreadCount > 0 ? ` (${unreadCount})` : ''}`, to: '/inbox', color: '#9b59b6', emoji: '🔔' }
  ];

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '0 20px' }}>
      <div className="card" style={{ background: '#1a1a2e', color: '#fff', marginBottom: '24px' }}>
        <h2>Welcome back, {profile?.firstName} 👋</h2>
        <p style={{ color: '#aaa', marginTop: '6px' }}>
          You have <strong style={{ color: '#f7c948' }}>{currentCount}</strong> upcoming ride{currentCount !== 1 ? 's' : ''}.
          {hasDiscount && <span style={{ marginLeft: '12px', color: '#f7c948' }}>🎉 You have a discount available!</span>}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
        {tiles.map(t => (
          <Link key={t.to} to={t.to} style={{ textDecoration: 'none' }}>
            <div className="card" style={{
              background: t.color, color: t.light ? '#fff' : '#1a1a2e',
              textAlign: 'center', padding: '32px 16px', cursor: 'pointer',
              transition: 'transform 0.2s'
            }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{ fontSize: '36px', marginBottom: '12px' }}>{t.emoji}</div>
              <div style={{ fontWeight: 700, fontSize: '15px' }}>{t.label}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}