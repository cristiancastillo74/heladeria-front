import axios from "axios";
import api from "../api/axiosConfig";

const API_URL = "/status/all"

export const getStatus = async () => {
    try {
        const response = await api.get(API_URL);
        return response.data; 
    } catch (error) {
        console.error("Error al obtener status", error);
        throw error;
    }
};