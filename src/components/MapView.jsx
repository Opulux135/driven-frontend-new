import React, { useState, useEffect, useRef } from 'react';
import './MapView.css';

const MapView = ({ user, sessionToken }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [lng, setLng] = useState(13.4050);
  const [lat, setLat] = useState(52.5200);
  const [zoom, setZoom] = useState(6);
  const [mapData, setMapData] = useState({
    parking: [],
    gas: [],
    charging: [],
    speedCameras: []
  });
  const [loading, setLoading] = useState(true);
  const [selectedDataTypes, setSelectedDataTypes] = useState({
    parking: true,
    gas: true,
    charging: true,
    speedCameras: true
  });
  const [selectedCountry, setSelectedCountry] = useState('Germany');

  // Backend API base URL
  const API_BASE = `${import.meta.env.VITE_API_BASE_URL}/api`;
  // European countries for selection
  const europeanCountries = [
    'Germany', 'France', 'Italy', 'Spain', 'Netherlands', 'Belgium',
    'Switzerland', 'Austria', 'Denmark', 'Sweden', 'Norway', 'Finland',
    'Poland', 'Czech Republic', 'Hungary', 'Portugal', 'Greece'
  ];

  useEffect(() => {
    // Get user's current location or use default
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLat = position.coords.latitude;
          const userLng = position.coords.longitude;
          setLat(userLat);
          setLng(userLng);
          setZoom(10);
          fetchAllData(selectedCountry, userLat, userLng);
        },
        (error) => {
          console.log('Geolocation error:', error);
          // Use default coordinates for selected country
          fetchAllData(selectedCountry);
        }
      );
    } else {
      fetchAllData(selectedCountry);
    }
  }, [selectedCountry]);

  const fetchAllData = async (country, latitude = null, longitude = null) => {
    try {
      setLoading(true);
      
      // Fetch all data types
      const [parkingRes, gasRes, chargingRes, speedRes] = await Promise.all([
        fetch(`${API_BASE}/parking/all`),
        fetch(`${API_BASE}/gas/prices?country=${country}`),
        fetch(`${API_BASE}/charging/stations?country_code=${getCountryCode(country)}&lat=${latitude}&lng=${longitude}`),
        fetch(`${API_BASE}/speed-cameras?country=${country}&lat=${latitude}&lng=${longitude}`)
      ]);

      const [parkingData, gasData, chargingData, speedData] = await Promise.all([
        parkingRes.json(),
        gasRes.json(),
        chargingRes.json(),
        speedRes.json()
      ]);

      setMapData({
        parking: parkingData.success ? formatParkingForMap(parkingData.data) : [],
        gas: gasData.success ? gasData.data : [],
        charging: chargingData.success ? chargingData.data : [],
        speedCameras: speedData.success ? speedData.data : []
      });

    } catch (error) {
      console.error('Error fetching map data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatParkingForMap = (parkingData) => {
    const formatted = [];
    if (typeof parkingData === 'object') {
      Object.entries(parkingData).forEach(([city, locations]) => {
        if (Array.isArray(locations)) {
          locations.forEach(location => {
            formatted.push({
              type: 'parking',
              name: location.name,
              city: city,
              coordinates: location.coordinates || getCityCoordinates(city),
              free_spots: location.free_spots,
              total_spots: location.total_spots,
              status: location.status
            });
          });
        }
      });
    }
    return formatted;
  };

  const getCityCoordinates = (cityName) => {
    const cityCoords = {
      'Basel': [7.5886, 47.5596],
      'Zurich': [8.5417, 47.3769],
      'Freiburg': [7.8421, 47.9990],
      'Hamburg': [9.9937, 53.5511],
      'Dresden': [13.7373, 51.0504],
      'Berlin': [13.4050, 52.5200],
      'Munich': [11.5820, 48.1351]
    };
    return cityCoords[cityName] || [0, 0];
  };

  const getCountryCode = (countryName) => {
    const countryCodes = {
      'Germany': 'DE',
      'France': 'FR',
      'Italy': 'IT',
      'Spain': 'ES',
      'Netherlands': 'NL',
      'Belgium': 'BE',
      'Switzerland': 'CH',
      'Austria': 'AT',
      'Denmark': 'DK',
      'Sweden': 'SE',
      'Norway': 'NO',
      'Finland': 'FI',
      'Poland': 'PL',
      'Czech Republic': 'CZ',
      'Hungary': 'HU',
      'Portugal': 'PT',
      'Greece': 'GR'
    };
    return countryCodes[countryName] || 'DE';
  };

  const toggleDataType = (dataType) => {
    setSelectedDataTypes(prev => ({
      ...prev,
      [dataType]: !prev[dataType]
    }));
  };

  const getDataTypeIcon = (type) => {
    const icons = {
      parking: '🅿️',
      gas: '⛽',
      charging: '🔌',
      speedCameras: '📷'
    };
    return icons[type] || '📍';
  };

  const getDataTypeColor = (type) => {
    const colors = {
      parking: '#3498db',
      gas: '#e74c3c',
      charging: '#2ecc71',
      speedCameras: '#f39c12'
    };
    return colors[type] || '#95a5a6';
  };

  const renderDataPoint = (point, index) => {
    if (!selectedDataTypes[point.type]) return null;

    const [lng, lat] = point.coordinates || [0, 0];
    if (lng === 0 && lat === 0) return null;

    return (
      <div
        key={`${point.type}-${index}`}
        className="map-marker"
        style={{
          position: 'absolute',
          left: `${((lng + 180) / 360) * 100}%`,
          top: `${((90 - lat) / 180) * 100}%`,
          transform: 'translate(-50%, -50%)',
          backgroundColor: getDataTypeColor(point.type),
          color: 'white',
          borderRadius: '50%',
          width: '24px',
          height: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '12px',
          cursor: 'pointer',
          zIndex: 1000
        }}
        title={point.name || `${point.type} location`}
      >
        {getDataTypeIcon(point.type)}
      </div>
    );
  };

  const getAllDataPoints = () => {
    const allPoints = [];
    
    if (selectedDataTypes.parking) {
      allPoints.push(...mapData.parking);
    }
    if (selectedDataTypes.gas) {
      allPoints.push(...mapData.gas);
    }
    if (selectedDataTypes.charging) {
      allPoints.push(...mapData.charging);
    }
    if (selectedDataTypes.speedCameras) {
      allPoints.push(...mapData.speedCameras);
    }
    
    return allPoints;
  };

  return (
    <div className="map-view">
      <div className="map-controls">
        <div className="country-selector">
          <label>Select Country:</label>
          <select 
            value={selectedCountry} 
            onChange={(e) => setSelectedCountry(e.target.value)}
          >
            {europeanCountries.map(country => (
              <option key={country} value={country}>{country}</option>
            ))}
          </select>
        </div>

        <div className="data-type-filters">
          <h4>Show on Map:</h4>
          {Object.entries(selectedDataTypes).map(([type, enabled]) => (
            <label key={type} className="filter-checkbox">
              <input
                type="checkbox"
                checked={enabled}
                onChange={() => toggleDataType(type)}
              />
              <span style={{ color: getDataTypeColor(type) }}>
                {getDataTypeIcon(type)} {type.charAt(0).toUpperCase() + type.slice(1)}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="map-container" ref={mapContainer}>
        {loading ? (
          <div className="map-loading">
            <div className="loading-spinner"></div>
            <p>Loading map data for {selectedCountry}...</p>
          </div>
        ) : (
          <div className="map-placeholder">
            <div className="map-background">
              <h3>🗺️ DRIVEN Interactive Map</h3>
              <p>Showing data for: <strong>{selectedCountry}</strong></p>
              
              <div className="map-stats">
                <div className="stat">
                  <span className="stat-icon">🅿️</span>
                  <span>{mapData.parking.length} Parking Spots</span>
                </div>
                <div className="stat">
                  <span className="stat-icon">⛽</span>
                  <span>{mapData.gas.length} Gas Stations</span>
                </div>
                <div className="stat">
                  <span className="stat-icon">🔌</span>
                  <span>{mapData.charging.length} Charging Stations</span>
                </div>
                <div className="stat">
                  <span className="stat-icon">📷</span>
                  <span>{mapData.speedCameras.length} Speed Cameras</span>
                </div>
              </div>

              {/* Render data points */}
              <div className="data-points-overlay">
                {getAllDataPoints().map((point, index) => renderDataPoint(point, index))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="map-info">
        <h4>🚗 DRIVEN Map Features</h4>
        <ul>
          <li>✅ Real-time parking availability (13 cities)</li>
          <li>✅ European gas prices</li>
          <li>✅ 50,000+ EV charging stations</li>
          <li>✅ Speed camera locations</li>
          <li>✅ Interactive filtering</li>
        </ul>
        
        <div className="mapbox-integration-note">
          <h5>🗺️ Map Integration Ready</h5>
          <p>This component is ready for Mapbox integration. The data points are formatted and positioned for display on an interactive map.</p>
          <p><strong>Free Mapbox Tier:</strong> 50,000 map loads/month</p>
        </div>
      </div>
    </div>
  );
};

export default MapView;

