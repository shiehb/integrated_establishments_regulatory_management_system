// Inspection API Service
const API_BASE_URL = 'http://127.0.0.1:8000/api';

class InspectionApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Helper method to get headers
  getHeaders() {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('access_token')}`
    };
  }

  // Helper method to handle API responses
  async handleResponse(response) {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  }

  // Get inspections with optional filtering
  async getInspections(params = {}) {
    const queryParams = new URLSearchParams();
    
    // Add pagination
    if (params.page) queryParams.append('page', params.page);
    if (params.page_size) queryParams.append('page_size', params.page_size);
    
    // Add filtering
    if (params.tab) queryParams.append('tab', params.tab);
    if (params.search) queryParams.append('search', params.search);
    if (params.status) queryParams.append('status', params.status);
    if (params.section) queryParams.append('section', params.section);
    if (params.establishment) queryParams.append('establishment', params.establishment);
    if (params.personnel) queryParams.append('personnel', params.personnel);
    if (params.date_from) queryParams.append('date_from', params.date_from);
    if (params.date_to) queryParams.append('date_to', params.date_to);
    
    // Add ordering
    if (params.ordering) queryParams.append('ordering', params.ordering);

    const url = `${this.baseURL}/inspections/?${queryParams}`;
    const response = await fetch(url, {
      headers: this.getHeaders()
    });

    return this.handleResponse(response);
  }

  // Get a single inspection by ID
  async getInspection(id) {
    const response = await fetch(`${this.baseURL}/inspections/${id}/`, {
      headers: this.getHeaders()
    });

    return this.handleResponse(response);
  }

  // Create a new inspection
  async createInspection(inspectionData) {
    const response = await fetch(`${this.baseURL}/inspections/`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(inspectionData)
    });

    return this.handleResponse(response);
  }

  // Update an inspection
  async updateInspection(id, updateData) {
    const response = await fetch(`${this.baseURL}/inspections/${id}/`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify(updateData)
    });

    return this.handleResponse(response);
  }

  // Delete an inspection
  async deleteInspection(id) {
    const response = await fetch(`${this.baseURL}/inspections/${id}/`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return true;
  }

  // Make a workflow decision
  async makeWorkflowDecision(inspectionId, decisionData) {
    const response = await fetch(`${this.baseURL}/inspections/${inspectionId}/make_decision/`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(decisionData)
    });

    return this.handleResponse(response);
  }

  // Get tab counts for dashboard
  async getTabCounts() {
    const response = await fetch(`${this.baseURL}/inspections/tab_counts/`, {
      headers: this.getHeaders()
    });

    return this.handleResponse(response);
  }

  // Get workflow history for an inspection
  async getWorkflowHistory(inspectionId) {
    const response = await fetch(`${this.baseURL}/inspections/${inspectionId}/workflow_history/`, {
      headers: this.getHeaders()
    });

    return this.handleResponse(response);
  }

  // Get available actions for an inspection
  async getAvailableActions(inspectionId) {
    const response = await fetch(`${this.baseURL}/inspections/${inspectionId}/available_actions/`, {
      headers: this.getHeaders()
    });

    return this.handleResponse(response);
  }

  // Forward inspection to another section
  async forwardToAnotherSection(inspectionId, forwardData) {
    const response = await fetch(`${this.baseURL}/inspections/${inspectionId}/forward_to_another_section/`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(forwardData)
    });

    return this.handleResponse(response);
  }

  // Get establishments
  async getEstablishments(params = {}) {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page);
    if (params.page_size) queryParams.append('page_size', params.page_size);
    if (params.search) queryParams.append('search', params.search);
    if (params.district) queryParams.append('district', params.district);
    if (params.city) queryParams.append('city', params.city);
    if (params.province) queryParams.append('province', params.province);

    const url = `${this.baseURL}/establishments/?${queryParams}`;
    const response = await fetch(url, {
      headers: this.getHeaders()
    });

    return this.handleResponse(response);
  }

  // Get users/personnel
  async getUsers(params = {}) {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page);
    if (params.page_size) queryParams.append('page_size', params.page_size);
    if (params.userlevel) queryParams.append('userlevel', params.userlevel);
    if (params.section) queryParams.append('section', params.section);
    if (params.district) queryParams.append('district', params.district);
    if (params.is_active) queryParams.append('is_active', params.is_active);
    if (params.search) queryParams.append('search', params.search);

    const url = `${this.baseURL}/users/?${queryParams}`;
    const response = await fetch(url, {
      headers: this.getHeaders()
    });

    return this.handleResponse(response);
  }

  // Get laws/sections
  async getLaws(params = {}) {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page);
    if (params.page_size) queryParams.append('page_size', params.page_size);
    if (params.search) queryParams.append('search', params.search);
    if (params.category) queryParams.append('category', params.category);

    const url = `${this.baseURL}/laws/?${queryParams}`;
    const response = await fetch(url, {
      headers: this.getHeaders()
    });

    return this.handleResponse(response);
  }

  // Search inspections
  async searchInspections(query, page = 1, pageSize = 10) {
    return this.getInspections({
      search: query,
      page,
      page_size: pageSize
    });
  }

  // Get inspection statistics
  async getInspectionStats(params = {}) {
    const queryParams = new URLSearchParams();
    
    if (params.date_from) queryParams.append('date_from', params.date_from);
    if (params.date_to) queryParams.append('date_to', params.date_to);
    if (params.district) queryParams.append('district', params.district);
    if (params.section) queryParams.append('section', params.section);

    const url = `${this.baseURL}/inspections/stats/?${queryParams}`;
    const response = await fetch(url, {
      headers: this.getHeaders()
    });

    return this.handleResponse(response);
  }

  // Export inspections
  async exportInspections(format = 'excel', params = {}) {
    const queryParams = new URLSearchParams();
    
    // Add all filter parameters
    Object.keys(params).forEach(key => {
      if (params[key]) {
        queryParams.append(key, params[key]);
      }
    });
    
    queryParams.append('format', format);

    const url = `${this.baseURL}/inspections/export/?${queryParams}`;
    const response = await fetch(url, {
      headers: this.getHeaders()
    });

    if (!response.ok) {
      throw new Error(`Export failed: ${response.statusText}`);
    }

    // Handle file download
    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `inspections_${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'xlsx' : 'csv'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);

    return true;
  }

  // Get dashboard data
  async getDashboardData() {
    const [tabCounts, stats] = await Promise.all([
      this.getTabCounts(),
      this.getInspectionStats()
    ]);

    return {
      tab_counts: tabCounts.tab_counts,
      stats: stats
    };
  }

  // Bulk actions
  async bulkAction(action, inspectionIds, actionData = {}) {
    const response = await fetch(`${this.baseURL}/inspections/bulk_action/`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        action,
        inspection_ids: inspectionIds,
        ...actionData
      })
    });

    return this.handleResponse(response);
  }

  // Get notifications
  async getNotifications(params = {}) {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page);
    if (params.page_size) queryParams.append('page_size', params.page_size);
    if (params.unread_only) queryParams.append('unread_only', params.unread_only);

    const url = `${this.baseURL}/notifications/?${queryParams}`;
    const response = await fetch(url, {
      headers: this.getHeaders()
    });

    return this.handleResponse(response);
  }

  // Mark notification as read
  async markNotificationRead(notificationId) {
    const response = await fetch(`${this.baseURL}/notifications/${notificationId}/mark_read/`, {
      method: 'POST',
      headers: this.getHeaders()
    });

    return this.handleResponse(response);
  }
}

// Create and export a singleton instance
const inspectionApi = new InspectionApiService();
export default inspectionApi;

// Also export individual methods for convenience
export const {
  getInspections,
  getInspection,
  createInspection,
  updateInspection,
  deleteInspection,
  makeWorkflowDecision,
  getTabCounts,
  getWorkflowHistory,
  getAvailableActions,
  forwardToAnotherSection,
  getEstablishments,
  getUsers,
  getLaws,
  searchInspections,
  getInspectionStats,
  exportInspections,
  getDashboardData,
  bulkAction,
  getNotifications,
  markNotificationRead
} = inspectionApi;
