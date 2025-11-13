import axios from "axios";
import api from "../api/axiosConfig";

const API_URL = "/helados/sale"


export const saveSales = async (sale, userId, branchId) => {
    try{
        const response = await api.post(API_URL, sale, {
            params: {
                userId: userId,
                branchId: branchId
            }
        });
        return response.data;
    }catch(error){
        console.log(error);
        throw error;
    }
};


//reports
// ✅ Obtener ventas paginadas
export const fetchSalesReport = async (startDate, endDate, page = 0, size = 10) => {
  try {
    const response = await api.get("/api/reports/sales", {
      params: { startDate, endDate, page, size },
    });
    return response.data;
  } catch (error) {
    console.error("❌ Error al obtener el reporte de ventas:", error);
    throw error;
  }
};

// ✅ Obtener total del periodo
export const fetchSalesTotal = async (startDate, endDate) => {
  try {
    const response = await api.get("/api/reports/sales/total", {
      params: {
        startDate: `${startDate}T00:00:00`,
        endDate: `${endDate}T23:59:59`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("❌ Error al obtener el total de ventas:", error);
    throw error;
  }
};

// ✅ Obtener todas las páginas (para exportar PDF o Excel)
export const fetchAllSalesPages = async (startDate, endDate, totalPages, size = 10) => {
  try {
    const requests = Array.from({ length: totalPages }, (_, page) =>
      fetchSalesReport(startDate, endDate, page, size)
    );
    const responses = await Promise.all(requests);
    return responses;
  } catch (error) {
    console.error("❌ Error al obtener todas las páginas de ventas:", error);
    throw error;
  }
};