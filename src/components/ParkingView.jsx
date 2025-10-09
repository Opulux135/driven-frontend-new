import React, { useState, useEffect } from 'react';
import './ParkingView.css';

const ParkingView = ({ user, sessionToken }) => {
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState('');
  const [parkingData, setParkingData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);

  // Backend API base URL - using public deployment
  const API_BASE = 'https://5001-i3vglaadv30lrghuio8ib-9b5dbcea.manusvm.computer/api/parking';

  useEffect(() => {
    fetchCities();
  }, []);

  const fetchCities = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/cities`);
      const data = await response.json();
      
      if (data.success) {
        setCities(data.cities);
      } else {
        setError('Failed to load cities');
      }
    } catch (err) {
      setError('Error connecting to parking service');
      console.error('Cities fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchParkingData = async (cityName) => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch(`${API_BASE}/${cityName}`);
      const data = await response.json();
      
      if (data.success) {
        setParkingData(data.data);
        setLastUpdated(new Date(data.timestamp * 1000));
      } else {
        setError(data.error || 'Failed to load parking data');
        setParkingData([]);
      }
    } catch (err) {
      setError('Error fetching parking data');
      setParkingData([]);
      console.error('Parking data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCitySelect = (cityName) => {
    setSelectedCity(cityName);
    fetchParkingData(cityName);
  };

  const refreshData = () => {
    if (selectedCity) {
      fetchParkingData(selectedCity);
    }
  };

  const getAvailabilityStatus = (freeSpots, totalSpots) => {
    if (freeSpots === 'N/A' || totalSpots === 'N/A') return 'unknown';
    
    const free = parseInt(freeSpots);
    const total = parseInt(totalSpots);
    
    if (isNaN(free) || isNaN(total)) return 'unknown';
    
    const percentage = (free / total) * 100;
    
    if (percentage > 20) return 'available';
    if (percentage > 5) return 'limited';
    return 'full';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return '#4CAF50';
      case 'limited': return '#FF9800';
      case 'full': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'available': return 'Available';
      case 'limited': return 'Limited';
      case 'full': return 'Full';
      default: return 'Unknown';
    }
  };

  return (
    <div className="parking-view">
      <div className="parking-header">
        <h2>🚗 European Parking Finder</h2>
        <p>Real-time parking availability across {cities.length} European cities</p>
      </div>

      {error && (
        <div className="error-message">
          <i className="fas fa-exclamation-triangle"></i>
          {error}
        </div>
      )}

      <div className="city-selection">
        <h3>Select a City</h3>
        <div className="city-grid">
          {cities.map((city) => (
            <button
              key={city}
              className={`city-card ${selectedCity === city ? 'selected' : ''}`}
              onClick={() => handleCitySelect(city)}
              disabled={loading}
            >
              <i className="fas fa-map-marker-alt"></i>
              <span>{city}</span>
            </button>
          ))}
        </div>
      </div>

      {selectedCity && (
        <div className="parking-results">
          <div className="results-header">
            <h3>Parking in {selectedCity}</h3>
            <div className="results-actions">
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
              Loading parking data...
            </div>
          ) : parkingData.length > 0 ? (
            <div className="parking-grid">
              {parkingData.map((location, index) => {
                const status = getAvailabilityStatus(location.free_spots, location.total_spots);
                return (
                  <div key={index} className="parking-card">
                    <div className="parking-header">
                      <h4>{location.name}</h4>
                      <div 
                        className="status-indicator"
                        style={{ backgroundColor: getStatusColor(status) }}
                      >
                        {getStatusText(status)}
                      </div>
                    </div>
                    
                    <div className="parking-info">
                      <div className="spot-info">
                        <div className="spot-count">
                          <span className="free-spots">{location.free_spots}</span>
                          <span className="separator">/</span>
                          <span className="total-spots">{location.total_spots}</span>
                        </div>
                        <span className="spot-label">Free / Total</span>
                      </div>
                      
                      {location.address && (
                        <div className="address">
                          <i className="fas fa-map-marker-alt"></i>
                          {location.address}
                        </div>
                      )}
                      
                      {location.status && location.status !== 'unknown' && (
                        <div className="facility-status">
                          Status: {location.status}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="no-data">
              <i className="fas fa-info-circle"></i>
              No parking data available for {selectedCity}
            </div>
          )}
        </div>
      )}

      <div className="parking-footer">
        <div className="stats">
          <div className="stat">
            <i className="fas fa-city"></i>
            <span>{cities.length} Cities</span>
          </div>
          <div className="stat">
            <i className="fas fa-parking"></i>
            <span>{parkingData.length} Locations</span>
          </div>
          <div className="stat">
            <i className="fas fa-clock"></i>
            <span>Real-time</span>
          </div>
        </div>
        <p className="data-source">
          Data from official city APIs • Free & Open Source
        </p>
      </div>
    </div>
  );
};

export default ParkingView;

