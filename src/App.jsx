import React, { useState, useEffect } from 'react';
import MapView from './components/MapView';
import Header from './components/Header';
import AuthModal from './components/AuthModal';
import ChatBot from './components/ChatBot';
import ParkingView from './components/ParkingView';
import GasView from './components/GasView';
import ChargingView from './components/ChargingView';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('map');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'signup'
  const [user, setUser] = useState(null);
  const [sessionToken, setSessionToken] = useState(null);
  const [showChatBot, setShowChatBot] = useState(false);

  // Check for existing session on app load
  useEffect(() => {
    const savedSession = localStorage.getItem('supabase_session');
    if (savedSession) {
      setSessionToken(savedSession);
      // Verify session with backend
      verifySession(savedSession);
    }
  }, []);

  const verifySession = async (token) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/user', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        // Invalid session, clear it
        localStorage.removeItem('supabase_session');
        setSessionToken(null);
        setUser(null);
      }
    } catch (error) {
      console.error('Session verification failed:', error);
      localStorage.removeItem('supabase_session');
      setSessionToken(null);
      setUser(null);
    }
  };

  const openAuthModal = (mode) => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const handleAuthSuccess = (userData, session) => {
    setUser(userData);
    setSessionToken(session);
  };

  const handleLogout = async () => {
    try {
      // Call logout endpoint
      await fetch('http://localhost:5000/api/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sessionToken}`
        }
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local state regardless of API call result
      localStorage.removeItem('supabase_session');
      setUser(null);
      setSessionToken(null);
      alert('Logged out successfully!');
    }
  };

  const handleSubscription = async (plan) => {
    if (!user) {
      openAuthModal('login');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/payments/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionToken}`
        },
        body: JSON.stringify({
          plan: plan,
          user_id: user.id,
          customer_email: user.email
        })
      });

      const data = await response.json();

      if (data.success) {
        // Redirect to Stripe Checkout
        window.location.href = data.checkout_url;
      } else {
        alert('Error creating checkout session: ' + data.error);
      }
    } catch (error) {
      console.error('Subscription error:', error);
      alert('Error processing subscription. Please try again.');
    }
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'map':
        return <MapView user={user} sessionToken={sessionToken} />;
      case 'parking':
        return <ParkingView user={user} sessionToken={sessionToken} />;
      case 'gas':
        return <GasView user={user} sessionToken={sessionToken} />;
      case 'charging':
        return <ChargingView user={user} sessionToken={sessionToken} />;
      case 'profile':
        return (
          <div className="page-content">
            <h2>Profile Page</h2>
            {user ? (
              <div>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>User ID:</strong> {user.id}</p>
                <p><strong>Member since:</strong> {new Date(user.created_at).toLocaleDateString()}</p>
                <button onClick={handleLogout} className="btn btn-secondary">
                  Logout
                </button>
              </div>
            ) : (
              <p>Please log in to view your profile.</p>
            )}
          </div>
        );
      case 'pricing':
        return (
          <div className="page-content">
            <h2>Pricing Plans</h2>
            <div className="pricing-cards">
              <div className="pricing-card">
                <h3>Free</h3>
                <p className="price">€0/month</p>
                <ul>
                  <li>Basic map access</li>
                  <li>Limited location data</li>
                  <li>Community support</li>
                </ul>
                <button className="btn btn-secondary">Current Plan</button>
              </div>
              <div className="pricing-card featured">
                <h3>Premium</h3>
                <p className="price">€9.99/month</p>
                <ul>
                  <li>Real-time parking data</li>
                  <li>Fuel price alerts</li>
                  <li>Basic EV charging info</li>
                  <li>Speed camera warnings</li>
                </ul>
                <button 
                  className="btn btn-primary"
                  onClick={() => handleSubscription('premium')}
                  disabled={!user}
                >
                  {user ? 'Choose Premium' : 'Login Required'}
                </button>
              </div>
              <div className="pricing-card">
                <h3>Pro</h3>
                <p className="price">€19.99/month</p>
                <ul>
                  <li>Everything in Premium</li>
                  <li>Advanced route optimization</li>
                  <li>Priority customer support</li>
                  <li>Unlimited favorites</li>
                  <li>Export data features</li>
                </ul>
                <button 
                  className="btn btn-primary"
                  onClick={() => handleSubscription('pro')}
                  disabled={!user}
                >
                  {user ? 'Choose Pro' : 'Login Required'}
                </button>
              </div>
            </div>
            {!user && (
              <p className="login-notice">
                Please <button onClick={() => openAuthModal('login')} className="link-button">log in</button> to subscribe to a plan.
              </p>
            )}
          </div>
        );
      case 'chat':
        return (
          <div className="page-content">
            <h2>AI Assistant</h2>
            <div className="chat-container">
              <div className="chat-info">
                <p>Click the chat button below or use the floating chat button to start a conversation with our AI assistant!</p>
                <button 
                  className="btn btn-primary"
                  onClick={() => setShowChatBot(true)}
                >
                  Open Chat Assistant
                </button>
              </div>
            </div>
          </div>
        );
      default:
        return <MapView user={user} sessionToken={sessionToken} />;
    }
  };

  return (
    <div className="App">
      <Header
        setCurrentPage={setCurrentPage}
        openAuthModal={openAuthModal}
        user={user}
        onLogout={handleLogout}
      />

      <main className="main-content">
        {renderCurrentPage()}
      </main>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={closeAuthModal}
        mode={authMode}
        onAuthSuccess={handleAuthSuccess}
      />

      <ChatBot 
        isOpen={showChatBot}
        onClose={() => setShowChatBot(false)}
      />

      {/* Floating Chat Button */}
      {!showChatBot && (
        <button 
          className="floating-chat-button"
          onClick={() => setShowChatBot(true)}
          title="Chat with DRIVEN Assistant"
        >
          💬
        </button>
      )}
    </div>
  );
}

export default App;


