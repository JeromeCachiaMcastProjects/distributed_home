import React, { useEffect, useState } from 'react';
import API from '../api';

export default function Inbox() {
  const [notifications, setNotifications] = useState([]);

  const load = () => API.get('/notifications').then(r => setNotifications(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const markRead = async (id) => {
    await API.patch(`/notifications/${id}/read`);
    load();
  };

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '0 20px' }}>
      <h2 style={{ marginBottom: '24px' }}>Inbox</h2>
      {notifications.length === 0
        ? <div className="card" style={{ textAlign: 'center', color: '#888' }}>No notifications yet.</div>
        : notifications.map(n => (
          <div className="card" key={n._id} style={{
            borderLeft: `4px solid ${n.read ? '#e0e0e0' : '#f7c948'}`,
            opacity: n.read ? 0.7 : 1
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span className={`badge badge-${n.type}`} style={{ marginBottom: '8px' }}>
                  {n.type === 'cab_ready' ? '🚕 Cab ready' : n.type === 'discount' ? '🎉 Discount' : '📢 General'}
                </span>
                <p style={{ marginTop: '6px' }}>{n.message}</p>
                <p style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>
                  {new Date(n.createdAt).toLocaleString()}
                </p>
              </div>
              {!n.read && (
                <button className="btn btn-sm" style={{ background: '#e0e0e0' }}
                  onClick={() => markRead(n._id)}>
                  Mark read
                </button>
              )}
            </div>
          </div>
        ))
      }
    </div>
  );
}