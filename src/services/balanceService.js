// src/services/balanceReportService.js
import api from "../api/axiosConfig";

// ✅ Obtener el reporte de balance filtrado por fechas
export const getBalanceReport = async (startDate, endDate) => {
  try {
    const response = await api.get("/api/reports/balance", {
      params: { startDate, endDate },
    });
    return response.data;
  } catch (error) {
    console.error("❌ Error al obtener el reporte de balance:", error);
    throw error;
  }
};
