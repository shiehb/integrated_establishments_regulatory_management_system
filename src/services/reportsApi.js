// src/services/reportsApi.js
import api from './api';

// Reports API functions
export const getReports = async (params = {}) => {
  const res = await api.get('reports/', { params });
  return res.data;
};

export const getReport = async (id) => {
  const res = await api.get(`reports/${id}/`);
  return res.data;
};

export const createReport = async (data) => {
  const res = await api.post('reports/', data);
  return res.data;
};

export const updateReport = async (id, data) => {
  const res = await api.put(`reports/${id}/`, data);
  return res.data;
};

export const deleteReport = async (id) => {
  const res = await api.delete(`reports/${id}/`);
  return res.data;
};

export const getCompletedInspections = async (params = {}) => {
  const res = await api.get('reports/completed-inspections/', { params });
  return res.data;
};

export const getReportStatistics = async () => {
  const res = await api.get('reports/statistics/');
  return res.data;
};

export const exportReportPDF = async (id) => {
  const res = await api.get(`reports/export/pdf/${id}/`, { 
    responseType: 'blob' 
  });
  return res.data;
};

export const exportInspectionsPDF = async (params) => {
  const res = await api.get('reports/export/inspections-pdf/', {
    params,
    responseType: 'blob'
  });
  return res.data;
};

export const saveGeneratedReport = async (reportData, pdfBlob) => {
  const formData = new FormData();
  formData.append('title', reportData.title);
  formData.append('quarter', reportData.quarter);
  formData.append('year', reportData.year);
  if (reportData.date_from) formData.append('date_from', reportData.date_from);
  if (reportData.date_to) formData.append('date_to', reportData.date_to);
  formData.append('pdf_file', pdfBlob, `report_q${reportData.quarter}_${reportData.year}.pdf`);
  
  const res = await api.post('reports/save/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return res.data;
};

// Helper function to get current quarter
export const getCurrentQuarter = () => {
  const now = new Date();
  const month = now.getMonth() + 1; // 1-12
  const year = now.getFullYear();
  
  if (month <= 3) return { quarter: 1, year, label: `Q1 ${year}` };
  if (month <= 6) return { quarter: 2, year, label: `Q2 ${year}` };
  if (month <= 9) return { quarter: 3, year, label: `Q3 ${year}` };
  return { quarter: 4, year, label: `Q4 ${year}` };
};

// Helper function to get quarter date range
export const getQuarterDates = (quarter, year) => {
  const quarters = {
    1: { start: `${year}-01-01T00:00:00`, end: `${year}-03-31T23:59:59` },
    2: { start: `${year}-04-01T00:00:00`, end: `${year}-06-30T23:59:59` },
    3: { start: `${year}-07-01T00:00:00`, end: `${year}-09-30T23:59:59` },
    4: { start: `${year}-10-01T00:00:00`, end: `${year}-12-31T23:59:59` }
  };
  return quarters[quarter];
};

// Helper function to generate report title
export const generateReportTitle = (quarter, year) => {
  return `Q${quarter} ${year} Accomplishment Report`;
};

// ===============================================
// Centralized Report Dashboard API functions
// ===============================================

export const getAllowedReports = async () => {
  const res = await api.get('reports/access/');
  return res.data;
};

export const generateCentralizedReport = async (data) => {
  const res = await api.post('reports/generate/', data);
  return res.data;
};

export const getFilterOptions = async (reportType) => {
  const res = await api.get('reports/filter-options/', {
    params: { report_type: reportType }
  });
  return res.data;
};
