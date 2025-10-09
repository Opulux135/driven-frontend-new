import React, { useState, useEffect } from 'react';
import './GasView.css';

const GasView = ({ user, sessionToken }) => {
  const [gasData, setGasData] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState('Germany');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);

  // Backend API base URL
  const API_BASE = 'https://5001-i3vglaadv30lrghuio8ib-9b5dbcea.manusvm.computer/api';

  // European countries
  const europeanCountries = [
    'Germany', 'France', 'Italy', 'Spain', 'Netherlands', 'Belgium',
    'Switzerland', 'Austria', 'Denmark', 'Sweden', 'Norway', 'Finland',
    'Poland', 'Czech Republic', 'Hungary', 'Portugal', 'Greece'
  ];

  useEffect(() => {
    fetchGasData();
  }, [selectedCountry]);

  const fetchGasData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch(`${API_BASE}/gas/prices?country=${selectedCountry}`);
      const data = await response.json();
      
      if (data.success) {
        setGasData(data.data);
        setLastUpdated(new Date(data.timestamp * 1000));
      } else {
        setError(data.error || 'Failed to load gas prices');
        setGasData([]);
      }
    } catch (err) {
      setError('Error fetching gas prices');
      setGasData([]);
      console.error('Gas data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = () => {
    fetchGasData();
  };

  const formatPrice = (price) => {
    if (typeof price === 'number') {
      return price.toFixed(3);
    }
    return price || 'N/A';
  };

  const getPriceColor = (price, type) => {
    if (!price || typeof price !== 'number') return '#95a5a6';
    
    // Color coding based on typical European fuel prices
    const thresholds = {
      gasoline: { low: 1.4, high: 1.7 },
      diesel: { low: 1.3, high: 1.6 }
    };
    
    const threshold = thresholds[type] || thresholds.gasoline;
    
    if (price <= threshold.low) return '#27ae60'; // Green - cheap
    if (price >= threshold.high) return '#e74c3c'; // Red - expensive
    return '#f39c12'; // Orange - moderate
  };

  return (
    <div className="gas-view">
      <div className="gas-header">
        <h2>⛽ European Gas Prices</h2>
        <p>Real-time fuel prices across European countries</p>
      </div>

      {error && (
        <div className="error-message">
          <i className="fas fa-exclamation-triangle"></i>
          {error}
        </div>
      )}

      <div className="gas-controls">
        <div className="country-selector">
          <label>Select Country:</label>
          <select 
            value={selectedCountry} 
            onChange={(e) => setSelectedCountry(e.target.value)}
            disabled={loading}
          >
            {europeanCountries.map(country => (
              <option key={country} value={country}>{country}</option>
            ))}
          </select>
        </div>

        <div className="gas-actions">
          {lastUpdated && (
            <span className="last-updated">
              Updated: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <button 
            className="refresh-btn"
            onClick={refreshData}
            disabled={loading}
          >
            <i className={`fas fa-sync-alt ${loading ? 'spinning' : ''}`}></i>
            Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading">
          <i className="fas fa-spinner fa-spin"></i>
          Loading gas prices for {selectedCountry}...
        </div>
      ) : gasData.length > 0 ? (
        <div className="gas-results">
          <div className="gas-grid">
            {gasData.map((station, index) => (
              <div key={index} className="gas-card">
                <div className="gas-card-header">
                  <h3>{station.country}</h3>
                  <div className="currency-badge">
                    {station.currency || 'EUR'}
                  </div>
                </div>
                
                <div className="price-grid">
                  <div className="price-item">
                    <div className="fuel-type">
                      <i className="fas fa-gas-pump"></i>
                      <span>Gasoline</span>
                    </div>
                    <div 
                      className="price-value"
                      style={{ color: getPriceColor(station.gasoline, 'gasoline') }}
                    >
                      {formatPrice(station.gasoline)}
                    </div>
                    <div className="price-unit">per liter</div>
                  </div>
                  
                  <div className="price-item">
                    <div className="fuel-type">
                      <i className="fas fa-truck"></i>
                      <span>Diesel</span>
                    </div>
                    <div 
                      className="price-value"
                      style={{ color: getPriceColor(station.diesel, 'diesel') }}
                    >
                      {formatPrice(station.diesel)}
                    </div>
                    <div className="price-unit">per liter</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="no-data">
          <i className="fas fa-info-circle"></i>
          No gas price data available for {selectedCountry}
        </div>
      )}

      <div className="gas-footer">
        <div className="price-legend">
          <h4>Price Guide:</h4>
          <div className="legend-items">
            <div className="legend-item">
              <div className="legend-color" style={{ backgroundColor: '#27ae60' }}></div>
              <span>Low Price</span>
            </div>
            <div className="legend-item">
              <div className="legend-color" style={{ backgroundColor: '#f39c12' }}></div>
              <span>Moderate Price</span>
            </div>
            <div className="legend-item">
              <div className="legend-color" style={{ backgroundColor: '#e74c3c' }}></div>
              <span>High Price</span>
            </div>
          </div>
        </div>
        
        <div className="data-source">
          <p>Data from CollectAPI • Real-time European fuel prices</p>
        </div>
      </div>
    </div>
  );
};

export default GasView;

