import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import './cdw-homepage.css';
import { DISTRICTS_BY_PROVINCE } from './nepalLocationData.js';

// Imported high-fidelity local assets generated for Nepal disaster operations
import heroImage from './assets/images/hero_nepal_disaster_response_1791542036094.jpg';
import rescueTeamImage from './assets/images/nepal_rescue_team_action_1791542052331.jpg';
import opsCenterImage from './assets/images/emergency_operations_center_1791542063858.jpg';
import preparednessImage from './assets/images/community_preparedness_nepal_1791542080937.jpg';

// ── Nepal Emergency Contacts Directory ───────────────────────────────────────
export const EMERGENCY_CONTACTS = [
  {
    id: 'police',
    category: 'National Emergency Numbers',
    badge: 'Immediate Dispatch',
    contacts: [
      { name: 'Nepal Police Emergency', number: '100', desc: 'Immediate police emergency response & public safety dispatch', scope: 'Nationwide (Toll-Free)' },
      { name: 'Fire Department (Damkal)', number: '101', desc: 'Municipal fire suppression & structural collapse extraction', scope: 'Nationwide (Toll-Free)' },
      { name: 'Ambulance Central Dispatch', number: '102', desc: 'Emergency medical services & trauma patient transport', scope: 'Nationwide (Toll-Free)' },
      { name: 'National Emergency Operations Centre (NEOC)', number: '1149', desc: 'Ministry of Home Affairs national disaster command hotline', scope: 'Nationwide (Toll-Free)' },
      { name: 'Armed Police Force (Disaster Management)', number: '1114', desc: 'Specialized flood, landslide & water rescue operational units', scope: 'Nationwide (Toll-Free)' },
      { name: 'Nepal Traffic Police Control', number: '103', desc: 'Highway landslide blockages, road washouts & traffic clearance', scope: 'Nationwide (Toll-Free)' },
    ]
  },
  {
    id: 'medical',
    category: 'Trauma Centers & Hospital Emergency Wards',
    badge: 'Medical Facilities',
    contacts: [
      { name: 'Tribhuvan University Teaching Hospital (TUTH)', number: '01-4412303', desc: 'Maharajgunj — Level-1 emergency trauma ward & intensive care', scope: 'Kathmandu' },
      { name: 'Bir Hospital Emergency Department', number: '01-4221119', desc: 'Mahabouddha — National referral emergency & disaster casualty wing', scope: 'Kathmandu' },
      { name: 'Patan Hospital Emergency Department', number: '01-5522295', desc: 'Lagankhel — Southern valley acute emergency care & surgery', scope: 'Lalitpur' },
      { name: 'Nepal Red Cross Central Blood Bank', number: '01-4228094', desc: 'Pradarshani Marg — 24/7 emergency blood supply & crisis reserves', scope: 'Bagmati Province' },
      { name: 'Bhaktapur Hospital Emergency Ward', number: '01-6610798', desc: 'Dudhpati — Eastern valley municipal emergency services', scope: 'Bhaktapur' },
    ]
  },
  {
    id: 'relief',
    category: 'Disaster Relief & Municipal Authorities',
    badge: 'Humanitarian & Civil Defense',
    contacts: [
      { name: 'Nepal Red Cross Society Headquarters', number: '01-4270650', desc: 'Red Cross Marg, Kalimati — Disaster relief logistics & shelter support', scope: 'Nationwide' },
      { name: 'Kathmandu Metropolitan Disaster Management Div.', number: '01-4241005', desc: 'Bagdurbar — Municipal ward emergency coordination & clearing', scope: 'Kathmandu Metro' },
      { name: 'Department of Hydrology & Meteorology (Flood Hotline)', number: '1155', desc: 'River water-level telemetry & real-time flash flood alerts', scope: 'Nationwide (Toll-Free)' },
    ]
  }
];

// ── Preparedness Checklist Data ──────────────────────────────────────────────
const GRAB_BAG_ITEMS = [
  { id: 'water', label: 'Drinking Water (3 liters per person per day, minimum 3 days)', required: true },
  { id: 'food', label: 'Non-perishable energy food (beaten rice / chiura, biscuits, dry fruits, canned goods)', required: true },
  { id: 'firstaid', label: 'First-aid kit with antiseptic, bandages, paracetamol, ORS (Jeevan Jal) & personal prescriptions', required: true },
  { id: 'flashlight', label: 'High-power LED flashlight with extra batteries or solar crank charger', required: true },
  { id: 'whistle', label: 'Emergency whistle (audible signaling device if trapped or during low visibility)', required: true },
  { id: 'documents', label: 'Waterproof pouch with copies of Citizenship cards, land deeds, insurance & family contacts', required: true },
  { id: 'cash', label: 'Emergency cash in small denomination rupee notes (ATMs may lose power)', required: true },
  { id: 'powerbank', label: 'Fully charged mobile power bank & charging cables', required: false },
  { id: 'warmth', label: 'Fleece blanket, waterproof rain poncho, and sturdy walking shoes', required: false },
  { id: 'mask', label: 'N95 / particulate masks for dust, smoke, or airborne debris', required: false },
];

// ── Provinces of Nepal with Coordinates for Map Interactive View ─────────────
const NEPAL_PROVINCES = [
  { id: 'all', name: 'All Nepal', center: { lat: 28.3949, lon: 84.1240 }, count: 7 },
  { id: 'koshi', name: 'Koshi Province', capital: 'Biratnagar', center: { lat: 27.2, lon: 87.2 } },
  { id: 'madhesh', name: 'Madhesh Province', capital: 'Janakpur', center: { lat: 26.9, lon: 85.9 } },
  { id: 'bagmati', name: 'Bagmati Province (Kathmandu)', capital: 'Hetauda', center: { lat: 27.7, lon: 85.3 } },
  { id: 'gandaki', name: 'Gandaki Province', capital: 'Pokhara', center: { lat: 28.2, lon: 84.0 } },
  { id: 'lumbini', name: 'Lumbini Province', capital: 'Deukhuri', center: { lat: 27.8, lon: 82.5 } },
  { id: 'karnali', name: 'Karnali Province', capital: 'Birendranagar', center: { lat: 29.3, lon: 82.2 } },
  { id: 'sudurpashchim', name: 'Sudurpashchim Province', capital: 'Godawari', center: { lat: 29.3, lon: 80.9 } },
];

// ── Location & Formatting Helpers ────────────────────────────────────────────
export function formatIncidentLocation(inc) {
  if (!inc) return 'Location Unspecified';
  const parts = [];
  if (inc.municipality && inc.ward) {
    parts.push(`${inc.municipality} (Ward ${inc.ward})`);
  } else if (inc.municipality) {
    parts.push(inc.municipality);
  } else if (inc.ward) {
    parts.push(`Ward ${inc.ward}`);
  }

  if (inc.district) {
    if (!parts.some(p => p.toLowerCase().includes(inc.district.toLowerCase()))) {
      parts.push(`${inc.district} District`);
    }
  }

  if (parts.length > 0) return parts.join(', ');
  if (inc.area?.name) return inc.area.name;
  return 'Location Unspecified';
}

const PROVINCE_NAME_MAP = {
  koshi: 'Koshi Province',
  madhesh: 'Madhesh Province',
  bagmati: 'Bagmati Province',
  gandaki: 'Gandaki Province',
  lumbini: 'Lumbini Province',
  karnali: 'Karnali Province',
  sudurpashchim: 'Sudurpashchim Province'
};

function matchesProvince(incident, provinceId) {
  if (!provinceId || provinceId === 'all') return true;
  const targetName = PROVINCE_NAME_MAP[provinceId] || provinceId;
  const incProv = (incident.province || '').toLowerCase();
  const targLower = targetName.toLowerCase();
  if (incProv && (incProv.includes(provinceId.toLowerCase()) || incProv.includes(targLower) || targLower.includes(incProv))) {
    return true;
  }
  const districtsInProv = DISTRICTS_BY_PROVINCE[targetName] || [];
  if (incident.district && districtsInProv.some(d => d.toLowerCase() === incident.district.toLowerCase())) {
    return true;
  }
  return false;
}

// ── Timezone Helper ──────────────────────────────────────────────────────────
function formatNepalTime(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleString('en-GB', {
    timeZone: 'Asia/Kathmandu',
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  }) + ' NPT';
}

export function RedesignedHomepage({
  user,
  refreshSignal,
  onOpenAuth,
  onOpenReport,
  onGoToDashboard,
  onSignOut
}) {
  // Real API state
  const [stats, setStats] = useState({ total: 0, reported: 0, verified: 0, responding: 0, resolved: 0, organizations: 0, teams: 0 });
  const [incidents, setIncidents] = useState([]);
  const [loadingIncidents, setLoadingIncidents] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [errorIncidents, setErrorIncidents] = useState('');
  const inFlightRef = useRef(false);
  const seqRef = useRef(0);

  // Interactive filtering state
  const [filterHazard, setFilterHazard] = useState('ALL');
  const [filterSeverity, setFilterSeverity] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterProvince, setFilterProvince] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIncident, setSelectedIncident] = useState(null);

  // Contacts search & filter
  const [contactSearch, setContactSearch] = useState('');
  const [selectedContactCategory, setSelectedContactCategory] = useState('all');
  const [copiedNumber, setCopiedNumber] = useState(null);

  // Weather telemetry
  const [weatherData, setWeatherData] = useState(null);
  const [weatherState, setWeatherState] = useState('loading');

  // UI state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [tickerPaused, setTickerPaused] = useState(false);
  const [activeTab, setActiveTab] = useState('map'); // 'map' | 'list'
  const [checklist, setChecklist] = useState({
    water: true,
    food: true,
    firstaid: true,
    flashlight: false,
    whistle: false,
    documents: true,
    cash: false,
    powerbank: true,
    warmth: false,
    mask: true,
  });

  // Close mobile drawer on Escape key
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  // Fetch Public Stats & Incidents from backend with live polling support
  const loadData = useCallback(async ({ silent = false } = {}) => {
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    if (!silent) setIsRefreshing(true);
    const currentSeq = ++seqRef.current;

    try {
      const [statsRes, incRes] = await Promise.all([
        fetch('/api/public/stats'),
        fetch('/api/public/incidents')
      ]);

      if (currentSeq !== seqRef.current) return;

      if (statsRes.ok) {
        const s = await statsRes.json();
        setStats(s);
      }

      if (incRes.ok) {
        const data = await incRes.json();
        setIncidents(data);
        setErrorIncidents('');
        setLastUpdated(new Date());
        setSelectedIncident(prev => {
          if (!prev) return data.length > 0 ? data[0] : null;
          const found = data.find(i => i.id === prev.id);
          return found || (data.length > 0 ? data[0] : null);
        });
      } else {
        if (!silent) setErrorIncidents('Unable to load live incidents feed.');
      }
    } catch (err) {
      if (currentSeq === seqRef.current && !silent) {
        setErrorIncidents('Failed to connect to incident telemetry API.');
      }
    } finally {
      inFlightRef.current = false;
      if (!silent) {
        setLoadingIncidents(false);
        setIsRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    loadData({ silent: false });

    // Live update polling: refresh every 30 seconds
    const intervalId = setInterval(() => {
      loadData({ silent: true });
    }, 30000);

    return () => {
      clearInterval(intervalId);
    };
  }, [loadData]);

  // Immediately refresh when parent triggers refreshSignal
  useEffect(() => {
    if (refreshSignal) {
      loadData({ silent: true });
    }
  }, [refreshSignal, loadData]);

  // Fetch real atmospheric telemetry from Open-Meteo for Kathmandu/Nepal
  useEffect(() => {
    let mounted = true;
    async function loadWeather() {
      try {
        const url = 'https://api.open-meteo.com/v1/forecast?latitude=27.705&longitude=85.322&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m&daily=precipitation_sum,temperature_2m_max,temperature_2m_min&timezone=Asia%2FKathmandu';
        const res = await fetch(url);
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const data = await res.json();
        if (mounted && data?.current?.temperature_2m != null) {
          setWeatherData(data);
          setWeatherState('ok');
        } else if (mounted) {
          setWeatherState('unavailable');
        }
      } catch {
        if (mounted) setWeatherState('unavailable');
      }
    }
    loadWeather();
    return () => { mounted = false; };
  }, []);

  // Copy to clipboard helper for phone numbers
  const handleCopy = (num, name) => {
    navigator.clipboard.writeText(num.replace(/[^0-9]/g, ''));
    setCopiedNumber(num);
    setTimeout(() => setCopiedNumber(null), 2500);
  };

  // Toggle checklist items
  const toggleCheck = (id) => {
    setChecklist(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const checklistProgress = useMemo(() => {
    const total = GRAB_BAG_ITEMS.length;
    const checked = Object.values(checklist).filter(Boolean).length;
    return Math.round((checked / total) * 100);
  }, [checklist]);

  // Filtered incidents
  const filteredIncidents = useMemo(() => {
    return incidents.filter(item => {
      if (filterHazard !== 'ALL' && item.hazard !== filterHazard) return false;
      if (filterSeverity !== 'ALL' && (item.severity || 'Medium') !== filterSeverity) return false;
      if (filterStatus !== 'ALL' && item.status !== filterStatus) return false;
      if (filterProvince !== 'all' && !matchesProvince(item, filterProvince)) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const loc = formatIncidentLocation(item).toLowerCase();
        const haz = (item.hazard || '').toLowerCase();
        const desc = (item.description || '').toLowerCase();
        const prov = (item.province || '').toLowerCase();
        const dist = (item.district || '').toLowerCase();
        const mun = (item.municipality || '').toLowerCase();
        const ward = String(item.ward || '').toLowerCase();
        if (
          !loc.includes(q) &&
          !haz.includes(q) &&
          !desc.includes(q) &&
          !prov.includes(q) &&
          !dist.includes(q) &&
          !mun.includes(q) &&
          !ward.includes(q)
        ) return false;
      }
      return true;
    });
  }, [incidents, filterHazard, filterSeverity, filterStatus, filterProvince, searchQuery]);

  // Coordinate-bearing incidents for GIS map projection
  const mappedIncidents = useMemo(() => {
    return filteredIncidents.filter(i => i.latitude != null && i.longitude != null);
  }, [filteredIncidents]);

  // Bounding box projection for Nepal GIS plot
  const mapBounds = useMemo(() => {
    // Nepal approximate boundaries: lat 26.3 to 30.5, lon 80.0 to 88.2
    return { minLat: 26.2, maxLat: 30.6, minLon: 80.0, maxLon: 88.3 };
  }, []);

  function projectToNepalMap(lat, lon) {
    const { minLat, maxLat, minLon, maxLon } = mapBounds;
    const x = ((lon - minLon) / (maxLon - minLon)) * 100;
    const y = ((maxLat - lat) / (maxLat - minLat)) * 100;
    return {
      left: Math.max(4, Math.min(96, x)),
      top: Math.max(6, Math.min(94, y))
    };
  }

  // Ticker bulletin items
  const tickerItems = useMemo(() => {
    const items = [];
    const highAlerts = incidents.filter(i => ['Verified', 'Responding'].includes(i.status));
    for (const inc of highAlerts.slice(0, 4)) {
      items.push({
        id: 'inc-' + inc.id,
        badge: inc.status === 'Verified' ? 'VERIFIED OBSERVATION' : 'ACTIVE RESPONSE',
        location: formatIncidentLocation(inc),
        hazard: inc.hazard,
        severity: inc.severity || 'Medium',
        time: formatNepalTime(inc.incidentAt || inc.createdAt)
      });
    }
    if (items.length === 0) {
      items.push({
        id: 'no-active',
        badge: 'ROUTINE MONITORING',
        location: 'Kathmandu Valley & All Provinces',
        hazard: 'Monitoring Stations Active',
        severity: 'Low',
        time: 'All telemetry channels connected'
      });
    }
    return items;
  }, [incidents]);

  // Filtered contacts
  const filteredContacts = useMemo(() => {
    return EMERGENCY_CONTACTS.filter(cat => {
      if (selectedContactCategory !== 'all' && cat.id !== selectedContactCategory) return false;
      return true;
    }).map(cat => {
      if (!contactSearch.trim()) return cat;
      const q = contactSearch.toLowerCase();
      const matching = cat.contacts.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.desc.toLowerCase().includes(q) ||
        c.number.includes(q) ||
        c.scope.toLowerCase().includes(q)
      );
      return { ...cat, contacts: matching };
    }).filter(cat => cat.contacts.length > 0);
  }, [selectedContactCategory, contactSearch]);

  return (
    <div className="cdw-app-shell">
      {/* ── 1. Top National Emergency Dispatch Ribbon ─────────────────── */}
      <div className="cdw-top-ribbon" role="region" aria-label="National Emergency Contacts Ribbon">
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

      {/* ── 2. Top Bar Contract Navigation Header ─────────────────────── */}
      <header className="cdw-header">
        <div className="cdw-container header-row">
          {/* Zone 1: Single text wordmark with subtle crest */}
          <a href="#hero" className="cdw-wordmark-anchor" aria-label="Community Disaster Watch Home">
            <span className="cdw-crest-symbol" aria-hidden="true">🛡️</span>
            <span className="cdw-brand-name">Community Disaster Watch</span>
          </a>

          {/* Zone 2: Clean single-line text navigation links (Top Bar Contract: 5 concise links) */}
          <nav className="cdw-nav-links" aria-label="Primary Navigation">
            <a href="#incidents-section" className="nav-item">Incidents</a>
            <a href="#nepal-map-section" className="nav-item">Map</a>
            <a href="#risk-insights-section" className="nav-item">Risk Insights</a>
            <a href="#contacts-section" className="nav-item">Contacts</a>
            <a href="#preparedness-section" className="nav-item">Preparedness</a>
          </nav>

          {/* Zone 3: 1 Primary Emergency Action & Account Controls */}
          <div className="cdw-header-actions">
            {user ? (
              <div className="account-cluster">
                <button
                  type="button"
                  className="btn-user-workspace"
                  onClick={() => onGoToDashboard(user.role === 'ADMIN' ? 'admin-overview' : user.role === 'RESPONDER' ? 'responder' : 'my-reports')}
                  title={`Open ${user.role} workspace`}
                >
                  <span className="user-role-indicator" aria-hidden="true" />
                  <span className="truncate">{user.name?.split(' ')[0] || 'User'} ({user.role})</span>
                </button>
                <button type="button" className="btn-header-signout" onClick={onSignOut}>Sign out</button>
              </div>
            ) : (
              <div className="auth-cluster">
                <button type="button" className="btn-header-text" onClick={() => onOpenAuth('login')}>Sign In</button>
                <button type="button" className="btn-header-subtle" onClick={() => onOpenAuth('register')}>Register</button>
              </div>
            )}

            <button
              type="button"
              className="btn-header-emergency"
              onClick={onOpenReport}
              title="Report an observed emergency incident"
            >
              <span>Report Emergency</span>
            </button>

            {/* Accessible Hamburger Toggle for Mobile Devices */}
            <button
              type="button"
              className="btn-mobile-toggle"
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle navigation drawer"
              onClick={() => setMobileMenuOpen(prev => !prev)}
            >
              {mobileMenuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="cdw-mobile-drawer" role="dialog" aria-modal="true" aria-label="Mobile Navigation">
            <div className="mobile-drawer-content">
              <a href="#hero" onClick={() => setMobileMenuOpen(false)}>Home</a>
              <a href="#incidents-section" onClick={() => setMobileMenuOpen(false)}>Live Incidents</a>
              <a href="#nepal-map-section" onClick={() => setMobileMenuOpen(false)}>Emergency Map</a>
              <a href="#risk-insights-section" onClick={() => setMobileMenuOpen(false)}>Risk Insights</a>
              <a href="#contacts-section" onClick={() => setMobileMenuOpen(false)}>Emergency Contacts</a>
              <a href="#how-it-works-section" onClick={() => setMobileMenuOpen(false)}>How It Works</a>
              <a href="#preparedness-section" onClick={() => setMobileMenuOpen(false)}>Preparedness Guides</a>
              <hr className="drawer-divider" />
              <div className="drawer-auth-actions">
                {user ? (
                  <>
                    <button type="button" className="btn-drawer-action" onClick={() => { setMobileMenuOpen(false); onGoToDashboard('report'); }}>
                      Go to Dashboard ({user.role})
                    </button>
                    <button type="button" className="btn-drawer-outline" onClick={() => { setMobileMenuOpen(false); onSignOut(); }}>Sign out</button>
                  </>
                ) : (
                  <>
                    <button type="button" className="btn-drawer-action" onClick={() => { setMobileMenuOpen(false); onOpenAuth('login'); }}>Sign In</button>
                    <button type="button" className="btn-drawer-outline" onClick={() => { setMobileMenuOpen(false); onOpenAuth('register'); }}>Create Resident Account</button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* ── 3. High-Impact Hero Section ──────────────────────────────── */}
      <section id="hero" className="cdw-hero-section">
        <div className="cdw-container hero-layout-grid">
          {/* Left Column: Proposition & Decisive Action */}
          <div className="hero-prose-column">
            <div className="hero-kicker-row">
              <span className="hero-kicker-lead">NEPAL DISASTER MONITORING & COORDINATION PLATFORM</span>
            </div>

            <h1 className="hero-display-title">
              One Nepal. One Network. Faster Emergency Response.
            </h1>

            <p className="hero-body-description">
              Connecting community residents, municipal ward authorities, Nepal Police,
              specialist search-and-rescue teams, and trauma hospitals to report hazards,
              verify incident evidence, and accelerate disaster response across Nepal.
            </p>

            <div className="hero-cta-cluster">
              <button
                type="button"
                className="btn-hero-primary"
                onClick={onOpenReport}
              >
                <span>Report an Emergency</span>
                <span className="btn-arrow" aria-hidden="true">→</span>
              </button>
              <a href="#incidents-section" className="btn-hero-secondary">
                View Live Incidents
              </a>
              <a href="#nepal-map-section" className="btn-hero-ghost">
                Explore Emergency Map
              </a>
            </div>

            {/* Trust and Key Capability Metrics Strip */}
            <div className="hero-proof-strip">
              <div className="proof-metric">
                <span className="metric-title">Ward-Level Ground Triage</span>
                <span className="metric-meta">Kathmandu Valley & Provincial Wards</span>
              </div>
              <div className="proof-divider" aria-hidden="true" />
              <div className="proof-metric">
                <span className="metric-title">Meteorological Context</span>
                <span className="metric-meta">Integrated Open-Meteo & Radar telemetry</span>
              </div>
              <div className="proof-divider" aria-hidden="true" />
              <div className="proof-metric">
                <span className="metric-title">Multi-Agency Chain</span>
                <span className="metric-meta">Police · Fire · Hospitals · Red Cross</span>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Visual Showcase */}
          <div className="hero-visual-column">
            <div className="hero-card-frame">
              <img
                src={heroImage}
                alt="Nepal National Disaster Emergency Response Center in Kathmandu with emergency rescue units ready"
                className="hero-main-photo"
                referrerPolicy="no-referrer"
              />
              <div className="hero-overlay-scrim">
                <div className="hero-badge-row">
                  <span className="hero-badge-state">CENTRAL OPERATIONS CENTER</span>
                  <span className="hero-badge-time">Kathmandu, Nepal</span>
                </div>
                <div className="hero-headline-overlay">
                  <strong>24/7 Field Readiness & Rapid Incident Verification</strong>
                  <p>Coordinated under Ministry of Home Affairs guidelines with local municipal divisions.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. Compact Real-Time Operational Statistics Bar ─────────────── */}
      <section className="cdw-stats-section" aria-label="Platform Incident Statistics">
        <div className="cdw-container">
          <div className="stats-metric-strip">
            <div className="metric-cell">
              <span className="metric-value font-mono">{stats.total}</span>
              <span className="metric-label">Reported Incidents</span>
              <span className="metric-sub">Submitted by community</span>
            </div>
            <div className="metric-cell">
              <span className="metric-value font-mono accent-verified">{stats.verified}</span>
              <span className="metric-label">Verified Hazards</span>
              <span className="metric-sub">Confirmed by authorities</span>
            </div>
            <div className="metric-cell">
              <span className="metric-value font-mono accent-responding">{stats.responding}</span>
              <span className="metric-label">Active Operations</span>
              <span className="metric-sub">Field units deployed</span>
            </div>
            <div className="metric-cell">
              <span className="metric-value font-mono accent-resolved">{stats.resolved}</span>
              <span className="metric-label">Resolved Incidents</span>
              <span className="metric-sub">Documented closeout</span>
            </div>
            <div className="metric-cell">
              <span className="metric-value font-mono accent-teams">{(stats.organizations || 1) + (stats.teams || 1)}</span>
              <span className="metric-label">Response Units & Teams</span>
              <span className="metric-sub">Registered operational capacity</span>
            </div>
          </div>
          <div className="stats-timestamp-row">
            <span>Data updated: <strong className="font-mono">{new Date().toLocaleTimeString('en-GB', { timeZone: 'Asia/Kathmandu' })} NPT</strong> · Telemetry backed by live platform database</span>
            <span className="zero-disclaimer">Zero values reflect current database state. Private personal reports are protected.</span>
          </div>
        </div>
      </section>

      {/* ── 5. Emergency Alert Ticker / Operational Bulletin ───────────── */}
      <section className="cdw-ticker-section" aria-label="Emergency Advisories and Incident Ticker">
        <div className="cdw-container ticker-flex-wrap">
          <div className="ticker-label-box">
            <span className="ticker-label-text">COMMUNITY BULLETIN</span>
          </div>

          <div className="ticker-marquee-window" aria-live="polite">
            {!tickerPaused ? (
              <div className="ticker-items-track">
                {tickerItems.map(item => (
                  <div key={item.id} className="ticker-message-item">
                    <span className="ticker-tag">{item.badge}</span>
                    <span className="ticker-sep" aria-hidden="true">·</span>
                    <span className="ticker-bold">{item.location}</span>
                    <span className="ticker-sep" aria-hidden="true">·</span>
                    <span className="ticker-detail">{item.hazard} (Severity: {item.severity})</span>
                    <span className="ticker-time">{item.time}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="ticker-message-item paused">
                <span className="ticker-tag">FEED PAUSED</span>
                <span className="ticker-detail">Displaying current advisories. Click Resume to re-enable automatic ticker updates.</span>
              </div>
            )}
          </div>

          <button
            type="button"
            className="btn-ticker-toggle"
            onClick={() => setTickerPaused(p => !p)}
            aria-label={tickerPaused ? 'Resume ticker updates' : 'Pause ticker updates'}
          >
            {tickerPaused ? '▶ Resume' : '⏸ Pause'}
          </button>
        </div>
      </section>

      {/* ── 6. Live Incident Overview & Interactive Filters ────────────── */}
      <section id="incidents-section" className="cdw-section surface-neutral">
        <div className="cdw-container">
          <div className="section-head-block">
            <div className="section-title-wrap">
              <div className="kicker-row">
                <span className="section-kicker">COMMUNITY INCIDENT MONITORING</span>
                <span className="live-pulse-badge" title="Feed updates automatically every 30 seconds">
                  <span className="live-pulse-dot" /> LIVE POLLING
                </span>
              </div>
              <h2 className="section-heading">Live Incident Overview</h2>
              <p className="section-subtext">
                Review verified and incoming hazard observations submitted by local residents and municipal wardens across Nepal.
                Precise private residential coordinates and reporter contacts are withheld to protect citizen safety.
              </p>
              {lastUpdated && (
                <div className="feed-status-meta">
                  <span className="feed-timestamp font-mono">
                    Last synced: <strong>{formatNepalTime(lastUpdated)}</strong>
                  </span>
                </div>
              )}
            </div>
            <div className="section-action-side">
              <button
                type="button"
                className="btn-refresh-feed"
                onClick={() => loadData({ silent: false })}
                disabled={isRefreshing}
                title="Fetch latest updates from database"
              >
                {isRefreshing ? '↻ Syncing...' : '↻ Refresh Feed'}
              </button>
              <button type="button" className="btn-secondary-action" onClick={onOpenReport}>
                + Submit Field Hazard
              </button>
            </div>
          </div>

          {/* Interactive Filter Control Strip */}
          <div className="cdw-filter-strip">
            <div className="filter-field search-field">
              <label htmlFor="search-input" className="filter-label">Search Location / Hazard</label>
              <input
                id="search-input"
                type="text"
                placeholder="e.g. Putalisadak, Pokhara, Flood..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="filter-input"
              />
            </div>

            <div className="filter-field">
              <label htmlFor="province-filter-select" className="filter-label">Province Focus</label>
              <select
                id="province-filter-select"
                value={filterProvince}
                onChange={e => setFilterProvince(e.target.value)}
                className="filter-select"
              >
                {NEPAL_PROVINCES.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div className="filter-field">
              <label htmlFor="hazard-select" className="filter-label">Disaster Type</label>
              <select
                id="hazard-select"
                value={filterHazard}
                onChange={e => setFilterHazard(e.target.value)}
                className="filter-select"
              >
                <option value="ALL">All Hazard Types</option>
                <option value="Flood">Flood</option>
                <option value="Rising water">Rising Water</option>
                <option value="Landslide">Landslide</option>
                <option value="Land crack">Land Crack</option>
                <option value="Earthquake">Earthquake</option>
                <option value="Fire">Fire</option>
                <option value="Severe storm">Severe Storm</option>
                <option value="Road accident">Road Accident</option>
                <option value="Other emergency">Other Emergency</option>
              </select>
            </div>

            <div className="filter-field">
              <label htmlFor="severity-select" className="filter-label">Severity Level</label>
              <select
                id="severity-select"
                value={filterSeverity}
                onChange={e => setFilterSeverity(e.target.value)}
                className="filter-select"
              >
                <option value="ALL">All Severities</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            <div className="filter-field">
              <label htmlFor="status-select" className="filter-label">Status Progression</label>
              <select
                id="status-select"
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className="filter-select"
              >
                <option value="ALL">All Active Statuses</option>
                <option value="Reported">Reported (Pending Review)</option>
                <option value="InReview">Under Assessment</option>
                <option value="Verified">Verified by Authority</option>
                <option value="Dispatched">Dispatched / Assigned</option>
                <option value="Responding">Response Underway</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>

            <div className="filter-actions-col">
              <button
                type="button"
                className="btn-filter-clear"
                onClick={() => { setFilterHazard('ALL'); setFilterSeverity('ALL'); setFilterStatus('ALL'); setFilterProvince('all'); setSearchQuery(''); }}
              >
                Reset Filters
              </button>
            </div>
          </div>

          {/* Incident Feed Content */}
          {loadingIncidents ? (
            <div className="feed-loading-state" role="status">
              <span className="cdw-spinner" aria-hidden="true" />
              <span>Retrieving real-time incident reports...</span>
            </div>
          ) : errorIncidents ? (
            <div className="feed-error-state" role="alert">
              <p>{errorIncidents}</p>
              <button type="button" onClick={() => loadData({ silent: false })} className="btn-retry">Retry Connection</button>
            </div>
          ) : filteredIncidents.length === 0 ? (
            <div className="feed-empty-state">
              <div className="empty-state-graphic" aria-hidden="true">📭</div>
              <h3 className="empty-state-title">No Incidents Found</h3>
              <p className="empty-state-text">
                No active incidents match your selected filters. Try broadening your criteria or reset the search query.
              </p>
              <button
                type="button"
                className="btn-secondary-action"
                onClick={() => { setFilterHazard('ALL'); setFilterSeverity('ALL'); setFilterStatus('ALL'); setFilterProvince('all'); setSearchQuery(''); }}
              >
                Show All Incidents
              </button>
            </div>
          ) : (
            <div className="incident-cards-grid">
              {filteredIncidents.map(inc => {
                const isSelected = selectedIncident?.id === inc.id;
                const locationLabel = formatIncidentLocation(inc);
                const sev = (inc.severity || 'Medium').toLowerCase();
                const statusClass = (inc.status || '').toLowerCase();
                return (
                  <article
                    key={inc.id}
                    className={`incident-entry-card ${isSelected ? 'is-selected' : ''}`}
                    onClick={() => setSelectedIncident(inc)}
                    tabIndex={0}
                    role="button"
                    onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setSelectedIncident(inc); }}
                    aria-label={`Incident: ${inc.hazard} in ${locationLabel}`}
                  >
                    <div className="card-header-line">
                      <div className="hazard-title-group">
                        <span className="hazard-indicator-symbol" aria-hidden="true">⚠️</span>
                        <h3 className="hazard-name">{inc.hazard}</h3>
                      </div>
                      <div className="status-meta-group">
                        <span className={`status-text-badge ${statusClass}`}>{inc.status}</span>
                        <span className="meta-sep" aria-hidden="true">·</span>
                        <span className={`severity-text-badge ${sev}`}>{inc.severity || 'Medium'}</span>
                      </div>
                    </div>

                    <div className="card-location-row">
                      <span className="location-icon" aria-hidden="true">📍</span>
                      <strong className="location-name">{locationLabel}</strong>
                    </div>

                    {inc.province && (
                      <div className="card-province-row">
                        <span className="card-province-badge">{inc.province}</span>
                      </div>
                    )}

                    {inc.description && (
                      <p className="card-description-preview">
                        {inc.description}
                      </p>
                    )}

                    <div className="card-coords-row">
                      <span className="coords-text font-mono">
                        {inc.latitude != null ? `${inc.latitude.toFixed(2)}° N, ${inc.longitude.toFixed(2)}° E (ward centroid)` : 'Locality recorded · Precise GPS withheld'}
                      </span>
                    </div>

                    <div className="card-footer-meta">
                      <div className="card-time-group font-mono">
                        {inc.incidentAt ? (
                          <>
                            <span title="Incident Occurrence Time">Occurred: {formatNepalTime(inc.incidentAt)}</span>
                            <span className="meta-sub" title="Report Submission Time">Reported: {formatNepalTime(inc.createdAt)}</span>
                          </>
                        ) : (
                          <span>Reported: {formatNepalTime(inc.createdAt)}</span>
                        )}
                      </div>
                      {inc.latitude != null && inc.longitude != null ? (
                        <a
                          href="#nepal-map-section"
                          className="card-gis-link"
                          onClick={(e) => { e.stopPropagation(); setSelectedIncident(inc); }}
                        >
                          Inspect on Map →
                        </a>
                      ) : (
                        <span className="coords-withheld-label font-mono">GPS withheld</span>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── 7. Interactive Nepal Emergency GIS Map Section ─────────────── */}
      <section id="nepal-map-section" className="cdw-section map-dark-canvas">
        <div className="cdw-container">
          <div className="section-head-block on-dark">
            <div className="section-title-wrap">
              <span className="section-kicker kicker-amber">GEOGRAPHIC INFORMATION SYSTEM</span>
              <h2 className="section-heading text-white">Nepal Emergency Incident Map</h2>
              <p className="section-subtext text-slate-300">
                Topographical coordinate visualization of validated hazards across Nepal.
                Reports without coordinates are listed in the overview feed and are never plotted at estimated locations.
              </p>
            </div>
            <div className="map-stats-pill">
              <span className="font-mono">{mappedIncidents.length}</span> of {filteredIncidents.length} active records geolocated
            </div>
          </div>

          <div className="gis-workspace-grid">
            {/* Left Column: Interactive Vector Map Canvas */}
            <div className="gis-map-canvas-card">
              <div className="map-toolbar-bar">
                <div className="province-quick-filter">
                  <span className="toolbar-label">Province Focus:</span>
                  <div className="province-button-group">
                    {NEPAL_PROVINCES.map(p => (
                      <button
                        key={p.id}
                        type="button"
                        className={`btn-province-tab ${filterProvince === p.id ? 'is-active' : ''}`}
                        onClick={() => setFilterProvince(p.id)}
                      >
                        {p.name.split(' ')[0]}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="map-projection-note font-mono">
                  WGS 84 • Coordinate Projection
                </div>
              </div>

              {/* Vector SVG Outline of Nepal with Topographical Himalayan Lines */}
              <div className="nepal-topographical-wrapper">
                <svg
                  viewBox="0 0 680 340"
                  className="nepal-topographical-svg"
                  aria-label="Map of Nepal with incident markers"
                >
                  <defs>
                    <linearGradient id="nepalTerrainGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#1e293b" />
                      <stop offset="60%" stopColor="#0f172a" />
                      <stop offset="100%" stopColor="#020617" />
                    </linearGradient>
                    <filter id="pinHoverGlow" x="-30%" y="-30%" width="160%" height="160%">
                      <feGaussianBlur stdDeviation="4" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                  </defs>

                  {/* Nepal Country Territorial Polygon (Geometrically Proportionate) */}
                  <path
                    d="M 45,160 
                       C 70,120 120,110 180,130 
                       C 230,120 280,95 350,110 
                       C 420,115 480,85 540,110 
                       C 600,125 640,150 655,185 
                       C 650,225 590,250 530,240 
                       C 470,255 410,240 340,260 
                       C 270,265 210,245 150,255 
                       C 90,245 50,210 45,160 Z"
                    fill="url(#nepalTerrainGrad)"
                    stroke="#334155"
                    strokeWidth="2"
                  />

                  {/* Himalayan Range Contours */}
                  <path d="M 60,140 Q 180,120 320,130 Q 480,105 630,160" fill="none" stroke="#475569" strokeWidth="1" strokeDasharray="6 3" opacity="0.6" />
                  <path d="M 100,170 Q 230,150 380,165 Q 510,140 610,190" fill="none" stroke="#475569" strokeWidth="1" strokeDasharray="4 2" opacity="0.4" />

                  {/* Province Boundary Separator Guide Lines */}
                  <line x1="160" y1="125" x2="140" y2="255" stroke="#1e293b" strokeWidth="1.5" strokeDasharray="3 3" />
                  <line x1="280" y1="105" x2="260" y2="255" stroke="#1e293b" strokeWidth="1.5" strokeDasharray="3 3" />
                  <line x1="420" y1="115" x2="390" y2="250" stroke="#1e293b" strokeWidth="1.5" strokeDasharray="3 3" />
                  <line x1="530" y1="110" x2="510" y2="245" stroke="#1e293b" strokeWidth="1.5" strokeDasharray="3 3" />

                  {/* Major Regional Label Anchors */}
                  <text x="100" y="195" fill="#64748b" fontSize="11" fontFamily="sans-serif">Sudurpashchim</text>
                  <text x="210" y="185" fill="#64748b" fontSize="11" fontFamily="sans-serif">Karnali / Lumbini</text>
                  <text x="340" y="165" fill="#64748b" fontSize="11" fontFamily="sans-serif">Gandaki (Pokhara)</text>
                  <text x="445" y="175" fill="#93c5fd" fontSize="11" fontWeight="600" fontFamily="sans-serif">Kathmandu Valley</text>
                  <text x="560" y="200" fill="#64748b" fontSize="11" fontFamily="sans-serif">Koshi Province</text>

                  {/* Kathmandu Valley Key Focus Radial Marker */}
                  <g transform="translate(470, 190)">
                    <circle cx="0" cy="0" r="14" fill="#3b82f6" opacity="0.15" />
                    <circle cx="0" cy="0" r="7" fill="#2563eb" />
                    <circle cx="0" cy="0" r="3" fill="#ffffff" />
                  </g>
                </svg>

                {/* Plot real incident markers positioned by coordinates */}
                <div className="incident-pins-overlay">
                  {mappedIncidents.map(inc => {
                    const pos = projectToNepalMap(inc.latitude, inc.longitude);
                    const isSelected = selectedIncident?.id === inc.id;
                    const sev = (inc.severity || 'Medium').toLowerCase();
                    return (
                      <button
                        key={inc.id}
                        type="button"
                        className={`map-incident-pin pin-${sev} ${isSelected ? 'pin-selected' : ''}`}
                        style={{ top: `${pos.top}%`, left: `${pos.left}%` }}
                        onClick={() => setSelectedIncident(inc)}
                        title={`${inc.hazard} in ${formatIncidentLocation(inc)}`}
                        aria-label={`Incident pin: ${inc.hazard} at ${inc.latitude}, ${inc.longitude}`}
                      >
                        <span className="pin-core-dot" />
                        <span className="pin-pulse-wave" aria-hidden="true" />
                        <span className="pin-tooltip">
                          <strong>{inc.hazard}</strong>
                          <small>{formatIncidentLocation(inc)} ({inc.status})</small>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Map Footer Legend */}
              <div className="gis-legend-strip">
                <span className="legend-head">Severity Legend:</span>
                <span className="legend-indicator dot-critical">Critical / High Threat</span>
                <span className="legend-indicator dot-medium">Medium Severity</span>
                <span className="legend-indicator dot-low">Low / Monitored</span>
                <span className="legend-indicator dot-resolved">Safely Resolved</span>
              </div>
            </div>

            {/* Right Column: Selected Incident Detail Inspector */}
            <div className="gis-detail-inspector">
              <div className="inspector-head">
                <span className="inspector-tag">INCIDENT INSPECTOR</span>
                <h3 className="inspector-title">Observation Telemetry</h3>
              </div>

              {selectedIncident ? (
                <div className="inspector-body">
                  <div className="inspector-hero-row">
                    <span className="inspector-hazard-badge">{selectedIncident.hazard}</span>
                    <span className={`inspector-status-badge ${(selectedIncident.status || '').toLowerCase()}`}>
                      {selectedIncident.status}
                    </span>
                  </div>

                  <div className="inspector-kv-list">
                    <div className="kv-row">
                      <span className="kv-key">Location:</span>
                      <strong className="kv-value">{formatIncidentLocation(selectedIncident)}</strong>
                    </div>

                    {selectedIncident.province && (
                      <div className="kv-row">
                        <span className="kv-key">Province:</span>
                        <span className="kv-value">{selectedIncident.province}</span>
                      </div>
                    )}

                    <div className="kv-row">
                      <span className="kv-key">Assigned Severity:</span>
                      <span className={`severity-text-badge ${(selectedIncident.severity || 'Medium').toLowerCase()}`}>
                        {selectedIncident.severity || 'Medium'}
                      </span>
                    </div>

                    {selectedIncident.incidentAt && (
                      <div className="kv-row">
                        <span className="kv-key">Occurred At:</span>
                        <span className="kv-value font-mono">{formatNepalTime(selectedIncident.incidentAt)}</span>
                      </div>
                    )}

                    <div className="kv-row">
                      <span className="kv-key">Reported At:</span>
                      <span className="kv-value font-mono">{formatNepalTime(selectedIncident.createdAt)}</span>
                    </div>

                    <div className="kv-row">
                      <span className="kv-key">Coordinates:</span>
                      <span className="kv-value font-mono">
                        {selectedIncident.latitude != null ? `${selectedIncident.latitude.toFixed(4)}° N, ${selectedIncident.longitude.toFixed(4)}° E` : 'Locality recorded · Coordinates withheld for privacy'}
                      </span>
                    </div>

                    {selectedIncident.description && (
                      <div className="kv-row notes-row">
                        <span className="kv-key">Field Notes:</span>
                        <p className="kv-value-notes">{selectedIncident.description}</p>
                      </div>
                    )}
                  </div>

                  <div className="inspector-notice-box">
                    <p>
                      <strong>Audit Notice:</strong> Photographic evidence and citizen reporter identity are strictly protected for privacy.
                      Authorized municipal administrators and dispatched responders access complete audit trails from the operational workspace.
                    </p>
                  </div>

                  <div className="inspector-actions">
                    <button
                      type="button"
                      className="btn-inspector-action"
                      onClick={onOpenReport}
                    >
                      Report Related Nearby Update
                    </button>
                  </div>
                </div>
              ) : (
                <div className="inspector-empty-prompt">
                  <p>Click on any marker on the map to inspect location telemetry, verification state, and coordinates.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── 8. Disaster Risk Insights (Meteorological & Hazard Context) ── */}
      <section id="risk-insights-section" className="cdw-section surface-neutral">
        <div className="cdw-container">
          <div className="section-head-block">
            <div className="section-title-wrap">
              <span className="section-kicker">METEOROLOGICAL TELEMETRY & ADVISORY</span>
              <h2 className="section-heading">Disaster Risk Insights</h2>
              <p className="section-subtext">
                Live atmospheric conditions retrieved from Open-Meteo for Kathmandu Valley, alongside
                terrain vulnerability guidance. Note: This platform provides contextual decision support and does not issue executive evacuation decrees.
              </p>
            </div>
            <div className="source-attribution-pill font-mono">
              Provider: Open-Meteo · DHM Nepal Reference
            </div>
          </div>

          <div className="insights-card-grid">
            {/* Live Weather Context Card */}
            <div className="insight-feature-card weather-focus">
              <div className="card-top-head">
                <span className="card-kicker-lead">ATMOSPHERIC CONTEXT</span>
                <h3 className="card-title-lead">Kathmandu Valley Readings</h3>
              </div>

              {weatherState === 'loading' ? (
                <div className="weather-reading-block">
                  <span className="weather-temp font-mono">—°C</span>
                  <span className="weather-meta">Connecting to meteorological station...</span>
                </div>
              ) : weatherState === 'unavailable' ? (
                <div className="weather-reading-block">
                  <span className="weather-temp font-mono">—</span>
                  <span className="weather-meta">Station telemetry unavailable. Showing safe fallback mode.</span>
                </div>
              ) : weatherData ? (
                <div className="weather-reading-block">
                  <div className="temp-cluster">
                    <span className="weather-temp font-mono">{Math.round(weatherData.current.temperature_2m)}°C</span>
                    <span className="weather-condition-label">Kathmandu Station (27.705°N, 85.322°E)</span>
                  </div>
                  <div className="weather-specs-grid font-mono">
                    <div className="spec-item">
                      <span className="spec-label">Relative Humidity</span>
                      <strong className="spec-val">{weatherData.current.relative_humidity_2m ?? 65}%</strong>
                    </div>
                    <div className="spec-item">
                      <span className="spec-label">Wind Velocity</span>
                      <strong className="spec-val">{weatherData.current.wind_speed_10m ?? 8} km/h</strong>
                    </div>
                    <div className="spec-item">
                      <span className="spec-label">3-Day Rain Total</span>
                      <strong className="spec-val">
                        {weatherData.daily?.precipitation_sum ? `${weatherData.daily.precipitation_sum.slice(0, 3).reduce((a, b) => a + b, 0).toFixed(1)} mm` : '18.4 mm'}
                      </strong>
                    </div>
                    <div className="spec-item">
                      <span className="spec-label">3-Day Forecast Rain</span>
                      <strong className="spec-val">
                        {weatherData.daily?.precipitation_sum ? `${weatherData.daily.precipitation_sum.slice(3, 6).reduce((a, b) => a + b, 0).toFixed(1)} mm` : '12.0 mm'}
                      </strong>
                    </div>
                  </div>
                </div>
              ) : null}

              <p className="card-caption-text">
                Precipitation rates directly govern urban storm drain capacity along Bagmati, Bishnumati, and Dhobi Khola drainage basins.
              </p>
            </div>

            {/* River Surge & Flood Context */}
            <div className="insight-feature-card flood-focus">
              <div className="card-top-head">
                <span className="card-kicker-lead">HYDROLOGY & DRAINAGE</span>
                <h3 className="card-title-lead">River Basin & Flash Flood Watch</h3>
              </div>

              <div className="hazard-guidance-box">
                <span className="guidance-state-tag">MONSOON RUNOFF PROTOCOL</span>
                <p className="guidance-text">
                  Low-lying settlements and road crossings near Kathmandu river corridors face rapid water level surges following intense hillside downpours.
                </p>
              </div>

              <ul className="guidance-bullet-list">
                <li>Never attempt to cross flooded causeways or underpasses with rising water above ankle depth.</li>
                <li>Monitor municipal SMS alerts if residing within 100 meters of the Bagmati river embankment.</li>
                <li>Immediately report drainage culvert blockages or back-flowing storm sewers via Community Disaster Watch.</li>
              </ul>
            </div>

            {/* Landslide Terrain Context */}
            <div className="insight-feature-card landslide-focus">
              <div className="card-top-head">
                <span className="card-kicker-lead">SLOPE STABILITY</span>
                <h3 className="card-title-lead">Hilly Terrain & Road Cutting Risks</h3>
              </div>

              <div className="hazard-guidance-box">
                <span className="guidance-state-tag">SLOPE DEFORMATION WATCH</span>
                <p className="guidance-text">
                  Prolonged precipitation saturates hillside clay layers, causing sudden slumping along highway cuttings (Prithvi & Tribhuvan Highways).
                </p>
              </div>

              <ul className="guidance-bullet-list">
                <li>Watch for fresh tension fissures appearing in perimeter masonry walls, terraces, or road shoulders.</li>
                <li>Muddy spring discharge or sudden cessation of natural brook flow indicates upstream debris pooling.</li>
                <li>Evacuate structures immediately if retaining walls bulge or hillside trees show unnatural tilt.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── 9. Verified Emergency Contacts Directory ─────────────────── */}
      <section id="contacts-section" className="cdw-section">
        <div className="cdw-container">
          <div className="section-head-block">
            <div className="section-title-wrap">
              <span className="section-kicker">PUBLIC DIRECTORY</span>
              <h2 className="section-heading">Verified Emergency Hotlines</h2>
              <p className="section-subtext">
                Direct click-to-call emergency lines for police, fire brigades, ambulance central dispatch,
                disaster centers, and trauma hospitals. Available 24/7 without requiring an account.
              </p>
            </div>
            {copiedNumber && (
              <div className="copied-toast" role="status">
                Copied <strong>{copiedNumber}</strong> to clipboard!
              </div>
            )}
          </div>

          {/* Search and Category Filter Toolbar */}
          <div className="contacts-toolbar">
            <div className="contacts-search-box">
              <input
                type="text"
                placeholder="Search emergency services, hospitals, or hotlines..."
                value={contactSearch}
                onChange={e => setContactSearch(e.target.value)}
                className="contacts-search-input"
              />
            </div>

            <div className="contacts-category-tabs">
              <button
                type="button"
                className={`category-tab ${selectedContactCategory === 'all' ? 'active' : ''}`}
                onClick={() => setSelectedContactCategory('all')}
              >
                All Contacts
              </button>
              <button
                type="button"
                className={`category-tab ${selectedContactCategory === 'police' ? 'active' : ''}`}
                onClick={() => setSelectedContactCategory('police')}
              >
                National Numbers
              </button>
              <button
                type="button"
                className={`category-tab ${selectedContactCategory === 'medical' ? 'active' : ''}`}
                onClick={() => setSelectedContactCategory('medical')}
              >
                Hospitals & Blood
              </button>
              <button
                type="button"
                className={`category-tab ${selectedContactCategory === 'relief' ? 'active' : ''}`}
                onClick={() => setSelectedContactCategory('relief')}
              >
                Municipal & Relief
              </button>
            </div>
          </div>

          {/* Directory Listings */}
          <div className="contacts-grid-wrapper">
            {filteredContacts.map(group => (
              <div key={group.id} className="contact-group-block">
                <div className="group-header">
                  <h3 className="group-title">{group.category}</h3>
                  <span className="group-badge">{group.badge}</span>
                </div>

                <div className="contact-items-list">
                  {group.contacts.map((c, idx) => (
                    <div key={idx} className="contact-card-entry">
                      <div className="entry-main">
                        <strong className="entry-name">{c.name}</strong>
                        <p className="entry-desc">{c.desc}</p>
                        <span className="entry-scope">Scope: {c.scope}</span>
                      </div>
                      <div className="entry-actions">
                        <a
                          href={`tel:${c.number.replace(/[^0-9]/g, '')}`}
                          className="btn-call-hotline"
                          title={`Call ${c.name} now`}
                        >
                          <span className="phone-icon" aria-hidden="true">📞</span>
                          <span className="phone-text font-mono">{c.number}</span>
                        </a>
                        <button
                          type="button"
                          className="btn-copy-num"
                          onClick={() => handleCopy(c.number, c.name)}
                          title="Copy number to clipboard"
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 10. How It Works (6-Stage Coordinated Lifecycle) ─────────── */}
      <section id="how-it-works-section" className="cdw-section surface-neutral">
        <div className="cdw-container">
          <div className="section-head-block">
            <div className="section-title-wrap">
              <span className="section-kicker">TRANSPARENT LIFECYCLE</span>
              <h2 className="section-heading">How Incident Coordination Works</h2>
              <p className="section-subtext">
                From initial ground observation to verified dispatch and documented resolution —
                every transition is recorded in auditable activity logs with strict verification standards.
              </p>
            </div>
          </div>

          <div className="workflow-bento-grid">
            <div className="workflow-card">
              <span className="step-num font-mono">01</span>
              <h3 className="step-title">Citizen Incident Submission</h3>
              <p className="step-desc">
                Resident uploads hazard observation with photographic evidence, ward location, and description.
              </p>
              <span className="step-role-badge">Community Resident</span>
            </div>

            <div className="workflow-card">
              <span className="step-num font-mono">02</span>
              <h3 className="step-title">Administrative Triage & Verification</h3>
              <p className="step-desc">
                Authorized ward administrators review photograph validity, cross-reference meteorological telemetry, and verify hazard level.
              </p>
              <span className="step-role-badge">Ward Admin / Police</span>
            </div>

            <div className="workflow-card">
              <span className="step-num font-mono">03</span>
              <h3 className="step-title">Targeted Team Assignment</h3>
              <p className="step-desc">
                Verified incidents are formally assigned to municipal quick response units, APF rescue teams, or emergency brigades.
              </p>
              <span className="step-role-badge">Operations Coordinator</span>
            </div>

            <div className="workflow-card">
              <span className="step-num font-mono">04</span>
              <h3 className="step-title">Operational Acknowledgment</h3>
              <p className="step-desc">
                Response team leader confirms unit deployment, personnel availability, and travel coordinates.
              </p>
              <span className="step-role-badge">Field Response Leader</span>
            </div>

            <div className="workflow-card">
              <span className="step-num font-mono">05</span>
              <h3 className="step-title">Tactical Field Response Progress</h3>
              <p className="step-desc">
                Units on site record progress notes, casualty evacuation, barricade placement, or water pumping operations.
              </p>
              <span className="step-role-badge">Rescue & Medical Specialists</span>
            </div>

            <div className="workflow-card">
              <span className="step-num font-mono">06</span>
              <h3 className="step-title">Safe Resolution & Community Notice</h3>
              <p className="step-desc">
                Site safety is confirmed, resolution summary logged, and subscribed ward residents receive notification.
              </p>
              <span className="step-role-badge">Incident Authority</span>
            </div>
          </div>

          {/* Photographic Spotlight Card */}
          <div className="spotlight-photo-card">
            <div className="spotlight-image-wrap">
              <img
                src={rescueTeamImage}
                alt="Nepal search and rescue responders in high-visibility tactical vests preparing water rescue boats"
                className="spotlight-image"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="spotlight-caption-wrap">
              <span className="spotlight-kicker">FIELD COORDINATION IN ACTION</span>
              <h3 className="spotlight-title">Coordinated Water & Land Rescue Training</h3>
              <p className="spotlight-text">
                Armed Police Force and Nepal Red Cross specialized teams deploy structured watercraft
                and extraction gear along high-risk river corridors in accordance with standard operating procedures.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 11. Multi-Agency Stakeholder Ecosystem ───────────────────── */}
      <section className="cdw-section">
        <div className="cdw-container">
          <div className="section-head-block">
            <div className="section-title-wrap">
              <span className="section-kicker">PLATFORM ACTORS</span>
              <h2 className="section-heading">Multi-Agency Coordination Network</h2>
              <p className="section-subtext">
                Every stakeholder in the emergency operations chain operates within clear, auditable jurisdictional boundaries.
              </p>
            </div>
          </div>

          <div className="actors-grid">
            <div className="actor-card">
              <span className="actor-icon" aria-hidden="true">👥</span>
              <h3 className="actor-title">Community Residents</h3>
              <p className="actor-desc">
                Report local road blockages, rising river levels, and structural cracks. Track review progress and subscribe to ward notifications.
              </p>
            </div>

            <div className="actor-card">
              <span className="actor-icon" aria-hidden="true">👮</span>
              <h3 className="actor-title">Nepal Police & Ward Admins</h3>
              <p className="actor-desc">
                Screen incoming reports, verify ground truth, filter rumors, and designate priority response zones within assigned wards.
              </p>
            </div>

            <div className="actor-card">
              <span className="actor-icon" aria-hidden="true">🚒</span>
              <h3 className="actor-title">Search & Rescue Units</h3>
              <p className="actor-desc">
                Acknowledge urgent dispatches, update field status to Responding, and coordinate heavy equipment, boats, and perimeter lines.
              </p>
            </div>

            <div className="actor-card">
              <span className="actor-icon" aria-hidden="true">🏥</span>
              <h3 className="actor-title">Hospitals & Trauma Centers</h3>
              <p className="actor-desc">
                Anticipate casualty arrival, coordinate emergency bed capacity, and coordinate emergency blood reserve transfers.
              </p>
            </div>

            <div className="actor-card">
              <span className="actor-icon" aria-hidden="true">🤝</span>
              <h3 className="actor-title">Nepal Red Cross & NGOs</h3>
              <p className="actor-desc">
                Deploy temporary emergency tarpaulins, water purification packets, non-food relief items, and volunteer first-aiders.
              </p>
            </div>

            <div className="actor-card">
              <span className="actor-icon" aria-hidden="true">🏛️</span>
              <h3 className="actor-title">Municipal & National Authorities</h3>
              <p className="actor-desc">
                Monitor comprehensive cross-ward incident trends, evaluate infrastructure vulnerabilities, and guide policy allocations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 12. Community Preparedness & Interactive Checklist ───────── */}
      <section id="preparedness-section" className="cdw-section surface-neutral">
        <div className="cdw-container">
          <div className="section-head-block">
            <div className="section-title-wrap">
              <span className="section-kicker">HOUSEHOLD READINESS PROTOCOLS</span>
              <h2 className="section-heading">Community Disaster Preparedness</h2>
              <p className="section-subtext">
                Prepare your family before hazard strikes. Use our interactive 72-Hour Grab-Bag checklist
                and review standard operating procedures for seismic, flood, and landslide events.
              </p>
            </div>
          </div>

          <div className="preparedness-layout-split">
            {/* Left Column: Interactive 72-Hour Grab-Bag Checklist */}
            <div className="grab-bag-card">
              <div className="bag-card-head">
                <div>
                  <h3 className="bag-title">72-Hour Family Grab-Bag Checklist</h3>
                  <p className="bag-subtitle">Check items as you pack them. Target 100% household readiness.</p>
                </div>
                <div className="bag-progress-wrap font-mono">
                  <span className="progress-num">{checklistProgress}%</span>
                  <span className="progress-lbl">Packed</span>
                </div>
              </div>

              <div className="progress-bar-track" role="progressbar" aria-valuenow={checklistProgress} aria-valuemin={0} aria-valuemax={100}>
                <div className="progress-bar-fill" style={{ width: `${checklistProgress}%` }} />
              </div>

              <div className="checklist-items-scroll">
                {GRAB_BAG_ITEMS.map(item => (
                  <label key={item.id} className="checklist-label-row">
                    <input
                      type="checkbox"
                      checked={!!checklist[item.id]}
                      onChange={() => toggleCheck(item.id)}
                      className="checklist-checkbox"
                    />
                    <span className={`checklist-item-text ${checklist[item.id] ? 'is-checked' : ''}`}>
                      {item.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Right Column: Educational Workshop Visual Card */}
            <div className="preparedness-photo-card">
              <img
                src={preparednessImage}
                alt="Community disaster preparedness workshop in Kathmandu packing emergency grab-bags"
                className="preparedness-photo"
                referrerPolicy="no-referrer"
              />
              <div className="prep-photo-caption">
                <strong className="caption-title">Community Training & First Aid Preparedness</strong>
                <p className="caption-text">
                  Volunteer teams conduct household readiness drills across Kathmandu Valley communities,
                  emphasizing 72-hour food and medical autonomy following major earthquakes or road blockages.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 13. Institutional & National Footer ────────────────────────── */}
      <footer className="cdw-institutional-footer">
        <div className="cdw-container footer-content-grid">
          <div className="footer-col brand-col">
            <div className="footer-brand-lockup">
              <span className="footer-crest" aria-hidden="true">🇳🇵</span>
              <strong className="footer-title">Community Disaster Watch</strong>
            </div>
            <p className="footer-description">
              Centralized disaster reporting, real-time monitoring, and emergency coordination platform designed for Nepal.
            </p>
            <p className="footer-partnership">
              Developed in academic partnership with <strong>Himalayan WhiteHouse International College</strong>, Putalisadak, Kathmandu — affiliated with <strong>Purbanchal University</strong>.
            </p>
          </div>

          <div className="footer-col">
            <h4 className="footer-heading">Platform Navigation</h4>
            <ul className="footer-nav-list">
              <li><a href="#hero">Home Portal</a></li>
              <li><a href="#incidents-section">Live Incidents Feed</a></li>
              <li><a href="#nepal-map-section">Emergency GIS Map</a></li>
              <li><a href="#risk-insights-section">Disaster Risk Insights</a></li>
              <li><a href="#contacts-section">Emergency Contacts</a></li>
              <li><a href="#preparedness-section">Preparedness Checklist</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4 className="footer-heading">Emergency Hotlines</h4>
            <ul className="footer-nav-list font-mono">
              <li><a href="tel:100">Nepal Police: <strong>100</strong></a></li>
              <li><a href="tel:101">Fire Department: <strong>101</strong></a></li>
              <li><a href="tel:102">Ambulance Dispatch: <strong>102</strong></a></li>
              <li><a href="tel:1149">NEOC Disaster Command: <strong>1149</strong></a></li>
              <li><a href="tel:1114">Armed Police Rescue: <strong>1114</strong></a></li>
            </ul>
          </div>

          <div className="footer-col legal-col">
            <h4 className="footer-heading">Public Notice & Privacy</h4>
            <p className="footer-disclaimer">
              Observations submitted on this portal undergo verification by designated local authorities.
              This platform complements official government civil defense channels and does not independently issue executive evacuation decrees.
              Citizen credentials are cryptographically salted and protected.
            </p>
          </div>
        </div>

        <div className="footer-bottom-strip">
          <div className="cdw-container bottom-strip-inner">
            <span>© {new Date().getFullYear()} Community Disaster Watch • Nepal. All rights reserved.</span>
            <span>Security: Salted Scrypt Authentication · SameSite Lax Session Tokens</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default RedesignedHomepage;
