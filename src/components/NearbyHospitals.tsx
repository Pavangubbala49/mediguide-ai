import { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import { MapPin, Phone, Compass, ShieldAlert, Layers, Loader, Navigation, AlertCircle } from 'lucide-react';
import { HOSPITALS, type Hospital } from '../services/medicalData';

interface NearbyHospitalsProps {
  selectedSpecialtyFilter: string;
  setSelectedSpecialtyFilter: (specialty: string) => void;
  lang: string;
}

// Haversine distance in km between two lat/lng points
function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(1));
}

// Map OSM healthcare tags to readable specialties
function inferSpecialties(tags: Record<string, string>): string[] {
  const specialties: string[] = [];
  const healthcareType = (tags['healthcare'] || '').toLowerCase();
  const specialtyTag = (tags['healthcare:speciality'] || tags['medical_system:speciality'] || '').toLowerCase();
  const name = (tags['name'] || '').toLowerCase();

  if (specialtyTag) {
    specialtyTag.split(';').forEach(s => {
      const trimmed = s.trim();
      if (trimmed) specialties.push(trimmed.charAt(0).toUpperCase() + trimmed.slice(1));
    });
  }

  if (healthcareType === 'hospital' || name.includes('hospital')) {
    if (!specialties.some(s => s.toLowerCase().includes('general'))) specialties.push('General Medicine');
  }
  if (healthcareType === 'clinic' || name.includes('clinic')) {
    if (specialties.length === 0) specialties.push('General Medicine');
  }
  if (tags['emergency'] === 'yes') {
    specialties.push('Emergency Services');
  }

  // Keyword-based detection from name
  const keywordMap: Record<string, string> = {
    'cardio': 'Cardiology', 'heart': 'Cardiology',
    'neuro': 'Neurology', 'brain': 'Neurology',
    'ortho': 'Orthopedics', 'bone': 'Orthopedics',
    'eye': 'Ophthalmology', 'ophthal': 'Ophthalmology',
    'child': 'Pediatrics', 'pediatr': 'Pediatrics', 'paediatr': 'Pediatrics',
    'skin': 'Dermatology', 'dermat': 'Dermatology',
    'dental': 'Dentistry', 'teeth': 'Dentistry',
    'cancer': 'Oncology', 'onco': 'Oncology',
    'kidney': 'Nephrology', 'renal': 'Nephrology',
    'uro': 'Urology',
    'gynaec': 'Gynaecology', 'gynec': 'Gynaecology', 'maternity': 'Gynaecology',
    'ent': 'ENT',
    'physio': 'Physiotherapy',
    'ayurved': 'Ayurveda', 'homeo': 'Homeopathy',
  };

  for (const [keyword, specialty] of Object.entries(keywordMap)) {
    if (name.includes(keyword) && !specialties.includes(specialty)) {
      specialties.push(specialty);
    }
  }

  return specialties.length > 0 ? specialties : ['General Medicine'];
}

// Fetch nearby hospitals from Overpass API
async function fetchNearbyHospitals(lat: number, lng: number, radiusMeters = 8000): Promise<Hospital[]> {
  const query = `
    [out:json][timeout:15];
    (
      node["amenity"="hospital"](around:${radiusMeters},${lat},${lng});
      node["amenity"="clinic"](around:${radiusMeters},${lat},${lng});
      node["amenity"="doctors"](around:${radiusMeters},${lat},${lng});
      node["healthcare"="hospital"](around:${radiusMeters},${lat},${lng});
      node["healthcare"="clinic"](around:${radiusMeters},${lat},${lng});
      way["amenity"="hospital"](around:${radiusMeters},${lat},${lng});
      way["amenity"="clinic"](around:${radiusMeters},${lat},${lng});
      way["healthcare"="hospital"](around:${radiusMeters},${lat},${lng});
    );
    out center body;
  `;

  const response = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    body: `data=${encodeURIComponent(query)}`,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });

  if (!response.ok) throw new Error('Overpass API request failed');

  const data = await response.json();
  const seen = new Set<string>();

  const hospitals: Hospital[] = data.elements
    .filter((el: any) => {
      const tags = el.tags || {};
      const name = tags.name || tags['name:en'];
      if (!name) return false;
      // Deduplicate by name
      const key = name.toLowerCase().trim();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .map((el: any, idx: number) => {
      const tags = el.tags || {};
      const elLat = el.lat || el.center?.lat;
      const elLng = el.lon || el.center?.lon;
      const distance = haversineDistance(lat, lng, elLat, elLng);
      const hasEmergency = tags.emergency === 'yes' || (tags.name || '').toLowerCase().includes('emergency');
      const specialties = inferSpecialties(tags);

      return {
        id: `osm_${el.id || idx}`,
        name: tags.name || tags['name:en'] || 'Medical Facility',
        lat: elLat,
        lng: elLng,
        phone: tags.phone || tags['contact:phone'] || 'N/A',
        specialties,
        distance,
        directions: {
          en: tags['addr:full'] || tags['addr:street']
            ? `Located at ${tags['addr:full'] || tags['addr:street']}${tags['addr:city'] ? ', ' + tags['addr:city'] : ''}`
            : `Approximately ${distance} km from your current location. Open Google Maps for turn-by-turn navigation.`,
        },
        isEmergency: hasEmergency,
      } as Hospital;
    })
    .sort((a: Hospital, b: Hospital) => a.distance - b.distance);

  return hospitals;
}

export default function NearbyHospitals({
  selectedSpecialtyFilter,
  setSelectedSpecialtyFilter,
  lang,
}: NearbyHospitalsProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);

  const [mapViewMode, setMapViewMode] = useState<'roadmap' | 'satellite'>('roadmap');
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);

  // Location & data states
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState<'loading' | 'success' | 'denied' | 'error'>('loading');
  const [liveHospitals, setLiveHospitals] = useState<Hospital[]>([]);
  const [isLoadingHospitals, setIsLoadingHospitals] = useState(false);
  const [locationLabel, setLocationLabel] = useState<string>('');

  // Use live hospitals if available, otherwise fall back to hardcoded
  const hospitalSource = liveHospitals.length > 0 ? liveHospitals : HOSPITALS;

  // Filter hospitals based on selected specialty
  const getFilteredHospitals = useCallback(() => {
    if (!selectedSpecialtyFilter || selectedSpecialtyFilter === 'All') {
      return hospitalSource;
    }
    const filter = selectedSpecialtyFilter.toLowerCase();
    return hospitalSource.filter(
      (h) =>
        h.specialties.some((s) => s.toLowerCase().includes(filter)) ||
        (filter === 'general physician' && h.specialties.includes('General Medicine')) ||
        (filter === 'pulmonologist' && h.specialties.includes('Emergency Services')) ||
        (filter === 'cardiologist' && h.specialties.includes('Cardiology')) ||
        (filter === 'dermatologist' && h.specialties.includes('Dermatology')) ||
        (filter === 'pediatrician' && h.specialties.includes('Pediatrics')) ||
        (filter === 'neurologist' && h.specialties.includes('Neurology'))
    );
  }, [hospitalSource, selectedSpecialtyFilter]);

  const filteredHospitals = getFilteredHospitals();

  // 1. Get user location on mount
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationStatus('error');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const loc = { lat: position.coords.latitude, lng: position.coords.longitude };
        setUserLocation(loc);
        setLocationStatus('success');

        // Reverse geocode for display label
        fetch(`https://nominatim.openstreetmap.org/reverse?lat=${loc.lat}&lon=${loc.lng}&format=json`)
          .then(r => r.json())
          .then(data => {
            const addr = data.address || {};
            const label = addr.city || addr.town || addr.village || addr.county || addr.state || 'Your Area';
            setLocationLabel(label);
          })
          .catch(() => setLocationLabel('Your Area'));
      },
      (err) => {
        console.warn('Geolocation denied or unavailable:', err.message);
        setLocationStatus('denied');
        // Fall back to default (hardcoded hospitals will be used)
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, []);

  // 2. Fetch real hospitals once we have user location
  useEffect(() => {
    if (!userLocation) return;

    setIsLoadingHospitals(true);
    fetchNearbyHospitals(userLocation.lat, userLocation.lng, 10000)
      .then((hospitals) => {
        setLiveHospitals(hospitals);
      })
      .catch((err) => {
        console.error('Failed to fetch live hospitals:', err);
        // Fall back to hardcoded data silently
      })
      .finally(() => {
        setIsLoadingHospitals(false);
      });
  }, [userLocation]);

  // 3. Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Center on user location if available, else default
    const centerLat = userLocation?.lat ?? 16.9891;
    const centerLng = userLocation?.lng ?? 82.2475;

    const map = L.map(mapContainerRef.current).setView([centerLat, centerLng], 13);
    mapRef.current = map;

    const tileLayer = L.tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
      maxZoom: 20,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
      attribution: '&copy; <a href="https://maps.google.com">Google Maps</a>',
    }).addTo(map);
    tileLayerRef.current = tileLayer;

    // Add user marker
    const userIcon = L.divIcon({
      html: `<div style="background: linear-gradient(135deg, #3b82f6, #8b5cf6); width: 22px; height: 22px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 12px rgba(59, 130, 246, 0.8), 0 0 24px rgba(59, 130, 246, 0.4); display: flex; align-items: center; justify-content: center; animation: pulse-ring 2s infinite;"><span style="color: white; font-size: 7px; font-weight: 900;">YOU</span></div>`,
      className: 'user-pin-icon',
      iconSize: [22, 22],
      iconAnchor: [11, 11],
    });
    const userMarker = L.marker([centerLat, centerLng], { icon: userIcon })
      .addTo(map)
      .bindPopup(`<b>📍 Your Current Location</b><br/><span style="font-size:11px;color:#666;">${locationLabel || 'Detecting...'}</span>`)
      .openPopup();
    userMarkerRef.current = userMarker;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [userLocation, locationLabel]);

  // Swap tile layer when mapViewMode changes
  useEffect(() => {
    if (!mapRef.current || !tileLayerRef.current) return;
    const map = mapRef.current;
    map.removeLayer(tileLayerRef.current);

    const lyrs = mapViewMode === 'satellite' ? 's,h' : 'm';
    const newTile = L.tileLayer(`http://{s}.google.com/vt/lyrs=${lyrs}&x={x}&y={y}&z={z}`, {
      maxZoom: 20,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
      attribution: '&copy; <a href="https://maps.google.com">Google Maps</a>',
    }).addTo(map);

    newTile.setZIndex(0);
    tileLayerRef.current = newTile;
  }, [mapViewMode]);

  // Update Markers when hospitals or filter changes
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    // Clear existing markers (not user marker)
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    filteredHospitals.forEach((hosp) => {
      const markerColor = hosp.isEmergency ? '#ef4444' : '#0f766e';

      const hospIcon = L.divIcon({
        html: `<div style="background-color: ${markerColor}; width: 28px; height: 28px; border-radius: 50%; border: 3px solid white; box-shadow: 0 3px 6px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; transform: translateY(-4px);"><span style="color: white; font-size: 11px; font-weight: bold;">H</span></div>`,
        className: 'hosp-pin-icon',
        iconSize: [28, 28],
        iconAnchor: [14, 28],
        popupAnchor: [0, -28],
      });

      const marker = L.marker([hosp.lat, hosp.lng], { icon: hospIcon })
        .addTo(map)
        .bindPopup(
          `<div style="font-family: sans-serif; width: 200px;">
            <strong style="font-size: 13px; display: block; margin-bottom: 4px;">${hosp.name}</strong>
            <span style="font-size: 11px; color: #666; display: block; margin-bottom: 4px;">${hosp.specialties.slice(0, 3).join(', ')}</span>
            <span style="font-size: 11px; color: #888; display: block; margin-bottom: 4px;">📍 ${hosp.distance} km away</span>
            <span style="font-size: 12px; font-weight: bold; color: ${markerColor};">${hosp.isEmergency ? '🚨 24/7 ER' : '🏥 Medical Facility'}</span>
            ${hosp.phone !== 'N/A' ? `<br/><a href="tel:${hosp.phone}" style="font-size: 11px; color: #3b82f6;">📞 ${hosp.phone}</a>` : ''}
          </div>`
        );

      marker.on('click', () => {
        setSelectedHospital(hosp);
        map.setView([hosp.lat, hosp.lng], 15);
      });

      markersRef.current.push(marker);
    });

    // Fit bounds if markers exist
    if (markersRef.current.length > 0) {
      const allMarkers = userMarkerRef.current
        ? [userMarkerRef.current, ...markersRef.current]
        : markersRef.current;
      const group = L.featureGroup(allMarkers);
      setTimeout(() => {
        if (mapRef.current) {
          map.fitBounds(group.getBounds().pad(0.12));
        }
      }, 150);
    }
  }, [filteredHospitals]);

  const handleHospitalSelect = (hosp: Hospital) => {
    setSelectedHospital(hosp);
    if (mapRef.current) {
      mapRef.current.setView([hosp.lat, hosp.lng], 15);
      const idx = filteredHospitals.findIndex((h) => h.id === hosp.id);
      if (idx !== -1 && markersRef.current[idx]) {
        markersRef.current[idx].openPopup();
      }
    }
  };

  const openGoogleMapsDirections = (hosp: Hospital) => {
    const origin = userLocation
      ? `${userLocation.lat},${userLocation.lng}`
      : '';
    const dest = `${hosp.lat},${hosp.lng}`;
    const url = origin
      ? `https://www.google.com/maps/dir/${origin}/${dest}`
      : `https://www.google.com/maps/search/?api=1&query=${dest}`;
    window.open(url, '_blank');
  };

  const specialtiesList = [
    'All',
    'General Physician',
    'Cardiologist',
    'Neurologist',
    'Dermatologist',
    'Pediatrician',
    'Ophthalmology',
    'Orthopedics',
    'Dentistry',
  ];

  return (
    <div className="fade-in" style={styles.container}>
      <div style={styles.header}>
        <MapPin size={28} color="var(--primary)" />
        <h2>Nearby Hospitals & Clinics</h2>
      </div>

      {/* Location Status Banner */}
      <div style={styles.locationBanner}>
        {locationStatus === 'loading' && (
          <>
            <Loader size={16} color="var(--primary)" style={{ animation: 'spin 1s linear infinite' }} />
            <span>Detecting your location...</span>
          </>
        )}
        {locationStatus === 'success' && (
          <>
            <Navigation size={16} color="#10b981" />
            <span>
              📍 Showing hospitals near <strong>{locationLabel || 'your location'}</strong>
              {isLoadingHospitals && ' — Fetching nearby facilities...'}
            </span>
          </>
        )}
        {locationStatus === 'denied' && (
          <>
            <AlertCircle size={16} color="#f59e0b" />
            <span>Location access denied. Showing default hospitals (Kakinada). Allow location access for real results.</span>
          </>
        )}
        {locationStatus === 'error' && (
          <>
            <AlertCircle size={16} color="#ef4444" />
            <span>Geolocation not supported in this browser. Showing default hospitals.</span>
          </>
        )}
      </div>

      {/* Filter Chips */}
      <div style={styles.filterRow}>
        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>Filter by Specialty:</span>
        <div style={styles.chipsWrapper}>
          {specialtiesList.map((spec) => (
            <button
              key={spec}
              onClick={() => setSelectedSpecialtyFilter(spec)}
              style={{
                ...styles.chip,
                backgroundColor: selectedSpecialtyFilter === spec ? 'var(--primary)' : 'var(--bg-secondary)',
                color: selectedSpecialtyFilter === spec ? '#ffffff' : 'var(--text-main)',
                borderColor: selectedSpecialtyFilter === spec ? 'transparent' : 'var(--border-color)',
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
          <h3 style={styles.sidebarTitle}>
            {liveHospitals.length > 0 ? 'Nearby' : 'Available'} Facilities ({filteredHospitals.length})
          </h3>

          <div style={styles.listWrapper}>
            {isLoadingHospitals ? (
              <div style={styles.loadingBox}>
                <Loader size={24} color="var(--primary)" style={{ animation: 'spin 1s linear infinite' }} />
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Searching for hospitals near you...
                </p>
              </div>
            ) : filteredHospitals.length === 0 ? (
              <p style={styles.emptyText}>No facilities matched this filter near your area. Try "All" to see all results.</p>
            ) : (
              filteredHospitals.map((hosp) => (
                <div
                  key={hosp.id}
                  onClick={() => handleHospitalSelect(hosp)}
                  style={{
                    ...styles.hospItemCard,
                    borderColor: selectedHospital?.id === hosp.id ? 'var(--primary)' : 'var(--border-color)',
                    backgroundColor: selectedHospital?.id === hosp.id ? 'var(--primary-light)' : 'var(--bg-card)',
                  }}
                >
                  <div style={styles.hospItemHeader}>
                    <strong style={{ fontSize: '0.95rem' }}>{hosp.name}</strong>
                    {hosp.isEmergency && (
                      <span style={styles.erBadge}>
                        <ShieldAlert size={10} /> 24/7 ER
                      </span>
                    )}
                  </div>

                  <div style={styles.detailsGrid}>
                    <span style={styles.hospStat}>
                      Distance: <strong>{hosp.distance} km</strong>
                    </span>
                    <span style={styles.hospStat}>
                      Phone: <strong>{hosp.phone}</strong>
                    </span>
                  </div>

                  <p style={styles.hospSpecText}>{hosp.specialties.join(' • ')}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Side: Interactive Leaflet Map + Directions */}
        <div style={styles.mapContainer}>
          <div style={styles.mapFrame}>
            <div ref={mapContainerRef} style={{ height: '100%', width: '100%' }}></div>

            {/* Satellite / Roadmap Toggle */}
            <button
              onClick={() => setMapViewMode((prev) => (prev === 'roadmap' ? 'satellite' : 'roadmap'))}
              style={styles.mapViewToggle}
              title={mapViewMode === 'roadmap' ? 'Switch to Satellite View' : 'Switch to Roadmap View'}
            >
              <Layers size={16} />
              <span>{mapViewMode === 'roadmap' ? 'Satellite' : 'Roadmap'}</span>
            </button>
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
                {selectedHospital.phone !== 'N/A' && (
                  <a href={`tel:${selectedHospital.phone}`} className="btn btn-outline" style={styles.dirBtn}>
                    <Phone size={14} /> Call Hospital
                  </a>
                )}
                <button
                  onClick={() => openGoogleMapsDirections(selectedHospital)}
                  className="btn btn-primary"
                  style={styles.dirBtn}
                >
                  <Navigation size={14} /> Open in Google Maps
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
    gap: '1rem',
    height: 'calc(100vh - 120px)',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
  },
  locationBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
    padding: '0.6rem 1rem',
    borderRadius: 'var(--radius-md)',
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    fontSize: '0.82rem',
    color: 'var(--text-main)',
    fontWeight: 500,
  },
  filterRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    flexWrap: 'wrap' as const,
  },
  chipsWrapper: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap' as const,
  },
  chip: {
    border: '1px solid var(--border-color)',
    padding: '0.35rem 0.85rem',
    borderRadius: 'var(--radius-full)',
    cursor: 'pointer',
    fontSize: '0.8rem',
    fontWeight: 600,
    transition: 'all var(--transition-fast)',
  },
  splitLayout: {
    flex: 1,
    display: 'flex',
    gap: '1.25rem',
    minHeight: 0,
    flexWrap: 'wrap' as const,
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
    minHeight: '200px',
  },
  sidebarTitle: {
    fontSize: '1.1rem',
    fontWeight: 800,
    marginBottom: '1rem',
    color: 'var(--text-main)',
  },
  listWrapper: {
    flex: 1,
    overflowY: 'auto' as const,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.75rem',
    paddingRight: '0.25rem',
  },
  loadingBox: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    gap: '1rem',
    padding: '2rem',
  },
  emptyText: {
    fontSize: '0.85rem',
    color: 'var(--text-muted)',
  },
  hospItemCard: {
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-md)',
    padding: '1rem',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
    transition: 'all var(--transition-fast)',
  },
  hospItemHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '0.5rem',
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
    whiteSpace: 'nowrap' as const,
  },
  detailsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '0.5rem',
  },
  hospStat: {
    fontSize: '0.78rem',
    color: 'var(--text-muted)',
  },
  hospSpecText: {
    margin: 0,
    fontSize: '0.75rem',
    color: 'var(--primary)',
    fontWeight: 600,
  },
  mapContainer: {
    flex: 2,
    minWidth: '320px',
    height: '100%',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1rem',
    position: 'relative' as const,
  },
  mapFrame: {
    flex: 1,
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-lg)',
    overflow: 'hidden' as const,
    minHeight: '300px',
    position: 'relative' as const,
  },
  mapViewToggle: {
    position: 'absolute' as const,
    top: '12px',
    right: '12px',
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    padding: '0.45rem 0.85rem',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-color)',
    backgroundColor: 'var(--bg-card)',
    color: 'var(--text-main)',
    fontSize: '0.8rem',
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
    backdropFilter: 'blur(8px)',
    transition: 'all var(--transition-fast)',
  },
  directionsPanel: {
    padding: '1rem',
    borderLeft: '4px solid var(--primary)',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
  },
  dirHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  dirText: {
    margin: 0,
    fontSize: '0.85rem',
    color: 'var(--text-muted)',
    lineHeight: '1.4',
  },
  dirActions: {
    display: 'flex',
    gap: '0.6rem',
    marginTop: '0.4rem',
  },
  dirBtn: {
    padding: '0.4rem 0.8rem',
    fontSize: '0.8rem',
  },
};
