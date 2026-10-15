import React, { useState, useEffect, useMemo } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { transportService } from '../../services/transportService';
import { TransportLiveMap } from './transport/TransportLiveMap';
import { TransportPlaybackMap } from './transport/TransportPlaybackMap';
import { ErrorBoundary } from '../common/ErrorBoundary';
import {
  Bus,
  Users,
  MapPin,
  Navigation,
  Activity,
  AlertTriangle,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Search,
  Filter,
  Plus,
  RefreshCw,
  Eye,
  Sliders,
  Radio,
  FileText,
  Phone,
  Calendar,
  Layers,
  ChevronRight,
  TrendingUp,
  X,
  UserCheck,
  Gauge,
  Compass,
  ArrowRight,
  ChevronLeft,
  Maximize2,
  Minimize2,
  Layout,
  Columns
} from 'lucide-react';

export const TransportModule = () => {
  const { activeTab, setActiveTab } = useTheme();
  const { showToast } = useToast();

  // Tab mapping
  const resolveInitialTab = () => {
    if (activeTab === 'transport-buses') return 'buses';
    if (activeTab === 'transport-drivers') return 'drivers';
    if (activeTab === 'transport-routes') return 'routes';
    if (activeTab === 'transport-assignments') return 'assignments';
    if (activeTab === 'transport-live') return 'live';
    if (activeTab === 'transport-reports') return 'reports';
    if (activeTab === 'transport-alerts') return 'alerts';
    return 'overview';
  };

  const [currentTab, setCurrentTab] = useState(resolveInitialTab);

  useEffect(() => {
    if (activeTab && activeTab.startsWith('transport-')) {
      const tabName = activeTab.replace('transport-', '');
      setCurrentTab(tabName);
    }
  }, [activeTab]);

  const handleTabChange = (tab) => {
    setCurrentTab(tab);
    if (setActiveTab) {
      setActiveTab(`transport-${tab}`);
    }
  };

  // Main State
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState(null);
  const [buses, setBuses] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [studentAssignments, setStudentAssignments] = useState([]);
  const [liveBuses, setLiveBuses] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [tripsHistory, setTripsHistory] = useState([]);

  // Selected entities for modals / inspector
  const [selectedLiveBus, setSelectedLiveBus] = useState(null);
  const [playbackData, setPlaybackData] = useState(null);
  const [playbackLoading, setPlaybackLoading] = useState(false);
  const [playbackProgress, setPlaybackProgress] = useState(0);
  const [isPlaybackPlaying, setIsPlaybackPlaying] = useState(false);

  // Modals
  const [showAddBusModal, setShowAddBusModal] = useState(false);
  const [showAddDriverModal, setShowAddDriverModal] = useState(false);
  const [showAddRouteModal, setShowAddRouteModal] = useState(false);
  const [showAddAssignmentModal, setShowAddAssignmentModal] = useState(false);
  const [showAssignStudentModal, setShowAssignStudentModal] = useState(false);
  const [showManageStopsModal, setShowManageStopsModal] = useState(false);
  const [selectedRouteForStops, setSelectedRouteForStops] = useState(null);
  const [alertRemarksModal, setAlertRemarksModal] = useState(null); // { alertId, action }
  const [remarksInput, setRemarksInput] = useState('');

  // Live Tracking Layout States (Full Body Map Canvas)
  const [liveViewMode, setLiveViewMode] = useState('full'); // 'full' or 'split'
  const [showFleetSidebar, setShowFleetSidebar] = useState(true);
  const [showInspectorSidebar, setShowInspectorSidebar] = useState(true);
  const [isLiveFullscreen, setIsLiveFullscreen] = useState(false);

  // Map layer toggles
  const [showPlannedRoute, setShowPlannedRoute] = useState(true);
  const [showActualPath, setShowActualPath] = useState(true);
  const [showGeofences, setShowGeofences] = useState(true);
  const [showStopsLayer, setShowStopsLayer] = useState(true);

  // Search & Filters
  const [busSearch, setBusSearch] = useState('');
  const [driverSearch, setDriverSearch] = useState('');
  const [routeSearch, setRouteSearch] = useState('');
  const [alertFilter, setAlertFilter] = useState('ALL');

  // Form states
  const [busForm, setBusForm] = useState({
    busNumber: '',
    registrationNumber: '',
    capacity: 40,
    model: '',
    manufacturer: '',
    fuelType: 'DIESEL',
    gpsDeviceId: '',
    status: 'ACTIVE'
  });

  const [driverForm, setDriverForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: 'password',
    licenseNumber: '',
    licenseCategory: 'COMMERCIAL_HEAVY',
    experienceYears: 5,
    verificationStatus: 'VERIFIED'
  });

  const [routeForm, setRouteForm] = useState({
    routeName: '',
    routeCode: '',
    startLocation: '',
    endLocation: '',
    plannedDurationMinutes: 45,
    totalDistanceKm: 18.0,
    morningStartTime: '07:15 AM',
    eveningStartTime: '02:45 PM',
    speedLimitKmh: 50
  });

  const [assignmentForm, setAssignmentForm] = useState({
    driverId: '',
    busId: '',
    routeId: '',
    shift: 'BOTH',
    notes: ''
  });

  const [studentAssignForm, setStudentAssignForm] = useState({
    studentName: '',
    admissionNo: '',
    className: '',
    routeId: '',
    pickupStopId: '',
    dropStopId: '',
    pickupTime: '07:30 AM',
    dropTime: '03:15 PM',
    guardianPhone: ''
  });

  // Load initial data
  const loadData = async () => {
    setLoading(true);
    try {
      const [ov, bList, dList, rList, asList, saList, liveList, alList, repList] = await Promise.all([
        transportService.getOverview(),
        transportService.getBuses(),
        transportService.getDrivers(),
        transportService.getRoutes(),
        transportService.getAssignments(),
        transportService.getStudentAssignments(),
        transportService.getLiveTracking(),
        transportService.getAlerts(),
        transportService.getTripReports()
      ]);

      setOverview(ov);
      setBuses(bList);
      setDrivers(dList);
      setRoutes(rList);
      setAssignments(asList);
      setStudentAssignments(saList);
      setLiveBuses(liveList);
      setAlerts(alList);
      setTripsHistory(repList);

      if (liveList && liveList.length > 0 && !selectedLiveBus) {
        setSelectedLiveBus(liveList[0]);
      }
    } catch {
      showToast('Error loading transport data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // Auto-refresh live tracking every 12 seconds
    const interval = setInterval(async () => {
      try {
        const live = await transportService.getLiveTracking();
        setLiveBuses(live);
        if (selectedLiveBus) {
          const updated = live.find((b) => b.busId === selectedLiveBus.busId);
          if (updated) setSelectedLiveBus(updated);
        }
      } catch {
        // silent polling catch
      }
    }, 12000);
    return () => clearInterval(interval);
  }, []);

  // Handle Track Bus On Map (Direct navigation from Buses list or Overview to Map)
  const handleTrackBusOnMap = (bus) => {
    if (!bus) return;

    // 1. Check existing live tracking fleet
    let target = liveBuses.find(
      (lb) =>
        String(lb.busId) === String(bus.id || bus.busId) ||
        String(lb.busNumber).toLowerCase() === String(bus.busNumber).toLowerCase()
    );

    // 2. Resolve route assigned to this bus
    const assignedRoute =
      routes.find(
        (r) =>
          r.id === bus.routeId ||
          r.routeName === bus.assignedRouteName ||
          r.routeName === bus.routeName
      ) || routes[0];

    const stops = assignedRoute?.stops || [];
    const originStop = stops[0];
    const destStop = stops[stops.length - 1];

    if (!target) {
      const lat = originStop?.latitude || 25.6025;
      const lon = originStop?.longitude || 85.1430;

      target = {
        busId: bus.id || bus.busId,
        busNumber: bus.busNumber,
        registrationNumber: bus.registrationNumber || 'MH-02-TR-1001',
        tripId: bus.id || 1,
        tripStatus: bus.status === 'ACTIVE' ? 'IN_PROGRESS' : 'SCHEDULED',
        driverId: bus.assignedDriverId || 1,
        driverName: bus.assignedDriverName || 'Assigned Driver',
        driverPhone: bus.assignedDriverPhone || '+91 98765 43210',
        routeId: assignedRoute?.id || 1,
        routeName: assignedRoute?.routeName || bus.assignedRouteName || 'Main Campus Route',
        shift: 'MORNING',
        currentLatitude: lat,
        currentLongitude: lon,
        currentSpeedKmh: bus.status === 'ACTIVE' ? (bus.currentSpeed || 34.0) : 0.0,
        heading: 120.0,
        lastGpsUpdate: new Date().toISOString(),
        isGpsOnline: true,
        currentStopName: originStop?.stopName || 'Route Origin',
        nextStopName: stops[1]?.stopName || destStop?.stopName || 'School Destination',
        nextStopEtaMinutes: 8,
        completedStops: 1,
        totalStops: stops.length || 5,
        traveledDistanceKm: assignedRoute?.totalDistanceKm
          ? Number((assignedRoute.totalDistanceKm * 0.4).toFixed(1))
          : 7.2,
        totalRouteDistanceKm: assignedRoute?.totalDistanceKm || 18.5,
        destinationName: destStop?.stopName || assignedRoute?.endLocation || 'School Main Gate',
        originName: originStop?.stopName || assignedRoute?.startLocation || 'Route Origin',
        openAlertsCount: 0,
      };

      setLiveBuses((prev) => {
        const exists = prev.some((b) => String(b.busId) === String(target.busId));
        return exists ? prev : [target, ...prev];
      });
    }

    setSelectedLiveBus(target);
    setShowInspectorSidebar(true);
    handleTabChange('live');
  };

  // Playback timer loop
  useEffect(() => {
    let timer = null;
    if (isPlaybackPlaying && playbackData && playbackData.pathPoints?.length > 0) {
      timer = setInterval(() => {
        setPlaybackProgress((prev) => {
          if (prev >= 100) {
            setIsPlaybackPlaying(false);
            return 100;
          }
          return prev + 5;
        });
      }, 600);
    }
    return () => clearInterval(timer);
  }, [isPlaybackPlaying, playbackData]);

  // Handle open playback
  const handleOpenPlayback = async (tripId) => {
    setPlaybackLoading(true);
    try {
      const data = await transportService.getTripPlayback(tripId);
      setPlaybackData(data);
      setPlaybackProgress(0);
      setIsPlaybackPlaying(true);
    } catch {
      showToast('Could not load playback trail', 'error');
    } finally {
      setPlaybackLoading(false);
    }
  };

  // Form Submissions
  const handleCreateBus = async (e) => {
    e.preventDefault();
    try {
      await transportService.createBus(busForm);
      showToast('Bus added successfully', 'success');
      setShowAddBusModal(false);
      setBusForm({ busNumber: '', registrationNumber: '', capacity: 40, model: '', manufacturer: '', fuelType: 'DIESEL', gpsDeviceId: '', status: 'ACTIVE' });
      loadData();
    } catch {
      showToast('Error creating bus', 'error');
    }
  };

  const handleCreateDriver = async (e) => {
    e.preventDefault();
    try {
      await transportService.createDriver(driverForm);
      showToast('Driver registered successfully', 'success');
      setShowAddDriverModal(false);
      setDriverForm({ name: '', email: '', phone: '', password: 'password', licenseNumber: '', licenseCategory: 'COMMERCIAL_HEAVY', experienceYears: 5, verificationStatus: 'VERIFIED' });
      loadData();
    } catch {
      showToast('Error creating driver', 'error');
    }
  };

  const handleCreateRoute = async (e) => {
    e.preventDefault();
    try {
      await transportService.createRoute(routeForm);
      showToast('Route created successfully', 'success');
      setShowAddRouteModal(false);
      setRouteForm({ routeName: '', routeCode: '', startLocation: '', endLocation: '', plannedDurationMinutes: 45, totalDistanceKm: 18.0, morningStartTime: '07:15 AM', eveningStartTime: '02:45 PM', speedLimitKmh: 50 });
      loadData();
    } catch {
      showToast('Error creating route', 'error');
    }
  };

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    try {
      await transportService.createAssignment({
        driverId: Number(assignmentForm.driverId),
        busId: Number(assignmentForm.busId),
        routeId: Number(assignmentForm.routeId),
        shift: assignmentForm.shift,
        notes: assignmentForm.notes
      });
      showToast('Duty assignment saved successfully', 'success');
      setShowAddAssignmentModal(false);
      loadData();
    } catch {
      showToast('Error saving assignment', 'error');
    }
  };

  const handleAssignStudent = async (e) => {
    e.preventDefault();
    try {
      await transportService.assignStudent({
        studentId: Date.now() % 10000,
        studentName: studentAssignForm.studentName,
        admissionNo: studentAssignForm.admissionNo,
        className: studentAssignForm.className,
        routeId: Number(studentAssignForm.routeId),
        pickupStopId: studentAssignForm.pickupStopId ? Number(studentAssignForm.pickupStopId) : null,
        dropStopId: studentAssignForm.dropStopId ? Number(studentAssignForm.dropStopId) : null,
        pickupTime: studentAssignForm.pickupTime,
        dropTime: studentAssignForm.dropTime,
        guardianPhone: studentAssignForm.guardianPhone
      });
      showToast('Student assigned to route successfully', 'success');
      setShowAssignStudentModal(false);
      loadData();
    } catch {
      showToast('Error assigning student', 'error');
    }
  };

  const handleAlertAction = async () => {
    if (!alertRemarksModal) return;
    const { alertId, action } = alertRemarksModal;
    try {
      if (action === 'ACKNOWLEDGE') {
        await transportService.acknowledgeAlert(alertId, remarksInput);
        showToast('Alert acknowledged', 'success');
      } else {
        await transportService.resolveAlert(alertId, remarksInput);
        showToast('Alert resolved', 'success');
      }
      setAlertRemarksModal(null);
      setRemarksInput('');
      loadData();
    } catch {
      showToast('Action failed', 'error');
    }
  };

  // Filtered lists
  const filteredBuses = useMemo(() => {
    return buses.filter((b) =>
      b.busNumber?.toLowerCase().includes(busSearch.toLowerCase()) ||
      b.registrationNumber?.toLowerCase().includes(busSearch.toLowerCase()) ||
      b.assignedDriverName?.toLowerCase().includes(busSearch.toLowerCase())
    );
  }, [buses, busSearch]);

  const filteredDrivers = useMemo(() => {
    return drivers.filter((d) =>
      d.name?.toLowerCase().includes(driverSearch.toLowerCase()) ||
      d.phone?.includes(driverSearch) ||
      d.licenseNumber?.toLowerCase().includes(driverSearch.toLowerCase())
    );
  }, [drivers, driverSearch]);

  const filteredAlerts = useMemo(() => {
    if (alertFilter === 'ALL') return alerts;
    return alerts.filter((a) => a.status === alertFilter);
  }, [alerts, alertFilter]);

  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px', fontFamily: 'Urbanist, sans-serif' }}>
      {/* Header bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #0d9488 0%, #06b6d4 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 14px rgba(13, 148, 136, 0.3)'
              }}
            >
              <Bus size={24} color="#ffffff" />
            </div>
            <div>
              <h1 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
                Transport Management System
              </h1>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                GPS Telemetry • Safe Route Tracking • Fleet Duty Audit • Incident Centre
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={loadData}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 16px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-card)',
              color: 'var(--text-secondary)',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            Sync Fleet
          </button>

          <button
            onClick={() => setShowAddBusModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 18px',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              background: 'linear-gradient(135deg, #0d9488 0%, #06b6d4 100%)',
              color: '#ffffff',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(13, 148, 136, 0.3)'
            }}
          >
            <Plus size={16} />
            Add Vehicle
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          borderBottom: '1px solid var(--border-color)',
          paddingBottom: '8px',
          overflowX: 'auto'
        }}
      >
        {[
          { key: 'overview', label: 'Overview', icon: Activity },
          { key: 'buses', label: 'Buses', icon: Bus, badge: buses.length },
          { key: 'drivers', label: 'Drivers', icon: Users, badge: drivers.length },
          { key: 'routes', label: 'Routes & Stops', icon: MapPin, badge: routes.length },
          { key: 'assignments', label: 'Assignments', icon: ShieldCheck },
          { key: 'live', label: 'Live Tracking', icon: Navigation, pulse: overview?.activeTrips > 0 },
          { key: 'reports', label: 'Playback & Reports', icon: Play },
          { key: 'alerts', label: 'Alerts Center', icon: AlertTriangle, badge: overview?.openAlertsCount, badgeColor: '#ef4444' }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 18px',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                background: isActive ? '#0d9488' : 'transparent',
                color: isActive ? '#ffffff' : 'var(--text-secondary)',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.88rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap'
              }}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    padding: '1px 6px',
                    borderRadius: '10px',
                    backgroundColor: tab.badgeColor || (isActive ? 'rgba(255,255,255,0.25)' : 'var(--bg-app)'),
                    color: tab.badgeColor ? '#ffffff' : (isActive ? '#ffffff' : 'var(--text-secondary)')
                  }}
                >
                  {tab.badge}
                </span>
              )}
              {tab.pulse && (
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: '#10b981',
                    boxShadow: '0 0 8px #10b981'
                  }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {currentTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* KPI Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
              gap: '16px'
            }}
          >
            {[
              {
                title: 'Total Buses',
                value: overview?.totalBuses ?? buses.length,
                sub: `${overview?.idleBuses ?? 0} parked / idle`,
                icon: Bus,
                color: '#0d9488',
                bg: 'rgba(13, 148, 136, 0.1)'
              },
              {
                title: 'Active Trips',
                value: overview?.activeTrips ?? 0,
                sub: 'Currently GPS tracked',
                icon: Navigation,
                color: '#10b981',
                bg: 'rgba(16, 185, 129, 0.1)',
                pulse: true
              },
              {
                title: 'Active Routes',
                value: overview?.totalRoutes ?? routes.length,
                sub: 'Morning & evening shifts',
                icon: MapPin,
                color: '#2563eb',
                bg: 'rgba(37, 99, 235, 0.1)'
              },
              {
                title: 'Assigned Drivers',
                value: overview?.totalDrivers ?? drivers.length,
                sub: '100% verified licenses',
                icon: UserCheck,
                color: '#8b5cf6',
                bg: 'rgba(139, 92, 246, 0.1)'
              },
              {
                title: 'Fleet Alerts',
                value: overview?.openAlertsCount ?? alerts.filter((a) => a.status === 'OPEN').length,
                sub: `${overview?.delayedTrips ?? 0} delayed schedules`,
                icon: AlertTriangle,
                color: '#ef4444',
                bg: 'rgba(239, 68, 68, 0.1)'
              }
            ].map((kpi, idx) => {
              const Icon = kpi.icon;
              return (
                <div
                  key={idx}
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>{kpi.title}</span>
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '10px',
                        backgroundColor: kpi.bg,
                        color: kpi.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Icon size={18} />
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>
                      {kpi.value}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px' }}>{kpi.sub}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Urgent Alerts Banner if any */}
          {alerts.filter((a) => a.status === 'OPEN').length > 0 && (
            <div
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                borderRadius: 'var(--radius-md)',
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    backgroundColor: '#ef4444',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <AlertTriangle size={18} color="#ffffff" />
                </div>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ef4444' }}>
                    Attention: {alerts.filter((a) => a.status === 'OPEN').length} Open Transport Alerts Require Action
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {alerts.find((a) => a.status === 'OPEN')?.title || 'Check delayed bus schedules and speed deviations.'}
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleTabChange('alerts')}
                style={{
                  padding: '7px 16px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: '#ef4444',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Inspect Alerts
              </button>
            </div>
          )}

          {/* Quick Fleet Monitor Table */}
          <div
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-lg)',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                  Live Fleet Quick Status
                </h3>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Real-time telemetry and schedule progress
                </p>
              </div>
              <button
                onClick={() => handleTabChange('live')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'none',
                  border: 'none',
                  color: '#0d9488',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Full Live Map <ChevronRight size={16} />
              </button>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '10px 12px' }}>Bus</th>
                    <th style={{ padding: '10px 12px' }}>Driver</th>
                    <th style={{ padding: '10px 12px' }}>Route</th>
                    <th style={{ padding: '10px 12px' }}>Status</th>
                    <th style={{ padding: '10px 12px' }}>Current Speed</th>
                    <th style={{ padding: '10px 12px' }}>Next Stop & ETA</th>
                    <th style={{ padding: '10px 12px' }}>Stops Done</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {liveBuses.map((bus) => (
                    <tr key={bus.busId} style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <td style={{ padding: '12px' }}>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{bus.busNumber}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{bus.registrationNumber}</div>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <div style={{ fontWeight: 600 }}>{bus.driverName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{bus.driverPhone}</div>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <div style={{ fontWeight: 600 }}>{bus.routeName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Shift: {bus.shift}</div>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span
                          style={{
                            padding: '3px 8px',
                            borderRadius: '12px',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            backgroundColor: bus.tripStatus === 'IN_PROGRESS' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(100, 116, 139, 0.15)',
                            color: bus.tripStatus === 'IN_PROGRESS' ? '#10b981' : '#64748b'
                          }}
                        >
                          {bus.tripStatus === 'IN_PROGRESS' ? '● IN TRANSIT' : '○ IDLE / READY'}
                        </span>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <div style={{ fontWeight: 700, color: bus.currentSpeedKmh > 45 ? '#ef4444' : '#0d9488' }}>
                          {Math.round(bus.currentSpeedKmh)} km/h
                        </div>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <div>{bus.nextStopName || 'Depot'}</div>
                        <div style={{ fontSize: '0.75rem', color: '#0d9488', fontWeight: 600 }}>
                          ETA: {bus.nextStopEtaMinutes} mins
                        </div>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <div style={{ fontWeight: 600 }}>
                          {bus.completedStops} / {bus.totalStops}
                        </div>
                        <div
                          style={{
                            width: '80px',
                            height: '5px',
                            backgroundColor: 'var(--bg-app)',
                            borderRadius: '3px',
                            overflow: 'hidden',
                            marginTop: '4px'
                          }}
                        >
                          <div
                            style={{
                              width: `${(bus.completedStops / (bus.totalStops || 1)) * 100}%`,
                              height: '100%',
                              backgroundColor: '#0d9488'
                            }}
                          />
                        </div>
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right' }}>
                        <button
                          onClick={() => handleTrackBusOnMap(bus)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: 'var(--radius-md)',
                            backgroundColor: '#0d9488',
                            color: '#ffffff',
                            border: 'none',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          Track Live
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: BUS MANAGEMENT */}
      {currentTab === 'buses' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ position: 'relative', minWidth: '280px' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search bus number, registration..."
                value={busSearch}
                onChange={(e) => setBusSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px 9px 36px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-card)',
                  color: 'var(--text-primary)',
                  fontSize: '0.85rem'
                }}
              />
            </div>
            <button
              onClick={() => setShowAddBusModal(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '9px 18px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: '#0d9488',
                color: '#ffffff',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
            >
              <Plus size={16} /> Add Bus
            </button>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '20px'
            }}
          >
            {filteredBuses.map((bus) => (
              <div
                key={bus.id}
                style={{
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  transition: 'transform 0.2s ease',
                  position: 'relative'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '12px',
                        backgroundColor: 'rgba(13, 148, 136, 0.1)',
                        color: '#0d9488',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Bus size={22} />
                    </div>
                    <div>
                      <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                        {bus.busNumber}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{bus.registrationNumber}</div>
                    </div>
                  </div>
                  <span
                    style={{
                      padding: '3px 8px',
                      borderRadius: '8px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      backgroundColor: bus.status === 'ACTIVE' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                      color: bus.status === 'ACTIVE' ? '#10b981' : '#ef4444'
                    }}
                  >
                    {bus.status}
                  </span>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '10px',
                    fontSize: '0.8rem',
                    backgroundColor: 'var(--bg-app)',
                    padding: '12px',
                    borderRadius: 'var(--radius-md)'
                  }}
                >
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Capacity:</span>
                    <div style={{ fontWeight: 700 }}>{bus.capacity} Seats</div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Fuel:</span>
                    <div style={{ fontWeight: 700 }}>{bus.fuelType}</div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>GPS ID:</span>
                    <div style={{ fontWeight: 700 }}>{bus.gpsDeviceId || 'N/A'}</div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Model:</span>
                    <div style={{ fontWeight: 700 }}>{bus.model || 'Standard'}</div>
                  </div>
                </div>

                <div style={{ fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Assigned Driver:</span>
                    <span style={{ fontWeight: 700, color: '#0d9488' }}>{bus.assignedDriverName || 'Not Assigned'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Assigned Route:</span>
                    <span style={{ fontWeight: 600 }}>{bus.assignedRouteName || 'None'}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                  <button
                    onClick={() => handleTrackBusOnMap(bus)}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: '#0d9488',
                      color: '#ffffff',
                      border: 'none',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Track On Map
                  </button>
                  <button
                    onClick={async () => {
                      if (window.confirm(`Delete ${bus.busNumber}?`)) {
                        await transportService.deleteBus(bus.id);
                        showToast('Bus removed', 'success');
                        loadData();
                      }
                    }}
                    style={{
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'transparent',
                      color: '#ef4444',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: DRIVER MANAGEMENT */}
      {currentTab === 'drivers' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ position: 'relative', minWidth: '280px' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search driver by name, license..."
                value={driverSearch}
                onChange={(e) => setDriverSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px 9px 36px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-card)',
                  color: 'var(--text-primary)',
                  fontSize: '0.85rem'
                }}
              />
            </div>
            <button
              onClick={() => setShowAddDriverModal(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '9px 18px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: '#0d9488',
                color: '#ffffff',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
            >
              <Plus size={16} /> Register Driver
            </button>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '20px'
            }}
          >
            {filteredDrivers.map((driver) => (
              <div
                key={driver.id}
                style={{
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px'
                }}
              >
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <img
                    src={driver.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80'}
                    alt={driver.name}
                    style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }}
                  />
                  <div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      {driver.name}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#0d9488', fontWeight: 600 }}>{driver.phone}</div>
                  </div>
                  <span
                    style={{
                      marginLeft: 'auto',
                      padding: '3px 8px',
                      borderRadius: '8px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      backgroundColor: driver.verificationStatus === 'VERIFIED' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(234, 179, 8, 0.15)',
                      color: driver.verificationStatus === 'VERIFIED' ? '#10b981' : '#eab308'
                    }}
                  >
                    {driver.verificationStatus}
                  </span>
                </div>

                <div
                  style={{
                    backgroundColor: 'var(--bg-app)',
                    borderRadius: 'var(--radius-md)',
                    padding: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    fontSize: '0.8rem'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>License No:</span>
                    <span style={{ fontWeight: 700 }}>{driver.licenseNumber}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Expiry Date:</span>
                    <span style={{ fontWeight: 600 }}>{driver.licenseExpiryDate || '2028-12-31'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Experience:</span>
                    <span style={{ fontWeight: 600 }}>{driver.experienceYears} Years</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Assigned Bus:</span>
                    <span style={{ fontWeight: 700, color: '#0d9488' }}>{driver.assignedBusNumber || 'None'}</span>
                  </div>
                </div>

                <div
                  style={{
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'rgba(13, 148, 136, 0.08)',
                    fontSize: '0.78rem',
                    color: '#0d9488',
                    fontWeight: 600
                  }}
                >
                  Login ID: <strong>{driver.email}</strong> • Password: <strong>password</strong>
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                  <button
                    onClick={() => {
                      setAssignmentForm({ driverId: driver.id, busId: buses[0]?.id || '', routeId: routes[0]?.id || '', shift: 'BOTH', notes: '' });
                      setShowAddAssignmentModal(true);
                    }}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--bg-app)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-primary)',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Assign Duty
                  </button>
                  <button
                    onClick={async () => {
                      if (window.confirm(`Delete driver ${driver.name}?`)) {
                        await transportService.deleteDriver(driver.id);
                        showToast('Driver removed', 'success');
                        loadData();
                      }
                    }}
                    style={{
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'transparent',
                      color: '#ef4444',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: ROUTES & STOPS */}
      {currentTab === 'routes' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Configured School Routes ({routes.length})
            </div>
            <button
              onClick={() => setShowAddRouteModal(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '9px 18px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: '#0d9488',
                color: '#ffffff',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
            >
              <Plus size={16} /> Plan New Route
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {routes.map((route) => (
              <div
                key={route.id}
                style={{
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '18px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        style={{
                          backgroundColor: '#0d9488',
                          color: '#ffffff',
                          padding: '2px 8px',
                          borderRadius: '6px',
                          fontSize: '0.72rem',
                          fontWeight: 700
                        }}
                      >
                        {route.routeCode}
                      </span>
                      <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                        {route.routeName}
                      </h3>
                    </div>
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {route.description}
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => {
                        setSelectedRouteForStops(route);
                        setShowManageStopsModal(true);
                      }}
                      style={{
                        padding: '7px 14px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--bg-app)',
                        border: '1px solid var(--border-color)',
                        color: '#0d9488',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      Manage Stops ({route.stops?.length || 0})
                    </button>
                    <button
                      onClick={async () => {
                        if (window.confirm(`Delete route ${route.routeName}?`)) {
                          await transportService.deleteRoute(route.id);
                          showToast('Route deleted', 'success');
                          loadData();
                        }
                      }}
                      style={{
                        padding: '7px 14px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'transparent',
                        color: '#ef4444',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {/* Route Metrics row */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                    gap: '12px',
                    padding: '12px 16px',
                    backgroundColor: 'var(--bg-app)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.82rem'
                  }}
                >
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Total Distance:</span>
                    <div style={{ fontWeight: 800 }}>{route.totalDistanceKm} km</div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Morning Start:</span>
                    <div style={{ fontWeight: 800, color: '#0d9488' }}>{route.morningStartTime}</div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Evening Start:</span>
                    <div style={{ fontWeight: 800, color: '#2563eb' }}>{route.eveningStartTime}</div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Speed Limit:</span>
                    <div style={{ fontWeight: 800 }}>{route.speedLimitKmh} km/h</div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Students:</span>
                    <div style={{ fontWeight: 800 }}>{route.assignedStudentsCount} Assigned</div>
                  </div>
                </div>

                {/* Sequenced Stops visual line */}
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '12px', color: 'var(--text-secondary)' }}>
                    Stop Sequence & Planned Timings
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      overflowX: 'auto',
                      paddingBottom: '8px'
                    }}
                  >
                    {route.stops?.map((stop, sIdx) => (
                      <React.Fragment key={stop.id || sIdx}>
                        <div
                          style={{
                            minWidth: '180px',
                            padding: '10px 14px',
                            backgroundColor: 'var(--bg-app)',
                            border: '1px solid var(--border-color)',
                            borderRadius: 'var(--radius-md)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '4px'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span
                              style={{
                                width: '20px',
                                height: '20px',
                                borderRadius: '50%',
                                backgroundColor: '#0d9488',
                                color: '#ffffff',
                                fontSize: '0.7rem',
                                fontWeight: 800,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              {stop.stopOrder}
                            </span>
                            <span style={{ fontSize: '0.82rem', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {stop.stopName}
                            </span>
                          </div>
                          <div style={{ fontSize: '0.72rem', color: '#0d9488', fontWeight: 600 }}>
                            Pickup: {stop.plannedMorningPickupTime || 'N/A'}
                          </div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                            {stop.assignedStudentsCount || 0} students • {stop.landmark || 'No landmark'}
                          </div>
                        </div>
                        {sIdx < route.stops.length - 1 && (
                          <ArrowRight size={16} color="var(--text-muted)" style={{ flexShrink: 0 }} />
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: ASSIGNMENT MANAGEMENT */}
      {currentTab === 'assignments' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Duty Assignments (Driver + Bus + Route)
              </h3>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Active shifts and student stop mapping
              </p>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setShowAssignStudentModal(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '9px 16px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-app)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                Assign Student
              </button>
              <button
                onClick={() => setShowAddAssignmentModal(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '9px 18px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: '#0d9488',
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                <Plus size={16} /> New Assignment
              </button>
            </div>
          </div>

          {/* Assignments Table */}
          <div
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-lg)',
              padding: '20px',
              overflowX: 'auto'
            }}
          >
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '10px' }}>Driver</th>
                  <th style={{ padding: '10px' }}>Assigned Bus</th>
                  <th style={{ padding: '10px' }}>Route</th>
                  <th style={{ padding: '10px' }}>Shift</th>
                  <th style={{ padding: '10px' }}>Effective Date</th>
                  <th style={{ padding: '10px' }}>Status</th>
                  <th style={{ padding: '10px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {assignments.map((as) => (
                  <tr key={as.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '12px' }}>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{as.driverName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{as.driverPhone}</div>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ fontWeight: 700 }}>{as.busNumber}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{as.registrationNumber}</div>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ fontWeight: 600 }}>{as.routeName}</div>
                      <div style={{ fontSize: '0.75rem', color: '#0d9488' }}>{as.routeCode}</div>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span
                        style={{
                          padding: '2px 8px',
                          borderRadius: '6px',
                          backgroundColor: 'rgba(13, 148, 136, 0.1)',
                          color: '#0d9488',
                          fontWeight: 700,
                          fontSize: '0.75rem'
                        }}
                      >
                        {as.shift}
                      </span>
                    </td>
                    <td style={{ padding: '12px' }}>{as.effectiveStartDate || 'Immediate'}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ color: '#10b981', fontWeight: 700 }}>{as.status}</span>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>
                      <button
                        onClick={async () => {
                          if (window.confirm('Remove this duty assignment?')) {
                            await transportService.deleteAssignment(as.id);
                            showToast('Assignment removed', 'success');
                            loadData();
                          }
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#ef4444',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Student Assignments Table */}
          <div
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-lg)',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Student Stop Assignments ({studentAssignments.length})
              </h4>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '10px' }}>Student</th>
                    <th style={{ padding: '10px' }}>Class</th>
                    <th style={{ padding: '10px' }}>Assigned Route</th>
                    <th style={{ padding: '10px' }}>Pickup Stop & Time</th>
                    <th style={{ padding: '10px' }}>Drop Stop & Time</th>
                    <th style={{ padding: '10px' }}>Guardian Contact</th>
                    <th style={{ padding: '10px' }}>Pickup Status</th>
                  </tr>
                </thead>
                <tbody>
                  {studentAssignments.map((st) => (
                    <tr key={st.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <td style={{ padding: '12px' }}>
                        <div style={{ fontWeight: 700 }}>{st.studentName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{st.admissionNo}</div>
                      </td>
                      <td style={{ padding: '12px' }}>{st.className}</td>
                      <td style={{ padding: '12px' }}>{st.routeName}</td>
                      <td style={{ padding: '12px' }}>
                        <div>{st.pickupStopName}</div>
                        <div style={{ fontSize: '0.75rem', color: '#0d9488' }}>{st.pickupTime}</div>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <div>{st.dropStopName}</div>
                        <div style={{ fontSize: '0.75rem', color: '#2563eb' }}>{st.dropTime}</div>
                      </td>
                      <td style={{ padding: '12px' }}>{st.guardianPhone}</td>
                      <td style={{ padding: '12px' }}>
                        <span
                          style={{
                            padding: '3px 8px',
                            borderRadius: '10px',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            backgroundColor: st.pickupStatus === 'PICKED_UP' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(234, 179, 8, 0.15)',
                            color: st.pickupStatus === 'PICKED_UP' ? '#10b981' : '#eab308'
                          }}
                        >
                          {st.pickupStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: LIVE TRACKING SCREEN */}
      {currentTab === 'live' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Live Tracking Header Toolbar */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: '10px 16px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '9px', height: '9px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block', boxShadow: '0 0 8px #10b981' }} />
                <span style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Live Fleet Radar
                </span>
              </div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                {liveBuses.length} Vehicles • {liveBuses.filter(b => b.tripStatus === 'IN_PROGRESS').length} In Transit • Powered by Google Maps
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {/* Layout Mode Switcher */}
              <div
                style={{
                  display: 'flex',
                  backgroundColor: 'var(--bg-app)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '3px',
                  border: '1px solid var(--border-color)',
                  gap: '2px'
                }}
              >
                <button
                  onClick={() => setLiveViewMode('full')}
                  title="Full Body Canvas with Floating Panels"
                  style={{
                    border: 'none',
                    background: liveViewMode === 'full' ? '#0d9488' : 'transparent',
                    color: liveViewMode === 'full' ? '#ffffff' : 'var(--text-secondary)',
                    padding: '5px 12px',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <Layout size={13} />
                  <span>Full Body Map</span>
                </button>

                <button
                  onClick={() => setLiveViewMode('split')}
                  title="3-Column Split Layout"
                  style={{
                    border: 'none',
                    background: liveViewMode === 'split' ? '#0d9488' : 'transparent',
                    color: liveViewMode === 'split' ? '#ffffff' : 'var(--text-secondary)',
                    padding: '5px 12px',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <Columns size={13} />
                  <span>3-Column Split</span>
                </button>
              </div>

              {liveViewMode === 'full' && (
                <button
                  onClick={() => {
                    const anyOpen = showFleetSidebar || showInspectorSidebar;
                    setShowFleetSidebar(!anyOpen);
                    setShowInspectorSidebar(!anyOpen);
                  }}
                  title="Toggle All Panels"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-app)',
                    color: 'var(--text-secondary)',
                    fontSize: '0.76rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  <Eye size={13} />
                  <span>{(showFleetSidebar || showInspectorSidebar) ? 'Maximize Map' : 'Show Panels'}</span>
                </button>
              )}

              <button
                onClick={() => setIsLiveFullscreen(!isLiveFullscreen)}
                title={isLiveFullscreen ? 'Exit Full Screen' : 'Expand to Viewport Fullscreen'}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  background: isLiveFullscreen ? '#0f172a' : 'var(--bg-app)',
                  color: isLiveFullscreen ? '#38bdf8' : 'var(--text-secondary)',
                  fontSize: '0.76rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                {isLiveFullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
                <span>{isLiveFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}</span>
              </button>
            </div>
          </div>

          {/* MODE 1: FULL BODY MAP CANVAS */}
          {liveViewMode === 'full' ? (
            <div
              style={{
                position: isLiveFullscreen ? 'fixed' : 'relative',
                inset: isLiveFullscreen ? 0 : 'auto',
                zIndex: isLiveFullscreen ? 99999 : 10,
                width: '100%',
                height: isLiveFullscreen ? '100vh' : 'calc(100vh - 230px)',
                minHeight: isLiveFullscreen ? '100vh' : '680px',
                backgroundColor: 'var(--bg-card)',
                borderRadius: isLiveFullscreen ? 0 : 'var(--radius-lg)',
                overflow: 'hidden',
                border: isLiveFullscreen ? 'none' : '1px solid var(--border-color)',
                boxShadow: isLiveFullscreen ? 'none' : 'var(--shadow-md)',
              }}
            >
              {/* Full Body Interactive Google Map */}
              <ErrorBoundary title="Live Fleet Radar Map">
                <TransportLiveMap
                  selectedBus={selectedLiveBus}
                  allBuses={liveBuses}
                  routes={routes}
                  alerts={alerts}
                  onSelectBus={(bus) => {
                    setSelectedLiveBus(bus);
                    setShowInspectorSidebar(true);
                  }}
                  isFullscreen={isLiveFullscreen}
                  onToggleFullscreen={() => setIsLiveFullscreen(!isLiveFullscreen)}
                />
              </ErrorBoundary>

              {/* Floating Overlay Left: Active Fleet List */}
              {showFleetSidebar ? (
                <div
                  style={{
                    position: 'absolute',
                    top: '16px',
                    left: '16px',
                    bottom: '16px',
                    width: '320px',
                    maxWidth: 'calc(100% - 32px)',
                    zIndex: 500,
                    backgroundColor: 'var(--bg-card)',
                    backdropFilter: 'blur(16px)',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--border-color)',
                    boxShadow: '0 12px 36px rgba(0,0,0,0.25)',
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '16px',
                    gap: '12px',
                    overflowY: 'auto',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Bus size={18} color="#0d9488" />
                      <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                        Active Fleet ({liveBuses.length})
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 700 }}>● Live Sync</span>
                      <button
                        onClick={() => setShowFleetSidebar(false)}
                        title="Collapse Fleet Panel"
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: 'var(--text-muted)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '4px',
                          borderRadius: '6px',
                        }}
                      >
                        <ChevronLeft size={18} />
                      </button>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {liveBuses.map((bus) => {
                      const isSelected = selectedLiveBus?.busId === bus.busId;
                      return (
                        <div
                          key={bus.busId}
                          onClick={() => {
                            setSelectedLiveBus(bus);
                            setShowInspectorSidebar(true);
                          }}
                          style={{
                            padding: '14px',
                            borderRadius: 'var(--radius-md)',
                            backgroundColor: isSelected ? 'rgba(13, 148, 136, 0.12)' : 'var(--bg-app)',
                            border: isSelected ? '2px solid #0d9488' : '1px solid var(--border-color)',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px',
                            transition: 'all 0.2s ease',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                              {bus.busNumber}
                            </span>
                            <span
                              style={{
                                fontSize: '0.7rem',
                                fontWeight: 700,
                                padding: '2px 6px',
                                borderRadius: '6px',
                                backgroundColor: bus.tripStatus === 'IN_PROGRESS' ? '#10b981' : '#64748b',
                                color: '#ffffff',
                              }}
                            >
                              {bus.tripStatus}
                            </span>
                          </div>

                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            {bus.routeName} • {bus.driverName}
                          </div>

                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              fontSize: '0.8rem',
                              marginTop: '4px',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700, color: '#0d9488' }}>
                              <Gauge size={14} />
                              {Math.round(bus.currentSpeedKmh)} km/h
                            </div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                              ETA: {bus.nextStopEtaMinutes} mins
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowFleetSidebar(true)}
                  style={{
                    position: 'absolute',
                    top: '16px',
                    left: '16px',
                    zIndex: 500,
                    backgroundColor: '#0d9488',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '30px',
                    padding: '9px 15px',
                    boxShadow: '0 6px 20px rgba(13, 148, 136, 0.4)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                  }}
                >
                  <Bus size={16} />
                  <span>Active Fleet ({liveBuses.length})</span>
                  <ChevronRight size={16} />
                </button>
              )}

              {/* Floating Overlay Right: Trip Inspector */}
              {showInspectorSidebar ? (
                <div
                  style={{
                    position: 'absolute',
                    top: '16px',
                    right: '16px',
                    bottom: '16px',
                    width: '340px',
                    maxWidth: 'calc(100% - 32px)',
                    zIndex: 500,
                    backgroundColor: 'var(--bg-card)',
                    backdropFilter: 'blur(16px)',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--border-color)',
                    boxShadow: '0 12px 36px rgba(0,0,0,0.25)',
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '20px',
                    gap: '16px',
                    overflowY: 'auto',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      Trip Inspector
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: '10px',
                          backgroundColor: 'rgba(16, 185, 129, 0.15)',
                          color: '#10b981',
                        }}
                      >
                        ● GPS ONLINE
                      </span>
                      <button
                        onClick={() => setShowInspectorSidebar(false)}
                        title="Collapse Inspector"
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: 'var(--text-muted)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '4px',
                          borderRadius: '6px',
                        }}
                      >
                        <X size={18} />
                      </button>
                    </div>
                  </div>

                  {selectedLiveBus ? (
                    <>
                      <div
                        style={{
                          backgroundColor: 'var(--bg-app)',
                          borderRadius: 'var(--radius-md)',
                          padding: '14px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '8px',
                          fontSize: '0.82rem',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: 'var(--text-muted)' }}>Bus Reg:</span>
                          <span style={{ fontWeight: 700 }}>{selectedLiveBus.registrationNumber}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: 'var(--text-muted)' }}>Driver Name:</span>
                          <span style={{ fontWeight: 700 }}>{selectedLiveBus.driverName}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: 'var(--text-muted)' }}>Driver Phone:</span>
                          <span style={{ fontWeight: 600, color: '#0d9488' }}>{selectedLiveBus.driverPhone}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: 'var(--text-muted)' }}>Route:</span>
                          <span style={{ fontWeight: 600 }}>{selectedLiveBus.routeName}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: 'var(--text-muted)' }}>Destination:</span>
                          <span style={{ fontWeight: 700, color: '#ef4444' }}>
                            {selectedLiveBus.destinationName || 'School Main Gate'}
                          </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: 'var(--text-muted)' }}>Traveled:</span>
                          <span style={{ fontWeight: 700, color: '#0d9488' }}>
                            {selectedLiveBus.traveledDistanceKm || 7.8} / {selectedLiveBus.totalRouteDistanceKm || 18.5} km
                          </span>
                        </div>
                        <div style={{ marginTop: '4px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', marginBottom: '4px' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Route Completion</span>
                            <span style={{ fontWeight: 700, color: '#0d9488' }}>
                              {Math.round(
                                ((selectedLiveBus.traveledDistanceKm || 7.8) /
                                  (selectedLiveBus.totalRouteDistanceKm || 18.5)) *
                                  100
                              )}
                              %
                            </span>
                          </div>
                          <div
                            style={{
                              height: '6px',
                              borderRadius: '3px',
                              backgroundColor: 'rgba(0,0,0,0.08)',
                              overflow: 'hidden',
                            }}
                          >
                            <div
                              style={{
                                width: `${Math.min(
                                  100,
                                  Math.round(
                                    ((selectedLiveBus.traveledDistanceKm || 7.8) /
                                      (selectedLiveBus.totalRouteDistanceKm || 18.5)) *
                                      100
                                  )
                                )}%`,
                                height: '100%',
                                backgroundColor: '#0d9488',
                                borderRadius: '3px',
                                transition: 'width 0.4s ease',
                              }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Speedometer telemetry card */}
                      <div
                        style={{
                          backgroundColor: 'var(--bg-app)',
                          borderRadius: 'var(--radius-md)',
                          padding: '16px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>TELEMETRY SPEED</div>
                          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0d9488' }}>
                            {Math.round(selectedLiveBus.currentSpeedKmh)} <span style={{ fontSize: '0.9rem' }}>km/h</span>
                          </div>
                        </div>
                        <Gauge size={38} color="#0d9488" />
                      </div>

                      {/* Trip Timeline (Arrival, Departure, Dwell) */}
                      <div>
                        <div
                          style={{
                            fontSize: '0.85rem',
                            fontWeight: 700,
                            marginBottom: '12px',
                            color: 'var(--text-secondary)',
                          }}
                        >
                          Trip Timeline & Dwell Log
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.8rem' }}>
                          <div style={{ display: 'flex', gap: '10px' }}>
                            <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#10b981', marginTop: '4px' }} />
                            <div>
                              <div style={{ fontWeight: 700 }}>Trip Started</div>
                              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>07:15 AM • North City Square</div>
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: '10px' }}>
                            <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#10b981', marginTop: '4px' }} />
                            <div>
                              <div style={{ fontWeight: 700 }}>Stop 1: Metro Pillar 42</div>
                              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Departed • Dwell: 2m 10s • 12 Boarded</div>
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: '10px' }}>
                            <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#06b6d4', marginTop: '4px' }} />
                            <div>
                              <div style={{ fontWeight: 700 }}>Stop 2: Central Mall (Current)</div>
                              <div style={{ fontSize: '0.72rem', color: '#06b6d4', fontWeight: 600 }}>Bus at Stop • Boarding in progress</div>
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: '10px' }}>
                            <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#64748b', marginTop: '4px' }} />
                            <div>
                              <div style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Stop 3: Kankarbagh Park</div>
                              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Scheduled Arrival: 07:45 AM</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleOpenPlayback(selectedLiveBus.tripId || 1)}
                        style={{
                          marginTop: 'auto',
                          padding: '10px 14px',
                          borderRadius: 'var(--radius-md)',
                          backgroundColor: 'rgba(13, 148, 136, 0.1)',
                          color: '#0d9488',
                          border: '1px solid #0d9488',
                          fontWeight: 700,
                          fontSize: '0.82rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                        }}
                      >
                        <Play size={15} /> Open Journey Replay
                      </button>
                    </>
                  ) : (
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Select a bus to inspect</div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setShowInspectorSidebar(true)}
                  style={{
                    position: 'absolute',
                    top: '16px',
                    right: '16px',
                    zIndex: 500,
                    backgroundColor: 'var(--bg-card)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '30px',
                    padding: '9px 15px',
                    boxShadow: '0 6px 20px rgba(0,0,0,0.18)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                  }}
                >
                  <ChevronLeft size={16} />
                  <span>Trip Inspector</span>
                  <Activity size={16} color="#0d9488" />
                </button>
              )}
            </div>
          ) : (
            /* MODE 2: CLASSIC 3-COLUMN SPLIT */
            <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr 340px', gap: '20px', minHeight: '680px' }}>
              {/* Column 1: Fleet Bus List */}
              <div
                style={{
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  overflowY: 'auto',
                  maxHeight: '750px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    Active Fleet ({liveBuses.length})
                  </span>
                  <span style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 700 }}>● Live Sync</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {liveBuses.map((bus) => {
                    const isSelected = selectedLiveBus?.busId === bus.busId;
                    return (
                      <div
                        key={bus.busId}
                        onClick={() => setSelectedLiveBus(bus)}
                        style={{
                          padding: '14px',
                          borderRadius: 'var(--radius-md)',
                          backgroundColor: isSelected ? 'rgba(13, 148, 136, 0.12)' : 'var(--bg-app)',
                          border: isSelected ? '2px solid #0d9488' : '1px solid var(--border-color)',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '8px',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                            {bus.busNumber}
                          </span>
                          <span
                            style={{
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              padding: '2px 6px',
                              borderRadius: '6px',
                              backgroundColor: bus.tripStatus === 'IN_PROGRESS' ? '#10b981' : '#64748b',
                              color: '#ffffff',
                            }}
                          >
                            {bus.tripStatus}
                          </span>
                        </div>

                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          {bus.routeName} • {bus.driverName}
                        </div>

                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            fontSize: '0.8rem',
                            marginTop: '4px',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700, color: '#0d9488' }}>
                            <Gauge size={14} />
                            {Math.round(bus.currentSpeedKmh)} km/h
                          </div>
                          <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                            ETA: {bus.nextStopEtaMinutes} mins
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Column 2: Interactive Real Live Map Canvas */}
              <div
                style={{
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '8px',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  overflow: 'hidden',
                  height: '680px',
                  minHeight: '680px',
                }}
              >
                <ErrorBoundary title="Live Fleet Radar Map">
                  <TransportLiveMap
                    selectedBus={selectedLiveBus}
                    allBuses={liveBuses}
                    routes={routes}
                    alerts={alerts}
                    onSelectBus={(bus) => setSelectedLiveBus(bus)}
                    isFullscreen={isLiveFullscreen}
                    onToggleFullscreen={() => setIsLiveFullscreen(!isLiveFullscreen)}
                  />
                </ErrorBoundary>
              </div>

              {/* Column 3: Detailed Bus & Trip Timeline Inspector */}
              <div
                style={{
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  overflowY: 'auto',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    Trip Inspector
                  </h3>
                  <span
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      padding: '3px 8px',
                      borderRadius: '10px',
                      backgroundColor: 'rgba(16, 185, 129, 0.15)',
                      color: '#10b981',
                    }}
                  >
                    ● GPS ONLINE
                  </span>
                </div>

                {selectedLiveBus ? (
                  <>
                    <div
                      style={{
                        backgroundColor: 'var(--bg-app)',
                        borderRadius: 'var(--radius-md)',
                        padding: '14px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                        fontSize: '0.82rem',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Bus Reg:</span>
                        <span style={{ fontWeight: 700 }}>{selectedLiveBus.registrationNumber}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Driver Name:</span>
                        <span style={{ fontWeight: 700 }}>{selectedLiveBus.driverName}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Driver Phone:</span>
                        <span style={{ fontWeight: 600, color: '#0d9488' }}>{selectedLiveBus.driverPhone}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Route:</span>
                        <span style={{ fontWeight: 600 }}>{selectedLiveBus.routeName}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Destination:</span>
                        <span style={{ fontWeight: 700, color: '#ef4444' }}>
                          {selectedLiveBus.destinationName || 'School Main Gate'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Traveled:</span>
                        <span style={{ fontWeight: 700, color: '#0d9488' }}>
                          {selectedLiveBus.traveledDistanceKm || 7.8} / {selectedLiveBus.totalRouteDistanceKm || 18.5} km
                        </span>
                      </div>
                      <div style={{ marginTop: '4px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', marginBottom: '4px' }}>
                          <span style={{ color: 'var(--text-muted)' }}>Route Completion</span>
                          <span style={{ fontWeight: 700, color: '#0d9488' }}>
                            {Math.round(
                              ((selectedLiveBus.traveledDistanceKm || 7.8) /
                                (selectedLiveBus.totalRouteDistanceKm || 18.5)) *
                                100
                            )}
                            %
                          </span>
                        </div>
                        <div
                          style={{
                            height: '6px',
                            borderRadius: '3px',
                            backgroundColor: 'rgba(0,0,0,0.08)',
                            overflow: 'hidden',
                          }}
                        >
                          <div
                            style={{
                              width: `${Math.min(
                                100,
                                Math.round(
                                  ((selectedLiveBus.traveledDistanceKm || 7.8) /
                                    (selectedLiveBus.totalRouteDistanceKm || 18.5)) *
                                    100
                                )
                              )}%`,
                              height: '100%',
                              backgroundColor: '#0d9488',
                              borderRadius: '3px',
                              transition: 'width 0.4s ease',
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        backgroundColor: 'var(--bg-app)',
                        borderRadius: 'var(--radius-md)',
                        padding: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>TELEMETRY SPEED</div>
                        <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0d9488' }}>
                          {Math.round(selectedLiveBus.currentSpeedKmh)} <span style={{ fontSize: '0.9rem' }}>km/h</span>
                        </div>
                      </div>
                      <Gauge size={38} color="#0d9488" />
                    </div>

                    <div>
                      <div
                        style={{
                          fontSize: '0.85rem',
                          fontWeight: 700,
                          marginBottom: '12px',
                          color: 'var(--text-secondary)',
                        }}
                      >
                        Trip Timeline & Dwell Log
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.8rem' }}>
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#10b981', marginTop: '4px' }} />
                          <div>
                            <div style={{ fontWeight: 700 }}>Trip Started</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>07:15 AM • North City Square</div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#10b981', marginTop: '4px' }} />
                          <div>
                            <div style={{ fontWeight: 700 }}>Stop 1: Metro Pillar 42</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Departed • Dwell: 2m 10s • 12 Boarded</div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#06b6d4', marginTop: '4px' }} />
                          <div>
                            <div style={{ fontWeight: 700 }}>Stop 2: Central Mall (Current)</div>
                            <div style={{ fontSize: '0.72rem', color: '#06b6d4', fontWeight: 600 }}>Bus at Stop • Boarding in progress</div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#64748b', marginTop: '4px' }} />
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Stop 3: Kankarbagh Park</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Scheduled Arrival: 07:45 AM</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleOpenPlayback(selectedLiveBus.tripId || 1)}
                      style={{
                        marginTop: 'auto',
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'rgba(13, 148, 136, 0.1)',
                        color: '#0d9488',
                        border: '1px solid #0d9488',
                        fontWeight: 700,
                        fontSize: '0.82rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                      }}
                    >
                      <Play size={15} /> Open Journey Replay
                    </button>
                  </>
                ) : (
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Select a bus to inspect</div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 7: REPORTS & HISTORICAL PLAYBACK */}
      {currentTab === 'reports' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Driver Duty & Trip Reports
              </h3>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Actual travelled GPS route, dwell logs, speed profile and past journey replay
              </p>
            </div>
          </div>

          <div
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-lg)',
              padding: '20px',
              overflowX: 'auto'
            }}
          >
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '10px' }}>Trip Date</th>
                  <th style={{ padding: '10px' }}>Bus & Reg</th>
                  <th style={{ padding: '10px' }}>Driver</th>
                  <th style={{ padding: '10px' }}>Route & Shift</th>
                  <th style={{ padding: '10px' }}>Duration</th>
                  <th style={{ padding: '10px' }}>Distance</th>
                  <th style={{ padding: '10px' }}>Stops Done</th>
                  <th style={{ padding: '10px' }}>Status</th>
                  <th style={{ padding: '10px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tripsHistory.map((trip) => (
                  <tr key={trip.tripId} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '12px', fontWeight: 600 }}>{trip.tripDate}</td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ fontWeight: 700 }}>{trip.busNumber}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{trip.registrationNumber}</div>
                    </td>
                    <td style={{ padding: '12px' }}>{trip.driverName}</td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ fontWeight: 600 }}>{trip.routeName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{trip.shift} Shift</div>
                    </td>
                    <td style={{ padding: '12px' }}>{trip.durationMinutes || 45} mins</td>
                    <td style={{ padding: '12px', fontWeight: 700 }}>{trip.totalDistanceKm} km</td>
                    <td style={{ padding: '12px' }}>
                      {trip.completedStopsCount} / {trip.totalStopsCount}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span
                        style={{
                          padding: '3px 8px',
                          borderRadius: '8px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          backgroundColor: trip.status === 'COMPLETED' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(6, 182, 212, 0.15)',
                          color: trip.status === 'COMPLETED' ? '#10b981' : '#06b6d4'
                        }}
                      >
                        {trip.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>
                      <button
                        onClick={() => handleOpenPlayback(trip.tripId)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '7px 14px',
                          borderRadius: 'var(--radius-md)',
                          backgroundColor: '#0d9488',
                          color: '#ffffff',
                          border: 'none',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        <Play size={14} /> Replay Journey
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 8: ALERTS CENTER */}
      {currentTab === 'alerts' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Transport Alerts & Safety Exceptions
              </h3>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Deviation alerts, excessive dwell time, offline GPS and breakdowns
              </p>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              {['ALL', 'OPEN', 'ACKNOWLEDGED', 'RESOLVED'].map((f) => (
                <button
                  key={f}
                  onClick={() => setAlertFilter(f)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    backgroundColor: alertFilter === f ? '#0d9488' : 'var(--bg-card)',
                    color: alertFilter === f ? '#ffffff' : 'var(--text-secondary)',
                    fontWeight: alertFilter === f ? 700 : 500,
                    fontSize: '0.8rem',
                    cursor: 'pointer'
                  }}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredAlerts.map((al) => (
              <div
                key={al.id}
                style={{
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      backgroundColor: al.severity === 'CRITICAL' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(234, 179, 8, 0.15)',
                      color: al.severity === 'CRITICAL' ? '#ef4444' : '#eab308',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <AlertTriangle size={20} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)' }}>{al.title}</span>
                      <span
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          padding: '2px 6px',
                          borderRadius: '6px',
                          backgroundColor: al.status === 'OPEN' ? 'rgba(239, 68, 68, 0.15)' : '#10b981',
                          color: al.status === 'OPEN' ? '#ef4444' : '#ffffff'
                        }}
                      >
                        {al.status}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {al.message}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      Vehicle: {al.busNumber || 'Fleet Bus'} • Created: {new Date(al.createdAt).toLocaleTimeString()}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  {al.status === 'OPEN' && (
                    <button
                      onClick={() => setAlertRemarksModal({ alertId: al.id, action: 'ACKNOWLEDGE' })}
                      style={{
                        padding: '7px 14px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--bg-app)',
                        border: '1px solid var(--border-color)',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      Acknowledge
                    </button>
                  )}
                  {al.status !== 'RESOLVED' && (
                    <button
                      onClick={() => setAlertRemarksModal({ alertId: al.id, action: 'RESOLVE' })}
                      style={{
                        padding: '7px 14px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: '#10b981',
                        color: '#ffffff',
                        border: 'none',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      Resolve
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 1: ADD BUS MODAL */}
      {/* ============================================================== */}
      {showAddBusModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--bg-card)',
              borderRadius: 'var(--radius-lg)',
              padding: '24px',
              width: '90%',
              maxWidth: '520px',
              border: '1px solid var(--border-color)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>Add New Vehicle to Fleet</h3>
              <button onClick={() => setShowAddBusModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateBus} style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.85rem' }}>
              <div>
                <label style={{ fontWeight: 600, display: 'block', marginBottom: '4px' }}>Bus Identifier (e.g. Bus 05)</label>
                <input
                  required
                  type="text"
                  value={busForm.busNumber}
                  onChange={(e) => setBusForm({ ...busForm, busNumber: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-app)' }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontWeight: 600, display: 'block', marginBottom: '4px' }}>Registration Plate</label>
                  <input
                    required
                    type="text"
                    placeholder="MH-02-XY-9999"
                    value={busForm.registrationNumber}
                    onChange={(e) => setBusForm({ ...busForm, registrationNumber: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-app)' }}
                  />
                </div>
                <div>
                  <label style={{ fontWeight: 600, display: 'block', marginBottom: '4px' }}>Seating Capacity</label>
                  <input
                    type="number"
                    value={busForm.capacity}
                    onChange={(e) => setBusForm({ ...busForm, capacity: Number(e.target.value) })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-app)' }}
                  />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontWeight: 600, display: 'block', marginBottom: '4px' }}>Fuel Type</label>
                  <select
                    value={busForm.fuelType}
                    onChange={(e) => setBusForm({ ...busForm, fuelType: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-app)' }}
                  >
                    <option value="DIESEL">Diesel</option>
                    <option value="CNG">CNG</option>
                    <option value="ELECTRIC">Electric</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontWeight: 600, display: 'block', marginBottom: '4px' }}>GPS Device IMEI / ID</label>
                  <input
                    type="text"
                    placeholder="GPS-DEV-889"
                    value={busForm.gpsDeviceId}
                    onChange={(e) => setBusForm({ ...busForm, gpsDeviceId: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-app)' }}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddBusModal(false)}
                  style={{ padding: '8px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'none', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 20px', borderRadius: 'var(--radius-md)', backgroundColor: '#0d9488', color: '#ffffff', border: 'none', fontWeight: 700, cursor: 'pointer' }}
                >
                  Save Bus
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 2: ADD DRIVER MODAL (NO OTP: direct ID/pass) */}
      {/* ============================================================== */}
      {showAddDriverModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--bg-card)',
              borderRadius: 'var(--radius-lg)',
              padding: '24px',
              width: '90%',
              maxWidth: '520px',
              border: '1px solid var(--border-color)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>Register Transport Driver</h3>
              <button onClick={() => setShowAddDriverModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateDriver} style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.85rem' }}>
              <div>
                <label style={{ fontWeight: 600, display: 'block', marginBottom: '4px' }}>Full Name</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Ramesh Kumar"
                  value={driverForm.name}
                  onChange={(e) => setDriverForm({ ...driverForm, name: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-app)' }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontWeight: 600, display: 'block', marginBottom: '4px' }}>Login Email / ID</label>
                  <input
                    required
                    type="email"
                    placeholder="driver@school.com"
                    value={driverForm.email}
                    onChange={(e) => setDriverForm({ ...driverForm, email: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-app)' }}
                  />
                </div>
                <div>
                  <label style={{ fontWeight: 600, display: 'block', marginBottom: '4px' }}>Phone Number</label>
                  <input
                    required
                    type="text"
                    placeholder="+91 98765 43210"
                    value={driverForm.phone}
                    onChange={(e) => setDriverForm({ ...driverForm, phone: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-app)' }}
                  />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontWeight: 600, display: 'block', marginBottom: '4px' }}>License Number</label>
                  <input
                    required
                    type="text"
                    placeholder="DL-0420110056789"
                    value={driverForm.licenseNumber}
                    onChange={(e) => setDriverForm({ ...driverForm, licenseNumber: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-app)' }}
                  />
                </div>
                <div>
                  <label style={{ fontWeight: 600, display: 'block', marginBottom: '4px' }}>App Password</label>
                  <input
                    type="password"
                    placeholder="password"
                    value={driverForm.password}
                    onChange={(e) => setDriverForm({ ...driverForm, password: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-app)' }}
                  />
                </div>
              </div>
              <div
                style={{
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'rgba(13, 148, 136, 0.08)',
                  fontSize: '0.78rem',
                  color: '#0d9488'
                }}
              >
                ✓ Driver can directly log in using email/phone and password on the Driver App (No OTP required).
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddDriverModal(false)}
                  style={{ padding: '8px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'none', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 20px', borderRadius: 'var(--radius-md)', backgroundColor: '#0d9488', color: '#ffffff', border: 'none', fontWeight: 700, cursor: 'pointer' }}
                >
                  Register Driver
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 3: JOURNEY REPLAY / PLAYBACK MODAL */}
      {/* ============================================================== */}
      {playbackData && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--bg-card)',
              borderRadius: 'var(--radius-lg)',
              width: '95%',
              maxWidth: '900px',
              border: '1px solid var(--border-color)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              maxHeight: '90vh'
            }}
          >
            {/* Playback Header */}
            <div
              style={{
                padding: '18px 24px',
                borderBottom: '1px solid var(--border-color)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Journey Replay: {playbackData.busNumber} • {playbackData.routeName}
                </h3>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Driver: {playbackData.driverName} • Date: {playbackData.tripDate} • Distance: {playbackData.totalDistanceKm} km
                </div>
              </div>
              <button
                onClick={() => {
                  setPlaybackData(null);
                  setIsPlaybackPlaying(false);
                }}
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <X size={22} />
              </button>
            </div>

            {/* Real Interactive Leaflet Playback Map */}
            <div style={{ padding: '20px 24px' }}>
              <TransportPlaybackMap
                playbackData={playbackData}
                progress={playbackProgress}
                isPlaying={isPlaybackPlaying}
                onTogglePlay={() => setIsPlaybackPlaying(!isPlaybackPlaying)}
                onSeek={(val) => setPlaybackProgress(val)}
                onReset={() => {
                  setPlaybackProgress(0);
                  setIsPlaybackPlaying(true);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 4: ALERT REMARKS MODAL */}
      {/* ============================================================== */}
      {alertRemarksModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--bg-card)',
              borderRadius: 'var(--radius-lg)',
              padding: '24px',
              width: '90%',
              maxWidth: '460px',
              border: '1px solid var(--border-color)'
            }}
          >
            <h3 style={{ margin: '0 0 12px 0', fontSize: '1.1rem', fontWeight: 800 }}>
              {alertRemarksModal.action === 'ACKNOWLEDGE' ? 'Acknowledge Alert' : 'Resolve Alert'}
            </h3>
            <p style={{ margin: '0 0 12px 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Add admin remarks / corrective action notes for safety audit logs:
            </p>
            <textarea
              rows={3}
              placeholder="e.g. Driver contacted; traffic clearance confirmed."
              value={remarksInput}
              onChange={(e) => setRemarksInput(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-app)',
                fontSize: '0.85rem',
                color: 'var(--text-primary)',
                marginBottom: '16px'
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => setAlertRemarksModal(null)}
                style={{ padding: '8px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'none', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={handleAlertAction}
                style={{
                  padding: '8px 20px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: alertRemarksModal.action === 'ACKNOWLEDGE' ? '#0d9488' : '#10b981',
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransportModule;
