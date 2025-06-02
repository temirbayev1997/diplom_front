import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL 
});

export const fetchAdminStats = () =>
  api.get("api/v1/analytics/admin-dashboard/stats/");

export const fetchAttendanceHeatmap = () =>
  api.get("api/v1/analytics/admin-dashboard/attendance-heatmap/");
