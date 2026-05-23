import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Bookings from './pages/Bookings';
import NewBooking from './pages/NewBooking';
import Payments from './pages/Payments';
import Locations from './pages/Locations';
import Inbox from './pages/Inbox';
import Navbar from './components/Navbar';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));

  const handleLogin = (tok) => {
    localStorage.setItem('token', tok);
    setToken(tok);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('firstName');
    setToken(null);
  };

  return (
    <BrowserRouter>
      {token && <Navbar onLogout={handleLogout} />}
      <Routes>
        <Route path="/login"    element={!token ? <Login onLogin={handleLogin} />    : <Navigate to="/" />} />
        <Route path="/register" element={!token ? <Register />                        : <Navigate to="/" />} />
        <Route path="/"         element={token  ? <Dashboard />                       : <Navigate to="/login" />} />
        <Route path="/bookings" element={token  ? <Bookings />                        : <Navigate to="/login" />} />
        <Route path="/bookings/new" element={token ? <NewBooking />                   : <Navigate to="/login" />} />
        <Route path="/payments" element={token  ? <Payments />                        : <Navigate to="/login" />} />
        <Route path="/locations" element={token ? <Locations />                       : <Navigate to="/login" />} />
        <Route path="/inbox"    element={token  ? <Inbox />                           : <Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;