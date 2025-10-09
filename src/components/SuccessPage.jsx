import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

const SuccessPage = () => {
  const [searchParams] = useSearchParams();
  const [sessionData, setSessionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (sessionId) {
      // In a real app, you'd verify the session with your backend
      // For now, we'll just show a success message
      setSessionData({
        id: sessionId,
        status: 'complete'
      });
      setLoading(false);
    }
  }, [sessionId]);

  if (loading) {
    return (
      <div className="success-page">
        <div className="success-container">
          <div className="loading">
            <div className="spinner"></div>
            <p>Processing your subscription...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="success-page">
      <div className="success-container">
        <div className="success-content">
          <div className="success-icon">✅</div>
          <h1>Subscription Successful!</h1>
          <p>Thank you for subscribing to DRIVEN! Your premium features are now active.</p>
          
          <div className="success-details">
            <h3>What's Next?</h3>
            <ul>
              <li>Access real-time parking data across Europe</li>
              <li>Get live fuel price updates</li>
              <li>Find EV charging stations with availability</li>
              <li>Receive speed camera alerts</li>
            </ul>
          </div>

          <div className="success-actions">
            <button 
              className="btn btn-primary"
              onClick={() => window.location.href = '/'}
            >
              Start Using DRIVEN
            </button>
            <button 
              className="btn btn-secondary"
              onClick={() => window.location.href = '/profile'}
            >
              View Profile
            </button>
          </div>

          <div className="success-info">
            <p><small>Session ID: {sessionId}</small></p>
            <p><small>You will receive a confirmation email shortly.</small></p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .success-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 20px;
        }

        .success-container {
          background: white;
          border-radius: 12px;
          padding: 40px;
          max-width: 500px;
          width: 100%;
          text-align: center;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        }

        .success-icon {
          font-size: 64px;
          margin-bottom: 20px;
        }

        .success-content h1 {
          color: #333;
          margin-bottom: 15px;
          font-size: 28px;
        }

        .success-content > p {
          color: #666;
          font-size: 16px;
          margin-bottom: 30px;
          line-height: 1.5;
        }

        .success-details {
          background: #f8f9fa;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 30px;
          text-align: left;
        }

        .success-details h3 {
          color: #333;
          margin-bottom: 15px;
          font-size: 18px;
        }

        .success-details ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .success-details li {
          padding: 8px 0;
          color: #555;
          position: relative;
          padding-left: 25px;
        }

        .success-details li::before {
          content: "✓";
          position: absolute;
          left: 0;
          color: #28a745;
          font-weight: bold;
        }

        .success-actions {
          display: flex;
          gap: 15px;
          justify-content: center;
          margin-bottom: 30px;
        }

        .btn {
          padding: 12px 24px;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          text-decoration: none;
          display: inline-block;
        }

        .btn-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }

        .btn-secondary {
          background: #f8f9fa;
          color: #333;
          border: 1px solid #ddd;
        }

        .btn-secondary:hover {
          background: #e9ecef;
        }

        .success-info {
          border-top: 1px solid #eee;
          padding-top: 20px;
          color: #888;
        }

        .success-info small {
          font-size: 12px;
        }

        .loading {
          text-align: center;
          padding: 40px;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #667eea;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 20px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .success-container {
            padding: 30px 20px;
          }
          
          .success-actions {
            flex-direction: column;
          }
          
          .btn {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default SuccessPage;

