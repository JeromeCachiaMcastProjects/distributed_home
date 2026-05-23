import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../api';

export default function Bookings() {
  const [current, setCurrent] = useState([]);
  const [past,    setPast]    = useState([]);
  const [tab,     setTab]     = useState('current');
  const [paying,  setPaying]  = useState(null);
  const [hasDiscount, setHasDiscount] = useState(false);
  const [msg, setMsg] = useState('');

  const load = () => {
    API.get('/bookings/current').then(r => setCurrent(r.data)).catch(() => {});
    API.get('/bookings/past').then(r => setPast(r.data)).catch(() => {});
    API.get('/notifications').then(r => {
      setHasDiscount(r.data.some(n => n.type === 'discount'));
    }).catch(() => {});
  };

  useEffect(() => { load(); }, []);

  const handlePay = async (booking) => {
    setPaying(booking._id);
    setMsg('');
    try {
      await API.post('/payments', {
        bookingId:   booking._id,
        baseFare:    booking.fare || 20,
        cabType:     booking.cabType,
        passengers:  booking.passengers,
        dateTime:    booking.dateTime,
        useDiscount: hasDiscount
      });
      setMsg(`Payment successful for ${booking.startLocation} → ${booking.endLocation}!`);
      load();
    } catch (err) {
      setMsg(err.response?.data?.error || 'Payment failed');
    } finally {
      setPaying(null);
    }
  };

  const bookings = tab === 'current' ? current : past;

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '0 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2>My bookings</h2>
        <Link to="/bookings/new"><button className="btn btn-primary">+ New booking</button></Link>
      </div>

      {hasDiscount && (
        <div style={{ background: '#cfe2ff', border: '1px solid #084298', borderRadius: '8px',
          padding: '12px 16px', marginBottom: '16px', fontSize: '14px', color: '#084298' }}>
          🎉 You have a <strong>10% discount</strong> available — it will be applied automatically on your next payment!
        </div>
      )}

      {msg && (
        <div style={{ background: '#d1e7dd', border: '1px solid #0f5132', borderRadius: '8px',
          padding: '12px 16px', marginBottom: '16px', fontSize: '14px', color: '#0f5132' }}>
          {msg}
        </div>
      )}

      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {['current', 'past'].map(t => (
          <button key={t}
            style={{ background: tab === t ? '#1a1a2e' : '#e0e0e0',
              color: tab === t ? '#fff' : '#333', padding: '8px 20px',
              border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}
            onClick={() => setTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)} bookings
          </button>
        ))}
      </div>

      {bookings.length === 0
        ? <div className="card" style={{ textAlign: 'center', color: '#888' }}>
            No {tab} bookings found.
          </div>
        : bookings.map(b => (
          <div className="card" key={b._id}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <strong>{b.startLocation} → {b.endLocation}</strong>
                <p style={{ color: '#666', fontSize: '14px', marginTop: '4px' }}>
                  {new Date(b.dateTime).toLocaleString()} · {b.passengers} passenger{b.passengers !== 1 ? 's' : ''} · {b.cabType}
                </p>
                {b.fare && (
                  <p style={{ fontSize: '13px', color: '#888', marginTop: '2px' }}>
                    Base fare: €{b.fare}
                  </p>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                <span className={`badge badge-${b.status}`}>{b.status}</span>
                {b.status === 'upcoming' && (
                  <button className="btn btn-primary btn-sm"
                    disabled={paying === b._id}
                    onClick={() => handlePay(b)}>
                    {paying === b._id ? 'Processing...' : '💳 Pay now'}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))
      }
    </div>
  );
}