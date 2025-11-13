import axios from "axios";
import api from "../api/axiosConfig";

const API_URL ="/helados/cyInventory";

//obtener el inventario de cilindros
export const getCyInvent = async () => {
    try{
        const result = await api.get(API_URL);
        return result.data;
    }catch(error){
        console.log(error);
        throw error;
    }
}

//obtener solo los cilindors diferentes de vacios
export const getCyInventDisponiblesCondicional = async () => {
    try{
        const result = await api.get(API_URL+"/buy");
        return result.data;
    }catch(error){
        console.log(error);
        throw error;
    }
}

//crear o editar  un inventario de cilindro
export const saveInvent = async (cyInvent) => {
    try{
        const response = await api.post(API_URL,cyInvent);
        return response;
    }catch(error){
        console.log(error);
        throw error;
    }
};

//eliminar ciInvent
export const deleteCyInvent = async (id) => {
    try{
        await api.delete(`${API_URL}/${id}`);
    }catch(error){
        console.log(error);
        throw error;
    }
};

//reports
export const fetchCyInventReport = async (page = 0, size = 10) => {
    try{
        const response = await api.get('/api/reports/inventory/cylinders', {
      params: { page, size },
    });
        return response.data;
    }catch(error){
        console.error("Error al obtener el reporte de inventario de cilindros", error);
        throw error;
    }
};