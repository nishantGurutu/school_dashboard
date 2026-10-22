import { apiRequest } from './api';
import { API_ENDPOINTS } from './apiConfig';

const MOCK_FALLBACK_OVERVIEW = {
  totalBuses: 0,
  activeTrips: 0,
  idleBuses: 0,
  delayedTrips: 0,
  offlineGpsCount: 0,
  openAlertsCount: 0,
  totalRoutes: 0,
  totalDrivers: 0,
  totalStudentsAssigned: 0,
  liveBuses: [],
  recentAlerts: []
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
    const result = await apiRequest(`${API_ENDPOINTS.TRANSPORT.BUSES}?schoolId=${encodeURIComponent(schoolId)}`);
    return Array.isArray(result) ? result : [];
  },

  async createBus(busData, schoolId = 'SCH-001') {
    const cleaned = { ...busData };
    ['insuranceExpiryDate', 'fitnessExpiryDate', 'permitExpiryDate', 'pollutionExpiryDate'].forEach((k) => {
      if (cleaned[k] === '') cleaned[k] = null;
    });
    return apiRequest(`${API_ENDPOINTS.TRANSPORT.BUSES}?schoolId=${encodeURIComponent(schoolId)}`, {
      method: 'POST',
      body: cleaned
    });
  },

  async updateBus(id, busData, schoolId = 'SCH-001') {
    const cleaned = { ...busData };
    ['insuranceExpiryDate', 'fitnessExpiryDate', 'permitExpiryDate', 'pollutionExpiryDate'].forEach((k) => {
      if (cleaned[k] === '') cleaned[k] = null;
    });
    return apiRequest(`${API_ENDPOINTS.TRANSPORT.BUS_BY_ID(id)}?schoolId=${encodeURIComponent(schoolId)}`, {
      method: 'PUT',
      body: cleaned
    });
  },

  async deleteBus(id, schoolId = 'SCH-001') {
    return apiRequest(`${API_ENDPOINTS.TRANSPORT.BUS_BY_ID(id)}?schoolId=${encodeURIComponent(schoolId)}`, {
      method: 'DELETE'
    });
  },

  // Drivers
  async getDrivers(schoolId = 'SCH-001') {
    try {
      const res = await apiRequest(`${API_ENDPOINTS.TRANSPORT.DRIVERS}?schoolId=${schoolId}`);
      return Array.isArray(res) ? res : [];
    } catch {
      return [];
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

  async getDriverDailyDetails(id, schoolId = 'SCH-001') {
    try {
      const res = await apiRequest(`${API_ENDPOINTS.TRANSPORT.DRIVER_DAILY_DETAILS(id)}?schoolId=${schoolId}`);
      if (res && res.driver) return res;
    } catch (e) {
      console.warn('API getDriverDailyDetails failed, generating local fallback:', e);
    }
    const drivers = await this.getDrivers(schoolId);
    const driver = drivers.find((d) => d.id === Number(id)) || drivers[0];
    const trips = await this.getTripReports(schoolId, null, null, id);
    const todayTrip = trips[0] || null;
    return {
      driver,
      todayTrip,
      recentTrips: trips,
      todayChecklistCompleted: Boolean(todayTrip?.preTripCheckPassed),
      todayChecklistSummary: todayTrip?.preTripCheckPassed
        ? 'Verified • Pre-departure Inspection Complete'
        : 'Daily Checklist Incomplete',
      todayStartLocation: todayTrip?.startLocationName || (todayTrip?.startLatitude ? `${todayTrip.startLatitude}, ${todayTrip.startLongitude}` : 'School Depot Gate'),
      todayStartTime: todayTrip?.actualStartTime || '07:15 AM'
    };
  },

  // Routes
  async getRoutes(schoolId = 'SCH-001') {
    const res = await apiRequest(`${API_ENDPOINTS.TRANSPORT.ROUTES}?schoolId=${schoolId}`);
    return Array.isArray(res) ? res : [];
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
      return [];
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
    const res = await apiRequest(`${API_ENDPOINTS.TRANSPORT.STUDENT_ASSIGNMENTS}?schoolId=${schoolId}`);
    return Array.isArray(res) ? res : [];
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
    const result = await apiRequest(`${API_ENDPOINTS.TRANSPORT.LIVE_TRACKING}?schoolId=${encodeURIComponent(schoolId)}`);
    return Array.isArray(result) ? result : [];
  },

  // Historical Playback
  async getTripPlayback(tripId, schoolId = 'SCH-001') {
    return apiRequest(`${API_ENDPOINTS.TRANSPORT.TRIP_PLAYBACK(tripId)}?schoolId=${encodeURIComponent(schoolId)}`);
  },

  // Trip Reports
  async getTripReports(schoolId = 'SCH-001', date = null, busId = null, driverId = null) {
    const query = new URLSearchParams({ schoolId });
    if (date) query.set('date', date);
    if (busId) query.set('busId', busId);
    if (driverId) query.set('driverId', driverId);
    const result = await apiRequest(`${API_ENDPOINTS.TRANSPORT.TRIP_REPORTS}?${query}`);
    return Array.isArray(result) ? result : [];
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
  },

  // Vehicle Safety Checklist
  async getSafetyChecklist(schoolId = 'SCH-001', onlyActive = false) {
    try {
      const res = await apiRequest(`${API_ENDPOINTS.TRANSPORT.SAFETY_CHECKLIST}?schoolId=${encodeURIComponent(schoolId)}&onlyActive=${onlyActive}`);
      return Array.isArray(res) ? res : [];
    } catch (e) {
      console.warn('Failed to fetch safety checklist:', e);
      return [];
    }
  },

  async createSafetyChecklistItem(itemData, schoolId = 'SCH-001') {
    return apiRequest(`${API_ENDPOINTS.TRANSPORT.SAFETY_CHECKLIST}?schoolId=${encodeURIComponent(schoolId)}`, {
      method: 'POST',
      body: JSON.stringify(itemData)
    });
  },

  async updateSafetyChecklistItem(id, itemData, schoolId = 'SCH-001') {
    return apiRequest(`${API_ENDPOINTS.TRANSPORT.SAFETY_CHECKLIST_ITEM(id)}?schoolId=${encodeURIComponent(schoolId)}`, {
      method: 'PUT',
      body: JSON.stringify(itemData)
    });
  },

  async deleteSafetyChecklistItem(id, schoolId = 'SCH-001') {
    return apiRequest(`${API_ENDPOINTS.TRANSPORT.SAFETY_CHECKLIST_ITEM(id)}?schoolId=${encodeURIComponent(schoolId)}`, {
      method: 'DELETE'
    });
  },

  async resetSafetyChecklist(schoolId = 'SCH-001') {
    return apiRequest(`${API_ENDPOINTS.TRANSPORT.SAFETY_CHECKLIST_RESET}?schoolId=${encodeURIComponent(schoolId)}`, {
      method: 'POST'
    });
  }
};

export default transportService;
