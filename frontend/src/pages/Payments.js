import React, { useEffect, useState } from 'react';
import API from '../api';

export default function Payments() {
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    API.get('/payments').then(r => setPayments(r.data)).catch(() => {});
  }, []);

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '0 20px' }}>
      <h2 style={{ marginBottom: '24px' }}>Payment history</h2>
      {payments.length === 0
        ? <div className="card" style={{ textAlign: 'center', color: '#888' }}>No payments yet.</div>
        : payments.map(p => (
          <div className="card" key={p._id}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <strong>€{p.totalPrice.toFixed(2)}</strong>
                <p style={{ color: '#666', fontSize: '14px', marginTop: '4px' }}>
                  {p.cabType} · {p.passengers} passenger{p.passengers !== 1 ? 's' : ''}
                </p>
                <p style={{ fontSize: '13px', color: '#888', marginTop: '2px' }}>
                  {new Date(p.createdAt).toLocaleString()}
                </p>
              </div>
              <div style={{ textAlign: 'right', fontSize: '13px', color: '#888' }}>
                <div>Base: €{p.baseFare}</div>
                <div>Cab ×{p.breakdown?.cabMultiplier}</div>
                <div>Time ×{p.breakdown?.daytimeMultiplier}</div>
                {p.discount && <div style={{ color: '#27ae60' }}>10% discount applied ✅</div>}
              </div>
            </div>
          </div>
        ))
      }
    </div>
  );
}