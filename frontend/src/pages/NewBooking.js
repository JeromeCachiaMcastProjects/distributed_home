import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';

export default function NewBooking() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    startLocation: '', endLocation: '', dateTime: '',
    passengers: 1, cabType: 'Economic'
  });
  const [fareEstimate, setFareEstimate] = useState(null);
  const [priceBreakdown, setPriceBreakdown] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const getFareEstimate = async () => {
    if (!form.startLocation || !form.endLocation) {
      setError('Enter pickup and dropoff locations first'); return;
    }
    setLoading(true); setError('');
    try {
      const res = await API.get('/fare/estimate', {
        params: { pickup: form.startLocation, dropoff: form.endLocation }
      });
      const data = res.data.estimatedFare;
      const baseFare = data?.fare || 20;
      setFareEstimate(baseFare);

      if (form.dateTime && form.passengers && form.cabType) {
        const breakdown = await API.post('/payments/calculate', {
          baseFare, cabType: form.cabType,
          passengers: parseInt(form.passengers),
          dateTime: form.dateTime, useDiscount: true
        });
        setPriceBreakdown(breakdown.data);
      }
    } catch {
      setFareEstimate(20);
      setError('Could not reach fare API — using base estimate of €20');
    } finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (parseInt(form.passengers) > 8) {
      setError('Maximum 8 passengers allowed'); return;
    }
    try {
      await API.post('/bookings', { ...form, passengers: parseInt(form.passengers), fare: fareEstimate || 20 });
      navigate('/bookings');
    } catch (err) {
      setError(err.response?.data?.error || 'Booking failed');
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', padding: '0 20px' }}>
      <h2 style={{ marginBottom: '24px' }}>Book a cab</h2>
      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Pickup location</label>
            <input value={form.startLocation} placeholder="e.g. Valletta, Malta"
              onChange={e => setForm({ ...form, startLocation: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Dropoff location</label>
            <input value={form.endLocation} placeholder="e.g. Sliema, Malta"
              onChange={e => setForm({ ...form, endLocation: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Date & time</label>
            <input type="datetime-local" value={form.dateTime}
              onChange={e => setForm({ ...form, dateTime: e.target.value })} required />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label>Passengers (max 8)</label>
              <input type="number" min="1" max="8" value={form.passengers}
                onChange={e => setForm({ ...form, passengers: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Cab type</label>
              <select value={form.cabType}
                onChange={e => setForm({ ...form, cabType: e.target.value })}>
                <option>Economic</option>
                <option>Premium</option>
                <option>Executive</option>
              </select>
            </div>
          </div>

          <button type="button" className="btn btn-secondary"
            onClick={getFareEstimate} disabled={loading}
            style={{ marginBottom: '16px', width: '100%' }}>
            {loading ? 'Getting estimate...' : '💰 Get fare estimate'}
          </button>

          {priceBreakdown && (
            <div style={{ background: '#f8f9fa', borderRadius: '8px', padding: '16px', marginBottom: '16px', fontSize: '14px' }}>
              <strong>Price breakdown</strong>
              <div style={{ marginTop: '8px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
                <span>Base fare:</span>       <span>€{priceBreakdown.baseFare?.toFixed(2)}</span>
                <span>Cab multiplier:</span>  <span>×{priceBreakdown.cabMultiplier}</span>
                <span>Time multiplier:</span> <span>×{priceBreakdown.daytimeMultiplier}</span>
                <span>Pax multiplier:</span>  <span>×{priceBreakdown.passengersMultiplier}</span>
                <span>Discount:</span>        <span>{priceBreakdown.discountMultiplier < 1 ? '10% off! ✅' : 'None'}</span>
                <strong>Total:</strong>       <strong>€{priceBreakdown.totalPrice?.toFixed(2)}</strong>
              </div>
            </div>
          )}

          {error && <p className="error">{error}</p>}

          <button className="btn btn-primary" type="submit" style={{ width: '100%' }}>
            Confirm booking
          </button>
        </form>
      </div>
    </div>
  );
}