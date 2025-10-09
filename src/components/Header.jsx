import React from 'react';

function Header({ setCurrentPage, openAuthModal, user, onLogout }) {
  return (
    <header className="app-header">
      <div className="logo-container">
        <div className="app-logo-placeholder">🚗</div>
        <span className="app-name">DRIVEN</span>
        <span className="app-tagline">Where Intelligence Meets Road</span>
      </div>
      <nav className="main-nav">
        <button onClick={() => setCurrentPage('map')}>🗺️ Map</button>
        <button onClick={() => setCurrentPage('parking')}>🅿️ Parking</button>
        <button onClick={() => setCurrentPage('gas')}>⛽ Gas Prices</button>
        <button onClick={() => setCurrentPage('charging')}>🔌 Charging</button>
        <button onClick={() => setCurrentPage('profile')}>👤 Profile</button>
        <button onClick={() => setCurrentPage('pricing')}>💰 Pricing</button>
        <button onClick={() => setCurrentPage('chat')}>💬 Chat</button>
      </nav>
      <div className="auth-buttons">
        {user ? (
          <div className="user-info">
            <span className="user-email">Welcome, {user.email}</span>
            <button onClick={onLogout} className="btn-logout">Logout</button>
          </div>
        ) : (
          <>
            <button onClick={() => openAuthModal('login')}>Login</button>
            <button onClick={() => openAuthModal('signup')}>Sign Up</button>
          </>
        )}
      </div>
    </header>
  );
}

export default Header;


