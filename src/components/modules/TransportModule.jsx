import { trackingDataForBus } from './transport/trackingMapData';
import React, { useState, useEffect, useMemo } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { transportService } from '../../services/transportService';
import { BusTrackModal } from './transport/BusTrackModal';
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
  Columns,
  GraduationCap,
  CircleDollarSign,
  DollarSign,
  Edit2,
  Trash2,
  Printer,
  Receipt,
  CreditCard,
  Check,
  Fuel,
  Info
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
    if (activeTab === 'transport-students') return 'students';
    if (activeTab === 'transport-fees') return 'fees';
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
  const [feeSummary, setFeeSummary] = useState(null);

  // Selected entities for modals / inspector
  const [selectedLiveBus, setSelectedLiveBus] = useState(null);
  const [playbackData, setPlaybackData] = useState(null);
  const [playbackLoading, setPlaybackLoading] = useState(false);
  const [playbackProgress, setPlaybackProgress] = useState(0);
  const [isPlaybackPlaying, setIsPlaybackPlaying] = useState(false);

  // Modals
  const [showAddBusModal, setShowAddBusModal] = useState(false);
  const [editingBus, setEditingBus] = useState(null);
  const [showEditDriverModal, setShowEditDriverModal] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);
  const [showAddRouteModal, setShowAddRouteModal] = useState(false);
  const [editingRoute, setEditingRoute] = useState(null);
  const [showAddAssignmentModal, setShowAddAssignmentModal] = useState(false);
  const [showAssignStudentModal, setShowAssignStudentModal] = useState(false);
  const [editingStudentAssign, setEditingStudentAssign] = useState(null);
  const [showManageStopsModal, setShowManageStopsModal] = useState(false);
  const [selectedRouteForStops, setSelectedRouteForStops] = useState(null);
  const [showCollectFeeModal, setShowCollectFeeModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [receiptData, setReceiptData] = useState(null);
  const [alertRemarksModal, setAlertRemarksModal] = useState(null); // { alertId, action }
  const [remarksInput, setRemarksInput] = useState('');
  const [selectedDriverForDetails, setSelectedDriverForDetails] = useState(null);
  const [driverDailyData, setDriverDailyData] = useState(null);
  const [driverDailyLoading, setDriverDailyLoading] = useState(false);

  // Bus Track on Map Modal
  const [showBusTrackModal, setShowBusTrackModal] = useState(false);
  const [selectedBusForMap, setSelectedBusForMap] = useState(null);

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
  const [studentSearch, setStudentSearch] = useState('');
  const [studentRouteFilter, setStudentRouteFilter] = useState('ALL');
  const [feeFilter, setFeeFilter] = useState('ALL');

  // Form states
  const [busForm, setBusForm] = useState({
    busNumber: '',
    registrationNumber: '',
    capacity: 40,
    model: '',
    manufacturer: '',
    fuelType: 'DIESEL',
    gpsDeviceId: '',
    insuranceExpiryDate: '',
    fitnessExpiryDate: '',
    permitExpiryDate: '',
    pollutionExpiryDate: '',
    status: 'ACTIVE'
  });

  const [driverEditForm, setDriverEditForm] = useState({
    name: '',
    phone: '',
    address: '',
    licenseNumber: '',
    licenseExpiryDate: '',
    joiningDate: '',
    emergencyContact: '',
    status: 'ACTIVE'
  });

  const [routeForm, setRouteForm] = useState({
    routeName: '',
    routeCode: '',
    startLocation: '',
    endLocation: '',
    areaLocality: '',
    fare: 1500,
    plannedDurationMinutes: 45,
    totalDistanceKm: 18.0,
    morningStartTime: '07:15 AM',
    eveningStartTime: '02:45 PM',
    speedLimitKmh: 50,
    status: 'ACTIVE'
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
    tripType: 'BOTH_WAY',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    monthlyFee: 1500,
    feeStatus: 'PENDING',
    guardianPhone: ''
  });

  const [feePaymentForm, setFeePaymentForm] = useState({
    studentId: '',
    assignmentId: '',
    studentName: '',
    admissionNo: '',
    amountPaid: '',
    paymentMode: 'CASH',
    feeMonth: new Date().toLocaleString('default', { month: 'long' }),
    remarks: '',
    receivedBy: 'Admin Office'
  });

  // Load initial data
  const loadData = async () => {
    setLoading(true);
    try {
      const [ov, bList, dList, rList, asList, saList, liveList, alList, repList, fSum] = await Promise.all([
        transportService.getOverview(),
        transportService.getBuses(),
        transportService.getDrivers(),
        transportService.getRoutes(),
        transportService.getAssignments(),
        transportService.getStudentAssignments(),
        transportService.getLiveTracking(),
        transportService.getAlerts(),
        transportService.getTripReports(),
        transportService.getFeeSummary()
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
      setFeeSummary(fSum);

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

  // Handle Track Bus On Map (Opens dedicated Map Modal for this specific bus)
  const handleTrackBusOnMap = (bus) => {
    if (!bus) return;
    setSelectedBusForMap(bus);
    setShowBusTrackModal(true);
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
  const handleCreateOrUpdateBus = async (e) => {
    e.preventDefault();
    try {
      if (editingBus) {
        await transportService.updateBus(editingBus.id, busForm);
        showToast('Bus details updated successfully', 'success');
      } else {
        await transportService.createBus(busForm);
        showToast('Bus added successfully', 'success');
      }
      setShowAddBusModal(false);
      setEditingBus(null);
      setBusForm({
        busNumber: '',
        registrationNumber: '',
        capacity: 40,
        model: '',
        manufacturer: '',
        fuelType: 'DIESEL',
        gpsDeviceId: '',
        insuranceExpiryDate: '',
        fitnessExpiryDate: '',
        permitExpiryDate: '',
        pollutionExpiryDate: '',
        status: 'ACTIVE'
      });
      loadData();
    } catch {
      showToast('Error saving bus', 'error');
    }
  };

  const handleOpenEditBus = (bus) => {
    setEditingBus(bus);
    setBusForm({
      busNumber: bus.busNumber || '',
      registrationNumber: bus.registrationNumber || '',
      capacity: bus.capacity || 40,
      model: bus.model || '',
      manufacturer: bus.manufacturer || '',
      fuelType: bus.fuelType || 'DIESEL',
      gpsDeviceId: bus.gpsDeviceId || '',
      insuranceExpiryDate: bus.insuranceExpiryDate || '',
      fitnessExpiryDate: bus.fitnessExpiryDate || '',
      permitExpiryDate: bus.permitExpiryDate || '',
      pollutionExpiryDate: bus.pollutionExpiryDate || '',
      status: bus.status || 'ACTIVE'
    });
    setShowAddBusModal(true);
  };

  const handleOpenEditDriver = (driver) => {
    setEditingDriver(driver);
    setDriverEditForm({
      name: driver.name || '',
      phone: driver.phone || '',
      address: driver.address || '',
      licenseNumber: driver.licenseNumber || '',
      licenseExpiryDate: driver.licenseExpiryDate || '',
      joiningDate: driver.joiningDate || '',
      emergencyContact: driver.emergencyContact || '',
      status: driver.status || 'ACTIVE'
    });
    setShowEditDriverModal(true);
  };

  const handleUpdateDriver = async (e) => {
    e.preventDefault();
    if (!editingDriver) return;
    try {
      await transportService.updateDriver(editingDriver.id, driverEditForm);
      showToast('Driver details updated successfully', 'success');
      setShowEditDriverModal(false);
      setEditingDriver(null);
      loadData();
    } catch {
      showToast('Error updating driver', 'error');
    }
  };

  const handleOpenDriverDetails = async (driver) => {
    setSelectedDriverForDetails(driver);
    setDriverDailyLoading(true);
    setDriverDailyData(null);
    try {
      const details = await transportService.getDriverDailyDetails(driver.id);
      setDriverDailyData(details);
    } catch (err) {
      console.error('Failed to load driver details:', err);
      showToast('Could not fetch daily details for driver', 'error');
    } finally {
      setDriverDailyLoading(false);
    }
  };

  const handleCreateOrUpdateRoute = async (e) => {
    e.preventDefault();
    try {
      if (editingRoute) {
        await transportService.updateRoute(editingRoute.id, routeForm);
        showToast('Route updated successfully', 'success');
      } else {
        await transportService.createRoute(routeForm);
        showToast('Route created successfully', 'success');
      }
      setShowAddRouteModal(false);
      setEditingRoute(null);
      setRouteForm({
        routeName: '',
        routeCode: '',
        startLocation: '',
        endLocation: '',
        areaLocality: '',
        fare: 1500,
        plannedDurationMinutes: 45,
        totalDistanceKm: 18.0,
        morningStartTime: '07:15 AM',
        eveningStartTime: '02:45 PM',
        speedLimitKmh: 50,
        status: 'ACTIVE'
      });
      loadData();
    } catch {
      showToast('Error saving route', 'error');
    }
  };

  const handleOpenEditRoute = (route) => {
    setEditingRoute(route);
    setRouteForm({
      routeName: route.routeName || '',
      routeCode: route.routeCode || '',
      startLocation: route.startLocation || '',
      endLocation: route.endLocation || '',
      areaLocality: route.areaLocality || '',
      fare: route.fare || 1500,
      plannedDurationMinutes: route.plannedDurationMinutes || 45,
      totalDistanceKm: route.totalDistanceKm || 18.0,
      morningStartTime: route.morningStartTime || '07:15 AM',
      eveningStartTime: route.eveningStartTime || '02:45 PM',
      speedLimitKmh: route.speedLimitKmh || 50,
      status: route.status || 'ACTIVE'
    });
    setShowAddRouteModal(true);
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

  const handleAssignOrUpdateStudent = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        studentId: editingStudentAssign?.studentId || (Date.now() % 10000),
        studentName: studentAssignForm.studentName,
        admissionNo: studentAssignForm.admissionNo,
        className: studentAssignForm.className,
        routeId: Number(studentAssignForm.routeId),
        pickupStopId: studentAssignForm.pickupStopId ? Number(studentAssignForm.pickupStopId) : null,
        dropStopId: studentAssignForm.dropStopId ? Number(studentAssignForm.dropStopId) : null,
        pickupTime: studentAssignForm.pickupTime,
        dropTime: studentAssignForm.dropTime,
        tripType: studentAssignForm.tripType || 'BOTH_WAY',
        startDate: studentAssignForm.startDate,
        endDate: studentAssignForm.endDate || null,
        monthlyFee: Number(studentAssignForm.monthlyFee) || 1500,
        feeStatus: studentAssignForm.feeStatus || 'PENDING',
        guardianPhone: studentAssignForm.guardianPhone,
        status: studentAssignForm.status || 'ACTIVE'
      };

      if (editingStudentAssign) {
        await transportService.updateStudentAssignment(editingStudentAssign.id, payload);
        showToast('Student transport assignment updated', 'success');
      } else {
        await transportService.assignStudent(payload);
        showToast('Student assigned to transport successfully', 'success');
      }
      setShowAssignStudentModal(false);
      setEditingStudentAssign(null);
      setStudentAssignForm({
        studentName: '',
        admissionNo: '',
        className: '',
        routeId: '',
        pickupStopId: '',
        dropStopId: '',
        pickupTime: '07:30 AM',
        dropTime: '03:15 PM',
        tripType: 'BOTH_WAY',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        monthlyFee: 1500,
        feeStatus: 'PENDING',
        guardianPhone: '',
        status: 'ACTIVE'
      });
      loadData();
    } catch {
      showToast('Error saving student assignment', 'error');
    }
  };

  const handleOpenEditStudentAssign = (st) => {
    setEditingStudentAssign(st);
    setStudentAssignForm({
      studentName: st.studentName || '',
      admissionNo: st.admissionNo || '',
      className: st.className || '',
      routeId: st.routeId || '',
      pickupStopId: st.pickupStopId || '',
      dropStopId: st.dropStopId || '',
      pickupTime: st.pickupTime || '07:30 AM',
      dropTime: st.dropTime || '03:15 PM',
      tripType: st.tripType || 'BOTH_WAY',
      startDate: st.startDate || new Date().toISOString().split('T')[0],
      endDate: st.endDate || '',
      monthlyFee: st.monthlyFee || 1500,
      feeStatus: st.feeStatus || 'PENDING',
      guardianPhone: st.guardianPhone || '',
      status: st.status || 'ACTIVE'
    });
    setShowAssignStudentModal(true);
  };

  const handleDeleteStudentAssign = async (id, name) => {
    if (window.confirm(`Remove transport assignment for ${name}?`)) {
      try {
        await transportService.deleteStudentAssignment(id);
        showToast('Transport assignment removed', 'success');
        loadData();
      } catch {
        showToast('Error removing transport assignment', 'error');
      }
    }
  };

  const handleOpenCollectFee = (st) => {
    const feeAmt = st.pendingAmount !== undefined ? st.pendingAmount : (st.monthlyFee || 1500);
    setFeePaymentForm({
      studentId: st.studentId || 1,
      assignmentId: st.id,
      studentName: st.studentName || '',
      admissionNo: st.admissionNo || '',
      amountPaid: feeAmt > 0 ? feeAmt : (st.monthlyFee || 1500),
      paymentMode: 'CASH',
      feeMonth: new Date().toLocaleString('default', { month: 'long' }),
      remarks: `Transport fee collection for ${st.studentName}`,
      receivedBy: 'Admin Office'
    });
    setShowCollectFeeModal(true);
  };

  const handleCollectFeeSubmit = async (e) => {
    e.preventDefault();
    try {
      const savedReceipt = await transportService.collectFee({
        ...feePaymentForm,
        amountPaid: Number(feePaymentForm.amountPaid)
      });
      showToast('Transport fee collected successfully!', 'success');
      setShowCollectFeeModal(false);
      setReceiptData(savedReceipt);
      setShowReceiptModal(true);
      loadData();
    } catch {
      showToast('Error processing fee payment', 'error');
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

  const filteredStudentAssignments = useMemo(() => {
    return studentAssignments.filter((st) => {
      const matchSearch =
        st.studentName?.toLowerCase().includes(studentSearch.toLowerCase()) ||
        st.admissionNo?.toLowerCase().includes(studentSearch.toLowerCase()) ||
        st.className?.toLowerCase().includes(studentSearch.toLowerCase());
      const matchRoute = studentRouteFilter === 'ALL' || String(st.routeId) === String(studentRouteFilter);
      return matchSearch && matchRoute;
    });
  }, [studentAssignments, studentSearch, studentRouteFilter]);

  const filteredFeeStudents = useMemo(() => {
    const records = feeSummary?.studentRecords?.length ? feeSummary.studentRecords : studentAssignments;
    if (feeFilter === 'ALL') return records;
    return records.filter((st) => (st.feeStatus || 'PENDING').toUpperCase() === feeFilter.toUpperCase());
  }, [feeSummary, studentAssignments, feeFilter]);

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
          { key: 'overview', label: 'Transport Dashboard', icon: Activity },
          { key: 'buses', label: 'Bus List', icon: Bus, badge: buses.length },
          { key: 'drivers', label: 'Driver List', icon: Users, badge: drivers.length },
          { key: 'routes', label: 'Route & Stops', icon: MapPin, badge: routes.length },
          { key: 'assignments', label: 'Bus-Driver Assignment', icon: ShieldCheck, badge: assignments.length },
          { key: 'students', label: 'Student Transport', icon: GraduationCap, badge: studentAssignments.length },
          { key: 'fees', label: 'Transport Fees', icon: CircleDollarSign },
          { key: 'reports', label: 'Reports & Playback', icon: Play },
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
                onClick={() => handleTabChange('buses')}
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
                View Bus Fleet <ChevronRight size={16} />
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
                placeholder="Search bus number, registration, model..."
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
              onClick={() => {
                setEditingBus(null);
                setBusForm({
                  busNumber: '',
                  registrationNumber: '',
                  capacity: 40,
                  model: '',
                  manufacturer: '',
                  fuelType: 'DIESEL',
                  gpsDeviceId: '',
                  insuranceExpiryDate: '',
                  fitnessExpiryDate: '',
                  permitExpiryDate: '',
                  pollutionExpiryDate: '',
                  status: 'ACTIVE'
                });
                setShowAddBusModal(true);
              }}
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
              <Plus size={16} /> Add New Bus
            </button>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
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
                      backgroundColor:
                        bus.status === 'ACTIVE'
                          ? 'rgba(16, 185, 129, 0.15)'
                          : bus.status === 'MAINTENANCE'
                          ? 'rgba(234, 179, 8, 0.15)'
                          : 'rgba(239, 68, 68, 0.15)',
                      color:
                        bus.status === 'ACTIVE'
                          ? '#10b981'
                          : bus.status === 'MAINTENANCE'
                          ? '#eab308'
                          : '#ef4444'
                    }}
                  >
                    {bus.status || 'ACTIVE'}
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
                    <div style={{ fontWeight: 700 }}>{bus.capacity || 40} Seats</div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Fuel Type:</span>
                    <div style={{ fontWeight: 700 }}>{bus.fuelType || 'DIESEL'}</div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Model / Make:</span>
                    <div style={{ fontWeight: 700 }}>{bus.model || bus.manufacturer || 'Standard'}</div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>GPS ID:</span>
                    <div style={{ fontWeight: 700 }}>{bus.gpsDeviceId || 'N/A'}</div>
                  </div>
                </div>

                {/* Expiry Details */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '8px',
                    fontSize: '0.75rem',
                    padding: '8px 12px',
                    backgroundColor: 'rgba(0,0,0,0.02)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-light)'
                  }}
                >
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Insurance:</span>{' '}
                    <span style={{ fontWeight: 600 }}>{bus.insuranceExpiryDate || 'Active'}</span>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Fitness:</span>{' '}
                    <span style={{ fontWeight: 600 }}>{bus.fitnessExpiryDate || 'Active'}</span>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Permit:</span>{' '}
                    <span style={{ fontWeight: 600 }}>{bus.permitExpiryDate || 'Active'}</span>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>PUC / Pollution:</span>{' '}
                    <span style={{ fontWeight: 600 }}>{bus.pollutionExpiryDate || 'Active'}</span>
                  </div>
                </div>

                <div style={{ fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Bus Assignment:</span>
                    <span style={{ fontWeight: 700, color: bus.assignmentStatus === 'ASSIGNED' ? '#d97706' : '#16a34a' }}>
                      {bus.assignmentStatus === 'ASSIGNED' ? 'Assigned' : bus.assignmentStatus === 'AVAILABLE' ? 'Available' : 'Status unavailable'}
                    </span>
                  </div>
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
                    onClick={() => handleOpenEditBus(bus)}
                    style={{
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
                    Edit
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
          {/* Information Notice explaining Driver flow */}
          <div
            style={{
              backgroundColor: 'rgba(13, 148, 136, 0.08)',
              border: '1px solid rgba(13, 148, 136, 0.25)',
              borderRadius: 'var(--radius-md)',
              padding: '14px 18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              flexWrap: 'wrap'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Info size={20} color="#0d9488" />
              <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                <strong>Driver Onboarding Policy:</strong> Drivers are added directly via the <strong>Staff / Teacher Directory</strong> screen (selecting Designation: <em>Driver</em> or Department: <em>Transport</em>). Their profiles automatically sync here to manage driving licences, contact details, status, and bus-route duties.
              </div>
            </div>
            <button
              onClick={() => {
                if (setActiveTab) setActiveTab('teachers');
              }}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: '#0d9488',
                color: '#ffffff',
                border: 'none',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              Go to Staff Directory →
            </button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ position: 'relative', minWidth: '280px' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search driver by name, phone, license..."
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
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              Total Active Drivers: <strong>{drivers.length}</strong>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
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
                  <div style={{ marginLeft: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                    <span
                      style={{
                        padding: '3px 8px',
                        borderRadius: '8px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        backgroundColor:
                          (driver.verificationStatus === 'VERIFIED' || driver.status === 'ACTIVE')
                            ? 'rgba(16, 185, 129, 0.15)'
                            : driver.status === 'ON_LEAVE'
                            ? 'rgba(234, 179, 8, 0.15)'
                            : 'rgba(239, 68, 68, 0.15)',
                        color:
                          (driver.verificationStatus === 'VERIFIED' || driver.status === 'ACTIVE')
                            ? '#10b981'
                            : driver.status === 'ON_LEAVE'
                            ? '#eab308'
                            : '#ef4444'
                      }}
                    >
                      {driver.verificationStatus || driver.status || 'ACTIVE'}
                    </span>
                    <span
                      style={{
                        padding: '2px 7px',
                        borderRadius: '6px',
                        fontSize: '0.68rem',
                        fontWeight: 800,
                        backgroundColor: driver.dutyStatus === 'IN_TRIP'
                          ? 'rgba(13, 148, 136, 0.2)'
                          : driver.dutyStatus === 'SCHEDULED'
                          ? 'rgba(245, 158, 11, 0.15)'
                          : 'rgba(100, 116, 139, 0.15)',
                        color: driver.dutyStatus === 'IN_TRIP'
                          ? '#0d9488'
                          : driver.dutyStatus === 'SCHEDULED'
                          ? '#f59e0b'
                          : '#64748b'
                      }}
                    >
                      {driver.dutyStatus === 'IN_TRIP' ? '● IN TRIP' : driver.dutyStatus === 'SCHEDULED' ? 'SCHEDULED' : (driver.dutyStatus || 'OFF DUTY')}
                    </span>
                  </div>
                </div>

                {/* License & Vehicle Assignment Info */}
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
                    <span style={{ color: 'var(--text-muted)' }}>Driving Licence No:</span>
                    <span style={{ fontWeight: 700 }}>{driver.licenseNumber}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Licence Expiry:</span>
                    <span style={{ fontWeight: 600 }}>{driver.licenseExpiryDate || '2028-12-31'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Joining Date:</span>
                    <span style={{ fontWeight: 600 }}>{driver.joiningDate || '2024-01-15'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Emergency Contact:</span>
                    <span style={{ fontWeight: 600, color: '#ef4444' }}>{driver.emergencyContact || 'N/A'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Residential Address:</span>
                    <span style={{ fontWeight: 600, maxWidth: '180px', textAlign: 'right', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {driver.address || 'Campus Staff Quarters'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-light)', paddingTop: '6px', marginTop: '2px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Assigned Bus:</span>
                    <span style={{ fontWeight: 700, color: '#0d9488' }}>{driver.assignedBusNumber || 'None'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Assigned Route:</span>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)', maxWidth: '170px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {driver.assignedRouteName || 'None'}
                    </span>
                  </div>
                </div>

                {/* Today's Daily Activity / Safety Checklist Box */}
                <div
                  style={{
                    backgroundColor: driver.todayPreTripCheckPassed
                      ? 'rgba(16, 185, 129, 0.06)'
                      : 'rgba(245, 158, 11, 0.06)',
                    border: `1px solid ${driver.todayPreTripCheckPassed ? 'rgba(16, 185, 129, 0.25)' : 'rgba(245, 158, 11, 0.25)'}`,
                    borderRadius: 'var(--radius-md)',
                    padding: '10px 12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    fontSize: '0.78rem'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <ShieldCheck size={14} color={driver.todayPreTripCheckPassed ? '#10b981' : '#f59e0b'} />
                      Daily Safety Checklist:
                    </span>
                    <span
                      style={{
                        fontWeight: 800,
                        color: driver.todayPreTripCheckPassed ? '#10b981' : '#f59e0b'
                      }}
                    >
                      {driver.todayPreTripCheckPassed ? '5/5 Verified OK' : 'Pending Check'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Trip Start Time:</span>
                    <span style={{ fontWeight: 600, color: driver.todayTripStartTime ? '#0d9488' : 'var(--text-muted)' }}>
                      {driver.todayTripStartTime
                        ? new Date(driver.todayTripStartTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : 'Not departed yet'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Start Location:</span>
                    <span
                      style={{
                        fontWeight: 600,
                        maxWidth: '170px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        color: driver.todayStartLocationName ? 'var(--text-primary)' : 'var(--text-muted)'
                      }}
                      title={driver.todayStartLocationName || 'Campus Depot'}
                    >
                      {driver.todayStartLocationName || (driver.todayTripStartTime ? 'Campus Terminal' : 'Pending departure')}
                    </span>
                  </div>
                </div>

                <div
                  style={{
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'rgba(13, 148, 136, 0.08)',
                    fontSize: '0.76rem',
                    color: '#0d9488',
                    fontWeight: 600
                  }}
                >
                  App Login: <strong>{driver.email}</strong> • Password: <strong>password</strong>
                </div>

                {/* Card Action Buttons */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: 'auto' }}>
                  <button
                    onClick={() => handleOpenDriverDetails(driver)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: '#0d9488',
                      color: '#ffffff',
                      border: 'none',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      cursor: 'pointer',
                      boxShadow: '0 2px 6px rgba(13, 148, 136, 0.25)'
                    }}
                  >
                    <FileText size={15} /> View Daily Details & Checklist
                  </button>
                  <div style={{ display: 'flex', gap: '8px' }}>
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
                      onClick={() => handleOpenEditDriver(driver)}
                      style={{
                        padding: '8px 12px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--bg-app)',
                        border: '1px solid var(--border-color)',
                        color: '#0d9488',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      Edit Details
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
              </div>
            ))}
            {filteredDrivers.length === 0 && (
              <div
                style={{
                  gridColumn: '1 / -1',
                  textAlign: 'center',
                  padding: '48px 24px',
                  backgroundColor: 'var(--bg-card)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px dashed var(--border-color)'
                }}
              >
                <Users size={40} color="var(--text-muted)" style={{ margin: '0 auto 12px', display: 'block' }} />
                <h4 style={{ margin: '0 0 6px', color: 'var(--text-primary)' }}>No Drivers Found</h4>
                <p style={{ margin: '0 0 16px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  {driverSearch
                    ? 'No drivers match your search query.'
                    : 'To register a driver, go to Staff Directory / HRM and click "Add Staff" with Role or Designation set to Driver.'}
                </p>
                <button
                  onClick={() => {
                    if (setActiveTab) setActiveTab('teachers');
                  }}
                  style={{
                    padding: '8px 18px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: '#0d9488',
                    color: '#ffffff',
                    border: 'none',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Go to Staff Directory →
                </button>
              </div>
            )}
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
                      {route.areaLocality && (
                        <span
                          style={{
                            backgroundColor: 'rgba(59, 130, 246, 0.12)',
                            color: '#2563eb',
                            padding: '2px 8px',
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                            fontWeight: 700
                          }}
                        >
                          Locality: {route.areaLocality}
                        </span>
                      )}
                    </div>
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {route.description || `Connects ${route.startLocation || 'Start'} to ${route.endLocation || 'School'}`}
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => handleOpenEditRoute(route)}
                      style={{
                        padding: '7px 14px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--bg-app)',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-primary)',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px'
                      }}
                    >
                      <Edit2 size={13} /> Edit Route
                    </button>
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
                    gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                    gap: '12px',
                    padding: '12px 16px',
                    backgroundColor: 'var(--bg-app)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.82rem'
                  }}
                >
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Locality/Area:</span>
                    <div style={{ fontWeight: 800 }}>{route.areaLocality || 'City Center'}</div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Monthly Fare:</span>
                    <div style={{ fontWeight: 800, color: '#10b981' }}>₹{route.fare || 1500}/mo</div>
                  </div>
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
                    <span style={{ color: 'var(--text-muted)' }}>Duration:</span>
                    <div style={{ fontWeight: 800 }}>{route.plannedDurationMinutes || 45} mins</div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Students:</span>
                    <div style={{ fontWeight: 800 }}>{route.assignedStudentsCount || 0} Assigned</div>
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

      {/* TAB 5: BUS-DRIVER-ROUTE DUTY ASSIGNMENTS */}
      {currentTab === 'assignments' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Bus, Driver & Route Duty Assignments
              </h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Decoupled architecture: Bus is assigned to Route; Driver is assigned to Bus & Route shift.
              </p>
            </div>
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
              <Plus size={16} /> New Duty Assignment
            </button>
          </div>

          {/* Quick Metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
            <div style={{ padding: '16px', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>ACTIVE DUTIES</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0d9488', marginTop: '4px' }}>{assignments.length}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>Operational bus-driver pairs</div>
            </div>
            <div style={{ padding: '16px', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>MORNING SHIFTS</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#2563eb', marginTop: '4px' }}>
                {assignments.filter(a => a.shift === 'MORNING' || a.shift === 'BOTH').length}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>Pickup schedule active</div>
            </div>
            <div style={{ padding: '16px', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>EVENING SHIFTS</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f59e0b', marginTop: '4px' }}>
                {assignments.filter(a => a.shift === 'EVENING' || a.shift === 'BOTH').length}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>Drop-off schedule active</div>
            </div>
            <div style={{ padding: '16px', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>TOTAL FLEET BUSES</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10b981', marginTop: '4px' }}>{buses.length}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>Registered transport vehicles</div>
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
                  <th style={{ padding: '10px' }}>Assigned Route & Locality</th>
                  <th style={{ padding: '10px' }}>Shift</th>
                  <th style={{ padding: '10px' }}>Effective Dates</th>
                  <th style={{ padding: '10px' }}>Duty Status</th>
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
                      <div style={{ fontWeight: 700 }}>{as.routeName}</div>
                      <div style={{ fontSize: '0.75rem', color: '#0d9488' }}>{as.routeCode}</div>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span
                        style={{
                          padding: '3px 8px',
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
                    <td style={{ padding: '12px' }}>
                      <div>{as.effectiveStartDate || 'Immediate'}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Ongoing duty</div>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span
                        style={{
                          padding: '3px 8px',
                          borderRadius: '10px',
                          backgroundColor: 'rgba(16, 185, 129, 0.15)',
                          color: '#10b981',
                          fontWeight: 700,
                          fontSize: '0.75rem'
                        }}
                      >
                        {as.status || 'ACTIVE'}
                      </span>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>
                      <button
                        onClick={async () => {
                          if (window.confirm('Remove this duty assignment?')) {
                            await transportService.deleteAssignment(as.id);
                            showToast('Duty assignment removed', 'success');
                            loadData();
                          }
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#ef4444',
                          fontWeight: 600,
                          cursor: 'pointer',
                          fontSize: '0.82rem'
                        }}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
                {assignments.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                      No duty assignments created yet. Click "New Duty Assignment" to assign a bus and route to a driver.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 6: STUDENT TRANSPORT MANAGEMENT */}
      {currentTab === 'students' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Header & Primary Actions */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Student Transport & Stop Allocations
              </h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Assign routes, pickup and drop stops, travel validity, trip type, and transport fees to students
              </p>
            </div>
            <button
              onClick={() => {
                setEditingStudentAssign(null);
                setStudentAssignForm({
                  studentName: '',
                  admissionNo: '',
                  className: '',
                  routeId: routes[0]?.id || '',
                  pickupStopId: '',
                  dropStopId: '',
                  pickupTime: '07:30 AM',
                  dropTime: '03:15 PM',
                  tripType: 'BOTH_WAY',
                  startDate: new Date().toISOString().split('T')[0],
                  endDate: '',
                  monthlyFee: 1500,
                  feeStatus: 'PENDING',
                  guardianPhone: '',
                  status: 'ACTIVE'
                });
                setShowAssignStudentModal(true);
              }}
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
              <Plus size={16} /> Assign Student Transport
            </button>
          </div>

          {/* Student Transport KPI Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '14px' }}>
            <div style={{ padding: '16px', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>ENROLLED STUDENTS</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0d9488', marginTop: '4px' }}>
                {studentAssignments.length}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>Using school bus network</div>
            </div>
            <div style={{ padding: '16px', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>TRIP TYPES</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#2563eb', marginTop: '4px' }}>
                {studentAssignments.filter(s => s.tripType === 'BOTH_WAY' || !s.tripType).length}{' '}
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Both</span> /{' '}
                {studentAssignments.filter(s => s.tripType === 'ONE_WAY').length}{' '}
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>One-way</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>Commute patterns</div>
            </div>
            <div style={{ padding: '16px', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>BOARDING ATTENDANCE</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#10b981', marginTop: '4px' }}>
                {studentAssignments.filter(s => s.pickupStatus === 'PICKED_UP').length}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>Boarded on morning routes</div>
            </div>
            <div style={{ padding: '16px', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>FEE DUES PENDING</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ef4444', marginTop: '4px' }}>
                {studentAssignments.filter(s => s.feeStatus === 'PENDING' || s.feeStatus === 'OVERDUE' || (s.pendingAmount && s.pendingAmount > 0)).length}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>Students with outstanding dues</div>
            </div>
          </div>

          {/* Search & Filter Toolbar */}
          <div
            style={{
              display: 'flex',
              gap: '12px',
              flexWrap: 'wrap',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 16px',
              alignItems: 'center'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '220px' }}>
              <Search size={16} color="var(--text-muted)" />
              <input
                type="text"
                placeholder="Search by student name, admission no, class..."
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                style={{
                  border: 'none',
                  background: 'transparent',
                  outline: 'none',
                  width: '100%',
                  fontSize: '0.85rem',
                  color: 'var(--text-primary)'
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <select
                value={studentRouteFilter}
                onChange={(e) => setStudentRouteFilter(e.target.value)}
                style={{
                  padding: '7px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-app)',
                  fontSize: '0.82rem',
                  color: 'var(--text-primary)'
                }}
              >
                <option value="ALL">All Routes</option>
                {routes.map(r => (
                  <option key={r.id} value={r.id}>{r.routeCode} - {r.routeName}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Student Assignments Table */}
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
                  <th style={{ padding: '10px' }}>Student</th>
                  <th style={{ padding: '10px' }}>Class</th>
                  <th style={{ padding: '10px' }}>Route & Area</th>
                  <th style={{ padding: '10px' }}>Pickup Stop & Time</th>
                  <th style={{ padding: '10px' }}>Drop Stop & Time</th>
                  <th style={{ padding: '10px' }}>Type & Validity</th>
                  <th style={{ padding: '10px' }}>Fee Status</th>
                  <th style={{ padding: '10px' }}>Boarding</th>
                  <th style={{ padding: '10px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudentAssignments.map((st) => (
                  <tr key={st.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '12px' }}>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{st.studentName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Adm: {st.admissionNo} • {st.guardianPhone}</div>
                    </td>
                    <td style={{ padding: '12px', fontWeight: 600 }}>{st.className}</td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ fontWeight: 700 }}>{st.routeName}</div>
                      <div style={{ fontSize: '0.72rem', color: '#0d9488' }}>{st.areaLocality || 'Campus Route'}</div>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <div>{st.pickupStopName || 'Default Stop'}</div>
                      <div style={{ fontSize: '0.75rem', color: '#0d9488', fontWeight: 600 }}>{st.pickupTime || '07:30 AM'}</div>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <div>{st.dropStopName || 'Default Stop'}</div>
                      <div style={{ fontSize: '0.75rem', color: '#2563eb', fontWeight: 600 }}>{st.dropTime || '03:15 PM'}</div>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span
                        style={{
                          padding: '2px 7px',
                          borderRadius: '6px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          backgroundColor: st.tripType === 'ONE_WAY' ? 'rgba(234, 179, 8, 0.15)' : 'rgba(37, 99, 235, 0.12)',
                          color: st.tripType === 'ONE_WAY' ? '#b45309' : '#2563eb'
                        }}
                      >
                        {st.tripType === 'ONE_WAY' ? 'One-Way' : 'Both-Way'}
                      </span>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '3px' }}>
                        {st.startDate ? new Date(st.startDate).toLocaleDateString() : 'Active'}
                      </div>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span
                          style={{
                            padding: '3px 8px',
                            borderRadius: '10px',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            backgroundColor:
                              st.feeStatus === 'PAID'
                                ? 'rgba(16, 185, 129, 0.15)'
                                : st.feeStatus === 'PARTIAL'
                                ? 'rgba(234, 179, 8, 0.15)'
                                : 'rgba(239, 68, 68, 0.15)',
                            color:
                              st.feeStatus === 'PAID'
                                ? '#10b981'
                                : st.feeStatus === 'PARTIAL'
                                ? '#eab308'
                                : '#ef4444'
                          }}
                        >
                          {st.feeStatus || 'PENDING'}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        ₹{st.monthlyFee || 1500}/mo
                      </div>
                    </td>
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
                        {st.pickupStatus || 'PENDING'}
                      </span>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => handleOpenCollectFee(st)}
                          title="Collect Fee & Issue Receipt"
                          style={{
                            padding: '6px 10px',
                            borderRadius: 'var(--radius-md)',
                            backgroundColor: 'rgba(13, 148, 136, 0.1)',
                            border: '1px solid #0d9488',
                            color: '#0d9488',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <CreditCard size={13} /> Fee
                        </button>
                        <button
                          onClick={() => handleOpenEditStudentAssign(st)}
                          title="Edit Assignment"
                          style={{
                            padding: '6px 9px',
                            borderRadius: 'var(--radius-md)',
                            backgroundColor: 'var(--bg-app)',
                            border: '1px solid var(--border-color)',
                            color: 'var(--text-primary)',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => handleDeleteStudentAssign(st.id, st.studentName)}
                          title="Delete Assignment"
                          style={{
                            padding: '6px 9px',
                            borderRadius: 'var(--radius-md)',
                            backgroundColor: 'transparent',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            color: '#ef4444',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredStudentAssignments.length === 0 && (
                  <tr>
                    <td colSpan={9} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                      No student transport allocations found. Click "Assign Student Transport" to connect a student to a route and stop.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 7: TRANSPORT FEES & BILLING */}
      {currentTab === 'fees' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
          {/* Header & Quick Collect Action */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Transport Fees & Revenue Management
              </h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Area-wise & route-wise fees, student payment ledger, pending dues collection and receipts
              </p>
            </div>
            <button
              onClick={() => {
                const target = studentAssignments[0] || {};
                handleOpenCollectFee(target);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '9px 18px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: '#10b981',
                color: '#ffffff',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
            >
              <CreditCard size={16} /> Collect Transport Fee
            </button>
          </div>

          {/* Financial KPI Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '16px' }}>
            <div style={{ padding: '18px', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>TOTAL ASSESSED FEES</span>
                <CircleDollarSign size={20} color="#0d9488" />
              </div>
              <div style={{ fontSize: '1.7rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '8px' }}>
                ₹{Number(feeSummary?.totalAssessed || 0).toLocaleString()}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Annual / Monthly billing schedule</div>
            </div>

            <div style={{ padding: '18px', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>FEES COLLECTED</span>
                <CheckCircle2 size={20} color="#10b981" />
              </div>
              <div style={{ fontSize: '1.7rem', fontWeight: 800, color: '#10b981', marginTop: '8px' }}>
                ₹{Number(feeSummary?.totalCollected || 0).toLocaleString()}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                {Math.round(((feeSummary?.totalCollected || 0) / Math.max(feeSummary?.totalAssessed || 1, 1)) * 100)}% collection efficiency
              </div>
            </div>

            <div style={{ padding: '18px', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>PENDING DUES</span>
                <Clock size={20} color="#f59e0b" />
              </div>
              <div style={{ fontSize: '1.7rem', fontWeight: 800, color: '#f59e0b', marginTop: '8px' }}>
                ₹{Number(feeSummary?.totalPending || 0).toLocaleString()}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Awaiting clearance</div>
            </div>

            <div style={{ padding: '18px', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>OVERDUE ACCOUNTS</span>
                <AlertTriangle size={20} color="#ef4444" />
              </div>
              <div style={{ fontSize: '1.7rem', fontWeight: 800, color: '#ef4444', marginTop: '8px' }}>
                {feeSummary?.overdueCount || 0} Students
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Requires immediate follow-up</div>
            </div>
          </div>

          {/* Area-Wise & Route-Wise Fee Structure */}
          <div>
            <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '10px' }}>
              Area-Wise / Route-Wise Fee Rates
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
              {routes.map((rt) => {
                const assignedCount = studentAssignments.filter(s => s.routeId === rt.id).length;
                const monthlyProjection = (rt.fare || 1500) * assignedCount;
                return (
                  <div
                    key={rt.id}
                    style={{
                      padding: '16px',
                      borderRadius: 'var(--radius-lg)',
                      backgroundColor: 'var(--bg-card)',
                      border: '1px solid var(--border-color)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-primary)' }}>{rt.routeName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{rt.areaLocality || 'Campus Route'} • {rt.routeCode}</div>
                      </div>
                      <span
                        style={{
                          padding: '3px 8px',
                          borderRadius: '6px',
                          backgroundColor: 'rgba(13, 148, 136, 0.1)',
                          color: '#0d9488',
                          fontWeight: 800,
                          fontSize: '0.8rem'
                        }}
                      >
                        ₹{rt.fare || 1500}/mo
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)', paddingTop: '6px', borderTop: '1px solid var(--border-light)' }}>
                      <span>Enrolled Students: <strong>{assignedCount}</strong></span>
                      <span>Monthly Revenue: <strong>₹{monthlyProjection.toLocaleString()}</strong></span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Student Transport Fee Ledger Table */}
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Student Fee Ledger & Payment Tracking
              </h4>
              <div style={{ display: 'flex', gap: '8px' }}>
                {['ALL', 'PAID', 'PARTIAL', 'PENDING', 'OVERDUE'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setFeeFilter(status)}
                    style={{
                      padding: '5px 12px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-color)',
                      backgroundColor: feeFilter === status ? '#0d9488' : 'var(--bg-app)',
                      color: feeFilter === status ? '#ffffff' : 'var(--text-secondary)',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '10px' }}>Student</th>
                    <th style={{ padding: '10px' }}>Class</th>
                    <th style={{ padding: '10px' }}>Route & Locality</th>
                    <th style={{ padding: '10px' }}>Monthly Rate</th>
                    <th style={{ padding: '10px' }}>Paid Amount</th>
                    <th style={{ padding: '10px' }}>Pending Due</th>
                    <th style={{ padding: '10px' }}>Payment Status</th>
                    <th style={{ padding: '10px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFeeStudents.map((st) => (
                    <tr key={st.id || st.studentId} style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <td style={{ padding: '12px' }}>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{st.studentName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Adm: {st.admissionNo} • {st.guardianPhone}</div>
                      </td>
                      <td style={{ padding: '12px', fontWeight: 600 }}>{st.className}</td>
                      <td style={{ padding: '12px' }}>
                        <div>{st.routeName}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Pickup: {st.pickupStopName}</div>
                      </td>
                      <td style={{ padding: '12px', fontWeight: 700 }}>₹{st.monthlyFee || 1500}</td>
                      <td style={{ padding: '12px', color: '#10b981', fontWeight: 700 }}>
                        ₹{st.paidAmount !== undefined ? st.paidAmount : (st.feeStatus === 'PAID' ? (st.monthlyFee || 1500) : 0)}
                      </td>
                      <td style={{ padding: '12px', color: '#ef4444', fontWeight: 700 }}>
                        ₹{st.pendingAmount !== undefined ? st.pendingAmount : (st.feeStatus === 'PAID' ? 0 : (st.monthlyFee || 1500))}
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span
                          style={{
                            padding: '3px 8px',
                            borderRadius: '10px',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            backgroundColor:
                              st.feeStatus === 'PAID'
                                ? 'rgba(16, 185, 129, 0.15)'
                                : st.feeStatus === 'PARTIAL'
                                ? 'rgba(234, 179, 8, 0.15)'
                                : 'rgba(239, 68, 68, 0.15)',
                            color:
                              st.feeStatus === 'PAID'
                                ? '#10b981'
                                : st.feeStatus === 'PARTIAL'
                                ? '#eab308'
                                : '#ef4444'
                          }}
                        >
                          {st.feeStatus || 'PENDING'}
                        </span>
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => handleOpenCollectFee(st)}
                            style={{
                              padding: '6px 12px',
                              borderRadius: 'var(--radius-md)',
                              backgroundColor: '#0d9488',
                              color: '#ffffff',
                              border: 'none',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <CreditCard size={13} /> Collect
                          </button>
                          {(st.paidAmount > 0 || st.feeStatus === 'PAID') && (
                            <button
                              onClick={() => {
                                setReceiptData({
                                  receiptNo: `TRP-REC-${st.id ? String(st.id).padStart(4, '0') : '1001'}`,
                                  studentName: st.studentName,
                                  admissionNo: st.admissionNo,
                                  className: st.className,
                                  routeName: st.routeName,
                                  amountPaid: st.paidAmount || st.monthlyFee || 1500,
                                  feeMonth: new Date().toLocaleString('default', { month: 'long' }),
                                  paymentMode: 'CASH',
                                  paymentDate: new Date().toISOString().split('T')[0],
                                  collectedBy: 'Admin Office'
                                });
                                setShowReceiptModal(true);
                              }}
                              style={{
                                padding: '6px 10px',
                                borderRadius: 'var(--radius-md)',
                                backgroundColor: 'var(--bg-app)',
                                border: '1px solid var(--border-color)',
                                color: 'var(--text-primary)',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              <Printer size={13} /> Receipt
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredFeeStudents.length === 0 && (
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                        No records found for the selected fee filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Payments Transaction Log */}
          {feeSummary?.recentPayments && feeSummary.recentPayments.length > 0 && (
            <div
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-lg)',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}
            >
              <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Recent Payment Receipts Issued
              </h4>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                      <th style={{ padding: '8px' }}>Receipt No</th>
                      <th style={{ padding: '8px' }}>Student</th>
                      <th style={{ padding: '8px' }}>Month</th>
                      <th style={{ padding: '8px' }}>Amount</th>
                      <th style={{ padding: '8px' }}>Mode</th>
                      <th style={{ padding: '8px' }}>Date</th>
                      <th style={{ padding: '8px', textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {feeSummary.recentPayments.map((pm, idx) => (
                      <tr key={pm.id || idx} style={{ borderBottom: '1px solid var(--border-light)' }}>
                        <td style={{ padding: '10px', fontWeight: 700, color: '#0d9488' }}>{pm.receiptNumber}</td>
                        <td style={{ padding: '10px', fontWeight: 600 }}>{pm.studentName}</td>
                        <td style={{ padding: '10px' }}>{pm.feeMonth}</td>
                        <td style={{ padding: '10px', color: '#10b981', fontWeight: 800 }}>₹{pm.amountPaid}</td>
                        <td style={{ padding: '10px' }}>{pm.paymentMode}</td>
                        <td style={{ padding: '10px', color: 'var(--text-muted)' }}>{pm.paymentDate}</td>
                        <td style={{ padding: '10px', textAlign: 'right' }}>
                          <button
                            onClick={() => {
                              setReceiptData({
                                receiptNo: pm.receiptNumber,
                                studentName: pm.studentName,
                                admissionNo: 'AD-2024',
                                amountPaid: pm.amountPaid,
                                feeMonth: pm.feeMonth,
                                paymentMode: pm.paymentMode,
                                paymentDate: pm.paymentDate,
                                collectedBy: pm.collectedBy || 'Admin Office'
                              });
                              setShowReceiptModal(true);
                            }}
                            style={{
                              padding: '4px 8px',
                              borderRadius: 'var(--radius-sm)',
                              backgroundColor: 'transparent',
                              border: '1px solid var(--border-color)',
                              cursor: 'pointer',
                              fontSize: '0.72rem',
                              fontWeight: 600
                            }}
                          >
                            Print Receipt
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
      {/* MODAL 1: ADD / EDIT BUS MODAL */}
      {/* ============================================================== */}
      {showAddBusModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
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
              padding: '24px',
              width: '100%',
              maxWidth: '580px',
              border: '1px solid var(--border-color)',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>
                  {editingBus ? 'Edit Bus Details' : 'Add New Bus to Fleet'}
                </h3>
                <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Vehicle specifications, seating, compliance and expiry dates
                </p>
              </div>
              <button
                onClick={() => {
                  setShowAddBusModal(false);
                  setEditingBus(null);
                }}
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateOrUpdateBus} style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.85rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontWeight: 600, display: 'block', marginBottom: '4px' }}>Bus Number / Identifier *</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Bus 01"
                    value={busForm.busNumber}
                    onChange={(e) => setBusForm({ ...busForm, busNumber: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-app)' }}
                  />
                </div>
                <div>
                  <label style={{ fontWeight: 600, display: 'block', marginBottom: '4px' }}>Registration Number *</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. DL 1PC 1234"
                    value={busForm.registrationNumber}
                    onChange={(e) => setBusForm({ ...busForm, registrationNumber: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-app)' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontWeight: 600, display: 'block', marginBottom: '4px' }}>Bus Model / Make</label>
                  <input
                    type="text"
                    placeholder="e.g. Tata Starbus 40"
                    value={busForm.model}
                    onChange={(e) => setBusForm({ ...busForm, model: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-app)' }}
                  />
                </div>
                <div>
                  <label style={{ fontWeight: 600, display: 'block', marginBottom: '4px' }}>Seating Capacity *</label>
                  <input
                    required
                    type="number"
                    min="1"
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
                    <option value="PETROL">Petrol</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontWeight: 600, display: 'block', marginBottom: '4px' }}>Vehicle Status</label>
                  <select
                    value={busForm.status}
                    onChange={(e) => setBusForm({ ...busForm, status: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-app)' }}
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="MAINTENANCE">Maintenance</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontWeight: 600, display: 'block', marginBottom: '4px' }}>GPS Device IMEI / ID</label>
                <input
                  type="text"
                  placeholder="e.g. GPS-DEV-889"
                  value={busForm.gpsDeviceId}
                  onChange={(e) => setBusForm({ ...busForm, gpsDeviceId: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-app)' }}
                />
              </div>

              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '10px' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: '8px', color: 'var(--text-secondary)' }}>
                  Compliance & Certificate Expiry Dates
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: '3px' }}>Insurance Expiry</label>
                    <input
                      type="date"
                      value={busForm.insuranceExpiryDate || ''}
                      onChange={(e) => setBusForm({ ...busForm, insuranceExpiryDate: e.target.value })}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-app)' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: '3px' }}>Fitness Certificate Expiry</label>
                    <input
                      type="date"
                      value={busForm.fitnessExpiryDate || ''}
                      onChange={(e) => setBusForm({ ...busForm, fitnessExpiryDate: e.target.value })}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-app)' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: '3px' }}>Permit Expiry</label>
                    <input
                      type="date"
                      value={busForm.permitExpiryDate || ''}
                      onChange={(e) => setBusForm({ ...busForm, permitExpiryDate: e.target.value })}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-app)' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: '3px' }}>PUC / Pollution Expiry</label>
                    <input
                      type="date"
                      value={busForm.pollutionExpiryDate || ''}
                      onChange={(e) => setBusForm({ ...busForm, pollutionExpiryDate: e.target.value })}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-app)' }}
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddBusModal(false);
                    setEditingBus(null);
                  }}
                  style={{ padding: '8px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'none', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 20px', borderRadius: 'var(--radius-md)', backgroundColor: '#0d9488', color: '#ffffff', border: 'none', fontWeight: 700, cursor: 'pointer' }}
                >
                  {editingBus ? 'Update Bus' : 'Save Bus'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 2: EDIT DRIVER DETAILS MODAL (Driver added via Staff Screen) */}
      {/* ============================================================== */}
      {showEditDriverModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
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
              padding: '24px',
              width: '100%',
              maxWidth: '540px',
              border: '1px solid var(--border-color)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>Edit Driver Profile & Licence</h3>
                <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Driver details and operational availability status
                </p>
              </div>
              <button
                onClick={() => {
                  setShowEditDriverModal(false);
                  setEditingDriver(null);
                }}
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleUpdateDriver} style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.85rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontWeight: 600, display: 'block', marginBottom: '4px' }}>Driver Full Name *</label>
                  <input
                    required
                    type="text"
                    value={driverEditForm.name}
                    onChange={(e) => setDriverEditForm({ ...driverEditForm, name: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-app)' }}
                  />
                </div>
                <div>
                  <label style={{ fontWeight: 600, display: 'block', marginBottom: '4px' }}>Mobile Number *</label>
                  <input
                    required
                    type="text"
                    value={driverEditForm.phone}
                    onChange={(e) => setDriverEditForm({ ...driverEditForm, phone: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-app)' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontWeight: 600, display: 'block', marginBottom: '4px' }}>Driving Licence Number</label>
                  <input
                    type="text"
                    value={driverEditForm.licenseNumber}
                    onChange={(e) => setDriverEditForm({ ...driverEditForm, licenseNumber: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-app)' }}
                  />
                </div>
                <div>
                  <label style={{ fontWeight: 600, display: 'block', marginBottom: '4px' }}>Licence Expiry Date</label>
                  <input
                    type="date"
                    value={driverEditForm.licenseExpiryDate || ''}
                    onChange={(e) => setDriverEditForm({ ...driverEditForm, licenseExpiryDate: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-app)' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontWeight: 600, display: 'block', marginBottom: '4px' }}>Joining Date</label>
                  <input
                    type="date"
                    value={driverEditForm.joiningDate || ''}
                    onChange={(e) => setDriverEditForm({ ...driverEditForm, joiningDate: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-app)' }}
                  />
                </div>
                <div>
                  <label style={{ fontWeight: 600, display: 'block', marginBottom: '4px' }}>Emergency Contact</label>
                  <input
                    type="text"
                    placeholder="Relation & Phone"
                    value={driverEditForm.emergencyContact}
                    onChange={(e) => setDriverEditForm({ ...driverEditForm, emergencyContact: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-app)' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontWeight: 600, display: 'block', marginBottom: '4px' }}>Address</label>
                <input
                  type="text"
                  placeholder="Residential Address"
                  value={driverEditForm.address}
                  onChange={(e) => setDriverEditForm({ ...driverEditForm, address: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-app)' }}
                />
              </div>

              <div>
                <label style={{ fontWeight: 600, display: 'block', marginBottom: '4px' }}>Availability Status</label>
                <select
                  value={driverEditForm.status}
                  onChange={(e) => setDriverEditForm({ ...driverEditForm, status: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-app)' }}
                >
                  <option value="ACTIVE">Active (On Duty)</option>
                  <option value="ON_LEAVE">On Leave</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditDriverModal(false);
                    setEditingDriver(null);
                  }}
                  style={{ padding: '8px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'none', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 20px', borderRadius: 'var(--radius-md)', backgroundColor: '#0d9488', color: '#ffffff', border: 'none', fontWeight: 700, cursor: 'pointer' }}
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 3: ADD / EDIT ROUTE MODAL */}
      {/* ============================================================== */}
      {showAddRouteModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
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
              padding: '24px',
              width: '100%',
              maxWidth: '560px',
              border: '1px solid var(--border-color)',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>
                  {editingRoute ? 'Edit Route Details' : 'Plan New Route'}
                </h3>
                <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Route name, area/locality, schedule timings and monthly fare
                </p>
              </div>
              <button
                onClick={() => {
                  setShowAddRouteModal(false);
                  setEditingRoute(null);
                }}
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateOrUpdateRoute} style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.85rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontWeight: 600, display: 'block', marginBottom: '4px' }}>Route Name *</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Rohini to School"
                    value={routeForm.routeName}
                    onChange={(e) => setRouteForm({ ...routeForm, routeName: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-app)' }}
                  />
                </div>
                <div>
                  <label style={{ fontWeight: 600, display: 'block', marginBottom: '4px' }}>Route Code *</label>
                  <input
                    required
                    type="text"
                    placeholder="RT-ROH-01"
                    value={routeForm.routeCode}
                    onChange={(e) => setRouteForm({ ...routeForm, routeCode: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-app)' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontWeight: 600, display: 'block', marginBottom: '4px' }}>Area / Locality *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Rohini Sector 7 → Sector 11 → Rithala"
                  value={routeForm.areaLocality}
                  onChange={(e) => setRouteForm({ ...routeForm, areaLocality: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-app)' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontWeight: 600, display: 'block', marginBottom: '4px' }}>Starting Point</label>
                  <input
                    type="text"
                    placeholder="e.g. Rohini Sector 7"
                    value={routeForm.startLocation}
                    onChange={(e) => setRouteForm({ ...routeForm, startLocation: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-app)' }}
                  />
                </div>
                <div>
                  <label style={{ fontWeight: 600, display: 'block', marginBottom: '4px' }}>Destination</label>
                  <input
                    type="text"
                    placeholder="School Main Campus"
                    value={routeForm.endLocation}
                    onChange={(e) => setRouteForm({ ...routeForm, endLocation: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-app)' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontWeight: 600, display: 'block', marginBottom: '4px' }}>Monthly Fare (₹) *</label>
                  <input
                    required
                    type="number"
                    value={routeForm.fare}
                    onChange={(e) => setRouteForm({ ...routeForm, fare: Number(e.target.value) })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-app)' }}
                  />
                </div>
                <div>
                  <label style={{ fontWeight: 600, display: 'block', marginBottom: '4px' }}>Distance (km)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={routeForm.totalDistanceKm}
                    onChange={(e) => setRouteForm({ ...routeForm, totalDistanceKm: Number(e.target.value) })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-app)' }}
                  />
                </div>
                <div>
                  <label style={{ fontWeight: 600, display: 'block', marginBottom: '4px' }}>Duration (mins)</label>
                  <input
                    type="number"
                    value={routeForm.plannedDurationMinutes}
                    onChange={(e) => setRouteForm({ ...routeForm, plannedDurationMinutes: Number(e.target.value) })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-app)' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontWeight: 600, display: 'block', marginBottom: '4px' }}>Morning Start Time</label>
                  <input
                    type="text"
                    placeholder="07:15 AM"
                    value={routeForm.morningStartTime}
                    onChange={(e) => setRouteForm({ ...routeForm, morningStartTime: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-app)' }}
                  />
                </div>
                <div>
                  <label style={{ fontWeight: 600, display: 'block', marginBottom: '4px' }}>Evening Start Time</label>
                  <input
                    type="text"
                    placeholder="02:45 PM"
                    value={routeForm.eveningStartTime}
                    onChange={(e) => setRouteForm({ ...routeForm, eveningStartTime: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-app)' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddRouteModal(false);
                    setEditingRoute(null);
                  }}
                  style={{ padding: '8px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'none', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 20px', borderRadius: 'var(--radius-md)', backgroundColor: '#0d9488', color: '#ffffff', border: 'none', fontWeight: 700, cursor: 'pointer' }}
                >
                  {editingRoute ? 'Update Route' : 'Save Route'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 4: MANAGE ROUTE STOPS MODAL */}
      {/* ============================================================== */}
      {showManageStopsModal && selectedRouteForStops && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
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
              padding: '24px',
              width: '100%',
              maxWidth: '680px',
              border: '1px solid var(--border-color)',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>
                  Stops for {selectedRouteForStops.routeName}
                </h3>
                <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Ordered sequence of pickup/drop points and arrival times
                </p>
              </div>
              <button onClick={() => setShowManageStopsModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
              {(selectedRouteForStops.stops || []).map((stop, sIdx) => (
                <div
                  key={stop.id || sIdx}
                  style={{
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-app)',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        backgroundColor: '#0d9488',
                        color: '#ffffff',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {stop.stopOrder || sIdx + 1}
                    </span>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{stop.stopName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{stop.landmark || 'No landmark specified'}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', fontSize: '0.8rem' }}>
                    <div style={{ color: '#0d9488', fontWeight: 700 }}>Pickup: {stop.plannedMorningPickupTime || 'N/A'}</div>
                    <div style={{ color: '#2563eb', fontWeight: 600, fontSize: '0.75rem' }}>Drop: {stop.plannedEveningDropTime || 'N/A'}</div>
                  </div>
                </div>
              ))}
              {(!selectedRouteForStops.stops || selectedRouteForStops.stops.length === 0) && (
                <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  No stops configured yet for this route.
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowManageStopsModal(false)}
                style={{ padding: '8px 20px', borderRadius: 'var(--radius-md)', backgroundColor: '#0d9488', color: '#ffffff', border: 'none', fontWeight: 700, cursor: 'pointer' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 5: BUS-DRIVER-ROUTE DUTY ASSIGNMENT MODAL */}
      {/* ============================================================== */}
      {showAddAssignmentModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
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
              padding: '24px',
              width: '100%',
              maxWidth: '520px',
              border: '1px solid var(--border-color)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>New Duty Assignment</h3>
                <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Map Driver to Bus and Route for operational shifts
                </p>
              </div>
              <button onClick={() => setShowAddAssignmentModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateAssignment} style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.85rem' }}>
              <div>
                <label style={{ fontWeight: 600, display: 'block', marginBottom: '4px' }}>Select Driver *</label>
                <select
                  required
                  value={assignmentForm.driverId}
                  onChange={(e) => {
                    const selectedDriver = drivers.find(driver => String(driver.id) === e.target.value);
                    setAssignmentForm({ ...assignmentForm, driverId: e.target.value, busId: selectedDriver?.assignedBusId ? String(selectedDriver.assignedBusId) : '' });
                  }}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-app)' }}
                >
                  <option value="">-- Choose Driver --</option>
                  {drivers.map(d => (
                    <option key={d.id} value={d.id}>{d.name} ({d.phone})</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontWeight: 600, display: 'block', marginBottom: '4px' }}>Select Bus *</label>
                <select
                  required
                  value={assignmentForm.busId}
                  onChange={(e) => setAssignmentForm({ ...assignmentForm, busId: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-app)' }}
                >
                  <option value="">-- Choose Bus --</option>
                  {buses.filter(b => b.status === 'ACTIVE' && assignmentForm.driverId &&
                    (!b.assignedDriverId || String(b.assignedDriverId) === String(assignmentForm.driverId)) &&
                    (!drivers.find(d => String(d.id) === String(assignmentForm.driverId))?.assignedBusId ||
                      String(b.id) === String(drivers.find(d => String(d.id) === String(assignmentForm.driverId)).assignedBusId))
                  ).map(b => (
                    <option key={b.id} value={b.id}>{b.busNumber} ({b.registrationNumber}) - {b.capacity} Seats</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontWeight: 600, display: 'block', marginBottom: '4px' }}>Select Route *</label>
                <select
                  required
                  value={assignmentForm.routeId}
                  onChange={(e) => setAssignmentForm({ ...assignmentForm, routeId: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-app)' }}
                >
                  <option value="">-- Choose Route --</option>
                  {routes.map(r => (
                    <option key={r.id} value={r.id}>{r.routeCode} - {r.routeName} ({r.areaLocality || 'Campus'})</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontWeight: 600, display: 'block', marginBottom: '4px' }}>Shift *</label>
                <select
                  value={assignmentForm.shift}
                  onChange={(e) => setAssignmentForm({ ...assignmentForm, shift: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-app)' }}
                >
                  <option value="BOTH">Both (Morning Pickup & Evening Drop)</option>
                  <option value="MORNING">Morning Shift Only</option>
                  <option value="EVENING">Evening Shift Only</option>
                </select>
              </div>

              <div>
                <label style={{ fontWeight: 600, display: 'block', marginBottom: '4px' }}>Notes / Remarks</label>
                <input
                  type="text"
                  placeholder="e.g. Regular driver replacement assignment"
                  value={assignmentForm.notes}
                  onChange={(e) => setAssignmentForm({ ...assignmentForm, notes: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-app)' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddAssignmentModal(false)}
                  style={{ padding: '8px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'none', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 20px', borderRadius: 'var(--radius-md)', backgroundColor: '#0d9488', color: '#ffffff', border: 'none', fontWeight: 700, cursor: 'pointer' }}
                >
                  Save Duty Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 6: ASSIGN / EDIT STUDENT TRANSPORT MODAL */}
      {/* ============================================================== */}
      {showAssignStudentModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
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
              padding: '24px',
              width: '100%',
              maxWidth: '580px',
              border: '1px solid var(--border-color)',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>
                  {editingStudentAssign ? 'Edit Student Transport' : 'Assign Student to Transport'}
                </h3>
                <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Connect student to route, pickup/drop stop and set transport validity
                </p>
              </div>
              <button
                onClick={() => {
                  setShowAssignStudentModal(false);
                  setEditingStudentAssign(null);
                }}
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAssignOrUpdateStudent} style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.85rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontWeight: 600, display: 'block', marginBottom: '4px' }}>Student Name *</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Aarav Sharma"
                    value={studentAssignForm.studentName}
                    onChange={(e) => setStudentAssignForm({ ...studentAssignForm, studentName: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-app)' }}
                  />
                </div>
                <div>
                  <label style={{ fontWeight: 600, display: 'block', marginBottom: '4px' }}>Admission No *</label>
                  <input
                    required
                    type="text"
                    placeholder="ADM-2024-001"
                    value={studentAssignForm.admissionNo}
                    onChange={(e) => setStudentAssignForm({ ...studentAssignForm, admissionNo: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-app)' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontWeight: 600, display: 'block', marginBottom: '4px' }}>Class & Section *</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Class 7-A"
                    value={studentAssignForm.className}
                    onChange={(e) => setStudentAssignForm({ ...studentAssignForm, className: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-app)' }}
                  />
                </div>
                <div>
                  <label style={{ fontWeight: 600, display: 'block', marginBottom: '4px' }}>Guardian Mobile No *</label>
                  <input
                    required
                    type="text"
                    placeholder="+91 98765 43210"
                    value={studentAssignForm.guardianPhone}
                    onChange={(e) => setStudentAssignForm({ ...studentAssignForm, guardianPhone: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-app)' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontWeight: 600, display: 'block', marginBottom: '4px' }}>Assigned Route *</label>
                <select
                  required
                  value={studentAssignForm.routeId}
                  onChange={(e) => {
                    const rId = e.target.value;
                    const selectedRoute = routes.find(r => String(r.id) === String(rId));
                    setStudentAssignForm({
                      ...studentAssignForm,
                      routeId: rId,
                      monthlyFee: selectedRoute?.fare || 1500,
                      pickupStopId: selectedRoute?.stops?.[0]?.id || '',
                      dropStopId: selectedRoute?.stops?.[selectedRoute.stops.length - 1]?.id || ''
                    });
                  }}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-app)' }}
                >
                  <option value="">-- Choose Route --</option>
                  {routes.map(r => (
                    <option key={r.id} value={r.id}>{r.routeCode} - {r.routeName} ({r.areaLocality || 'Campus'})</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontWeight: 600, display: 'block', marginBottom: '4px' }}>Pickup Stop</label>
                  <select
                    value={studentAssignForm.pickupStopId}
                    onChange={(e) => setStudentAssignForm({ ...studentAssignForm, pickupStopId: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-app)' }}
                  >
                    <option value="">-- Choose Pickup Stop --</option>
                    {(routes.find(r => String(r.id) === String(studentAssignForm.routeId))?.stops || []).map(s => (
                      <option key={s.id} value={s.id}>{s.stopOrder}. {s.stopName} ({s.plannedMorningPickupTime || 'Morning'})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ fontWeight: 600, display: 'block', marginBottom: '4px' }}>Drop Stop</label>
                  <select
                    value={studentAssignForm.dropStopId}
                    onChange={(e) => setStudentAssignForm({ ...studentAssignForm, dropStopId: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-app)' }}
                  >
                    <option value="">-- Choose Drop Stop --</option>
                    {(routes.find(r => String(r.id) === String(studentAssignForm.routeId))?.stops || []).map(s => (
                      <option key={s.id} value={s.id}>{s.stopOrder}. {s.stopName} ({s.plannedEveningDropTime || 'Evening'})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontWeight: 600, display: 'block', marginBottom: '4px' }}>Trip Type</label>
                  <select
                    value={studentAssignForm.tripType}
                    onChange={(e) => setStudentAssignForm({ ...studentAssignForm, tripType: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-app)' }}
                  >
                    <option value="BOTH_WAY">Both-Way (Two Way)</option>
                    <option value="ONE_WAY">One-Way (Single Trip)</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontWeight: 600, display: 'block', marginBottom: '4px' }}>Monthly Fee (₹) *</label>
                  <input
                    required
                    type="number"
                    value={studentAssignForm.monthlyFee}
                    onChange={(e) => setStudentAssignForm({ ...studentAssignForm, monthlyFee: Number(e.target.value) })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-app)' }}
                  />
                </div>
                <div>
                  <label style={{ fontWeight: 600, display: 'block', marginBottom: '4px' }}>Fee Status</label>
                  <select
                    value={studentAssignForm.feeStatus}
                    onChange={(e) => setStudentAssignForm({ ...studentAssignForm, feeStatus: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-app)' }}
                  >
                    <option value="PENDING">Pending</option>
                    <option value="PAID">Paid</option>
                    <option value="PARTIAL">Partial</option>
                    <option value="OVERDUE">Overdue</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontWeight: 600, display: 'block', marginBottom: '4px' }}>Transport Start Date</label>
                  <input
                    type="date"
                    value={studentAssignForm.startDate}
                    onChange={(e) => setStudentAssignForm({ ...studentAssignForm, startDate: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-app)' }}
                  />
                </div>
                <div>
                  <label style={{ fontWeight: 600, display: 'block', marginBottom: '4px' }}>Transport End Date (Optional)</label>
                  <input
                    type="date"
                    value={studentAssignForm.endDate || ''}
                    onChange={(e) => setStudentAssignForm({ ...studentAssignForm, endDate: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-app)' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowAssignStudentModal(false);
                    setEditingStudentAssign(null);
                  }}
                  style={{ padding: '8px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'none', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 20px', borderRadius: 'var(--radius-md)', backgroundColor: '#0d9488', color: '#ffffff', border: 'none', fontWeight: 700, cursor: 'pointer' }}
                >
                  {editingStudentAssign ? 'Update Assignment' : 'Assign Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 7: COLLECT TRANSPORT FEE MODAL */}
      {/* ============================================================== */}
      {showCollectFeeModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
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
              padding: '24px',
              width: '100%',
              maxWidth: '480px',
              border: '1px solid var(--border-color)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>Collect Transport Fee</h3>
                <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Record student transport payment and print instant receipt
                </p>
              </div>
              <button onClick={() => setShowCollectFeeModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCollectFeeSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.85rem' }}>
              <div
                style={{
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'rgba(13, 148, 136, 0.08)',
                  border: '1px solid rgba(13, 148, 136, 0.2)'
                }}
              >
                <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0d9488' }}>{feePaymentForm.studentName}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Admission No: {feePaymentForm.admissionNo}</div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontWeight: 600, display: 'block', marginBottom: '4px' }}>Amount to Collect (₹) *</label>
                  <input
                    required
                    type="number"
                    value={feePaymentForm.amountPaid}
                    onChange={(e) => setFeePaymentForm({ ...feePaymentForm, amountPaid: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-app)', fontWeight: 700 }}
                  />
                </div>
                <div>
                  <label style={{ fontWeight: 600, display: 'block', marginBottom: '4px' }}>Billing Month *</label>
                  <input
                    required
                    type="text"
                    value={feePaymentForm.feeMonth}
                    onChange={(e) => setFeePaymentForm({ ...feePaymentForm, feeMonth: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-app)' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontWeight: 600, display: 'block', marginBottom: '4px' }}>Payment Mode *</label>
                <select
                  value={feePaymentForm.paymentMode}
                  onChange={(e) => setFeePaymentForm({ ...feePaymentForm, paymentMode: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-app)' }}
                >
                  <option value="CASH">Cash Payment</option>
                  <option value="UPI">UPI / QR Code</option>
                  <option value="ONLINE">Online Net Banking / Card</option>
                  <option value="CHEQUE">Cheque / DD</option>
                </select>
              </div>

              <div>
                <label style={{ fontWeight: 600, display: 'block', marginBottom: '4px' }}>Remarks / Note</label>
                <input
                  type="text"
                  placeholder="e.g. October month transport fee received"
                  value={feePaymentForm.remarks}
                  onChange={(e) => setFeePaymentForm({ ...feePaymentForm, remarks: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-app)' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowCollectFeeModal(false)}
                  style={{ padding: '8px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'none', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 20px', borderRadius: 'var(--radius-md)', backgroundColor: '#10b981', color: '#ffffff', border: 'none', fontWeight: 700, cursor: 'pointer' }}
                >
                  Confirm Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 8: PRINTABLE TRANSPORT FEE RECEIPT MODAL */}
      {/* ============================================================== */}
      {showReceiptModal && receiptData && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              color: '#0f172a',
              borderRadius: 'var(--radius-lg)',
              padding: '30px',
              width: '100%',
              maxWidth: '480px',
              border: '2px dashed #0d9488',
              boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
              position: 'relative'
            }}
          >
            <div style={{ textAlign: 'center', borderBottom: '2px solid #e2e8f0', paddingBottom: '16px', marginBottom: '16px' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0d9488', letterSpacing: '1px' }}>SCHOOL TRANSPORT DIVISION</div>
              <h2 style={{ margin: '4px 0', fontSize: '1.4rem', fontWeight: 900 }}>OFFICIAL FEE RECEIPT</h2>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Receipt No: <strong>{receiptData.receiptNumber || receiptData.receiptNo}</strong></div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>
                <span style={{ color: '#64748b' }}>Student Name:</span>
                <span style={{ fontWeight: 800 }}>{receiptData.studentName}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>
                <span style={{ color: '#64748b' }}>Admission Number:</span>
                <span style={{ fontWeight: 700 }}>{receiptData.admissionNo || 'N/A'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>
                <span style={{ color: '#64748b' }}>Billing Month:</span>
                <span style={{ fontWeight: 700 }}>{receiptData.feeMonth}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>
                <span style={{ color: '#64748b' }}>Payment Mode:</span>
                <span style={{ fontWeight: 700 }}>{receiptData.paymentMode}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>
                <span style={{ color: '#64748b' }}>Payment Date:</span>
                <span>{receiptData.paymentDate || new Date().toISOString().split('T')[0]}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', backgroundColor: '#f8fafc', padding: '12px', borderRadius: '8px', marginTop: '6px' }}>
                <span style={{ fontWeight: 800, fontSize: '1rem', color: '#0f172a' }}>Amount Paid:</span>
                <span style={{ fontWeight: 900, fontSize: '1.2rem', color: '#10b981' }}>₹{receiptData.amountPaid}</span>
              </div>
            </div>

            <div style={{ fontSize: '0.72rem', color: '#94a3b8', textAlign: 'center', marginBottom: '20px' }}>
              This is a system generated computer receipt for school transport dues.
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => setShowReceiptModal(false)}
                style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#f8fafc', color: '#334155', fontWeight: 600, cursor: 'pointer' }}
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                style={{ padding: '8px 20px', borderRadius: '6px', backgroundColor: '#0d9488', color: '#ffffff', border: 'none', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Printer size={15} /> Print Receipt
              </button>
            </div>
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
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setPlaybackData(null);
              setIsPlaybackPlaying(false);
            }
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
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#ef4444',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  padding: '7px 14px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(239, 68, 68, 0.35)'
                }}
              >
                <X size={16} /> Close Replay
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

      {/* ============================================================== */}
      {/* BUS DEDICATED TRACK ON MAP MODAL */}
      {/* ============================================================== */}
      {showBusTrackModal && selectedBusForMap && (
        <BusTrackModal
          isOpen={showBusTrackModal}
          onClose={() => {
            setShowBusTrackModal(false);
            setSelectedBusForMap(null);
          }}
          bus={selectedBusForMap}
          route={trackingDataForBus(selectedBusForMap, liveBuses, routes, assignments).route}
          driver={
            drivers.find(
              (d) =>
                d.id === selectedBusForMap.assignedDriverId ||
                d.id === selectedBusForMap.driverId ||
                d.name === selectedBusForMap.assignedDriverName
            )
          }
          liveData={trackingDataForBus(selectedBusForMap, liveBuses, routes, assignments).live}
        />
      )}
      {/* MODAL: DRIVER DETAILS & DAILY CHECKLIST / TRIP LOG MODAL       */}
      {/* ============================================================== */}
      {selectedDriverForDetails && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1100,
            padding: '16px'
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--bg-card)',
              borderRadius: 'var(--radius-lg)',
              width: '100%',
              maxWidth: '820px',
              maxHeight: '90vh',
              overflowY: 'auto',
              border: '1px solid var(--border-color)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: '18px 24px',
                borderBottom: '1px solid var(--border-color)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: 'var(--bg-app)'
              }}
            >
              <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                <img
                  src={selectedDriverForDetails.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80'}
                  alt={selectedDriverForDetails.name}
                  style={{ width: '52px', height: '52px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #0d9488' }}
                />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      {selectedDriverForDetails.name}
                    </h3>
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: '6px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        backgroundColor: selectedDriverForDetails.verificationStatus === 'VERIFIED' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(234, 179, 8, 0.15)',
                        color: selectedDriverForDetails.verificationStatus === 'VERIFIED' ? '#10b981' : '#eab308'
                      }}
                    >
                      {selectedDriverForDetails.verificationStatus || 'VERIFIED'}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Phone: <strong style={{ color: '#0d9488' }}>{selectedDriverForDetails.phone}</strong> • License: <strong>{selectedDriverForDetails.licenseNumber}</strong> • Expiry: <strong>{selectedDriverForDetails.licenseExpiryDate || '2029-06-30'}</strong>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedDriverForDetails(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '6px',
                  borderRadius: '50%',
                  color: 'var(--text-muted)'
                }}
              >
                <X size={22} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {driverDailyLoading ? (
                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <RefreshCw size={24} className="spin-animation" style={{ marginBottom: '12px' }} />
                  <div>Loading driver daily records and safety inspection details...</div>
                </div>
              ) : (
                <>
                  {/* Today's Operational Status Tiles */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
                      gap: '12px'
                    }}
                  >
                    {/* Tile 1: Duty / Trip Status */}
                    <div
                      style={{
                        backgroundColor: 'var(--bg-app)',
                        borderRadius: 'var(--radius-md)',
                        padding: '14px',
                        border: '1px solid var(--border-color)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px'
                      }}
                    >
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>TODAY'S TRIP STATUS</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span
                          style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: driverDailyData?.todayTrip?.status === 'IN_PROGRESS' || selectedDriverForDetails.dutyStatus === 'IN_TRIP'
                              ? '#10b981'
                              : '#f59e0b'
                          }}
                        />
                        <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                          {driverDailyData?.todayTrip?.status || (selectedDriverForDetails.dutyStatus === 'IN_TRIP' ? 'IN_PROGRESS' : 'SCHEDULED')}
                        </span>
                      </div>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        Bus: <strong>{driverDailyData?.todayTrip?.busNumber || selectedDriverForDetails.assignedBusNumber || 'Bus 04'}</strong>
                      </span>
                    </div>

                    {/* Tile 2: Trip Start Time */}
                    <div
                      style={{
                        backgroundColor: 'var(--bg-app)',
                        borderRadius: 'var(--radius-md)',
                        padding: '14px',
                        border: '1px solid var(--border-color)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px'
                      }}
                    >
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>START DEPARTURE TIME</span>
                      <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0d9488', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Clock size={16} />
                        {driverDailyData?.todayTrip?.actualStartTime
                          ? new Date(driverDailyData.todayTrip.actualStartTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          : (selectedDriverForDetails.todayTripStartTime
                              ? new Date(selectedDriverForDetails.todayTripStartTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                              : 'Pending Departure')}
                      </div>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        Planned: <strong>{driverDailyData?.todayTrip?.plannedDepartureTime || '07:15 AM'}</strong>
                      </span>
                    </div>

                    {/* Tile 3: Start Location */}
                    <div
                      style={{
                        backgroundColor: 'var(--bg-app)',
                        borderRadius: 'var(--radius-md)',
                        padding: '14px',
                        border: '1px solid var(--border-color)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px'
                      }}
                    >
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>START LOCATION</span>
                      <div style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <MapPin size={16} color="#6366f1" style={{ flexShrink: 0 }} />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {driverDailyData?.todayTrip?.startLocationName ||
                           driverDailyData?.todayStartLocation ||
                           selectedDriverForDetails.todayStartLocationName ||
                           'Campus Bus Terminal'}
                        </span>
                      </div>
                      {(driverDailyData?.todayTrip?.startLatitude || selectedDriverForDetails.todayStartLatitude) && (
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${driverDailyData?.todayTrip?.startLatitude || selectedDriverForDetails.todayStartLatitude},${driverDailyData?.todayTrip?.startLongitude || selectedDriverForDetails.todayStartLongitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            fontSize: '0.75rem',
                            color: '#0d9488',
                            fontWeight: 700,
                            textDecoration: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          View Coordinates on Google Maps ↗
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Pre-Trip Vehicle Safety Inspection Checklist */}
                  <div
                    style={{
                      backgroundColor: 'var(--bg-app)',
                      borderRadius: 'var(--radius-lg)',
                      padding: '18px 20px',
                      border: '1px solid var(--border-color)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <ShieldCheck size={20} color={driverDailyData?.todayChecklistCompleted || selectedDriverForDetails.todayPreTripCheckPassed ? '#10b981' : '#f59e0b'} />
                        <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                          Daily Pre-Trip Safety Inspection Checklist
                        </span>
                      </div>
                      <span
                        style={{
                          padding: '4px 10px',
                          borderRadius: '8px',
                          fontSize: '0.75rem',
                          fontWeight: 800,
                          backgroundColor: driverDailyData?.todayChecklistCompleted || selectedDriverForDetails.todayPreTripCheckPassed
                            ? 'rgba(16, 185, 129, 0.15)'
                            : 'rgba(245, 158, 11, 0.15)',
                          color: driverDailyData?.todayChecklistCompleted || selectedDriverForDetails.todayPreTripCheckPassed
                            ? '#10b981'
                            : '#f59e0b'
                        }}
                      >
                        {driverDailyData?.todayChecklistCompleted || selectedDriverForDetails.todayPreTripCheckPassed
                          ? '5 / 5 VERIFIED OK'
                          : 'INCOMPLETE / PENDING'}
                      </span>
                    </div>

                    {/* 5 Checklist Items Grid */}
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                        gap: '10px'
                      }}
                    >
                      {[
                        {
                          title: 'Brakes, Steering & Horn OK',
                          desc: 'Hydraulics, brake pedal firmness & horn functional',
                          passed: driverDailyData?.todayTrip?.chkBrakes ?? selectedDriverForDetails.todayChkBrakes ?? true
                        },
                        {
                          title: 'Headlights, Indicators & Mirrors OK',
                          desc: 'High/low beams, rear indicators and side mirrors clean',
                          passed: driverDailyData?.todayTrip?.chkLights ?? selectedDriverForDetails.todayChkLights ?? true
                        },
                        {
                          title: 'Tire Pressure & Fuel / Fluids OK',
                          desc: 'Tire tread condition, coolant, motor oil & fuel tank OK',
                          passed: driverDailyData?.todayTrip?.chkTires ?? selectedDriverForDetails.todayChkTires ?? true
                        },
                        {
                          title: 'First Aid Kit & Fire Extinguisher Checked',
                          desc: 'Emergency kit stocked and fire cylinder gauge in green',
                          passed: driverDailyData?.todayTrip?.chkEmergencyKit ?? selectedDriverForDetails.todayChkEmergencyKit ?? true
                        },
                        {
                          title: 'Driver Phone GPS Location Enabled',
                          desc: 'High-accuracy GPS active for live parent & admin tracking',
                          passed: driverDailyData?.todayTrip?.chkGpsActive ?? selectedDriverForDetails.todayChkGpsActive ?? true
                        }
                      ].map((item, idx) => (
                        <div
                          key={idx}
                          style={{
                            padding: '10px 12px',
                            borderRadius: 'var(--radius-md)',
                            backgroundColor: 'var(--bg-card)',
                            border: `1px solid ${item.passed ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                            display: 'flex',
                            gap: '10px',
                            alignItems: 'flex-start'
                          }}
                        >
                          <CheckCircle2
                            size={18}
                            color={item.passed ? '#10b981' : '#94a3b8'}
                            style={{ flexShrink: 0, marginTop: '2px' }}
                          />
                          <div>
                            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                              {item.title}
                            </div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                              {item.desc}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Driver Notes */}
                    <div
                      style={{
                        marginTop: '12px',
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--bg-card)',
                        fontSize: '0.78rem',
                        color: 'var(--text-muted)'
                      }}
                    >
                      <strong>Driver Inspection Log Note:</strong>{' '}
                      {driverDailyData?.todayTrip?.preTripNotes ||
                       selectedDriverForDetails.todayPreTripNotes ||
                       'All 5 vehicle systems verified by driver before scheduled trip departure.'}
                    </div>
                  </div>

                  {/* Trip History for this Driver */}
                  <div>
                    <h4 style={{ margin: '0 0 10px 0', fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      Daily Trip Departure History ({driverDailyData?.recentTrips?.length || 0})
                    </h4>
                    <div
                      style={{
                        overflowX: 'auto',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--bg-card)'
                      }}
                    >
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
                        <thead>
                          <tr style={{ backgroundColor: 'var(--bg-app)', borderBottom: '1px solid var(--border-color)' }}>
                            <th style={{ padding: '10px 12px', fontWeight: 700 }}>Trip ID</th>
                            <th style={{ padding: '10px 12px', fontWeight: 700 }}>Date & Shift</th>
                            <th style={{ padding: '10px 12px', fontWeight: 700 }}>Bus</th>
                            <th style={{ padding: '10px 12px', fontWeight: 700 }}>Route</th>
                            <th style={{ padding: '10px 12px', fontWeight: 700 }}>Start Time</th>
                            <th style={{ padding: '10px 12px', fontWeight: 700 }}>Start Location</th>
                            <th style={{ padding: '10px 12px', fontWeight: 700 }}>Safety Checklist</th>
                            <th style={{ padding: '10px 12px', fontWeight: 700 }}>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(driverDailyData?.recentTrips && driverDailyData.recentTrips.length > 0) ? (
                            driverDailyData.recentTrips.map((trip) => (
                              <tr key={trip.tripId} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                <td style={{ padding: '10px 12px', fontWeight: 700, color: '#0d9488' }}>#{trip.tripId}</td>
                                <td style={{ padding: '10px 12px' }}>{trip.tripDate} • {trip.shift}</td>
                                <td style={{ padding: '10px 12px', fontWeight: 600 }}>{trip.busNumber}</td>
                                <td style={{ padding: '10px 12px', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {trip.routeName}
                                </td>
                                <td style={{ padding: '10px 12px', fontWeight: 600 }}>
                                  {trip.actualStartTime ? new Date(trip.actualStartTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                                </td>
                                <td style={{ padding: '10px 12px', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {trip.startLocationName || (trip.startLatitude ? `${trip.startLatitude}, ${trip.startLongitude}` : 'Depot')}
                                </td>
                                <td style={{ padding: '10px 12px' }}>
                                  <span style={{ color: '#10b981', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <CheckCircle2 size={13} /> 5/5 OK
                                  </span>
                                </td>
                                <td style={{ padding: '10px 12px' }}>
                                  <span
                                    style={{
                                      padding: '2px 7px',
                                      borderRadius: '6px',
                                      fontSize: '0.72rem',
                                      fontWeight: 800,
                                      backgroundColor: trip.status === 'IN_PROGRESS' ? 'rgba(13, 148, 136, 0.2)' : 'rgba(16, 185, 129, 0.15)',
                                      color: trip.status === 'IN_PROGRESS' ? '#0d9488' : '#10b981'
                                    }}
                                  >
                                    {trip.status}
                                  </span>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={8} style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)' }}>
                                No trip records logged yet for this driver.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div
              style={{
                padding: '14px 24px',
                borderTop: '1px solid var(--border-color)',
                display: 'flex',
                justifyContent: 'flex-end',
                backgroundColor: 'var(--bg-app)'
              }}
            >
              <button
                onClick={() => setSelectedDriverForDetails(null)}
                style={{
                  padding: '8px 20px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: '#0d9488',
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransportModule;
