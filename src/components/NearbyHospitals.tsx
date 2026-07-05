import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { MapPin, Phone, Compass, ShieldAlert } from 'lucide-react';
import { HOSPITALS, type Hospital } from '../services/medicalData';

interface NearbyHospitalsProps {
  selectedSpecialtyFilter: string;
  setSelectedSpecialtyFilter: (specialty: string) => void;
  lang: string;
}

export default function NearbyHospitals({
  selectedSpecialtyFilter,
  setSelectedSpecialtyFilter,
  lang
}: NearbyHospitalsProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);

  // Filter hospitals based on selected specialty
  const getFilteredHospitals = () => {
    if (!selectedSpecialtyFilter || selectedSpecialtyFilter === 'All') {
      return HOSPITALS;
    }
    // Match specialty to hospital tags (case insensitive match)
    const filter = selectedSpecialtyFilter.toLowerCase();
    return HOSPITALS.filter(h => 
      h.specialties.some(s => s.toLowerCase().includes(filter)) ||
      (filter === 'general physician' && h.specialties.includes('General Medicine')) ||
      (filter === 'pulmonologist' && h.specialties.includes('Emergency Services')) ||
      (filter === 'cardiologist' && h.specialties.includes('Cardiology')) ||
      (filter === 'dermatologist' && h.specialties.includes('Dermatology')) ||
      (filter === 'pediatrician' && h.specialties.includes('Pediatrics')) ||
      (filter === 'neurologist' && h.specialties.includes('Neurology'))
    );
  };

  const filteredHospitals = getFilteredHospitals();

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Create Map
    const centerLat = 16.9891; // Kakinada Coordinates
    const centerLng = 82.2475;
    
    const map = L.map(mapContainerRef.current).setView([centerLat, centerLng], 13);
    mapRef.current = map;

    // Set Google Maps roadmap tile layer
    L.tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
      maxZoom: 20,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
      attribution: '&copy; <a href="https://maps.google.com">Google Maps</a>'
    }).addTo(map);

    // Add user marker
    const userIcon = L.divIcon({
      html: `<div style="background-color: #3b82f6; width: 18px; height: 18px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(59, 130, 246, 0.8); display: flex; align-items: center; justify-content: center;"><span style="color: white; font-size: 8px;">YOU</span></div>`,
      className: 'user-pin-icon',
      iconSize: [18, 18],
      iconAnchor: [9, 9]
    });
    L.marker([centerLat, centerLng], { icon: userIcon })
      .addTo(map)
      .bindPopup('<b>Your Current Location (Simulated)</b>')
      .openPopup();

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update Markers when filter changes
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    // Clear existing markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    // Add new markers
    filteredHospitals.forEach(hosp => {
      // Color marker red for emergency hospitals, primary green otherwise
      const markerColor = hosp.isEmergency ? '#ef4444' : '#0f766e';
      
      const hospIcon = L.divIcon({
        html: `<div style="background-color: ${markerColor}; width: 28px; height: 28px; border-radius: 50%; border: 3px solid white; box-shadow: 0 3px 6px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; transform: translateY(-4px);"><span style="color: white; font-size: 11px; font-weight: bold;">H</span></div>`,
        className: 'hosp-pin-icon',
        iconSize: [28, 28],
        iconAnchor: [14, 28],
        popupAnchor: [0, -28]
      });

      const marker = L.marker([hosp.lat, hosp.lng], { icon: hospIcon })
        .addTo(map)
        .bindPopup(`
          <div style="font-family: sans-serif; width: 180px;">
            <strong style="font-size: 14px; display: block; margin-bottom: 4px;">${hosp.name}</strong>
            <span style="font-size: 11px; color: #666; display: block; margin-bottom: 6px;">${hosp.specialties.slice(0,2).join(', ')}</span>
            <span style="font-size: 12px; font-weight: bold; color: ${markerColor};">${hosp.isEmergency ? '🚨 24/7 ER' : 'Standard Clinic'}</span>
          </div>
        `);

      marker.on('click', () => {
        setSelectedHospital(hosp);
        map.setView([hosp.lat, hosp.lng], 14);
      });

      markersRef.current.push(marker);
    });

    // Fit bounds if markers exist
    if (markersRef.current.length > 0) {
      const group = L.featureGroup(markersRef.current);
      // Wait slightly for container to lay out correctly
      setTimeout(() => {
        if (mapRef.current) {
          map.fitBounds(group.getBounds().pad(0.15));
        }
      }, 100);
    }
  }, [selectedSpecialtyFilter]);

  const handleHospitalSelect = (hosp: Hospital) => {
    setSelectedHospital(hosp);
    if (mapRef.current) {
      mapRef.current.setView([hosp.lat, hosp.lng], 15);
      // Find matching marker to open popup
      const idx = filteredHospitals.findIndex(h => h.id === hosp.id);
      if (idx !== -1 && markersRef.current[idx]) {
        markersRef.current[idx].openPopup();
      }
    }
  };

  const specialtiesList = [
    'All',
    'General Physician',
    'Cardiologist',
    'Neurologist',
    'Dermatologist',
    'Pediatrician'
  ];

  return (
    <div className="fade-in" style={styles.container}>
      <div style={styles.header}>
        <MapPin size={28} color="var(--primary)" />
        <h2>Nearby Hospitals & Clinics</h2>
      </div>

      {/* Filter Chips */}
      <div style={styles.filterRow}>
        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>Filter by Specialty:</span>
        <div style={styles.chipsWrapper}>
          {specialtiesList.map(spec => (
            <button
              key={spec}
              onClick={() => setSelectedSpecialtyFilter(spec)}
              style={{
                ...styles.chip,
                backgroundColor: selectedSpecialtyFilter === spec ? 'var(--primary)' : 'var(--bg-secondary)',
                color: selectedSpecialtyFilter === spec ? '#ffffff' : 'var(--text-main)',
                borderColor: selectedSpecialtyFilter === spec ? 'transparent' : 'var(--border-color)'
              }}
            >
              {spec}
            </button>
          ))}
        </div>
      </div>

      {/* Main Map Split Pane */}
      <div style={styles.splitLayout}>
        
        {/* Left Side: Hospital List */}
        <div style={styles.sidebar}>
          <h3 style={styles.sidebarTitle}>Available Facilities ({filteredHospitals.length})</h3>
          
          <div style={styles.listWrapper}>
            {filteredHospitals.length === 0 ? (
              <p style={styles.emptyText}>No clinics matched this filter in the simulated area.</p>
            ) : (
              filteredHospitals.map(hosp => (
                <div
                  key={hosp.id}
                  onClick={() => handleHospitalSelect(hosp)}
                  style={{
                    ...styles.hospItemCard,
                    borderColor: selectedHospital?.id === hosp.id ? 'var(--primary)' : 'var(--border-color)',
                    backgroundColor: selectedHospital?.id === hosp.id ? 'var(--primary-light)' : 'var(--bg-card)'
                  }}
                >
                  <div style={styles.hospItemHeader}>
                    <strong style={{ fontSize: '0.95rem' }}>{hosp.name}</strong>
                    {hosp.isEmergency && (
                      <span style={styles.erBadge}><ShieldAlert size={10} /> 24/7 ER</span>
                    )}
                  </div>
                  
                  <div style={styles.detailsGrid}>
                    <span style={styles.hospStat}>Distance: <strong>{hosp.distance} km</strong></span>
                    <span style={styles.hospStat}>Phone: <strong>{hosp.phone}</strong></span>
                  </div>

                  <p style={styles.hospSpecText}>
                    {hosp.specialties.join(' • ')}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Side: Interactive Leaflet Map + Directions */}
        <div style={styles.mapContainer}>
          <div style={styles.mapFrame}>
            <div ref={mapContainerRef} style={{ height: '100%', width: '100%' }}></div>
          </div>

          {/* Directions Panel */}
          {selectedHospital && (
            <div style={styles.directionsPanel} className="glass-card fade-in">
              <div style={styles.dirHeader}>
                <Compass size={18} color="var(--primary)" />
                <h4 style={{ margin: 0, fontSize: '0.92rem' }}>Directions to {selectedHospital.name}</h4>
              </div>
              <p style={styles.dirText}>
                {selectedHospital.directions[lang] || selectedHospital.directions['en']}
              </p>
              <div style={styles.dirActions}>
                <a 
                  href={`tel:${selectedHospital.phone}`}
                  className="btn btn-outline"
                  style={styles.dirBtn}
                >
                  <Phone size={14} /> Call hospital
                </a>
                <button
                  onClick={() => alert(`SIMULATION:\nGenerating GPS Navigation route from your location to ${selectedHospital.name}...\nEstimated Time: ${Math.round(selectedHospital.distance * 3 + 2)} minutes via car.`)}
                  className="btn btn-primary"
                  style={styles.dirBtn}
                >
                  Start GPS Guide
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1.25rem',
    height: 'calc(100vh - 120px)'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem'
  },
  filterRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    flexWrap: 'wrap' as const
  },
  chipsWrapper: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap' as const
  },
  chip: {
    border: '1px solid var(--border-color)',
    padding: '0.35rem 0.85rem',
    borderRadius: 'var(--radius-full)',
    cursor: 'pointer',
    fontSize: '0.8rem',
    fontWeight: 600,
    transition: 'all var(--transition-fast)'
  },
  splitLayout: {
    flex: 1,
    display: 'flex',
    gap: '1.25rem',
    minHeight: 0, /* Ensures scrolling works correctly inside flex children */
    flexWrap: 'wrap' as const
  },
  sidebar: {
    flex: 1,
    minWidth: '280px',
    backgroundColor: 'var(--bg-card)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-lg)',
    padding: '1.25rem',
    display: 'flex',
    flexDirection: 'column' as const,
    height: '100%',
    minHeight: '200px'
  },
  sidebarTitle: {
    fontSize: '1.1rem',
    fontWeight: 800,
    marginBottom: '1rem',
    color: 'var(--text-main)'
  },
  listWrapper: {
    flex: 1,
    overflowY: 'auto' as const,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.75rem',
    paddingRight: '0.25rem'
  },
  emptyText: {
    fontSize: '0.85rem',
    color: 'var(--text-muted)'
  },
  hospItemCard: {
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-md)',
    padding: '1rem',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
    transition: 'all var(--transition-fast)'
  },
  hospItemHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '0.5rem'
  },
  erBadge: {
    backgroundColor: 'var(--danger-light)',
    color: 'var(--danger)',
    fontSize: '0.7rem',
    fontWeight: 800,
    padding: '0.15rem 0.4rem',
    borderRadius: 'var(--radius-sm)',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.2rem',
    whiteSpace: 'nowrap' as const
  },
  detailsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '0.5rem'
  },
  hospStat: {
    fontSize: '0.78rem',
    color: 'var(--text-muted)'
  },
  hospSpecText: {
    margin: 0,
    fontSize: '0.75rem',
    color: 'var(--primary)',
    fontWeight: 600
  },
  mapContainer: {
    flex: 2,
    minWidth: '320px',
    height: '100%',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1rem',
    position: 'relative' as const
  },
  mapFrame: {
    flex: 1,
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-lg)',
    overflow: 'hidden' as const,
    minHeight: '300px'
  },
  directionsPanel: {
    padding: '1rem',
    borderLeft: '4px solid var(--primary)',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem'
  },
  dirHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  dirText: {
    margin: 0,
    fontSize: '0.85rem',
    color: 'var(--text-muted)',
    lineHeight: '1.4'
  },
  dirActions: {
    display: 'flex',
    gap: '0.6rem',
    marginTop: '0.4rem'
  },
  dirBtn: {
    padding: '0.4rem 0.8rem',
    fontSize: '0.8rem'
  }
};
