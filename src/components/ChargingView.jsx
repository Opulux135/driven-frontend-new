import React, { useState, useEffect } from 'react';
import './ChargingView.css';

const ChargingView = ({ user, sessionToken }) => {
  const [chargingData, setChargingData] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState('DE');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [userLocation, setUserLocation] = useState(null);

  // Backend API base URL
  const API_BASE = 'https://5001-i3vglaadv30lrghuio8ib-9b5dbcea.manusvm.computer/api';

  // European countries with codes
  const europeanCountries = [
    { code: 'DE', name: 'Germany' },
    { code: 'FR', name: 'France' },
    { code: 'IT', name: 'Italy' },
    { code: 'ES', name: 'Spain' },
    { code: 'NL', name: 'Netherlands' },
    { code: 'BE', name: 'Belgium' },
    { code: 'CH', name: 'Switzerland' },
    { code: 'AT', name: 'Austria' },
    { code: 'DK', name: 'Denmark' },
    { code: 'SE', name: 'Sweden' },
    { code: 'NO', name: 'Norway' },
    { code: 'FI', name: 'Finland' },
    { code: 'PL', name: 'Poland' },
    { code: 'CZ', name: 'Czech Republic' },
    { code: 'HU', name: 'Hungary' },
    { code: 'PT', name: 'Portugal' },
    { code: 'GR', name: 'Greece' }
  ];

  useEffect(() => {
    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLat = position.coords.latitude;
          const userLng = position.coords.longitude;
          setUserLocation({ lat: userLat, lng: userLng });
          fetchChargingData(selectedCountry, userLat, userLng);
        },
        (error) => {
          console.log('Geolocation error:', error);
          fetchChargingData(selectedCountry);
        }
      );
    } else {
      fetchChargingData(selectedCountry);
    }
  }, [selectedCountry]);

  const fetchChargingData = async (countryCode, lat = null, lng = null) => {
    try {
      setLoading(true);
      setError('');
      
      let url = `${API_BASE}/charging/stations?country_code=${countryCode}`;
      if (lat && lng) {
        url += `&lat=${lat}&lng=${lng}&radius=50`;
      }
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        setChargingData(data.data);
        setLastUpdated(new Date(data.timestamp * 1000));
      } else {
        setError(data.error || 'Failed to load charging stations');
        setChargingData([]);
      }
    } catch (err) {
      setError('Error fetching charging stations');
      setChargingData([]);
      console.error('Charging data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = () => {
    if (userLocation) {
      fetchChargingData(selectedCountry, userLocation.lat, userLocation.lng);
    } else {
      fetchChargingData(selectedCountry);
    }
  };

  const getStatusColor = (status) => {
    const statusColors = {
      'Operational': '#27ae60',
      'Available': '#27ae60',
      'In Use': '#f39c12',
      'Out of Service': '#e74c3c',
      'Unknown': '#95a5a6'
    };
    return statusColors[status] || '#95a5a6';
  };

  const getStatusIcon = (status) => {
    const statusIcons = {
      'Operational': 'fas fa-check-circle',
      'Available': 'fas fa-check-circle',
      'In Use': 'fas fa-clock',
      'Out of Service': 'fas fa-times-circle',
      'Unknown': 'fas fa-question-circle'
    };
    return statusIcons[status] || 'fas fa-question-circle';
  };

  const getCountryName = (code) => {
    const country = europeanCountries.find(c => c.code === code);
    return country ? country.name : code;
  };

  return (
    <div className="charging-view">
      <div className="charging-header">
        <h2>🔌 EV Charging Stations</h2>
        <p>Find electric vehicle charging stations across Europe</p>
      </div>

      {error && (
        <div className="error-message">
          <i className="fas fa-exclamation-triangle"></i>
          {error}
        </div>
      )}

      <div className="charging-controls">
        <div className="country-selector">
          <label>Select Country:</label>
          <select 
            value={selectedCountry} 
            onChange={(e) => setSelectedCountry(e.target.value)}
            disabled={loading}
          >
            {europeanCountries.map(country => (
              <option key={country.code} value={country.code}>
                {country.name}
              </option>
            ))}
          </select>
        </div>

        <div className="charging-actions">
          {userLocation && (
            <span className="location-info">
              <i className="fas fa-map-marker-alt"></i>
              Using your location
            </span>
          )}
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
          Loading charging stations for {getCountryName(selectedCountry)}...
        </div>
      ) : chargingData.length > 0 ? (
        <div className="charging-results">
          <div className="results-summary">
            <h3>Found {chargingData.length} charging stations in {getCountryName(selectedCountry)}</h3>
          </div>
          
          <div className="charging-grid">
            {chargingData.map((station, index) => (
              <div key={station.id || index} className="charging-card">
                <div className="charging-card-header">
                  <h4>{station.name}</h4>
                  <div 
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(station.status) }}
                  >
                    <i className={getStatusIcon(station.status)}></i>
                    {station.status}
                  </div>
                </div>
                
                <div className="charging-info">
                  <div className="address-info">
                    <i className="fas fa-map-marker-alt"></i>
                    <div>
                      <div className="address">{station.address}</div>
                      <div className="town">{station.town}, {station.country}</div>
                    </div>
                  </div>
                  
                  <div className="station-details">
                    <div className="detail-item">
                      <i className="fas fa-plug"></i>
                      <span>{station.connections} connection{station.connections !== 1 ? 's' : ''}</span>
                    </div>
                    
                    {station.operator && (
                      <div className="detail-item">
                        <i className="fas fa-building"></i>
                        <span>{station.operator}</span>
                      </div>
                    )}
                    
                    {station.coordinates && station.coordinates[0] && station.coordinates[1] && (
                      <div className="detail-item">
                        <i className="fas fa-crosshairs"></i>
                        <span>
                          {station.coordinates[1].toFixed(4)}, {station.coordinates[0].toFixed(4)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="no-data">
          <i className="fas fa-info-circle"></i>
          No charging stations found for {getCountryName(selectedCountry)}
        </div>
      )}

      <div className="charging-footer">
        <div className="status-legend">
          <h4>Station Status:</h4>
          <div className="legend-items">
            <div className="legend-item">
              <div className="legend-color" style={{ backgroundColor: '#27ae60' }}></div>
              <span>Operational/Available</span>
            </div>
            <div className="legend-item">
              <div className="legend-color" style={{ backgroundColor: '#f39c12' }}></div>
              <span>In Use</span>
            </div>
            <div className="legend-item">
              <div className="legend-color" style={{ backgroundColor: '#e74c3c' }}></div>
              <span>Out of Service</span>
            </div>
            <div className="legend-item">
              <div className="legend-color" style={{ backgroundColor: '#95a5a6' }}></div>
              <span>Unknown</span>
            </div>
          </div>
        </div>
        
        <div className="data-source">
          <p>Data from Open Charge Map • 50,000+ charging stations worldwide</p>
        </div>
      </div>
    </div>
  );
};

export default ChargingView;

