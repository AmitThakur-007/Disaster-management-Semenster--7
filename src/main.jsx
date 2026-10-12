import React, { useEffect, useState, useCallback, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import './styles.css';
import RedesignedHomepage from './homepage.jsx';
import {
  PROVINCES,
  DISTRICTS_BY_PROVINCE,
  ALL_DISTRICTS,
  DISTRICT_COORDINATES,
  getDistrictsForProvince,
  getMunicipalitiesForDistrict,
  getWardsForMunicipality,
  getProvinceForDistrict
} from './nepalLocationData.js';

// Fix Leaflet's default marker icon paths in bundled Vite build
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

// ── Utilities ─────────────────────────────────────────────────────────────────
async function request(url, method = 'GET', body) {
  const res = await fetch(url, {
    method,
    credentials: 'include',
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined
  });
  let data;
  try {
    data = await res.json();
  } catch {
    throw new Error('Service unavailable. Please refresh in a moment.');
  }
  if (!res.ok) {
    const e = new Error(data.error || data.message || 'Request failed.');
    e.status = res.status;
    e.data = data;
    throw e;
  }
  return data;
}

function fmtDate(v) {
  if (!v) return '';
  return new Date(v).toLocaleString('en-GB', { timeZone: 'Asia/Kathmandu',
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function fmtShort(v) {
  if (!v) return '';
  return new Date(v).toLocaleDateString('en-GB', { timeZone: 'Asia/Kathmandu',
    day: '2-digit', month: 'short', year: 'numeric' });
}

function roleLabel(r) {
  return ({ ADMIN: 'Administrator', SUPERADMIN: 'Super Admin', RESPONDER: 'Responder', RESIDENT: 'Citizen' })[r] || r;
}

const HAZARDS = [
  'Flood', 'Landslide', 'Earthquake', 'Fire', 'Road accident',
  'Severe storm', 'Rising water', 'Land crack', 'Other emergency', 'Other concern'
];

// Kathmandu center default coordinates
const KTM_LAT = 27.7172;
const KTM_LNG = 85.3240;

// Section persistence via localStorage (non-sensitive UI state only)
const VALID_SECTIONS = {
  RESIDENT: ['report', 'my-reports', 'community', 'notifications', 'profile'],
  ADMIN: ['admin-overview', 'admin-reports', 'admin-map', 'admin-orgs', 'admin-users', 'notifications', 'profile'],
  RESPONDER: ['responder', 'community', 'notifications', 'profile'],
};

function getSavedSection(role) {
  try {
    const saved = localStorage.getItem('cdw_section');
    if (!saved) return null;
    const { section, savedRole } = JSON.parse(saved);
    if (savedRole !== role) return null;
    if (!VALID_SECTIONS[role]?.includes(section)) return null;
    return section;
  } catch { return null; }
}

function saveSection(section, role) {
  try { localStorage.setItem('cdw_section', JSON.stringify({ section, savedRole: role })); } catch {}
}

function clearSection() {
  try { localStorage.removeItem('cdw_section'); } catch {}
}

// ── Cascading Nepal Administrative Location Selector ─────────────────────────
// Step 1: Province → Step 2: District (77 districts) → Step 3: Municipality → Step 4: Ward / Area
function NepalLocationSelector({
  province,
  district,
  municipality,
  ward,
  wardOther,
  onProvinceChange,
  onDistrictChange,
  onMunicipalityChange,
  onWardChange,
  onWardOtherChange,
  onDistrictCenterSelected,
  disabled = false,
  required = false
}) {
  const availableDistricts = province ? getDistrictsForProvince(province) : ALL_DISTRICTS.map(d => d.name);
  const availableMunicipalities = district ? getMunicipalitiesForDistrict(district) : [];
  const availableWards = (district && municipality && municipality !== 'Other')
    ? getWardsForMunicipality(district, municipality)
    : [];

  function handleProvinceSelect(e) {
    const val = e.target.value;
    onProvinceChange(val);
    onDistrictChange('');
    onMunicipalityChange('');
    onWardChange('');
    if (onWardOtherChange) onWardOtherChange('');
  }

  function handleDistrictSelect(e) {
    const val = e.target.value;
    onDistrictChange(val);
    if (val && !province) {
      const p = getProvinceForDistrict(val);
      if (p) onProvinceChange(p);
    }
    onMunicipalityChange('');
    onWardChange('');
    if (onWardOtherChange) onWardOtherChange('');
    if (val && DISTRICT_COORDINATES[val] && onDistrictCenterSelected) {
      onDistrictCenterSelected(DISTRICT_COORDINATES[val]);
    }
  }

  function handleMunicipalitySelect(e) {
    const val = e.target.value;
    onMunicipalityChange(val);
    onWardChange('');
    if (onWardOtherChange) onWardOtherChange('');
  }

  function handleWardSelect(e) {
    const val = e.target.value;
    onWardChange(val);
    if (val !== 'Other' && onWardOtherChange) onWardOtherChange('');
  }

  const showOtherField = municipality === 'Other' || ward === 'Other';

  return (
    <div className="nepal-location-cascade">
      <div className="location-steps-grid">
        {/* Step 1: Province */}
        <div className="location-step-field">
          <label className="location-step-label">
            <span className="step-badge">1</span> Province {required && <span className="required">*</span>}
            <select
              className="location-select"
              value={province || ''}
              onChange={handleProvinceSelect}
              disabled={disabled}
              required={required}
              aria-label="Select Province"
            >
              <option value="">— Select Province (7 Provinces) —</option>
              {PROVINCES.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </label>
        </div>

        {/* Step 2: District */}
        <div className="location-step-field">
          <label className="location-step-label">
            <span className="step-badge">2</span> District {required && <span className="required">*</span>}
            <select
              className="location-select"
              value={district || ''}
              onChange={handleDistrictSelect}
              disabled={disabled}
              required={required}
              aria-label="Select District"
            >
              <option value="">
                {!province ? '— Select District (All 77 Districts) —' : `— Select District (${availableDistricts.length} in ${province}) —`}
              </option>
              {availableDistricts.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </label>
        </div>

        {/* Step 3: Municipality */}
        <div className="location-step-field">
          <label className="location-step-label">
            <span className="step-badge">3</span> Municipality / Local Body {required && <span className="required">*</span>}
            <select
              className="location-select"
              value={municipality || ''}
              onChange={handleMunicipalitySelect}
              disabled={disabled || !district}
              required={required}
              aria-label="Select Municipality or Rural Municipality"
            >
              <option value="">
                {!district ? '— First select a district —' : `— Select Municipality (${availableMunicipalities.length} local levels) —`}
              </option>
              {availableMunicipalities.map(m => (
                <option key={m.name} value={m.name}>{m.name}</option>
              ))}
              <option value="Other">⊕ Other / Not listed</option>
            </select>
          </label>
        </div>

        {/* Step 4: Ward */}
        <div className="location-step-field">
          <label className="location-step-label">
            <span className="step-badge">4</span> Ward / Area
            <select
              className="location-select"
              value={ward || ''}
              onChange={handleWardSelect}
              disabled={disabled || !municipality || municipality === 'Other'}
              aria-label="Select Ward"
            >
              <option value="">
                {!municipality ? '— First select municipality —' : municipality === 'Other' ? '— Specify locality below —' : '— Select Ward —'}
              </option>
              {availableWards.map(w => (
                <option key={w} value={w}>{w}</option>
              ))}
              <option value="Other">⊕ Other / Ward not listed</option>
            </select>
          </label>
        </div>
      </div>

      {/* Other / Specific Locality Name Input */}
      {showOtherField && (
        <div className="location-other-container">
          <label className="location-other-label">
            Specific locality / neighborhood / village name <span className="required">*</span>
            <input
              type="text"
              className="location-other-input"
              value={wardOther || ''}
              onChange={e => onWardOtherChange && onWardOtherChange(e.target.value)}
              placeholder="e.g. Tole name, chowk, landmark, or village area"
              maxLength={120}
              disabled={disabled}
              required={required}
            />
          </label>
          <small className="hint">For rural settlements, unlisted wards, or specific local landmarks.</small>
        </div>
      )}
    </div>
  );
}

// ── Interactive Leaflet Location Picker Map (bundled dependency, no CDN script) ─
function LocationPickerMap({ lat, lng, onLocationSelect, readOnly, centerCoordinates }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState('');

  const initLat = lat || (centerCoordinates?.lat ?? KTM_LAT);
  const initLng = lng || (centerCoordinates?.lng ?? KTM_LNG);

  // Initialize Leaflet map instance cleanly
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;
    try {
      const map = L.map(mapRef.current, {
        zoomControl: true,
        attributionControl: true
      }).setView([initLat, initLng], lat ? 15 : 12);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
      }).addTo(map);

      mapInstanceRef.current = map;

      // Initial marker if coordinates already provided
      if (lat && lng) {
        const marker = L.marker([lat, lng], { draggable: !readOnly }).addTo(map);
        markerRef.current = marker;
        if (!readOnly) {
          marker.on('dragend', () => {
            const pos = marker.getLatLng();
            onLocationSelect(pos.lat, pos.lng);
            reverseGeocode(pos.lat, pos.lng);
          });
        }
      }

      if (!readOnly) {
        map.on('click', e => {
          const { lat: clickLat, lng: clickLng } = e.latlng;
          if (markerRef.current) {
            markerRef.current.setLatLng([clickLat, clickLng]);
          } else {
            const marker = L.marker([clickLat, clickLng], { draggable: true }).addTo(map);
            markerRef.current = marker;
            marker.on('dragend', () => {
              const pos = marker.getLatLng();
              onLocationSelect(pos.lat, pos.lng);
              reverseGeocode(pos.lat, pos.lng);
            });
          }
          onLocationSelect(clickLat, clickLng);
          reverseGeocode(clickLat, clickLng);
        });
      }
    } catch (err) {
      console.error('Error initializing map:', err);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      }
    };
  }, []);

  // Update map view when district center coordinates change
  useEffect(() => {
    if (!mapInstanceRef.current || !centerCoordinates || lat) return;
    mapInstanceRef.current.setView([centerCoordinates.lat, centerCoordinates.lng], 12);
  }, [centerCoordinates?.lat, centerCoordinates?.lng]);

  // Sync marker position when props change externally
  useEffect(() => {
    if (!mapInstanceRef.current || !lat || !lng) return;
    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
    } else {
      const marker = L.marker([lat, lng], { draggable: !readOnly }).addTo(mapInstanceRef.current);
      markerRef.current = marker;
      if (!readOnly) {
        marker.on('dragend', () => {
          const pos = marker.getLatLng();
          onLocationSelect(pos.lat, pos.lng);
          reverseGeocode(pos.lat, pos.lng);
        });
      }
    }
  }, [lat, lng]);

  function reverseGeocode(targetLat, targetLng) {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${targetLat}&lon=${targetLng}&format=json&accept-language=en`;
    fetch(url, { headers: { 'Accept-Language': 'en' } })
      .then(r => r.json())
      .then(data => {
        if (data && data.address && onLocationSelect) {
          onLocationSelect(targetLat, targetLng, data);
        }
      })
      .catch(() => {});
  }

  function useCurrentLocation() {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.');
      return;
    }
    setGeoLoading(true);
    setGeoError('');
    navigator.geolocation.getCurrentPosition(
      pos => {
        const { latitude, longitude } = pos.coords;
        setGeoLoading(false);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView([latitude, longitude], 16);
          if (markerRef.current) {
            markerRef.current.setLatLng([latitude, longitude]);
          } else {
            const marker = L.marker([latitude, longitude], { draggable: !readOnly }).addTo(mapInstanceRef.current);
            markerRef.current = marker;
            if (!readOnly) {
              marker.on('dragend', () => {
                const p = marker.getLatLng();
                onLocationSelect(p.lat, p.lng);
                reverseGeocode(p.lat, p.lng);
              });
            }
          }
          onLocationSelect(latitude, longitude);
          reverseGeocode(latitude, longitude);
        }
      },
      err => {
        setGeoLoading(false);
        setGeoError(`Could not retrieve location: ${err.message}`);
      },
      { timeout: 10000, maximumAge: 60000 }
    );
  }

  return (
    <div className="map-picker-wrapper">
      {geoError && <p className="map-error-note">{geoError}</p>}
      <div className="map-picker-container ready">
        <div ref={mapRef} className="map-picker-leaflet" style={{ height: '300px', width: '100%' }} />
      </div>
      {!readOnly && (
        <div className="map-picker-controls">
          <button type="button" className="btn-locate" onClick={useCurrentLocation} disabled={geoLoading}>
            {geoLoading ? <><Spinner /> Locating…</> : '📍 Use my location'}
          </button>
          <small className="hint map-hint">Click anywhere on the map or drag the pin to set precise disaster coordinates.</small>
        </div>
      )}
      {readOnly && lat && lng && (
        <div className="map-picker-controls">
          <small className="hint">Saved coordinates: {Number(lat).toFixed(5)}, {Number(lng).toFixed(5)}</small>
        </div>
      )}
    </div>
  );
}

// ── Extract address suggestion from Nominatim reverse geocode result ─────────
function extractAddressSuggestion(nominatimData) {
  if (!nominatimData || !nominatimData.address) return null;
  const addr = nominatimData.address;
  const locality = addr.suburb || addr.neighbourhood || addr.quarter || addr.hamlet || addr.village || addr.town || addr.city_district || '';
  const district = addr.county || addr.district || '';
  const municipality = addr.city || addr.town || addr.municipality || '';
  const state = addr.state || '';
  const displayName = nominatimData.display_name ? nominatimData.display_name.split(',').slice(0, 3).join(', ') : '';
  return { locality, district, municipality, state, displayName };
}

// ── Shared UI Atoms ───────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  return <span className={`status status-${(status||'').toLowerCase()}`} aria-label={`Status: ${status}`}>{status}</span>;
}

function SeverityBadge({ severity }) {
  const s = severity || 'Medium';
  return <span className={`severity severity-${s.toLowerCase()}`}>{s}</span>;
}

function Spinner() {
  return <span className="spinner" aria-hidden="true"/>;
}

function EmptyState({ icon='📭', title, body }) {
  return (
    <div className="empty-state">
      <span className="empty-icon" aria-hidden="true">{icon}</span>
      <strong>{title}</strong>
      {body && <p>{body}</p>}
    </div>
  );
}

function Toast({ error, message }) {
  if (!error && !message) return null;
  return (
    <>
      {error && <p className="toast toast-error" role="alert">{error}</p>}
      {message && <p className="toast toast-success" role="status">{message}</p>}
    </>
  );
}

function AIBadge({ status, label }) {
  const cls = {
    Completed: 'ai-badge-ok',
    Pending: 'ai-badge-pending',
    Processing: 'ai-badge-pending',
    Failed: 'ai-badge-fail',
    unavailable: 'ai-badge-na',
  }[status] || 'ai-badge-na';
  return <span className={`ai-badge ${cls}`} title={label}>{label || 'AI check unavailable'}</span>;
}

function ViewLocationLink({ lat, lng, address }) {
  if (lat != null && lng != null) {
    const url = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=16/${lat}/${lng}`;
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="view-location-link">
        🗺 View location
      </a>
    );
  }
  if (address) {
    const q = encodeURIComponent(address);
    return (
      <a href={`https://www.openstreetmap.org/search?query=${q}`} target="_blank" rel="noopener noreferrer" className="view-location-link">
        🔍 Search address
      </a>
    );
  }
  return <span className="hint">No location recorded</span>;
}

// ── Auth Form ─────────────────────────────────────────────────────────────────
// ── Auth Form ─────────────────────────────────────────────────────────────────
function AuthForm({ onAuthenticated, busy, initialMode = 'login', onClose }) {
  const [register, setRegister] = useState(initialMode === 'register');
  // Login fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  // Registration fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  // Show/hide password states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  // Registration address
  const [regProvince, setRegProvince] = useState('');
  const [regDistrict, setRegDistrict] = useState('');
  const [regMunicipality, setRegMunicipality] = useState('');
  const [regWard, setRegWard] = useState('');
  const [regWardOther, setRegWardOther] = useState('');
  // Form state
  const [formError, setFormError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [conflict, setConflict] = useState({ email: false, phone: false });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setRegister(initialMode === 'register');
    setFormError('');
    setFieldErrors({});
    setConflict({ email: false, phone: false });
  }, [initialMode]);

  function validateRegistration() {
    const errs = {};
    if (!firstName.trim()) errs.firstName = 'First name is required.';
    else if (firstName.trim().length > 80) errs.firstName = 'First name must be at most 80 characters.';
    if (!lastName.trim()) errs.lastName = 'Surname is required.';
    else if (lastName.trim().length > 80) errs.lastName = 'Surname must be at most 80 characters.';
    const emailVal = regEmail.trim().toLowerCase();
    if (!emailVal) errs.email = 'Email address is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)) errs.email = 'Enter a valid email address.';
    const phoneNorm = phone.trim().replace(/[\s\-().]/g, '');
    if (!phoneNorm) errs.phone = 'Phone number is required.';
    else if (!/^(\+\d{7,15}|\d{10}|\d{7})$/.test(phoneNorm)) errs.phone = 'Enter a valid phone number (e.g. 9841234567 or +9779841234567).';
    if (!regProvince) errs.province = 'Province is required.';
    if (!regDistrict) errs.district = 'District is required.';
    if (!regWard) errs.ward = 'Ward number is required.';
    else if (regWard === 'Other' && !regWardOther.trim()) errs.ward = 'Enter your locality / village name.';
    if (password.length < 12) errs.password = 'Password must be at least 12 characters.';
    else if (password.length > 128) errs.password = 'Password must be at most 128 characters.';
    if (password !== confirmPassword) errs.confirmPassword = 'Passwords do not match.';
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (submitting || busy) return;
    setFormError('');
    setFieldErrors({});
    setConflict({ email: false, phone: false });

    if (register) {
      const errs = validateRegistration();
      if (Object.keys(errs).length > 0) {
        setFieldErrors(errs);
        setFormError('Please correct the highlighted errors before submitting.');
        return;
      }
    } else {
      if (!loginEmail.trim()) { setFormError('Please enter your email address.'); return; }
      if (!loginPassword) { setFormError('Please enter your password.'); return; }
    }

    setSubmitting(true);
    try {
      if (register) {
        const payload = {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: regEmail.trim().toLowerCase(),
          phone: phone.trim(),
          password,
          province: regProvince || undefined,
          district: regDistrict || undefined,
          municipality: regMunicipality || undefined,
          ward: regWard || undefined,
          wardOther: regWardOther || undefined,
        };
        const user = await request('/api/auth/register', 'POST', payload);
        onAuthenticated(user);
      } else {
        const user = await request('/api/auth/login', 'POST', { email: loginEmail.trim().toLowerCase(), password: loginPassword });
        onAuthenticated(user);
      }
    } catch (err) {
      if (err.status === 409) {
        const code = err.data?.code;
        const field = err.data?.field;
        if (code === 'EMAIL_EXISTS' || code === 'ACCOUNT_EXISTS' || field === 'email') {
          setConflict(c => ({ ...c, email: true }));
          setFieldErrors(prev => ({ ...prev, email: 'An account with this email already exists.' }));
          setFormError('An account with this email already exists.');
        } else if (code === 'PHONE_EXISTS' || field === 'phone') {
          setConflict(c => ({ ...c, phone: true }));
          setFieldErrors(prev => ({ ...prev, phone: 'An account with this phone number already exists.' }));
          setFormError('An account with this phone number already exists.');
        } else {
          setFormError(err.message || 'Account already exists.');
        }
      } else if (err.status === 401) {
        setFormError('Email or password is incorrect.');
      } else if (err.status === 400 && err.data?.errors) {
        setFieldErrors(err.data.errors);
        setFormError(err.data.error || 'Please correct the highlighted errors before submitting.');
      } else {
        setFormError(err.message || 'Authentication failed. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  function toggleMode() {
    setRegister(r => !r);
    setFormError('');
    setFieldErrors({});
    setConflict({ email: false, phone: false });
    setShowPassword(false);
    setShowConfirmPassword(false);
    setShowLoginPassword(false);
  }

  const isWorking = submitting || busy;

  function FieldError({ id, name }) {
    const msg = fieldErrors[name];
    if (!msg) return null;
    return <p id={id} className="field-error" role="alert">{msg}</p>;
  }

  return (
    <section className={`auth-panel panel ${register ? 'auth-panel-register' : 'auth-panel-login'}`}>
      <div className="auth-header">
        <div className="auth-brand-badge" aria-hidden="true">
          <span className="brand-mark-lg">CDW</span>
        </div>
        <p className="eyebrow">COMMUNITY DISASTER WATCH</p>
        <h2 id="auth-heading">{register ? 'Create your account' : 'Sign in to your account'}</h2>
        <p className="hint auth-description">
          {register
            ? 'New accounts have citizen access. Privileged roles are assigned by an administrator.'
            : 'Sign in to submit incident reports and receive community notifications.'}
        </p>
      </div>

      {formError && (
        <div className="auth-alert auth-alert-error" role="alert">
          <span className="alert-icon" aria-hidden="true">⚠️</span>
          <div className="alert-text">
            {(conflict.email && register) ? (
              <div className="auth-conflict">
                <span>{formError}</span>
                <button
                  type="button"
                  className="auth-switch-btn"
                  onClick={() => { setRegister(false); setFormError(''); setFieldErrors({}); setConflict({ email: false, phone: false }); }}
                >
                  Sign in with this email instead →
                </button>
              </div>
            ) : (conflict.phone && register) ? (
              <div className="auth-conflict">
                <span>{formError}</span>
                <button
                  type="button"
                  className="auth-switch-btn"
                  onClick={() => { setRegister(false); setFormError(''); setFieldErrors({}); setConflict({ email: false, phone: false }); }}
                >
                  Sign in with this account instead →
                </button>
              </div>
            ) : (
              formError
            )}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate aria-labelledby="auth-heading">
        {register ? (
          <>
            {/* Section 1 — Personal details */}
            <div className="auth-section">
              <div className="auth-section-header">
                <h3 className="auth-section-title">
                  <span className="section-icon" aria-hidden="true">👤</span> Personal details
                </h3>
                <span className="required-indicator-note" aria-hidden="true">
                  <span className="required">*</span> Required fields
                </span>
              </div>

              <div className="form-grid-2">
                <div className="form-field-group">
                  <label htmlFor="reg-firstName" className="form-field-label">
                    <span>First name <span className="required" aria-hidden="true">*</span></span>
                  </label>
                  <input
                    id="reg-firstName"
                    name="firstName"
                    type="text"
                    value={firstName}
                    onChange={e => { setFirstName(e.target.value); setFieldErrors(p => ({...p, firstName: ''})); }}
                    required
                    maxLength={80}
                    autoComplete="given-name"
                    placeholder="e.g. Ramesh"
                    disabled={isWorking}
                    aria-required="true"
                    aria-describedby={fieldErrors.firstName ? 'err-firstName' : undefined}
                    aria-invalid={!!fieldErrors.firstName}
                    className={`form-input ${fieldErrors.firstName ? 'input-error' : ''}`}
                  />
                  <FieldError id="err-firstName" name="firstName" />
                </div>

                <div className="form-field-group">
                  <label htmlFor="reg-lastName" className="form-field-label">
                    <span>Surname / Last name <span className="required" aria-hidden="true">*</span></span>
                  </label>
                  <input
                    id="reg-lastName"
                    name="lastName"
                    type="text"
                    value={lastName}
                    onChange={e => { setLastName(e.target.value); setFieldErrors(p => ({...p, lastName: ''})); }}
                    required
                    maxLength={80}
                    autoComplete="family-name"
                    placeholder="e.g. Sharma"
                    disabled={isWorking}
                    aria-required="true"
                    aria-describedby={fieldErrors.lastName ? 'err-lastName' : undefined}
                    aria-invalid={!!fieldErrors.lastName}
                    className={`form-input ${fieldErrors.lastName ? 'input-error' : ''}`}
                  />
                  <FieldError id="err-lastName" name="lastName" />
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-field-group">
                  <label htmlFor="reg-phone" className="form-field-label">
                    <span>Phone number <span className="required" aria-hidden="true">*</span></span>
                  </label>
                  <input
                    id="reg-phone"
                    name="phone"
                    type="tel"
                    value={phone}
                    onChange={e => { setPhone(e.target.value); setFieldErrors(p => ({...p, phone: ''})); setConflict(c => ({...c, phone: false})); }}
                    required
                    maxLength={20}
                    autoComplete="tel"
                    placeholder="e.g. 9841234567 or +9779841234567"
                    disabled={isWorking}
                    aria-required="true"
                    aria-describedby={fieldErrors.phone ? 'err-phone' : 'hint-phone'}
                    aria-invalid={!!fieldErrors.phone}
                    className={`form-input ${fieldErrors.phone ? 'input-error' : ''}`}
                  />
                  <FieldError id="err-phone" name="phone" />
                  <span id="hint-phone" className="field-hint">Nepali mobile (10 digits) or international (+977...)</span>
                </div>

                <div className="form-field-group">
                  <label htmlFor="reg-email" className="form-field-label">
                    <span>Email address <span className="required" aria-hidden="true">*</span></span>
                  </label>
                  <input
                    id="reg-email"
                    name="email"
                    type="email"
                    value={regEmail}
                    onChange={e => { setRegEmail(e.target.value); setFieldErrors(p => ({...p, email: ''})); setConflict(c => ({...c, email: false})); }}
                    required
                    maxLength={254}
                    autoComplete="email"
                    placeholder="your@email.com"
                    disabled={isWorking}
                    aria-required="true"
                    aria-describedby={fieldErrors.email ? 'err-email' : undefined}
                    aria-invalid={!!fieldErrors.email}
                    className={`form-input ${fieldErrors.email ? 'input-error' : ''}`}
                  />
                  <FieldError id="err-email" name="email" />
                </div>
              </div>
            </div>

            {/* Address section (Residential address in Nepal) */}
            <div className="auth-section">
              <div className="auth-section-header">
                <h3 className="auth-section-title">
                  <span className="section-icon" aria-hidden="true">📍</span> Residential address (Nepal)
                </h3>
              </div>
              <p className="hint auth-section-hint">Select your province, district, and ward to help route emergency alerts accurately.</p>
              <NepalLocationSelector
                province={regProvince}
                district={regDistrict}
                municipality={regMunicipality}
                ward={regWard}
                wardOther={regWardOther}
                onProvinceChange={v => { setRegProvince(v); setFieldErrors(p => ({...p, province: '', district: '', ward: ''})); }}
                onDistrictChange={v => { setRegDistrict(v); setFieldErrors(p => ({...p, district: '', ward: ''})); }}
                onMunicipalityChange={setRegMunicipality}
                onWardChange={v => { setRegWard(v); setFieldErrors(p => ({...p, ward: ''})); }}
                onWardOtherChange={v => { setRegWardOther(v); setFieldErrors(p => ({...p, ward: ''})); }}
                required={true}
                disabled={isWorking}
              />
              <FieldError id="err-province" name="province" />
              <FieldError id="err-district" name="district" />
              <FieldError id="err-ward" name="ward" />
            </div>

            {/* Section 2 — Account security */}
            <div className="auth-section">
              <div className="auth-section-header">
                <h3 className="auth-section-title">
                  <span className="section-icon" aria-hidden="true">🔒</span> Account security
                </h3>
              </div>

              <div className="form-grid-2">
                <div className="form-field-group">
                  <label htmlFor="reg-password" className="form-field-label">
                    <span>Password <span className="required" aria-hidden="true">*</span></span>
                  </label>
                  <div className="password-input-wrapper">
                    <input
                      id="reg-password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => { setPassword(e.target.value); setFieldErrors(p => ({...p, password: '', confirmPassword: ''})); }}
                      required
                      minLength={12}
                      maxLength={128}
                      autoComplete="new-password"
                      placeholder="At least 12 characters"
                      disabled={isWorking}
                      aria-required="true"
                      aria-describedby={fieldErrors.password ? 'err-password' : 'hint-password'}
                      aria-invalid={!!fieldErrors.password}
                      className={`form-input ${fieldErrors.password ? 'input-error' : ''}`}
                    />
                    <button
                      type="button"
                      className="btn-toggle-password"
                      onClick={() => setShowPassword(s => !s)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? '🙈' : '👁️'}
                    </button>
                  </div>
                  <FieldError id="err-password" name="password" />
                  <span id="hint-password" className="field-hint">Must be 12 to 128 characters.</span>
                </div>

                <div className="form-field-group">
                  <label htmlFor="reg-confirmPassword" className="form-field-label">
                    <span>Confirm password <span className="required" aria-hidden="true">*</span></span>
                  </label>
                  <div className="password-input-wrapper">
                    <input
                      id="reg-confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={e => { setConfirmPassword(e.target.value); setFieldErrors(p => ({...p, confirmPassword: ''})); }}
                      required
                      maxLength={128}
                      autoComplete="new-password"
                      placeholder="Repeat your password"
                      disabled={isWorking}
                      aria-required="true"
                      aria-describedby={fieldErrors.confirmPassword ? 'err-confirmPassword' : undefined}
                      aria-invalid={!!fieldErrors.confirmPassword}
                      className={`form-input ${fieldErrors.confirmPassword ? 'input-error' : ''}`}
                    />
                    <button
                      type="button"
                      className="btn-toggle-password"
                      onClick={() => setShowConfirmPassword(s => !s)}
                      aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                      title={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                    >
                      {showConfirmPassword ? '🙈' : '👁️'}
                    </button>
                  </div>
                  <FieldError id="err-confirmPassword" name="confirmPassword" />
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="form-field-group">
              <label htmlFor="login-email" className="form-field-label">
                <span>Email address <span className="required" aria-hidden="true">*</span></span>
              </label>
              <input
                id="login-email"
                name="email"
                type="email"
                value={loginEmail}
                onChange={e => setLoginEmail(e.target.value)}
                required
                maxLength={254}
                autoComplete="username"
                placeholder="your@email.com"
                disabled={isWorking}
                aria-required="true"
                className="form-input"
              />
            </div>
            <div className="form-field-group">
              <label htmlFor="login-password" className="form-field-label">
                <span>Password <span className="required" aria-hidden="true">*</span></span>
              </label>
              <div className="password-input-wrapper">
                <input
                  id="login-password"
                  name="password"
                  type={showLoginPassword ? 'text' : 'password'}
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  required
                  maxLength={128}
                  autoComplete="current-password"
                  placeholder="Your password"
                  disabled={isWorking}
                  aria-required="true"
                  className="form-input"
                />
                <button
                  type="button"
                  className="btn-toggle-password"
                  onClick={() => setShowLoginPassword(s => !s)}
                  aria-label={showLoginPassword ? 'Hide password' : 'Show password'}
                  title={showLoginPassword ? 'Hide password' : 'Show password'}
                >
                  {showLoginPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>
          </>
        )}

        <button
          className="primary btn-submit-auth"
          disabled={isWorking}
          type="submit"
          id="btn-auth-submit"
        >
          {isWorking ? (
            <span className="btn-loading-content">
              <Spinner />
              <span>{register ? 'Creating account...' : 'Signing in...'}</span>
            </span>
          ) : register ? (
            'Create Account'
          ) : (
            'Sign In'
          )}
        </button>
      </form>

      <div className="auth-footer-toggle">
        {register ? (
          <span>
            Already registered?{' '}
            <button
              className="auth-link-button"
              type="button"
              disabled={isWorking}
              onClick={toggleMode}
            >
              Sign In
            </button>
          </span>
        ) : (
          <span>
            New to Community Disaster Watch?{' '}
            <button
              className="auth-link-button"
              type="button"
              disabled={isWorking}
              onClick={toggleMode}
            >
              Create Account
            </button>
          </span>
        )}
      </div>
    </section>
  );
}

// ── Report Submission Form (All 77 Districts Cascading Selector) ──────────────
function ReportForm({ areas, run, busy, onSubmitted }) {
  const formRef = useRef(null);          // attached to the <form>; safe to use after awaits
  const submittingRef = useRef(false);   // synchronous guard against double-click duplicates
  const [photo, setPhoto] = useState('');
  const [photoErr, setPhotoErr] = useState('');
  const [reading, setReading] = useState(false);
  const [done, setDone] = useState(false);

  // Cascading location state
  const [province, setProvince] = useState('');
  const [district, setDistrict] = useState('');
  const [municipality, setMunicipality] = useState('');
  const [ward, setWard] = useState('');
  const [wardOther, setWardOther] = useState('');
  const [locality, setLocality] = useState('');
  const [districtCenter, setDistrictCenter] = useState(null);

  // Coordinates
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [addressSuggestion, setAddressSuggestion] = useState('');
  const [addressConfirmed, setAddressConfirmed] = useState(false);
  const [formErr, setFormErr] = useState('');

  // Default incidentAt to now in Nepal time
  function nowNepalDatetimeLocal() {
    const now = new Date();
    const npOffset = 5 * 60 + 45;
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    const npTime = new Date(utc + npOffset * 60000);
    const pad = n => String(n).padStart(2, '0');
    return `${npTime.getFullYear()}-${pad(npTime.getMonth()+1)}-${pad(npTime.getDate())}T${pad(npTime.getHours())}:${pad(npTime.getMinutes())}`;
  }
  const [incidentAt, setIncidentAt] = useState(nowNepalDatetimeLocal());

  function choosePhoto(e) {
    setPhoto(''); setPhotoErr('');
    const file = e.target.files[0];
    if (!file) return;
    if (!['image/jpeg','image/png','image/webp'].includes(file.type) || file.size > 3145728) {
      setPhotoErr('Choose a JPEG, PNG or WebP photo up to 3 MB.'); e.target.value = ''; return;
    }
    setReading(true);
    const r = new FileReader();
    r.onload = () => { setPhoto(r.result); setReading(false); };
    r.onerror = () => { setPhotoErr('Photo could not be read.'); setReading(false); };
    r.readAsDataURL(file);
  }

  function handleLocationSelect(newLat, newLng, nominatimData) {
    setLat(newLat.toFixed(6));
    setLng(newLng.toFixed(6));
    if (nominatimData) {
      const sug = extractAddressSuggestion(nominatimData);
      if (sug) {
        setAddressSuggestion(sug.displayName);
        setAddressConfirmed(false);
        if (!locality && sug.locality) setLocality(sug.locality);
        if (!district && sug.district) {
          // Attempt matching district to one of the 77 districts
          const matchedDist = ALL_DISTRICTS.find(d => d.name.toLowerCase() === sug.district.toLowerCase());
          if (matchedDist) {
            setDistrict(matchedDist.name);
            setProvince(matchedDist.province);
          }
        }
        if (!municipality && sug.municipality) setMunicipality(sug.municipality);
      }
    }
  }

  function acceptSuggestion() {
    setAddressConfirmed(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    // React nulls e.currentTarget once the handler yields (any `await`), so read
    // everything we need from the form synchronously, before anything async runs.
    const form = e.currentTarget;
    if (submittingRef.current || busy) return;   // ignore repeated clicks while a request is in flight
    setFormErr('');
    if (!photo) { setFormErr('Select a photo before submitting.'); return; }
    if ((municipality === 'Other' || ward === 'Other') && !wardOther.trim()) {
      setFormErr('Please specify the area/locality name.');
      return;
    }

    // Resolve an areaId for backward compatibility
    let chosenAreaId = '';
    if (areas && areas.length > 0) {
      const match = district ? areas.find(a => a.name.toLowerCase().includes(district.toLowerCase())) : null;
      chosenAreaId = match ? match.id : '';
    }

    const body = {
      hazard: form.hazard.value,
      severity: form.severity.value,
      areaId: chosenAreaId,
      description: form.description.value,
      province: province || undefined,
      district: district || undefined,
      municipality: municipality || undefined,
      ward: ward || undefined,
      wardOther: wardOther || undefined,
      locality: locality || (wardOther ? wardOther : undefined),
      latitude: lat ? parseFloat(lat) : undefined,
      longitude: lng ? parseFloat(lng) : undefined,
      incidentAt: incidentAt || undefined,
      photo,
    };

    submittingRef.current = true;
    try {
      await run(async () => {
        // Nothing is cleared before this resolves; if the request throws, all input is kept for retry.
        await request('/api/reports', 'POST', body);

        // Report is saved. Clear the uncontrolled fields (type, severity, description) via the ref,
        // guarded because the form may already be unmounted.
        if (formRef.current) formRef.current.reset();
        setPhoto(''); setPhotoErr(''); setProvince(''); setDistrict(''); setMunicipality('');
        setWard(''); setWardOther(''); setLocality('');
        setLat(''); setLng('');
        setAddressSuggestion(''); setAddressConfirmed(false);
        setIncidentAt(nowNepalDatetimeLocal());
        setFormErr('');
        setDone(true);
        await onSubmitted();
      });
    } finally {
      submittingRef.current = false;
    }
  }

  if (done) return (
    <div className="submit-success panel">
      <span className="success-icon" aria-hidden="true">✓</span>
      <h2>Report submitted successfully</h2>
      <p>Your observation is recorded in the nationwide disaster management database and operational reviewers have been notified.</p>
      <p className="hint ai-note">ℹ️ Automated weather context analysis has been queued in the background.</p>
      <button className="primary" onClick={() => setDone(false)}>Submit another report</button>
    </div>
  );

  return (
    <div className="layout">
      <form className="panel" ref={formRef} onSubmit={handleSubmit}>
        <p className="eyebrow">NEW OBSERVATION</p>
        <h2>Submit an incident report</h2>

        {formErr && <p className="toast toast-error" role="alert">{formErr}</p>}

        <div className="form-grid-2">
          <label>Incident type <span className="required">*</span>
            <select name="hazard" required>{HAZARDS.map(h => <option key={h}>{h}</option>)}</select>
          </label>
          <label>Severity <span className="required">*</span>
            <select name="severity" defaultValue="Medium">
              {['Low','Medium','High','Critical'].map(s => <option key={s}>{s}</option>)}
            </select>
          </label>
        </div>

        {/* ── Nationwide Nepal Cascading Location Selector (Issue 1) ── */}
        <div className="form-section-label">📍 Administrative location (All 77 Nepal Districts)</div>
        <p className="hint">Select your Province, District, Local Government, and Ward to route this report accurately.</p>

        <NepalLocationSelector
          province={province}
          district={district}
          municipality={municipality}
          ward={ward}
          wardOther={wardOther}
          onProvinceChange={setProvince}
          onDistrictChange={setDistrict}
          onMunicipalityChange={setMunicipality}
          onWardChange={setWard}
          onWardOtherChange={setWardOther}
          onDistrictCenterSelected={setDistrictCenter}
          required={false}
        />

        <label style={{ marginTop: '12px' }}>
          Specific locality / tole / landmark
          <input
            type="text"
            value={locality}
            onChange={e => setLocality(e.target.value)}
            placeholder="e.g. Samakhusi chowk, near river bridge, ward office lane"
            maxLength={120}
          />
        </label>

        {/* ── Incident Map (Bundled Leaflet - Issue 2) ── */}
        <div className="form-section-label">🗺️ Geographic pin on map</div>
        <p className="hint">Click anywhere on the map or drag the pin to set the exact incident coordinates.</p>
        <LocationPickerMap
          lat={lat ? parseFloat(lat) : null}
          lng={lng ? parseFloat(lng) : null}
          onLocationSelect={handleLocationSelect}
          centerCoordinates={districtCenter}
          readOnly={false}
        />

        {addressSuggestion && !addressConfirmed && (
          <div className="address-suggestion">
            <span className="suggestion-label">📌 Suggested location from map:</span>
            <span className="suggestion-text">{addressSuggestion}</span>
            <div className="suggestion-actions">
              <button type="button" className="btn-suggestion-accept" onClick={acceptSuggestion}>Accept suggestion</button>
              <button type="button" className="btn-suggestion-dismiss" onClick={() => { setAddressSuggestion(''); setAddressConfirmed(false); }}>Dismiss</button>
            </div>
          </div>
        )}

        {(lat || lng) && (
          <div className="coordinates-display">
            <span>📡 Selected: {lat && parseFloat(lat).toFixed(5)}, {lng && parseFloat(lng).toFixed(5)}</span>
            <button type="button" className="btn-clear-coords" onClick={() => { setLat(''); setLng(''); }}>Clear</button>
          </div>
        )}

        <label style={{ marginTop: '14px' }}>Description <span className="required">*</span>
          <textarea
            name="description"
            required
            maxLength={1000}
            rows={4}
            placeholder="Describe what you observed: what changed, when, and nearby landmarks. Max 1000 characters."
          />
        </label>

        {/* Incident Date & Time */}
        <div className="form-section-label">🕒 Incident occurrence time</div>
        <div className="form-grid-2">
          <label>
            When did this occur? <span className="hint-inline">(Nepal time)</span>
            <input
              name="incidentAt"
              type="datetime-local"
              value={incidentAt}
              onChange={e => setIncidentAt(e.target.value)}
              max={nowNepalDatetimeLocal()}
            />
            <small className="hint">Leave as-is if it just happened. Change to the actual incident time.</small>
          </label>
        </div>

        {/* Photo Evidence Upload */}
        <div className="form-section-label">📷 Photo evidence <span className="required">*</span></div>
        <label>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={choosePhoto}
            required
            disabled={reading || busy}
          />
        </label>
        {photoErr && <p className="toast toast-error">{photoErr}</p>}
        {reading && <p className="hint"><Spinner/> Processing image preview...</p>}
        {photo && (
          <div className="photo-preview-box">
            <img src={photo} alt="Upload preview" className="photo-preview-img" style={{ maxHeight: '200px', borderRadius: '6px', marginTop: '8px' }}/>
          </div>
        )}

        <button className="primary" type="submit" disabled={busy || reading || !photo} style={{ marginTop: '16px' }}>
          {busy ? <><Spinner/> Submitting report...</> : 'Submit Incident Report'}
        </button>
      </form>
    </div>
  );
}

// ── My Reports View ───────────────────────────────────────────────────────────
function MyReports({ reports, run, busy, refresh }) {
  return (
    <section className="panel">
      <div className="section-title">
        <div>
          <p className="eyebrow">YOUR OBSERVATIONS</p>
          <h2>My submitted reports</h2>
        </div>
        <button disabled={busy} onClick={() => run(refresh)}>Refresh</button>
      </div>
      {reports.length === 0 ? (
        <EmptyState icon="📝" title="No reports yet" body="Reports you submit will appear here with their review status."/>
      ) : (
        <div className="reports-list">
          {reports.map(r => (
            <article key={r.id} className="my-report-card">
              <div className="report-card-head">
                <span className="hazard-title">{r.hazard}</span>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <SeverityBadge severity={r.severity} />
                  <StatusBadge status={r.status} />
                </div>
              </div>
              <div className="report-meta">
                <span>📍 {r.district ? `${r.district}, ` : ''}{r.municipality || r.area?.name || 'Nepal'}{r.ward ? ` (${r.ward})` : ''}</span>
                <span>🕒 {fmtDate(r.createdAt)}</span>
              </div>
              <p className="report-desc">{r.description}</p>
              <div className="view-location-row">
                <ViewLocationLink lat={r.latitude} lng={r.longitude} address={[r.locality, r.district, r.municipality].filter(Boolean).join(', ')}/>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

// ── Community Feed ────────────────────────────────────────────────────────────
function CommunityFeed({ reports, areas, run, busy, refresh }) {
  const [filterHazard, setFilterHazard] = useState('');
  const [filterDistrict, setFilterDistrict] = useState('');
  const [search, setSearch] = useState('');

  const visible = reports.filter(r => {
    if (filterHazard && r.hazard !== filterHazard) return false;
    if (filterDistrict && r.district !== filterDistrict) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const match = (r.hazard + ' ' + (r.district || '') + ' ' + (r.municipality || '') + ' ' + (r.locality || '') + ' ' + r.description).toLowerCase();
      if (!match.includes(q)) return false;
    }
    return true;
  });

  return (
    <section className="panel">
      <div className="section-title">
        <div>
          <p className="eyebrow">COMMUNITY INTEL</p>
          <h2>Public community feed</h2>
        </div>
        <button disabled={busy} onClick={() => run(refresh)}>Refresh</button>
      </div>

      <div className="filter-bar">
        <label>
          Search
          <input
            type="search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search hazard, tole, district..."
          />
        </label>
        <label>
          Hazard
          <select value={filterHazard} onChange={e => setFilterHazard(e.target.value)}>
            <option value="">All hazards</option>
            {HAZARDS.map(h => <option key={h} value={h}>{h}</option>)}
          </select>
        </label>
        <label>
          District (All 77)
          <select value={filterDistrict} onChange={e => setFilterDistrict(e.target.value)}>
            <option value="">All 77 districts</option>
            {ALL_DISTRICTS.map(d => <option key={d.name} value={d.name}>{d.name} ({d.province.split(' ')[0]})</option>)}
          </select>
        </label>
      </div>

      {visible.length === 0 ? (
        <EmptyState icon="🔍" title="No matching observations" body="Try resetting your filters to view more records."/>
      ) : (
        <div className="reports-feed">
          {visible.map(r => (
            <article key={r.id} className="feed-card">
              <div className="feed-card-header">
                <strong>{r.hazard}</strong>
                <StatusBadge status={r.status}/>
              </div>
              <div className="report-meta">
                <span>📍 {r.district ? `${r.district}, ` : ''}{r.municipality || r.area?.name || 'Monitored area'}{r.ward ? ` · ${r.ward}` : ''}</span>
                <span>🕒 {fmtDate(r.createdAt)}</span>
              </div>
              <p>{r.description}</p>
              <div className="view-location-row">
                <ViewLocationLink lat={r.latitude} lng={r.longitude} address={[r.locality, r.district, r.municipality].filter(Boolean).join(', ')}/>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

// ── Admin: Analytics Overview ─────────────────────────────────────────────────
function Distribution({ title, values }) {
  const entries = Object.entries(values || {}).sort((a,b) => b[1]-a[1]);
  const max = Math.max(1, ...entries.map(([,c]) => c));
  return (
    <section className="distribution" aria-label={title + ' breakdown'}>
      <h3>{title}</h3>
      {entries.length ? <ul>{entries.map(([label, count]) => (
        <li key={label}>
          <div className="distribution-label"><span>{label}</span><strong>{count}</strong></div>
          <div className="distribution-track" aria-hidden="true"><span style={{ width: Math.max(3, count/max*100) + '%' }}/></div>
        </li>
      ))}</ul> : <p className="hint">No data.</p>}
    </section>
  );
}

function AdminAnalytics({ analytics }) {
  if (!analytics) return <p className="hint">No analytics available.</p>;
  const metrics = [
    ['Total', analytics.total, 'metric-neutral'],
    ['Awaiting review', analytics.byStatus?.Reported || 0, 'metric-blue'],
    ['Verified', analytics.byStatus?.Verified || 0, 'metric-blue'],
    ['Responding', analytics.byStatus?.Responding || 0, 'metric-orange'],
    ['Resolved', analytics.byStatus?.Resolved || 0, 'metric-green'],
    ['Rejected', analytics.byStatus?.Rejected || 0, 'metric-red'],
  ];
  return (
    <section className="dashboard-overview">
      <div className="section-title">
        <div><p className="eyebrow">YOUR ASSIGNED JURISDICTION</p><h2>Operational overview</h2></div>
        <span className="data-caption">Live counts - assigned areas only</span>
      </div>
      <div className="metric-grid">
        {metrics.map(([label, value, cls]) => (
          <div key={label} className={`metric-card ${cls}`}><span>{label}</span><strong>{value}</strong></div>
        ))}
      </div>
      {analytics.total === 0 ? <p className="hint" style={{marginTop:'16px'}}>No incidents in your assigned areas yet.</p>
        : <div className="distribution-grid">
            <Distribution title="By severity" values={analytics.bySeverity}/>
            <Distribution title="By incident type" values={analytics.byType}/>
          </div>}
    </section>
  );
}

// ── Admin: Incident Review and Approvals ──────────────────────────────────────
// Evidence photo confined to its own fixed-ratio frame; shows a placeholder if the image is missing.
function ReportPhoto({ reportId }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => { setFailed(false); }, [reportId]);
  return (
    <div className="report-photo-frame">
      {failed
        ? <div className="report-photo-fallback" role="img" aria-label="Evidence photo unavailable">📷<span>Photo unavailable</span></div>
        : <img src={`/api/reports/${reportId}/photo`} alt="Evidence" className="report-photo" loading="lazy" onError={() => setFailed(true)}/>}
    </div>
  );
}

function Timeline({ events }) {
  if (!events || events.length === 0) return null;
  return (
    <div className="timeline">
      <p className="eyebrow">INCIDENT HISTORY</p>
      <ul>{events.map(e => (
        <li key={e.id}>
          <strong>{e.type.replace(/_/g, ' ')}</strong>
          {e.note && <p>{e.note}</p>}
          <small>{fmtDate(e.createdAt)} · {e.actor?.name || 'System'}</small>
        </li>
      ))}</ul>
    </div>
  );
}

function Assessment({ analysis, retry, busy }) {
  if (!analysis) return null;
  return (
    <div className="assessment">
      <p className="eyebrow">AUTOMATED CONTEXT - {analysis.status.toUpperCase()}</p>
      {analysis.status === 'Pending' && <p>Waiting for analysis. Attempts: {analysis.attempts}.</p>}
      {analysis.status === 'Processing' && <p>Analysis in progress...</p>}
      {analysis.error && <p className="hint">Last error: {analysis.error}</p>}
      {analysis.status === 'Failed' && <button disabled={busy} onClick={retry}>Retry analysis</button>}
      {analysis.result && <>
        <p>{analysis.result.summary}</p>
        <p>{analysis.result.weatherContext}</p>
        <strong>Uncertainties</strong><ul>{analysis.result.uncertainties.map((x,i)=><li key={i}>{x}</li>)}</ul>
        <strong>Review questions</strong><ul>{analysis.result.reviewQuestions.map((x,i)=><li key={i}>{x}</li>)}</ul>
        <p className="hint">{analysis.result.disclaimer}</p>
        <small>Model: {analysis.model} · {Math.round(analysis.result.durationMs/1000)}s · {fmtDate(analysis.completedAt)}</small>
      </>}
    </div>
  );
}

function AdminReports({ reports, areas, teams, run, busy, refresh }) {
  const [districtFilter, setDistrictFilter] = useState('');
  const [status, setStatus] = useState('');
  const [severity, setSeverity] = useState('');
  const [search, setSearch] = useState('');
  const [teamPick, setTeamPick] = useState({});
  const [instrEdit, setInstrEdit] = useState({});
  const [priorityEdit, setPriorityEdit] = useState({});
  const [pending, setPending] = useState(null);
  const [note, setNote] = useState('');
  const [expandRec, setExpandRec] = useState({});

  const visible = reports.filter(r =>
    (!districtFilter || r.district === districtFilter) &&
    (!status || r.status === status) &&
    (!severity || r.severity === severity) &&
    (!search.trim() || (r.id+' '+r.hazard+' '+r.description+' '+(r.district||'')+' '+(r.municipality||'')+' '+(r.area?.name||'')+' '+(r.locality||'')).toLowerCase().includes(search.trim().toLowerCase()))
  );

  return (
    <section className="panel">
      <div className="section-title">
        <div><p className="eyebrow">INCIDENT TRIAGE</p><h2>Review and manage reports</h2></div>
        <button disabled={busy} onClick={() => run(refresh)}>Refresh</button>
      </div>

      <div className="filter-bar">
        <label>Search
          <input type="search" value={search} onChange={e=>setSearch(e.target.value)} placeholder="ID, type, locality, description"/>
        </label>
        <label>District
          <select value={districtFilter} onChange={e=>setDistrictFilter(e.target.value)}>
            <option value="">All 77 districts</option>
            {ALL_DISTRICTS.map(d=><option key={d.name} value={d.name}>{d.name}</option>)}
          </select>
        </label>
        <label>Status
          <select value={status} onChange={e=>setStatus(e.target.value)}>
            <option value="">All statuses</option>
            {['Reported','InReview','Verified','Dispatched','Responding','Resolved','Rejected'].map(s=><option key={s}>{s}</option>)}
          </select>
        </label>
        <label>Severity
          <select value={severity} onChange={e=>setSeverity(e.target.value)}>
            <option value="">All severities</option>
            {['Critical','High','Medium','Low'].map(s=><option key={s}>{s}</option>)}
          </select>
        </label>
      </div>

      {visible.length === 0 ? (
        <EmptyState icon="📂" title={reports.length ? 'No incidents match filters' : 'No incidents in your jurisdiction'}/>
      ) : (
        <div className="reports">{visible.map(r => (
          <article key={r.id} className="report-item">
            <div className="report-thumb-col">
              <ReportPhoto reportId={r.id}/>
            </div>
            <div className="report-details-col">
              <div className="report-top-meta">
                <span className="hazard-tag">{r.hazard}</span>
                <SeverityBadge severity={r.severity}/>
                <StatusBadge status={r.status}/>
              </div>
              <p className="report-desc-main">{r.description}</p>
              <div className="location-pill">
                📍 {r.district ? `${r.district}, ` : ''}{r.municipality || r.area?.name || 'Area'}{r.ward ? ` (${r.ward})` : ''}
                {r.locality ? ` · ${r.locality}` : ''}
              </div>
              <div className="view-location-row">
                <ViewLocationLink lat={r.latitude} lng={r.longitude} address={[r.locality, r.district, r.municipality].filter(Boolean).join(', ')}/>
              </div>
              <small>Reported: {fmtDate(r.createdAt)}</small>

              <div className="admin-actions">
                {/* Priority */}
                <label style={{minWidth:'120px'}}>Priority
                  <select
                    value={priorityEdit[r.id] !== undefined ? priorityEdit[r.id] : r.priority}
                    disabled={busy}
                    onChange={ev => {
                      const p = ev.target.value;
                      setPriorityEdit(c => ({...c, [r.id]: p}));
                      run(async () => {
                        await request(`/api/reports/${r.id}`, 'PATCH', { priority: p });
                        await refresh();
                      }, `Priority set to ${p}.`);
                    }}
                  >
                    {['Low','Normal','High','Critical'].map(p => <option key={p}>{p}</option>)}
                  </select>
                </label>

                {/* Status action */}
                <label>Incident Action
                  <select
                    value={r.status}
                    disabled={busy || ['Resolved','Rejected'].includes(r.status)}
                    onChange={ev => {
                      const s = ev.target.value;
                      if (s === 'Rejected' || s === 'Resolved') { setNote(''); setPending({ r, s }); return; }
                      run(async () => {
                        await request(`/api/reports/${r.id}`, 'PATCH', { status: s });
                        await refresh();
                      }, s === 'Verified' ? 'Incident marked as Verified.' : `Status updated to ${s}`);
                    }}
                  >
                    {r.status === 'Reported' && <>
                      <option value="Reported">Reported — Awaiting review</option>
                      <option value="InReview">🔍 Mark In Review</option>
                      <option value="Verified">✓ Verify report</option>
                      <option value="Rejected">✕ Reject report</option>
                    </>}
                    {r.status === 'InReview' && <>
                      <option value="InReview">In Review — Under investigation</option>
                      <option value="Verified">✓ Verify report</option>
                      <option value="Rejected">✕ Reject report</option>
                    </>}
                    {r.status === 'Verified' && <>
                      <option value="Verified">Verified</option>
                      <option value="Responding">Mark Responding</option>
                      <option value="Rejected">✕ Reject report</option>
                      <option value="Resolved">✓ Resolve incident</option>
                    </>}
                    {r.status === 'Dispatched' && <>
                      <option value="Dispatched">Dispatched</option>
                      <option value="Responding">Mark Responding</option>
                      <option value="Resolved">✓ Resolve incident</option>
                    </>}
                    {r.status === 'Responding' && <>
                      <option value="Responding">Responding</option>
                      <option value="Resolved">✓ Resolve incident</option>
                    </>}
                    {['Resolved','Rejected'].includes(r.status) && <option value={r.status}>{r.status} — Final</option>}
                  </select>
                </label>

                {/* Reopen button for Resolved */}
                {r.status === 'Resolved' && (
                  <button className="secondary" style={{marginTop:'4px'}} disabled={busy}
                    onClick={() => { setNote(''); setPending({ r, s: 'Reported', mode: 'reopen' }); }}>
                    ↩ Reopen
                  </button>
                )}

                {/* Team assignment — available for Reported/InReview/Verified */}
                {['Reported','InReview','Verified'].includes(r.status) && teams && teams.length > 0 && (
                  <label>Assign response team
                    <div className="assign-row">
                      <select value={teamPick[r.id] || ''} onChange={e => setTeamPick(c => ({...c, [r.id]: e.target.value}))}>
                        <option value="">Select active team...</option>
                        {teams.map(t => <option key={t.id} value={t.id}>{t.organization?.name} — {t.name}</option>)}
                      </select>
                      <button disabled={busy || !teamPick[r.id]} onClick={() => run(async () => {
                        await request(`/api/reports/${r.id}/assignments`, 'POST', { teamId: teamPick[r.id] });
                        setTeamPick(c => ({...c, [r.id]: ''}));
                        await refresh();
                      }, 'Assignment recorded.')}>Assign</button>
                    </div>
                  </label>
                )}

                {/* Assignment instructions */}
                {!['Resolved','Rejected'].includes(r.status) && (
                  <label>Assignment instructions <span className="hint-inline">(optional, shown to responders)</span>
                    <div className="assign-row">
                      <input type="text" maxLength={500}
                        value={instrEdit[r.id] !== undefined ? instrEdit[r.id] : (r.assignmentInstructions || '')}
                        onChange={e => setInstrEdit(c => ({...c, [r.id]: e.target.value}))}
                        placeholder="e.g. Focus on bridge access point, coordinate with ward office..."/>
                      <button disabled={busy}
                        onClick={() => run(async () => {
                          await request(`/api/reports/${r.id}`, 'PATCH', { assignmentInstructions: instrEdit[r.id] !== undefined ? instrEdit[r.id] : (r.assignmentInstructions || '') });
                          await refresh();
                        }, 'Instructions saved.')}>Save</button>
                    </div>
                  </label>
                )}
              </div>

              {/* Recommendations from responders */}
              {r.recommendations?.length > 0 && (
                <div className="recommendations-panel">
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',cursor:'pointer'}}
                    onClick={() => setExpandRec(c => ({...c, [r.id]: !c[r.id]}))}
                  >
                    <p className="eyebrow" style={{margin:0}}>RESPONDER RECOMMENDATIONS ({r.recommendations.length})</p>
                    <span style={{fontSize:'0.8em'}}>{expandRec[r.id] ? '▲ Collapse' : '▼ View'}</span>
                  </div>
                  {expandRec[r.id] && r.recommendations.map(rec => (
                    <div key={rec.id} style={{border:'1px solid var(--line)',borderRadius:'6px',padding:'10px',marginTop:'8px',fontSize:'0.88em'}}>
                      <div style={{display:'flex',gap:'8px',flexWrap:'wrap',marginBottom:'4px'}}>
                        <strong style={{color: rec.recommendation.includes('Verified') ? '#059669' : rec.recommendation.includes('Rejected') ? '#dc2626' : '#8b5cf6'}}>
                          {rec.recommendation}
                        </strong>
                        {rec.visitedAt && <span className="hint">Visited: {fmtShort(rec.visitedAt)}</span>}
                        <span className="hint">— {rec.responder?.name} · {fmtDate(rec.createdAt)}</span>
                      </div>
                      <p style={{margin:'4px 0'}}>{rec.reason}</p>
                      {rec.observations && <p className="hint" style={{margin:'2px 0'}}>{rec.observations}</p>}
                    </div>
                  ))}
                </div>
              )}

              {/* Active assignments with dispatch button */}
              {r.incidentAssignments?.length > 0 && (
                <div className="assignment-list">
                  {r.incidentAssignments.map(a => (
                    <div key={a.id} className="assignment-chip" style={{flexWrap:'wrap',gap:'6px'}}>
                      <span>🚒 {a.team?.organization?.name} / {a.team?.name}</span>
                      <span className={a.acknowledgedAt ? 'ack-yes' : 'ack-pending'}>
                        {a.acknowledgedAt ? '✓ Acked ' + fmtShort(a.acknowledgedAt) : 'Awaiting ack'}
                      </span>
                      {a.dispatchedAt && <span style={{color:'#0891b2',fontSize:'0.82em'}}>🚀 Dispatched {fmtShort(a.dispatchedAt)}</span>}
                      {a.respondedAt && <span style={{color:'#f97316',fontSize:'0.82em'}}>⚡ Responding {fmtShort(a.respondedAt)}</span>}
                      {a.progressNote && <span className="hint" style={{fontSize:'0.8em',fontStyle:'italic',width:'100%'}}>Note: {a.progressNote}</span>}
                      {/* Dispatch button — only when report is Verified */}
                      {r.status === 'Verified' && !a.dispatchedAt && (
                        <button className="primary" style={{fontSize:'0.8em',padding:'3px 10px'}} disabled={busy}
                          onClick={() => run(async () => {
                            await request(`/api/assignments/${a.id}/dispatch`, 'POST', {});
                            await refresh();
                          }, 'Dispatch authorized.')}>
                          🚀 Dispatch
                        </button>
                      )}
                      {/* Unassign / Remove assignment */}
                      {!['Resolved','Rejected'].includes(r.status) && (
                        <button className="secondary" style={{fontSize:'0.78em',padding:'2px 8px',color:'#dc2626'}} disabled={busy}
                          onClick={() => run(async () => {
                            await request(`/api/assignments/${a.id}`, 'DELETE');
                            await refresh();
                          }, 'Assignment removed.')}>
                          ✕ Remove
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <Timeline events={r.events}/>
              <Assessment analysis={r.analysis} busy={busy} retry={() => run(async () => {
                await request(`/api/reports/${r.id}/retry`, 'POST', {}); await refresh();
              })}/>
            </div>
          </article>
        ))}</div>
      )}

      {pending && (
        <div className="dialog-backdrop">
          <section className="confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
            <p className="eyebrow">CONFIRM ACTION</p>
            <h2 id="confirm-title">
              {pending.mode === 'reopen' ? 'Reopen this incident?' : pending.s === 'Rejected' ? 'Reject this report?' : 'Resolve this incident?'}
            </h2>
            <p>
              {pending.mode === 'reopen'
                ? 'The incident will be reopened for further investigation. Provide a mandatory reason.'
                : pending.s === 'Rejected'
                  ? 'The reporter will see that the report was rejected.'
                  : 'Record a resolution summary for the incident record.'}
            </p>
            <label>
              {pending.mode === 'reopen' ? 'Reopen reason' : pending.s === 'Rejected' ? 'Rejection reason' : 'Resolution summary'}
              <textarea autoFocus rows={4}
                maxLength={pending.mode === 'reopen' ? 500 : pending.s === 'Rejected' ? 500 : 1000}
                required value={note} onChange={e=>setNote(e.target.value)}
                placeholder={
                  pending.mode === 'reopen'
                    ? 'e.g. New evidence received, reassigning for further investigation.'
                    : pending.s === 'Rejected'
                      ? 'e.g. Observation does not match a disaster hazard.'
                      : 'e.g. Cleared by emergency responder unit.'
                }/>
            </label>
            <div className="dialog-actions">
              <button disabled={busy} onClick={() => setPending(null)}>Cancel</button>
              <button
                className={pending.mode === 'reopen' ? 'secondary' : pending.s === 'Rejected' ? 'danger' : 'primary'}
                disabled={busy || !note.trim()}
                onClick={() => run(async () => {
                  let payload;
                  if (pending.mode === 'reopen') {
                    payload = { status: 'Reported', reopenReason: note.trim() };
                  } else if (pending.s === 'Rejected') {
                    payload = { status: 'Rejected', reason: note.trim() };
                  } else {
                    payload = { status: 'Resolved', resolutionSummary: note.trim() };
                  }
                  await request(`/api/reports/${pending.r.id}`, 'PATCH', payload);
                  setPending(null); await refresh();
                }, (pending.mode === 'reopen' ? 'Reopened' : pending.s) + ' recorded.')}>
                {busy ? <><Spinner/> Saving...</> : pending.mode === 'reopen' ? 'Confirm Reopen' : `Confirm ${pending.s}`}
              </button>
            </div>
          </section>
        </div>
      )}
    </section>
  );
}

// ── Interactive Real Leaflet Incident Map (Bundled Leaflet - Issue 2) ─────────
function IncidentMap({ reports }) {
  const mapped = reports.filter(r => r.latitude != null && r.longitude != null);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;
    try {
      const map = L.map(mapRef.current, { zoomControl: true }).setView([KTM_LAT, KTM_LNG], 7);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
      }).addTo(map);
      mapInstanceRef.current = map;

      mapped.forEach(r => {
        const color = { Reported: '#f59e0b', Verified: '#2563eb', Responding: '#f97316', Resolved: '#059669', Rejected: '#dc2626' }[r.status] || '#64748b';
        const icon = L.divIcon({
          className: '',
          html: `<div style="width:14px;height:14px;background:${color};border:2px solid #fff;border-radius:50%;box-shadow:0 1px 4px rgba(0,0,0,.4)"></div>`,
          iconSize: [14, 14], iconAnchor: [7, 7]
        });
        L.marker([r.latitude, r.longitude], { icon })
          .addTo(map)
          .bindPopup(`<strong>${r.hazard}</strong><br>${r.district ? r.district + ', ' : ''}${r.municipality || r.area?.name || ''}${r.ward ? ' (' + r.ward + ')' : ''}<br><span style="color:${color};font-weight:bold">${r.status}</span><br>${fmtShort(r.createdAt)}`);
      });

      if (mapped.length > 1) {
        const bounds = L.latLngBounds(mapped.map(r => [r.latitude, r.longitude]));
        map.fitBounds(bounds, { padding: [30, 30] });
      } else if (mapped.length === 1) {
        map.setView([mapped[0].latitude, mapped[0].longitude], 14);
      }
    } catch (err) {
      console.error('Error rendering incident map:', err);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [reports]);

  return (
    <section className="panel">
      <p className="eyebrow">GEOGRAPHIC INFORMATION SYSTEM</p>
      <h2>Nepal Emergency Incident Map</h2>
      <p className="hint">{mapped.length} of {reports.length} incidents have recorded coordinates. Dot color = status.</p>
      <div style={{ position: 'relative' }}>
        <div ref={mapRef} style={{ height: '440px', width: '100%', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--line)' }}/>
      </div>

      {mapped.length > 0 && (
        <div className="table-scroll" style={{ marginTop: '16px' }}>
          <table className="data-table">
            <thead>
              <tr><th>Type</th><th>Location</th><th>Ward</th><th>Status</th><th>Severity</th><th>Coordinates</th><th>Reported</th><th>Map</th></tr>
            </thead>
            <tbody>
              {mapped.map(r => (
                <tr key={r.id}>
                  <td><strong>{r.hazard}</strong></td>
                  <td>{r.district ? `${r.district}, ` : ''}{r.municipality || r.area?.name}</td>
                  <td>{r.ward || '—'}</td>
                  <td><StatusBadge status={r.status}/></td>
                  <td><SeverityBadge severity={r.severity}/></td>
                  <td className="font-mono">{r.latitude?.toFixed(4)}, {r.longitude?.toFixed(4)}</td>
                  <td><small>{fmtShort(r.createdAt)}</small></td>
                  <td><ViewLocationLink lat={r.latitude} lng={r.longitude}/></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

// ── Admin: User Management ────────────────────────────────────────────────────
function AdminUsers({ run, busy, currentUserId }) {
  const [usersData, setUsersData] = useState(null);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const searchTimerRef = useRef(null);

  const load = useCallback(async (q = search) => {
    setSearchLoading(true);
    try {
      const params = q ? `?search=${encodeURIComponent(q)}` : '';
      const data = await request(`/api/admin/users${params}`);
      setUsersData(data);
    } finally {
      setSearchLoading(false);
    }
  }, [search]);

  useEffect(() => { run(load); }, []);

  // Debounced search: fire after 400ms of no typing
  function handleSearchInput(e) {
    const val = e.target.value;
    setSearchInput(val);
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      setSearch(val);
      run(async () => {
        setSearchLoading(true);
        try {
          const params = val.trim() ? `?search=${encodeURIComponent(val.trim())}` : '';
          const data = await request(`/api/admin/users${params}`);
          setUsersData(data);
        } finally {
          setSearchLoading(false);
        }
      });
    }, 400);
  }

  function handleSearchSubmit(e) {
    e.preventDefault();
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    setSearch(searchInput);
    run(async () => {
      setSearchLoading(true);
      try {
        const params = searchInput.trim() ? `?search=${encodeURIComponent(searchInput.trim())}` : '';
        const data = await request(`/api/admin/users${params}`);
        setUsersData(data);
      } finally {
        setSearchLoading(false);
      }
    });
  }

  function handleClearSearch() {
    setSearchInput('');
    setSearch('');
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    run(async () => {
      setSearchLoading(true);
      try {
        const data = await request('/api/admin/users');
        setUsersData(data);
      } finally {
        setSearchLoading(false);
      }
    });
  }

  const users = usersData?.users || [];
  const totalUsers = usersData?.total || 0;

  if (!usersData && !searchLoading) return <div className="panel"><div className="loading-state"><Spinner/><span>Loading users...</span></div></div>;

  const PRIVILEGED = ['ADMIN', 'SUPERADMIN'];

  return (
    <section className="panel">
      <div className="section-title">
        <div><p className="eyebrow">USER MANAGEMENT</p><h2>Registered accounts</h2></div>
        <button disabled={busy || searchLoading} onClick={() => run(load)}>Refresh</button>
      </div>
      <p className="hint">Role changes are immediate. You cannot change your own role. Privileged administrator accounts are protected.</p>

      {/* Search bar */}
      <form className="user-search-form" onSubmit={handleSearchSubmit}>
        <label htmlFor="user-search-input" className="user-search-label">Search users by name, phone number, or email</label>
        <div className="user-search-row">
          <input
            id="user-search-input"
            type="search"
            value={searchInput}
            onChange={handleSearchInput}
            placeholder="Search by name, phone, or email…"
            className="user-search-input"
            aria-label="Search users"
          />
          <button type="submit" className="primary" disabled={busy || searchLoading}>Search</button>
          {searchInput && <button type="button" onClick={handleClearSearch} disabled={busy}>Clear</button>}
        </div>
        {search && <p className="search-result-count hint">
          {searchLoading ? <><Spinner/> Searching…</> : `${totalUsers} result${totalUsers !== 1 ? 's' : ''} for "${search}"`}
        </p>}
      </form>

      {searchLoading && !usersData ? (
        <div className="loading-state"><Spinner/><span>Searching...</span></div>
      ) : users.length === 0 ? (
        <EmptyState icon="🔍" title={search ? 'No users match your search' : 'No users found'} body={search ? 'Try a different name, phone number, or email address.' : ''}/>
      ) : (
        <div className="table-scroll">
          <table className="data-table">
            <thead><tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Address</th>
              <th>Role</th>
              <th>Registered</th>
              <th>Change Role</th>
            </tr></thead>
            <tbody>{users.map(u => (
              <tr key={u.id}>
                <td><strong className="user-name-cell">{u.name}</strong></td>
                <td><span className="phone-cell">{u.phone || <span className="hint">—</span>}</span></td>
                <td><span className="email-cell">{u.email}</span></td>
                <td><small className="hint">{[u.district, u.province].filter(Boolean).join(', ') || '—'}</small></td>
                <td><span className={`role-tag role-${u.role.toLowerCase()}`}>{roleLabel(u.role)}</span></td>
                <td><small>{fmtShort(u.createdAt)}</small></td>
                <td>
                  {PRIVILEGED.includes(u.role) ? (
                    <span className="role-protected-badge" title="Privileged roles cannot be changed here">🔒 Protected</span>
                  ) : u.id === currentUserId ? (
                    <span className="hint">Your account</span>
                  ) : (
                    <select
                      value={u.role}
                      disabled={busy}
                      aria-label={`Change role for ${u.name}`}
                      onChange={e => run(async () => {
                        await request(`/api/admin/users/${u.id}/role`, 'PATCH', { role: e.target.value });
                        await load();
                      }, `Role updated to ${roleLabel(e.target.value)} for ${u.name}.`)}
                    >
                      <option value="RESIDENT">Citizen</option>
                      <option value="RESPONDER">Responder</option>
                    </select>
                  )}
                </td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
      {!search && totalUsers > (usersData?.pageSize || 50) && (
        <p className="hint" style={{marginTop:'8px', textAlign:'right'}}>{totalUsers} total accounts. Use search to find specific users.</p>
      )}
    </section>
  );
}

// ── Admin: Organizations & Response Teams ────────────────────────────────────
function AdminOrganizations({ run, busy }) {
  const [orgs, setOrgs] = useState(null);
  const [newOrgName, setNewOrgName] = useState('');
  const [newOrgType, setNewOrgType] = useState('Search & Rescue');
  const [newTeamName, setNewTeamName] = useState({});
  // Responder picker state per team
  const [responderSearch, setResponderSearch] = useState({});
  const [responderResults, setResponderResults] = useState({});
  const [responderLoading, setResponderLoading] = useState({});
  const [expandedTeam, setExpandedTeam] = useState(null);
  const responderTimers = useRef({});

  const load = useCallback(async () => { setOrgs(await request('/api/admin/organizations')); }, []);
  useEffect(() => { run(load); }, []);

  async function handleCreateOrg(e) {
    e.preventDefault();
    if (!newOrgName.trim()) return;
    run(async () => {
      await request('/api/admin/organizations', 'POST', { name: newOrgName.trim(), type: newOrgType });
      setNewOrgName('');
      await load();
    }, 'Organization created.');
  }

  async function handleCreateTeam(orgId) {
    const name = newTeamName[orgId];
    if (!name?.trim()) return;
    run(async () => {
      await request(`/api/admin/organizations/${orgId}/teams`, 'POST', { name: name.trim() });
      setNewTeamName(c => ({ ...c, [orgId]: '' }));
      await load();
    }, 'Team created.');
  }

  function searchResponders(teamId, query) {
    setResponderSearch(s => ({ ...s, [teamId]: query }));
    if (responderTimers.current[teamId]) clearTimeout(responderTimers.current[teamId]);
    responderTimers.current[teamId] = setTimeout(async () => {
      setResponderLoading(l => ({ ...l, [teamId]: true }));
      try {
        const q = query.trim();
        const url = q ? `/api/admin/responders?search=${encodeURIComponent(q)}` : '/api/admin/responders';
        const results = await request(url);
        setResponderResults(r => ({ ...r, [teamId]: results }));
      } catch {}
      finally { setResponderLoading(l => ({ ...l, [teamId]: false })); }
    }, 350);
  }

  async function addMember(teamId, userId, userName) {
    await run(async () => {
      await request(`/api/admin/teams/${teamId}/members/${userId}`, 'PUT', {});
      await load();
      // Refresh responder list to update assignment status
      const q = responderSearch[teamId] || '';
      const url = q ? `/api/admin/responders?search=${encodeURIComponent(q)}` : '/api/admin/responders';
      const results = await request(url);
      setResponderResults(r => ({ ...r, [teamId]: results }));
    }, `${userName} added to team.`);
  }

  async function removeMember(teamId, userId, userName) {
    await run(async () => {
      await request(`/api/admin/teams/${teamId}/members/${userId}`, 'DELETE');
      await load();
    }, `${userName} removed from team.`);
  }

  if (!orgs) return <div className="panel"><div className="loading-state"><Spinner/><span>Loading organizations...</span></div></div>;

  return (
    <section className="panel">
      <div className="section-title">
        <div><p className="eyebrow">CIVIL DEFENSE & RESPONSE</p><h2>Response organizations & units</h2></div>
        <button disabled={busy} onClick={() => run(load)}>Refresh</button>
      </div>

      <form onSubmit={handleCreateOrg} className="form-grid-3" style={{ marginBottom: '20px' }}>
        <label>Organization Name
          <input value={newOrgName} onChange={e => setNewOrgName(e.target.value)} placeholder="e.g. Nepal Red Cross Society" required/>
        </label>
        <label>Organization Type
          <input value={newOrgType} onChange={e => setNewOrgType(e.target.value)} placeholder="e.g. Disaster Relief, Medical" required/>
        </label>
        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
          <button type="submit" disabled={busy || !newOrgName.trim()} className="primary" style={{ width: '100%' }}>Add Organization</button>
        </div>
      </form>

      <div className="orgs-list">
        {orgs.length === 0 && <EmptyState icon="🏢" title="No organizations yet" body="Create your first response organization above."/>}
        {orgs.map(org => (
          <div key={org.id} className="org-card">
            <div className="org-card-header">
              <div>
                <h3>{org.name}</h3>
                <span className="role-tag role-responder">{org.type}</span>
                {!org.active && <span className="role-tag" style={{background:'#dc2626',color:'#fff',marginLeft:'6px'}}>Inactive</span>}
              </div>
              <small className="hint">{org.teams?.length || 0} team{org.teams?.length !== 1 ? 's' : ''}</small>
            </div>

            {/* Teams list */}
            <div className="teams-list">
              {org.teams?.map(team => {
                const isExpanded = expandedTeam === team.id;
                const currentMembers = team.members || [];
                const searchVal = responderSearch[team.id] || '';
                const results = responderResults[team.id] || [];
                const isLoading = responderLoading[team.id];

                return (
                  <div key={team.id} className="team-card">
                    <div className="team-card-header">
                      <div>
                        <strong>🚒 {team.name}</strong>
                        <span className="hint" style={{marginLeft:'8px'}}>{currentMembers.length} responder{currentMembers.length !== 1 ? 's' : ''}</span>
                      </div>
                      <button
                        type="button"
                        className={isExpanded ? '' : 'primary'}
                        onClick={() => {
                          if (!isExpanded) {
                            setExpandedTeam(team.id);
                            // Load responders on expand
                            if (!responderResults[team.id]) {
                              searchResponders(team.id, '');
                            }
                          } else {
                            setExpandedTeam(null);
                          }
                        }}
                        style={{fontSize:'0.8em'}}
                      >
                        {isExpanded ? 'Close' : 'Manage Members'}
                      </button>
                    </div>

                    {/* Current members list */}
                    {currentMembers.length > 0 && (
                      <ul className="team-members-list">
                        {currentMembers.map(m => (
                          <li key={m.userId} className="team-member-item">
                            <span>👤 {m.user?.name || 'Unknown'}</span>
                            <span className="hint" style={{fontSize:'0.8em'}}>{m.user?.email || ''}</span>
                            {isExpanded && (
                              <button
                                type="button"
                                className="danger"
                                style={{fontSize:'0.75em', padding:'2px 8px'}}
                                disabled={busy}
                                onClick={() => removeMember(team.id, m.userId, m.user?.name || 'Member')}
                              >
                                Remove
                              </button>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}

                    {/* Responder picker (expanded) */}
                    {isExpanded && (
                      <div className="responder-picker">
                        <p className="eyebrow" style={{margin:'12px 0 6px'}}>ADD RESPONDER TO TEAM</p>
                        <div className="responder-search-row">
                          <input
                            type="search"
                            placeholder="Search responders by name or email…"
                            value={searchVal}
                            onChange={e => searchResponders(team.id, e.target.value)}
                            aria-label="Search eligible responders"
                          />
                        </div>
                        {isLoading && <div className="loading-state" style={{padding:'8px'}}><Spinner/><span>Searching responders…</span></div>}
                        {!isLoading && results.length === 0 && searchVal && (
                          <EmptyState icon="🔍" title="No responders found" body="Try a different name or email. Only users with the Responder role are listed."/>
                        )}
                        {!isLoading && results.length === 0 && !searchVal && (
                          <p className="hint" style={{marginTop:'8px'}}>Start typing to search eligible responders, or leave blank to see all.</p>
                        )}
                        {!isLoading && results.length > 0 && (
                          <div className="responder-results-list">
                            {results.map(r => {
                              const alreadyMember = currentMembers.some(m => m.userId === r.id);
                              const teamAssignments = r.teamMemberships || [];
                              return (
                                <div key={r.id} className={`responder-result-item ${alreadyMember ? 'already-member' : ''}`}>
                                  <div className="responder-info">
                                    <strong>{r.name}</strong>
                                    <span className="hint" style={{fontSize:'0.82em'}}>{r.email}</span>
                                    {teamAssignments.length > 0 && (
                                      <span className="hint" style={{fontSize:'0.78em', color:'var(--accent)'}}>
                                        Also in: {teamAssignments.map(tm => `${tm.team?.organization?.name || ''} / ${tm.team?.name || ''}`).join(', ')}
                                      </span>
                                    )}
                                  </div>
                                  {alreadyMember ? (
                                    <span className="role-tag role-responder" style={{fontSize:'0.75em'}}>✓ Already in team</span>
                                  ) : (
                                    <button
                                      type="button"
                                      className="primary"
                                      style={{fontSize:'0.8em', padding:'4px 12px'}}
                                      disabled={busy}
                                      onClick={() => addMember(team.id, r.id, r.name)}
                                    >
                                      Add to team
                                    </button>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Add new team */}
            <div className="add-team-row">
              <input
                type="text"
                placeholder="New team name..."
                value={newTeamName[org.id] || ''}
                onChange={e => setNewTeamName({ ...newTeamName, [org.id]: e.target.value })}
                style={{ maxWidth: '240px' }}
              />
              <button type="button" disabled={busy || !newTeamName[org.id]?.trim()} onClick={() => handleCreateTeam(org.id)}>Add Team</button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Responder: Verification Recommendation Form ──────────────────────────────
function RecommendationForm({ reportId, onSubmitted, busy, run }) {
  const [rec, setRec] = useState('');
  const [reason, setReason] = useState('');
  const [observations, setObservations] = useState('');
  const [visitedAt, setVisitedAt] = useState('');
  const [err, setErr] = useState('');
  const RECS = ['Recommend Verified', 'Recommend Rejected', 'Request More Information', 'Unable to Verify'];

  async function handleSubmit(e) {
    e.preventDefault();
    setErr('');
    if (!rec) { setErr('Choose a recommendation.'); return; }
    if (!reason.trim()) { setErr('Provide a reason for your recommendation.'); return; }
    try {
      await run(async () => {
        await request(`/api/reports/${reportId}/recommendations`, 'POST', {
          recommendation: rec,
          reason: reason.trim(),
          observations: observations.trim() || undefined,
          visitedAt: visitedAt || undefined,
        });
        setRec(''); setReason(''); setObservations(''); setVisitedAt('');
        await onSubmitted();
      }, 'Recommendation submitted.');
    } catch (e) {
      setErr(e.message || 'Could not submit recommendation.');
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{marginTop:'16px', borderTop:'1px solid var(--line)', paddingTop:'16px'}}>
      <p className="eyebrow">SUBMIT FIELD RECOMMENDATION</p>
      {err && <p className="toast toast-error" role="alert">{err}</p>}
      <div className="form-grid-2">
        <label>Recommendation <span className="required">*</span>
          <select value={rec} onChange={e=>setRec(e.target.value)} required>
            <option value="">— Choose —</option>
            {RECS.map(r=><option key={r} value={r}>{r}</option>)}
          </select>
        </label>
        <label>Visit time <span className="hint-inline">(Nepal time)</span>
          <input type="datetime-local" value={visitedAt} onChange={e=>setVisitedAt(e.target.value)} max={new Date().toISOString().slice(0,16)}/>
        </label>
      </div>
      <label>Field observations
        <textarea rows={3} maxLength={2000} value={observations} onChange={e=>setObservations(e.target.value)}
          placeholder="Describe what you saw, heard, or measured on-site..."/>
      </label>
      <label>Reason for recommendation <span className="required">*</span>
        <textarea rows={3} maxLength={1000} value={reason} onChange={e=>setReason(e.target.value)} required
          placeholder="Explain your recommendation based on field findings..."/>
      </label>
      <button type="submit" className="primary" disabled={busy || !rec || !reason.trim()}>
        {busy ? <><Spinner/> Submitting...</> : 'Submit Recommendation'}
      </button>
    </form>
  );
}

// ── Responder Dashboard ───────────────────────────────────────────────────────
function ResponderDashboard({ run, busy }) {
  const [assignments, setAssignments] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [progressNote, setProgressNote] = useState({});
  const [savingProgress, setSavingProgress] = useState({});
  const [err, setErr] = useState('');
  const [msg, setMsg] = useState('');

  const load = useCallback(async () => { setAssignments(await request('/api/responder/assignments')); }, []);
  useEffect(() => { run(load); }, []);

  async function acknowledge(assignmentId) {
    setErr(''); setMsg('');
    try {
      await request(`/api/assignments/${assignmentId}/acknowledge`, 'POST', {});
      setMsg('Assignment acknowledged.');
      await load();
    } catch (e) { setErr(e.message || 'Could not acknowledge.'); }
  }

  async function saveProgress(assignmentId) {
    setSavingProgress(s => ({ ...s, [assignmentId]: true }));
    setErr(''); setMsg('');
    try {
      await request(`/api/assignments/${assignmentId}/progress`, 'PATCH', { note: progressNote[assignmentId] || '' });
      setMsg('Progress note saved.');
      await load();
    } catch (e) { setErr(e.message || 'Could not save progress.'); }
    finally { setSavingProgress(s => ({ ...s, [assignmentId]: false })); }
  }

  async function markResponding(assignmentId) {
    setErr(''); setMsg('');
    try {
      await request(`/api/assignments/${assignmentId}/responding`, 'POST', { note: 'Response team mobilized on scene.' });
      setMsg('Incident status updated to Responding.');
      await load();
    } catch (e) { setErr(e.message || 'Could not update responding status.'); }
  }

  if (!assignments) return <div className="panel"><div className="loading-state"><Spinner/><span>Loading assignments...</span></div></div>;

  const statusColor = { Reported: '#f59e0b', InReview: '#8b5cf6', Verified: '#2563eb', Dispatched: '#0891b2', Responding: '#f97316', Resolved: '#059669', Rejected: '#dc2626' };

  return (
    <section className="panel">
      <div className="section-title">
        <div><p className="eyebrow">FIELD OPERATIONS</p><h2>My assignments &amp; verification</h2></div>
        <button disabled={busy} onClick={() => run(load)}>Refresh</button>
      </div>
      {err && <p className="toast toast-error" role="alert">{err}</p>}
      {msg && <p className="toast toast-success" role="status">{msg}</p>}
      {assignments.length === 0 ? (
        <EmptyState icon="🚒" title="No active dispatches" body="When an administrator assigns your team to an incident, it will appear here."/>
      ) : (
        <div className="assignments-list">
          {assignments.map(a => {
            const r = a.report;
            const isExpanded = expandedId === a.id;
            const recs = r?.recommendations || [];
            const myRec = recs[0]; // latest
            const color = statusColor[r?.status] || '#64748b';
            return (
              <article key={a.id} className="assignment-card" style={{ border: `2px solid ${color}22`, borderRadius: '10px', marginBottom: '16px', padding: '0', overflow: 'hidden' }}>
                {/* Header */}
                <div style={{ background: `${color}11`, padding: '14px 16px', borderBottom: '1px solid var(--line)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                    <div>
                      <span style={{ fontWeight: 700, fontSize: '1.05em' }}>{r?.hazard}</span>
                      <span style={{ marginLeft: '10px' }}><StatusBadge status={r?.status}/></span>
                      {r?.severity && <span style={{ marginLeft: '6px' }}><SeverityBadge severity={r.severity}/></span>}
                      {r?.priority && r.priority !== 'Normal' && <span className="role-tag" style={{ marginLeft:'6px', background: r.priority==='Critical'?'#dc2626':r.priority==='High'?'#f97316':'#2563eb', color:'#fff' }}>{r.priority} Priority</span>}
                    </div>
                    <div style={{ display:'flex', gap:'6px', flexWrap:'wrap' }}>
                      {!a.acknowledgedAt && (
                        <button className="primary" style={{ fontSize:'0.82em', padding:'4px 12px' }}
                          disabled={busy} onClick={() => acknowledge(a.id)}>✓ Acknowledge Assignment</button>
                      )}
                      {a.acknowledgedAt && ['Verified', 'Dispatched'].includes(r?.status) && !a.respondedAt && (
                        <button className="primary" style={{ fontSize:'0.82em', padding:'4px 12px', background:'#f97316' }}
                          disabled={busy} onClick={() => markResponding(a.id)}>⚡ Mobilize / On-Scene</button>
                      )}
                      <button style={{ fontSize:'0.82em', padding:'4px 12px' }}
                        onClick={() => setExpandedId(isExpanded ? null : a.id)}>
                        {isExpanded ? 'Collapse' : 'View Details'}
                      </button>
                    </div>
                  </div>
                  <div style={{ marginTop: '8px', fontSize: '0.88em', color: 'var(--text-muted)' }}>
                    <span>📍 {r?.district ? `${r.district}, ` : ''}{r?.municipality || r?.area?.name || 'Nepal'}{r?.ward ? ` (${r.ward})` : ''}{r?.locality ? ` · ${r.locality}` : ''}</span>
                    <span style={{ marginLeft: '16px' }}>🕒 Reported: {fmtDate(r?.createdAt)}</span>
                    {r?.incidentAt && <span style={{ marginLeft: '16px' }}>⚡ Incident: {fmtDate(r.incidentAt)}</span>}
                  </div>
                  <div style={{ marginTop: '4px', fontSize: '0.84em' }}>
                    <span>🚒 Team: <strong>{a.team?.organization?.name} / {a.team?.name}</strong></span>
                    <span style={{ marginLeft: '16px' }}>Assigned: {fmtDate(a.assignedAt)}</span>
                    {a.acknowledgedAt && <span style={{ marginLeft: '16px', color: '#059669' }}>✓ Acknowledged {fmtShort(a.acknowledgedAt)}</span>}
                    {a.dispatchedAt && <span style={{ marginLeft: '16px', color: '#0891b2' }}>🚀 Dispatched {fmtShort(a.dispatchedAt)}</span>}
                    {a.respondedAt && <span style={{ marginLeft: '16px', color: '#f97316' }}>⚡ Responding {fmtShort(a.respondedAt)}</span>}
                  </div>
                </div>

                {/* Expandable Details */}
                {isExpanded && (
                  <div style={{ padding: '16px' }}>
                    <div className="form-grid-2" style={{ gap: '16px', alignItems: 'start' }}>
                      {/* Left: report info */}
                      <div>
                        <p className="eyebrow">INCIDENT DESCRIPTION</p>
                        <p style={{ marginBottom: '12px' }}>{r?.description}</p>
                        {r?.status === 'Resolved' && r?.resolutionSummary && (
                          <div style={{ background: '#ecfdf5', border: '1px solid #10b981', borderRadius: '6px', padding: '10px', marginBottom: '12px' }}>
                            <strong style={{ color: '#047857' }}>✓ Incident Resolved:</strong>
                            <p style={{ margin: '4px 0 0' }}>{r.resolutionSummary}</p>
                          </div>
                        )}
                        {r?.status === 'Rejected' && r?.rejectionReason && (
                          <div style={{ background: '#fef2f2', border: '1px solid #ef4444', borderRadius: '6px', padding: '10px', marginBottom: '12px' }}>
                            <strong style={{ color: '#b91c1c' }}>✕ Incident Rejected:</strong>
                            <p style={{ margin: '4px 0 0' }}>{r.rejectionReason}</p>
                          </div>
                        )}
                        {r?.assignmentInstructions && (
                          <div style={{ background: '#fef3c7', border: '1px solid #f59e0b', borderRadius: '6px', padding: '10px', marginBottom: '12px' }}>
                            <strong>📋 Assignment Instructions:</strong>
                            <p style={{ margin: '4px 0 0' }}>{r.assignmentInstructions}</p>
                          </div>
                        )}
                        <ReportPhoto reportId={r?.id}/>
                        <div style={{ marginTop: '8px' }}>
                          <ViewLocationLink lat={r?.latitude} lng={r?.longitude} address={[r?.locality, r?.district, r?.municipality].filter(Boolean).join(', ')}/>
                        </div>
                      </div>
                      {/* Right: status + previous recommendations */}
                      <div>
                        {recs.length > 0 && (
                          <div>
                            <p className="eyebrow">PREVIOUS RECOMMENDATIONS</p>
                            {recs.map(rec => (
                              <div key={rec.id} style={{ border: '1px solid var(--line)', borderRadius: '6px', padding: '10px', marginBottom: '8px', fontSize: '0.88em' }}>
                                <strong>{rec.recommendation}</strong>
                                {rec.visitedAt && <span className="hint" style={{ marginLeft: '8px' }}>Visited: {fmtDate(rec.visitedAt)}</span>}
                                <p style={{ margin: '4px 0' }}>{rec.reason}</p>
                                {rec.observations && <p className="hint">{rec.observations}</p>}
                                <small>— {rec.responder?.name} · {fmtDate(rec.createdAt)}</small>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Progress note */}
                        {a.acknowledgedAt && (
                          <div style={{ marginTop: '12px' }}>
                            <p className="eyebrow">RESPONSE PROGRESS</p>
                            <textarea rows={3} maxLength={500}
                              value={progressNote[a.id] !== undefined ? progressNote[a.id] : (a.progressNote || '')}
                              onChange={e => setProgressNote(s => ({ ...s, [a.id]: e.target.value }))}
                              placeholder="Record current status, observations, resources used..."
                              style={{ width: '100%', marginBottom: '8px' }}/>
                            <button className="primary" style={{ fontSize: '0.85em' }}
                              disabled={busy || savingProgress[a.id]}
                              onClick={() => saveProgress(a.id)}>
                              {savingProgress[a.id] ? <><Spinner/> Saving...</> : 'Save Progress Note'}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Timeline */}
                    {r?.events && r.events.length > 0 && <Timeline events={r.events}/>}

                    {/* Recommendation form */}
                    {a.acknowledgedAt && (
                      <RecommendationForm
                        reportId={r?.id}
                        onSubmitted={load}
                        busy={busy}
                        run={run}
                      />
                    )}
                    {!a.acknowledgedAt && (
                      <p className="hint" style={{ marginTop: '12px', fontStyle: 'italic' }}>Acknowledge the assignment to submit observations and recommendations.</p>
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

// ── Notifications View ────────────────────────────────────────────────────────
function NotificationsView({ areas, subscriptions, notifications, run, busy, refresh }) {
  const [selected, setSelected] = useState(subscriptions);
  useEffect(() => setSelected(subscriptions), [subscriptions.join('|')]);
  const unread = notifications.filter(n => !n.readAt).length;

  return (
    <div className="layout">
      <section className="panel">
        <div className="section-title">
          <div><p className="eyebrow">NOTIFICATIONS</p>
            <h2>Your updates {unread > 0 && <span className="notif-count">{unread}</span>}</h2>
          </div>
          <button disabled={busy} onClick={() => run(refresh)}>Refresh</button>
        </div>
        <p className="hint">In-app notifications only. No SMS or push notifications are sent.</p>
        {notifications.length === 0 ? (
          <EmptyState icon="🔔" title="No notifications yet" body="Subscribe to an area to receive new report notifications."/>
        ) : (
          notifications.map(n => (
            <div className={'notification ' + (n.readAt ? '' : 'unread')} key={n.id}>
              <p>{n.message}</p>
              <small>{fmtDate(n.createdAt)} - Nepal time</small>
              {!n.readAt && <button disabled={busy} onClick={() => run(async () => {
                await request(`/api/notifications/${n.id}`, 'PATCH', {}); await refresh();
              })}>Mark as read</button>}
            </div>
          ))
        )}
      </section>

      <aside className="panel">
        <p className="eyebrow">AREA SUBSCRIPTIONS</p>
        <h2>Follow your community</h2>
        <p className="hint">Subscriptions apply to future reports and updates.</p>
        {areas.map(area => (
          <label className="checkbox" key={area.id}>
            <input
              type="checkbox"
              checked={selected.includes(area.id)}
              onChange={e => {
                setSelected(e.target.checked ? [...selected, area.id] : selected.filter(id => id !== area.id));
              }}
            />
            {area.name}
          </label>
        ))}
        <button
          className="primary"
          disabled={busy}
          style={{ marginTop: '12px', width: '100%' }}
          onClick={() => run(async () => {
            await request('/api/subscriptions', 'PUT', { areaIds: selected });
            await refresh();
          }, 'Subscriptions saved.')}
        >
          Save subscriptions
        </button>
      </aside>
    </div>
  );
}

// ── User Profile & Permanent Address Editor (All 77 Districts) ─────────────────
function ProfileView({ run, busy }) {
  const [profile, setProfile] = useState(null);
  const [province, setProvince] = useState('');
  const [district, setDistrict] = useState('');
  const [municipality, setMunicipality] = useState('');
  const [ward, setWard] = useState('');
  const [wardOther, setWardOther] = useState('');
  const [locality, setLocality] = useState('');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');
  const [success, setSuccess] = useState('');

  const load = useCallback(async () => {
    const p = await request('/api/auth/profile');
    setProfile(p);
    setProvince(p.province || '');
    setDistrict(p.district || '');
    setMunicipality(p.municipality || '');
    setWard(p.ward || '');
    setLocality(p.locality || '');
  }, []);

  useEffect(() => { run(load); }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setErr(''); setSuccess('');
    const data = {
      province: province || null,
      district: district || null,
      municipality: municipality || null,
      ward: ward || null,
      wardOther: wardOther || '',
      locality: locality || (wardOther ? wardOther : null),
    };
    setSaving(true);
    try {
      const updated = await request('/api/auth/profile', 'PATCH', data);
      setProfile(updated);
      setSuccess('Profile address updated successfully.');
    } catch (error) {
      setErr(error.message || 'Could not save profile address.');
    } finally {
      setSaving(false);
    }
  }

  if (!profile) return <div className="panel"><div className="loading-state"><Spinner/><span>Loading profile...</span></div></div>;

  return (
    <section className="panel">
      <div className="section-title">
        <div><p className="eyebrow">USER PROFILE</p><h2>Manage your account address</h2></div>
      </div>

      {err && <p className="toast toast-error" role="alert">{err}</p>}
      {success && <p className="toast toast-success" role="status">{success}</p>}

      <div className="profile-address-preview">
        <strong>Current saved location:</strong>
        <div className="address-display">
          <div><strong>Province</strong> {profile.province || '—'}</div>
          <div><strong>District</strong> {profile.district || '—'}</div>
          <div><strong>Municipality</strong> {profile.municipality || '—'}</div>
          <div><strong>Ward</strong> {profile.ward || '—'}</div>
          <div><strong>Locality</strong> {profile.locality || '—'}</div>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
        <p className="eyebrow">UPDATE LOCATION</p>
        <h3>Cascading Administrative Address (All 77 Nepal Districts)</h3>
        <p className="hint">Set your home or office address to help prioritize alerts and community reports.</p>

        <NepalLocationSelector
          province={province}
          district={district}
          municipality={municipality}
          ward={ward}
          wardOther={wardOther}
          onProvinceChange={setProvince}
          onDistrictChange={setDistrict}
          onMunicipalityChange={setMunicipality}
          onWardChange={setWard}
          onWardOtherChange={setWardOther}
          required={false}
        />

        <label style={{ marginTop: '12px' }}>
          Specific locality / tole / landmark
          <input
            type="text"
            value={locality}
            onChange={e => setLocality(e.target.value)}
            placeholder="e.g. Putalisadak, near campus, main chowk"
            maxLength={120}
          />
        </label>

        <button className="primary" type="submit" disabled={saving || busy} style={{ marginTop: '16px' }}>
          {saving ? <><Spinner/> Saving address...</> : 'Save Profile Address'}
        </button>
      </form>
    </section>
  );
}

// ── Main Application Component ────────────────────────────────────────────────
function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [view, setView] = useState('home');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  // Auth modal dialog
  const [authModal, setAuthModal] = useState({ open: false, mode: 'login' });

  // Workspace domain data
  const [areas, setAreas] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [reports, setReports] = useState([]);
  const [adminReports, setAdminReports] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [adminTeams, setAdminTeams] = useState([]);
  const [reportRefreshSignal, setReportRefreshSignal] = useState(0);

  // Close menus on Escape key
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        setMenuOpen(false);
        if (authModal.open) setAuthModal({ open: false, mode: 'login' });
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [authModal.open]);

  const run = useCallback(async (action, successMsg) => {
    setBusy(true);
    setError('');
    setMessage('');
    try {
      await action();
      if (successMsg) setMessage(successMsg);
    } catch (e) {
      setError(e.message || 'Operation could not be completed.');
    } finally {
      setBusy(false);
    }
  }, []);

  const refresh = useCallback(async (currentUser = user) => {
    setReportRefreshSignal(Date.now());
    const [a, s, n, r] = await Promise.all([
      request('/api/areas'),
      currentUser ? request('/api/subscriptions') : [],
      currentUser ? request('/api/notifications') : [],
      currentUser ? request('/api/reports') : [],
    ]);
    setAreas(a);
    setSubscriptions(s);
    setNotifications(n);
    setReports(r);

    if (currentUser?.role === 'ADMIN') {
      const [ar, an, at] = await Promise.all([
        request('/api/admin/reports'),
        request('/api/admin/analytics'),
        request('/api/admin/teams')
      ]);
      setAdminReports(ar);
      setAnalytics(an);
      setAdminTeams(at);
    }
  }, [user]);

  // Initial user check
  useEffect(() => {
    let mounted = true;
    request('/api/auth/me')
      .then(async u => {
        if (!mounted) return;
        setUser(u);
        const saved = getSavedSection(u.role);
        if (saved) setView(saved);
        await refresh(u);
      })
      .catch(() => {
        if (mounted) setUser(null);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => { mounted = false; };
  }, []);

  // Poll notifications when signed in
  useEffect(() => {
    if (!user) return;
    const t = setInterval(() => {
      refresh(user).catch(e => {
        if (e.status === 401) {
          setUser(null);
          setView('home');
        }
      });
    }, 25000);
    return () => clearInterval(t);
  }, [user, refresh]);

  function nav(key) {
    setView(key);
    setMenuOpen(false);
    setError('');
    setMessage('');
    if (user) saveSection(key, user.role);
  }

  const unreadCount = notifications.filter(n => !n.readAt).length;

  const navItems = !user ? [] : user.role === 'ADMIN' ? [
    { key: 'home', label: 'Public Portal' },
    { key: 'admin-overview', label: 'Overview' },
    { key: 'admin-reports', label: 'Incidents' },
    { key: 'admin-map', label: 'Map' },
    { key: 'admin-orgs', label: 'Organizations' },
    { key: 'admin-users', label: 'Users' },
    { key: 'notifications', label: `Notifications${unreadCount > 0 ? ` (${unreadCount})` : ''}` },
    { key: 'profile', label: 'Profile Address' }
  ] : user.role === 'RESPONDER' ? [
    { key: 'home', label: 'Public Portal' },
    { key: 'responder', label: 'My Assignments' },
    { key: 'community', label: 'Community Feed' },
    { key: 'notifications', label: `Notifications${unreadCount > 0 ? ` (${unreadCount})` : ''}` },
    { key: 'profile', label: 'Profile Address' }
  ] : [
    { key: 'home', label: 'Public Portal' },
    { key: 'report', label: 'Submit Report' },
    { key: 'my-reports', label: 'My Reports' },
    { key: 'community', label: 'Community Feed' },
    { key: 'notifications', label: `Notifications${unreadCount > 0 ? ` (${unreadCount})` : ''}` },
    { key: 'profile', label: 'Profile Address' }
  ];

  return (
    <>
      <a className="skip-link" href="#main-content">Skip to main content</a>

      {view === 'home' ? (
        <RedesignedHomepage
          user={user}
          refreshSignal={reportRefreshSignal}
          onOpenAuth={mode => setAuthModal({ open: true, mode })}
          onOpenReport={() => {
            if (user) nav('report');
            else setAuthModal({ open: true, mode: 'login' });
          }}
          onGoToDashboard={dest => {
            const defaultDest = user?.role === 'ADMIN' ? 'admin-overview' : user?.role === 'RESPONDER' ? 'responder' : 'my-reports';
            nav(dest || defaultDest);
          }}
          onSignOut={() => run(async () => {
            await request('/api/auth/logout', 'POST', {});
            setUser(null);
            setView('home');
            setNotifications([]);
            clearSection();
          }, 'Signed out successfully.')}
        />
      ) : (
        <>
          {/* ── National Emergency Ribbon ── */}
          <div className="cdw-top-ribbon" role="region" aria-label="National Emergency Hotlines">
            <div className="cdw-container ribbon-flex">
              <div className="ribbon-brand-mark">
                <span className="nepal-flag-badge" aria-hidden="true">🇳🇵</span>
                <span className="ribbon-title">NATIONAL EMERGENCY DISPATCH CHANNELS</span>
                <span className="ribbon-sep" aria-hidden="true">/</span>
                <span className="ribbon-sub">TOLL-FREE IMMEDIATE ACCESS</span>
              </div>
              <div className="ribbon-hotline-strip">
                <a href="tel:100" className="ribbon-link"><span>Police</span> <strong>100</strong></a>
                <span className="dot-sep" aria-hidden="true">·</span>
                <a href="tel:101" className="ribbon-link"><span>Fire</span> <strong>101</strong></a>
                <span className="dot-sep" aria-hidden="true">·</span>
                <a href="tel:102" className="ribbon-link"><span>Ambulance</span> <strong>102</strong></a>
                <span className="dot-sep" aria-hidden="true">·</span>
                <a href="tel:1149" className="ribbon-link highlight-neoc"><span>NEOC Disaster</span> <strong>1149</strong></a>
              </div>
            </div>
          </div>

          {/* ── Responsive Workspace Header (Issue 3 & 4) ── */}
          <header className="workspace-header">
            <div className="workspace-header-inner">
              <a className="workspace-brand" href="/" onClick={e => { e.preventDefault(); setView('home'); }} aria-label="Return to Public Portal">
                <span className="workspace-crest" aria-hidden="true">🛡️</span>
                <span className="workspace-brand-text">
                  <strong className="workspace-title">Community Disaster Watch</strong>
                  <span className="workspace-subtitle">Nepal Operational Workspace</span>
                </span>
              </a>

              <div className="workspace-header-controls">
                <button
                  type="button"
                  className="btn-return-portal"
                  onClick={() => setView('home')}
                  title="Switch back to public portal"
                >
                  ← Public Portal
                </button>

                {user ? (
                  <div className="workspace-account-chip">
                    <div className="account-info">
                      <strong className="user-name">{user.name}</strong>
                      <span className={`role-tag role-${user.role.toLowerCase()}`}>{roleLabel(user.role)}</span>
                    </div>
                    <button
                      type="button"
                      className="btn-workspace-signout"
                      disabled={busy}
                      onClick={() => run(async () => {
                        await request('/api/auth/logout', 'POST', {});
                        setUser(null);
                        setView('home');
                        setNotifications([]);
                        clearSection();
                      })}
                    >
                      Sign out
                    </button>
                  </div>
                ) : (
                  <div className="workspace-auth-btns">
                    <button type="button" className="btn-workspace-login" onClick={() => setAuthModal({ open: true, mode: 'login' })}>Sign In</button>
                    <button type="button" className="btn-workspace-register" onClick={() => setAuthModal({ open: true, mode: 'register' })}>Register</button>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* ── Responsive Workspace Subnav Tabs Bar (Issue 3) ── */}
          {user && (
            <div className="workspace-subnav-bar">
              <div className="workspace-subnav-inner">
                <div className="subnav-status-label">
                  <span className="status-kicker">OPERATIONAL JURISDICTION</span>
                  <strong className="jurisdiction-name">{roleLabel(user.role)} Dashboard</strong>
                </div>

                {/* Accessible Hamburger Toggle for Mobile Devices */}
                <button
                  type="button"
                  className="workspace-menu-toggle"
                  aria-expanded={menuOpen}
                  aria-controls="workspace-nav"
                  onClick={() => setMenuOpen(v => !v)}
                  aria-label="Toggle workspace views menu"
                >
                  {menuOpen ? '✕ Close' : '☰ Views'}
                </button>

                <nav id="workspace-nav" className={`workspace-tabs ${menuOpen ? 'nav-open' : ''}`} aria-label="Application views">
                  {navItems.filter(item => item.key !== 'home').map(item => (
                    <button
                      key={item.key}
                      disabled={busy}
                      aria-current={view === item.key ? 'page' : undefined}
                      className={`tab-btn ${view === item.key ? 'active' : ''}`}
                      onClick={() => nav(item.key)}
                    >
                      {item.label}
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          )}

          <main id="main-content">
            <div className="workspace-notice" role="note">
              <span className="notice-icon" aria-hidden="true">ℹ️</span>
              <div className="notice-body">
                <strong>Operational Workspace Active:</strong> You are viewing authenticated services for {user ? `${user.name} (${roleLabel(user.role)})` : 'visitors'}. Operational records and submissions update in real time. Return to the <button className="text-button" onClick={() => setView('home')}>Public Portal</button> at any time.
              </div>
            </div>

            <Toast error={error} message={message}/>

            {loading ? (
              <div className="loading-state" role="status"><Spinner/><span>Loading your account...</span></div>
            ) : !user ? (
              <AuthForm busy={busy} onAuthenticated={async u => {
                setUser(u);
                const defaultView = u.role === 'ADMIN' ? 'admin-overview' : u.role === 'RESPONDER' ? 'responder' : 'report';
                setView(defaultView);
                await refresh(u);
              }}/>
            ) : (
              <>
                {view === 'report' && user.role === 'RESIDENT' && <ReportForm areas={areas} run={run} busy={busy} onSubmitted={() => refresh()}/>}
                {view === 'my-reports' && user.role === 'RESIDENT' && <MyReports reports={reports} run={run} busy={busy} refresh={() => refresh()}/>}
                {view === 'community' && <CommunityFeed reports={reports} areas={areas} run={run} busy={busy} refresh={() => refresh()}/>}
                {view === 'admin-overview' && user.role === 'ADMIN' && <AdminAnalytics analytics={analytics}/>}
                {view === 'admin-reports' && user.role === 'ADMIN' && <AdminReports reports={adminReports} areas={areas} teams={adminTeams} run={run} busy={busy} refresh={() => refresh()}/>}
                {view === 'admin-map' && user.role === 'ADMIN' && <IncidentMap reports={adminReports}/>}
                {view === 'admin-orgs' && user.role === 'ADMIN' && <AdminOrganizations run={run} busy={busy}/>}
                {view === 'admin-users' && user.role === 'ADMIN' && <AdminUsers run={run} busy={busy} currentUserId={user.id}/>}
                {view === 'responder' && user.role === 'RESPONDER' && <ResponderDashboard run={run} busy={busy}/>}
                {view === 'notifications' && <NotificationsView areas={areas} subscriptions={subscriptions} notifications={notifications} run={run} busy={busy} refresh={() => refresh()}/>}
                {view === 'profile' && <ProfileView run={run} busy={busy}/>}
              </>
            )}

            <footer className="workspace-footer">
              <div className="footer-meta-line">
                <strong>Community Disaster Watch</strong> · Centralized Emergency Response System for Nepal
              </div>
              <div className="footer-partnership-line">
                Himalayan WhiteHouse International College, Putalisadak, Kathmandu · Affiliated with Purbanchal University
              </div>
            </footer>
          </main>
        </>
      )}

      {/* Auth Modal Overlay */}
      {authModal.open && (
        <div className="auth-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="auth-heading" onClick={() => setAuthModal({ open: false, mode: 'login' })}>
          <div className="auth-modal-container" onClick={e => e.stopPropagation()}>
            <button className="auth-modal-close" onClick={() => setAuthModal({ open: false, mode: 'login' })} aria-label="Close dialog">✕</button>
            <AuthForm
              run={run}
              busy={busy}
              initialMode={authModal.mode}
              onClose={() => setAuthModal({ open: false, mode: 'login' })}
              onAuthenticated={async u => {
                setUser(u);
                setAuthModal({ open: false, mode: 'login' });
                const defaultView = u.role === 'ADMIN' ? 'admin-overview' : u.role === 'RESPONDER' ? 'responder' : 'report';
                setView(defaultView);
                await refresh(u);
              }}
            />
          </div>
        </div>
      )}
    </>
  );
}

createRoot(document.getElementById('root')).render(<App/>);
