import React, { useEffect, useState } from 'react';
import API from '../api';

export default function Locations() {
  const [locations, setLocations] = useState([]);
  const [form,      setForm]      = useState({ name: '', address: '' });
  const [editing,   setEditing]   = useState(null);
  const [weather,   setWeather]   = useState({});
  const [error,     setError]     = useState('');

  const load = () => API.get('/locations').then(r => setLocations(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('');
    try {
      if (editing) {
        await API.put(`/locations/${editing}`, form);
        setEditing(null);
      } else {
        await API.post('/locations', form);
      }
      setForm({ name: '', address: '' });
      load();
    } catch (err) { setError(err.response?.data?.error || 'Failed to save'); }
  };

  const handleDelete = async (id) => {
    await API.delete(`/locations/${id}`);
    load();
  };

  const getWeather = async (id) => {
    try {
      const res = await API.get(`/locations/${id}/weather`);
      setWeather(w => ({ ...w, [id]: res.data }));
    } catch { setWeather(w => ({ ...w, [id]: { error: 'Weather unavailable' } })); }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '0 20px' }}>
      <h2 style={{ marginBottom: '24px' }}>Saved locations</h2>

      <div className="card">
        <h3 style={{ marginBottom: '16px' }}>{editing ? 'Edit location' : 'Add location'}</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name</label>
            <input placeholder="e.g. Home, Office" value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Address</label>
            <input placeholder="e.g. Valletta, Malta" value={form.address}
              onChange={e => setForm({ ...form, address: e.target.value })} required />
          </div>
          {error && <p className="error">{error}</p>}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-primary" type="submit">{editing ? 'Update' : 'Add location'}</button>
            {editing && <button className="btn" type="button"
              style={{ background: '#e0e0e0' }}
              onClick={() => { setEditing(null); setForm({ name: '', address: '' }); }}>
              Cancel
            </button>}
          </div>
        </form>
      </div>

      {locations.map(loc => (
        <div className="card" key={loc._id}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <strong>{loc.name}</strong>
              <p style={{ color: '#666', fontSize: '14px', marginTop: '4px' }}>{loc.address}</p>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn btn-sm" style={{ background: '#e0e0e0' }}
                onClick={() => { setEditing(loc._id); setForm({ name: loc.name, address: loc.address }); }}>
                Edit
              </button>
              <button className="btn btn-sm" style={{ background: '#3498db', color: '#fff' }}
                onClick={() => getWeather(loc._id)}>
                🌤 Weather
              </button>
              <button className="btn btn-sm btn-danger" onClick={() => handleDelete(loc._id)}>
                Delete
              </button>
            </div>
          </div>

          {weather[loc._id] && (
            <div style={{ marginTop: '12px', padding: '12px', background: '#f0f8ff', borderRadius: '8px', fontSize: '14px' }}>
              {weather[loc._id].error
                ? <span style={{ color: '#e74c3c' }}>{weather[loc._id].error}</span>
                : <>
                    <strong>{weather[loc._id].weather?.condition}</strong>
                    <span style={{ margin: '0 12px' }}>🌡 {weather[loc._id].weather?.temp_c}°C</span>
                    <span style={{ margin: '0 12px' }}>💧 {weather[loc._id].weather?.humidity}%</span>
                    <span>💨 {weather[loc._id].weather?.wind_kph} km/h</span>
                  </>
              }
            </div>
          )}
        </div>
      ))}
    </div>
  );
}