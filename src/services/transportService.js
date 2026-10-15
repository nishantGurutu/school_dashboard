import { apiRequest } from './api';
import { API_ENDPOINTS } from './apiConfig';

const MOCK_FALLBACK_OVERVIEW = {
  totalBuses: 3,
  activeTrips: 1,
  idleBuses: 2,
  delayedTrips: 1,
  offlineGpsCount: 0,
  openAlertsCount: 1,
  totalRoutes: 2,
  totalDrivers: 2,
  totalStudentsAssigned: 42,
  liveBuses: [
    {
      busId: 3,
      busNumber: 'Bus 04',
      registrationNumber: 'MH-02-EF-4004',
      tripId: 1,
      tripStatus: 'IN_PROGRESS',
      driverId: 1,
      driverName: 'Ramesh Kumar',
      driverPhone: '+91 98765 43210',
      routeId: 1,
      routeName: 'Route 1 - North Campus Loop',
      shift: 'MORNING',
      currentLatitude: 25.6025,
      currentLongitude: 85.1430,
      currentSpeedKmh: 34.0,
      heading: 150.0,
      lastGpsUpdate: new Date().toISOString(),
      isGpsOnline: true,
      currentStopName: 'Central Mall Junction',
      nextStopName: 'Kankarbagh Park',
      nextStopEtaMinutes: 6,
      completedStops: 2,
      totalStops: 5,
      traveledDistanceKm: 7.8,
      totalRouteDistanceKm: 18.5,
      openAlertsCount: 1
    },
    {
      busId: 1,
      busNumber: 'Bus 01',
      registrationNumber: 'MH-02-AB-1001',
      tripId: null,
      tripStatus: 'IDLE',
      driverId: 2,
      driverName: 'Suresh Yadav',
      driverPhone: '+91 98123 45678',
      routeId: 2,
      routeName: 'Route 2 - South Residential Belt',
      shift: 'MORNING',
      currentLatitude: 25.6120,
      currentLongitude: 85.1320,
      currentSpeedKmh: 0.0,
      heading: 0.0,
      lastGpsUpdate: new Date(Date.now() - 120000).toISOString(),
      isGpsOnline: true,
      currentStopName: 'Campus Depot',
      nextStopName: 'Ready for Dispatch',
      nextStopEtaMinutes: 0,
      completedStops: 0,
      totalStops: 6,
      traveledDistanceKm: 0.0,
      totalRouteDistanceKm: 22.0,
      openAlertsCount: 0
    }
  ],
  recentAlerts: [
    {
      id: 1,
      tripId: 1,
      busId: 3,
      busNumber: 'Bus 04',
      alertType: 'DELAY',
      severity: 'INFO',
      title: 'Traffic Congestion on Metro Corridor',
      message: 'Slight 4-minute delay due to peak hour traffic near Metro Station Pillar 42.',
      status: 'OPEN',
      createdAt: new Date(Date.now() - 300000).toISOString()
    }
  ]
};

export const transportService = {
  // Overview
  async getOverview(schoolId = 'SCH-001') {
    try {
      const res = await apiRequest(`${API_ENDPOINTS.TRANSPORT.OVERVIEW}?schoolId=${schoolId}`);
      if (res && res.totalBuses !== undefined) return res;
      return MOCK_FALLBACK_OVERVIEW;
    } catch {
      return MOCK_FALLBACK_OVERVIEW;
    }
  },

  // Buses
  async getBuses(schoolId = 'SCH-001') {
    try {
      const res = await apiRequest(`${API_ENDPOINTS.TRANSPORT.BUSES}?schoolId=${schoolId}`);
      return Array.isArray(res) ? res : [];
    } catch {
      return [
        {
          id: 1,
          busNumber: 'Bus 01',
          registrationNumber: 'MH-02-AB-1001',
          capacity: 42,
          model: 'Starbus Ultra',
          manufacturer: 'Tata Motors',
          fuelType: 'CNG',
          gpsDeviceId: 'GPS-TT-1001',
          status: 'ACTIVE',
          assignedDriverName: 'Suresh Yadav',
          assignedRouteName: 'Route 2 - South Residential Belt'
        },
        {
          id: 2,
          busNumber: 'Bus 02',
          registrationNumber: 'MH-02-CD-2002',
          capacity: 38,
          model: 'Cruiser Deluxe',
          manufacturer: 'Force Motors',
          fuelType: 'DIESEL',
          gpsDeviceId: 'GPS-FC-2002',
          status: 'MAINTENANCE',
          assignedDriverName: 'Unassigned',
          assignedRouteName: 'Maintenance Bay'
        },
        {
          id: 3,
          busNumber: 'Bus 04',
          registrationNumber: 'MH-02-EF-4004',
          capacity: 45,
          model: 'Skyline Pro',
          manufacturer: 'Eicher',
          fuelType: 'DIESEL',
          gpsDeviceId: 'GPS-EC-4004',
          status: 'ACTIVE',
          currentSpeed: 34.0,
          assignedDriverName: 'Ramesh Kumar',
          assignedRouteName: 'Route 1 - North Campus Loop',
          activeTripStatus: 'IN_PROGRESS'
        }
      ];
    }
  },

  async createBus(busData, schoolId = 'SCH-001') {
    return apiRequest(`${API_ENDPOINTS.TRANSPORT.BUSES}?schoolId=${schoolId}`, {
      method: 'POST',
      body: JSON.stringify(busData)
    });
  },

  async updateBus(id, busData, schoolId = 'SCH-001') {
    return apiRequest(`${API_ENDPOINTS.TRANSPORT.BUS_BY_ID(id)}?schoolId=${schoolId}`, {
      method: 'PUT',
      body: JSON.stringify(busData)
    });
  },

  async deleteBus(id, schoolId = 'SCH-001') {
    return apiRequest(`${API_ENDPOINTS.TRANSPORT.BUS_BY_ID(id)}?schoolId=${schoolId}`, {
      method: 'DELETE'
    });
  },

  // Drivers
  async getDrivers(schoolId = 'SCH-001') {
    try {
      const res = await apiRequest(`${API_ENDPOINTS.TRANSPORT.DRIVERS}?schoolId=${schoolId}`);
      return Array.isArray(res) ? res : [];
    } catch {
      return [
        {
          id: 1,
          name: 'Ramesh Kumar',
          email: 'driver@school.com',
          phone: '+91 98765 43210',
          licenseNumber: 'DL-0420110056789',
          licenseExpiryDate: '2029-06-30',
          licenseCategory: 'COMMERCIAL_HEAVY',
          experienceYears: 8,
          verificationStatus: 'VERIFIED',
          status: 'ACTIVE',
          assignedBusNumber: 'Bus 04',
          assignedRouteName: 'Route 1 - North Campus Loop',
          dutyStatus: 'IN_TRIP',
          avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80'
        },
        {
          id: 2,
          name: 'Suresh Yadav',
          email: 'suresh.driver@school.com',
          phone: '+91 98123 45678',
          licenseNumber: 'DL-0420150012345',
          licenseExpiryDate: '2028-09-15',
          licenseCategory: 'COMMERCIAL_HEAVY',
          experienceYears: 6,
          verificationStatus: 'VERIFIED',
          status: 'ACTIVE',
          assignedBusNumber: 'Bus 01',
          assignedRouteName: 'Route 2 - South Residential Belt',
          dutyStatus: 'SCHEDULED',
          avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80'
        }
      ];
    }
  },

  async createDriver(driverData, schoolId = 'SCH-001') {
    return apiRequest(`${API_ENDPOINTS.TRANSPORT.DRIVERS}?schoolId=${schoolId}`, {
      method: 'POST',
      body: JSON.stringify(driverData)
    });
  },

  async updateDriver(id, driverData, schoolId = 'SCH-001') {
    return apiRequest(`${API_ENDPOINTS.TRANSPORT.DRIVER_BY_ID(id)}?schoolId=${schoolId}`, {
      method: 'PUT',
      body: JSON.stringify(driverData)
    });
  },

  async deleteDriver(id, schoolId = 'SCH-001') {
    return apiRequest(`${API_ENDPOINTS.TRANSPORT.DRIVER_BY_ID(id)}?schoolId=${schoolId}`, {
      method: 'DELETE'
    });
  },

  // Routes
  async getRoutes(schoolId = 'SCH-001') {
    try {
      const res = await apiRequest(`${API_ENDPOINTS.TRANSPORT.ROUTES}?schoolId=${schoolId}`);
      return Array.isArray(res) ? res : [];
    } catch {
      return [
        {
          id: 1,
          routeName: 'Route 1 - North Campus Loop',
          routeCode: 'RT-NORTH-01',
          description: 'Serves North City, City Center, Metro Station, and School North Gate',
          startLocation: 'North City Square',
          endLocation: 'School Main Gate',
          plannedDurationMinutes: 45,
          totalDistanceKm: 18.5,
          morningStartTime: '07:15 AM',
          eveningStartTime: '02:45 PM',
          speedLimitKmh: 45,
          status: 'ACTIVE',
          stopsCount: 5,
          assignedStudentsCount: 39,
          stops: [
            { id: 1, stopName: 'North City Square', stopOrder: 1, latitude: 25.6150, longitude: 85.1280, plannedMorningPickupTime: '07:15 AM', plannedEveningDropTime: '03:30 PM', geofenceRadiusMeters: 60, landmark: 'Opposite HDFC Bank', assignedStudentsCount: 8 },
            { id: 2, stopName: 'Metro Station Pillar 42', stopOrder: 2, latitude: 25.6100, longitude: 85.1350, plannedMorningPickupTime: '07:25 AM', plannedEveningDropTime: '03:20 PM', geofenceRadiusMeters: 50, landmark: 'Near Gate 2 Escalator', assignedStudentsCount: 12 },
            { id: 3, stopName: 'Central Mall Junction', stopOrder: 3, latitude: 25.6050, longitude: 85.1410, plannedMorningPickupTime: '07:35 AM', plannedEveningDropTime: '03:10 PM', geofenceRadiusMeters: 50, landmark: 'Bus Bay 3', assignedStudentsCount: 10 },
            { id: 4, stopName: 'Kankarbagh Park', stopOrder: 4, latitude: 25.6010, longitude: 85.1480, plannedMorningPickupTime: '07:45 AM', plannedEveningDropTime: '03:00 PM', geofenceRadiusMeters: 50, landmark: 'Roundabout Park Corner', assignedStudentsCount: 9 },
            { id: 5, stopName: 'School Main Gate (Arrival)', stopOrder: 5, latitude: 25.5970, longitude: 85.1550, plannedMorningPickupTime: '08:00 AM', plannedEveningDropTime: '02:45 PM', geofenceRadiusMeters: 70, landmark: 'Campus Bus Bay', assignedStudentsCount: 39 }
          ]
        },
        {
          id: 2,
          routeName: 'Route 2 - South Residential Belt',
          routeCode: 'RT-SOUTH-02',
          description: 'Covers Southern Apartments, Central Market, and Green Park',
          startLocation: 'Green Park Gate 1',
          endLocation: 'School Main Gate',
          plannedDurationMinutes: 50,
          totalDistanceKm: 22.0,
          morningStartTime: '07:05 AM',
          eveningStartTime: '02:40 PM',
          speedLimitKmh: 50,
          status: 'ACTIVE',
          stopsCount: 4,
          assignedStudentsCount: 28,
          stops: [
            { id: 6, stopName: 'Green Park Gate 1', stopOrder: 1, latitude: 25.5900, longitude: 85.1600, plannedMorningPickupTime: '07:05 AM', plannedEveningDropTime: '03:40 PM', geofenceRadiusMeters: 50, landmark: 'Security Booth', assignedStudentsCount: 10 },
            { id: 7, stopName: 'Southern Apartments', stopOrder: 2, latitude: 25.5930, longitude: 85.1650, plannedMorningPickupTime: '07:18 AM', plannedEveningDropTime: '03:25 PM', geofenceRadiusMeters: 50, landmark: 'Clubhouse Entrance', assignedStudentsCount: 12 },
            { id: 8, stopName: 'Central Market', stopOrder: 3, latitude: 25.5950, longitude: 85.1610, plannedMorningPickupTime: '07:30 AM', plannedEveningDropTime: '03:10 PM', geofenceRadiusMeters: 50, landmark: 'Market Clock Tower', assignedStudentsCount: 6 },
            { id: 9, stopName: 'School Main Gate (Arrival)', stopOrder: 4, latitude: 25.5970, longitude: 85.1550, plannedMorningPickupTime: '07:55 AM', plannedEveningDropTime: '02:45 PM', geofenceRadiusMeters: 70, landmark: 'Campus Bus Bay', assignedStudentsCount: 28 }
          ]
        }
      ];
    }
  },

  async createRoute(routeData, schoolId = 'SCH-001') {
    return apiRequest(`${API_ENDPOINTS.TRANSPORT.ROUTES}?schoolId=${schoolId}`, {
      method: 'POST',
      body: JSON.stringify(routeData)
    });
  },

  async updateRoute(id, routeData, schoolId = 'SCH-001') {
    return apiRequest(`${API_ENDPOINTS.TRANSPORT.ROUTE_BY_ID(id)}?schoolId=${schoolId}`, {
      method: 'PUT',
      body: JSON.stringify(routeData)
    });
  },

  async deleteRoute(id, schoolId = 'SCH-001') {
    return apiRequest(`${API_ENDPOINTS.TRANSPORT.ROUTE_BY_ID(id)}?schoolId=${schoolId}`, {
      method: 'DELETE'
    });
  },

  async saveRouteStops(routeId, stops, schoolId = 'SCH-001') {
    return apiRequest(`${API_ENDPOINTS.TRANSPORT.ROUTE_STOPS(routeId)}?schoolId=${schoolId}`, {
      method: 'POST',
      body: JSON.stringify(stops)
    });
  },

  // Assignments
  async getAssignments(schoolId = 'SCH-001') {
    try {
      const res = await apiRequest(`${API_ENDPOINTS.TRANSPORT.ASSIGNMENTS}?schoolId=${schoolId}`);
      return Array.isArray(res) ? res : [];
    } catch {
      return [
        {
          id: 1,
          driverId: 1,
          driverName: 'Ramesh Kumar',
          driverPhone: '+91 98765 43210',
          busId: 3,
          busNumber: 'Bus 04',
          registrationNumber: 'MH-02-EF-4004',
          routeId: 1,
          routeName: 'Route 1 - North Campus Loop',
          routeCode: 'RT-NORTH-01',
          shift: 'BOTH',
          effectiveStartDate: '2026-09-01',
          status: 'ACTIVE',
          notes: 'Regular driver assignment'
        },
        {
          id: 2,
          driverId: 2,
          driverName: 'Suresh Yadav',
          driverPhone: '+91 98123 45678',
          busId: 1,
          busNumber: 'Bus 01',
          registrationNumber: 'MH-02-AB-1001',
          routeId: 2,
          routeName: 'Route 2 - South Residential Belt',
          routeCode: 'RT-SOUTH-02',
          shift: 'BOTH',
          effectiveStartDate: '2026-09-01',
          status: 'ACTIVE',
          notes: 'Southern loop'
        }
      ];
    }
  },

  async createAssignment(data, schoolId = 'SCH-001') {
    return apiRequest(`${API_ENDPOINTS.TRANSPORT.ASSIGNMENTS}?schoolId=${schoolId}`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async deleteAssignment(id, schoolId = 'SCH-001') {
    return apiRequest(`${API_ENDPOINTS.TRANSPORT.ASSIGNMENT_BY_ID(id)}?schoolId=${schoolId}`, {
      method: 'DELETE'
    });
  },

  // Student assignments
  async getStudentAssignments(schoolId = 'SCH-001') {
    try {
      const res = await apiRequest(`${API_ENDPOINTS.TRANSPORT.STUDENT_ASSIGNMENTS}?schoolId=${schoolId}`);
      return Array.isArray(res) ? res : [];
    } catch {
      return [
        {
          id: 1,
          studentId: 1,
          studentName: 'Aarav Sharma',
          admissionNo: 'ADM-2024-001',
          className: 'Class 9-A',
          routeId: 1,
          routeName: 'Route 1 - North Campus Loop',
          pickupStopId: 2,
          pickupStopName: 'Metro Station Pillar 42',
          dropStopId: 2,
          dropStopName: 'Metro Station Pillar 42',
          pickupTime: '07:25 AM',
          dropTime: '03:20 PM',
          guardianPhone: '+91 98765 11111',
          status: 'ACTIVE',
          pickupStatus: 'PICKED_UP'
        },
        {
          id: 2,
          studentId: 2,
          studentName: 'Ananya Verma',
          admissionNo: 'ADM-2024-002',
          className: 'Class 7-B',
          routeId: 1,
          routeName: 'Route 1 - North Campus Loop',
          pickupStopId: 3,
          pickupStopName: 'Central Mall Junction',
          dropStopId: 3,
          dropStopName: 'Central Mall Junction',
          pickupTime: '07:35 AM',
          dropTime: '03:10 PM',
          guardianPhone: '+91 98765 22222',
          status: 'ACTIVE',
          pickupStatus: 'SCHEDULED'
        }
      ];
    }
  },

  async assignStudent(data, schoolId = 'SCH-001') {
    return apiRequest(`${API_ENDPOINTS.TRANSPORT.STUDENT_ASSIGNMENTS}?schoolId=${schoolId}`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async updateStudentAssignment(id, data, schoolId = 'SCH-001') {
    return apiRequest(`${API_ENDPOINTS.TRANSPORT.STUDENT_ASSIGNMENT_BY_ID(id)}?schoolId=${schoolId}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  async deleteStudentAssignment(id, schoolId = 'SCH-001') {
    return apiRequest(`${API_ENDPOINTS.TRANSPORT.STUDENT_ASSIGNMENT_BY_ID(id)}?schoolId=${schoolId}`, {
      method: 'DELETE'
    });
  },

  // Transport Fees
  async getFeeSummary(schoolId = 'SCH-001') {
    try {
      const res = await apiRequest(`${API_ENDPOINTS.TRANSPORT.FEES_SUMMARY}?schoolId=${schoolId}`);
      if (res && res.totalAssessed !== undefined) return res;
      return {
        totalAssessed: 3600,
        totalCollected: 1800,
        totalPending: 1800,
        totalOverdue: 0,
        paidCount: 1,
        pendingCount: 1,
        overdueCount: 0,
        studentRecords: [],
        recentPayments: []
      };
    } catch {
      return {
        totalAssessed: 3600,
        totalCollected: 1800,
        totalPending: 1800,
        totalOverdue: 0,
        paidCount: 1,
        pendingCount: 1,
        overdueCount: 0,
        studentRecords: [],
        recentPayments: []
      };
    }
  },

  async collectFee(paymentData, schoolId = 'SCH-001') {
    return apiRequest(`${API_ENDPOINTS.TRANSPORT.FEES_COLLECT}?schoolId=${schoolId}`, {
      method: 'POST',
      body: JSON.stringify(paymentData)
    });
  },

  // Live Tracking
  async getLiveTracking(schoolId = 'SCH-001') {
    try {
      const res = await apiRequest(`${API_ENDPOINTS.TRANSPORT.LIVE_TRACKING}?schoolId=${schoolId}`);
      if (Array.isArray(res) && res.length > 0) {
        return res;
      }
      return MOCK_FALLBACK_OVERVIEW.liveBuses;
    } catch {
      return MOCK_FALLBACK_OVERVIEW.liveBuses;
    }
  },

  // Historical Playback
  async getTripPlayback(tripId, schoolId = 'SCH-001') {
    try {
      return await apiRequest(`${API_ENDPOINTS.TRANSPORT.TRIP_PLAYBACK(tripId)}?schoolId=${schoolId}`);
    } catch {
      return {
        tripId,
        busNumber: 'Bus 04',
        driverName: 'Ramesh Kumar',
        routeName: 'Route 1 - North Campus Loop',
        tripDate: new Date().toISOString().split('T')[0],
        startTime: '07:15 AM',
        endTime: '08:00 AM',
        totalDistanceKm: 18.5,
        durationMinutes: 45,
        pathPoints: [
          { latitude: 25.6150, longitude: 85.1280, speedKmh: 0.0, heading: 0.0 },
          { latitude: 25.6135, longitude: 85.1305, speedKmh: 28.0, heading: 135.0 },
          { latitude: 25.6100, longitude: 85.1350, speedKmh: 0.0, heading: 140.0 },
          { latitude: 25.6075, longitude: 85.1380, speedKmh: 35.0, heading: 145.0 },
          { latitude: 25.6050, longitude: 85.1410, speedKmh: 15.0, heading: 150.0 },
          { latitude: 25.6025, longitude: 85.1430, speedKmh: 34.0, heading: 150.0 },
          { latitude: 25.6010, longitude: 85.1480, speedKmh: 30.0, heading: 155.0 },
          { latitude: 25.5970, longitude: 85.1550, speedKmh: 0.0, heading: 160.0 }
        ],
        plannedStops: [
          { stopName: 'North City Square', stopOrder: 1, plannedMorningPickupTime: '07:15 AM', latitude: 25.6150, longitude: 85.1280 },
          { stopName: 'Metro Station Pillar 42', stopOrder: 2, plannedMorningPickupTime: '07:25 AM', latitude: 25.6100, longitude: 85.1350 },
          { stopName: 'Central Mall Junction', stopOrder: 3, plannedMorningPickupTime: '07:35 AM', latitude: 25.6050, longitude: 85.1410 },
          { stopName: 'Kankarbagh Park', stopOrder: 4, plannedMorningPickupTime: '07:45 AM', latitude: 25.6010, longitude: 85.1480 },
          { stopName: 'School Main Gate', stopOrder: 5, plannedMorningPickupTime: '08:00 AM', latitude: 25.5970, longitude: 85.1550 }
        ],
        stopEvents: [
          { stopName: 'North City Square', stopOrder: 1, dwellDurationSeconds: 120, status: 'DEPARTED', studentsBoarded: 8 },
          { stopName: 'Metro Station Pillar 42', stopOrder: 2, dwellDurationSeconds: 130, status: 'DEPARTED', studentsBoarded: 12 },
          { stopName: 'Central Mall Junction', stopOrder: 3, dwellDurationSeconds: 95, status: 'DEPARTED', studentsBoarded: 10 }
        ],
        incidents: []
      };
    }
  },

  // Trip Reports
  async getTripReports(schoolId = 'SCH-001', date = null, busId = null, driverId = null) {
    try {
      let query = `?schoolId=${schoolId}`;
      if (date) query += `&date=${date}`;
      if (busId) query += `&busId=${busId}`;
      if (driverId) query += `&driverId=${driverId}`;
      const res = await apiRequest(`${API_ENDPOINTS.TRANSPORT.TRIP_REPORTS}${query}`);
      return Array.isArray(res) ? res : [];
    } catch {
      return [
        {
          tripId: 1,
          busNumber: 'Bus 04',
          registrationNumber: 'MH-02-EF-4004',
          driverName: 'Ramesh Kumar',
          routeName: 'Route 1 - North Campus Loop',
          routeCode: 'RT-NORTH-01',
          shift: 'MORNING',
          tripDate: new Date().toISOString().split('T')[0],
          status: 'IN_PROGRESS',
          actualStartTime: new Date(Date.now() - 1500000).toISOString(),
          totalDistanceKm: 7.8,
          currentSpeedKmh: 34.0,
          completedStopsCount: 2,
          totalStopsCount: 5,
          currentStopName: 'Central Mall Junction',
          nextStopName: 'Kankarbagh Park',
          nextStopEtaMinutes: 6,
          incidentCount: 0
        }
      ];
    }
  },

  // Alerts
  async getAlerts(schoolId = 'SCH-001', status = null) {
    try {
      let query = `?schoolId=${schoolId}`;
      if (status) query += `&status=${status}`;
      const res = await apiRequest(`${API_ENDPOINTS.TRANSPORT.ALERTS}${query}`);
      return Array.isArray(res) ? res : [];
    } catch {
      return MOCK_FALLBACK_OVERVIEW.recentAlerts;
    }
  },

  async acknowledgeAlert(alertId, remarks = '', schoolId = 'SCH-001') {
    return apiRequest(`${API_ENDPOINTS.TRANSPORT.ACK_ALERT(alertId)}?schoolId=${schoolId}`, {
      method: 'POST',
      body: JSON.stringify({ remarks })
    });
  },

  async resolveAlert(alertId, remarks = '', schoolId = 'SCH-001') {
    return apiRequest(`${API_ENDPOINTS.TRANSPORT.RESOLVE_ALERT(alertId)}?schoolId=${schoolId}`, {
      method: 'POST',
      body: JSON.stringify({ remarks })
    });
  }
};

export default transportService;
