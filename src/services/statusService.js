import axios from "axios";

const API_URL = "http://localhost:8080/status/all"

export const getStatus = async () => {
    try {
        const response = await axios.get(API_URL);
        return response.data; 
    } catch (error) {
        console.error("Error al obtener status", error);
        throw error;
    }
};